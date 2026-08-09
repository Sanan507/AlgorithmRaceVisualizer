package com.algorithmrace.visualizer.algorithms.searching;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class TernarySearchModel extends SearchModel {
  private int low;
  private int high;
  private final List<Integer> visited = new ArrayList<>();

  public TernarySearchModel() {
    super("Ternary Search", "O(log3 n)");
  }

  @Override
  public void step() {
    if (isDone()) return;
    if (low > high) {
      markDone();
      return;
    }

    int mid1 = low + (high - low) / 3;
    int mid2 = high - (high - low) / 3;

    addComparison();
    highlight = new int[] {low, mid1, mid2, high};
    visited.add(mid1);
    visited.add(mid2);
    searchPath = visited.stream().mapToInt(Integer::intValue).toArray();

    if (array[mid1] == target) {
      foundIndex = mid1;
      markDone();
      return;
    }

    addComparison();
    if (array[mid2] == target) {
      foundIndex = mid2;
      markDone();
      return;
    }

    addComparison();
    if (target < array[mid1]) {
      high = mid1 - 1;
    } else {
      addComparison();
      if (target > array[mid2]) {
        low = mid2 + 1;
      } else {
        low = mid1 + 1;
        high = mid2 - 1;
      }
    }
  }

  @Override
  public void resetState(int[] newArray) {
    int[] sorted = newArray.clone();
    Arrays.sort(sorted);
    setArray(sorted);
    resetStats();
    low = 0;
    high = array.length - 1;
    foundIndex = -1;
    visited.clear();
    searchPath = new int[0];
  }
}
