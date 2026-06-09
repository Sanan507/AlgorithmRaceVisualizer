package algorithms.searching;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class BinarySearchModel extends SearchModel {
    private int low, high, mid;
    private List<Integer> visited = new ArrayList<>();

    public BinarySearchModel() { super("Binary Search", "O(log n)"); }

    @Override
    public void step() {
        if (isDone()) return;
        if (low > high) { markDone(); return; }
        mid = (low + high) / 2;
        addComparison();
        highlight = new int[]{low, mid, high};
        visited.add(mid);
        searchPath = visited.stream().mapToInt(Integer::intValue).toArray();
        if (array[mid] == target) {
            foundIndex = mid; markDone();
        } else if (array[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    @Override
    public void resetState(int[] a) {
        int[] sorted = a.clone(); Arrays.sort(sorted);
        setArray(sorted); resetStats();
        low = 0; high = array.length - 1; mid = 0;
        foundIndex = -1; visited.clear(); searchPath = new int[]{};
    }
}
