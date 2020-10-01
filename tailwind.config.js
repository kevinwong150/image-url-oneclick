// const
const headerHeight = "74px";
const screenWidthThreshold = "1280px";

module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
  },
  purge: [
    './src/**/*.js',
  ],
  theme: {
    colors: {
      "light-light": "var(--light-light)",
      light: "var(--light)",
      "dark-light": "var(--dark-light)",
      dark: "var(--dark)",
      "dark-dark": "var(--dark-dark)",
      transparent: "var(--transparent)",
      success: "var(--correct)",
      error: "var(--incorrect)",
    },
    extend: {
      spacing: {
        header: headerHeight,
      },
    },
  },
  variants: {},
  plugins: [],
}
