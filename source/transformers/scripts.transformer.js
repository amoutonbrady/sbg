// JS processing
import terser from 'terser';

export function scriptsTransformer(js) {
	return new Promise(res => void res(terser.minify(js).code));
}
