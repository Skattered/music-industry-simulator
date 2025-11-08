/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				'game-bg': '#0a0a0a',
				'game-panel': '#1a1a1a',
				'game-accent': '#3b82f6'
			}
		}
	},
	plugins: []
};
