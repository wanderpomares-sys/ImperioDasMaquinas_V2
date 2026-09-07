/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark Industrial — paleta oficial do Império das Máquinas.
        // Nomes fixos: não renomear sem atualizar todos os componentes que os referenciam.
        background: '#0F1115',
        card: '#1E232C',
        primary: '#FFC400',
        success: '#22C55E',
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
};
