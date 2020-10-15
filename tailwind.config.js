// const
const headerHeight = "74px";

module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
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
  plugins: [
    // add universal base
    function ({ addBase, config }) {
      const universalBase = {
        "*": {
          "-ms-overflow-style": "auto",
          "-ms-overflow-style": "none",
          scrollbarWidth: "thin",

          "&::-webkit-scrollbar": {
            "-webkit-appearance": "none",
            backgroundColor: config("theme.colors.light"),
            width: "6px",
            height: "6px",
          },

          "&::-webkit-scrollbar-thumb": {
            backgroundColor: config("theme.colors.dark-light"),
          },
        },
      };
      addBase(universalBase);
    },

    // add html and body base
    function ({ addBase, config }) {
      const bodyBase = {
        "html, body": {
          padding: "0",
          margin: "0",
          height: "100vh",
          width: "100vw",
          position: "relative",
          fontFamily: "Roboto, sans-serif, system-ui",
          overflowX: "hidden",
        },
      };
      addBase(bodyBase);
    },

    // remove default outline
    function ({ addBase }) {
      const target = {
        "select, input, button, textarea": {
          outline: "none",

          "&:focus": {
            outline: "none",
          },
        },
      };
      addBase(target);
    },
  ],
}
