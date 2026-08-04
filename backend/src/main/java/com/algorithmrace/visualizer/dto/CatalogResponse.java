package com.algorithmrace.visualizer.dto;

import com.algorithmrace.visualizer.model.ComplexityInfo;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public record CatalogResponse(
    @JsonProperty("sortingAlgorithms") List<String> sortingAlgorithms,
    @JsonProperty("searchingAlgorithms") List<String> searchingAlgorithms,
    @JsonProperty("pathfindingAlgorithms") List<String> pathfindingAlgorithms,
    @JsonProperty("datasetTypes") List<String> datasetTypes,
    @JsonProperty("mazeTypes") List<String> mazeTypes,
    @JsonProperty("complexity") Map<String, ComplexityInfo> complexity) {

  public List<String> sorting() {
    return sortingAlgorithms;
  }

  public List<String> searching() {
    return searchingAlgorithms;
  }

  public List<String> pathfinding() {
    return pathfindingAlgorithms;
  }

  public List<String> arrayModes() {
    return datasetTypes;
  }

  public Map<String, ComplexityInfo> complexities() {
    return complexity;
  }
}
