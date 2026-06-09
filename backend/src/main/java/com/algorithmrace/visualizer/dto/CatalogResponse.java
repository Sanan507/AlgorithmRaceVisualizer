package com.algorithmrace.visualizer.dto;

import com.algorithmrace.visualizer.model.ComplexityInfo;

import java.util.List;
import java.util.Map;

public record CatalogResponse(
    List<String> sortingAlgorithms,
    List<String> searchingAlgorithms,
    List<String> pathfindingAlgorithms,
    List<String> datasetTypes,
    List<String> mazeTypes,
    Map<String, ComplexityInfo> complexity
) {}
