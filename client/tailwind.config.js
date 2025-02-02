module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        shimmer: "linear-gradient(90deg, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.2) 75%)",
      },
      backgroundSize: {
        shimmer: "200% auto",
      },
      textStrokeWidth: {
          '1': '1px',
          '2': '2px',
          '4': '4px',
      },
      textStrokeColor: {
          white: '#ffffff',
          black: '#000000',
          neon: '#00ffcc',
      },
    },
  },
  plugins: [
    require('@designbycode/tailwindcss-text-stroke'),
  ],
};
