import { defineConfig } from "tsup";
import { copy } from "esbuild-plugin-copy";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  dts: true,
  minify: true,
  esbuildPlugins: [
    copy({
      assets: [
        {
          from: "src/parser.py",
          to: "dist",
        },
      ],
    }),
  ],
});
