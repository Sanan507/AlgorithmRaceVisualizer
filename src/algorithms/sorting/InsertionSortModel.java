package algorithms.sorting;

import model.AlgorithmModel;

public class InsertionSortModel extends AlgorithmModel {
    private int i = 1;
    private int j = 0;
    private int key = 0;
    private boolean picking = true;

    public InsertionSortModel() {
        super("Insertion Sort", "O(n^2)");
    }

    @Override
    public void step() {
        if (isDone()) return;
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
            swapsProperty().set(swapsProperty().get() + 1);
            highlight = new int[]{j, j + 1};
            j--;
        } else {
            if (j >= 0) addComparison();
            array[j + 1] = key;
            sortedBoundary = Math.max(0, array.length - 1 - i);
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
