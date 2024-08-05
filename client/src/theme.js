// color design tokens export
export const tokensDark = {
  background: {
    default: '#F5F7FA', // Light grey background
    alt: '#FFFFFF', // White background for cards
    light: '#E5E5E5', // Slightly darker grey for card shadows
  },
    grey: {
      0: "#ffffff", // manually adjusted
      10: "#f6f6f6", // manually adjusted
      50: "#f0f0f0", // manually adjusted
      100: "#e0e0e0",
      200: "#c2c2c2",
      300: "#a3a3a3",
      400: "#858585",
      500: "#666666",
      600: "#525252",
      700: "#3d3d3d",
      800: "#292929",
      900: "#141414",
      1000: "#000000", // manually adjusted
    },
    primary: {
      // blue
      100: "#d3d4de",
      200: "#a6a9be",
      300: "#7a7f9d",
      400: "#4d547d",
      500: "#21295c",
      600: "#191F45", // manually adjusted
      700: "#141937",
      800: "#0d1025",
      900: "#070812",
    },
    secondary: {
      // yellow
      50: "#f0f0f0", // manually adjusted
      100: "#fff6e0",
      200: "#ffedc2",
      300: "#ffe3a3",
      400: "#ffda85",
      500: "#ffd166",
      600: "#cca752",
      700: "#997d3d",
      800: "#665429",
      900: "#332a14",
    },
  };
  
  // function that reverses the color palette
  function reverseTokens(tokensDark) {
    const reversedTokens = {};
    Object.entries(tokensDark).forEach(([key, val]) => {
      const keys = Object.keys(val);
      const values = Object.values(val);
      const length = keys.length;
      const reversedObj = {};
      for (let i = 0; i < length; i++) {
        reversedObj[keys[i]] = values[length - i - 1];
      }
      reversedTokens[key] = reversedObj;
    });
    return reversedTokens;
  }
  export const tokensLight = reverseTokens(tokensDark);
  
  // mui theme settings
  export const themeSettings = (mode) => {
    return {
      palette: {
        mode: mode,
        background: {
          default: '#F5F7FA', // Light grey background
          paper: '#FFFFFF', // White background for cards
        },
      // palette: {
      //   mode: mode,
      //   ...(mode === "dark"
      //     ? {
              // palette values for dark mode
          //     primary: {
          //       ...tokensDark.primary,
          //       main: tokensDark.primary[400],
          //       light: tokensDark.primary[400],
          //     },
          //     secondary: {
          //       ...tokensDark.secondary,
          //       main: tokensDark.secondary[300],
          //     },
          //     neutral: {
          //       ...tokensDark.grey,
          //       main: tokensDark.grey[500],
          //     },
          //     background: {
          //       default: tokensDark.primary[600],
          //       alt: tokensDark.primary[500],
          //     },
          //   }
          // : {
          //     // palette values for light mode
          //     primary: {
          //       ...tokensLight.primary,
          //       main: tokensDark.grey[50],
          //       light: tokensDark.grey[100],
          //     },
          //     secondary: {
          //       ...tokensLight.secondary,
          //       main: tokensDark.secondary[600],
          //       light: tokensDark.secondary[700],
          //     },
          //     neutral: {
          //       ...tokensLight.grey,
          //       main: tokensDark.grey[500],
          //     },
          //     background: {
          //       default: tokensDark.grey[0],
          //       alt: tokensDark.grey[50],
          //     },
          //   }),
      },
      typography: {
        fontFamily: ["Inter", "sans-serif"].join(","),
        fontSize: 12,
        h1: {
          fontFamily: ["Inter", "sans-serif"].join(","),
          fontSize: 40,
        },
        h2: {
          fontFamily: ["Inter", "sans-serif"].join(","),
          fontSize: 28,
        },
        h3: {
          fontFamily: ["Inter", "sans-serif"].join(","),
          fontSize: 20,
        },
        h4: {
          fontFamily: ["Inter", "sans-serif"].join(","),
          fontSize: 17,
        },
        h5: {
          fontFamily: ["Inter", "sans-serif"].join(","),
          fontSize: 14,
        },
        h6: {
          fontFamily: ["Inter", "sans-serif"].join(","),
          fontSize: 12,
        },
      },

   components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: '#FFFFFF', // White background for cards
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Adjust shadow to match Datacake cards
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            backgroundColor: '#5356FF', // Use primary color for button background
            color: '#FFFFFF', // White text
            '&:hover': {
              backgroundColor: '#191F45', // Darken on hover
            },
          },
        },
      },
    },
  };
};