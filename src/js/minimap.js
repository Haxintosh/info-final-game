const canvas = document.getElementById("minimap");
const ctx = canvas.getContext("2d");

export function drawMinimap(grid, room) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      const cell = grid[y][x];
      if (cell !== 0) {
        drawRoom(x, y, room);

        // Horizontal hallways
        if (grid[y]?.[x + 1] !== undefined) {
          if (grid[y][x + 1] !== 0) {
            drawHall("h", x, y);
          }
        }

        // Vertical hallways
        if (grid[y + 1]?.[x] !== undefined) {
          if (grid[y + 1][x] !== 0) {
            drawHall("v", x, y);
          }
        }
      }
    }
  }
}

function drawRoom(x, y, room) {
  if (!room) return;

  if (room.x / (40 * 16) === x && room.y / (40 * 16) === y) {
    ctx.fillStyle = "rgba(122,122,122,0.6)";
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.6)";
  }
  ctx.fillRect(x * 40 + 10, y * 40 + 10, 20, 20);
}

function drawHall(type, x, y) {
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  if (type === "h") {
    ctx.fillRect(x * 40 + 20 + 10, y * 40 + 5 + 10, 20, 10);
  }
  if (type === "v") {
    ctx.fillRect(x * 40 + 5 + 10, y * 40 + 20 + 10, 10, 20);
  }
}
