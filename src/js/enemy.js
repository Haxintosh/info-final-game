import { aStar } from "./pathfinder.js";
import { ddaRaycast } from "./dda.js";
export class Enemy {
  constructor(room, x, y, width, height, speed, player, levelFunctions, mapGen, hp = 10) {
    this.x = x;
    this.y = y;
    this.width = width; // hitbox width
    this.height = height; // hitbox height
    this.speed = speed || 0.5;

    this.levelFunctions = levelFunctions
    this.mapGen = mapGen

    // animation
    this.spritesheetIdle = null;
    this.spritesheetRun = null;
    this.spritesheetAttack = null;
    this.spritesheetDeath = null;
    this.frameX = 0;
    this.frameY = 0;
    this.animationSpeed = 10; // frames per animation change
    this.frameCounter = 0;
    this.direction = 'down'
    this.color = "red"; // default color

    this.path = [];
    this.pathIndex = 0;
    this.state = "wander"; // 'hunting'
    this.wanderTarget = null;
    this.room = room;
    this.wanderDelay = 90; // frames to wait before choosing a new target

    this.player = player;

    this.effects = [];
    this.effectDuration = 0;

    this.hp = hp;
  }

  async loadSpritesheetIdle(spritesheetPath) {
    this.spritesheetIdle = new Image();
    this.spritesheetIdle.src = spritesheetPath;
    return new Promise((resolve, reject) => {
      this.spritesheetIdle.onload = () => resolve();
      this.spritesheetIdle.onerror = () =>
        reject(new Error("failed to load player spritesheet"));
    });
  }
  async loadSpritesheetRun(spritesheetPath) {
    this.spritesheetRun = new Image();
    this.spritesheetRun.src = spritesheetPath;
    return new Promise((resolve, reject) => {
      this.spritesheetRun.onload = () => resolve();
      this.spritesheetRun.onerror = () =>
        reject(new Error("failed to load player spritesheet"));
    });
  }
  async loadSpritesheetAttack(spritesheetPath) {
    this.spritesheetAttack = new Image();
    this.spritesheetAttack.src = spritesheetPath;
    return new Promise((resolve, reject) => {
      this.spritesheetAttack.onload = () => resolve();
      this.spritesheetAttack.onerror = () =>
        reject(new Error("failed to load player spritesheet"));
    });
  }
  async loadSpritesheetDeath(spritesheetPath) {
    this.spritesheetDeath = new Image();
    this.spritesheetDeath.src = spritesheetPath;
    return new Promise((resolve, reject) => {
      this.spritesheetDeath.onload = () => resolve();
      this.spritesheetDeath.onerror = () =>
        reject(new Error("failed to load player spritesheet"));
    });
  }

  followPath(grid) {
    if (!this.path || this.path.length === 0) {
      this.wanderTarget = null; // rst
      return;
    }

    const tileSize = 16;

    // curr target tile
    const targetTile = this.path[this.pathIndex];
    const targetX = this.room.x + targetTile.x * tileSize + tileSize / 2;
    const targetY = this.room.y + targetTile.y * tileSize + tileSize / 2;

    // dist to target
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.speed) {
      this.x = targetX;
      this.y = targetY;
      this.pathIndex++;

      if (this.pathIndex >= this.path.length) {
        this.path = [];
        this.pathIndex = 0;
        this.wanderTarget = null;
        // this.wanderDelay = 90; // frames to wait before choosing a new target
      }
    } else {
      this.x += (dx / distance) * this.speed;
      this.y += (dy / distance) * this.speed;
    }

    // check for direction
    if (Math.abs(dx) >= Math.abs(dy)) {
      // Moving more horizontally than vertically
      if (dx > 0) {
        this.direction = 'right';
      } else {
        this.direction = 'left';
      }
    } else {
      // Moving more vertically than horizontally
      if (dy > 0) {
        this.direction = 'down';
      } else {
        this.direction = 'up';
      }
    }

