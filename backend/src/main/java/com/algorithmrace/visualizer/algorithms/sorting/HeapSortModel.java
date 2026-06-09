package com.algorithmrace.visualizer.algorithms.sorting;

import com.algorithmrace.visualizer.model.AlgorithmModel;

public class HeapSortModel extends AlgorithmModel {
    private int phase;
    private int heapSize;
    private int buildIdx;

    public HeapSortModel() {
        super("Heap Sort", "O(n log n)");
    }

    private void heapify(int n, int i) {
        int largest = i;
        int l = 2 * i + 1;
        int r = 2 * i + 2;
        if (l < n) {
            addComparison();
            if (array[l] > array[largest]) largest = l;
        }
        if (r < n) {
            addComparison();
            if (array[r] > array[largest]) largest = r;
        }
        if (largest != i) {
            swap(i, largest);
            heapify(n, largest);
        }
    }

    @Override
    public void step() {
        if (isDone()) return;
        if (phase == 0) {
            if (buildIdx >= 0) {
                heapify(array.length, buildIdx);
                highlight = new int[]{buildIdx};
                buildIdx--;
            } else {
                phase = 1;
                heapSize = array.length;
            }
        } else if (heapSize > 1) {
            swap(0, heapSize - 1);
            sortedBoundary = heapSize - 1;
            highlight = new int[]{0, heapSize - 1};
            heapBoundary = heapSize - 1;
            heapSize--;
            heapify(heapSize, 0);
        } else {
            markDone();
        }
    }

    @Override
    public void resetState(int[] newArray) {
        setArray(newArray);
        resetStats();
        phase = 0;
        buildIdx = newArray.length / 2 - 1;
        heapSize = newArray.length;
    }
}
