package model;

import javafx.beans.property.BooleanProperty;
import javafx.beans.property.IntegerProperty;
import javafx.beans.property.LongProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.beans.property.SimpleIntegerProperty;
import javafx.beans.property.SimpleLongProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
import utils.SoundManager;

public abstract class AlgorithmModel {
    private final StringProperty name = new SimpleStringProperty();
    private final IntegerProperty comparisons = new SimpleIntegerProperty(0);
    private final IntegerProperty swaps = new SimpleIntegerProperty(0);
    private final LongProperty timeMs = new SimpleLongProperty(0);
    private final BooleanProperty done = new SimpleBooleanProperty(false);
    private final BooleanProperty running = new SimpleBooleanProperty(false);
    private final StringProperty complexity = new SimpleStringProperty();
    private final StringProperty status = new SimpleStringProperty("Ready");

    protected int[] array;
    protected int[] highlight = {};
    protected int sortedBoundary;
    
    // Feature Highlighting
    protected int pivotIndex = -1;
    protected int mergeRegionStart = -1;
    protected int mergeRegionEnd = -1;
    protected int heapBoundary = -1;
    protected volatile int stepDelayMs = 50;

    public static boolean soundEnabled = true;

    protected AlgorithmModel(String name, String complexity) {
        this.name.set(name);
        this.complexity.set(complexity);
    }

    public abstract void step();
    public abstract void resetState(int[] newArray);

    protected void swap(int i, int j) {
        int tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
        swaps.set(swaps.get() + 1);
        playSwap();
    }

    protected void compare(int i, int j) {
        highlight = new int[]{i, j};
        comparisons.set(comparisons.get() + 1);
        playCompare();
    }

    protected void markDone() {
        done.set(true);
        running.set(false);
        highlight = new int[]{};
        sortedBoundary = 0;
        pivotIndex = -1;
        mergeRegionStart = -1;
        mergeRegionEnd = -1;
        heapBoundary = -1;
        status.set("Done!");
        playDone();
    }

    public void setArray(int[] arr) {
        this.array = arr.clone();
        this.sortedBoundary = arr.length;
    }

    public int[] getArray() { return array; }
    public int[] getHighlight() { return highlight; }
    public int getSortedBoundary() { return sortedBoundary; }
    public int getPivotIndex() { return pivotIndex; }
    public int getMergeRegionStart() { return mergeRegionStart; }
    public int getMergeRegionEnd() { return mergeRegionEnd; }
    public int getHeapBoundary() { return heapBoundary; }

    public void setStepDelayMs(int ms) { this.stepDelayMs = ms; }
    public int getStepDelayMs() { return stepDelayMs; }

    public StringProperty nameProperty() { return name; }
    public IntegerProperty comparisonsProperty() { return comparisons; }
    public IntegerProperty swapsProperty() { return swaps; }
    public LongProperty timeMsProperty() { return timeMs; }
    public BooleanProperty doneProperty() { return done; }
    public BooleanProperty runningProperty() { return running; }
    public StringProperty complexityProperty() { return complexity; }
    public StringProperty statusProperty() { return status; }

    public String getName() { return name.get(); }
    public int getComparisons() { return comparisons.get(); }
    public int getSwaps() { return swaps.get(); }
    public long getTimeMs() { return timeMs.get(); }
    public boolean isDone() { return done.get(); }
    public boolean isRunning() { return running.get(); }
    public String getComplexity() { return complexity.get(); }
    public String getStatus() { return status.get(); }

    public void setRunning(boolean value) {
        running.set(value);
        if (value) status.set("Running...");
    }

    public void setTimeMs(long ms) { timeMs.set(ms); }
    public void addComparison() {
        comparisons.set(comparisons.get() + 1);
        playCompare();
    }

    public void resetStats() {
        comparisons.set(0);
        swaps.set(0);
        timeMs.set(0);
        done.set(false);
        running.set(false);
        status.set("Ready");
        highlight = new int[]{};
        pivotIndex = -1;
        mergeRegionStart = -1;
        mergeRegionEnd = -1;
        heapBoundary = -1;
    }

    public static void setSoundEnabled(boolean enabled) {
        soundEnabled = enabled;
        SoundManager.setEnabled(enabled);
    }

    public static void playCompare() { if (soundEnabled) SoundManager.playCompare(); }
    public static void playSwap() { if (soundEnabled) SoundManager.playSwap(); }
    public static void playDone() { if (soundEnabled) SoundManager.playDone(); }
    public static void playStart() { if (soundEnabled) SoundManager.playStart(); }
    public static void playReset() { if (soundEnabled) SoundManager.playReset(); }
    public static void playPause() { if (soundEnabled) SoundManager.playPause(); }
    public static void playResume() { if (soundEnabled) SoundManager.playResume(); }
    public static void playWinner() { if (soundEnabled) SoundManager.playWinner(); }
}
