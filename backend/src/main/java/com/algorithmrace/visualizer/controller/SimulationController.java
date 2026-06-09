package com.algorithmrace.visualizer.controller;

import com.algorithmrace.visualizer.dto.PathfindingSimulationRequest;
import com.algorithmrace.visualizer.dto.RaceResponse;
import com.algorithmrace.visualizer.dto.SearchingSimulationRequest;
import com.algorithmrace.visualizer.dto.SortingSimulationRequest;
import com.algorithmrace.visualizer.service.SimulationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/simulations")
public class SimulationController {
    private final SimulationService simulationService;

    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @PostMapping("/sorting")
    public RaceResponse sorting(@Valid @RequestBody SortingSimulationRequest request) {
        return simulationService.simulateSorting(request);
    }

    @PostMapping("/searching")
    public RaceResponse searching(@Valid @RequestBody SearchingSimulationRequest request) {
        return simulationService.simulateSearching(request);
    }

    @PostMapping("/pathfinding")
    public RaceResponse pathfinding(@Valid @RequestBody PathfindingSimulationRequest request) {
        return simulationService.simulatePathfinding(request);
    }
}
