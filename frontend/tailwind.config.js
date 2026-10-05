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
          cyan: '#1DCED8',
          cyanDark: '#17B2BA',
          cyanLight: '#E8FAFB',
          cream: '#FFF9D8',
          creamDark: '#F5EAB0',
          orange: '#FF9D50',
          orangeDark: '#E6853A',
          orangeLight: '#FFF4EB',
          green: '#55E07E',
          greenDark: '#43C268',
          greenLight: '#EBFBF1',
        },
        neutral: {
          dark: '#1F2937',
          secondary: '#6B7280',
          light: '#F8FAFC',
          border: '#E5E7EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 2px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        hover: '0 8px 16px -2px rgba(29, 206, 216, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        btn: '8px',
        card: '12px',
        dialog: '14px',
      }
    },
  },
  plugins: [],
}
