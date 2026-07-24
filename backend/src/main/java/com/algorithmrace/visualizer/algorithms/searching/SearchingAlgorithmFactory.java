package com.algorithmrace.visualizer.algorithms.searching;

import java.util.List;

public final class SearchingAlgorithmFactory {
    private SearchingAlgorithmFactory() {}

    public static SearchModel create(String name) {
        return switch (name) {
            case "Linear Search" -> new LinearSearchModel();
            case "Binary Search" -> new BinarySearchModel();
            case "Jump Search" -> new JumpSearchModel();
            case "Exponential Search" -> new ExponentialSearchModel();
            case "Interpolation Search" -> new InterpolationSearchModel();
            default -> throw new IllegalArgumentException("Unknown searching algorithm: " + name);
        };
    }

    public static List<String> allNames() {
        return List.of("Linear Search", "Binary Search", "Jump Search", "Exponential Search", "Interpolation Search");
    }
}
