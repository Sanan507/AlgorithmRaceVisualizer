package com.algorithmrace.visualizer.dto;

import com.algorithmrace.visualizer.model.ComplexityInfo;

import java.util.List;

public record RaceLaneResponse(
    String name,
    String complexity,
    ComplexityInfo complexityInfo,
    List<SimulationFrame> frames,
    LaneStats stats
) {}
