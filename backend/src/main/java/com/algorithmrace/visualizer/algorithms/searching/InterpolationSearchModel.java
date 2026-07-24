package com.algorithmrace.visualizer.algorithms.searching;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class InterpolationSearchModel extends SearchModel {
    private int low;
    private int high;
    private final List<Integer> visited = new ArrayList<>();

    public InterpolationSearchModel() {
        super("Interpolation Search", "O(log log n)");
    }

    @Override
    public void step() {
        if (isDone()) return;

        if (low > high || target < array[low] || target > array[high]) {
            markDone();
            return;
        }

        if (array[high] == array[low]) {
            addComparison();
            visited.add(low);
            searchPath = visited.stream().mapToInt(Integer::intValue).toArray();
            highlight = new int[]{low};
            if (array[low] == target) {
                foundIndex = low;
            }
            markDone();
            return;
        }

        // Interpolation probe estimation formula
        int pos = low + (int) (((double) (target - array[low]) / (array[high] - array[low])) * (high - low));

        if (pos < low || pos > high) {
            markDone();
            return;
        }

        addComparison();
        highlight = new int[]{low, pos, high};
        visited.add(pos);
        searchPath = visited.stream().mapToInt(Integer::intValue).toArray();

        if (array[pos] == target) {
            foundIndex = pos;
            markDone();
        } else if (array[pos] < target) {
            low = pos + 1;
        } else {
            high = pos - 1;
        }
    }

    @Override
    public void resetState(int[] newArray) {
        int[] sorted = newArray.clone();
        Arrays.sort(sorted);
        setArray(sorted);
        resetStats();
        low = 0;
        high = array.length - 1;
        foundIndex = -1;
        visited.clear();
        searchPath = new int[0];
    }
}
