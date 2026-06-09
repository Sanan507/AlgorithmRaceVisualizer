package com.algorithmrace.visualizer.algorithms.searching;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class JumpSearchModel extends SearchModel {
    private int step;
    private int prev;
    private int curr;
    private boolean jumping = true;
    private final List<Integer> visited = new ArrayList<>();

    public JumpSearchModel() {
        super("Jump Search", "O(sqrt n)");
    }

    @Override
    public void step() {
        if (isDone()) return;
        if (jumping) {
            int probe = Math.min(curr, array.length) - 1;
            if (probe >= 0 && curr < array.length && array[probe] < target) {
                addComparison();
                visited.add(probe);
                highlight = new int[]{probe};
                searchPath = visited.stream().mapToInt(Integer::intValue).toArray();
                prev = curr;
                curr += step;
            } else {
                jumping = false;
            }
        } else if (prev < array.length) {
            addComparison();
            highlight = new int[]{prev};
            visited.add(prev);
            searchPath = visited.stream().mapToInt(Integer::intValue).toArray();
            if (array[prev] == target) {
                foundIndex = prev;
                markDone();
            } else if (array[prev] > target || prev >= Math.min(curr, array.length) - 1) {
                markDone();
            } else {
                prev++;
            }
        } else {
            markDone();
        }
    }

    @Override
    public void resetState(int[] newArray) {
        int[] sorted = newArray.clone();
        Arrays.sort(sorted);
        setArray(sorted);
        resetStats();
        step = Math.max(1, (int) Math.sqrt(array.length));
        prev = 0;
        curr = step;
        jumping = true;
        foundIndex = -1;
        visited.clear();
        searchPath = new int[0];
    }
}
