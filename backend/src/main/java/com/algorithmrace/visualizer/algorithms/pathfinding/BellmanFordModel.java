package com.algorithmrace.visualizer.algorithms.pathfinding;

import java.util.ArrayDeque;
import java.util.HashSet;
import java.util.Queue;
import java.util.Set;

public class BellmanFordModel extends PathfindingModel {
  private final Queue<GridCell> queue = new ArrayDeque<>();
  // O(1) lookup instead of O(n) queue.contains()
  private final Set<GridCell> inQueue = new HashSet<>();

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
    inQueue.remove(current);

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
        if (!inQueue.contains(nb)) {
          queue.add(nb);
          inQueue.add(nb);
        }
      }
    }
  }

  @Override
  public void reset() {
    queue.clear();
    inQueue.clear();
    resetStats();
    if (start != null) {
      start.gCost = 0;
      queue.add(start);
      inQueue.add(start);
    }
  }
}
