import { ButtonPrompt } from "./button-prompt.js";
import { Enemy } from "./enemy.js";
import { text } from "./text.js";
import { Explosion } from "./guns.js";
export class LevelFunctions {
  constructor(canvas, mapGen, player, camera) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    // objs
    this.mapGen = mapGen;
    this.player = player;
    this.camera = camera;
    // lvls
    this.level = 1;
    this.sublevel = 1;

    // html elements
    this.announcerCard = document.getElementById("announcer");
    this.announcerTxt = document.getElementById("announcer-txt");
    this.announcerSubCard = document.getElementById("announcer-sub");
    this.announcerSubTxt = document.getElementById("announcer-sub-txt");

    this.blackout = document.getElementById("blackout");

    // interaction stuff
    this.interacted = false;
    this.interactAction = null;

    this.img = new Image();
    this.img.src = "./map-assets/room_end/statue_completed.png";

    // battle room
    this.battling = false;
    this.enemies = [];
    this.updateEnemies = this.updateEnemies.bind(this);
    this.wavesLeft = this.level;
  }

  async spawnEnemies(room) {
    const enemyCount = Math.floor(Math.random() * 3) + 5; // min 5 max 8
    // console.log(room);

    for (let i = 0; i < enemyCount; i++) {
      let x, y, tileX, tileY;
      for (let j = 0; j < 2; j++) {
        x = Math.floor(room.x + Math.random() * room.mapWidth * 16);
        y = Math.floor(room.y + Math.random() * room.mapHeight * 16);
        tileX = Math.floor((x - room.x) / 16);
        tileY = Math.floor((y - room.y) / 16);
        // console.log(tileX, tileY);
        // console.log(room);
        if (room.enemyMap[tileY][tileX] === 0) {
          const enemy = new Enemy(
            room,
            x,
            y,
            16,
            24,
            0.3,
            this.player,
            this,
            this.mapGen,
          );
          // this.enemies.push(enemy);
          room.enemies.push(enemy);

          // load images
          await enemy.loadSpritesheetIdle("./enemies/enemy1-idle.png");
          await enemy.loadSpritesheetRun("./enemies/enemy1-run.png");
          await enemy.loadSpritesheetAttack("./enemies/enemy1-attack.png");
          await enemy.loadSpritesheetDeath("./enemies/enemy1-death.png");
        }
        break;
      }
    }
  }

  updateEnemies(ctx) {
    this.mapGen.currentRoom.enemies.forEach((enemy) => {
      // Update enemy position or behavior
      // console.log();
      this.projectilesEnemyCollision();
      enemy.update(ctx, this.canvas);
    });
  }

  updateExplosions() {
    this.mapGen.currentRoom.tweenGroup.update();
    this.mapGen.currentRoom.explosions.forEach((explosion) => {
      explosion.draw();
    });

    // remove explosions
    for (let i = this.mapGen.currentRoom.explosions.length - 1; i >= 0; i--) {
      const explosion = this.mapGen.currentRoom.explosions[i];
      if (!explosion.alive) {
        this.mapGen.currentRoom.explosions.splice(i, 1);
      }
    }
    // console.log(this.mapGen.currentRoom.explosions);
  }

  projectilesEnemyCollision() {
    for (let enemy of this.mapGen.currentRoom.enemies) {
      for (let projectile of this.player.gun.projectiles) {
        if (
          projectile.position.x < enemy.x + enemy.width &&
          projectile.position.x + projectile.size > enemy.x &&
          projectile.position.y < enemy.y + enemy.height &&
          projectile.position.y + projectile.size > enemy.y
        ) {
          // console.log("hit");

          const explosion = new Explosion(
            projectile.position.copy(),
            this.canvas,
            this.mapGen.currentRoom.tweenGroup,
            projectile.color,
          );
          this.mapGen.currentRoom.explosions.push(explosion);
          enemy.hp -= projectile.damage;
          this.player.gun.projectiles.splice(
            this.player.gun.projectiles.indexOf(projectile),
            1,
          );
        } else {
          // console.log("miss");
        }
      }
    }
  }

  async start(progressCallback = () => {}) {
    setTimeout(() => {
      this.blackout.style.opacity = "0";
    }, 400);

    // Step 1: Setup map generation
    progressCallback(10);
    await this.mapGen.init((mapGenProgress) => {
      progressCallback(10 + mapGenProgress * 0.7); // loading  70% total progress
    });
    progressCallback(80);

    try {
      this.mapGen.drawLayout();
      progressCallback(90);
    } catch (error) {
      console.error(error);
    }

    // Step 2: Position player and camera
    this.player.x =
      this.mapGen.end.x * 40 * 16 + 10 * 16 - this.player.width / 2;
    this.player.y =
      this.mapGen.end.y * 40 * 16 + 10 * 16 - this.player.height / 2;
    this.camera.position.x =
      this.player.x +
      this.player.width / 2 -
      this.camera.scaledCanvas.width / 2;
    this.camera.position.y =
      this.player.y +
      this.player.height / 2 -
      this.camera.scaledCanvas.height / 2;
    this.player.movementLocked = false;
    this.player.direction = "down";

    progressCallback(90);

    // Step 3: Reset interaction state
    this.interacted = false;
    this.interactAction = null;

    progressCallback(95);

    // Step 4: Announce level start
    setTimeout(
      () => this.announcer(text.layer + this.level + "-" + this.sublevel, 2000),
      500,
    );

    progressCallback(100); // BEGIN GAME
  }

  announcer(msg, time) {
    // anims
    this.announcerTxt.textContent = msg;

    this.announcerCard.style.width = "500px";
    setTimeout(() => {
      this.announcerCard.style.width = "0px";
    }, time);
  }

  announcerSub(msg, time) {
    // anims
    this.announcerSubTxt.textContent = msg;

    this.announcerSubCard.style.width = "1000px";
    setTimeout(() => {
      this.announcerSubCard.style.width = "0px";
    }, time);
  }

  checkInteract() {
    if (this.interacted) return;

    const coords = this.player.getFacingTile(this.mapGen.currentRoom);

    if (!coords) return; // if null return

    if (this.mapGen.currentRoom && this.mapGen.currentRoom.type === 3) {
      const tile = this.mapGen.currentRoom.interactMap[coords.y][coords.x];
      if (tile === 1) {
        // button prompts are going to have to be manual
        const button = new ButtonPrompt(
          this.canvas,
          this.mapGen,
          "E",
          this.mapGen.currentRoom.x +
            (this.mapGen.currentRoom.mapWidth * 16) / 2,
          this.mapGen.currentRoom.y +
            (this.mapGen.currentRoom.mapHeight * 16) / 2 -
            16,
        );
        this.interactAction = "EndStage";
      }
    }
  }

  interact(e, upg) {
    switch (e.code) {
      case "KeyE":
        if (!this.interacted) {
          this.interacted = true; // change back to false after interaction is done

          if (this.interactAction === "EndStage") {
            this.player.movementLocked = true;
            this.player.moving = false;

            this.announcerSub(text.endStatue, 3000);

            setTimeout(() => {
              this.blackout.style.opacity = "1";
            }, 4000);
            setTimeout(() => {
              this.intermission(upg);
            }, 4500);
          }
        }
        break;
    }
  }

  intermission(upg) {
    upg.showCards();

    this.sublevel++;
    if (this.sublevel > 3) {
      this.level++;
      this.sublevel = 1;
    }
  }

  update() {
    // this.checkBattleRoom()
    if (this.interacted && this.interactAction === "EndStage")
      this.showEndStatue();
  }

  showEndStatue() {
    this.ctx.drawImage(
      this.img,
      this.mapGen.currentRoom.x + 9 * 16,
      this.mapGen.currentRoom.y + 6 * 16,
    );
  }

  checkBattleRoom() {
    if (
      this.mapGen.currentRoom.type === 1 &&
      !this.mapGen.currentRoom.battleRoomDone
    ) {
      if (this.battling) return; // trigger once
      this.battling = true;

      this.wavesLeft--;

      this.mapGen.lockdownRoom(
        this.mapGen.currentRoom.x / (40 * 16),
        this.mapGen.currentRoom.y / (40 * 16),
      );

      // snap player position
      let dx =
        this.player.x +
        this.player.width / 2 -
        (this.mapGen.currentRoom.x +
          (this.mapGen.currentRoom.mapWidth * 16) / 2);
      let dy =
        this.player.y +
        this.player.height / 2 -
        (this.mapGen.currentRoom.y +
          (this.mapGen.currentRoom.mapHeight * 16) / 2);
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          // right side
          this.player.x -= 32;
        } else {
          // left side
          this.player.x += 32;
        }
      } else {
        if (dy > 0) {
          // bottom side
          this.player.y -= 32;
        } else {
          // top side
          this.player.y += 32;
        }
      }

      // spawn enemy logic
      // make sure to add these after all enemies are defeated:

      setTimeout(() => {
        this.spawnEnemies(this.mapGen.currentRoom);
      }, 500);

      // this.mapGen.unlockRooms();
      // this.mapGen.currentRoom.battleRoomDone = true;
      // this.battling = false;
    }
  }
}
