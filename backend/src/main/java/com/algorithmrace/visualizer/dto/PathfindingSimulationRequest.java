package com.algorithmrace.visualizer.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record PathfindingSimulationRequest(
    @NotEmpty List<String> algorithms,
    @Min(8) @Max(40) int rows,
    @Min(8) @Max(60) int cols,
    String mazeType,
    boolean[][] walls
) {}
