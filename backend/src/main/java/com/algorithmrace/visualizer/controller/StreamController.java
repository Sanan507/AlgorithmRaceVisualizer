package com.algorithmrace.visualizer.controller;

import com.algorithmrace.visualizer.dto.PathfindingSimulationRequest;
import com.algorithmrace.visualizer.dto.SearchingSimulationRequest;
import com.algorithmrace.visualizer.dto.SortingSimulationRequest;
import com.algorithmrace.visualizer.service.StreamingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/simulations/stream")
@Tag(name = "Stream", description = "Endpoints for streaming algorithm simulations via SSE")
public class StreamController {

  private final StreamingService streamingService;

  public StreamController(StreamingService streamingService) {
    this.streamingService = streamingService;
  }

  @Operation(summary = "Stream sorting simulation")
  @GetMapping("/sorting")
  public SseEmitter streamSorting(@ModelAttribute SortingSimulationRequest request) {
    return streamingService.streamSorting(request);
  }

  @Operation(summary = "Stream searching simulation")
  @GetMapping("/searching")
  public SseEmitter streamSearching(@ModelAttribute SearchingSimulationRequest request) {
    return streamingService.streamSearching(request);
  }

  @Operation(summary = "Stream pathfinding simulation")
  @GetMapping("/pathfinding")
  public SseEmitter streamPathfinding(@ModelAttribute PathfindingSimulationRequest request) {
    return streamingService.streamPathfinding(request);
  }
}
