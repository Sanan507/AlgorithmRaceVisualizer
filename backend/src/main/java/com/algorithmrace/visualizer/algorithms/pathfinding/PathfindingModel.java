package com.algorithmrace.visualizer.algorithms.pathfinding;

import java.util.ArrayList;
import java.util.List;

public abstract class PathfindingModel {
    protected GridCell[][] grid;
    protected int rows;
    protected int cols;
    protected final List<GridCell> path = new ArrayList<>();
    public GridCell start;
    public GridCell end;

    private final String name;
    private boolean done;
    private boolean pathFound;
    private int steps;

    protected PathfindingModel(String name) {
        this.name = name;
    }

    public abstract void step();
    public abstract void reset();

    public void initGrid(int rows, int cols) {
        this.rows = rows;
        this.cols = cols;
        grid = new GridCell[rows][cols];
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                grid[r][c] = new GridCell(r, c);
            }
        }
    }

    protected List<GridCell> getNeighbors(GridCell cell) {
        List<GridCell> neighbors = new ArrayList<>();
        int[][] dirs = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
        for (int[] d : dirs) {
            int nr = cell.row + d[0];
            int nc = cell.col + d[1];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].state != CellState.WALL) {
                neighbors.add(grid[nr][nc]);
            }
        }
        return neighbors;
    }

    protected void reconstructPath(GridCell endCell) {
        path.clear();
        GridCell current = endCell;
        while (current != null) {
            path.add(0, current);
            current = current.parent;
        }
        pathFound = true;
    }

    protected void markDone() {
        done = true;
    }

    protected void addStep() {
        steps++;
    }

    protected void resetStats() {
        done = false;
        pathFound = false;
        steps = 0;
        path.clear();
    }

    public String getName() { return name; }
    public boolean isDone() { return done; }
    public boolean isPathFound() { return pathFound; }
    public int getSteps() { return steps; }
    public GridCell[][] getGrid() { return grid; }
    public List<GridCell> getPath() { return path; }
}
