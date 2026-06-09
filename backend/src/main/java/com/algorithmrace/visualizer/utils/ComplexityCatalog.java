package com.algorithmrace.visualizer.utils;

import com.algorithmrace.visualizer.model.ComplexityInfo;

import java.util.LinkedHashMap;
import java.util.Map;

public final class ComplexityCatalog {
    private static final Map<String, ComplexityInfo> INFO = new LinkedHashMap<>();

    static {
        add("Bubble Sort", "O(n)", "O(n^2)", "O(n^2)", "O(1)", "Repeatedly compares adjacent values and pushes the largest unsorted value to the end.", "for i = 0 to n - 1:\n  for j = 0 to n - i - 2:\n    if a[j] > a[j + 1]: swap");
        add("Selection Sort", "O(n^2)", "O(n^2)", "O(n^2)", "O(1)", "Selects the minimum value from the unsorted region and places it at the front.", "for i = 0 to n - 1:\n  min = i\n  scan rest of array\n  swap a[i], a[min]");
        add("Insertion Sort", "O(n)", "O(n^2)", "O(n^2)", "O(1)", "Builds a sorted prefix by inserting each value into its correct position.", "for i = 1 to n - 1:\n  key = a[i]\n  shift larger values right\n  place key");
        add("Merge Sort", "O(n log n)", "O(n log n)", "O(n log n)", "O(n)", "Divides the array, sorts each half, then merges sorted runs back together.", "split until size 1\nmerge sorted halves");
        add("Quick Sort", "O(n log n)", "O(n log n)", "O(n^2)", "O(log n)", "Partitions around a pivot so smaller values move left and larger values move right.", "partition around pivot\nquickSort left\nquickSort right");
        add("Heap Sort", "O(n log n)", "O(n log n)", "O(n log n)", "O(1)", "Turns the data into a max heap, then repeatedly extracts the maximum.", "build max heap\nswap root with end\nheapify");
        add("Comb Sort", "O(n log n)", "O(n^2/2^p)", "O(n^2)", "O(1)", "Improves Bubble Sort by comparing values with a shrinking gap before finishing with gap one.", "gap = n\nshrink gap by 1.3\ncompare a[i] and a[i + gap]");
        add("Linear Search", "O(1)", "O(n)", "O(n)", "O(1)", "Checks each item in order until the target is found or the list ends.", "for each value:\n  compare with target");
        add("Binary Search", "O(1)", "O(log n)", "O(log n)", "O(1)", "Requires sorted data and halves the remaining search range after every comparison.", "low = 0, high = n - 1\nwhile low <= high:\n  compare middle");
        add("Jump Search", "O(1)", "O(sqrt n)", "O(sqrt n)", "O(1)", "Jumps by block size on sorted data, then scans linearly inside the matching block.", "jump by sqrt(n)\nlinear scan inside block");
        add("BFS", "O(V+E)", "O(V+E)", "O(V+E)", "O(V)", "Explores evenly outward from the start and finds shortest paths in unweighted grids.", "queue.add(start)\nvisit neighbors breadth-first");
        add("DFS", "O(V+E)", "O(V+E)", "O(V+E)", "O(V)", "Explores deeply down one route before backtracking. It is fast to demonstrate but not shortest-path focused.", "stack.push(start)\nvisit neighbors depth-first");
        add("Dijkstra", "O(E log V)", "O(E log V)", "O(E log V)", "O(V)", "Always expands the currently cheapest known node and handles weighted shortest paths.", "dist[start] = 0\nrelax cheapest frontier node");
        add("A* Search", "O(E)", "O(E)", "O(b^d)", "O(V)", "Combines travelled distance with a heuristic estimate to guide the search toward the goal.", "choose lowest f = g + h\nrelax neighbors");
    }

    private ComplexityCatalog() {}

    private static void add(String name, String best, String average, String worst, String space, String theory, String pseudocode) {
        INFO.put(name, new ComplexityInfo(best, average, worst, space, theory, pseudocode));
    }

    public static ComplexityInfo get(String name) {
        return INFO.getOrDefault(name, new ComplexityInfo("-", "-", "-", "-", "No explanation available.", "No pseudocode available."));
    }

    public static Map<String, ComplexityInfo> all() {
        return INFO;
    }
}
