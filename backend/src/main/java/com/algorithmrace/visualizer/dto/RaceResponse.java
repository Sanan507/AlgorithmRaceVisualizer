package com.algorithmrace.visualizer.dto;

import java.util.List;

public record RaceResponse(
    String type,
    int[] dataset,
    Integer target,
    boolean[][] walls,
    int[][] weights,
    List<RaceLaneResponse> lanes,
    String winner) {}
