package com.algorithmrace.visualizer.algorithms.searching;

import com.algorithmrace.visualizer.dto.RaceResponse;
import com.algorithmrace.visualizer.dto.SearchingSimulationRequest;
import com.algorithmrace.visualizer.service.SimulationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SearchingAlgorithmsTest {

    private final SimulationService simulationService = new SimulationService();
    private final List<String> algorithms = List.of("Linear Search", "Binary Search", "Jump Search");

    @Test
    @DisplayName("Verify search models successfully locate existing targets")
    void testSearchTargetFound() {
        int[] sortedDataset = {3, 7, 12, 19, 24, 31, 45, 58, 62, 79, 88, 95};
        int target = 45;
        int expectedIndex = 6;

        for (String algoName : algorithms) {
            SearchModel model = SearchingAlgorithmFactory.create(algoName);
            assertNotNull(model);
            model.resetState(sortedDataset);
            model.setTarget(target);

            int steps = 0;
            while (!model.isDone() && steps < 1000) {
                model.step();
                steps++;
            }

            assertTrue(model.isDone(), algoName + " should finish searching within step limit");
            assertEquals(expectedIndex, model.getFoundIndex(), algoName + " should find target at index " + expectedIndex);
        }
    }

    @Test
    @DisplayName("Verify search models correctly report missing targets with -1")
    void testSearchTargetNotFound() {
        int[] sortedDataset = {5, 10, 15, 20, 25, 30};
        int missingTarget = 99;

        for (String algoName : algorithms) {
            SearchModel model = SearchingAlgorithmFactory.create(algoName);
            model.resetState(sortedDataset);
            model.setTarget(missingTarget);

            int steps = 0;
            while (!model.isDone() && steps < 1000) {
                model.step();
                steps++;
            }

            assertTrue(model.isDone(), algoName + " should terminate when target is missing");
            assertEquals(-1, model.getFoundIndex(), algoName + " should return -1 for missing target");
        }
    }

    @Test
    @DisplayName("Verify SimulationService searching simulation returns valid frames and target hit state")
    void testSimulationServiceSearching() {
        int[] dataset = {2, 4, 6, 8, 10, 12, 14, 16};
        int target = 10;
        SearchingSimulationRequest request = new SearchingSimulationRequest(
            algorithms,
            "Random",
            dataset.length,
            target,
            dataset
        );

        RaceResponse response = simulationService.simulateSearching(request);

        assertNotNull(response);
        assertEquals("searching", response.category());
        assertEquals(target, response.target());
        assertEquals(algorithms.size(), response.lanes().size());

        response.lanes().forEach(lane -> {
            assertFalse(lane.frames().isEmpty(), lane.algorithm() + " frames should not be empty");
            assertTrue(lane.stats().targetFound(), lane.algorithm() + " should find target");
            assertEquals(4, lane.stats().foundIndex(), lane.algorithm() + " found index mismatch");
        });
    }
}
