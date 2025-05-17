import {Player} from '/src/js/player.js'

const canvas = document.getElementById("canvas");
export const ctx = canvas.getContext("2d");

const player = new Player(start.x*40*16 + 20*16, start.y*40*16 + 20*16, 32, 48, 2);
await player.loadSpritesheet('run.png');

window.addEventListener('keydown', (e) => player.handleKeyDown(e));
window.addEventListener('keyup', (e) => player.handleKeyUp(e));

function updateLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  findCurrentRoom()

  player.update(currentRoom);
  player.render();

  requestAnimationFrame(updateLoop);
}

// const facingTile = player.getFacingTile(currentMap);
// if (facingTile) {
//   // Check if this tile is interactable
//   // Run interaction logic
// }