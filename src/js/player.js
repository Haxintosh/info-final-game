import * as UTILS from "./utils.js";

export class Player {
  constructor(canvas, x, y, width, height, speed = 2, mapGen) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.mapGen = mapGen;

    // movement states
    this.direction = "down"; // 'up', 'down', 'left', 'right'
    this.moving = false;

    // anims
    this.spritesheet = null;
    this.spritesheet2 = null;
    this.frameX = 0;
    this.frameY = 0;
    this.animationSpeed = 3; // frames per animation change
    this.frameCounter = 0;

    // collision
    this.hitbox = {};

    // movement keys
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
    };

    // lock player
    this.movementLocked = false;

    // health
    this.maxHp = 5;
    this.hp = this.maxHp;

    // weapon
    this.angle = 0
    this.radiusX = 20
    this.radiusY = 20
    this.weaponSprite = new Image();
    this.weaponSprite.src = '../../weapon.png';
    this.weaponTargetX = 0
    this.weaponTargetY = 0

    // debug
    this.debugMode = false;

    // gun
    this.gun = null;
  }

  async loadSpritesheet(spritesheetPath) {
    this.spritesheet = new Image();
    this.spritesheet.src = spritesheetPath;
    return new Promise((resolve, reject) => {
      this.spritesheet.onload = () => resolve();
      this.spritesheet.onerror = () =>
        reject(new Error("failed to load player spritesheet"));
    });
  }

  async loadSpritesheet2(spritesheetPath) {
    this.spritesheet2 = new Image();
    this.spritesheet2.src = spritesheetPath;
    return new Promise((resolve, reject) => {
      this.spritesheet2.onload = () => resolve();
      this.spritesheet2.onerror = () =>
        reject(new Error("failed to load player spritesheet"));
    });
  }

  handleKeyDown(e) {
    switch (e.code) {
      case "ArrowUp":
      case "KeyW":
        this.keys.up = true;
        break;
      case "ArrowDown":
      case "KeyS":
        this.keys.down = true;
        break;
      case "ArrowLeft":
      case "KeyA":
        this.keys.left = true;
        break;
      case "ArrowRight":
      case "KeyD":
        this.keys.right = true;
        break;
    }
  }

  handleKeyUp(e) {
    switch (e.code) {
      case "ArrowUp":
      case "KeyW":
        this.keys.up = false;
        break;
      case "ArrowDown":
      case "KeyS":
        this.keys.down = false;
        break;
      case "ArrowLeft":
      case "KeyA":
        this.keys.left = false;
        break;
      case "ArrowRight":
      case "KeyD":
        this.keys.right = false;
        break;
    }
  }

  update(map, blocks) {
    if (!this.movementLocked) this.movement(map, blocks);
    this.animate();
    this.render();
  }

  movement(map, blocks) {
    // check if moving
    this.moving =
      this.keys.up || this.keys.down || this.keys.left || this.keys.right;

    // old position for collision resolution
    const oldX = this.x;
    const oldY = this.y;

    // movement
    let dx = 0;
    let dy = 0;

    if (this.keys.up) {
      dy -= this.speed;
      this.direction = "up";
    }
    if (this.keys.down) {
      dy += this.speed;
      this.direction = "down";
    }
    if (this.keys.left) {
      dx -= this.speed;
      this.direction = "left";
    }
    if (this.keys.right) {
      dx += this.speed;
      this.direction = "right";
    }

    // normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const normalizer = 1 / Math.sqrt(2);
      dx *= normalizer;
      dy *= normalizer;
    }

    if (dx !== 0) {
      this.x += dx;

      // check collision on x
      if (this.checkCollisionWithMap(map, blocks)) {
        this.x = oldX; // restore old x
      }
    }

    if (dy !== 0) {
      this.y += dy;

      // check collision on y
      if (this.checkCollisionWithMap(map, blocks)) {
        this.y = oldY; // restore old y
      }
    }
  }

  checkCollisionWithMap(map, blocks) {
    this.hitbox = {
      x: this.x + this.width/2 - 5,
      y: this.y + this.height/2 + 4,
      width: 10,
      height: 10,
    };

    // check collision with the four corners of the hitbox
    const positions = [
      { x: this.hitbox.x, y: this.hitbox.y },
      { x: this.hitbox.x + this.hitbox.width, y: this.hitbox.y },
      { x: this.hitbox.x, y: this.hitbox.y + this.hitbox.height },
      {
        x: this.hitbox.x + this.hitbox.width,
        y: this.hitbox.y + this.hitbox.height,
      },
    ];

    // adjust positions for map offset
    const mapPositions = positions.map((pos) => ({
      x: pos.x - map.x,
      y: pos.y - map.y,
    }));

    for (const pos of mapPositions) {
      const tile = map.getTileAt(pos.x, pos.y);
      if (tile && tile.collidable) {
        return true;
      }
    }

    // blocks
    for (const block of blocks) {
      if (
        block.x >= this.mapGen.currentRoom.x &&
        block.x <
          this.mapGen.currentRoom.x + this.mapGen.currentRoom.mapWidth * 16 &&
        block.y >= this.mapGen.currentRoom.y &&
        block.y <
          this.mapGen.currentRoom.y + this.mapGen.currentRoom.mapHeight * 16
      ) {
        const blockPositions = positions.map((pos) => ({
          x: pos.x - block.x,
          y: pos.y - block.y,
        }));

        for (const pos of blockPositions) {
          const tile = block.getTileAt(pos.x, pos.y);
          if (tile && tile.collidable) {
            return true;
          }
        }
      }
    }

    return false;
  }

  animate() {
    // animation
    this.frameCounter++;
    if (this.frameCounter >= this.animationSpeed) {
      this.frameCounter = 0;
      this.frameX = (this.frameX + 1) % 8; // assuming 8 frames per animation
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

    if (this.gun) {
      this.gun.updateProjectiles(16, 1);
    }
  }

  render() {
    if (!this.spritesheet || !this.spritesheet.complete) return;

    // this.fillStyle = "black";
    // this.ctx.fillRect(this.x, this.y, this.width, this.height);
    // this.ctx.fillStyle = "white";
    const frameWidth = this.spritesheet.width / 8; // 8 columns of frames
    const frameHeight = this.spritesheet.height / 4; // 4 rows of frames (up, down, left, right)

    if (!this.moving)
      this.ctx.drawImage(
        this.spritesheet,
        this.frameX * frameWidth,
        this.frameY * frameHeight,
        frameWidth,
        frameHeight,
        this.x,
        this.y,
        this.width,
        this.height,
      );
    else
      this.ctx.drawImage(
        this.spritesheet2,
        this.frameX * frameWidth,
        this.frameY * frameHeight,
        frameWidth,
        frameHeight,
        this.x,
        this.y,
        this.width,
        this.height,
      );

    // weapon
    const a = this.radiusX;
    const b = this.radiusY;

    const x = this.getCenterX() + Math.cos(this.angle) * a;
    const y = this.getCenterY() + Math.sin(this.angle) * b;

    const dx = this.weaponTargetX - x;
    const dy = this.weaponTargetY - y;
    const rotation = Math.atan2(dy, dx);

    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(this.angle);
    this.ctx.drawImage(this.weaponSprite, -this.weaponSprite.width / 2, -this.weaponSprite.height / 2);
    this.ctx.restore();

    // draw collision box in debug mode
    if (this.debugMode) {
      this.ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
      this.ctx.fillRect(
        this.hitbox.x,
        this.hitbox.y,
        this.hitbox.width,
        this.hitbox.height,
      );
    }
  }

  // get center position of player (camera)
  getCenterX() {
    return this.x + this.width / 2;
  }

  getCenterY() {
    return this.y + this.height / 2;
  }

  // check if player is facing a specific position
  isFacing(x, y) {
    const centerX = this.getCenterX();
    const centerY = this.getCenterY();

    switch (this.direction) {
      case "up":
        return y < centerY && Math.abs(x - centerX) < Math.abs(y - centerY);
      case "down":
        return y > centerY && Math.abs(x - centerX) < Math.abs(y - centerY);
      case "left":
        return x < centerX && Math.abs(y - centerY) < Math.abs(x - centerX);
      case "right":
        return x > centerX && Math.abs(y - centerY) < Math.abs(x - centerX);
    }
    return false;
  }

  // get tile position the player is currently facing
  getFacingTile(map) {
    if (!map) return;
    const centerX = this.getCenterX() - map.x;
    const centerY = this.getCenterY() - map.y;
    let tileX = Math.floor(centerX / map.tileSize);
    let tileY = Math.floor(centerY / map.tileSize);

    // adjust tile coordinates based on direction
    switch (this.direction) {
      case "up":
        tileY--;
        break;
      case "down":
        tileY++;
        break;
      case "left":
        tileX--;
        break;
      case "right":
        tileX++;
        break;
    }

    if (
      tileX < 0 ||
      tileX >= map.mapWidth ||
      tileY < 0 ||
      tileY >= map.mapHeight
    ) {
      return null;
    }

    return { x: tileX, y: tileY };
  }

  decreaseHp() {
    this.hp--;

    const hearts = document.querySelectorAll(".heart");

    for (let i = hearts.length - 1; i >= 0; i--) {
      const heart = hearts[i];
      if (heart.src.includes("/heart.png")) {
        heart.src = "/heart-dead.png";
        break; // stops after breaking one heart
      }
    }

    // dead
    if (this.hp <= 0) {
      this.movementLocked = true;
    }
  }

  shootGun(angle) {
    if (!this.gun) {
      console.error("No gun! Visit America!");
      return;
    }

    const startV = new UTILS.Vec2(
      this.x + this.width / 2,
      this.y + this.height / 2,
    );

    this.gun.shoot(startV, angle);
  }

  assignGun(gun) {
    this.gun = gun;
    this.gun.assignCanvas(this.canvas);
  }
}
