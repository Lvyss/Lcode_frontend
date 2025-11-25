module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        invaPurple: "#a855f7",
      },
      fontFamily: {
        satoshi: ["Satoshi", "sans-serif"], // untuk text
        antiqua: ['"Uncial Antiqua"', "cursive"], // Judul LVANOR
        poppins: ["Poppins", "sans-serif"], // Font standar untuk menu
      },
      animation: {
        "spin-slow": "spin 6s linear infinite",
      },
      backgroundImage: {
        'gradient-blue': 'linear-gradient(to top, #5a8aca, #c8d6e9)',
        'gradient-white': 'linear-gradient(to top, #c8d6e9, #5a8aca)',
      },
    },
  },
  plugins: [],
};
