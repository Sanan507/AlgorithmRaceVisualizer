package com.algorithmrace.visualizer.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SearchingSimulationRequest(
    @NotEmpty List<String> algorithms,
    @Min(2) @Max(160) int size,
    Integer target,
    List<Integer> dataset
) {}
