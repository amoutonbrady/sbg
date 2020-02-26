// @ts-check
import workbox from 'workbox-build';

// https://developers.google.com/web/tools/workbox/guides/generate-service-worker/workbox-build
export async function swGenerator() {
	// This will return a Promise
	return workbox.generateSW({
		globDirectory: 'dist',
		globPatterns: ['**/*.{html,json,webmanifest,js,css}'],
		swDest: 'dist/sw.js',
		mode: 'production',
		// Define runtime caching rules.
		runtimeCaching: [
			{
				// Match any request that ends with .png, .jpg, .jpeg or .svg.
				urlPattern: /\.(?:png|jpg|jpeg|svg)$/,

				// Apply a cache-first strategy.
				handler: 'CacheFirst',

				options: {
					// Use a custom cache name.
					cacheName: 'images',

					// Only cache 10 images.
					expiration: {
						maxEntries: 10,
					},
				},
			},
		],
	});
}
