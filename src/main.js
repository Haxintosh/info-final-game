import "./style.css";
import { Map } from "./js/map-class.js";
import { MapGenerator } from "./js/map-gen-class.js";
import { Player } from "./js/player.js";
import { Camera } from "./js/camera.js";
import { LevelFunctions } from "./js/level-functions.js";
import { ButtonPrompt } from "./js/button-prompt.js";
import { starterWeapons } from "./js/guns.js";
import { UpgCard } from "./js/upg-card.js";

const IS_LOADBLOACKER_ENABLED = true;
if (!IS_LOADBLOACKER_ENABLED) {
  // remove itselt
  const loadBlocker = document.querySelector(".loadBlocker");
  loadBlocker.style.display = "none";
  loadBlocker.style.opacity = "0";
  loadBlocker.remove();
}

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
await player.loadSpritesheet("./character/idle2.png");
await player.loadSpritesheet2("./character/walk2.png");

// player movement
window.addEventListener("keydown", (e) => player.handleKeyDown(e));
window.addEventListener("keyup", (e) => player.handleKeyUp(e));

// camera
const camera = new Camera(canvas, ctx, player);

// level functions
const levelFunctions = new LevelFunctions(canvas, mapGen, player, camera);

await levelFunctions.start((progress) => {
  if (!IS_LOADBLOACKER_ENABLED) return;
  const progressBar = document.querySelector(".progressBarCont");
  const loadBlocker = document.querySelector(".loadBlocker");
  progressBar.style.width = `${progress}%`;
  if (progress >= 100) {
    setTimeout(() => {
      loadBlocker.remove();
      loadBlocker.style.display = "none";
      loadBlocker.style.opacity = "0";
    }, 250);
  }
});
player.levelFunctions = levelFunctions;

// GUNS GUNS GUNS
// give player a gun
const gun = starterWeapons.find((gun) => gun.name === "Shotgun");
player.assignGun(gun);
animate();

const upg = new UpgCard(levelFunctions);
document
  .getElementById("shard-container-cost-1")
  .addEventListener("click", () => upg.buy(1));
document
  .getElementById("shard-container-cost-2")
  .addEventListener("click", () => upg.buy(2));
document
  .getElementById("shard-container-cost-3")
  .addEventListener("click", () => upg.buy(3));
document
  .getElementById("upg-close")
  .addEventListener("click", () => upg.buy(4));

window.addEventListener("keydown", (e) => levelFunctions.interact(e, upg));

// TO BE REMOVED
// levelFunctions.spawnEnemies(mapGen.currentRoom);
// levelFunctions.spawnEnemies(mapGen.currentRoom);
// levelFunctions.spawnEnemies(mapGen.currentRoom);

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
  levelFunctions.updateExplosions();
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

window.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  player.weaponTargetX = e.clientX - rect.left;
  player.weaponTargetY = e.clientY - rect.top;
  player.angle = Math.atan2(e.y - canvas.height / 2, e.x - canvas.width / 2);
});

// testing
// window.addEventListener('click', () => {
//   player.decreaseHp()
//   console.log(player.hp)
// })

window.addEventListener("mousedown", (e) => {
  // console.log("mouse", e.x, e.y);
  // calculate angle enter of screen - mouse
  // const angle = Math.atan2(e.y - canvas.height / 2, e.x - canvas.width / 2);
  player.shootGun();
  // console.log("angle", angle * (180 / Math.PI));
});