    this.moving = !(Math.abs(dx) <= 0.1 && Math.abs(dy) <= 0.1);
  }

  randomWander(room) {
    if (this.wanderTarget) return;

    if (this.state === "hunting") {
      const player = {
        x: Math.floor(
          (this.player.x + this.player.width / 2 - this.room.x) / 16,
        ),
        y: Math.floor(
          (this.player.y + this.player.height / 2 - this.room.y) / 16,
        ),
      };

      const enemy = {
        x: Math.floor((this.x - this.room.x) / 16),
        y: Math.floor((this.y - this.room.y) / 16),
      };

      this.wanderTarget = player;
      this.path = aStar(room.enemyMap, enemy, player, 2);
      this.pathIndex = 0;

      return;
    }

    const maxDistance = 5; // max dist from current position
    const tileSize = 16;

    for (let attempt = 0; attempt < 10; attempt++) {
      // limit attempts to find a valid target
      const offsetX =
        Math.floor(Math.random() * (maxDistance * 2 + 1)) - maxDistance;
      const offsetY =
        Math.floor(Math.random() * (maxDistance * 2 + 1)) - maxDistance;

      const targetTileX = Math.floor((this.x - room.x) / tileSize) + offsetX;
      const targetTileY = Math.floor((this.y - room.y) / tileSize) + offsetY;

      if (
        targetTileX >= 0 &&
        targetTileX < room.mapWidth &&
        targetTileY >= 0 &&
        targetTileY < room.mapHeight &&
        room.enemyMap[targetTileY][targetTileX] === 0
      ) {
        this.wanderTarget = {
          x: targetTileX,
          y: targetTileY,
        };

        // pathing
        const start = {
          x: Math.floor((this.x - room.x) / tileSize),
          y: Math.floor((this.y - room.y) / tileSize),
        };
        const goal = this.wanderTarget;

        this.path = aStar(room.enemyMap, start, goal, 1);
        this.pathIndex = 0;
        break;
      }
    }
  }

  checkPlayerVisibility() {
    const MAX_RANGE = 8; // max range to check for player visibility

    const rayStart = {
      x: Math.floor((this.x - this.room.x) / 16),
      y: Math.floor((this.y - this.room.y) / 16),
    };

    const rayEnd = {
      x: Math.floor((this.player.x + this.player.width / 2 - this.room.x) / 16),
      y: Math.floor(
        (this.player.y + this.player.height / 2 - this.room.y) / 16,
      ),
    };

    let res;
    if (Math.hypot(rayStart.x - rayEnd.x, rayStart.y - rayEnd.y) > MAX_RANGE) {
      res = 1;
    } else {
      res = ddaRaycast(
        this.room.enemyMap,
        rayStart.x,
        rayStart.y,
        rayEnd.x,
        rayEnd.y,
      );
    }

    // console.log(rayStart, rayEnd, res);

    if (res === null) {
      this.color = "green"; // visible
      this.state = "hunting";
      this.speed = 0.65; // speed up
      this.wanderDelay = 0; // reset wander delay
    } else {
      this.color = "red"; // not visible
      this.state = "wander";
      this.speed = 0.3; // slow down
      this.wanderDelay = 90; // reset wander delay
    }
  }

  hpCheck() {
    if (this.hp <= 0) {
      this.room.enemyMap[Math.floor((this.y - this.room.y) / 16)][
        Math.floor((this.x - this.room.x) / 16)
      ] = 0;
      this.room.enemies.splice(this.room.enemies.indexOf(this), 1);

      if (this.room.enemies.length <= 0) {
        if (this.levelFunctions.wavesLeft > 0) {
          setTimeout(() => {
            this.levelFunctions.wavesLeft--
            this.levelFunctions.spawnEnemies(this.mapGen.currentRoom)
          },500)
        }
        else {
          this.mapGen.unlockRooms();
          this.mapGen.currentRoom.battleRoomDone = true;
          this.levelFunctions.battling = false;
          this.levelFunctions.wavesLeft = this.levelFunctions.level

          this.levelFunctions.announcer('Room Clear', 2000)
        }
      }
    }
  }

  update(ctx) {
    if (this.wanderDelay > 0) {
      this.wanderDelay--;
    } else {
      // DO the DDA raycasting here to check if the target is visible
      this.checkPlayerVisibility();
      this.randomWander(this.room);
    }
    this.followPath(this.room.enemyMap);
    this.animate()
    this.render(ctx);
    this.hpCheck();
  }

  animate() {
    this.frameCounter++;
    if (this.frameCounter >= this.animationSpeed) {
      this.frameCounter = 0;
      this.frameX = (this.frameX + 1) % 6; // assuming 8 frames per animation
    }

    // set frameY based on direction
    switch (this.direction) {
      case "down":
        this.frameY = 0;
        break;
      case "right":
        this.frameY = 1;
        break;
      case "left":
        this.frameY = 2;
        break;
      case "up":
        this.frameY = 3;
        break;
    }
  }

  render(ctx) {
    if (this.spritesheetRun === null)  return
    const frameWidth = this.spritesheetRun.width / 6;
    const frameHeight = this.spritesheetRun.height / 4;

    if (this.state === 'attacking') {
      ctx.drawImage(
        this.spritesheetAttack,
        this.frameX * frameWidth,
        this.frameY * frameHeight,
        frameWidth,
        frameHeight,
        this.x - frameWidth/2,
        this.y - frameHeight/2 - 5,
        frameWidth,
        frameHeight,
      );
    } else if (!this.moving) {
      ctx.drawImage(
        this.spritesheetIdle,
        this.frameX * frameWidth,
        this.frameY * frameHeight,
        frameWidth,
        frameHeight,
        this.x - frameWidth/2,
        this.y - frameHeight/2 - 5,
        frameWidth,
        frameHeight,
      );
    } else if (this.moving) {
      ctx.drawImage(
        this.spritesheetRun,
        this.frameX * frameWidth,
        this.frameY * frameHeight,
        frameWidth,
        frameHeight,
        this.x - frameWidth/2,
        this.y - frameHeight/2 - 5,
        frameWidth,
        frameHeight,
      );
    }

    // debug
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height,
    );
    // console.log(this.x, this.y);
  }
}
