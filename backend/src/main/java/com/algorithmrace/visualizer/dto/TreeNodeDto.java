package com.algorithmrace.visualizer.dto;

public record TreeNodeDto(
    int val, int height, int balanceFactor, String color, TreeNodeDto left, TreeNodeDto right) {}
