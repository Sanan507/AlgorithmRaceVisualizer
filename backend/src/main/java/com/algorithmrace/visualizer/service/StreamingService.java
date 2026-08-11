package com.algorithmrace.visualizer.service;

import com.algorithmrace.visualizer.algorithms.pathfinding.CellState;
import com.algorithmrace.visualizer.algorithms.pathfinding.GridCell;
import com.algorithmrace.visualizer.algorithms.pathfinding.PathfindingFactory;
import com.algorithmrace.visualizer.algorithms.pathfinding.PathfindingModel;
import com.algorithmrace.visualizer.algorithms.searching.SearchModel;
import com.algorithmrace.visualizer.algorithms.searching.SearchingAlgorithmFactory;
import com.algorithmrace.visualizer.algorithms.sorting.SortingAlgorithmFactory;
import com.algorithmrace.visualizer.dto.LaneFrameEvent;
import com.algorithmrace.visualizer.dto.LaneStats;
import com.algorithmrace.visualizer.dto.PathfindingSimulationRequest;
import com.algorithmrace.visualizer.dto.PointDto;
import com.algorithmrace.visualizer.dto.RaceLaneResponse;
import com.algorithmrace.visualizer.dto.RaceResponse;
import com.algorithmrace.visualizer.dto.SearchingSimulationRequest;
import com.algorithmrace.visualizer.dto.SimulationFrame;
import com.algorithmrace.visualizer.dto.SortingSimulationRequest;
import com.algorithmrace.visualizer.model.AlgorithmModel;
import com.algorithmrace.visualizer.utils.ArrayGenerator;
import com.algorithmrace.visualizer.utils.ComplexityCatalog;
import com.algorithmrace.visualizer.utils.MazeGenerator;
import jakarta.annotation.PreDestroy;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class StreamingService {
  private static final int MAX_FRAMES = 5000;
  private static final int MAX_ARRAY_SIZE = 100;
  private static final int MAX_LANES = 6;
  private static final int MAX_GRID_ROWS = 40;
  private static final int MAX_GRID_COLS = 60;

  private static final int SORT_FRAME_MS = 16;
  private static final int SEARCH_FRAME_MS = 18;
  private static final int PATH_FRAME_MS = 20;

  private final ExecutorService executor = Executors.newCachedThreadPool();

  @PreDestroy
  public void shutdown() {
    executor.shutdown();
  }

  public SseEmitter streamSorting(SortingSimulationRequest request) {
    SseEmitter emitter = new SseEmitter(0L); // Infinite timeout
    executor.execute(
        () -> {
          try {
            int[] dataset = resolveSortingDataset(request);
            List<String> algos = sanitizeAlgorithms(request.algorithms());
            RaceResponse initialResponse =
                new RaceResponse("sorting", dataset, null, null, null, new ArrayList<>(), null);
            emitter.send(SseEmitter.event().name("START").data(initialResponse));

            List<RaceLaneResponse> lanes = new ArrayList<>();
            for (String algo : algos) {
              lanes.add(streamSortingLane(algo, dataset.clone(), emitter));
            }

            RaceResponse finalResponse =
                new RaceResponse(
                    "sorting", dataset, null, null, null, new ArrayList<>(), winner(lanes));
            emitter.send(SseEmitter.event().name("END").data(finalResponse));
            emitter.complete();
          } catch (Exception e) {
            emitter.completeWithError(e);
          }
        });
    return emitter;
  }

  public SseEmitter streamSearching(SearchingSimulationRequest request) {
    SseEmitter emitter = new SseEmitter(0L);
    executor.execute(
        () -> {
          try {
            int[] dataset = resolveSearchingDataset(request);
            if (dataset.length == 0) {
              throw new IllegalArgumentException("Dataset must contain at least one element.");
            }
            int target =
                request.target() != null
                    ? request.target()
                    : dataset[ThreadLocalRandom.current().nextInt(dataset.length)];

            List<String> algos = sanitizeAlgorithms(request.algorithms());
            RaceResponse initialResponse =
                new RaceResponse("searching", dataset, target, null, null, new ArrayList<>(), null);
            emitter.send(SseEmitter.event().name("START").data(initialResponse));

            List<RaceLaneResponse> lanes = new ArrayList<>();
            for (String algo : algos) {
              lanes.add(streamSearchingLane(algo, dataset.clone(), target, emitter));
            }

            RaceResponse finalResponse =
                new RaceResponse(
                    "searching", dataset, target, null, null, new ArrayList<>(), winner(lanes));
            emitter.send(SseEmitter.event().name("END").data(finalResponse));
            emitter.complete();
          } catch (Exception e) {
            emitter.completeWithError(e);
          }
        });
    return emitter;
  }

  public SseEmitter streamPathfinding(PathfindingSimulationRequest request) {
    SseEmitter emitter = new SseEmitter(0L);
    executor.execute(
        () -> {
          try {
            int rows =
                Math.min(MAX_GRID_ROWS, Math.max(5, request.rows() <= 0 ? 18 : request.rows()));
            int cols =
                Math.min(MAX_GRID_COLS, Math.max(5, request.cols() <= 0 ? 28 : request.cols()));

            int startRow =
                request.startRow() != null
                    ? Math.min(rows - 1, Math.max(0, request.startRow()))
                    : 2;
            int startCol =
                request.startCol() != null
                    ? Math.min(cols - 1, Math.max(0, request.startCol()))
                    : 2;
            int endRow =
                request.endRow() != null
                    ? Math.min(rows - 1, Math.max(0, request.endRow()))
                    : rows - 3;
            int endCol =
                request.endCol() != null
                    ? Math.min(cols - 1, Math.max(0, request.endCol()))
                    : cols - 3;

            boolean[][] walls;
            if (request.walls() != null) {
              walls = sanitizeWalls(request.walls(), rows, cols);
            } else {
              walls =
                  MazeGenerator.generate(
                      rows,
                      cols,
                      startRow,
                      startCol,
                      endRow,
                      endCol,
                      MazeGenerator.fromName(request.mazeType()));
            }

            int[][] weights;
            if (request.weights() != null) {
              weights = sanitizeWeights(request.weights(), rows, cols);
            } else {
              weights =
                  MazeGenerator.generateWeights(
                      rows, cols, MazeGenerator.fromName(request.mazeType()));
            }

            List<String> algos = sanitizeAlgorithms(request.algorithms());
            RaceResponse initialResponse =
                new RaceResponse(
                    "pathfinding", null, null, walls, weights, new ArrayList<>(), null);
            emitter.send(SseEmitter.event().name("START").data(initialResponse));

            List<RaceLaneResponse> lanes = new ArrayList<>();
            for (String algo : algos) {
              lanes.add(
                  streamPathLane(
                      algo, rows, cols, startRow, startCol, endRow, endCol, walls, weights,
                      emitter));
            }

            RaceResponse finalResponse =
                new RaceResponse(
                    "pathfinding", null, null, walls, weights, new ArrayList<>(), winner(lanes));
            emitter.send(SseEmitter.event().name("END").data(finalResponse));
            emitter.complete();
          } catch (Exception e) {
            emitter.completeWithError(e);
          }
        });
    return emitter;
  }

  private RaceLaneResponse streamSortingLane(String name, int[] dataset, SseEmitter emitter)
      throws IOException {
    AlgorithmModel model = SortingAlgorithmFactory.create(name);
    model.resetState(dataset);

    List<SimulationFrame> frames = new ArrayList<>();
    SimulationFrame initialFrame = sortFrame(0, model);
    frames.add(initialFrame);
    emitter.send(SseEmitter.event().name("FRAME").data(new LaneFrameEvent(name, initialFrame)));

    int frame = 1;
    while (!model.isDone() && frame < MAX_FRAMES) {
      model.step();
      model.setTimeMs((long) frame * SORT_FRAME_MS);
      SimulationFrame sFrame = sortFrame(frame, model);
      frames.add(sFrame);
      emitter.send(SseEmitter.event().name("FRAME").data(new LaneFrameEvent(name, sFrame)));
      frame++;
    }

    LaneStats stats =
        new LaneStats(model.getComparisons(), model.getSwaps(), 0, model.getTimeMs(), false, null);
    return new RaceLaneResponse(
        name, model.getComplexity(), ComplexityCatalog.get(name), frames, stats);
  }

  private RaceLaneResponse streamSearchingLane(
      String name, int[] dataset, int target, SseEmitter emitter) throws IOException {
    SearchModel model = SearchingAlgorithmFactory.create(name);
    model.resetState(dataset);
    model.setTarget(target);

    List<SimulationFrame> frames = new ArrayList<>();
    SimulationFrame initialFrame = searchFrame(0, model);
    frames.add(initialFrame);
    emitter.send(SseEmitter.event().name("FRAME").data(new LaneFrameEvent(name, initialFrame)));

    int frame = 1;
    while (!model.isDone() && frame < MAX_FRAMES) {
      model.step();
      model.setTimeMs((long) frame * SEARCH_FRAME_MS);
      SimulationFrame sFrame = searchFrame(frame, model);
      frames.add(sFrame);
      emitter.send(SseEmitter.event().name("FRAME").data(new LaneFrameEvent(name, sFrame)));
      frame++;
    }

    LaneStats stats =
        new LaneStats(
            model.getComparisons(),
            0,
            0,
            model.getTimeMs(),
            model.getFoundIndex() >= 0,
            model.getFoundIndex());
    return new RaceLaneResponse(
        name, model.getComplexity(), ComplexityCatalog.get(name), frames, stats);
  }

  private RaceLaneResponse streamPathLane(
      String name,
      int rows,
      int cols,
      int startRow,
      int startCol,
      int endRow,
      int endCol,
      boolean[][] walls,
      int[][] weights,
      SseEmitter emitter)
      throws IOException {

    PathfindingModel model = PathfindingFactory.create(name);
    model.initGrid(rows, cols);
    for (int r = 0; r < rows; r++) {
      for (int c = 0; c < cols; c++) {
        if (r < walls.length && c < walls[r].length && walls[r][c]) {
          model.getGrid()[r][c].state = CellState.WALL;
        }
        if (weights != null && r < weights.length && c < weights[r].length) {
          model.getGrid()[r][c].weight = Math.max(1, weights[r][c]);
        }
      }
    }
    model.start = model.getGrid()[startRow][startCol];
    model.end = model.getGrid()[endRow][endCol];
    model.start.state = CellState.START;
    model.end.state = CellState.END;
    model.reset();

    List<SimulationFrame> frames = new ArrayList<>();
    SimulationFrame initialFrame = pathFrame(0, model, 0);
    frames.add(initialFrame);
    emitter.send(SseEmitter.event().name("FRAME").data(new LaneFrameEvent(name, initialFrame)));

    int frame = 1;
    while (!model.isDone() && frame < MAX_FRAMES) {
      model.step();
      if (model.isPathFound()) {
        markPath(model);
      }
      SimulationFrame sFrame = pathFrame(frame, model, (long) frame * PATH_FRAME_MS);
      frames.add(sFrame);
      emitter.send(SseEmitter.event().name("FRAME").data(new LaneFrameEvent(name, sFrame)));
      frame++;
    }

    LaneStats stats =
        new LaneStats(
            0,
            0,
            model.getSteps(),
            (long) Math.max(0, frame - 1) * PATH_FRAME_MS,
            model.isPathFound(),
            null);
    return new RaceLaneResponse(
        name, ComplexityCatalog.get(name).average(), ComplexityCatalog.get(name), frames, stats);
  }

  // --- Helper Methods (Copied/Adapted from SimulationService) ---

  private int[][] sanitizeWeights(int[][] clientWeights, int rows, int cols) {
    int[][] safe = new int[rows][cols];
    for (int r = 0; r < rows; r++) {
      for (int c = 0; c < cols; c++) {
        safe[r][c] = 1;
      }
    }
    if (clientWeights == null) return safe;
    int srcRows = Math.min(clientWeights.length, rows);
    for (int r = 0; r < srcRows; r++) {
      if (clientWeights[r] != null) {
        int srcCols = Math.min(clientWeights[r].length, cols);
        for (int c = 0; c < srcCols; c++) {
          safe[r][c] = Math.max(1, clientWeights[r][c]);
        }
      }
    }
    return safe;
  }

  private boolean[][] sanitizeWalls(boolean[][] clientWalls, int rows, int cols) {
    boolean[][] safe = new boolean[rows][cols];
    if (clientWalls == null) return safe;
    int srcRows = Math.min(clientWalls.length, rows);
    for (int r = 0; r < srcRows; r++) {
      if (clientWalls[r] != null) {
        int srcCols = Math.min(clientWalls[r].length, cols);
        System.arraycopy(clientWalls[r], 0, safe[r], 0, srcCols);
      }
    }
    return safe;
  }

  private List<String> sanitizeAlgorithms(List<String> inputAlgos) {
    if (inputAlgos == null || inputAlgos.isEmpty()) {
      return List.of();
    }
    return inputAlgos.stream()
        .filter(name -> name != null && !name.isBlank())
        .limit(MAX_LANES)
        .toList();
  }

  private int[] resolveSortingDataset(SortingSimulationRequest request) {
    if (request.customArray() != null && !request.customArray().isEmpty()) {
      return request.customArray().stream()
          .limit(MAX_ARRAY_SIZE)
          .mapToInt(Integer::intValue)
          .toArray();
    }
    int size = Math.min(MAX_ARRAY_SIZE, Math.max(2, request.size() <= 0 ? 30 : request.size()));
    return ArrayGenerator.generate(size, ArrayGenerator.fromLabel(request.datasetType()));
  }

  private int[] resolveSearchingDataset(SearchingSimulationRequest request) {
    if (request.dataset() != null && !request.dataset().isEmpty()) {
      return request.dataset().stream().limit(MAX_ARRAY_SIZE).mapToInt(Integer::intValue).toArray();
    }
    int size = Math.min(MAX_ARRAY_SIZE, Math.max(2, request.size() <= 0 ? 42 : request.size()));
    return ArrayGenerator.generate(size, ArrayGenerator.ArrayType.RANDOM);
  }

  private SimulationFrame sortFrame(int frame, AlgorithmModel model) {
    return new SimulationFrame(
        frame,
        model.getArray().clone(),
        model.getHighlight().clone(),
        model.getSortedBoundary(),
        model.getPivotIndex(),
        model.getMergeRegionStart(),
        model.getMergeRegionEnd(),
        model.getHeapBoundary(),
        model.getComparisons(),
        model.getSwaps(),
        model.getTimeMs(),
        model.isDone(),
        model.getStatus(),
        null,
        new int[0],
        null,
        List.of(),
        0,
        false);
  }

  private SimulationFrame searchFrame(int frame, SearchModel model) {
    return new SimulationFrame(
        frame,
        model.getArray().clone(),
        model.getHighlight().clone(),
        model.getSortedBoundary(),
        model.getPivotIndex(),
        model.getMergeRegionStart(),
        model.getMergeRegionEnd(),
        model.getHeapBoundary(),
        model.getComparisons(),
        model.getSwaps(),
        model.getTimeMs(),
        model.isDone(),
        model.getStatus(),
        model.getFoundIndex(),
        model.getSearchPath().clone(),
        null,
        List.of(),
        0,
        false);
  }

  private SimulationFrame pathFrame(int frame, PathfindingModel model, long timeMs) {
    return new SimulationFrame(
        frame,
        new int[0],
        new int[0],
        0,
        -1,
        -1,
        -1,
        -1,
        0,
        0,
        timeMs,
        model.isDone(),
        model.isDone() ? "Done" : "Running",
        null,
        new int[0],
        gridState(model.getGrid()),
        model.getPath().stream().map(cell -> new PointDto(cell.row, cell.col)).toList(),
        model.getSteps(),
        model.isPathFound());
  }

  private String[][] gridState(GridCell[][] grid) {
    String[][] states = new String[grid.length][grid[0].length];
    for (int r = 0; r < grid.length; r++) {
      for (int c = 0; c < grid[r].length; c++) {
        states[r][c] = grid[r][c].state.name();
      }
    }
    return states;
  }

  private void markPath(PathfindingModel model) {
    for (GridCell cell : model.getPath()) {
      if (cell.state != CellState.START && cell.state != CellState.END) {
        cell.state = CellState.PATH;
      }
    }
  }

  private String winner(List<RaceLaneResponse> lanes) {
    return lanes.stream()
        .min(Comparator.comparingLong(lane -> lane.stats().timeMs()))
        .map(RaceLaneResponse::algorithm)
        .orElse(null);
  }
}
