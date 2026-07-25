package com.algorithmrace.visualizer.algorithms.sorting;

import com.algorithmrace.visualizer.model.AlgorithmModel;

public class ShellSortModel extends AlgorithmModel {
    private int gap;
    private int i;
    private int j;
    private int key;
    private boolean picking = true;

    public ShellSortModel() {
        super("Shell Sort", "O(n^1.3)");
    }

    @Override
    public void step() {
        if (isDone()) return;

        if (array.length < 2 || gap <= 0) {
            markDone();
            return;
        }

        if (picking && i >= array.length) {
            gap /= 2;
            i = gap;
            if (gap <= 0) {
                markDone();
                return;
            }
        }

        // pick the key element and determine the starting index
        if (picking) {
            key = array[i];
            j = i - gap;
            picking = false;
            highlight = new int[]{i};
            return;
        }

        // shift and compare
        if (j >= 0 && array[j] > key) {
            addComparison();
            array[j + gap] = array[j];
            addSwap();
            highlight = new int[]{j, j + gap};
            j -= gap;
        } else {
            if (j >= 0) addComparison();
            array[j + gap] = key;
            i++;
            picking = true;
        }
    }

    @Override
    public void resetState(int[] newArray) {
        setArray(newArray);
        resetStats();
        gap = newArray.length / 2;
        i = gap;
        j = 0;
        key = 0;
        picking = true;
    }
}