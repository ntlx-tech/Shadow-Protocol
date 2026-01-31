/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        noir: ['"Playfair Display"', 'serif'],
        cinzel: ['"Cinzel"', 'serif'],
        typewriter: ['"Special Elite"', 'monospace'],
      },
      colors: {
        blood: '#8a0303',
        paper: '#f5f0e1',
        charcoal: '#1a1a1a', // Slightly lighter than previous
        zinc: {
          850: '#1f1f22',
          900: '#18181b',
          950: '#09090b',
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker': 'flicker 3s infinite',
        'fadeIn': 'fadeIn 0.8s ease-out forwards',
      },
      keyframes: {
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': { opacity: '0.99' },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': { opacity: '0.4' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    }
  },
  plugins: [],
}