module algorithmvisualizer {
    requires javafx.controls;
    requires javafx.fxml;
    requires javafx.graphics;
    requires java.prefs;
	requires java.desktop;

    exports main;
    exports ui;
    exports ui.panels;
    exports algorithms.sorting;
    exports algorithms.searching;
    exports algorithms.pathfinding;
    exports controller;
    exports model;
    exports utils;
}
