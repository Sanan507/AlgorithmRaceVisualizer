package algorithms.sorting;

import model.AlgorithmModel;

public class SelectionSortModel extends AlgorithmModel {
    private int i = 0;
    private int minIdx = 0;
    private int j = 1;

    public SelectionSortModel() {
        super("Selection Sort", "O(n^2)");
    }

    @Override
    public void step() {
        if (isDone()) return;
        if (j < array.length) {
            compare(j, minIdx);
            if (array[j] < array[minIdx]) minIdx = j;
            j++;
        } else {
            if (minIdx != i) swap(i, minIdx);
            sortedBoundary = i;
            i++;
            minIdx = i;
            j = i + 1;
            if (i >= array.length - 1) markDone();
        }
    }

    @Override
    public void resetState(int[] newArray) {
        setArray(newArray);
        resetStats();
        i = 0;
        minIdx = 0;
        j = 1;
    }
}
