package algorithms.pathfinding;

public class GridCell {
    public final int row, col;
    public CellState state  = CellState.EMPTY;
    public double gCost     = Double.MAX_VALUE;
    public double hCost     = 0;
    public GridCell parent  = null;

    public GridCell(int row, int col) { this.row = row; this.col = col; }

    public double fCost() { return gCost + hCost; }
}
