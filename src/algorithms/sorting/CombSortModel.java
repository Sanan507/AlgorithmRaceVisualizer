package algorithms.sorting;

import model.AlgorithmModel;

public class CombSortModel extends AlgorithmModel {
    private int gap;
    private boolean swapped;
    private int i = 0;

    public CombSortModel() {
        super("Comb Sort", "O(n^2)");
    }

    @Override
    public void step() {
        if (isDone()) return;
        if (gap == 0) { 
            gap = array.length; 
            swapped = true; 
        }
        
        if (i >= array.length - gap) {
            if (gap == 1 && !swapped) {
                markDone();
                return;
            }
            gap = (int) (gap / 1.3);
            if (gap < 1) gap = 1;
            i = 0;
            swapped = false;
        }
        
        if (i < array.length - gap) {
            compare(i, i + gap);
            if (array[i] > array[i + gap]) {
                swap(i, i + gap);
                swapped = true;
            }
            i++;
        }
    }

    @Override
    public void resetState(int[] newArray) {
        setArray(newArray);
        resetStats();
        gap = 0;
        i = 0;
        swapped = false;
    }
}
