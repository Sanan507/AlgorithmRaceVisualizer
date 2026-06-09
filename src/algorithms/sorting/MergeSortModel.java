package algorithms.sorting;

import model.AlgorithmModel;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MergeSortModel extends AlgorithmModel {

    private List<int[]> ops = new ArrayList<>();
    private int opIdx = 0;

    public MergeSortModel() { super("Merge Sort", "O(n log n)"); }

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
        if (opIdx >= ops.size()) { markDone(); return; }
        int[] op = ops.get(opIdx++);
        mergeRegionStart = op[0];
        mergeRegionEnd = op[2];
        merge(op[0], op[1], op[2]);
        highlight = new int[]{op[0], op[2]};
        sortedBoundary = Math.max(0, op[2]);
    }

    private void merge(int l, int m, int r) {
        int[] left  = Arrays.copyOfRange(array, l, m + 1);
        int[] right = Arrays.copyOfRange(array, m + 1, r + 1);
        int i = 0, j = 0, k = l;
        while (i < left.length && j < right.length) {
            addComparison();
            if (left[i] <= right[j]) array[k++] = left[i++];
            else { array[k++] = right[j++]; swapsProperty().set(swapsProperty().get() + 1); }
        }
        while (i < left.length)  array[k++] = left[i++];
        while (j < right.length) array[k++] = right[j++];
    }

    @Override
    public void resetState(int[] a) {
        setArray(a); resetStats();
        ops.clear();
        buildOps(0, a.length - 1);
        opIdx = 0;
    }
}
