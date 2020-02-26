// CSS processing
import postcss from 'postcss';
import cssnano from 'cssnano';
import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import purgeCSS from '@fullhuman/postcss-purgecss';

export async function stylesTransformer(css) {
	const result = await postcss([
		tailwind(),
		autoprefixer(),
		cssnano({ preset: 'default' }),
		purgeCSS({
			content: ['./dist/**/*.html'],
			defaultExtractor: content =>
				content.match(/[A-Za-z0-9-_:/]+/g) || [],
		}),
	]).process(css, { map: false, from: null });

	return result.css;
}
