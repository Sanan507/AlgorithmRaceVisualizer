package com.algorithmrace.visualizer.algorithms.searching;

import java.util.ArrayList;
import java.util.List;

public class LinearSearchModel extends SearchModel {
    private int current;
    private final List<Integer> visited = new ArrayList<>();

    public LinearSearchModel() {
        super("Linear Search", "O(n)");
    }

    @Override
    public void step() {
        if (isDone() || current >= array.length) {
            markDone();
            return;
        }
        addComparison();
        highlight = new int[]{current};
        visited.add(current);
        searchPath = visited.stream().mapToInt(Integer::intValue).toArray();
        if (array[current] == target) {
            foundIndex = current;
            markDone();
        } else {
            current++;
            if (current >= array.length) markDone();
        }
    }

    @Override
    public void resetState(int[] newArray) {
        setArray(newArray);
        resetStats();
        current = 0;
        foundIndex = -1;
        visited.clear();
        searchPath = new int[0];
    }
}
