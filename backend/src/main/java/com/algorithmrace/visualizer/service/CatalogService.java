package com.algorithmrace.visualizer.service;

import com.algorithmrace.visualizer.algorithms.pathfinding.PathfindingFactory;
import com.algorithmrace.visualizer.algorithms.searching.SearchingAlgorithmFactory;
import com.algorithmrace.visualizer.algorithms.sorting.SortingAlgorithmFactory;
import com.algorithmrace.visualizer.dto.CatalogResponse;
import com.algorithmrace.visualizer.utils.ComplexityCatalog;
import com.algorithmrace.visualizer.utils.MazeGenerator;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CatalogService {
    public CatalogResponse catalog() {
        return new CatalogResponse(
            SortingAlgorithmFactory.allNames(),
            SearchingAlgorithmFactory.allNames(),
            PathfindingFactory.allNames(),
            List.of("Random", "Nearly Sorted", "Reversed", "Few Unique"),
            MazeGenerator.allNames(),
            ComplexityCatalog.all()
        );
    }
}
