/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				primary: {
					light: "#1a1a2e",
					dark: "#eebefa",
				},
				background: {
					light: "#ffffff",
					dark: "#0a0a0a",
				},
				text: {
					light: "#11181C",
					dark: "#ECEDEE",
				},
				icon: {
					light: "#687076",
					dark: "#9BA1A6",
				},
				tabIconDefault: {
					light: "#687076",
					dark: "#9BA1A6",
				},
				tabIconSelected: {
					light: "#1a1a2e",
					dark: "#eebefa",
				},
			},
		},
	},
	plugins: [],
};
