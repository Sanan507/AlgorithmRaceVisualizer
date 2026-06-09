package com.algorithmrace.visualizer.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SortingSimulationRequest(
    @NotEmpty List<String> algorithms,
    String datasetType,
    @Min(2) @Max(160) int size,
    List<Integer> customArray
) {}
