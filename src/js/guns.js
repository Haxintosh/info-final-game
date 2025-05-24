import * as UTILS from "./utils";

export class Weapon {
  constructor(
    name,
    damage,
    speed,
    range,
    type,
    cost,
    image,
    desc,
    projectileColor,
    projectilePath,
    spread = 0,
    spreadAngle = 0.5,
    numProjectiles = 1,
    magSize = 10,
    reloadTime = 500, // ms
  ) {
    this.name = name;
    this.damage = damage;
    this.speed = speed;
    this.range = range;
    this.type = type;
    this.cost = cost;
    this.image = image;
    this.desc = desc;
    this.projectileColor = projectileColor;
    this.projectileSprite = new Image();
    this.projectileSprite.src = projectilePath;
    this.spreadAngle = spreadAngle;
    this.numProjectiles = numProjectiles;
    this.magSize = magSize;
    this.reloadTime = reloadTime;
    this.currentAct = "ready";
    // for in game use
    this.ammo = magSize;

    // rendering
    this.canvas = null;

    // timing properties
    this.lastFired = 0;
    this.lastReloaded = 0;

    // proj
    this.projectiles = [];
  }

  shoot(origin, angle) {
    // origin: Vec2, angle: number (in radians)
    if (Date.now() - this.lastFired < 500 / this.speed) {
      console.log("cooldown");
      this.currentAct = "cooldown";
      return;
    }

    this.currentAct = "ready";

    // calculate direction from angle
    let dir = new UTILS.Vec2(Math.cos(angle), Math.sin(angle)).normalize();
    let dirs = [];
    let angles = [];

    if (this.numProjectiles > 1) {
      const halfSpread = ((this.numProjectiles - 1) * this.spreadAngle) / 2;
      for (let i = 0; i < this.numProjectiles; i++) {
        const projectileAngle = angle - halfSpread + i * this.spreadAngle;
        angles.push(projectileAngle);
        dirs.push(
          new UTILS.Vec2(
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
          this.speed,
          this.range,
          this.damage / this.numProjectiles,
          this.projectileColor,
          this.canvas,
          this.projectileSprite,
          angles[i],
        ),
      );
    }

    this.ammo--;
    this.projectiles = this.projectiles.concat(projectiles);
    this.lastFired = Date.now();
    return projectiles;
  }

  reload() {
    return;
    if (this.ammo == this.magSize) {
      console.log("Magazine is already full!");
      this.currentAct = "ready";
      return;
    }

    if (Date.now() - this.lastReloaded < this.reloadTime) {
      console.log("Reloading...");
      this.currentAct = "reloading";
      return;
    }

    this.lastReloaded = Date.now();
    this.ammo = this.magSize;
  }

  cleanProjectilesArray() {
    this.projectiles = this.projectiles.filter((p) => p.alive);
  }

  updateProjectiles(tileWidth, scale, currentMap) {
    // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < this.projectiles.length; i++) {
      this.projectiles[i].update(tileWidth, scale, currentMap);
    }
    this.cleanProjectilesArray();
  }

  assignCanvas(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d");
  }
}

export class Projectile {
  constructor(
    origin,
    direction,
    speed,
    range,
    damage,
    color,
    canvas,
    sprite,
    angle,
    size = 1.5,
  ) {
    this.origin = origin;
    this.position = origin.copy();
    this.direction = direction;
    this.speed = speed;
    this.range = range;
    this.damage = damage;
    this.color = color;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.alive = true;
    this.sprite = sprite;
    this.size = size;
    this.angle = angle;
  }

  update(tileWidth, scale, currentMap) {
    if (!this.alive) return;
    this.position = this.position.add(
      this.direction.scale((this.speed * 10) / (tileWidth * scale)),
    );

    // check if projectile has reached max range
    if (
      this.origin.distance(this.position) * tileWidth * scale >
      this.range * 2
    ) {
      this.alive = false;
    }
    this.checkCollisionWithMap(currentMap);
    // console.log(this.origin.distance(this.position));
    this.draw();
  }

  draw() {
    if (!this.ctx) return;
    if (!this.alive) return;

    this.ctx.save();

    this.ctx.translate(this.position.x, this.position.y);

    this.ctx.rotate(this.angle);

    this.ctx.drawImage(
      this.sprite,
      -this.sprite.width / 2,
      -this.sprite.height / 2,
      this.sprite.width*0.75,
      this.sprite.height*0.75,
    );

    this.ctx.restore();
  }

  checkCollisionWithMap(room) {
    const tilePos = {
      x: Math.floor((this.position.x - room.x) / 16),
      y: Math.floor((this.position.y - room.y) / 16),
    };

    // console.log(tilePos);

    try {
      if (room.enemyMap[tilePos.y][tilePos.x] === 1) {
        this.alive = false;
        console.log("hit WALL");
        // handle collision effect here
      }
    } catch (error) {
      // console.log(error);
      //
    }
    // if (room.enemyMap[tilePos.y][tilePos.x] === 1) {
    //   this.alive = false;
    //   console.log("hit WALL");
    //   // handle collision effect here

    //   return true;
    // }
  }
}

// deprecated in favour of draw in tilemap
// draw() {
//   if (!this.ctx) return;
//   if (!this.alive) return;
//   this.ctx.beginPath();
//   this.ctx.arc(
//     this.position.x + this.offsetX,
//     this.position.y + this.offsetY,
//     8,
//     0,
//     2 * Math.PI,
//   );
//   this.ctx.fillStyle = this.color;
//   this.ctx.fill();
// }
export const starterWeapons = [
  new Weapon(
    "Pistol",
    15, // damage
    3, // speed
    500, // range
    "handgun", // type
    100, // cost
    "0_16", // image
    "A reliable semi-automatic handgun. Balanced and easy to use.", // desc
    "#FFD700", // projectileColor
    0, // spread
    0, // spreadAngle
    1, // numProjectiles
    12, // magSize
    1000, // reloadTime
  ),
  new Weapon(
    "Shotgun",
    8, // damage per pellet
    5, // speed
    1000, // range
    "shotgun", // type
    300, // cost
    "1_32", // image
    "Powerful at close range, spreads projectiles for maximum damage.", // desc
    "#FF4500", // projectileColor
    "../../bullets/bullet-blood.png",
    1, // spread
    0.2, // spreadAngle
    8, // numProjectiles
    6, // magSize
    1500, // reloadTime
  ),
  new Weapon(
    "Assault Rifle",
    10, // damage
    5, // speed
    600, // range
    "rifle", // type
    500, // cost
    "2_32", // image
    "A versatile automatic rifle with a high fire rate.", // desc
    "#32CD32", // projectileColor
    0, // spread
    0.1, // spreadAngle
    1, // numProjectiles
    30, // magSize
    2000, // reloadTime
  ),
  new Weapon(
    "Sniper Rifle",
    50, // damage
    1, // speed
    1000, // range
    "rifle", // type
    800, // cost
    "0_48", // image
    "A high-powered rifle designed for long-range precision.", // desc
    "#0000FF", // projectileColor
    0, // spread
    0, // spreadAngle
    1, // numProjectiles
    5, // magSize
    2500, // reloadTime
  ),
  new Weapon(
    "SMG",
    8, // damage
    8, // speed
    400, // range
    "handgun", // type
    400, // cost
    "7_32", // image
    "A compact submachine gun with a high rate of fire.", // desc
    "#FFFF00", // projectileColor
    2, // spread
    0.2, // spreadAngle
    1, // numProjectiles
    25, // magSize
    1500, // reloadTime
  ),
];
