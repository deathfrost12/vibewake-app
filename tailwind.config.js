/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/lib/**/*.{js,jsx,ts,tsx}',
    './src/utils/**/*.{js,jsx,ts,tsx}',
    './src/services/**/*.{js,jsx,ts,tsx}',
    './App.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        neon: {
          mint: '#75FFB0',
          aqua: '#66F0FF',
          primary: '#5CFFF0',
          lime: '#9BFF93',
        },
        bg: {
          primary: '#000000',
          secondary: '#001010',
          surface: '#0D1A1A',
          elevated: '#1A2626',
          clickable: '#0D1A1A',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A8B4B6',
          muted: '#6B7280',
          accent: '#66F0FF',
        },
        interactive: {
          DEFAULT: '#1A2626',
          hover: '#2D3F3F',
          active: '#3F5252',
          accent: '#5CFFF0',
          secondary: '#75FFB0',
          tertiary: '#66F0FF',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          subtle: 'rgba(255,255,255,0.05)',
          visible: 'rgba(255,255,255,0.1)',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #5CFFF0 0%, #9BFF93 100%)',
        'gradient-mint': 'linear-gradient(135deg, #75FFB0 0%, #5CFFF0 100%)',
        'gradient-cta': 'linear-gradient(135deg, #5CFFF0 0%, #9BFF93 100%)',
      },
    },
  },
  plugins: [],
};