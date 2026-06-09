package ui;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.control.Label;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.VBox;

public class Sidebar {
    private static final String[][] NAV_ITEMS = {
        {"S", "Sorting"},
        {"F", "Searching"},
        {"P", "Pathfinding"},
        {"H", "History"},
        {"C", "Settings"}
    };

    private final MainLayout layout;
    private VBox root;
    private VBox navButtons;
    private String activeSection = "Sorting";

    public Sidebar(MainLayout layout) {
        this.layout = layout;
        build();
    }

    private void build() {
        root = new VBox();
        root.getStyleClass().add("sidebar");
        root.setPrefWidth(212);

        VBox logoBox = new VBox(6);
        logoBox.getStyleClass().add("sidebar-logo");
        logoBox.setAlignment(Pos.CENTER);
        logoBox.setPadding(new Insets(24, 16, 20, 16));

        Label icon = new Label("AR");
        icon.getStyleClass().add("brand-mark");
        Label title = new Label("Algorithm");
        title.getStyleClass().add("sidebar-title");
        Label title2 = new Label("Race Visualizer");
        title2.getStyleClass().add("sidebar-title-sub");
        logoBox.getChildren().addAll(icon, title, title2);

        navButtons = new VBox(4);
        navButtons.setPadding(new Insets(8));
        for (String[] item : NAV_ITEMS) navButtons.getChildren().add(makeNavBtn(item[0], item[1]));

        Region spacer = new Region();
        VBox.setVgrow(spacer, Priority.ALWAYS);

        Label version = new Label("v2.1  JavaFX MVC");
        version.getStyleClass().add("sidebar-version");
        version.setPadding(new Insets(0, 0, 16, 16));
        root.getChildren().addAll(logoBox, navButtons, spacer, version);
    }

    private HBox makeNavBtn(String icon, String label) {
        HBox btn = new HBox(12);
        btn.getStyleClass().add("nav-btn");
        btn.setAlignment(Pos.CENTER_LEFT);
        btn.setPadding(new Insets(10, 16, 10, 16));

        Label iconLbl = new Label(icon);
        iconLbl.getStyleClass().add("nav-icon");
        Label textLbl = new Label(label);
        textLbl.getStyleClass().add("nav-btn-text");
        btn.getChildren().addAll(iconLbl, textLbl);

        if (label.equals(activeSection)) btn.getStyleClass().add("nav-btn-active");
        btn.setOnMouseClicked(e -> {
            activeSection = label;
            navButtons.getChildren().forEach(n -> n.getStyleClass().remove("nav-btn-active"));
            btn.getStyleClass().add("nav-btn-active");
            layout.navigateTo(label);
        });
        btn.setOnMouseEntered(e -> {
            if (!label.equals(activeSection)) btn.getStyleClass().add("nav-btn-hover");
        });
        btn.setOnMouseExited(e -> btn.getStyleClass().remove("nav-btn-hover"));
        return btn;
    }

    public Node getNode() {
        return root;
    }
}
