// @ts-check
import marked from 'marked';
import * as shiki from 'shiki';
import { extname } from 'path';

// Logging stuff
import log from 'consola';

import {
	readFile,
	readdir,
	remove,
	outputFile,
	copy,
	pathExists,
} from 'fs-extra';

import {
	stylesTransformer,
	scriptsTransformer,
	markupsTransformer,
} from './transformers';
import {
	currentDir,
	postsDir,
	njkRenderer,
	pagesDir,
	loader,
	distDir,
} from './global';

import {
	resolveLayout,
	resolvePost,
	resolveDist,
	resolvePage,
	readdirRecursive,
	extractStats,
	resolveConfig,
} from './utils';
import { swGenerator } from './generators';
import { processConfig, processMarkdown } from './processors';

/*****************
 * CORE OF THE CLI
 *****************/

async function generatePosts() {
	// Get all the blog posts
	const postsPath = await readdir(postsDir);

	// Get the layout for the blog posts
	const blogLayout = resolveLayout('post.html');
	const layout = await readFile(blogLayout, { encoding: 'utf-8' });

	// If no blog posts, bail early
	if (!postsPath || !postsPath.length) return;

	const posts = [];

	for (const postPath of postsPath) {
		// Filter .gitkeep
		if (postPath.startsWith('.')) continue;

		const url = `/blog/${postPath.replace(/.md/i, '')}`;

		const postFile = resolvePost(postPath);

		const [content, data] = await processMarkdown(postFile);
		const [createdAt, updatedAt] = await extractStats(postFile);

		// Compile the template
		const metadata = {
			...data,
			createdAt,
			updatedAt,
			content,
			url,
		};

		const compiled = njkRenderer.renderString(layout, metadata);

		// Write the file to the dist
		await outputFile(
			resolveDist(url, 'index.html'),
			markupsTransformer(compiled),
			{ encoding: 'utf-8' },
		);

		posts.push(metadata);
	}

	return posts;
}

async function generateRoutes(posts) {
	// Get all the blog posts
	const pages = [];
	const pagesPath = await readdir(pagesDir);

	// If no blog posts, bail early
	if (!pagesPath || !pagesPath.length) return;

	for (const pagePath of pagesPath) {
		// Filter .gitkeep
		if (pagePath.startsWith('.')) continue;
		const pageFile = resolvePage(pagePath);

		// Get the layout for the blog posts
		const content = await readFile(pageFile, { encoding: 'utf-8' });
		const url = `/${pagePath.replace(/(index)?.html/i, '')}`;

		const metadata = {
			posts,
		};

		const compiled = njkRenderer.renderString(content, metadata);

		await outputFile(
			resolveDist(url, 'index.html'),
			markupsTransformer(compiled),
			{
				encoding: 'utf-8',
			},
		);

		pages.push(content);
	}

	return pages;
}

async function processAndCopyAssets() {
	const files = readdirRecursive('assets').filter(
		f => !f.includes('.gitkeep'),
	);

	for (const filePath of files) {
		loader.clear();
		log.info(`Processing ${filePath}`);

		const extension = extname(filePath);
		const file = await readFile(filePath, { encoding: 'utf-8' });
		let content = '';

		switch (extension) {
			case '.css':
				content = await stylesTransformer(file);
				break;
			case '.js':
				content = await scriptsTransformer(file);
				break;
			default:
				loader.clear();
				log.info(`No transformer for file type ${extension}`);
				copy(filePath, resolveDist(filePath));
				continue;
		}

		outputFile(resolveDist(filePath), content);
	}
}

async function main() {
	log.info(currentDir);
	log.info('Starting the whole thing');

	loader.start('Cleaning up the dist folder if it exists...');
	// Rewrite the dist folder on each compilation
	if (await pathExists(distDir)) await remove(distDir);
	loader.succeed();

	loader.start('Resolving & processing the configuration...');
	const config = await resolveConfig();
	await processConfig(config);
	loader.succeed();

	loader.start('Setting up the required config for the templates...');
	// Setup some highlight stuff for the markdown
	const hl = await shiki.getHighlighter({
		theme: 'nord',
	});

	marked.setOptions({
		highlight(code, lang) {
			// @ts-ignore
			return hl.codeToHtml(code, lang);
		},
	});
	loader.succeed();

	loader.start('Processing the blog posts...');
	// Process the posts folder
	const posts = await generatePosts();
	loader.succeed(`${posts.length} posts processed successfully`);

	loader.start('Processing the pages...');
	// Process the pages folder
	const pages = await generateRoutes(posts);
	loader.succeed(`${pages.length} pages processed successfully`);

	loader.start('Processing the assets...');
	// Process and mirror the assets directory to the dist folder
	await processAndCopyAssets();
	loader.succeed('All assets processed successfully');

	loader.start('Generating service worker...');
	await swGenerator();
	loader.succeed('Service worker generated successfully');

	log.success(`Build successful!`);
}

// Start the small compiler
main().catch(err => console.log(err));
