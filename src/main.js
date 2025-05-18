import "./style.css";
import { Map } from "./js/map-class.js";
import { MapGenerator } from "./js/map-gen-class.js";
import { Player } from "./js/player.js";
import { Camera } from "./js/camera.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false
canvas.imageRendering = "pixelated"

const mapGen = new MapGenerator(canvas);

await mapGen.init();
// mapGen.update().catch(console.error);

// player
const player = new Player(
  canvas,
  mapGen.start.x * 40 * 16 + 10 * 16,
  mapGen.start.y * 40 * 16 + 10 * 16,
  32,
  32,
  2,
);
await player.loadSpritesheet("../character/run.png");

// player movement
window.addEventListener("keydown", (e) => player.handleKeyDown(e));
window.addEventListener("keyup", (e) => player.handleKeyUp(e));

const camera = new Camera(canvas, ctx, player)

animate();

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);


  camera.begin()
  camera.updateCamBox()

  try {
    mapGen.update();
  } catch (error) {
    console.error(error);
  }

  mapGen.findCurrentRoom(player.x, player.y);
  player.update(mapGen.currentRoom, mapGen.currentBlocks);

  ctx.fillStyle = 'red'
  ctx.fillRect(0, 0, 20, 20);
  camera.end()

  // Debug
  // console.log(mapGen.renderedBlocks)
  // ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
  // ctx.fillRect(mapGen.currentRoom.x, mapGen.currentRoom.y, 20 * 16, 20 * 16);
}

canvas.width = window.innerWidth
canvas.height = window.innerHeight

camera.scaledCanvas.width = canvas.width / camera.zoomFactor
camera.scaledCanvas.height = canvas.height / camera.zoomFactor

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  camera.scaledCanvas.width = canvas.width / camera.zoomFactor
  camera.scaledCanvas.height = canvas.height / camera.zoomFactor
})