import "./style.css";
import { Map } from "./js/map-class.js";
import { MapGenerator } from "./js/map-gen-class.js";
import { Player } from "./js/player.js";
import { Camera } from "./js/camera.js";
import { LevelFunctions } from "./js/level-functions.js";
import { ButtonPrompt } from "./js/button-prompt.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
canvas.imageRendering = "pixelated";

// map
const mapGen = new MapGenerator(canvas);

// await mapGen.init();
// mapGen.update().catch(console.error);

// player
const player = new Player(
  canvas,
  mapGen.start.x * 40 * 16 + 10 * 16,
  mapGen.start.y * 40 * 16 + 10 * 16,
  32,
  32,
  2,
  mapGen,
);
await player.loadSpritesheet("../character/idle.png");
await player.loadSpritesheet2("../character/run.png");

// player movement
window.addEventListener("keydown", (e) => player.handleKeyDown(e));
window.addEventListener("keyup", (e) => player.handleKeyUp(e));

// camera
const camera = new Camera(canvas, ctx, player);

// level functions
const levelFunctions = new LevelFunctions(canvas, mapGen, player, camera);
await levelFunctions.start();
window.addEventListener("keydown", (e) => levelFunctions.interact(e));
player.levelFunctions = levelFunctions;

animate();

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  camera.begin();
  camera.updateCamBox();

  try {
    mapGen.update();
  } catch (error) {
    console.error(error);
  }

  mapGen.findCurrentRoom(player);

  levelFunctions.checkBattleRoom();

  if (player.direction !== "down") levelFunctions.update();

  player.update(mapGen.currentRoom, mapGen.renderedBlocks);

  // console.log(player.getFacingTile(mapGen.currentRoom))
  levelFunctions.checkInteract();
  if (player.direction === "down") levelFunctions.update();
  levelFunctions.updateEnemies(ctx);
  camera.end();

  // Debug
  // console.log(mapGen.currentBlocks)
  // ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
  // ctx.fillRect(mapGen.currentRoom.x, mapGen.currentRoom.y, 20 * 16, 20 * 16);
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

camera.scaledCanvas.width = canvas.width / camera.zoomFactor;
camera.scaledCanvas.height = canvas.height / camera.zoomFactor;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  camera.scaledCanvas.width = canvas.width / camera.zoomFactor;
  camera.scaledCanvas.height = canvas.height / camera.zoomFactor;
});

// testing
// window.addEventListener('click', () => {
//   player.decreaseHp()
//   console.log(player.hp)
// })

window.addEventListener("mousedown", (e) => {
  levelFunctions.spawnEnemies(mapGen.currentRoom);
});
