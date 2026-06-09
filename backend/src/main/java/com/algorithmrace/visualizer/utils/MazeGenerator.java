package com.algorithmrace.visualizer.utils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public final class MazeGenerator {
    private static final Random RNG = new Random();

    private MazeGenerator() {}

    public enum MazeType {
        RECURSIVE_BACKTRACKER, RANDOM_WALLS, SPIRAL, ROOMS
    }

    public static boolean[][] generate(int rows, int cols, int startRow, int startCol, int endRow, int endCol, MazeType type) {
        boolean[][] walls = switch (type) {
            case RECURSIVE_BACKTRACKER -> recursiveBacktracker(rows, cols);
            case RANDOM_WALLS -> randomWalls(rows, cols, 0.30);
            case SPIRAL -> spiral(rows, cols);
            case ROOMS -> rooms(rows, cols);
        };
        clearArea(walls, startRow, startCol, rows, cols);
        clearArea(walls, endRow, endCol, rows, cols);
        return walls;
    }

    private static boolean[][] recursiveBacktracker(int rows, int cols) {
        boolean[][] walls = new boolean[rows][cols];
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) walls[r][c] = true;
        }
        int sr = 1;
        int sc = 1;
        walls[sr][sc] = false;
        List<int[]> stack = new ArrayList<>();
        stack.add(new int[]{sr, sc});
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
                    neighbors.add(new int[]{nr, nc, r + d[0] / 2, c + d[1] / 2});
                }
            }
            if (neighbors.isEmpty()) {
                stack.remove(stack.size() - 1);
            } else {
                Collections.shuffle(neighbors, RNG);
                int[] chosen = neighbors.get(0);
                walls[chosen[0]][chosen[1]] = false;
                walls[chosen[2]][chosen[3]] = false;
                stack.add(new int[]{chosen[0], chosen[1]});
            }
        }
        return walls;
    }

    private static boolean[][] randomWalls(int rows, int cols, double density) {
        boolean[][] walls = new boolean[rows][cols];
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) walls[r][c] = RNG.nextDouble() < density;
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
                int gapRow = layer + 1 + RNG.nextInt(Math.max(1, rows - 2 * layer - 2));
                int gapCol = layer + 1 + RNG.nextInt(Math.max(1, cols - 2 * layer - 2));
                if (gapRow < rows) walls[gapRow][layer] = false;
                if (gapCol < cols) walls[rows - 1 - layer][gapCol] = false;
                if (gapRow < rows && cols - 1 - layer >= 0) walls[gapRow][cols - 1 - layer] = false;
                if (gapCol < cols) walls[layer][gapCol] = false;
            }
            layer += 2;
            toggle = !toggle;
        }
        return walls;
    }

    private static boolean[][] rooms(int rows, int cols) {
        boolean[][] walls = new boolean[rows][cols];
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) walls[r][c] = true;
        }
        int numRooms = 5 + RNG.nextInt(4);
        List<int[]> roomCenters = new ArrayList<>();
        for (int i = 0; i < numRooms; i++) {
            int rh = 3 + RNG.nextInt(3);
            int rw = 4 + RNG.nextInt(4);
            int rr = 1 + RNG.nextInt(Math.max(1, rows - rh - 2));
            int rc = 1 + RNG.nextInt(Math.max(1, cols - rw - 2));
            for (int r = rr; r < Math.min(rows - 1, rr + rh); r++) {
                for (int c = rc; c < Math.min(cols - 1, rc + rw); c++) walls[r][c] = false;
            }
            roomCenters.add(new int[]{rr + rh / 2, rc + rw / 2});
        }
        for (int i = 0; i < roomCenters.size() - 1; i++) {
            int[] a = roomCenters.get(i);
            int[] b = roomCenters.get(i + 1);
            int r = a[0];
            int c = a[1];
            while (c != b[1]) {
                if (r >= 0 && r < rows && c >= 0 && c < cols) walls[r][c] = false;
                c += b[1] > c ? 1 : -1;
            }
            while (r != b[0]) {
                if (r >= 0 && r < rows && c >= 0 && c < cols) walls[r][c] = false;
                r += b[0] > r ? 1 : -1;
            }
        }
        return walls;
    }

    private static void clearArea(boolean[][] walls, int row, int col, int rows, int cols) {
        for (int dr = -1; dr <= 1; dr++) {
            for (int dc = -1; dc <= 1; dc++) {
                int r = row + dr;
                int c = col + dc;
                if (r >= 0 && r < rows && c >= 0 && c < cols) walls[r][c] = false;
            }
        }
    }

    public static List<String> allNames() {
        return List.of("Recursive Backtracker", "Random Walls", "Spiral", "Rooms");
    }

    public static MazeType fromName(String name) {
        return switch (name == null ? "" : name) {
            case "Random Walls" -> MazeType.RANDOM_WALLS;
            case "Spiral" -> MazeType.SPIRAL;
            case "Rooms" -> MazeType.ROOMS;
            default -> MazeType.RECURSIVE_BACKTRACKER;
        };
    }
}
