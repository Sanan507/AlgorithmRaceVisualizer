package algorithms.pathfinding;

public class PathfindingFactory {

    public static PathfindingModel create(String name) {
        switch (name) {
            case "BFS":       return new BFSModel();
            case "DFS":       return new DFSModel();
            case "Dijkstra":  return new DijkstraModel();
            case "A* Search": return new AStarModel();
            default: throw new IllegalArgumentException("Unknown: " + name);
        }
    }

    public static String[] allNames() {
        return new String[]{"BFS", "DFS", "Dijkstra", "A* Search"};
    }
}
