package com.algorithmrace.visualizer.algorithms.pathfinding;

import java.util.List;

public final class PathfindingFactory {
  private PathfindingFactory() {}

  public static PathfindingModel create(String name) {
    return switch (name) {
      case "BFS" -> new BFSModel();
      case "DFS" -> new DFSModel();
      case "Dijkstra" -> new DijkstraModel();
      case "A* Search" -> new AStarModel();
      case "Bellman-Ford" -> new BellmanFordModel();
      case "Bidirectional BFS" -> new BidirectionalBFSModel();
      case "Greedy Best-First" -> new GreedyBFSModel();
      case "Jump Point Search" -> new JPSModel();
      default ->
          throw new IllegalArgumentException("Unrecognized pathfinding algorithm requested.");
    };
  }

  public static List<String> allNames() {
    return List.of(
        "BFS",
        "DFS",
        "Dijkstra",
        "A* Search",
        "Bellman-Ford",
        "Greedy Best-First",
        "Bidirectional BFS",
        "Jump Point Search");
  }
}
