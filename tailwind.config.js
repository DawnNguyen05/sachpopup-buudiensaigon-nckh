/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper: '#FFF7EA', ink: '#3A3157', sky: '#BFE4F6', peach: '#FFCBA9',
        mint: '#BFEBCB', lemon: '#FFE58F', rose: '#FFB5C8', grape: '#8E7CC3',
      },
      boxShadow: { chunky: '0 6px 0 0 rgba(58,49,87,.9)', chunkySm: '0 4px 0 0 rgba(58,49,87,.9)' },
    },
  },
  plugins: [],
}
