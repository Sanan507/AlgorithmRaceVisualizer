package algorithms.sorting;

import model.AlgorithmModel;

public class SortingAlgorithmFactory {

    public static AlgorithmModel create(String name) {
        switch (name) {
            case "Bubble Sort":    return new BubbleSortModel();
            case "Selection Sort": return new SelectionSortModel();
            case "Insertion Sort": return new InsertionSortModel();
            case "Merge Sort":     return new MergeSortModel();
            case "Quick Sort":     return new QuickSortModel();
            case "Heap Sort":      return new HeapSortModel();
            case "Comb Sort":      return new CombSortModel();
            default: throw new IllegalArgumentException("Unknown: " + name);
        }
    }

    public static String[] allNames() {
        return new String[]{
            "Bubble Sort", "Selection Sort", "Insertion Sort",
            "Merge Sort", "Quick Sort", "Heap Sort", "Comb Sort"
        };
    }
}
