package com.algorithmrace.visualizer.controller;

import com.algorithmrace.visualizer.dto.CatalogResponse;
import com.algorithmrace.visualizer.service.CatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalog")
@Tag(name = "Catalog", description = "Endpoints for retrieving supported algorithms and metadata")
public class CatalogController {
    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @Operation(
        summary = "Get algorithm catalog", 
        description = "Retrieves the full catalog of available sorting, searching, and pathfinding algorithms along with their metadata."
    )
    @ApiResponse(responseCode = "200", description = "Successfully retrieved catalog")
    @GetMapping
    public CatalogResponse catalog() {
        return catalogService.catalog();
    }
}