// Client-side Maze & Layout Generator for high-precision, instant pattern generation
export function generateClientMaze(
  type: string,
  rows: number = 18,
  cols: number = 28,
  start: [number, number] = [2, 2],
  end: [number, number] = [15, 25]
): { walls: boolean[][]; weights: number[][] } {
  const walls: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const weights: number[][] = Array.from({ length: rows }, () => Array(cols).fill(1));

  const [startR, startC] = start;
  const [endR, endC] = end;

  function clearCell(r: number, c: number) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          walls[nr][nc] = false;
        }
      }
    }
  }

  switch (type) {
    case 'Random Walls': {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          walls[r][c] = Math.random() < 0.3;
        }
      }
      break;
    }

    case 'Spiral': {
      let layer = 0;
      while (layer < Math.floor(rows / 2) && layer < Math.floor(cols / 2)) {
        for (let c = layer; c < cols - layer; c++) {
          walls[layer][c] = true;
          walls[rows - 1 - layer][c] = true;
        }
        for (let r = layer; r < rows - layer; r++) {
          walls[r][layer] = true;
          walls[r][cols - 1 - layer] = true;
        }
        const gapR = layer + 1 + Math.floor(Math.random() * Math.max(1, rows - 2 * layer - 2));
        const gapC = layer + 1 + Math.floor(Math.random() * Math.max(1, cols - 2 * layer - 2));
        if (gapR < rows) walls[gapR][layer] = false;
        if (gapC < cols) walls[rows - 1 - layer][gapC] = false;
        if (gapR < rows && cols - 1 - layer >= 0) walls[gapR][cols - 1 - layer] = false;
        if (gapC < cols) walls[layer][gapC] = false;
        layer += 2;
      }
      break;
    }

    case 'Rooms': {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          walls[r][c] = true;
        }
      }
      const numRooms = 5 + Math.floor(Math.random() * 4);
      const roomCenters: [number, number][] = [];

      for (let i = 0; i < numRooms; i++) {
        const rh = 3 + Math.floor(Math.random() * 3);
        const rw = 4 + Math.floor(Math.random() * 4);
        const rr = 1 + Math.floor(Math.random() * Math.max(1, rows - rh - 2));
        const rc = 1 + Math.floor(Math.random() * Math.max(1, cols - rw - 2));

        for (let r = rr; r < Math.min(rows - 1, rr + rh); r++) {
          for (let c = rc; c < Math.min(cols - 1, rc + rw); c++) {
            walls[r][c] = false;
          }
        }
        roomCenters.push([Math.floor(rr + rh / 2), Math.floor(rc + rw / 2)]);
      }

      for (let i = 0; i < roomCenters.length - 1; i++) {
        let [r, c] = roomCenters[i];
        const [targetR, targetC] = roomCenters[i + 1];

        while (c !== targetC) {
          if (r >= 0 && r < rows && c >= 0 && c < cols) walls[r][c] = false;
          c += targetC > c ? 1 : -1;
        }
        while (r !== targetR) {
          if (r >= 0 && r < rows && c >= 0 && c < cols) walls[r][c] = false;
          r += targetR > r ? 1 : -1;
        }
      }
      break;
    }

    case 'Binary Tree': {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          walls[r][c] = true;
        }
      }
      for (let r = 1; r < rows; r += 2) {
        for (let c = 1; c < cols; c += 2) {
          walls[r][c] = false;
          const canGoNorth = r > 1;
          const canGoWest = c > 1;

          if (canGoNorth && canGoWest) {
            if (Math.random() < 0.5) {
              walls[r - 1][c] = false;
            } else {
              walls[r][c - 1] = false;
            }
          } else if (canGoNorth) {
            walls[r - 1][c] = false;
          } else if (canGoWest) {
            walls[r][c - 1] = false;
          }
        }
      }
      break;
    }

    case "Prim's Algorithm": {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          walls[r][c] = true;
        }
      }
      walls[1][1] = false;
      const frontier: [number, number][] = [];
      const dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]];

      function addFrontier(r: number, c: number) {
        for (const [dr, dc] of dirs) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && walls[nr][nc]) {
            frontier.push([nr, nc]);
          }
        }
      }

      addFrontier(1, 1);

      while (frontier.length > 0) {
        const idx = Math.floor(Math.random() * frontier.length);
        const [r, c] = frontier.splice(idx, 1)[0];

        const inNeighbors: [number, number, number, number][] = [];
        for (const [dr, dc] of dirs) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && !walls[nr][nc]) {
            inNeighbors.push([nr, nc, r + dr / 2, c + dc / 2]);
          }
        }

        if (inNeighbors.length > 0) {
          const chosen = inNeighbors[Math.floor(Math.random() * inNeighbors.length)];
          walls[r][c] = false;
          walls[chosen[2]][chosen[3]] = false;
          addFrontier(r, c);
        }
      }
      break;
    }

    case 'Recursive Division': {
      for (let r = 0; r < rows; r++) {
        walls[r][0] = true;
        walls[r][cols - 1] = true;
      }
      for (let c = 0; c < cols; c++) {
        walls[0][c] = true;
        walls[rows - 1][c] = true;
      }

      function divide(minR: number, maxR: number, minC: number, maxC: number) {
        if (maxR - minR < 2 || maxC - minC < 2) return;
        const horizontal = maxR - minR > maxC - minC;

        if (horizontal) {
          const wallR = minR + 1 + Math.floor(Math.random() * Math.floor((maxR - minR) / 2)) * 2;
          for (let c = minC; c <= maxC; c++) walls[wallR][c] = true;
          const gapC = minC + Math.floor(Math.random() * (Math.floor((maxC - minC) / 2) + 1)) * 2;
          walls[wallR][gapC] = false;
          divide(minR, wallR - 1, minC, maxC);
          divide(wallR + 1, maxR, minC, maxC);
        } else {
          const wallC = minC + 1 + Math.floor(Math.random() * Math.floor((maxC - minC) / 2)) * 2;
          for (let r = minR; r <= maxR; r++) walls[r][wallC] = true;
          const gapR = minR + Math.floor(Math.random() * (Math.floor((maxR - minR) / 2) + 1)) * 2;
          walls[gapR][wallC] = false;
          divide(minR, maxR, minC, wallC - 1);
          divide(minR, maxR, wallC + 1, maxC);
        }
      }

      divide(1, rows - 2, 1, cols - 2);
      break;
    }

    case 'Cellular Automata': {
      let currentWalls = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => Math.random() < 0.45)
      );

      for (let step = 0; step < 4; step++) {
        const next = Array.from({ length: rows }, () => Array(cols).fill(false));
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || currentWalls[nr][nc]) {
                  count++;
                }
              }
            }
            next[r][c] = count >= 5 || r === 0 || c === 0 || r === rows - 1 || c === cols - 1;
          }
        }
        currentWalls = next;
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          walls[r][c] = currentWalls[r][c];
        }
      }
      break;
    }

    case 'Weighted Terrain Map': {
      // Clear all walls for weighted terrain map
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          walls[r][c] = false;
        }
      }

      const terrainTypes = [3, 5, 8, 15]; // Mud, Water, Forest, Mountain
      const numClusters = 6 + Math.floor(Math.random() * 5);

      for (let i = 0; i < numClusters; i++) {
        const centerR = Math.floor(Math.random() * rows);
        const centerC = Math.floor(Math.random() * cols);
        const radius = 2 + Math.floor(Math.random() * 4);
        const w = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];

        for (let r = Math.max(0, centerR - radius); r <= Math.min(rows - 1, centerR + radius); r++) {
          for (let c = Math.max(0, centerC - radius); c <= Math.min(cols - 1, centerC + radius); c++) {
            if (Math.hypot(r - centerR, c - centerC) <= radius) {
              weights[r][c] = w;
            }
          }
        }
      }
      break;
    }

    default: // Recursive Backtracker
    case 'Recursive Backtracker': {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          walls[r][c] = true;
        }
      }
      const sr = 1;
      const sc = 1;
      walls[sr][sc] = false;
      const stack: [number, number][] = [[sr, sc]];
      const dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]];

      while (stack.length > 0) {
        const [r, c] = stack[stack.length - 1];
        const neighbors: [number, number, number, number][] = [];

        for (const [dr, dc] of dirs) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && walls[nr][nc]) {
            neighbors.push([nr, nc, r + dr / 2, c + dc / 2]);
          }
        }

        if (neighbors.length === 0) {
          stack.pop();
        } else {
          const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
          walls[chosen[0]][chosen[1]] = false;
          walls[chosen[2]][chosen[3]] = false;
          stack.push([chosen[0], chosen[1]]);
        }
      }
      break;
    }
  }

  clearCell(startR, startC);
  clearCell(endR, endC);

  return { walls, weights };
}
