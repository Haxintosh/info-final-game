import { ButtonPrompt } from "./button-prompt.js";
import { Enemy } from "./enemy.js";
import { text } from "./text.js";
import { Explosion } from "./guns.js";
import { Shard } from "./shard.js";
import { audio, music } from "./audio.js";

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
    this.img2 = new Image();
    this.img2.src = "./map-assets/room_special_1/chest_opened.png";

    // battle room
    this.battling = false;
    this.enemies = [];
    this.updateEnemies = this.updateEnemies.bind(this);
    this.wavesLeft = this.level;

    // shards
    this.shards = { count: 0 };
    this.shardsArray = [];

    // upgrade stuff
    this.upgrades = {
      dmgMulti: 1,
      speedMulti: 1,
    };

    // end screen stat
    this.audioTriggered = false;
    this.enemiesDefeated = { count: 0 };
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
            this.level / 2 + 0.5,
            this.level,
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
          enemy.hp -= projectile.damage * this.upgrades.dmgMulti;
          this.player.gun.projectiles.splice(
            this.player.gun.projectiles.indexOf(projectile),
            1,
          );
          enemy.dmged = true;
          setTimeout(() => {
            enemy.dmged = false;
          }, 100);
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

    setTimeout(
      () => this.announcer(text.layer + this.level + "-" + this.sublevel, 2000),
      600,
    );

    // map generation
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

    // player and camera
    this.player.x =
      this.mapGen.start.x * 40 * 16 + 10 * 16 - this.player.width / 2;
    this.player.y =
      this.mapGen.start.y * 40 * 16 + 10 * 16 - this.player.height / 2;
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

    // interaction state
    this.interacted = false;
    this.interactAction = null;

    progressCallback(95);

    audio.level.currentTime = 0;
    await audio.level.play(); // add later cuz stupid autoplay
    // // Step 4: Announce level start
    // setTimeout(
    //   () => this.announcer(text.layer + this.level + "-" + this.sublevel, 2000),
    //   500,
    // );

    progressCallback(100); // BEGIN GAME
  }

  announcer(msg, time) {
    // anims
    this.announcerTxt.textContent = msg;

    this.announcerCard.style.width = "800px";
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

    this.interactAction = "none";

    if (
      !coords ||
      !this.mapGen.currentRoom.interactMap[coords.x - 1] ||
      !this.mapGen.currentRoom.interactMap[coords.x + 1] ||
      !this.mapGen.currentRoom.interactMap[coords.y - 1] ||
      !this.mapGen.currentRoom.interactMap[coords.y + 1]
    )
      return; // if null return

    const tile1 = this.mapGen.currentRoom.interactMap[coords.y][coords.x]; // close center
    let tile2 = this.mapGen.currentRoom.interactMap[coords.y][coords.x]; // close left
    let tile3 = this.mapGen.currentRoom.interactMap[coords.y][coords.x]; // close right

    if (this.player.direction === "top") {
      tile2 = this.mapGen.currentRoom.interactMap[coords.y][coords.x - 1]; // close left
      tile3 = this.mapGen.currentRoom.interactMap[coords.y][coords.x + 1]; // close right
    }
    if (this.player.direction === "down") {
      tile2 = this.mapGen.currentRoom.interactMap[coords.y][coords.x - 1]; // close left
      tile3 = this.mapGen.currentRoom.interactMap[coords.y][coords.x + 1]; // close right
    }
    if (this.player.direction === "left") {
      tile2 = this.mapGen.currentRoom.interactMap[coords.y + 1][coords.x]; // close left
      tile3 = this.mapGen.currentRoom.interactMap[coords.y - 1][coords.x]; // close right
    }
    if (this.player.direction === "right") {
      tile2 = this.mapGen.currentRoom.interactMap[coords.y - 1][coords.x]; // close left
      tile3 = this.mapGen.currentRoom.interactMap[coords.y + 1][coords.x]; // close right
    }

    // console.log(this.mapGen.currentRoom.subtype)

    if (this.mapGen.currentRoom && this.mapGen.currentRoom.type === 3) {
      if (tile1 === 1 || tile2 === 1 || tile3 === 1) {
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
    if (this.mapGen.currentRoom && this.mapGen.currentRoom.type === 4) {
      // chest room
      if (parseInt(this.mapGen.currentRoom.subtype) === 1) {
        if (tile1 === 1 || tile2 === 1 || tile3 === 1) {
          // button prompts are going to have to be manual
          let x;
          let y;
          let id;

          let roomCenterX =
            this.mapGen.currentRoom.x +
            (this.mapGen.currentRoom.mapWidth * 16) / 2;
          let roomCenterY =
            this.mapGen.currentRoom.y +
            (this.mapGen.currentRoom.mapHeight * 16) / 2;

          let playerCenterX = this.player.x + this.player.width / 2;
          let playerCenterY = this.player.y + this.player.height / 2;

          if (playerCenterX < roomCenterX && playerCenterY < roomCenterY) {
            x = this.mapGen.currentRoom.x + (6 * 16 + 8) + 0.5;
            y = this.mapGen.currentRoom.y + (5 * 16 + 8);
            id = 1;
          } else if (
            playerCenterX > roomCenterX &&
            playerCenterY < roomCenterY
          ) {
            x = this.mapGen.currentRoom.x + (13 * 16 + 8) + 0.5;
            y = this.mapGen.currentRoom.y + (5 * 16 + 8);
            id = 2;
          } else if (
            playerCenterX < roomCenterX &&
            playerCenterY > roomCenterY
          ) {
            x = this.mapGen.currentRoom.x + (6 * 16 + 8) + 0.5;
            y = this.mapGen.currentRoom.y + (12 * 16 + 8);
            id = 3;
          } else if (
            playerCenterX > roomCenterX &&
            playerCenterY > roomCenterY
          ) {
            x = this.mapGen.currentRoom.x + (13 * 16 + 8) + 0.5;
            y = this.mapGen.currentRoom.y + (12 * 16 + 8);
            id = 4;
          }

          if (!this.mapGen.currentRoom.chestDone.includes(id)) {
            const button = new ButtonPrompt(
              this.canvas,
              this.mapGen,
              "E",
              x,
              y,
            );
            this.interactAction = "Chest";
          }
        }
      }

      // shard room
      if (parseInt(this.mapGen.currentRoom.subtype) === 2) {
        if (tile1 === 1 || tile2 === 1 || tile3 === 1) {
          // button prompts are going to have to be manual
          let x;
          let y;
          let id;

          let roomCenterX =
            this.mapGen.currentRoom.x +
            (this.mapGen.currentRoom.mapWidth * 16) / 2;

          let playerCenterX = this.player.x + this.player.width / 2;

          if (playerCenterX < roomCenterX) {
            x = this.mapGen.currentRoom.x + 7 * 16;
            y = this.mapGen.currentRoom.y + 8 * 16;
            id = 1;
          } else if (playerCenterX > roomCenterX) {
            x = this.mapGen.currentRoom.x + 13 * 16;
            y = this.mapGen.currentRoom.y + 11 * 16;
            id = 2;
          }

          if (!this.mapGen.currentRoom.shardDone.includes(id)) {
            const button = new ButtonPrompt(
              this.canvas,
              this.mapGen,
              "E",
              x,
              y,
            );
            this.interactAction = "Shard";
          }
        }
      }

      // well room
      if (parseInt(this.mapGen.currentRoom.subtype) === 3) {
        if (tile1 === 1 || tile2 === 1 || tile3 === 1) {
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
          this.interactAction = "Well";
        }
      }
    }
  }

  interact(e, upg) {
    switch (e.code) {
      case "KeyE":
        if (!this.interacted) {
          if (this.interactAction !== "none") this.interacted = true; // change back to false after interaction is done

          // interaction
          if (this.interactAction === "EndStage") {
            this.player.movementLocked = true;
            this.player.moving = false;

            if (this.level === 3 && this.sublevel === 3) {
              // put 4-1 if we have boss
              this.announcerSub(text.endStatue2, 3000);

              setTimeout(() => {
                document.getElementById("end-screen-background").style.opacity =
                  "1";
              }, 4000);
              setTimeout(() => {
                this.endScreen("Victory");
              }, 4700);
            } else {
              this.announcerSub(text.endStatue, 3000);

              setTimeout(() => {
                this.blackout.style.opacity = "1";
              }, 4000);
              setTimeout(() => {
                this.intermission(upg);
              }, 4500);
            }
          }

          // well room
          if (this.interactAction === "Well") {
            this.player.movementLocked = true;
            this.player.moving = false;

            this.announcerSub(text.well, 2000);

            setTimeout(() => {
              upg.showCards(this.mapGen, true);
            }, 3000);
          }

          // chest
          if (this.interactAction === "Chest") {
            let id;
            let roomCenterX =
              this.mapGen.currentRoom.x +
              (this.mapGen.currentRoom.mapWidth * 16) / 2;
            let roomCenterY =
              this.mapGen.currentRoom.y +
              (this.mapGen.currentRoom.mapHeight * 16) / 2;

            let playerCenterX = this.player.x + this.player.width / 2;
            let playerCenterY = this.player.y + this.player.height / 2;

            if (playerCenterX < roomCenterX && playerCenterY < roomCenterY) {
              id = 1;
            } else if (
              playerCenterX > roomCenterX &&
              playerCenterY < roomCenterY
            ) {
              id = 2;
            } else if (
              playerCenterX < roomCenterX &&
              playerCenterY > roomCenterY
            ) {
              id = 3;
            } else if (
              playerCenterX > roomCenterX &&
              playerCenterY > roomCenterY
            ) {
              id = 4;
            }

            const idValues = {
              1: 0.1,
              2: 0.3,
              3: 0.6,
              4: 0.9,
            };
            let closestId = null;
            let closestDiff = Infinity;
            for (const [key, value] of Object.entries(idValues)) {
              const diff = Math.abs(this.mapGen.currentRoom.chest - value);
              if (diff < closestDiff) {
                closestDiff = diff;
                closestId = parseInt(key);
              }
            }

            if (closestId === id) {
              const rng = Math.random();
              if (rng < 0.5 && !(this.player.hp >= this.player.maxHp)) {
                this.announcerSub(text.chestUsefulHeart, 1000);

                this.player.hp++;

                const hearts = document.querySelectorAll(".heart");

                for (let i = 0; i <= hearts.length; i++) {
                  const heart = hearts[i];
                  if (heart.src.includes("/heart-dead.png")) {
                    heart.src = "./heart.png";
                    break; // stops after healing one heart
                  }
                }
              } else {
                this.announcerSub(text.chestUsefulShard, 1000);
                const exp = Math.ceil(Math.random() * 4) + 1;
                for (let i = 0; i < exp; i++) {
                  const shard = new Shard(
                    this.player.x + this.player.width / 2,
                    this.player.y + this.player.height / 2,
                    this.player,
                    this.shardsArray,
                    this.shards,
                  );
                }
              }
            } else {
              this.announcerSub(text.chestUseless, 1000);
            }

            this.mapGen.currentRoom.chestDone.push(id);

            this.interacted = false;
          }

          if (this.interactAction === "Shard") {
            let id;

            let roomCenterX =
              this.mapGen.currentRoom.x +
              (this.mapGen.currentRoom.mapWidth * 16) / 2;

            let playerCenterX = this.player.x + this.player.width / 2;

            if (playerCenterX < roomCenterX) {
              id = 1;
            } else if (playerCenterX > roomCenterX) {
              id = 2;
            }

            const exp = Math.ceil(Math.random() * 3) + 3;
            for (let i = 0; i < exp; i++) {
              const shard = new Shard(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                this.player,
                this.shardsArray,
                this.shards,
              );
            }

            this.mapGen.currentRoom.shardDone.push(id);

            this.interacted = false;
          }
        }
        break;
    }
  }

  intermission(upg) {
    upg.showCards(this.mapGen, false);

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
    this.checkChest();
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

      // audio
      audio.battle.currentTime = 0;
      audio.battle.play();
      music.hunted.currentTime = 0;
      music.hunted.play();
    }
  }

  updateShards() {
    this.shardsArray.forEach((e) => {
      e.update(this.ctx);
    });
  }

  endScreen(status) {
    this.mapGen.currentRoom.enemies = [];

    document.getElementById("end-screen-background").style.visibility =
      "visible";
    document.getElementById("end-screen-container").style.visibility =
      "visible";

    document.getElementById("end-1").style.width = "100%";

    setTimeout(() => {
      document.getElementById("end-screen-txt-1").style.opacity = "1";
      document.getElementById("end-screen-txt-1").style.margin = "20px 0";
    }, 1500);
    setTimeout(() => {
      document.getElementById("end-screen-txt-2").style.opacity = "1";
      document.getElementById("end-screen-txt-2").style.margin = "20px 0";
    }, 7500);
    setTimeout(() => {
      document.getElementById("end-2").style.opacity = "1";
      document.getElementById("end-2").style.marginTop = "0px";
    }, 13500);
    setTimeout(() => {
      document.getElementById("end-3").style.opacity = "1";
      document.getElementById("end-3").style.marginTop = "0px";
    }, 16000);

    // change text
    document.getElementById("end-screen-title").textContent =
      text["endTitle" + status];
    document.getElementById("end-screen-txt-1").innerHTML =
      text["endTxt" + status];
    document.getElementById("end-screen-txt-2").innerHTML =
      text["endTxt" + status + "2"];
    document.getElementById("end-screen-subtitle").innerHTML =
      text["endSubtitle" + status];
    document.getElementById("end-back").innerHTML =
      `${text.endBack} <span class="chevron">&gt;</span>`;

    // stats
    if (status === "Victory")
      document.getElementById("end-rooms").textContent =
        text.rooms + text.fullClear;
    else
      document.getElementById("end-rooms").textContent =
        text.rooms + this.level + "-" + this.sublevel;
    document.getElementById("end-enemies").textContent =
      text.enemiesDefeated + this.enemiesDefeated.count;
    document.getElementById("end-shards").textContent =
      text.shardsCollected + this.shards.count;

    // audio
    if (this.audioTriggered) return;
    this.audioTriggered = true;

    setTimeout(() => {
      this.audioTriggered = false;
    }, 1000);

    audio.boom.currentTime = 0;
    audio.boom.play();
    music.ambience.pause();
    music.hunted.pause();

    if (status === "Victory") {
      music.redemption.currentTime = 0;
      music.redemption.play();
    } else {
      music.devestation.currentTime = 0;
      music.devestation.play();
    }
  }

  checkChest() {
    this.mapGen.currentRoom.chestDone.forEach((e) => {
      if (e === 1) {
        this.ctx.drawImage(
          this.img2,
          this.mapGen.currentRoom.x + 6 * 16,
          this.mapGen.currentRoom.y + 4 * 16,
        );
      }
      if (e === 2) {
        this.ctx.drawImage(
          this.img2,
          this.mapGen.currentRoom.x + 13 * 16,
          this.mapGen.currentRoom.y + 4 * 16,
        );
      }
      if (e === 3) {
        this.ctx.drawImage(
          this.img2,
          this.mapGen.currentRoom.x + 6 * 16,
          this.mapGen.currentRoom.y + 11 * 16,
        );
      }
      if (e === 4) {
        this.ctx.drawImage(
          this.img2,
          this.mapGen.currentRoom.x + 13 * 16,
          this.mapGen.currentRoom.y + 11 * 16,
        );
      }
    });
  }
}
