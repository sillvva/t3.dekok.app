/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 4s linear infinite",
        "spin-medium": "spin 2s linear infinite"
      },
      textColor: {
        theme: {
          base: "var(--color-text-base)",
          inverted: "var(--color-text-inverted)",
          link: "var(--color-text-link)",
          "link-hover": "var(--color-text-link-hover)",
          button: "var(--color-text-button)",
          heading: "var(--color-text-heading)"
        }
      },
      backgroundColor: {
        theme: {
          body: ({ opacityValue }) => {
            if (opacityValue === undefined) opacityValue = 1;
            return `rgba(var(--color-bg-body), ${opacityValue})`;
          },
          article: "var(--color-bg-article)",
          hover: ({ opacityValue }) => {
            if (opacityValue === undefined) opacityValue = 1;
            return `rgba(var(--color-bg-hover), ${opacityValue})`;
          },
          link: "var(--color-bg-link)",
          "link-hover": "var(--color-bg-link-hover)",
          pre: "var(--color-bg-pre)",
          file: "var(--color-bg-file)",
          code: "var(--color-bg-code)"
        }
      },
      ringColor: {
        theme: {
          link: "var(--color-text-link)"
        }
      },
      ringOffsetColor: {
        theme: {
          link: "var(--color-text-link)"
        }
      },
      opacity: {
        15: "0.15",
        33: "0.33"
      },
      boxShadowColor: {
        theme: {
          body: ({ opacityValue }) => {
            if (opacityValue === undefined) opacityValue = 1;
            return `rgba(var(--color-bg-body), ${opacityValue})`;
          },
        }
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        "robo-flex": ["Robo-Flex", "sans-serif"]
      },
      keyframes: {
        ripple: {
          "0%": {
            width: "5%",
            opacity: 0
          },
          "80%": {
            width: "100%",
            opacity: 0.25
          },
          "100%": {
            opacity: 0
          }
        }
      },
      animation: {
        ripple: "ripple .5s linear",
        "spin-slow": "spin 4s linear infinite",
        "spin-medium": "spin 2s linear infinite"
      },
      maxWidth: {
        "8xl": "100rem",
      }
    },
    screens: {
      "3xs": "360px",
      "2xs": "430px",
      xs: "576px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px"
    }
  },
  plugins: [],
};
