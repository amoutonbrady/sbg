import { njkRenderer } from '../global';

export async function processConfig(config) {
	if (!config) return;

	for (const [name, filterHandler] of Object.entries(config.filters)) {
		njkRenderer.addFilter(name, filterHandler);
	}

	return njkRenderer;
}
