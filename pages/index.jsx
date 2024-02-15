import { createRoot } from 'react-dom/client';
import { App } from './App';

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);

async function registerServiceWorker() {
	if ('serviceWorker' in navigator) {
		try {
			const registration = await navigator.serviceWorker.register(
				new URL('./sw.js', import.meta.url),
				{ scope: './' },
			);
			if (registration.installing) {
				console.log('SW installing...');
			} else if (registration.waiting) {
				console.log('SW installed.');
			} else if (registration.active) {
				console.log('SW Activated.');
			}
		} catch (error) {
			console.error(`SW Failed: ${error}`);
		}
	}
};

if (process.env.NODE_ENV === 'production') {
	registerServiceWorker();
}
