package com.algorithmrace.visualizer.algorithms.pathfinding;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

public class JPSModel extends PathfindingModel {

  private final PriorityQueue<GridCell> openSet =
      new PriorityQueue<>(Comparator.comparingDouble(GridCell::fCost));

  public JPSModel() {
    super("Jump Point Search");
  }

  private double heuristic(GridCell a, GridCell b) {
    int dx = Math.abs(a.row - b.row);
    int dy = Math.abs(a.col - b.col);
    return Math.max(dx, dy) + (Math.sqrt(2) - 1) * Math.min(dx, dy);
  }

  @Override
  public void step() {
    if (isDone() || openSet.isEmpty()) {
      markDone();
      return;
    }
    GridCell current = openSet.poll();
    if (current == end) {
      reconstructPath(end);
      markDone();
      return;
    }
    if (current.state != CellState.START) {
      current.state = CellState.VISITED;
    }
    addStep();

    List<GridCell> successors = identifySuccessors(current);
    for (GridCell nb : successors) {
      double dist =
          Math.sqrt(Math.pow(current.row - nb.row, 2) + Math.pow(current.col - nb.col, 2));
      double tentativeG = current.gCost + dist;
      if (tentativeG < nb.gCost) {
        nb.gCost = tentativeG;
        nb.hCost = heuristic(nb, end);
        nb.parent = current;
        if (nb.state == CellState.EMPTY || nb.state == CellState.VISITED) {
          nb.state = CellState.FRONTIER;
        }
        if (!openSet.contains(nb)) {
          openSet.add(nb);
        }
      }
    }
  }

  private List<GridCell> identifySuccessors(GridCell current) {
    List<GridCell> successors = new ArrayList<>();
    List<GridCell> neighbors = getPrunedNeighbors(current);
    for (GridCell neighbor : neighbors) {
      int dRow = neighbor.row - current.row;
      int dCol = neighbor.col - current.col;
      GridCell jumpPoint = jump(current.row, current.col, dRow, dCol);
      if (jumpPoint != null) {
        successors.add(jumpPoint);
      }
    }
    return successors;
  }

  private List<GridCell> getPrunedNeighbors(GridCell current) {
    List<GridCell> neighbors = new ArrayList<>();
    if (current.parent == null) {
      for (int dr = -1; dr <= 1; dr++) {
        for (int dc = -1; dc <= 1; dc++) {
          if (dr == 0 && dc == 0) continue;
          if (isValid(current.row + dr, current.col + dc)) {
            if (dr != 0 && dc != 0) {
              if (isValid(current.row + dr, current.col)
                  || isValid(current.row, current.col + dc)) {
                neighbors.add(grid[current.row + dr][current.col + dc]);
              }
            } else {
              neighbors.add(grid[current.row + dr][current.col + dc]);
            }
          }
        }
      }
      return neighbors;
    }

    int dRow = Integer.compare(current.row, current.parent.row);
    int dCol = Integer.compare(current.col, current.parent.col);

    if (dRow != 0 && dCol != 0) {
      boolean vRow = isValid(current.row + dRow, current.col);
      boolean vCol = isValid(current.row, current.col + dCol);
      if (vRow) neighbors.add(grid[current.row + dRow][current.col]);
      if (vCol) neighbors.add(grid[current.row][current.col + dCol]);
      if (vRow || vCol) {
        if (isValid(current.row + dRow, current.col + dCol)) {
          neighbors.add(grid[current.row + dRow][current.col + dCol]);
        }
      }
      if (!isValid(current.row - dRow, current.col) && vCol) {
        if (isValid(current.row - dRow, current.col + dCol)) {
          neighbors.add(grid[current.row - dRow][current.col + dCol]);
        }
      }
      if (!isValid(current.row, current.col - dCol) && vRow) {
        if (isValid(current.row + dRow, current.col - dCol)) {
          neighbors.add(grid[current.row + dRow][current.col - dCol]);
        }
      }
    } else {
      if (dRow != 0) {
        if (isValid(current.row + dRow, current.col)) {
          neighbors.add(grid[current.row + dRow][current.col]);
          if (!isValid(current.row, current.col + 1)) {
            if (isValid(current.row + dRow, current.col + 1)) {
              neighbors.add(grid[current.row + dRow][current.col + 1]);
            }
          }
          if (!isValid(current.row, current.col - 1)) {
            if (isValid(current.row + dRow, current.col - 1)) {
              neighbors.add(grid[current.row + dRow][current.col - 1]);
            }
          }
        }
      } else {
        if (isValid(current.row, current.col + dCol)) {
          neighbors.add(grid[current.row][current.col + dCol]);
          if (!isValid(current.row + 1, current.col)) {
            if (isValid(current.row + 1, current.col + dCol)) {
              neighbors.add(grid[current.row + 1][current.col + dCol]);
            }
          }
          if (!isValid(current.row - 1, current.col)) {
            if (isValid(current.row - 1, current.col + dCol)) {
              neighbors.add(grid[current.row - 1][current.col + dCol]);
            }
          }
        }
      }
    }
    return neighbors;
  }

  private boolean isValid(int r, int c) {
    return r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c].state != CellState.WALL;
  }

  private GridCell jump(int r, int c, int dRow, int dCol) {
    while (true) {
      int nextR = r + dRow;
      int nextC = c + dCol;

      if (!isValid(nextR, nextC)) {
        return null;
      }

      if (dRow != 0 && dCol != 0) {
        if (!isValid(r + dRow, c) && !isValid(r, c + dCol)) {
          return null;
        }
      }

      GridCell nextCell = grid[nextR][nextC];
      if (nextCell == end) {
        return nextCell;
      }

      if (nextCell.state == CellState.EMPTY) {
        nextCell.state = CellState.VISITED;
      }

      if (dRow != 0 && dCol != 0) {
        if ((!isValid(nextR - dRow, nextC) && isValid(nextR - dRow, nextC + dCol))
            || (!isValid(nextR, nextC - dCol) && isValid(nextR + dRow, nextC - dCol))) {
          return nextCell;
        }
        if (jump(nextR, nextC, dRow, 0) != null || jump(nextR, nextC, 0, dCol) != null) {
          return nextCell;
        }
      } else {
        if (dRow != 0) {
          if ((!isValid(nextR, nextC + 1) && isValid(nextR + dRow, nextC + 1))
              || (!isValid(nextR, nextC - 1) && isValid(nextR + dRow, nextC - 1))) {
            return nextCell;
          }
        } else {
          if ((!isValid(nextR + 1, nextC) && isValid(nextR + 1, nextC + dCol))
              || (!isValid(nextR - 1, nextC) && isValid(nextR - 1, nextC + dCol))) {
            return nextCell;
          }
        }
      }
      r = nextR;
      c = nextC;
    }
  }

  @Override
  protected void reconstructPath(GridCell endCell) {
    path.clear();
    GridCell current = endCell;
    while (current != null && current.parent != null) {
      GridCell parent = current.parent;
      int r = current.row;
      int c = current.col;
      int pr = parent.row;
      int pc = parent.col;

      int dRow = Integer.compare(r, pr);
      int dCol = Integer.compare(c, pc);

      while (r != pr || c != pc) {
        path.add(0, grid[r][c]);
        r -= dRow;
        c -= dCol;
      }
      current = parent;
    }
    if (current != null) {
      path.add(0, current);
    }
    pathFound = true;
  }

  @Override
  public void reset() {
    openSet.clear();
    resetStats();
    if (start != null) {
      start.gCost = 0;
      openSet.add(start);
    }
  }
}
