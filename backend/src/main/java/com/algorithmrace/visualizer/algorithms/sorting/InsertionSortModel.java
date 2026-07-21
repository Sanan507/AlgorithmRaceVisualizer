package com.algorithmrace.visualizer.algorithms.sorting;
import com.algorithmrace.visualizer.model.AlgorithmModel;
public class InsertionSortModel extends AlgorithmModel {
    private int i = 1;
    private int j;
    private int key;
    private boolean picking = true;

    public InsertionSortModel() {
        super("Insertion Sort", "O(n^2)");
    }

    @Override
    public void step() {
        if (isDone()) return;
        if (array.length < 2) {
            markDone();
            return;
        }
        if (picking) {
            key = array[i];
            j = i - 1;
            picking = false;
            highlight = new int[]{i};
            return;
        }
        if (j >= 0 && array[j] > key) {
            addComparison();
            array[j + 1] = array[j];
            addSwap();
            highlight = new int[]{j, j + 1};
            j--;
        } else {
            if (j >= 0) addComparison();
            array[j + 1] = key;
            sortedBoundary = i;
            i++;
            picking = true;
            if (i >= array.length) markDone();
        }
    }

    @Override
    public void resetState(int[] newArray) {
        setArray(newArray);
        resetStats();
        i = 1;
        j = 0;
        key = newArray.length > 1 ? newArray[1] : 0;
        picking = true;
    }
}
