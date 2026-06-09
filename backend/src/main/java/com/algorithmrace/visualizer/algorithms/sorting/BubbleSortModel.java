package com.algorithmrace.visualizer.algorithms.sorting;

import com.algorithmrace.visualizer.model.AlgorithmModel;

public class BubbleSortModel extends AlgorithmModel {
    private int i;
    private int j;

    public BubbleSortModel() {
        super("Bubble Sort", "O(n^2)");
    }

    @Override
    public void step() {
        if (isDone()) return;
        if (j < array.length - 1 - i) {
            compare(j, j + 1);
            if (array[j] > array[j + 1]) swap(j, j + 1);
            j++;
        } else {
            sortedBoundary = array.length - 1 - i;
            i++;
            j = 0;
            if (i >= array.length - 1) markDone();
        }
    }

    @Override
    public void resetState(int[] newArray) {
        setArray(newArray);
        resetStats();
        i = 0;
        j = 0;
    }
}
