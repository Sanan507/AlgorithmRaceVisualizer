package com.algorithmrace.visualizer.algorithms.pathfinding;

import java.util.ArrayDeque;
import java.util.Queue;

public class BellmanFordModel extends PathfindingModel {
    private final Queue<GridCell> queue = new ArrayDeque<>();

    public BellmanFordModel() {
        super("Bellman-Ford");
    }

    @Override
    public void step() {
        if (isDone() || queue.isEmpty()) {
            if (end != null && end.parent != null) {
                reconstructPath(end);
            }
            markDone();
            return;
        }

        GridCell current = queue.poll();
        if (current == end) {
            reconstructPath(end);
            markDone();
            return;
        }

        if (current.state != CellState.START && current.state != CellState.END) {
            current.state = CellState.VISITED;
        }
        addStep();

        for (GridCell nb : getNeighbors(current)) {
            double newCost = current.gCost + 1.0;
            if (newCost < nb.gCost) {
                nb.gCost = newCost;
                nb.parent = current;
                if (nb.state == CellState.EMPTY) {
                    nb.state = CellState.FRONTIER;
                }
                if (!queue.contains(nb)) {
                    queue.add(nb);
                }
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
