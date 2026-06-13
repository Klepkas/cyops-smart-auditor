// PostCSS pipeline for the Smart Contract Auditor.
// Tailwind processes the `@tailwind` directives in src/index.css; Autoprefixer
// adds vendor prefixes for the dark-mode browser support matrix.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
