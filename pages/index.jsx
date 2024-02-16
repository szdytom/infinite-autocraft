import { createRoot } from 'react-dom/client';
import { App } from './App';
import { initailize } from './db';

const container = document.getElementById('app');

container.innerHTML = 'Please wait a few seconds while we are extracting data...';
await initailize();

const root = createRoot(container);
root.render(<App />);

async function unregisterServiceWorker() {
	if ('serviceWorker' in navigator) {
		await navigator.serviceWorker.unregister();
	}
};

if (process.env.NODE_ENV === 'production') {
	unregisterServiceWorker();
}
