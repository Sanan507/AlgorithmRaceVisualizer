package com.algorithmrace.visualizer.algorithms.sorting;

import com.algorithmrace.visualizer.model.AlgorithmModel;
import java.util.ArrayList;
import java.util.List;

public class TimSortModel extends AlgorithmModel {
  private final List<int[]> frames = new ArrayList<>();
  private final List<int[]> highlights = new ArrayList<>();
  private final List<Integer> comparisonsList = new ArrayList<>();
  private final List<Integer> swapsList = new ArrayList<>();

  private int stepIdx;
  private int currentComparisons = 0;
  private int currentSwaps = 0;

  private static final int MIN_MERGE = 32;

  public TimSortModel() {
    super("Tim Sort", "O(n log n)");
  }

  private void generateFrames(int[] inputArr) {
    frames.clear();
    highlights.clear();
    comparisonsList.clear();
    swapsList.clear();
    currentComparisons = 0;
    currentSwaps = 0;

    int[] arr = inputArr.clone();
    int n = arr.length;

    if (n == 0) return;

    recordFrame(arr, new int[0]);

    for (int i = 0; i < n; i += MIN_MERGE) {
      insertionSort(arr, i, Math.min((i + MIN_MERGE - 1), (n - 1)));
    }

    for (int size = MIN_MERGE; size < n; size = 2 * size) {
      for (int left = 0; left < n; left += 2 * size) {
        int mid = left + size - 1;
        int right = Math.min((left + 2 * size - 1), (n - 1));

        if (mid < right) {
          merge(arr, left, mid, right);
        }
      }
    }

    recordFrame(arr, new int[0]);
  }

  private void insertionSort(int[] arr, int left, int right) {
    for (int i = left + 1; i <= right; i++) {
      int temp = arr[i];
      int j = i - 1;
      recordFrame(arr, new int[] {i});

      while (j >= left) {
        currentComparisons++;
        recordFrame(arr, new int[] {j, j + 1});
        if (arr[j] <= temp) {
          break;
        }
        arr[j + 1] = arr[j];
        currentSwaps++;
        recordFrame(arr, new int[] {j, j + 1});
        j--;
      }
      if (arr[j + 1] != temp) {
        arr[j + 1] = temp;
        recordFrame(arr, new int[] {j + 1});
      }
    }
  }

  private void merge(int[] arr, int l, int m, int r) {
    int len1 = m - l + 1;
    int len2 = r - m;
    int[] left = new int[len1];
    int[] right = new int[len2];

    for (int x = 0; x < len1; x++) left[x] = arr[l + x];
    for (int x = 0; x < len2; x++) right[x] = arr[m + 1 + x];

    int i = 0;
    int j = 0;
    int k = l;

    while (i < len1 && j < len2) {
      currentComparisons++;
      if (left[i] <= right[j]) {
        arr[k] = left[i];
        i++;
      } else {
        arr[k] = right[j];
        currentSwaps++;
        j++;
      }
      recordFrame(arr, new int[] {k});
      k++;
    }

    while (i < len1) {
      arr[k] = left[i];
      recordFrame(arr, new int[] {k});
      k++;
      i++;
    }

    while (j < len2) {
      arr[k] = right[j];
      recordFrame(arr, new int[] {k});
      k++;
      j++;
    }
  }

  private void recordFrame(int[] arr, int[] highlight) {
    frames.add(arr.clone());
    highlights.add(highlight.clone());
    comparisonsList.add(currentComparisons);
    swapsList.add(currentSwaps);
  }

  @Override
  public void step() {
    if (isDone() || frames.isEmpty()) return;

    if (stepIdx < frames.size()) {
      array = frames.get(stepIdx);
      highlight = highlights.get(stepIdx);

      // Update inherited stats
      int targetComparisons = comparisonsList.get(stepIdx);
      int targetSwaps = swapsList.get(stepIdx);
      while (getComparisons() < targetComparisons) addComparison();
      while (getSwaps() < targetSwaps) addSwap();

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
    generateFrames(newArray);
  }
}
