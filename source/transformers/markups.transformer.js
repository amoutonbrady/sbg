import { minify } from 'html-minifier';

export function markupsTransformer(template) {
	// Minify the html & inject the small CSS
	return minify(template, {
		removeComments: true,
		collapseWhitespace: true,
		removeOptionalTags: true,
		removeRedundantAttributes: true,
		removeScriptTypeAttributes: true,
		removeTagWhitespace: true,
		useShortDoctype: true,
		minifyCSS: true,
		minifyJS: true,
	});
}
