// @ts-check

import ora from 'ora';
import njk from 'nunjucks';
import { resolve } from 'path';

const lookUpFolders = ['posts', 'pages', 'dist', 'layouts', 'assets'];

// Global env
export const currentDir = process.cwd();
export const njkRenderer = njk.configure(['layouts']);
export const loader = ora();

// Bunch of utils
export const [postsDir, pagesDir, distDir, layoutDir] = lookUpFolders.map(dir =>
	resolve(currentDir, dir),
);
