package com.algorithmrace.visualizer.algorithms.sorting;

import com.algorithmrace.visualizer.model.AlgorithmModel;

import java.util.List;

public final class SortingAlgorithmFactory {
    private SortingAlgorithmFactory() {}

    public static AlgorithmModel create(String name) {
        return switch (name) {
            case "Bubble Sort" -> new BubbleSortModel();
            case "Selection Sort" -> new SelectionSortModel();
            case "Insertion Sort" -> new InsertionSortModel();
            case "Merge Sort" -> new MergeSortModel();
            case "Quick Sort" -> new QuickSortModel();
            case "Heap Sort" -> new HeapSortModel();
            case "Comb Sort" -> new CombSortModel();
            default -> throw new IllegalArgumentException("Unknown sorting algorithm: " + name);
        };
    }

    public static List<String> allNames() {
        return List.of("Bubble Sort", "Selection Sort", "Insertion Sort", "Merge Sort", "Quick Sort", "Heap Sort", "Comb Sort");
    }
}
