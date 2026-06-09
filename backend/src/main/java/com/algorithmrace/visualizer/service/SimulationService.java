package com.algorithmrace.visualizer.service;

import com.algorithmrace.visualizer.algorithms.pathfinding.CellState;
import com.algorithmrace.visualizer.algorithms.pathfinding.GridCell;
import com.algorithmrace.visualizer.algorithms.pathfinding.PathfindingFactory;
import com.algorithmrace.visualizer.algorithms.pathfinding.PathfindingModel;
import com.algorithmrace.visualizer.algorithms.searching.SearchModel;
import com.algorithmrace.visualizer.algorithms.searching.SearchingAlgorithmFactory;
import com.algorithmrace.visualizer.algorithms.sorting.SortingAlgorithmFactory;
import com.algorithmrace.visualizer.dto.*;
import com.algorithmrace.visualizer.model.AlgorithmModel;
import com.algorithmrace.visualizer.utils.ArrayGenerator;
import com.algorithmrace.visualizer.utils.ComplexityCatalog;
import com.algorithmrace.visualizer.utils.MazeGenerator;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Random;

@Service
public class SimulationService {
    private static final int MAX_FRAMES = 5000;
    private static final int SORT_FRAME_MS = 16;
    private static final int SEARCH_FRAME_MS = 18;
    private static final int PATH_FRAME_MS = 20;

    public RaceResponse simulateSorting(SortingSimulationRequest request) {
        int[] dataset = resolveSortingDataset(request);
        List<RaceLaneResponse> lanes = request.algorithms().stream()
            .map(name -> simulateSortingLane(name, dataset))
            .toList();
        return new RaceResponse("sorting", dataset, null, null, lanes, winner(lanes));
    }

    public RaceResponse simulateSearching(SearchingSimulationRequest request) {
        int[] dataset = resolveSearchingDataset(request);
        int target = request.target() != null ? request.target() : dataset[new Random().nextInt(dataset.length)];
        List<RaceLaneResponse> lanes = request.algorithms().stream()
            .map(name -> simulateSearchLane(name, dataset, target))
            .toList();
        return new RaceResponse("searching", dataset, target, null, lanes, winner(lanes));
    }

    public RaceResponse simulatePathfinding(PathfindingSimulationRequest request) {
        int rows = request.rows() <= 0 ? 18 : request.rows();
        int cols = request.cols() <= 0 ? 28 : request.cols();
        int startRow = 2;
        int startCol = 2;
        int endRow = rows - 3;
        int endCol = cols - 3;
        boolean[][] walls = request.walls() != null
            ? request.walls()
            : MazeGenerator.generate(rows, cols, startRow, startCol, endRow, endCol, MazeGenerator.fromName(request.mazeType()));

        List<RaceLaneResponse> lanes = request.algorithms().stream()
            .map(name -> simulatePathLane(name, rows, cols, startRow, startCol, endRow, endCol, walls))
            .toList();
        return new RaceResponse("pathfinding", null, null, walls, lanes, winner(lanes));
    }

    private RaceLaneResponse simulateSortingLane(String name, int[] dataset) {
        AlgorithmModel model = SortingAlgorithmFactory.create(name);
        model.resetState(dataset);
        List<SimulationFrame> frames = new ArrayList<>();
        frames.add(sortFrame(0, model));
        int frame = 1;
        while (!model.isDone() && frame < MAX_FRAMES) {
            model.step();
            model.setTimeMs((long) frame * SORT_FRAME_MS);
            frames.add(sortFrame(frame, model));
            frame++;
        }
        LaneStats stats = new LaneStats(model.getComparisons(), model.getSwaps(), 0, model.getTimeMs(), false, null);
        return new RaceLaneResponse(name, model.getComplexity(), ComplexityCatalog.get(name), frames, stats);
    }

    private RaceLaneResponse simulateSearchLane(String name, int[] dataset, int target) {
        SearchModel model = SearchingAlgorithmFactory.create(name);
        model.resetState(dataset);
        model.setTarget(target);
        List<SimulationFrame> frames = new ArrayList<>();
        frames.add(searchFrame(0, model));
        int frame = 1;
        while (!model.isDone() && frame < MAX_FRAMES) {
            model.step();
            model.setTimeMs((long) frame * SEARCH_FRAME_MS);
            frames.add(searchFrame(frame, model));
            frame++;
        }
        LaneStats stats = new LaneStats(model.getComparisons(), 0, 0, model.getTimeMs(), model.getFoundIndex() >= 0, model.getFoundIndex());
        return new RaceLaneResponse(name, model.getComplexity(), ComplexityCatalog.get(name), frames, stats);
    }

