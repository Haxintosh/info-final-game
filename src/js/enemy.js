import { aStar } from "./pathfinder.js";

export class Enemy {
  constructor(room, x, y, width, height, speed) {
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

    this.path = [];
    this.pathIndex = 0;
    this.state = "wander"; // 'idle', 'moving', 'attacking'
    this.wanderTarget = null;
    this.room = room;
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

        this.path = aStar(room.enemyMap, start, goal);
        this.pathIndex = 0;
        break;
      }
    }
  }

  update(ctx) {
    if (this.wanderDelay > 0) {
      this.wanderDelay--;
    } else {
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
    ctx.fillStyle = "red";
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height,
    );
    // console.log(this.x, this.y);
  }
}
