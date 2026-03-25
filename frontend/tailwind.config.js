/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        isabella: {
          bg: '#0A1628',
          'bg-mid': '#2D1B4E',
          rose: '#E8610A',
          violet: '#7C3AED',
          glass: 'rgba(255,255,255,0.05)',
        }
      },
      backdropBlur: { glass: '12px' },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-dot': 'bounceDot 1.2s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        bounceDot: { '0%,80%,100%': { transform: 'scale(0.8)', opacity: '0.5' }, '40%': { transform: 'scale(1.2)', opacity: '1' } },
      }
    }
  },
  plugins: []
}
