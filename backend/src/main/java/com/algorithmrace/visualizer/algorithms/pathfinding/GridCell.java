package com.algorithmrace.visualizer.algorithms.pathfinding;

public class GridCell {
    public final int row;
    public final int col;
    public CellState state = CellState.EMPTY;
    public double gCost = Double.MAX_VALUE;
    public double hCost;
    public GridCell parent;

    public GridCell(int row, int col) {
        this.row = row;
        this.col = col;
    }

    public double fCost() {
        return gCost + hCost;
    }
}
