package com.algorithmrace.visualizer.algorithms.pathfinding;

import java.util.Comparator;
import java.util.PriorityQueue;

public class DijkstraModel extends PathfindingModel {
    private final PriorityQueue<GridCell> pq = new PriorityQueue<>(Comparator.comparingDouble(c -> c.gCost));

    public DijkstraModel() {
        super("Dijkstra");
    }

    @Override
    public void step() {
        if (isDone() || pq.isEmpty()) {
            markDone();
            return;
        }
        GridCell current = pq.poll();
        if (current == end) {
            reconstructPath(end);
            markDone();
            return;
        }
        if (current.state != CellState.START) current.state = CellState.VISITED;
        addStep();
        for (GridCell nb : getNeighbors(current)) {
            if (nb.state == CellState.VISITED) continue;
            double newCost = current.gCost + 1;
            if (newCost < nb.gCost) {
                nb.gCost = newCost;
                nb.parent = current;
                if (nb.state == CellState.EMPTY) nb.state = CellState.FRONTIER;
                pq.add(nb);
            }
        }
    }

    @Override
    public void reset() {
        pq.clear();
        resetStats();
        if (start != null) {
            start.gCost = 0;
            pq.add(start);
        }
    }
}
