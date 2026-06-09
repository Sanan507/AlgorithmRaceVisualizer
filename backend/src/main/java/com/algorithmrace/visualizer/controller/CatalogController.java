package com.algorithmrace.visualizer.controller;

import com.algorithmrace.visualizer.dto.CatalogResponse;
import com.algorithmrace.visualizer.service.CatalogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalog")
public class CatalogController {
    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public CatalogResponse catalog() {
        return catalogService.catalog();
    }
}
