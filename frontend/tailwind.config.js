// tailwind.config.js
module.exports = {
	content: [
	  "./src/pages/**/*.{js,ts,jsx,tsx}",
	  "./src/components/**/*.{js,ts,jsx,tsx}"
	],
	theme: {
	  extend: {
		colors: {
		  indigo: {
			50: '#eef2ff',
			100: '#e0e7ff',
			200: '#c7d2fe',
			300: '#a5b4fc',
			400: '#818cf8',
			500: '#6366f1',
			600: '#5a45f8', // Primary VFied color
			700: '#4f46e5',
			800: '#4338ca',
			900: '#3730a3',
		  },
		},
	  },
	},
	plugins: [],
  };