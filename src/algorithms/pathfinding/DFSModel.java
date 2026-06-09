package algorithms.pathfinding;

import java.util.ArrayDeque;
import java.util.Deque;

public class DFSModel extends PathfindingModel {
    private Deque<GridCell> stack = new ArrayDeque<>();

    public DFSModel() { super("DFS"); }

    @Override
    public void step() {
        if (isDone() || stack.isEmpty()) { markDone(); return; }
        GridCell current = stack.pop();
        if (current.state == CellState.VISITED) return;
        if (current == end) { reconstructPath(end); markDone(); return; }
        if (current.state != CellState.START) current.state = CellState.VISITED;
        addStep();
        for (GridCell nb : getNeighbors(current)) {
            if (nb.state == CellState.EMPTY || nb.state == CellState.END) {
                nb.parent = current;
                nb.state  = (nb == end) ? CellState.END : CellState.FRONTIER;
                stack.push(nb);
            }
        }
    }

    @Override
    public void reset() {
        stack.clear(); path.clear();
        doneProperty().set(false); pathFoundProperty().set(false);
        stepsProperty().set(0);
        if (start != null) stack.push(start);
    }
}
