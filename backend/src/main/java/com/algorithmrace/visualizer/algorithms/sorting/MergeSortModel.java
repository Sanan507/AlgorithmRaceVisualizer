package com.algorithmrace.visualizer.algorithms.sorting;

import com.algorithmrace.visualizer.model.AlgorithmModel;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MergeSortModel extends AlgorithmModel {
    private final List<int[]> ops = new ArrayList<>();
    private int opIdx;

    public MergeSortModel() {
        super("Merge Sort", "O(n log n)");
    }

    private void buildOps(int l, int r) {
        if (l >= r) return;
        int m = (l + r) / 2;
        buildOps(l, m);
        buildOps(m + 1, r);
        ops.add(new int[]{l, m, r});
    }

    @Override
    public void step() {
        if (isDone()) return;
        if (opIdx >= ops.size()) {
            markDone();
            return;
        }
        int[] op = ops.get(opIdx++);
        mergeRegionStart = op[0];
        mergeRegionEnd = op[2];
        merge(op[0], op[1], op[2]);
        highlight = new int[]{op[0], op[2]};
        sortedBoundary = Math.max(0, op[2]);
    }

    private void merge(int l, int m, int r) {
        int[] left = Arrays.copyOfRange(array, l, m + 1);
        int[] right = Arrays.copyOfRange(array, m + 1, r + 1);
        int i = 0;
        int j = 0;
        int k = l;
        while (i < left.length && j < right.length) {
            addComparison();
            if (left[i] <= right[j]) array[k++] = left[i++];
            else {
                array[k++] = right[j++];
                addSwap();
            }
        }
        while (i < left.length) array[k++] = left[i++];
        while (j < right.length) array[k++] = right[j++];
    }

    @Override
    public void resetState(int[] newArray) {
        setArray(newArray);
        resetStats();
        ops.clear();
        if (newArray.length > 1) buildOps(0, newArray.length - 1);
        opIdx = 0;
    }
}
