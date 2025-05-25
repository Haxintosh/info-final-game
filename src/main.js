import "./style.css";
import { Map } from "./js/map-class.js";
import { MapGenerator } from "./js/map-gen-class.js";
import { Player } from "./js/player.js";
import { Camera } from "./js/camera.js";
import { LevelFunctions } from "./js/level-functions.js";
import { ButtonPrompt } from "./js/button-prompt.js";
import { starterWeapons } from "./js/guns.js";
import { UpgCard } from "./js/upg-card.js";
import { audio, music, setAudioVolume } from "./js/audio.js";
import { text, textEN } from "./js/text.js";
import { menuAnim, menuDone } from "./js/menu.js";

// const IS_LOADBLOACKER_ENABLED = false;
// if (!IS_LOADBLOACKER_ENABLED) {
//   // remove itself
//   const loadBlocker = document.querySelector(".loadBlocker");
//   loadBlocker.style.display = "none";
//   loadBlocker.style.opacity = "0";
//   loadBlocker.remove();
//   const playButton = document.getElementById("startGame");
//   const menuContainer = document.querySelector(".mainMenuContainer");
//   menuContainer.style.opacity = "0";
//   menuContainer.remove();
// }
const loadBlocker = document.querySelector(".loadBlocker");
loadBlocker.style.display = "none";
loadBlocker.style.opacity = "0";

const playButton = document.getElementById("startGame");
const menuContainer = document.querySelector(".mainMenuContainer");
const helpPanel = document.querySelector(".helpPannel");
const helpButton = document.getElementById("help");
const helpCloseButton = document.getElementById("helpClose");
const settingsButton = document.getElementById("settings");
const settingsPanel = document.querySelector(".settingsPanel");
const volumeSlider = document.getElementById("volumeSlider");
const fullscreenToggle = document.getElementById("fullscreenToggle");

menuAnim();

// console.log(document.getElementById("startGame"))
playButton.addEventListener("click", () => {
  // menuContainer.style.opacity = "0";
  helpPanel.style.visibility = "hidden";
  // animate();
  setTimeout(() => {
    // menuContainer.style.display = "none";
    // menuContainer.remove();
  }, 1300);
  startGame();

  audio.click.currentTime = 0;
  audio.click.play();
});

settingsButton.addEventListener("click", () => {
  settingsPanel.style.opacity = "1";
  settingsPanel.style.visibility = "visible";
  audio.click.currentTime = 0;
  audio.click.play();
});

document.getElementById("settingsClose").addEventListener("click", () => {
  settingsPanel.style.opacity = "0";
  settingsPanel.style.visibility = "hidden";
  audio.click.currentTime = 0;
  audio.click.play();
});

volumeSlider.addEventListener("input", (e) => {
  const volume = e.target.value / 100;
  setAudioVolume(audio, volume);
  setAudioVolume(music, volume);
  audio.click.currentTime = 0;
  audio.click.play();
});

fullscreenToggle.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
  audio.click.currentTime = 0;
  audio.click.play();
});

document.getElementById("languageToggle").addEventListener("click", () => {
  if (
    document.getElementById("languageToggle").textContent.includes("French")
  ) {
    window.open("/info-final-game/", "_self");
  } else {
    window.open("/info-final-game/en/", "_self");
  }
});

helpButton.addEventListener("click", () => {
  helpPanel.style.opacity = "1";
  helpPanel.style.visibility = "visible";
  audio.click.currentTime = 0;
  audio.click.play();
});

helpCloseButton.addEventListener("click", () => {
  helpPanel.style.opacity = "0";
  helpPanel.style.visibility = "hidden";
  audio.click.currentTime = 0;
  audio.click.play();
});
let isStarted = false;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
canvas.imageRendering = "pixelated";

// Pause menu elements
const pauseContainer = document.querySelector(".pauseContainer");
const resumeButton = document.getElementById("resumeGame");
const restartButton = document.getElementById("restartGame");
const mainMenuButton = document.getElementById("mainMenu");
console.log(resumeButton);

let isPaused = false;

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
player.movementLocked = true;

// player movement
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    togglePauseMenu();
  } else {
    if (isPaused) return;
    player.handleKeyDown(e);
  }
});
window.addEventListener("keyup", (e) => player.handleKeyUp(e));

// camera
const camera = new Camera(canvas, ctx, player);

// level functions
const levelFunctions = new LevelFunctions(canvas, mapGen, player, camera);

