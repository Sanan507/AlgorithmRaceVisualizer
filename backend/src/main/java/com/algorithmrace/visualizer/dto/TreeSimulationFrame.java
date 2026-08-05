package com.algorithmrace.visualizer.dto;

import java.util.List;

public record TreeSimulationFrame(
    int frameIndex,
    TreeNodeDto root,
    Integer activeNodeVal,
    List<Integer> highlightNodes,
    String explanation,
    String eventType,
    String rotationType,
    int codeLine) {}
