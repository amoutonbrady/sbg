// @ts-check
import marked from 'marked';
import matter from 'gray-matter';
import { readFile } from 'fs-extra';

/**
 *
 * @param {string} path
 * @returns {Promise<[string, { [key: string]: any }]>}
 */
export async function processMarkdown(path) {
	// Get the file content
	const text = await readFile(path, { encoding: 'utf-8' });

	// Parse the front matter & then the markdown
	const { content, data } = matter(text);
	const parsed = marked.parse(content);

	return [parsed, data];
}
