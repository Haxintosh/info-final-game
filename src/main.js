import "./style.css";
import { Map } from "./js/map-class.js";
import { MapGenerator } from "./js/map-gen-class.js";
import { Player } from './js/player.js'

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");

const mapGen = new MapGenerator(canvas);

await mapGen.init();
// mapGen.update().catch(console.error);

// player
const player = new Player(canvas, mapGen.start.x*40*16 + 10*16, mapGen.start.y*40*16 + 10*16, 32, 32, 2);
await player.loadSpritesheet('../character/run.png');

// player movement
window.addEventListener('keydown', (e) => player.handleKeyDown(e));
window.addEventListener('keyup', (e) => player.handleKeyUp(e));

animate();

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  try {
    mapGen.update();
  } catch (error) {
    console.error(error);
  }
  mapGen.findCurrentRoom(player.x, player.y)
  player.update(mapGen.currentRoom, mapGen.currentBlocks);
  // console.log(mapGen.renderedBlocks)
}
