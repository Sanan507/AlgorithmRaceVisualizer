package com.algorithmrace.visualizer.model;

public abstract class AlgorithmModel {
    private final String name;
    private final String complexity;
    private int comparisons;
    private int swaps;
    private long timeMs;
    private boolean done;
    private String status = "Ready";

    protected int[] array = new int[0];
    protected int[] highlight = new int[0];
    protected int sortedBoundary;
    protected int pivotIndex = -1;
    protected int mergeRegionStart = -1;
    protected int mergeRegionEnd = -1;
    protected int heapBoundary = -1;

    protected AlgorithmModel(String name, String complexity) {
        this.name = name;
        this.complexity = complexity;
    }

    public abstract void step();
    public abstract void resetState(int[] newArray);

    protected void swap(int i, int j) {
        int tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
        swaps++;
    }

    protected void compare(int i, int j) {
        highlight = new int[]{i, j};
        comparisons++;
    }

    protected void markDone() {
        done = true;
        highlight = new int[0];
        sortedBoundary = 0;
        pivotIndex = -1;
        mergeRegionStart = -1;
        mergeRegionEnd = -1;
        heapBoundary = -1;
        status = "Done";
    }

    public void setArray(int[] arr) {
        array = arr.clone();
        sortedBoundary = arr.length;
    }

    public void addComparison() {
        comparisons++;
    }

    public void addSwap() {
        swaps++;
    }

    public void resetStats() {
        comparisons = 0;
        swaps = 0;
        timeMs = 0;
        done = false;
        status = "Ready";
        highlight = new int[0];
        pivotIndex = -1;
        mergeRegionStart = -1;
        mergeRegionEnd = -1;
        heapBoundary = -1;
    }

    public String getName() { return name; }
    public String getComplexity() { return complexity; }
    public int getComparisons() { return comparisons; }
    public int getSwaps() { return swaps; }
    public long getTimeMs() { return timeMs; }
    public boolean isDone() { return done; }
    public String getStatus() { return status; }
    public int[] getArray() { return array; }
    public int[] getHighlight() { return highlight; }
    public int getSortedBoundary() { return sortedBoundary; }
    public int getPivotIndex() { return pivotIndex; }
    public int getMergeRegionStart() { return mergeRegionStart; }
    public int getMergeRegionEnd() { return mergeRegionEnd; }
    public int getHeapBoundary() { return heapBoundary; }
    public void setTimeMs(long timeMs) { this.timeMs = timeMs; }
    public void setStatus(String status) { this.status = status; }
}
