import { aStar } from "./pathfinder.js";
import { ddaRaycast } from "./dda.js";
export class Enemy {
  constructor(room, x, y, width, height, speed, player) {
    this.x = x;
    this.y = y;
    this.width = width; // hitbox width
    this.height = height; // hitbox height
    this.speed = speed || 0.5;

    // animation
    this.spritesheet = null;
    this.frameX = 0;
    this.frameY = 0;
    this.animationSpeed = 5; // frames per animation change
    this.frameCounter = 0;
    this.color = "red"; // default color

    this.path = [];
    this.pathIndex = 0;
    this.state = "wander"; // 'hunting'
    this.wanderTarget = null;
    this.room = room;
    this.wanderDelay = 90; // frames to wait before choosing a new target

    this.player = player;
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
        this.wanderDelay = 90; // frames to wait before choosing a new target
      }
    } else {
      this.x += (dx / distance) * this.speed;
      this.y += (dy / distance) * this.speed;
    }
  }

  randomWander(room) {
    if (this.wanderTarget) return;

    if (this.state === "hunting") {
      const player = {
        x: Math.floor((this.player.x - this.room.x) / 16),
        y: Math.floor((this.player.y - this.room.y) / 16),
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
      x: Math.floor((this.player.x - this.room.x) / 16),
      y: Math.floor((this.player.y - this.room.y) / 16),
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

    console.log(rayStart, rayEnd, res);

    if (res === null) {
      this.color = "green"; // visible
      this.state = "hunting";
    } else {
      this.color = "red"; // not visible
      this.state = "wander";
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
    this.render(ctx);
  }

  render(ctx) {
    // this.frameCounter++;
    // if (this.frameCounter >= this.animationSpeed) {
    //   this.frameCounter = 0;
    //   this.frameX = (this.frameX + 1) % 4;
    // }
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
