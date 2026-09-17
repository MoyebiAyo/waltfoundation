/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './assets/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#15211d', 800: '#1d302a', 700: '#2a443b', 600: '#3a5a4e'
        },
        forest: {
          50: '#eef6f2', 100: '#d7eae0', 200: '#aed4c1',
          300: '#7bb69c', 400: '#4f9577', 500: '#2f7a5c',
          600: '#1f6249', 700: '#194f3b', 800: '#143f30', 900: '#0f3026'
        },
        amber: {
          50: '#fdf6ec', 100: '#f9e8cc', 200: '#f2cf95',
          300: '#e9b25e', 400: '#e0993d', 500: '#cf8230',
          600: '#b06622', 700: '#8c4d1d', 800: '#6b3a18', 900: '#4f2c13'
        },
        cream: { 50: '#fdfbf7', 100: '#faf5ec', 200: '#f3ead8' }
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Hanken Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      fontWeight: {
        500: '500',
        600: '600'
      },
      maxWidth: { '8xl': '88rem', prose: '68ch' },
      boxShadow: {
        soft: '0 1px 2px rgba(15,48,38,0.06), 0 12px 30px -12px rgba(15,48,38,0.18)',
        card: '0 2px 4px rgba(15,48,38,0.05), 0 24px 48px -24px rgba(15,48,38,0.22)'
      },
      borderRadius: { '4xl': '2rem', '5xl': '2.5rem' },
      keyframes: {
        fadeup: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: { fadeup: 'fadeup .7s cubic-bezier(.22,.61,.36,1) both' }
    }
  },
  plugins: []
};
