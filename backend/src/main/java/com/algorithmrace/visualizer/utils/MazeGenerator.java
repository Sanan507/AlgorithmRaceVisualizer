package com.algorithmrace.visualizer.utils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public final class MazeGenerator {
  // Thread-safe: each thread gets its own Random instance

  private MazeGenerator() {}

  public enum MazeType {
    RECURSIVE_BACKTRACKER,
    RANDOM_WALLS,
    SPIRAL,
    ROOMS,
    BINARY_TREE,
    PRIM,
    RECURSIVE_DIVISION,
    CELLULAR_AUTOMATA,
    WEIGHTED_TERRAIN_MAP
  }

  public static boolean[][] generate(
      int rows, int cols, int startRow, int startCol, int endRow, int endCol, MazeType type) {
    boolean[][] walls =
        switch (type) {
          case RECURSIVE_BACKTRACKER -> recursiveBacktracker(rows, cols);
          case RANDOM_WALLS -> randomWalls(rows, cols, 0.30);
          case SPIRAL -> spiral(rows, cols);
          case ROOMS -> rooms(rows, cols);
          case BINARY_TREE -> binaryTree(rows, cols);
          case PRIM -> prims(rows, cols);
          case RECURSIVE_DIVISION -> recursiveDivision(rows, cols);
          case CELLULAR_AUTOMATA -> cellularAutomata(rows, cols);
          case WEIGHTED_TERRAIN_MAP -> new boolean[rows][cols]; // Terrain maps rely on weights, not walls
        };
    clearArea(walls, startRow, startCol, rows, cols);
    clearArea(walls, endRow, endCol, rows, cols);
    return walls;
  }

  public static int[][] generateWeights(int rows, int cols, MazeType type) {
    int[][] weights = new int[rows][cols];
    for (int r = 0; r < rows; r++) {
      for (int c = 0; c < cols; c++) {
        weights[r][c] = 1;
      }
    }

    if (type == MazeType.WEIGHTED_TERRAIN_MAP) {
      ThreadLocalRandom rng = ThreadLocalRandom.current();
      int[] terrainTypes = new int[] {3, 5, 8, 15}; // Mud, Water, Forest, Mountain
      int numClusters = 6 + rng.nextInt(5);

      for (int i = 0; i < numClusters; i++) {
        int centerR = rng.nextInt(rows);
        int centerC = rng.nextInt(cols);
        int radius = 2 + rng.nextInt(4);
        int w = terrainTypes[rng.nextInt(terrainTypes.length)];

        for (int r = Math.max(0, centerR - radius); r <= Math.min(rows - 1, centerR + radius); r++) {
          for (int c = Math.max(0, centerC - radius); c <= Math.min(cols - 1, centerC + radius); c++) {
            if (Math.hypot(r - centerR, c - centerC) <= radius) {
              weights[r][c] = w;
            }
          }
        }
      }
    }
    return weights;
  }

  private static boolean[][] recursiveBacktracker(int rows, int cols) {
    boolean[][] walls = new boolean[rows][cols];
    for (int r = 0; r < rows; r++) {
      for (int c = 0; c < cols; c++) {
        walls[r][c] = true;
      }
    }
    int sr = 1;
    int sc = 1;
    walls[sr][sc] = false;
    List<int[]> stack = new ArrayList<>();
    stack.add(new int[] {sr, sc});
    while (!stack.isEmpty()) {
      int[] current = stack.get(stack.size() - 1);
      int r = current[0];
      int c = current[1];
      List<int[]> neighbors = new ArrayList<>();
      int[][] dirs = {{-2, 0}, {2, 0}, {0, -2}, {0, 2}};
      for (int[] d : dirs) {
        int nr = r + d[0];
        int nc = c + d[1];
        if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && walls[nr][nc]) {
          neighbors.add(new int[] {nr, nc, r + d[0] / 2, c + d[1] / 2});
        }
      }
      if (neighbors.isEmpty()) {
        stack.remove(stack.size() - 1);
      } else {
        Collections.shuffle(neighbors, ThreadLocalRandom.current());
        int[] chosen = neighbors.get(0);
        walls[chosen[0]][chosen[1]] = false;
        walls[chosen[2]][chosen[3]] = false;
        stack.add(new int[] {chosen[0], chosen[1]});
      }
    }
    return walls;
  }

  private static boolean[][] randomWalls(int rows, int cols, double density) {
    boolean[][] walls = new boolean[rows][cols];
    for (int r = 0; r < rows; r++) {
      for (int c = 0; c < cols; c++) {
        walls[r][c] = ThreadLocalRandom.current().nextDouble() < density;
      }
    }
    return walls;
  }

  private static boolean[][] spiral(int rows, int cols) {
    boolean[][] walls = new boolean[rows][cols];
    int layer = 0;
    boolean toggle = true;
    while (layer < rows / 2 && layer < cols / 2) {
      if (toggle) {
        for (int c = layer; c < cols - layer; c++) {
          walls[layer][c] = true;
          walls[rows - 1 - layer][c] = true;
        }
        for (int r = layer; r < rows - layer; r++) {
          walls[r][layer] = true;
          walls[r][cols - 1 - layer] = true;
        }
        int gapRow =
            layer + 1 + ThreadLocalRandom.current().nextInt(Math.max(1, rows - 2 * layer - 2));
        int gapCol =
            layer + 1 + ThreadLocalRandom.current().nextInt(Math.max(1, cols - 2 * layer - 2));
        if (gapRow < rows) {
          walls[gapRow][layer] = false;
        }
        if (gapCol < cols) {
          walls[rows - 1 - layer][gapCol] = false;
        }
        if (gapRow < rows && cols - 1 - layer >= 0) {
          walls[gapRow][cols - 1 - layer] = false;
        }
        if (gapCol < cols) {
          walls[layer][gapCol] = false;
        }
      }
      layer += 2;
      toggle = !toggle;
    }
    return walls;
  }

  private static boolean[][] rooms(int rows, int cols) {
    boolean[][] walls = new boolean[rows][cols];
    for (int r = 0; r < rows; r++) {
      for (int c = 0; c < cols; c++) {
        walls[r][c] = true;
      }
    }
    ThreadLocalRandom rng = ThreadLocalRandom.current();
    int numRooms = 5 + rng.nextInt(4);
    List<int[]> roomCenters = new ArrayList<>();
    for (int i = 0; i < numRooms; i++) {
      int rh = 3 + rng.nextInt(3);
      int rw = 4 + rng.nextInt(4);
      int rr = 1 + rng.nextInt(Math.max(1, rows - rh - 2));
      int rc = 1 + rng.nextInt(Math.max(1, cols - rw - 2));
      for (int r = rr; r < Math.min(rows - 1, rr + rh); r++) {
        for (int c = rc; c < Math.min(cols - 1, rc + rw); c++) {
          walls[r][c] = false;
        }
      }
      roomCenters.add(new int[] {rr + rh / 2, rc + rw / 2});
    }
    for (int i = 0; i < roomCenters.size() - 1; i++) {
      int[] a = roomCenters.get(i);
      int[] b = roomCenters.get(i + 1);
      int r = a[0];
      int c = a[1];
      while (c != b[1]) {
        if (r >= 0 && r < rows && c >= 0 && c < cols) {
          walls[r][c] = false;
        }
        c += b[1] > c ? 1 : -1;
      }
      while (r != b[0]) {
        if (r >= 0 && r < rows && c >= 0 && c < cols) {
          walls[r][c] = false;
        }
        r += b[0] > r ? 1 : -1;
      }
    }
    return walls;
  }

  private static boolean[][] binaryTree(int rows, int cols) {
    boolean[][] walls = new boolean[rows][cols];
    for (int r = 0; r < rows; r++) {
      for (int c = 0; c < cols; c++) {
        walls[r][c] = true;
      }
    }
    for (int r = 1; r < rows; r += 2) {
      for (int c = 1; c < cols; c += 2) {
        walls[r][c] = false;
        boolean canGoNorth = r > 1;
        boolean canGoWest = c > 1;
        if (canGoNorth && canGoWest) {
          if (ThreadLocalRandom.current().nextBoolean()) {
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
    return walls;
  }

  private static boolean[][] prims(int rows, int cols) {
    boolean[][] walls = new boolean[rows][cols];
    for (int r = 0; r < rows; r++) {
      for (int c = 0; c < cols; c++) {
        walls[r][c] = true;
      }
    }
    walls[1][1] = false;
    List<int[]> frontier = new ArrayList<>();
    addPrimFrontier(1, 1, rows, cols, walls, frontier);

    while (!frontier.isEmpty()) {
      int idx = ThreadLocalRandom.current().nextInt(frontier.size());
      int[] wallCell = frontier.remove(idx);
      int r = wallCell[0];
      int c = wallCell[1];

      List<int[]> inNeighbors = new ArrayList<>();
      int[][] dirs = {{-2, 0}, {2, 0}, {0, -2}, {0, 2}};
      for (int[] d : dirs) {
        int nr = r + d[0];
        int nc = c + d[1];
        if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && !walls[nr][nc]) {
          inNeighbors.add(new int[] {nr, nc, r + d[0] / 2, c + d[1] / 2});
        }
      }

      if (!inNeighbors.isEmpty()) {
        int[] chosen = inNeighbors.get(ThreadLocalRandom.current().nextInt(inNeighbors.size()));
        walls[r][c] = false;
        walls[chosen[2]][chosen[3]] = false;
        addPrimFrontier(r, c, rows, cols, walls, frontier);
      }
    }
    return walls;
  }

  private static void addPrimFrontier(
      int r, int c, int rows, int cols, boolean[][] walls, List<int[]> frontier) {
    int[][] dirs = {{-2, 0}, {2, 0}, {0, -2}, {0, 2}};
    for (int[] d : dirs) {
      int nr = r + d[0];
      int nc = c + d[1];
      if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && walls[nr][nc]) {
        frontier.add(new int[] {nr, nc});
      }
    }
  }

  private static boolean[][] recursiveDivision(int rows, int cols) {
    boolean[][] walls = new boolean[rows][cols];
    for (int r = 0; r < rows; r++) {
      walls[r][0] = true;
      walls[r][cols - 1] = true;
    }
    for (int c = 0; c < cols; c++) {
      walls[0][c] = true;
      walls[rows - 1][c] = true;
    }
    divide(walls, 1, rows - 2, 1, cols - 2);
    return walls;
  }

  private static void divide(boolean[][] walls, int minR, int maxR, int minC, int maxC) {
    if (maxR - minR < 2 || maxC - minC < 2) return;
    boolean horizontal = (maxR - minR) > (maxC - minC);
    if (horizontal) {
      int wallR = minR + 1 + ThreadLocalRandom.current().nextInt((maxR - minR) / 2) * 2;
      for (int c = minC; c <= maxC; c++) walls[wallR][c] = true;
      int gapC = minC + ThreadLocalRandom.current().nextInt((maxC - minC) / 2 + 1) * 2;
      walls[wallR][gapC] = false;
      divide(walls, minR, wallR - 1, minC, maxC);
      divide(walls, wallR + 1, maxR, minC, maxC);
    } else {
      int wallC = minC + 1 + ThreadLocalRandom.current().nextInt((maxC - minC) / 2) * 2;
      for (int r = minR; r <= maxR; r++) walls[r][wallC] = true;
      int gapR = minR + ThreadLocalRandom.current().nextInt((maxR - minR) / 2 + 1) * 2;
      walls[gapR][wallC] = false;
      divide(walls, minR, maxR, minC, wallC - 1);
      divide(walls, minR, maxR, wallC + 1, maxC);
    }
  }

  private static boolean[][] cellularAutomata(int rows, int cols) {
    boolean[][] walls = randomWalls(rows, cols, 0.45);
    for (int step = 0; step < 4; step++) {
      boolean[][] next = new boolean[rows][cols];
      for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
          int count = countWallNeighbors(walls, r, c, rows, cols);
          next[r][c] = count >= 5 || r == 0 || c == 0 || r == rows - 1 || c == cols - 1;
        }
      }
      walls = next;
    }
    return walls;
  }

  private static int countWallNeighbors(boolean[][] walls, int r, int c, int rows, int cols) {
    int count = 0;
    for (int dr = -1; dr <= 1; dr++) {
      for (int dc = -1; dc <= 1; dc++) {
        int nr = r + dr;
        int nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || walls[nr][nc]) {
          count++;
        }
      }
    }
    return count;
  }

  private static void clearArea(boolean[][] walls, int row, int col, int rows, int cols) {
    for (int dr = -1; dr <= 1; dr++) {
      for (int dc = -1; dc <= 1; dc++) {
        int r = row + dr;
        int c = col + dc;
        if (r >= 0 && r < rows && c >= 0 && c < cols) {
          walls[r][c] = false;
        }
      }
    }
  }

  public static List<String> allNames() {
    return List.of(
        "Recursive Backtracker",
        "Random Walls",
        "Spiral",
        "Rooms",
        "Binary Tree",
        "Prim's Algorithm",
        "Recursive Division",
        "Cellular Automata",
        "Weighted Terrain Map");
  }

  public static MazeType fromName(String name) {
    return switch (name == null ? "" : name) {
      case "Random Walls" -> MazeType.RANDOM_WALLS;
      case "Spiral" -> MazeType.SPIRAL;
      case "Rooms" -> MazeType.ROOMS;
      case "Binary Tree" -> MazeType.BINARY_TREE;
      case "Prim's Algorithm" -> MazeType.PRIM;
      case "Recursive Division" -> MazeType.RECURSIVE_DIVISION;
      case "Cellular Automata" -> MazeType.CELLULAR_AUTOMATA;
      case "Weighted Terrain Map" -> MazeType.WEIGHTED_TERRAIN_MAP;
      default -> MazeType.RECURSIVE_BACKTRACKER;
    };
  }
}
