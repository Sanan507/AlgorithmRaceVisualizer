package model;

public class RaceRecord {
    public final String algorithm;
    public final int arraySize;
    public final String dataset;
    public final int comparisons;
    public final int swaps;
    public final long timeMs;
    public final String timestamp;

    public RaceRecord(String algorithm, int arraySize, String dataset, int comparisons, int swaps, long timeMs, String timestamp) {
        this.algorithm = algorithm;
        this.arraySize = arraySize;
        this.dataset = dataset;
        this.comparisons = comparisons;
        this.swaps = swaps;
        this.timeMs = timeMs;
        this.timestamp = timestamp;
    }

    public String getAlgorithm() { return algorithm; }
    public int getArraySize() { return arraySize; }
    public String getDataset() { return dataset; }
    public int getComparisons() { return comparisons; }
    public int getSwaps() { return swaps; }
    public long getTimeMs() { return timeMs; }
    public String getTimestamp() { return timestamp; }
}
