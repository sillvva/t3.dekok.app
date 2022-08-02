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
          base: ({ opacityValue }) => {
            if (opacityValue === undefined) opacityValue = 1;
            return `rgba(var(--color-text-base), ${opacityValue})`;
          },
          faded: "var(--color-text-faded)",
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
          article: ({ opacityValue }) => {
            if (opacityValue === undefined) opacityValue = 1;
            return `rgba(var(--color-bg-article), ${opacityValue})`;
          },
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
          base: "rgb(var(--color-bg-body))",
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
        },
        "zoom-bounce": {
          "0%": {
            transform: "scale(0)",
          },
          "60%": {
            transform: "scale(1.4)",
          },
          "100%": {
            transform: "scale(1)",
          }
        },
        "drawer-open": {
          "0%": {
            transform: "scale(0.8)",
          },
          "100%": {
            transform: "scale(1)",
          }
        },
        "drawer-close": {
          "0%": {
            transform: "scale(1)",
          },
          "100%": {
            transform: "scale(0)",
          }
        }
      },
      animation: {
        ripple: "ripple .5s linear",
        "spin-slow": "spin 4s linear infinite",
        "spin-medium": "spin 2s linear infinite",
        "zoom-bounce": "zoom-bounce 300ms linear forwards",
        "drawer-open": "drawer-open 200ms linear forwards",
        "drawer-close": "drawer-close 200ms linear forwards"
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
  plugins: [require("daisyui")]
};
