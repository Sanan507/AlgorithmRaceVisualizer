package com.algorithmrace.visualizer.algorithms.pathfinding;

import java.util.LinkedList;
import java.util.Queue;

public class BFSModel extends PathfindingModel {
    private final Queue<GridCell> queue = new LinkedList<>();

    public BFSModel() {
        super("BFS");
    }

    @Override
    public void step() {
        if (isDone() || queue.isEmpty()) {
            markDone();
            return;
        }
        GridCell current = queue.poll();
        if (current == end) {
            reconstructPath(end);
            markDone();
            return;
        }
        if (current.state != CellState.START) current.state = CellState.VISITED;
        addStep();
        for (GridCell nb : getNeighbors(current)) {
            if (nb.state == CellState.EMPTY || nb.state == CellState.END) {
                nb.parent = current;
                nb.state = (nb == end) ? CellState.END : CellState.FRONTIER;
                queue.add(nb);
            }
        }
    }

    @Override
    public void reset() {
        queue.clear();
        resetStats();
        if (start != null) {
            start.gCost = 0;
            queue.add(start);
        }
    }
}
