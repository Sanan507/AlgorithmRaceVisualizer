package com.algorithmrace.visualizer.algorithms.sorting;

import java.util.List;

public final class SortingAlgorithmFactory {
    private SortingAlgorithmFactory() {
    }

    public static com.algorithmrace.visualizer.model.AlgorithmModel create(String name) {
        return switch (name) {
            case "Bubble Sort" -> new BubbleSortModel();
            case "Selection Sort" -> new SelectionSortModel();
            case "Insertion Sort" -> new InsertionSortModel();
            case "Merge Sort" -> new MergeSortModel();
            case "Quick Sort" -> new QuickSortModel();
            case "Heap Sort" -> new HeapSortModel();
            case "Comb Sort" -> new CombSortModel();
            case "Radix Sort" -> new RadixSortModel();
            case "Counting Sort" -> new CountingSortModel();
            case "Cocktail Sort" -> new CocktailSortModel();
            case "Shell Sort" -> new ShellSortModel();

            default -> throw new IllegalArgumentException("Unrecognized sorting algorithm requested.");
        };
    }

    public static List<String> allNames() {
        return List.of(
            "Bubble Sort",
            "Selection Sort",
            "Insertion Sort",
            "Merge Sort",
            "Quick Sort",
            "Heap Sort",
            "Comb Sort",
            "Radix Sort",
            "Counting Sort",
            "Cocktail Sort",
            "Shell Sort"
        );
    }
}
