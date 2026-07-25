package com.algorithmrace.visualizer.controller;

import com.algorithmrace.visualizer.dto.PathfindingSimulationRequest;
import com.algorithmrace.visualizer.dto.RaceResponse;
import com.algorithmrace.visualizer.dto.SearchingSimulationRequest;
import com.algorithmrace.visualizer.dto.SortingSimulationRequest;
import com.algorithmrace.visualizer.service.SimulationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/simulations")
@Tag(name = "Simulations", description = "Endpoints for running algorithm race simulations")
public class SimulationController {
    private final SimulationService simulationService;

    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @Operation(
        summary = "Run sorting simulation", 
        description = "Executes sorting algorithm simulations and returns step-by-step race performance data."
    )
    @ApiResponse(responseCode = "200", description = "Sorting simulation executed successfully")
    @PostMapping("/sorting")
    public RaceResponse sorting(@Valid @RequestBody SortingSimulationRequest request) {
        return simulationService.simulateSorting(request);
    }

    @Operation(
        summary = "Run searching simulation", 
        description = "Executes searching algorithm simulations and returns step-by-step race performance data."
    )
    @ApiResponse(responseCode = "200", description = "Searching simulation executed successfully")
    @PostMapping("/searching")
    public RaceResponse searching(@Valid @RequestBody SearchingSimulationRequest request) {
        return simulationService.simulateSearching(request);
    }

    @Operation(
        summary = "Run pathfinding simulation", 
        description = "Executes pathfinding algorithm simulations and returns step-by-step race performance data."
    )
    @ApiResponse(responseCode = "200", description = "Pathfinding simulation executed successfully")
    @PostMapping("/pathfinding")
    public RaceResponse pathfinding(@Valid @RequestBody PathfindingSimulationRequest request) {
        return simulationService.simulatePathfinding(request);
    }
}