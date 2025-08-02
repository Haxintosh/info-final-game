import { aStar } from "./pathfinder.js";
import { a_star_rs } from "../../pkg/whispers_below";
import { ddaRaycast } from "./dda.js";
import { text } from "./text.js";
import { Projectile, Explosion } from "./guns.js";
import { Vec2 } from "./utils.js";
import { Shard } from "./shard.js";
import { audio, music } from "./audio.js";
export class Enemy {
  constructor(
    room,
    x,
    y,
    width,
    height,
    speed,
    player,
    levelFunctions,
    mapGen,
    spdMultiplier,
    nBulletsMultiplier,
    hp = 10,
    isBoss = false,
  ) {
    this.x = x;
    this.y = y;
    this.width = width; // hitbox width
    this.height = height; // hitbox height
    this.speed = speed || 0.5;

    this.levelFunctions = levelFunctions;
    this.mapGen = mapGen;

    // animation
    this.spritesheetIdle = null;
    this.spritesheetRun = null;
    this.spritesheetAttack = null;
    this.spritesheetDeath = null;

    this.spritesheetBossIdle = null;
    this.spritesheetBossRun = null;
    this.spritesheetBossAttack = null;
    this.spritesheetBossDeath = null;

    this.frameX = 0;
    this.frameY = 0;
    this.animationSpeed = 10; // frames per animation change
    this.frameCounter = 0;
    this.direction = "down";
    this.color = "rgba(255, 0, 0, 0.2)"; // default color

    this.path = [];
    this.pathIndex = 0;
    this.state = "wander"; // 'hunting'
    this.wanderTarget = null;
    this.room = room;
    this.wanderDelay = 90; // frames to wait before choosing a new target

    this.shootDelay = 60; // frames to wait before shooting again
    this.projectiles = [];
    this.projectileSpeed = 2;
    this.projectileDamage = 1;
    this.projectileRange = 1000;
    this.projectileColor = "rgba(132, 28, 180, 1)";
    this.projectileSize = 4;
    this.projectileSprite = new Image();
    this.projectileSprite.src = "./bullets/bullet-enemy.png";
    this.player = player;

    this.effects = [];
    this.effectDuration = 0;

    this.hp = hp;

    this.oldTilePos = { x: null, y: null };
    this.attackLock = false; // attack lock

    this.enemyTypes = ["default", "shotgun", "sniper", "shotgunBig"]; // default enemy type
    this.enemyType =
      this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)];
    // dmg
    this.offCanvas = document.createElement("canvas");
    this.offCanvas.width = 48;
    this.offCanvas.height = 48;
    this.offCtx = this.offCanvas.getContext("2d", { willReadFrequently: true });
    this.dmged = false;

    // modifiers
    this.spdMultiplier = spdMultiplier;
    this.nBulletsMultiplier = nBulletsMultiplier;

    // boss
    this.isBoss = isBoss;
    this.currentAttackPattern = "chaos"; // default attack pattern
    this.currentAttackIndex = 0; // current attack index in the pattern
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

  async loadBossSpritesheetIdle(spritesheetPath) {
    this.spritesheetBossIdle = new Image();
    this.spritesheetBossIdle.src = spritesheetPath;
    return new Promise((resolve, reject) => {
      this.spritesheetBossIdle.onload = () => resolve();
      this.spritesheetBossIdle.onerror = () =>
        reject(new Error("failed to load player spritesheet"));
    });
  }
  async loadBossSpritesheetRun(spritesheetPath) {
    this.spritesheetBossRun = new Image();
    this.spritesheetBossRun.src = spritesheetPath;
    return new Promise((resolve, reject) => {
      this.spritesheetBossRun.onload = () => resolve();
      this.spritesheetBossRun.onerror = () =>
        reject(new Error("failed to load player spritesheet"));
    });
  }
  async loadBossSpritesheetAttack(spritesheetPath) {
    this.spritesheetBossAttack = new Image();
    this.spritesheetBossAttack.src = spritesheetPath;
    return new Promise((resolve, reject) => {
      this.spritesheetBossAttack.onload = () => resolve();
      this.spritesheetBossAttack.onerror = () =>
        reject(new Error("failed to load player spritesheet"));
    });
  }
  async loadBossSpritesheetDeath(spritesheetPath) {
    this.spritesheetBossDeath = new Image();
    this.spritesheetBossDeath.src = spritesheetPath;
    return new Promise((resolve, reject) => {
      this.spritesheetBossDeath.onload = () => resolve();
      this.spritesheetBossDeath.onerror = () =>
        reject(new Error("failed to load player spritesheet"));
    });
  }

  followPath(grid) {
    if (this.state === "dead" || this.attackLock) return;

    if (!this.path || this.path.length === 0) {
      const tileSize = 16;
      const currentTileX = Math.floor((this.x - this.room.x) / tileSize);
      const currentTileY = Math.floor((this.y - this.room.y) / tileSize);

      if (
        this.oldTilePos.x !== currentTileX ||
        this.oldTilePos.y !== currentTileY
      ) {
        if (this.oldTilePos.x !== null && this.oldTilePos.y !== null) {
          this.room.reservedTiles[this.oldTilePos.y][this.oldTilePos.x] = 0;
          // console.log(oldTilePos.x, oldTilePos.y, "UNMARKED");
        }

        this.room.reservedTiles[currentTileY][currentTileX] = 1;
        // console.log(currentTileX, currentTileY, "MARKED");
        this.oldTilePos.x = currentTileX;
        this.oldTilePos.y = currentTileY;
      }

      // console.log("no path");
      this.wanderTarget = null; // reset wander target
      return;
    }

    const tileSize = 16;

    const targetTile = this.path[this.pathIndex];
    const targetX = this.room.x + targetTile.x * tileSize + tileSize / 2;
    const targetY = this.room.y + targetTile.y * tileSize + tileSize / 2;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.speed) {
      this.x = targetX;
      this.y = targetY;
      this.pathIndex++;

      if (this.pathIndex >= this.path.length) {
        for (const tile of this.path) {
          this.room.reservedTiles[tile.y][tile.x] = 0;
          // console.log(tile.x, tile.y, "UNMARKED");
        }

        const currentTileX = Math.floor((this.x - this.room.x) / tileSize);
        const currentTileY = Math.floor((this.y - this.room.y) / tileSize);

        // Mark the new tile as reserved
        this.room.reservedTiles[currentTileY][currentTileX] = 1;
        // console.log(currentTileX, currentTileY, "MARKED");

        this.path = [];
        this.pathIndex = 0;
        this.wanderTarget = null;
      }
    } else {
      if (this.oldTilePos.x === null || this.oldTilePos.y === null) {
        this.oldTilePos.x = Math.floor((this.x - this.room.x) / tileSize);
        this.oldTilePos.y = Math.floor((this.y - this.room.y) / tileSize);
      }
      this.room.reservedTiles[this.oldTilePos.y][this.oldTilePos.x] = 0;
      this.x += (dx / distance) * this.speed;
      this.y += (dy / distance) * this.speed;
      this.oldTilePos.x = Math.floor((this.x - this.room.x) / tileSize);
      this.oldTilePos.y = Math.floor((this.y - this.room.y) / tileSize);
      this.room.reservedTiles[this.oldTilePos.y][this.oldTilePos.x] = 1;
    }

    // Check for direction
    if (Math.abs(dx) >= Math.abs(dy)) {
      // Moving more horizontally than vertically
      if (dx > 0) {
        this.direction = "right";
      } else {
        this.direction = "left";
      }
    } else {
      // Moving more vertically than horizontally
      if (dy > 0) {
        this.direction = "down";
      } else {
        this.direction = "up";
      }
    }

    this.moving = !(Math.abs(dx) <= 0.1 && Math.abs(dy) <= 0.1);
  }

  randomWander(room) {
    if (this.state === "dead" || this.attackLock) return;

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
      let congregateDistance = 2;

      if (this.isBoss) {
        congregateDistance = 4;
      }

      this.wanderTarget = player;
      this.path = aStar(room.reservedTiles, enemy, player, congregateDistance);
      this.pathIndex = 0;

      // console.log(room);
      for (const tile of this.path) {
        room.reservedTiles[tile.y][tile.x] = 1;
      }

      return;
    }

    const maxDistance = 8; // max dist from current position
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
        this.path = aStar(room.reservedTiles, start, goal, 2);
        this.pathIndex = 0;

        for (const tile of this.path) {
          room.reservedTiles[tile.y][tile.x] = 1;
        }
        break;
      }
    }
  }

  randomWanderRs(room) {
    if (this.state === "dead" || this.attackLock) return;

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
      let congregateDistance = 2;

      if (this.isBoss) {
        congregateDistance = 4;
      }

      this.wanderTarget = player;
      this.path = a_star_rs(
        room.reservedTiles,
        enemy,
        player,
        congregateDistance,
      );
      this.pathIndex = 0;

      // console.log(room);
      for (const tile of this.path) {
        room.reservedTiles[tile.y][tile.x] = 1;
      }

      return;
    }

    const maxDistance = 8; // max dist from current position
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
        this.path = a_star_rs(room.reservedTiles, start, goal, 2);
        this.pathIndex = 0;

        for (const tile of this.path) {
          room.reservedTiles[tile.y][tile.x] = 1;
        }
        break;
      }
    }
  }

  checkPlayerVisibility() {
    if (this.state === "dead") return;

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
      this.color = "rgba(0, 255, 0, 0.2)"; // visible
      this.state = "hunting";
      this.speed = 0.65; // speed up
      this.wanderDelay = 0; // reset wander delay
    } else {
      this.color = "rgba(255, 0, 0, 0.2)"; // not visible
      this.state = "wander";
      this.speed = 0.3; // slow down
      this.wanderDelay = 90; // reset wander delay
    }

    if (this.isBoss) {
      this.color = "rgba(0, 255, 0, 0.2)"; // visible
      this.state = "hunting";
      this.speed = 0.7; // speed up
      this.wanderDelay = 0; // reset wander delay
    }
  }

  hpCheck() {
    if (this.state === "dead") return;

    if (this.hp <= 0) {
      for (const tile of this.path) {
        this.room.reservedTiles[tile.y][tile.x] = 0;
      }

      this.state = "dead";
      this.frameX = 0;
      setTimeout(() => {
        this.room.enemies.splice(this.room.enemies.indexOf(this), 1);
        this.levelFunctions.enemiesDefeated.count += 1;

        if (this.room.enemies.length <= 0) {
          if (this.levelFunctions.wavesLeft > 0 && !this.isBoss) {
            setTimeout(() => {
              this.levelFunctions.wavesLeft--;
              this.levelFunctions.spawnEnemies(this.mapGen.currentRoom);
            }, 500);
          } else {
            this.mapGen.unlockRooms();
            this.mapGen.currentRoom.battleRoomDone = true;
            this.levelFunctions.battling = false;
            this.levelFunctions.wavesLeft = this.levelFunctions.level;

            this.levelFunctions.announcer(text.roomClear, 2000);

            // audio
            music.hunted.pause();
            music.boss.pause();
            audio.clear.currentTime = 0;
            audio.clear.play();
          }

          if (this.isBoss) {
            setTimeout(() => {
              document.getElementById("bar-hider").width = "0px";
            }, 1000);
          }
        }

        const exp = Math.ceil(Math.random() * 2) + 1;
        for (let i = 0; i < exp; i++) {
          const shard = new Shard(
            this.x,
            this.y,
            this.player,
            this.levelFunctions.shardsArray,
            this.levelFunctions.shards,
            this.mapGen,
          );
        }
      }, 1000);

      setTimeout(() => {
        // audio
        const death = new Audio("./audio/death.mp3");
        death.volume = audio.enemy;
        death.play();
      }, 300);
    }
  }

  attackPlayer() {
    if (this.state === "dead") return;

    this.shootDelay--;
    if (
      this.state === "hunting" && // hunting
      // Math.hypot(this.x - this.player.x, this.y - this.player.y) < 16 && // in range
      this.shootDelay <= 0 // cooldown
    ) {
      if (this.attackLock) return; // prevent multiple attacks
      this.attackLock = true; // lock attack
      this.frameX = 0; // reset attack animation
      this.frameY = 0; // reset attack animation
      setTimeout(() => {
        if (this.state === "dead") return;
        const origin = new Vec2(this.x, this.y);
        const angle = Math.atan2(
          this.player.y + this.player.height / 2 - this.y,
          this.player.x + this.player.width / 2 - this.x,
        );
        //translate angle to directional vector
        const dir = new Vec2(Math.cos(angle), Math.sin(angle)).normalize();
        // const projectile = new Projectile(
        //   origin,
        //   dir,
        //   this.projectileSpeed,
        //   this.projectileRange,
        //   this.projectileDamage,
        //   this.projectileColor,
        //   this.mapGen.canvas,
        //   this.projectileSprite,
        //   angle,
        // );
        //
        const projectiles = this.enemyAttackTypesGen(
          this.enemyType,
          origin,
          dir,
          angle,
        );

        for (const projectile of projectiles) {
          this.projectiles.push(projectile);
        }

        // this.projectiles.push(projectile);
        this.shootDelay = 60; // reset cooldown
        setTimeout(() => {
          this.attackLock = false;
          if (this.state === "dead") return;
        }, 400);
      }, 500);

      // audio
      const rng = Math.ceil(Math.random() * 4);
      const sound = new Audio(`./audio/enemy-${rng}.mp3`);
      sound.volume = audio.enemy;
      sound.play();
    }

    // if (
    //   attackX < this.player.x + this.player.width &&
    //   attackX + 16 > this.player.x &&
    //   attackY < this.player.y + this.player.height &&
    //   attackY + 16 > this.player.y
    // ) {
    //   this.player.hp -= 1; // damage
    // }
  }

  checkBulletCollision(canvas) {
    if (this.state === "dead") return;

    for (const projectile of this.projectiles) {
      if (!projectile.alive) {
        this.projectiles.splice(this.projectiles.indexOf(projectile), 1);
        continue;
      }
      const bulletHitbox = {
        x: projectile.position.x - this.projectileSize / 2,
        y: projectile.position.y - this.projectileSize / 2,
        width: this.projectileSize,
        height: this.projectileSize,
      };
      const playerHitbox = {
        x: this.player.x + this.player.width / 2 - 5,
        y: this.player.y + this.player.height / 5 + 4,
        width: 10,
        height: 20,
      };

      // ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
      // ctx.fillRect(
      //   playerHitbox.x,
      //   playerHitbox.y,
      //   playerHitbox.width,
      //   playerHitbox.height,
      // );

      // ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      // ctx.fillRect(
      //   bulletHitbox.x,
      //   bulletHitbox.y,
      //   bulletHitbox.width,
      //   bulletHitbox.height,
      // );

      if (
        bulletHitbox.x < playerHitbox.x + playerHitbox.width &&
        bulletHitbox.x + bulletHitbox.width > playerHitbox.x &&
        bulletHitbox.y < playerHitbox.y + playerHitbox.height &&
        bulletHitbox.y + bulletHitbox.height > playerHitbox.y
      ) {
        if (this.player.dashing || this.player.postDash > 0) return;
        console.log(projectile.color);
        const explosion = new Explosion(
          projectile.position.copy(),
          canvas,
          this.room.tweenGroup,
          projectile.color,
        );
        this.room.explosions.push(explosion);
        console.log("player hit");
        this.player.decreaseHp(this.levelFunctions);
        this.projectiles.splice(this.projectiles.indexOf(projectile), 1);
      }
    }
  }

  drawDebugSquare(x, y, room, ctx) {
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fillRect(x * 16 + room.x, y * 16 + room.y, 16, 16);
  }

  enemyAttackTypesGen(type, origin, dir, angle) {
    const enemyAttackTypes = {
      default: {
        speed: 2 * this.spdMultiplier,
        range: 1000,
        damage: 1,
        color: "rgba(132, 28, 180, 1)",
        nProjectiles: 1,
      },

      shotgun: {
        speed: 1 * this.spdMultiplier,
        range: 1000,
        damage: 1,
        color: "rgba(132, 28, 180, 1)",
        nProjectiles: Math.floor(3 * this.nBulletsMultiplier),
        spreadAngle: Math.PI / 6, // 30 degrees
      },

      sniper: {
        speed: 4 * this.spdMultiplier,
        range: 2000,
        damage: 1,
        color: "rgba(132, 28, 180, 1)",
        nProjectiles: 1,
      },

      shotgunBig: {
        speed: 1 * this.spdMultiplier,
        range: 1000,
        damage: 1,
        color: "rgba(132, 28, 180, 1)",
        nProjectiles: Math.floor(5 * this.nBulletsMultiplier), // circle the enemy
        spreadAngle: (Math.PI * 2) / Math.floor(5 * this.nBulletsMultiplier), // 90 degrees
      },
    };

    const bossAttackTypes = {
      default: {
        // 3 homing bullet at the player
        speed: 2 * this.spdMultiplier,
        range: 1000,
        damage: 1,
        color: "rgba(132, 28, 180, 1)",
        nProjectiles: 3,
        spreadAngle: Math.PI / 8,
        type: "homing",
        isMixed: false,
      },

      shotgun: {
        speed: 1 * this.spdMultiplier,
        range: 1000,
        damage: 1,
        color: "rgba(132, 28, 180, 1)",
        nProjectiles: Math.floor(8 * this.nBulletsMultiplier),
        spreadAngle: (Math.PI * 2) / Math.floor(8 * this.nBulletsMultiplier),
        type: "sinusoidal",
        isMixed: false,
      },

      sniper: {
        speed: 3 * this.spdMultiplier,
        range: 2000,
        damage: 1,
        color: "rgba(132, 28, 180, 1)",
        nProjectiles: 2,
        spreadAngle: Math.PI / 10, // 18 degrees
        type: "homing",
        isMixed: false,
      },

      shotgunBig: {
        speed: 1 * this.spdMultiplier,
        range: 1000,
        damage: 1,
        color: "rgba(132, 28, 180, 1)",
        nProjectiles: Math.floor(10 * this.nBulletsMultiplier), // circle the enemy
        spreadAngle: (Math.PI * 2) / Math.floor(10 * this.nBulletsMultiplier), // 90 degrees
        type: "straight",
        isMixed: true,
      },
    };

    const bossAttackPatterns = {
      default: [
        bossAttackTypes.default,
        bossAttackTypes.shotgun,
        bossAttackTypes.sniper,
        bossAttackTypes.shotgunBig,
      ],
      spiral: [
        bossAttackTypes.shotgun,
        bossAttackTypes.sniper,
        bossAttackTypes.shotgunBig,
        bossAttackTypes.default,
      ],
      wave: [
        bossAttackTypes.shotgunBig,
        bossAttackTypes.shotgun,
        bossAttackTypes.default,
        bossAttackTypes.sniper,
      ],
      chaos: [
        bossAttackTypes.default,
        bossAttackTypes.shotgun,
        bossAttackTypes.sniper,
        bossAttackTypes.shotgunBig,
        bossAttackTypes.default,
        bossAttackTypes.sniper,
      ],
    };

    if (this.isBoss) {
      if (bossAttackPatterns[this.currentAttackPattern]) {
        const selectedType =
          bossAttackPatterns[this.currentAttackPattern][
            this.currentAttackIndex
          ];
        let dir = new Vec2(Math.cos(angle), Math.sin(angle)).normalize();
        let dirs = [];
        let angles = [];

        if (selectedType.nProjectiles > 1) {
          const halfSpread =
            ((selectedType.nProjectiles - 1) * selectedType.spreadAngle) / 2;
          for (let i = 0; i < selectedType.nProjectiles; i++) {
            const projectileAngle =
              angle - halfSpread + i * selectedType.spreadAngle;
            angles.push(projectileAngle);
            dirs.push(
              new Vec2(
                Math.cos(projectileAngle),
                Math.sin(projectileAngle),
              ).normalize(),
            );
          }
        } else {
          angles.push(angle);
          dirs.push(dir);
        }

        let projectiles = [];
        let isOther = false;

        for (let i = 0; i < dirs.length; i++) {
          if (selectedType.isMixed && isOther) {
            projectiles.push(
              new Projectile(
                origin,
                dirs[i],
                selectedType.speed,
                selectedType.range,
                selectedType.damage,
                selectedType.color,
                this.mapGen.canvas,
                this.projectileSprite,
                angles[i],
                1.5,
                "sinusoidal",
                // this.tweenGroup,
              ),
            );
            isOther = !isOther;
            continue;
          }
          projectiles.push(
            new Projectile(
              origin,
              dirs[i],
              selectedType.speed,
              selectedType.range,
              selectedType.damage,
              selectedType.color,
              this.mapGen.canvas,
              this.projectileSprite,
              angles[i],
              1.5,
              selectedType.type,
              // this.tweenGroup,
            ),
          );
          isOther = !isOther;
        }

        this.currentAttackIndex++;
        if (
          this.currentAttackIndex >=
          bossAttackPatterns[this.currentAttackPattern].length
        ) {
          this.currentAttackIndex = 0;
        }
        return projectiles;
      }
    } else {
      if (enemyAttackTypes[type]) {
        const selectedType = enemyAttackTypes[type];
        let dir = new Vec2(Math.cos(angle), Math.sin(angle)).normalize();
        let dirs = [];
        let angles = [];

        if (selectedType.nProjectiles > 1) {
          const halfSpread =
            ((selectedType.nProjectiles - 1) * selectedType.spreadAngle) / 2;
          for (let i = 0; i < selectedType.nProjectiles; i++) {
            const projectileAngle =
              angle - halfSpread + i * selectedType.spreadAngle;
            angles.push(projectileAngle);
            dirs.push(
              new Vec2(
                Math.cos(projectileAngle),
                Math.sin(projectileAngle),
              ).normalize(),
            );
          }
        } else {
          angles.push(angle);
          dirs.push(dir);
        }

        let projectiles = [];
        for (let i = 0; i < dirs.length; i++) {
          projectiles.push(
            new Projectile(
              origin,
              dirs[i],
              selectedType.speed,
              selectedType.range,
              selectedType.damage,
              selectedType.color,
              this.mapGen.canvas,
              this.projectileSprite,
              angles[i],
              1.5,
              "straight",
              // this.tweenGroup,
            ),
          );
        }

        return projectiles;
      }
    }
  }

  update(ctx, canvas) {
    if (this.wanderDelay > 0) {
      this.wanderDelay--;
    } else {
      // DO the DDA raycasting here to check if the target is visible
      this.checkPlayerVisibility();
      this.randomWander(this.room);
    }
    this.followPath(this.room.enemyMap);
    this.animate();
    this.render(ctx);
    this.attackPlayer();
    for (const projectile of this.projectiles) {
      projectile.update(16, 1, this.mapGen.currentRoom, this.player);
    }
    this.hpCheck();
    this.checkBulletCollision(canvas);
  }

  updateRs(ctx, canvas) {
    if (this.wanderDelay > 0) {
      this.wanderDelay--;
    } else {
      // DO the DDA raycasting here to check if the target is visible
      this.checkPlayerVisibility();
      this.randomWanderRs(this.room);
    }
    this.followPath(this.room.enemyMap);
    this.animate();
    this.render(ctx);
    this.attackPlayer();
    for (const projectile of this.projectiles) {
      projectile.update(16, 1, this.mapGen.currentRoom, this.player);
    }
    this.hpCheck();
    this.checkBulletCollision(canvas);
  }

  animate() {
    if (this.state !== "dead" || this.frameX < 10) this.frameCounter++;

    if (this.frameCounter >= this.animationSpeed) {
      this.frameCounter = 0;
      if (this.state === "dead") {
        // console.log("PRESET", this.frameX);
        this.frameX = (this.frameX + 1) % 15; // assuming 8 frames per animation
        // console.log("POSTSET", this.frameX);
      } else {
        this.frameX = (this.frameX + 1) % 6; // assuming 8 frames per animation
        // if (this.isBoss) this.frameX = (this.frameX + 1) % 7;
      }
    }

    // set frameY based on direction
    if (this.state === "dead") return;
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
    if (this.spritesheetRun === null) return;

    let frameWidth = this.spritesheetRun.width / 6;
    let frameHeight = this.spritesheetRun.height / 4;
    // if (!this.isBoss) {
    //   frameWidth = this.spritesheetRun.width / 7;
    // }
    if (this.isBoss) {
      frameWidth = 80;
      frameHeight = 80;
      this.offCanvas.width = 80;
      this.offCanvas.height = 80;
      if (this.state === "dead") {
        ctx.drawImage(
          this.spritesheetBossDeath,
          this.frameX * frameWidth,
          0,
          frameWidth,
          frameHeight,
          this.x - frameWidth / 2,
          this.y - frameHeight / 2 - 2,
          frameWidth,
          frameHeight,
        );
        return;
      }

      if (!this.dmged) {
        if (this.attackLock) {
          ctx.drawImage(
            this.spritesheetBossAttack,
            this.frameX * frameWidth,
            this.frameY * frameHeight,
            frameWidth,
            frameHeight,
            this.x - frameWidth / 2,
            this.y - frameHeight / 2 - 2,
            frameWidth,
            frameHeight,
          );
        } else if (!this.moving) {
          ctx.drawImage(
            this.spritesheetBossIdle,
            this.frameX * frameWidth,
            this.frameY * frameHeight,
            frameWidth,
            frameHeight,
            this.x - frameWidth / 2,
            this.y - frameHeight / 2 - 2,
            frameWidth,
            frameHeight,
          );
        } else if (this.moving) {
          ctx.drawImage(
            this.spritesheetBossRun,
            this.frameX * frameWidth,
            this.frameY * frameHeight,
            frameWidth,
            frameHeight,
            this.x - frameWidth / 2,
            this.y - frameHeight / 2 - 2,
            frameWidth,
            frameHeight,
          );
        }
      } else {
        if (this.attackLock) {
          this.offCtx.drawImage(
            this.spritesheetBossAttack,
            this.frameX * frameWidth,
            this.frameY * frameHeight,
            frameWidth,
            frameHeight,
            0,
            0,
            frameWidth,
            frameHeight,
          );
        } else if (!this.moving) {
          this.offCtx.drawImage(
            this.spritesheetBossIdle,
            this.frameX * frameWidth,
            this.frameY * frameHeight,
            frameWidth,
            frameHeight,
            0,
            0,
            frameWidth,
            frameHeight,
          );
        } else if (this.moving) {
          this.offCtx.drawImage(
            this.spritesheetBossRun,
            this.frameX * frameWidth,
            this.frameY * frameHeight,
            frameWidth,
            frameHeight,
            0,
            0,
            frameWidth,
            frameHeight,
          );
        }

        // const imageData = this.offCtx.getImageData(0, 0, frameWidth, frameHeight);
        // const data = imageData.data;
        //
        // for (let i = 0; i < data.length; i += 4) {
        //   const alpha = data[i + 3];
        //   if (alpha > 0) {
        //     data[i] = Math.min(255, data[i]); // R
        //     data[i + 1] *= 0.5;                     // G
        //     data[i + 2] *= 0.5;                     // B
        //   }
        // }
        // this.offCtx.putImageData(imageData, 0, 0);

        this.offCtx.globalCompositeOperation = "source-atop";
        this.offCtx.fillStyle = "rgba(255, 0, 0, 0.3)";
        this.offCtx.fillRect(0, 0, this.offCanvas.width, this.offCanvas.height);
        this.offCtx.globalCompositeOperation = "source-over";

        // this.offCtx.fillStyle = 'red'
        // this.offCtx.fillRect(0, 0, this.offCanvas.width, this.offCanvas.height)

        ctx.drawImage(
          this.offCanvas,
          0,
          0,
          frameWidth,
          frameHeight,
          this.x - frameWidth / 2,
          this.y - frameHeight / 2 - 2,
          frameWidth,
          frameHeight,
        );

        this.offCtx.clearRect(
          0,
          0,
          this.offCanvas.width,
          this.offCanvas.height,
        );
      }
    } else {
      this.offCanvas.width = 48;
      this.offCanvas.height = 48;
      if (this.state === "dead") {
        ctx.drawImage(
          this.spritesheetDeath,
          this.frameX * frameWidth,
          0,
          frameWidth,
          frameHeight,
          this.x - frameWidth / 2,
          this.y - frameHeight / 2 - 2,
          frameWidth,
          frameHeight,
        );
        return;
      }

      if (!this.dmged) {
        if (this.attackLock) {
          ctx.drawImage(
            this.spritesheetAttack,
            this.frameX * frameWidth,
            this.frameY * frameHeight,
            frameWidth,
            frameHeight,
            this.x - frameWidth / 2,
            this.y - frameHeight / 2 - 2,
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
            this.x - frameWidth / 2,
            this.y - frameHeight / 2 - 2,
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
            this.x - frameWidth / 2,
            this.y - frameHeight / 2 - 2,
            frameWidth,
            frameHeight,
          );
        }
      } else {
        if (this.attackLock) {
          this.offCtx.drawImage(
            this.spritesheetAttack,
            this.frameX * frameWidth,
            this.frameY * frameHeight,
            frameWidth,
            frameHeight,
            0,
            0,
            frameWidth,
            frameHeight,
          );
        } else if (!this.moving) {
          this.offCtx.drawImage(
            this.spritesheetIdle,
            this.frameX * frameWidth,
            this.frameY * frameHeight,
            frameWidth,
            frameHeight,
            0,
            0,
            frameWidth,
            frameHeight,
          );
        } else if (this.moving) {
          this.offCtx.drawImage(
            this.spritesheetRun,
            this.frameX * frameWidth,
            this.frameY * frameHeight,
            frameWidth,
            frameHeight,
            0,
            0,
            frameWidth,
            frameHeight,
          );
        }
      }

      // const imageData = this.offCtx.getImageData(0, 0, frameWidth, frameHeight);
      // const data = imageData.data;
      //
      // for (let i = 0; i < data.length; i += 4) {
      //   const alpha = data[i + 3];
      //   if (alpha > 0) {
      //     data[i] = Math.min(255, data[i]); // R
      //     data[i + 1] *= 0.5;                     // G
      //     data[i + 2] *= 0.5;                     // B
      //   }
      // }
      // this.offCtx.putImageData(imageData, 0, 0);

      this.offCtx.globalCompositeOperation = "source-atop";
      this.offCtx.fillStyle = "rgba(255, 0, 0, 0.3)";
      this.offCtx.fillRect(0, 0, this.offCanvas.width, this.offCanvas.height);
      this.offCtx.globalCompositeOperation = "source-over";

      // this.offCtx.fillStyle = 'red'
      // this.offCtx.fillRect(0, 0, this.offCanvas.width, this.offCanvas.height)

      ctx.drawImage(
        this.offCanvas,
        0,
        0,
        frameWidth,
        frameHeight,
        this.x - frameWidth / 2,
        this.y - frameHeight / 2 - 2,
        frameWidth,
        frameHeight,
      );

      this.offCtx.clearRect(0, 0, this.offCanvas.width, this.offCanvas.height);
    }

    // // debug
    // ctx.fillStyle = this.color;
    // ctx.fillRect(
    //   this.x - this.width / 2,
    //   this.y - this.height / 2,
    //   this.width,
    //   this.height,
    // );

    // this.drawPath(ctx);
    //
    // draw reservedTiles
    // for (let y = 0; y < this.room.mapHeight; y++) {
    //   for (let x = 0; x < this.room.mapWidth; x++) {
    //     if (this.room.reservedTiles[y][x] === 1) {
    //       this.drawDebugSquare(x, y, this.room, ctx);
    //     }
    //   }
    // }
    // console.log(this.x, this.y);
  }

  // draw path
  drawPath(ctx) {
    if (this.path) {
      for (let i = 0; i < this.path.length; i++) {
        const tile = this.path[i];
        this.drawDebugSquare(tile.x, tile.y, this.room, ctx);
      }
    }
  }
}
