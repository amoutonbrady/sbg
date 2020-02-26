// @ts-check
import { statSync, readdirSync, stat, pathExists } from 'fs-extra';

import { join, resolve } from 'path';
import { postsDir, pagesDir, layoutDir, distDir, currentDir } from './global';

/* Prepend the given path segment */
const prependPathSegment = pathSegment => location =>
	join(pathSegment, location);

/* fs.readdir but with relative paths */
const readdirPreserveRelativePath = location =>
	readdirSync(location).map(prependPathSegment(location));

/* Recursive fs.readdir but with relative paths */
export const readdirRecursive = location =>
	readdirPreserveRelativePath(location).reduce(
		(result, currentValue) =>
			statSync(currentValue).isDirectory()
				? result.concat(readdirRecursive(currentValue))
				: result.concat(currentValue),
		[],
	);

export const resolvePost = post => resolve(postsDir, post);
export const resolvePage = page => resolve(pagesDir, page);
export const resolveDist = (...paths) =>
	resolve(distDir, ...paths.map(path => path.replace(/^\//, '')));
export const resolveLayout = layout => resolve(layoutDir, layout);

export async function extractStats(path) {
	const { birthtime, mtime } = await stat(path);

	return [birthtime, mtime].map(d => new Date(d));
}

export async function resolveConfig(configName = 'config.js') {
	const configPath = resolve(currentDir, configName);
	const confExists = await pathExists(configPath);
	if (!confExists) return;

	return (await import(configPath)).default;
}
