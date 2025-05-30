// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}", // Specify the paths to your files
  ],
  theme: {
    extend: {
      colors: {
        "green-primary": "#2D7F4F", // Primary Green
        "green-light": "#A7D08E",   // Light Green
        "green-dark": "#1A5D34",    // Dark Green
        "green-mint": "#A0D9B7",    // Mint Green
        "green-olive": "#6B7D3C",   // Olive Green
        "beige": "#F7F7F2",         // Light Beige/Off-White
        "yellow-accent": "#F3C30A", // Accent Yellow
      },
      fontFamily: {
        lcd: ['"Digital-7 Mono"', 'monospace'], // LCD 7-segment style font
      },
    },
  },

  plugins: [],
};
