import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    rolldownOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "styled-components",
      ],
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
  },
});
