package com.algorithmrace.visualizer.dto;

import java.util.List;

public record TreeSimulationResponse(
    String treeType, List<TreeSimulationFrame> frames, List<Integer> traversalOutput) {}
