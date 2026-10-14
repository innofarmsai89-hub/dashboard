const config = {
  plugins: {
    // Resolve `@import "tailwindcss"` from this project, not process.cwd(),
    // so the dev server works even when launched from a parent folder.
    "@tailwindcss/postcss": {
      base: import.meta.dirname,
    },
  },
};

export default config;
