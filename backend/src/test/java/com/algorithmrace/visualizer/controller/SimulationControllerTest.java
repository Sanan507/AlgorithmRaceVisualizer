package com.algorithmrace.visualizer.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.algorithmrace.visualizer.dto.PathfindingSimulationRequest;
import com.algorithmrace.visualizer.dto.RaceResponse;
import com.algorithmrace.visualizer.dto.SearchingSimulationRequest;
import com.algorithmrace.visualizer.dto.SortingSimulationRequest;
import com.algorithmrace.visualizer.service.SimulationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SimulationController.class)
class SimulationControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @MockBean private SimulationService simulationService;

  @Test
  void sorting_validRequest_success() throws Exception {
    SortingSimulationRequest request =
        new SortingSimulationRequest(List.of("Bubble Sort"), "Random", 50, null);

    RaceResponse response =
        new RaceResponse("sorting", null, null, null, null, new ArrayList<>(), null);

    when(simulationService.simulateSorting(any(SortingSimulationRequest.class)))
        .thenReturn(response);

    mockMvc
        .perform(
            post("/api/simulations/sorting")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk());
  }

  @Test
  void sorting_emptyAlgorithms_badRequest() throws Exception {
    SortingSimulationRequest request = new SortingSimulationRequest(List.of(), "Random", 50, null);

    mockMvc
        .perform(
            post("/api/simulations/sorting")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Validation Failed"));
  }

  @Test
  void sorting_outOfBoundsSize_badRequest() throws Exception {
    SortingSimulationRequest request =
        new SortingSimulationRequest(List.of("Bubble Sort"), "Random", 161, null);

    mockMvc
        .perform(
            post("/api/simulations/sorting")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Validation Failed"));
  }

  @Test
  void searching_validRequest_success() throws Exception {
    SearchingSimulationRequest request =
        new SearchingSimulationRequest(List.of("Linear Search"), 50, 25, null);

    RaceResponse response =
        new RaceResponse("searching", null, null, null, null, new ArrayList<>(), null);

    when(simulationService.simulateSearching(any(SearchingSimulationRequest.class)))
        .thenReturn(response);

    mockMvc
        .perform(
            post("/api/simulations/searching")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk());
  }

  @Test
  void searching_emptyAlgorithms_badRequest() throws Exception {
    SearchingSimulationRequest request = new SearchingSimulationRequest(List.of(), 50, 25, null);

    mockMvc
        .perform(
            post("/api/simulations/searching")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Validation Failed"));
  }

  @Test
  void searching_outOfBoundsSize_badRequest() throws Exception {
    SearchingSimulationRequest request =
        new SearchingSimulationRequest(List.of("Linear Search"), 0, 25, null);

    mockMvc
        .perform(
            post("/api/simulations/searching")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Validation Failed"));
  }

  @Test
  void pathfinding_validRequest_success() throws Exception {
    PathfindingSimulationRequest request =
        new PathfindingSimulationRequest(
            List.of("BFS"), 20, 20, "Clear Grid", null, null, 0, 0, 19, 19);

    RaceResponse response =
        new RaceResponse("pathfinding", null, null, null, null, new ArrayList<>(), null);

    when(simulationService.simulatePathfinding(any(PathfindingSimulationRequest.class)))
        .thenReturn(response);

    mockMvc
        .perform(
            post("/api/simulations/pathfinding")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk());
  }

  @Test
  void pathfinding_emptyAlgorithms_badRequest() throws Exception {
    PathfindingSimulationRequest request =
        new PathfindingSimulationRequest(List.of(), 20, 20, "Clear Grid", null, null, 0, 0, 19, 19);

    mockMvc
        .perform(
            post("/api/simulations/pathfinding")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Validation Failed"));
  }

  @Test
  void pathfinding_outOfBoundsDimensions_badRequest() throws Exception {
    PathfindingSimulationRequest request =
        new PathfindingSimulationRequest(
            List.of("BFS"), 7, 20, "Clear Grid", null, null, 0, 0, 6, 19);

    mockMvc
        .perform(
            post("/api/simulations/pathfinding")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Validation Failed"));
  }
}
