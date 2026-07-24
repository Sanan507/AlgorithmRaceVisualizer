package com.algorithmrace.visualizer.algorithms.sorting;

import com.algorithmrace.visualizer.dto.RaceResponse;
import com.algorithmrace.visualizer.dto.SortingSimulationRequest;
import com.algorithmrace.visualizer.model.AlgorithmModel;
import com.algorithmrace.visualizer.service.SimulationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SortingAlgorithmsTest {

    private final SimulationService simulationService = new SimulationService();
    private final List<String> algorithms = List.of(
        "Bubble Sort",
        "Selection Sort",
        "Insertion Sort",
        "Merge Sort",
        "Quick Sort",
        "Heap Sort",
        "Comb Sort"
    );

    @Test
    @DisplayName("Verify all sorting algorithm models sort arrays correctly step-by-step")
    void testAllSortingModelsSortCorrectly() {
        int[] unsorted = {45, 12, 89, 3, 27, 64, 5, 99, 18, 33};

        for (String algoName : algorithms) {
            AlgorithmModel model = SortingAlgorithmFactory.create(algoName);
            assertNotNull(model, "Factory should return valid model for " + algoName);

            model.resetState(unsorted);
            int stepLimit = 5000;
            int steps = 0;

            while (!model.isDone() && steps < stepLimit) {
                model.step();
                steps++;
            }

            assertTrue(model.isDone(), algoName + " should reach done state within " + stepLimit + " steps");
            int[] result = model.getArray();
            assertArrayEquals(new int[]{3, 5, 12, 18, 27, 33, 45, 64, 89, 99}, result,
                algoName + " failed to sort array correctly");
        }
    }

    @Test
    @DisplayName("Verify sorting algorithms handle edge cases (empty & single-element arrays)")
    void testSortingEdgeCases() {
        for (String algoName : algorithms) {
            // Single element array
            AlgorithmModel modelSingle = SortingAlgorithmFactory.create(algoName);
            modelSingle.resetState(new int[]{42});
            int steps = 0;
            while (!modelSingle.isDone() && steps < 100) {
                modelSingle.step();
                steps++;
            }
            assertArrayEquals(new int[]{42}, modelSingle.getArray(), algoName + " failed on single element");

            // Empty array
            AlgorithmModel modelEmpty = SortingAlgorithmFactory.create(algoName);
            modelEmpty.resetState(new int[0]);
            steps = 0;
            while (!modelEmpty.isDone() && steps < 100) {
                modelEmpty.step();
                steps++;
            }
            assertArrayEquals(new int[0], modelEmpty.getArray(), algoName + " failed on empty array");
        }
    }

    @Test
    @DisplayName("Verify SimulationService generates valid frames and stats for sorting request")
    void testSimulationServiceSorting() {
        SortingSimulationRequest request = new SortingSimulationRequest(
            algorithms,
            "Random",
            15,
            null
        );

        RaceResponse response = simulationService.simulateSorting(request);

        assertNotNull(response, "Simulation response should not be null");
        assertEquals("sorting", response.type());
        assertEquals(Math.min(algorithms.size(), 6), response.lanes().size(), "Should cap lane responses to max supported lanes");
        assertNotNull(response.winner(), "A winner lane should be determined");

        response.lanes().forEach(lane -> {
            assertFalse(lane.frames().isEmpty(), lane.name() + " frames should not be empty");
            assertTrue(lane.stats().comparisons() >= 0, lane.name() + " comparisons count should be non-negative");
            assertTrue(lane.stats().swaps() >= 0, lane.name() + " swaps count should be non-negative");
        });
    }
}
