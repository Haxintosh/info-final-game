import { ButtonPrompt } from "./button-prompt.js";
import { Enemy } from "./enemy.js";
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
  }

  spawnEnemies(room) {
    const enemyCount = Math.floor(Math.random() * 3) + 1; // min 1 max 3
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
          const enemy = new Enemy(room, x, y, 4, 4, 0.3, this.player);
          this.enemies.push(enemy);
        }
        break;
      }
    }

    console.log(this.enemies);
  }

  updateEnemies(ctx) {
    this.enemies.forEach((enemy) => {
      // Update enemy position or behavior
      // console.log();
      enemy.update(this.ctx);
    });
  }

  async start() {
    setTimeout(() => {
      this.blackout.style.opacity = "0";
    }, 400);

    // setup
    await this.mapGen.init();
    try {
      this.mapGen.drawLayout();
    } catch (error) {
      console.error(error);
    }

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

    this.interacted = false;
    this.interactAction = null;

    setTimeout(
      () => this.announcer("LAYER " + this.level + "-" + this.sublevel, 2000),
      500,
    );
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

  interact(e) {
    switch (e.code) {
      case "KeyE":
        if (!this.interacted) {
          this.interacted = true; // change back to false after interaction is done

          if (this.interactAction === "EndStage") {
            this.player.movementLocked = true;

            this.announcerSub(
              "The statue's bloody red eyes stare back at you...",
              3000,
            );

            setTimeout(() => {
              this.blackout.style.opacity = "1";
            }, 4000);
            setTimeout(() => {
              this.intermission();
            }, 4500);
          }
        }
        break;
    }
  }

  intermission() {
    // put upgrades here

    this.sublevel++;
    if (this.sublevel > 3) {
      this.level++;
      this.sublevel = 1;
    }

    this.start();
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
      // this.mapGen.unlockRooms();
      // this.mapGen.currentRoom.battleRoomDone = true;
      // this.battling = false;
    }
  }
}
