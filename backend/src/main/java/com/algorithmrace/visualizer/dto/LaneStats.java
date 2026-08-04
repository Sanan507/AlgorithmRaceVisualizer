package com.algorithmrace.visualizer.dto;

public record LaneStats(
    long comparisons, long swaps, long steps, long timeMs, boolean found, Integer foundIndex) {}
