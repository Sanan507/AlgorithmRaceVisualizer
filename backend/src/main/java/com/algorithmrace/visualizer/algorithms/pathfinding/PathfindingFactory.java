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
            default -> throw new IllegalArgumentException("Unknown pathfinding algorithm: " + name);
        };
    }

    public static List<String> allNames() {
        return List.of("BFS", "DFS", "Dijkstra", "A* Search", "Bellman-Ford");
    }
}
