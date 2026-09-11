package com.algorithmrace.visualizer.algorithms.pathfinding;

import java.util.ArrayDeque;
import java.util.Queue;

public class BellmanFordModel extends PathfindingModel {
  private final Queue<GridCell> queue = new ArrayDeque<>();
  private boolean[][] inQueue;

  public BellmanFordModel() {
    super("Bellman-Ford");
  }

  @Override
  public void initGrid(int rows, int cols) {
    super.initGrid(rows, cols);
    inQueue = new boolean[rows][cols];
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
    inQueue[current.row][current.col] = false;

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
      double newCost = current.gCost + nb.weight;
      if (newCost < nb.gCost) {
        nb.gCost = newCost;
        nb.parent = current;
        if (nb.state == CellState.EMPTY) {
          nb.state = CellState.FRONTIER;
        }
        if (!inQueue[nb.row][nb.col]) {
          queue.add(nb);
          inQueue[nb.row][nb.col] = true;
        }
      }
    }
  }

  @Override
  public void reset() {
    queue.clear();
    if (inQueue != null) {
      for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
          inQueue[r][c] = false;
        }
      }
    }
    resetStats();
    if (start != null) {
      start.gCost = 0;
      queue.add(start);
      if (inQueue != null) {
        inQueue[start.row][start.col] = true;
      }
    }
  }
}
