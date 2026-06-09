package com.algorithmrace.visualizer.algorithms.sorting;

import com.algorithmrace.visualizer.model.AlgorithmModel;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class QuickSortModel extends AlgorithmModel {
    private final List<int[]> ops = new ArrayList<>();
    private int opIdx;

    public QuickSortModel() {
        super("Quick Sort", "O(n log n)");
    }

    private void buildOps(int[] arr) {
        Deque<int[]> stack = new ArrayDeque<>();
        if (arr.length > 1) stack.push(new int[]{0, arr.length - 1});
        while (!stack.isEmpty()) {
            int[] range = stack.pop();
            int lo = range[0];
            int hi = range[1];
            if (lo >= hi) continue;
            ops.add(new int[]{lo, hi});

            int pivotVal = arr[hi];
            int i = lo - 1;
            for (int j = lo; j < hi; j++) {
                if (arr[j] <= pivotVal) {
                    i++;
                    int tmp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = tmp;
                }
            }
            int tmp = arr[i + 1];
            arr[i + 1] = arr[hi];
            arr[hi] = tmp;
            int pi = i + 1;

            if (pi + 1 < hi) stack.push(new int[]{pi + 1, hi});
            if (lo < pi - 1) stack.push(new int[]{lo, pi - 1});
        }
    }

    private void doPartition(int lo, int hi) {
        int pivot = array[hi];
        int i = lo - 1;
        for (int j = lo; j < hi; j++) {
            addComparison();
            if (array[j] <= pivot) {
                i++;
                if (i != j) swap(i, j);
            }
        }
        if (i + 1 != hi) swap(i + 1, hi);
    }

    @Override
    public void step() {
        if (isDone()) return;
        if (opIdx >= ops.size()) {
            markDone();
            return;
        }
        int[] op = ops.get(opIdx++);
        pivotIndex = op[1];
        doPartition(op[0], op[1]);
        highlight = new int[]{op[0], op[1]};
        sortedBoundary = Math.max(0, op[1]);
    }

    @Override
    public void resetState(int[] newArray) {
        setArray(newArray);
        resetStats();
        ops.clear();
        buildOps(newArray.clone());
        opIdx = 0;
    }
}
