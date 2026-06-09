package algorithms.pathfinding;

import javafx.beans.property.*;
import model.AlgorithmModel;
import java.util.ArrayList;
import java.util.List;

public abstract class PathfindingModel {

    protected GridCell[][] grid;
    protected int rows, cols;
    public GridCell start, end;
    protected List<GridCell> path = new ArrayList<>();

    private final StringProperty  name       = new SimpleStringProperty();
    private final BooleanProperty done       = new SimpleBooleanProperty(false);
    private final BooleanProperty pathFound  = new SimpleBooleanProperty(false);
    private final IntegerProperty stepsCount = new SimpleIntegerProperty(0);

    protected volatile int stepDelayMs = 30;

    public PathfindingModel(String name) { this.name.set(name); }

    public abstract void step();
    public abstract void reset();

    public void initGrid(int rows, int cols) {
        this.rows = rows; this.cols = cols;
        grid = new GridCell[rows][cols];
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                grid[r][c] = new GridCell(r, c);
    }

    protected List<GridCell> getNeighbors(GridCell cell) {
        List<GridCell> neighbors = new ArrayList<>();
        int[][] dirs = {{-1,0},{1,0},{0,-1},{0,1}};
        for (int[] d : dirs) {
            int nr = cell.row + d[0], nc = cell.col + d[1];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols
                    && grid[nr][nc].state != CellState.WALL)
                neighbors.add(grid[nr][nc]);
        }
        return neighbors;
    }

    protected void reconstructPath(GridCell endCell) {
        path.clear();
        GridCell current = endCell;
        while (current != null) { path.add(0, current); current = current.parent; }
        pathFound.set(true);
    }

    protected void markDone()  { done.set(true); }
    protected void addStep() {
        stepsCount.set(stepsCount.get() + 1);
        AlgorithmModel.playCompare();  // soft tick for each cell visited
    }

    public StringProperty  nameProperty()      { return name; }
    public BooleanProperty doneProperty()      { return done; }
    public BooleanProperty pathFoundProperty() { return pathFound; }
    public IntegerProperty stepsProperty()     { return stepsCount; }

    public String  getName()        { return name.get(); }
    public boolean isDone()         { return done.get(); }
    public boolean isPathFound()    { return pathFound.get(); }
    public GridCell[][] getGrid()   { return grid; }
    public List<GridCell> getPath() { return path; }
    public int getSteps()           { return stepsCount.get(); }
    public void setStepDelayMs(int ms) { stepDelayMs = ms; }
    public int  getStepDelayMs()       { return stepDelayMs; }
}
