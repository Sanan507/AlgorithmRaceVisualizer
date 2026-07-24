package com.algorithmrace.visualizer.algorithms.sorting;

import com.algorithmrace.visualizer.model.AlgorithmModel;
import java.util.ArrayList;
import java.util.List;

public class CountingSortModel extends AlgorithmModel {
    private final List<int[]> frames = new ArrayList<>();
    private final List<int[]> highlights = new ArrayList<>();
    private int stepIdx;

    public CountingSortModel() {
        super("Counting Sort", "O(n+k)");
    }

    private void generateCountingFrames(int[] inputArr) {
        frames.clear();
        highlights.clear();
        int[] arr = inputArr.clone();

        if (arr.length == 0) return;

        // Record initial state
        frames.add(arr.clone());
        highlights.add(new int[0]);

        int min = arr[0];
        int max = arr[0];
        for (int val : arr) {
            if (val < min) min = val;
            if (val > max) max = val;
        }

        int range = max - min + 1;
        int[] count = new int[range];

        // Phase 1: Count element frequencies
        for (int i = 0; i < arr.length; i++) {
            count[arr[i] - min]++;
            frames.add(arr.clone());
            highlights.add(new int[]{i});
        }

        // Phase 2: Reconstruct sorted array from frequency table
        int arrIdx = 0;
        for (int i = 0; i < range; i++) {
            while (count[i] > 0) {
                arr[arrIdx] = i + min;
                count[i]--;
                frames.add(arr.clone());
                highlights.add(new int[]{arrIdx});
                arrIdx++;
            }
        }

        // Final sorted frame
        frames.add(arr.clone());
        highlights.add(new int[0]);
    }

    @Override
    public void step() {
        if (isDone() || frames.isEmpty()) return;

        if (stepIdx < frames.size()) {
            array = frames.get(stepIdx);
            highlight = highlights.get(stepIdx);
            addSwap(); // Count frequency/write placement step
            stepIdx++;

            if (stepIdx >= frames.size()) {
                markDone();
            }
        } else {
            markDone();
        }
    }

    @Override
    public void resetState(int[] newArray) {
        setArray(newArray);
        resetStats();
        stepIdx = 0;
        generateCountingFrames(newArray);
    }
}
