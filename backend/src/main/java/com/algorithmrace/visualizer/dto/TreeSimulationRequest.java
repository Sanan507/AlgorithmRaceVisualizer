package com.algorithmrace.visualizer.dto;

import java.util.List;

public record TreeSimulationRequest(
    String treeType,
    String operation,
    List<Integer> values,
    Integer target,
    String traversalType) {}
