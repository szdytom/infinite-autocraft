import { createRoot } from 'react-dom/client';
import { App } from './App';
import { initialize } from './db';

async function main() {
	const container = document.getElementById('app');
	
	container.innerHTML = '<main>Please wait a few seconds while we are downloading data...</main>';
	try {
		await initialize();
	} catch(e) {
		container.innerHTML = '<main>Failed to download data, please check your internet connection and reload the page.</main>';
		throw e;
	}

	const root = createRoot(container);
	root.render(<App />);
}

async function unregisterServiceWorker() {
	if ('serviceWorker' in navigator) {
		try {
			let res = await navigator.serviceWorker.getRegistration();
			if (res != null) {
				res.unregister();
			}
		} catch(e) {
			//...
		}
	}
};

main();
unregisterServiceWorker();
