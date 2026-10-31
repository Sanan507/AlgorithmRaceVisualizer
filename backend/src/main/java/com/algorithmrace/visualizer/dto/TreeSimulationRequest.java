package com.algorithmrace.visualizer.dto;

import jakarta.validation.constraints.Size;
import java.util.List;

public record TreeSimulationRequest(
    String treeType,
    String operation,
    @Size(max = 200) List<Integer> values,
    Integer target,
    String traversalType) {}
