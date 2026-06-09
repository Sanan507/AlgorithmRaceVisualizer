package com.algorithmrace.visualizer.dto;

import java.util.List;

public record SimulationFrame(
    int frame,
    int[] array,
    int[] highlight,
    int sortedBoundary,
    int pivotIndex,
    int mergeRegionStart,
    int mergeRegionEnd,
    int heapBoundary,
    int comparisons,
    int swaps,
    long timeMs,
    boolean done,
    String status,
    Integer foundIndex,
    int[] searchPath,
    String[][] grid,
    List<PointDto> path,
    int steps,
    boolean pathFound
) {}
