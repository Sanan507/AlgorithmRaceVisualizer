package utils;

import java.util.HashMap;
import java.util.Map;

public class ComplexityInfo {
    public static class Info {
        public final String best;
        public final String average;
        public final String worst;
        public final String space;
        public final String theory;
        public final String pseudocode;

        public Info(String best, String average, String worst, String space, String theory, String pseudocode) {
            this.best = best;
            this.average = average;
            this.worst = worst;
            this.space = space;
            this.theory = theory;
            this.pseudocode = pseudocode;
        }
    }

    private static final Map<String, Info> INFO = new HashMap<>();

    static {
        INFO.put("Bubble Sort", new Info("O(n)", "O(n^2)", "O(n^2)", "O(1)",
            "Repeatedly compares adjacent values and pushes the largest unsorted value to the end.",
            "for i = 0 to n - 1:\n  for j = 0 to n - i - 2:\n    if a[j] > a[j + 1]:\n      swap(a[j], a[j + 1])"));
        INFO.put("Selection Sort", new Info("O(n^2)", "O(n^2)", "O(n^2)", "O(1)",
            "Selects the minimum value from the unsorted region and places it at the front.",
            "for i = 0 to n - 1:\n  min = i\n  for j = i + 1 to n - 1:\n    if a[j] < a[min]: min = j\n  swap(a[i], a[min])"));
        INFO.put("Insertion Sort", new Info("O(n)", "O(n^2)", "O(n^2)", "O(1)",
            "Builds a sorted prefix by inserting each value into its correct position.",
            "for i = 1 to n - 1:\n  key = a[i]\n  shift larger values right\n  place key"));
        INFO.put("Merge Sort", new Info("O(n log n)", "O(n log n)", "O(n log n)", "O(n)",
            "Divides the array, sorts each half, then merges sorted runs back together.",
            "mergeSort(left, right):\n  if left >= right: return\n  mid = (left + right) / 2\n  mergeSort(left, mid)\n  mergeSort(mid + 1, right)\n  merge(left, mid, right)"));
        INFO.put("Quick Sort", new Info("O(n log n)", "O(n log n)", "O(n^2)", "O(log n)",
            "Partitions around a pivot so smaller values move left and larger values move right.",
            "quickSort(low, high):\n  if low < high:\n    pivot = partition(low, high)\n    quickSort(low, pivot - 1)\n    quickSort(pivot + 1, high)"));
        INFO.put("Heap Sort", new Info("O(n log n)", "O(n log n)", "O(n log n)", "O(1)",
            "Turns the data into a max heap, then repeatedly extracts the maximum.",
            "buildMaxHeap(a)\nfor end = n - 1 down to 1:\n  swap(a[0], a[end])\n  heapify(0, end)"));
        INFO.put("Comb Sort", new Info("O(n log n)", "O(n^2/2^p)", "O(n^2)", "O(1)",
            "An improvement over Bubble Sort that eliminates small values near the end (turtles) by using a shrinking gap. Starts comparing elements far apart, then progressively reduces the gap by a factor of 1.3.",
            "gap = n\nwhile gap > 1 or swapped:\n  gap = floor(gap / 1.3)\n  if gap < 1: gap = 1\n  swapped = false\n  for i = 0 to n - gap - 1:\n    if a[i] > a[i + gap]:\n      swap(a[i], a[i + gap])\n      swapped = true"));
        INFO.put("Linear Search", new Info("O(1)", "O(n)", "O(n)", "O(1)",
            "Checks each item in order until the target is found or the list ends.",
            "for i = 0 to n - 1:\n  if a[i] == target: return i\nreturn -1"));
        INFO.put("Binary Search", new Info("O(1)", "O(log n)", "O(log n)", "O(1)",
            "Requires sorted data and halves the remaining search range after every comparison.",
            "low = 0; high = n - 1\nwhile low <= high:\n  mid = (low + high) / 2\n  compare a[mid] with target\nreturn -1"));
        INFO.put("Jump Search", new Info("O(1)", "O(sqrt n)", "O(sqrt n)", "O(1)",
            "Jumps by block size on sorted data, then scans linearly inside the matching block.",
            "step = sqrt(n)\nwhile a[min(step,n)-1] < target:\n  prev = step; step += sqrt(n)\nscan from prev to step"));
        INFO.put("BFS", new Info("O(V+E)", "O(V+E)", "O(V+E)", "O(V)",
            "Explores evenly outward from the start and finds shortest paths in unweighted grids.",
            "queue.add(start)\nwhile queue not empty:\n  node = queue.remove()\n  add unvisited neighbors"));
        INFO.put("DFS", new Info("O(V+E)", "O(V+E)", "O(V+E)", "O(V)",
            "Explores deeply down one route before backtracking. It is fast to demonstrate but not shortest-path focused.",
            "stack.push(start)\nwhile stack not empty:\n  node = stack.pop()\n  push unvisited neighbors"));
        INFO.put("Dijkstra", new Info("O(E log V)", "O(E log V)", "O(E log V)", "O(V)",
            "Always expands the currently cheapest known node and handles weighted shortest paths.",
            "dist[start] = 0\npq.add(start)\nwhile pq not empty:\n  current = pq.poll()\n  relax neighbors"));
        INFO.put("A* Search", new Info("O(E)", "O(E)", "O(b^d)", "O(V)",
            "Combines travelled distance with a heuristic estimate to guide the search toward the goal.",
            "open.add(start)\nwhile open not empty:\n  current = lowest f = g + h\n  relax neighbors using heuristic"));
    }

    public static Info get(String name) {
        return INFO.getOrDefault(name,
            new Info("-", "-", "-", "-", "No explanation available.", "No pseudocode available."));
    }
}
