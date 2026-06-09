package com.algorithmrace.visualizer.dto;

public record LaneStats(
    int comparisons,
    int swaps,
    int steps,
    long timeMs,
    boolean found,
    Integer foundIndex
) {}
