import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/info-final-game/",
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
