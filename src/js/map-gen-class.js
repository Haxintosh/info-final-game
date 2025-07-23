import { Map } from "./map-class.js";
import { audio } from "./audio.js";

export class MapGenerator {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.grid = Array.from({ length: 5 }, () => Array(5).fill(0));
    this.start = {};
    this.end = {};
    this.renderedMap = [];
    this.renderedHalls = [];
    this.renderedBlocks = [];
    this.previousCurrentRoom = null;
    this.currentRoom = null;
    this.currentBlocks = [];

    this.mapInstances = {
      rooms: {},
      halls: {},
      blocks: {},
    };

    // this.generatedLevel = this.generateLevel();

    // DEBUG
    // this.iterationCount = [];
    // this.totalIterations = 0;
  }
  async init(boss, progressCallback = () => {}) {
    this.generateLevel(boss);

    const loadMap = async (path, x = 0, y = 0) => {
      const map = new Map(this.canvas, path, x, y);
      await map.loadMapFromFile(path.replace("spritesheet.png", "map.json"));
      return map;
    };

    const totalMaps = 18;
    let loadedMaps = 0;

    const updateProgress = () => {
      loadedMaps++;
      const progress = Math.round((loadedMaps / totalMaps) * 100);
      progressCallback(progress);
    };

    for (let i = 1; i <= 8; i++) {
      this.mapInstances.rooms[`battle_${i}`] = await loadMap(
        `./map-assets/room_battle_${i}/spritesheet.png`,
      );
      updateProgress();
    }
    // this.mapInstances.rooms.battle = await loadMap(
    //   "./map-assets/room_battle_1/spritesheet.png",
    // );
    // updateProgress();

    this.mapInstances.rooms.start = await loadMap(
      "./map-assets/room_start/spritesheet.png",
    );
    updateProgress();

    this.mapInstances.rooms.end = await loadMap(
      "./map-assets/room_end/spritesheet.png",
    );
    updateProgress();

    this.mapInstances.rooms.boss = await loadMap(
      "./map-assets/room_boss/spritesheet.png",
    );
    updateProgress();

    for (let i = 1; i <= 4; i++) {
      this.mapInstances.rooms[`special_${i}`] = await loadMap(
        `./map-assets/room_special_${i}/spritesheet.png`,
      );
      updateProgress();
    }

    this.mapInstances.halls.horizontal = await loadMap(
      "./map-assets/hall_h/spritesheet.png",
    );
    updateProgress();

    this.mapInstances.halls.vertical = await loadMap(
      "./map-assets/hall_v/spritesheet.png",
    );
    updateProgress();

    this.mapInstances.blocks.horizontalLeft = await loadMap(
      "./map-assets/room_block_h/spritesheet.png",
    );
    updateProgress();

    this.mapInstances.blocks.horizontalRight = await loadMap(
      "./map-assets/room_block_h/spritesheet.png",
    );
    updateProgress();

    this.mapInstances.blocks.verticalTop = await loadMap(
      "./map-assets/room_block_v/spritesheet.png",
    );
    updateProgress();

    this.mapInstances.blocks.verticalBottom = await loadMap(
      "./map-assets/room_block_v/spritesheet.png",
    );
    updateProgress();
  }

  generateLevel(boss) {
    // Reset grid
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        this.grid[y][x] = 0;
      }
    }

    const startRandomness = Math.floor(Math.random() * 4);
    let start = { x: null, y: null };
    let end = { x: null, y: null };

    if (startRandomness === 0) {
      start.x = 1;
      start.y = 1;
      end.x = 3;
      end.y = 3;
    } else if (startRandomness === 1) {
      start.x = 3;
      start.y = 1;
      end.x = 1;
      end.y = 3;
    } else if (startRandomness === 2) {
      start.x = 1;
      start.y = 3;
      end.x = 3;
      end.y = 1;
    } else {
      start.x = 3;
      start.y = 3;
      end.x = 1;
      end.y = 1;
    }
    this.start = { x: start.x, y: start.y };
    this.end = { x: end.x, y: end.y };

    this.grid[start.y][start.x] = 2;
    this.grid[end.y][end.x] = 3;

    let x = start.x;
    let y = start.y;

    const direction = Math.random();

    // Start with horizontal
    if (direction < 0.5) {
      while (x !== end.x) {
        x += x < end.x ? 1 : -1;
        let subtype = Math.ceil(Math.random() * 8) / 10;
        if (this.grid[y][x] === 0) this.grid[y][x] = 1 + subtype;
      }

      while (y !== end.y) {
        y += y < end.y ? 1 : -1;
        let subtype = Math.ceil(Math.random() * 8) / 10;
        if (this.grid[y][x] === 0) this.grid[y][x] = 1 + subtype;
      }
    } else {
      // Start vertical
      while (y !== end.y) {
        y += y < end.y ? 1 : -1;
        let subtype = Math.ceil(Math.random() * 8) / 10;
        if (this.grid[y][x] === 0) this.grid[y][x] = 1 + subtype;
      }

      while (x !== end.x) {
        x += x < end.x ? 1 : -1;
        let subtype = Math.ceil(Math.random() * 8) / 10;
        if (this.grid[y][x] === 0) this.grid[y][x] = 1 + subtype;
      }
    }

    const maxBranchOff = 3;
    let branchOffs = 0;

    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        if (
          Math.floor(this.grid[y][x]) === 1 &&
          branchOffs < maxBranchOff &&
          Math.random() < 1
        ) {
          const side = Math.floor(Math.random() * 4);
          let type = Math.ceil(Math.random() * 3) / 10;
          if (type === 0) type = 0.1;

          if (side === 0 && this.grid[y - 1]?.[x] === 0) {
            // Top
            this.grid[y - 1][x] = 4 + type;
            branchOffs += 1;
          }
          if (side === 1 && this.grid[y + 1]?.[x] === 0) {
            // Down
            this.grid[y + 1][x] = 4 + type;
            branchOffs += 1;
          }
          if (side === 2 && this.grid[y]?.[x - 1] === 0) {
            // Left
            this.grid[y][x - 1] = 4 + type;
            branchOffs += 1;
          }
          if (side === 3 && this.grid[y]?.[x + 1] === 0) {
            // Right
            this.grid[y][x + 1] = 4 + type;
            branchOffs += 1;
          }
        }
      }
    }

    if (boss) {
      this.grid = [
        [0, 0, 0, 0, 0],
        [0, 0, 3, 0, 0],
        [0, 0, 5, 0, 0],
        [0, 0, 2, 0, 0],
        [0, 0, 0, 0, 0],
      ];
      this.start = { x: 2, y: 3 };
      this.end = { x: 2, y: 1 };
    }

    console.log(this.grid);
  }

  drawLayout() {
    this.renderedMap = [];
    this.renderedHalls = [];
    this.renderedBlocks = [];

    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const cell = this.grid[y][x];
        if (cell !== 0) {
          this.drawRoom(
            Math.floor(cell),
            (cell % 1).toFixed(1).substring(2),
            x,
            y,
          );

          // Horizontal hallways
          if (this.grid[y]?.[x + 1] !== undefined) {
            if (this.grid[y][x + 1] !== 0) {
              this.drawHall("h", x, y);
            } else {
              this.drawBlock("hr", x, y);
            }
          }

          // Vertical hallways
          if (this.grid[y + 1]?.[x] !== undefined) {
            if (this.grid[y + 1][x] !== 0) {
              this.drawHall("v", x, y);
            }
          }

          // Blockades
          if (
            this.grid[y]?.[x - 1] === undefined ||
            this.grid[y][x - 1] === 0
          ) {
            this.drawBlock("hl", x, y);
          }
          if (
            this.grid[y]?.[x + 1] === undefined ||
            this.grid[y][x + 1] === 0
          ) {
            this.drawBlock("hr", x, y);
          }
          if (
            this.grid[y - 1]?.[x] === undefined ||
            this.grid[y - 1][x] === 0
          ) {
            this.drawBlock("vt", x, y);
          }
          if (
            this.grid[y + 1]?.[x] === undefined ||
            this.grid[y + 1][x] === 0
          ) {
            this.drawBlock("vb", x, y);
          }
        }
      }
    }
  }

  drawRoom(type, subtype, x, y) {
    let map;
    if (type === 1) {
      map = this.mapInstances.rooms[`battle_${subtype}`].clone();
      // map = this.mapInstances.rooms.battle.clone();
    } else if (type === 2) {
      map = this.mapInstances.rooms.start.clone();
    } else if (type === 3) {
      map = this.mapInstances.rooms.end.clone();
    } else if (type === 4) {
      map = this.mapInstances.rooms[`special_${subtype}`].clone();
    } else if (type === 5) {
      map = this.mapInstances.rooms.boss.clone();
    }

    if (map) {
      map.setPosition(x * 40 * 16, y * 40 * 16);
      this.renderedMap.push(map);
      map.x = x * 40 * 16;
      map.y = y * 40 * 16;
      map.type = type;
      map.subtype = subtype;
      // map.render();
    }
  }

  drawHall(type, x, y) {
    let map;
    if (type === "h") {
      map = this.mapInstances.halls.horizontal.clone();
    } else if (type === "v") {
      map = this.mapInstances.halls.vertical.clone();
    }

    if (map) {
      map.setPosition(
        type === "h" ? x * 40 * 16 + 20 * 16 : x * 40 * 16 + 7 * 16,
        type === "h" ? y * 40 * 16 + 6 * 16 : y * 40 * 16 + 20 * 16,
      );
      this.renderedHalls.push(map);
      // map.render();
    }
  }

  drawBlock(type, x, y, lockdownBlock = false) {
    let map;
    if (type === "hl") {
      map = this.mapInstances.blocks.horizontalLeft.clone();
    } else if (type === "hr") {
      map = this.mapInstances.blocks.horizontalRight.clone();
    } else if (type === "vt") {
      map = this.mapInstances.blocks.verticalTop.clone();
    } else if (type === "vb") {
      map = this.mapInstances.blocks.verticalBottom.clone();
    }

    if (map) {
      map.setPosition(
        type === "hl"
          ? x * 40 * 16
          : type === "hr"
            ? x * 40 * 16 + 19 * 16
            : x * 40 * 16 + 8 * 16,
        type === "hl"
          ? y * 40 * 16 + 7 * 16
          : type === "hr"
            ? y * 40 * 16 + 7 * 16
            : type === "vt"
              ? y * 40 * 16
              : y * 40 * 16 + 19 * 16,
      );
      map.lockdownBlock = lockdownBlock;
      this.renderedBlocks.push(map);
      // map.render();
    }
  }

  drawLevel() {
    this.renderedMap.forEach((map) => {
      map.render();
    });
    this.renderedHalls.forEach((map) => {
      map.render();
    });
    this.renderedBlocks.forEach((map) => {
      map.render();
    });

    // console.log(this.grid);
  }

  lockdownRoom(x, y) {
    this.drawBlock("hl", x, y, true);
    this.drawBlock("hr", x, y, true);
    this.drawBlock("vt", x, y, true);
    this.drawBlock("vb", x, y, true);
  }

  unlockRooms() {
    for (let i = this.renderedBlocks.length - 1; i >= 0; i--) {
      if (this.renderedBlocks[i].lockdownBlock) {
        this.renderedBlocks.splice(i, 1);
      }
    }
  }

  findCurrentRoom(player) {
    let totalIterations = 0;

    let roomFound = false;

    // this.ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    // this.ctx.fillRect(playerX, playerY, 20, 20);

    for (const map of this.renderedMap) {
      // this.ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
      // this.ctx.fillRect(map.x, map.y, map.mapWidth * 16, map.mapHeight * 16);
      totalIterations++;
      if (
        player.x + player.width / 2 >= map.x &&
        player.x + player.width / 2 <= map.x + map.mapWidth * 16 &&
        player.y + player.height / 2 + 4 >= map.y && // player hitbox is slightly offset downwards by 2, i put 4 just ot be safe
        player.y + player.height / 2 + 4 <= map.y + map.mapHeight * 16
      ) {
        this.currentRoom = map;
        roomFound = true;

        if (this.previousCurrentRoom !== this.currentRoom) {
          this.currentBlocks = [];
          this.previousCurrentRoom = this.currentRoom;
        }

        // for (const block of this.renderedBlocks) {
        //   totalIterations++;
        //   if (
        //     block.x >= this.currentRoom.x &&
        //     block.x < this.currentRoom.x + this.currentRoom.mapWidth * 16 &&
        //     block.y >= this.currentRoom.y &&
        //     block.y < this.currentRoom.y + this.currentRoom.mapHeight * 16
        //   ) {
        //     this.currentBlocks.push(block);
        //   }
        // }
        // this.currentBlocks = this.renderedBlocks.filter((block) => {
        //   return (
        //     block.x >= this.currentRoom.x &&
        //     block.x < this.currentRoom.x + this.currentRoom.mapWidth * 16 &&
        //     block.y >= this.currentRoom.y &&
        //     block.y < this.currentRoom.y + this.currentRoom.mapHeight * 16
        //   );
        // });

        break; //continue;
      }
    }

    if (!roomFound) {
      for (const map of this.renderedHalls) {
        totalIterations++;

        if (player.debugMode) {
          this.ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
          this.ctx.fillRect(player.x, player.y, 20, 20);
        }

        if (
          player.x + player.width / 2 >= map.x &&
          player.x + player.width / 2 <= map.x + map.mapWidth * 16 &&
          player.y + player.height / 2 + 4 >= map.y &&
          player.y + player.height / 2 + 4 <= map.y + map.mapHeight * 16
        ) {
          this.currentRoom = map;
          break;
        }
      }
    }

    // console.log(
    //   `Total iterations: ${totalIterations}`,
    //   this.renderedMap.length,
    //   this.renderedHalls.length,
    //   this.renderedBlocks.length,
    // );
    // this.iterationCount.push(totalIterations);
  }

  update() {
    // console.log("Updating map...");
    this.drawLevel();

    // this.totalIterations++;
    // console.log(`Total cycles: ${this.totalIterations}`);
    // if (this.totalIterations > 75 * 30) {
    //   console.clear();
    //   this.totalIterations = 0;
    //   arrayToCSV(this.iterationCount);
    // }
  }
}

// DEBUG UTLILS
function arrayToCSV(a) {
  // array of intergers
  let csv = "";
  for (let i = 0; i < a.length; i++) {
    let toAdd = a[i] + ",";
    if (i === a.length - 1) {
      toAdd = a[i] + "\n";
    }
    csv += toAdd;
  }
  console.log(csv);
  return csv;
}
