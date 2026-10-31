package com.algorithmrace.visualizer.algorithms.sorting;

import com.algorithmrace.visualizer.model.AlgorithmModel;
import java.util.ArrayList;
import java.util.List;

public class RadixSortModel extends AlgorithmModel {
  private final List<int[]> frames = new ArrayList<>();
  private final List<int[]> highlights = new ArrayList<>();
  private int stepIdx;

  public RadixSortModel() {
    super("Radix Sort", "O(nk)");
  }

  private void generateRadixFrames(int[] inputArr) {
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

    long maxShifted = (long) max - min;
    for (long exp = 1; maxShifted / exp > 0 || (maxShifted == 0 && exp == 1); exp *= 10) {
      List<List<Integer>> buckets = new ArrayList<>();
      for (int b = 0; b < 10; b++) {
        buckets.add(new ArrayList<>());
      }

      // Distribute items into buckets according to shifted non-negative digit
      for (int i = 0; i < arr.length; i++) {
        long shifted = (long) arr[i] - min;
        int digit = (int) ((shifted / exp) % 10);
        buckets.get(digit).add(arr[i]);
        frames.add(arr.clone());
        highlights.add(new int[] {i});
      }

      // Collect items back into array
      int idx = 0;
      for (int b = 0; b < 10; b++) {
        for (int val : buckets.get(b)) {
          arr[idx] = val;
          frames.add(arr.clone());
          highlights.add(new int[] {idx});
          idx++;
        }
      }

      if (maxShifted == 0) {
        break;
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
      addSwap(); // Count digit placement / array write step
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
    generateRadixFrames(newArray);
  }
}
