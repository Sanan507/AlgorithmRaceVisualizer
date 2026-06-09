package algorithms.pathfinding;

import java.util.Comparator;
import java.util.PriorityQueue;

public class AStarModel extends PathfindingModel {
    private PriorityQueue<GridCell> openSet = new PriorityQueue<>(
        Comparator.comparingDouble(GridCell::fCost));

    public AStarModel() { super("A* Search"); }

    private double heuristic(GridCell a, GridCell b) {
        return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
    }

    @Override
    public void step() {
        if (isDone() || openSet.isEmpty()) { markDone(); return; }
        GridCell current = openSet.poll();
        if (current == end) { reconstructPath(end); markDone(); return; }
        if (current.state != CellState.START) current.state = CellState.VISITED;
        addStep();
        for (GridCell nb : getNeighbors(current)) {
            if (nb.state == CellState.VISITED) continue;
            double tentativeG = current.gCost + 1;
            if (tentativeG < nb.gCost) {
                nb.gCost  = tentativeG;
                nb.hCost  = heuristic(nb, end);
                nb.parent = current;
                if (nb.state == CellState.EMPTY) nb.state = CellState.FRONTIER;
                openSet.add(nb);
            }
        }
    }

    @Override
    public void reset() {
        openSet.clear(); path.clear();
        doneProperty().set(false); pathFoundProperty().set(false);
        stepsProperty().set(0);
        if (start != null) { start.gCost = 0; openSet.add(start); }
    }
}
