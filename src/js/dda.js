export function ddaRaycast(grid, startX, startY, endX, endY) {
  const dx = ex - x;
  const dy = ey - y;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));

  if (steps === 0) {
    return grid[y][x] !== 0 ? [x, y] : null;
  }

  const xInc = dx / steps;
  const yInc = dy / steps;

  let rayX = x + 0.5;
  let rayY = y + 0.5;

  for (let i = 0; i <= steps; i++) {
    const gridX = Math.floor(rayX);
    const gridY = Math.floor(rayY);

    // bounds
    if (
      gridY >= 0 &&
      gridY < grid.length &&
      gridX >= 0 &&
      gridX < grid[0].length
    ) {
      if (grid[gridY][gridX] !== 0) {
        return [gridX, gridY];
      }
    } else {
      break; // THE OUTSIDERS
    }

    rayX += xInc;
    rayY += yInc;
  }

  return null; // no matches on tinder moment
}

// tests
// const grid = [
//   [0, 0, 0, 0, 0],
//   [0, 0, 1, 1, 0],
//   [0, 0, 1, 0, 0],
//   [0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0],
// ];
//
// console.log(ddaRaycast(grid, 0, 0, 4, 4));
