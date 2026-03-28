/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1E211C",
        mist: "#E6E1D3",
        sage: "#D3CABB",
        pine: "#2E4A37",
        moss: "#798D3D",
        sand: "#FFF8E7",
        charcoal: "#262B27",
        slatepanel: "#575757",
        parchment: "#F3ECDD",
        gold: "#C7A94A",
        goldsoft: "#E5D39A",
        goldshine: "#F3D87A",
        golddeep: "#A88421",
        forest: "#223329",
      },
      boxShadow: {
        soft: "0 14px 40px rgba(0, 0, 0, 0.12)",
      },
      borderRadius: {
        panel: "30px",
      },
    },
  },
  plugins: [],
};