    private RaceLaneResponse simulatePathLane(String name, int rows, int cols, int startRow, int startCol, int endRow, int endCol, boolean[][] walls) {
        PathfindingModel model = PathfindingFactory.create(name);
        model.initGrid(rows, cols);
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (r < walls.length && c < walls[r].length && walls[r][c]) {
                    model.getGrid()[r][c].state = CellState.WALL;
                }
            }
        }
        model.start = model.getGrid()[startRow][startCol];
        model.end = model.getGrid()[endRow][endCol];
        model.start.state = CellState.START;
        model.end.state = CellState.END;
        model.reset();

        List<SimulationFrame> frames = new ArrayList<>();
        frames.add(pathFrame(0, model, 0));
        int frame = 1;
        while (!model.isDone() && frame < MAX_FRAMES) {
            model.step();
            if (model.isPathFound()) markPath(model);
            frames.add(pathFrame(frame, model, (long) frame * PATH_FRAME_MS));
            frame++;
        }
        LaneStats stats = new LaneStats(0, 0, model.getSteps(), (long) Math.max(0, frame - 1) * PATH_FRAME_MS, model.isPathFound(), null);
        return new RaceLaneResponse(name, ComplexityCatalog.get(name).average(), ComplexityCatalog.get(name), frames, stats);
    }

    private int[] resolveSortingDataset(SortingSimulationRequest request) {
        if ("Custom".equals(request.datasetType()) && request.customArray() != null && !request.customArray().isEmpty()) {
            return request.customArray().stream().mapToInt(Integer::intValue).toArray();
        }
        int size = request.size() <= 0 ? 30 : request.size();
        return ArrayGenerator.generate(size, ArrayGenerator.fromLabel(request.datasetType()));
    }

    private int[] resolveSearchingDataset(SearchingSimulationRequest request) {
        if (request.dataset() != null && !request.dataset().isEmpty()) {
            return request.dataset().stream().mapToInt(Integer::intValue).toArray();
        }
        int size = request.size() <= 0 ? 42 : request.size();
        return ArrayGenerator.generate(size, ArrayGenerator.ArrayType.RANDOM);
    }

    private SimulationFrame sortFrame(int frame, AlgorithmModel model) {
        return new SimulationFrame(frame, model.getArray().clone(), model.getHighlight().clone(), model.getSortedBoundary(),
            model.getPivotIndex(), model.getMergeRegionStart(), model.getMergeRegionEnd(), model.getHeapBoundary(),
            model.getComparisons(), model.getSwaps(), model.getTimeMs(), model.isDone(), model.getStatus(),
            null, new int[0], null, List.of(), 0, false);
    }

    private SimulationFrame searchFrame(int frame, SearchModel model) {
        return new SimulationFrame(frame, model.getArray().clone(), model.getHighlight().clone(), model.getSortedBoundary(),
            model.getPivotIndex(), model.getMergeRegionStart(), model.getMergeRegionEnd(), model.getHeapBoundary(),
            model.getComparisons(), model.getSwaps(), model.getTimeMs(), model.isDone(), model.getStatus(),
            model.getFoundIndex(), model.getSearchPath().clone(), null, List.of(), 0, false);
    }

    private SimulationFrame pathFrame(int frame, PathfindingModel model, long timeMs) {
        return new SimulationFrame(frame, new int[0], new int[0], 0, -1, -1, -1, -1, 0, 0, timeMs,
            model.isDone(), model.isDone() ? "Done" : "Running", null, new int[0], gridState(model.getGrid()),
            model.getPath().stream().map(cell -> new PointDto(cell.row, cell.col)).toList(), model.getSteps(), model.isPathFound());
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
            if (cell.state != CellState.START && cell.state != CellState.END) cell.state = CellState.PATH;
        }
    }

    private String winner(List<RaceLaneResponse> lanes) {
        return lanes.stream()
            .min(Comparator.comparingLong(lane -> lane.stats().timeMs()))
            .map(RaceLaneResponse::name)
            .orElse(null);
    }
}
