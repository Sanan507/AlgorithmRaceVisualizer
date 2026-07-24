package com.algorithmrace.visualizer.algorithms.searching;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ExponentialSearchModel extends SearchModel {
    private int boundIndex;
    private boolean rangeFound;
    private int low;
    private int high;
    private final List<Integer> visited = new ArrayList<>();

    public ExponentialSearchModel() {
        super("Exponential Search", "O(log n)");
    }

    @Override
    public void step() {
        if (isDone()) return;

        if (!rangeFound) {
            addComparison();
            visited.add(boundIndex);
            highlight = new int[]{boundIndex};
            searchPath = visited.stream().mapToInt(Integer::intValue).toArray();

            if (array[boundIndex] == target) {
                foundIndex = boundIndex;
                markDone();
                return;
            }

            if (array[boundIndex] < target && boundIndex < array.length - 1) {
                boundIndex = Math.min(boundIndex * 2, array.length - 1);
            } else {
                rangeFound = true;
                low = boundIndex / 2;
                high = Math.min(boundIndex, array.length - 1);
            }
        } else {
            // Binary Search phase within bounded range
            if (low > high) {
                markDone();
                return;
            }
            int mid = low + (high - low) / 2;
            addComparison();
            highlight = new int[]{low, mid, high};
            visited.add(mid);
            searchPath = visited.stream().mapToInt(Integer::intValue).toArray();

            if (array[mid] == target) {
                foundIndex = mid;
                markDone();
            } else if (array[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
    }

    @Override
    public void resetState(int[] newArray) {
        int[] sorted = newArray.clone();
        Arrays.sort(sorted);
        setArray(sorted);
        resetStats();
        boundIndex = 1;
        rangeFound = false;
        low = 0;
        high = array.length - 1;
        foundIndex = -1;
        visited.clear();
        searchPath = new int[0];

        // Check index 0 edge case immediately if non-empty
        if (array.length > 0 && array[0] == target) {
            boundIndex = 0;
        }
    }
}
