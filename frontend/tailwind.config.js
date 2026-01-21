/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#00f2ff',
                secondary: '#7000ff',
                dark: '#0a0a0c',
                'glass-border': 'rgba(255, 255, 255, 0.1)',
                'text-dim': '#909090',
            }
        },
    },
    plugins: [],
}
