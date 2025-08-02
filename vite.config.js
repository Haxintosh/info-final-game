import { resolve } from "path";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  base: "/whispers-below/",
  build: {
    target: "esnext",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        game: resolve(__dirname, "index-en.html"),
      },
    },
  },
  plugins: [wasm(), topLevelAwait()],
  // build: {
  //     rollupOptions: {
  //         input: {
  //             main: resolve(__dirname, 'index.html'),
  //             game: resolve(__dirname, 'game/game.html'),
  //             welcome: resolve(__dirname, 'welcome/index.html'),
  //         },
  //     },
  // },
});
