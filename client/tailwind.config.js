/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    dark: '#0f172a',
                    neon: '#06b6d4',
                    glow: 'rgba(6, 182, 212, 0.4)'
                }
            }
        },
    },
    plugins: [],
}