// await levelFunctions.start((progress) => {
//   if (!IS_LOADBLOACKER_ENABLED) return;
//   const progressBar = document.querySelector(".progressBarCont");
//   const loadBlocker = document.querySelector(".loadBlocker");
//   progressBar.style.width = `${progress}%`;
//   if (progress >= 100) {
//     setTimeout(() => {
//       loadBlocker.remove();
//       loadBlocker.style.display = "none";
//       loadBlocker.style.opacity = "0";
//     }, 400);
//   }
// });
player.levelFunctions = levelFunctions;

// GUNS GUNS GUNS
// give player a gun
const gun = starterWeapons.find((gun) => gun.name === "default");
player.assignGun(gun);

const upg = new UpgCard(levelFunctions, player);
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
function startGame() {
  menuContainer.style.opacity = "0";
  menuContainer.style.top = "-10%";
  setTimeout(() => {
    menuContainer.style.visibility = "hidden";
  }, 550);

  // lore
  setTimeout(() => {
    document.getElementById("lore-txt").style.opacity = "1";
    document.getElementById("lore-txt").style.top = "30%";

    setTimeout(() => {
      menuDone.done = true;

      document.getElementById("lore-txt-2").style.opacity = "1";
      document.getElementById("lore-txt-2").style.top = "45%";

      setTimeout(() => {
        document.getElementById("play-start").style.opacity = "1";
        document.getElementById("play-start").style.top = "60%";
      }, 4000);
    }, 6000);
  }, 700);
}

let started = false;

document.getElementById("play-start").addEventListener("click", () => {
  if (started) return;

  audio.click.currentTime = 0;
  audio.click.play();

  document.getElementById("loreDumpContainer").style.opacity = "0";

  loadBlocker.style.display = "flex";
  loadBlocker.style.opacity = "1";

  music.menu.pause();

  levelFunctions.start((progress) => {
    const progressBar = document.querySelector(".progressBarCont");
    const loadBlocker = document.querySelector(".loadBlocker");
    progressBar.style.width = `${progress}%`;
    if (progress >= 100) {
      setTimeout(() => {
        loadBlocker.remove();
        loadBlocker.style.display = "none";
        loadBlocker.style.opacity = "0";
        document.getElementById("loreDumpContainer").style.visibility =
          "hidden";
        animate();

        music.ambience.play();
        music.ambience.loop = true;
      }, 400);
    }
  });
  started = true;
});

document.getElementById("end-back").addEventListener("click", () => {
  audio.click.currentTime = 0;
  audio.click.play();

  location.reload();
});

// Pause menu button actions
resumeButton.addEventListener("click", () => togglePauseMenu());
restartButton.addEventListener("click", () => location.reload());
mainMenuButton.addEventListener("click", () => location.reload());

document.getElementById("start-overlay").addEventListener("click", () => {
  audio.click.currentTime = 0;
  audio.click.play();

  music.menu.currentTime = 0;
  music.menu.play();
  music.menu.loop = true;

  document.getElementById("start-overlay").style.opacity = "0";

  setTimeout(() => {
    document.getElementById("start-overlay").style.visibility = "hidden";
  }, 550);
});

function animate() {
  requestAnimationFrame(animate);

  if (isPaused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  camera.begin();
  camera.updateCamBox();

  // update map
  try {
    mapGen.update();
  } catch (error) {
    console.error(error);
  }

  mapGen.findCurrentRoom(player);
  levelFunctions.checkBattleRoom();

  // update map sprites
  if (player.direction !== "down") levelFunctions.update();

  player.update(mapGen.currentRoom, mapGen.renderedBlocks);

  // console.log(player.getFacingTile(mapGen.currentRoom))
  levelFunctions.checkInteract();

  // update map sprites
  if (player.direction === "down") levelFunctions.update();

  levelFunctions.updateEnemies(ctx);
  levelFunctions.updateShards();

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
  if (isPaused) return; // Prevent actions while paused

  if (!player.movementLocked) player.shootGun(levelFunctions);
});

function togglePauseMenu() {
  if (!started) return;
  isPaused = !isPaused;

  if (isPaused) {
    // pauseContainer.style.visibility = "visible";
    // pauseContainer.style.display = "flex";
    pauseContainer.style.opacity = "1";
    pauseContainer.style.zIndex = "1005";
    music.ambience.pause();
    music.menu.currentTime = 0;
    music.menu.play();
  } else {
    pauseContainer.style.opacity = "0";
    pauseContainer.style.zIndex = "-100";
    // pauseContainer.style.display = "none";
    // pauseContainer.style.visibility = "hidden";
    music.ambience.play();
    music.menu.pause();
  }
}
