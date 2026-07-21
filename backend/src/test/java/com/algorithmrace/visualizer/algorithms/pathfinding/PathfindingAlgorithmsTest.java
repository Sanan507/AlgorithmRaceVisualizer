package com.algorithmrace.visualizer.algorithms.pathfinding;

import com.algorithmrace.visualizer.dto.PathfindingSimulationRequest;
import com.algorithmrace.visualizer.dto.RaceResponse;
import com.algorithmrace.visualizer.service.SimulationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PathfindingAlgorithmsTest {

    private final SimulationService simulationService = new SimulationService();
    private final List<String> algorithms = List.of("BFS", "DFS", "Dijkstra", "A* Search");

    @Test
    @DisplayName("Verify pathfinding models find path in unblocked grid")
    void testPathfindingUnblockedGrid() {
        int rows = 10;
        int cols = 10;

        for (String algoName : algorithms) {
            PathfindingModel model = PathfindingFactory.create(algoName);
            assertNotNull(model);
            model.initGrid(rows, cols);
            model.start = model.getGrid()[0][0];
            model.end = model.getGrid()[9][9];
            model.reset();

            int steps = 0;
            while (!model.isDone() && steps < 2000) {
                model.step();
                steps++;
            }

            assertTrue(model.isDone(), algoName + " should reach done state");
            assertTrue(model.isPathFound(), algoName + " should find a path to end node");
            assertFalse(model.getPath().isEmpty(), algoName + " path list should not be empty");
            assertEquals(model.start, model.getPath().get(0), algoName + " path should start at start node");
            assertEquals(model.end, model.getPath().get(model.getPath().size() - 1), algoName + " path should end at end node");
        }
    }

    @Test
    @DisplayName("Verify pathfinding models handle fully blocked end node")
    void testPathfindingBlockedEndNode() {
        int rows = 10;
        int cols = 10;
        boolean[][] walls = new boolean[rows][cols];

        // Wall surrounding end node (9,9)
        walls[8][9] = true;
        walls[9][8] = true;

        for (String algoName : algorithms) {
            PathfindingModel model = PathfindingFactory.create(algoName);
            model.initGrid(rows, cols);
            for (int r = 0; r < rows; r++) {
                for (int c = 0; c < cols; c++) {
                    if (walls[r][c]) {
                        model.getGrid()[r][c].state = CellState.WALL;
                    }
                }
            }
            model.start = model.getGrid()[0][0];
            model.end = model.getGrid()[9][9];
            model.reset();

            int steps = 0;
            while (!model.isDone() && steps < 2000) {
                model.step();
                steps++;
            }

            assertTrue(model.isDone(), algoName + " should complete search even when blocked");
            assertFalse(model.isPathFound(), algoName + " should report path NOT found when blocked");
            assertTrue(model.getPath().isEmpty(), algoName + " path should be empty when blocked");
        }
    }

    @Test
    @DisplayName("Verify SimulationService pathfinding simulation returns valid grid frames and stats")
    void testSimulationServicePathfinding() {
        PathfindingSimulationRequest request = new PathfindingSimulationRequest(
            algorithms,
            10,
            10,
            "Clear Grid",
            null
        );

        RaceResponse response = simulationService.simulatePathfinding(request);

        assertNotNull(response);
        assertEquals("pathfinding", response.type());
        assertNotNull(response.walls());
        assertEquals(algorithms.size(), response.lanes().size());

        response.lanes().forEach(lane -> {
            assertFalse(lane.frames().isEmpty(), lane.name() + " frames should not be empty");
            assertNotNull(lane.stats(), lane.name() + " stats should not be null");
        });
    }
}
