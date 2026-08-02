package com.algorithmrace.visualizer.algorithms.pathfinding;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;

public class BidirectionalBFSModel extends PathfindingModel {
  private final Queue<GridCell> forwardQueue = new LinkedList<>();
  private final Queue<GridCell> backwardQueue = new LinkedList<>();

  private final Map<GridCell, GridCell> parentForward = new HashMap<>();
  private final Map<GridCell, GridCell> parentBackward = new HashMap<>();

  private boolean forwardTurn = true;

  public BidirectionalBFSModel() {
    super("Bidirectional BFS");
  }

  @Override
  public void step() {
    if (isDone()) {
      return;
    }

    if (forwardQueue.isEmpty() && backwardQueue.isEmpty()) {
      markDone();
      return;
    }

    if (forwardTurn && !forwardQueue.isEmpty()) {
      expandForward();
      if (!isDone()) {
        forwardTurn = false;
      }
    } else if (!forwardTurn && !backwardQueue.isEmpty()) {
      expandBackward();
      if (!isDone()) {
        forwardTurn = true;
      }
    } else if (forwardQueue.isEmpty()) {
      expandBackward();
    } else {
      expandForward();
    }
  }

  private void expandForward() {
    GridCell current = forwardQueue.poll();
    if (current == null) return;

    if (parentBackward.containsKey(current) || current == end) {
      reconstructBidirectionalPath(current);
      markDone();
      return;
    }

    if (current != start) {
      current.state = CellState.VISITED_FORWARD;
    }
    addStep();

    for (GridCell nb : getNeighbors(current)) {
      if (nb.state == CellState.EMPTY
          || nb.state == CellState.END
          || nb.state == CellState.FRONTIER_BACKWARD
          || nb.state == CellState.VISITED_BACKWARD) {
        if (!parentForward.containsKey(nb)) {
          parentForward.put(nb, current);
          if (parentBackward.containsKey(nb) || nb == end) {
            reconstructBidirectionalPath(nb);
            markDone();
            return;
          }
          if (nb.state == CellState.EMPTY) {
            nb.state = CellState.FRONTIER_FORWARD;
          }
          forwardQueue.add(nb);
        }
      }
    }
  }

  private void expandBackward() {
    GridCell current = backwardQueue.poll();
    if (current == null) return;

    if (parentForward.containsKey(current) || current == start) {
      reconstructBidirectionalPath(current);
      markDone();
      return;
    }

    if (current != end) {
      current.state = CellState.VISITED_BACKWARD;
    }
    addStep();

    for (GridCell nb : getNeighbors(current)) {
      if (nb.state == CellState.EMPTY
          || nb.state == CellState.START
          || nb.state == CellState.FRONTIER_FORWARD
          || nb.state == CellState.VISITED_FORWARD) {
        if (!parentBackward.containsKey(nb)) {
          parentBackward.put(nb, current);
          if (parentForward.containsKey(nb) || nb == start) {
            reconstructBidirectionalPath(nb);
            markDone();
            return;
          }
          if (nb.state == CellState.EMPTY) {
            nb.state = CellState.FRONTIER_BACKWARD;
          }
          backwardQueue.add(nb);
        }
      }
    }
  }

  private void reconstructBidirectionalPath(GridCell intersection) {
    path.clear();

    GridCell current = intersection;
    while (current != null && current != start) {
      path.add(0, current);
      current = parentForward.get(current);
    }
    if (start != null && (path.isEmpty() || path.get(0) != start)) {
      path.add(0, start);
    }

    current = parentBackward.get(intersection);
    while (current != null) {
      path.add(current);
      current = parentBackward.get(current);
    }

    pathFound = true;
    for (GridCell cell : path) {
      if (cell != start && cell != end) {
        cell.state = CellState.PATH;
      }
    }
  }

  @Override
  public void reset() {
    forwardQueue.clear();
    backwardQueue.clear();
    parentForward.clear();
    parentBackward.clear();
    forwardTurn = true;
    resetStats();

    if (start != null) {
      start.gCost = 0;
      parentForward.put(start, null);
      forwardQueue.add(start);
    }
    if (end != null) {
      end.gCost = 0;
      parentBackward.put(end, null);
      backwardQueue.add(end);
    }
  }
}
