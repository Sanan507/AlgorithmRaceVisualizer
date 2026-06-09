package ui;

import javafx.scene.Node;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;
import ui.panels.PathfindingPanel;
import ui.panels.SearchingPanel;
import ui.panels.SettingsPanel;
import ui.panels.SortingPanel;
import ui.panels.HistoryPanel;

public class MainLayout {
    private final StackPane rootWrapper;
    private final BorderPane root;
    private final StackPane contentArea;
    private final SortingPanel sortingPanel;
    private final SearchingPanel searchingPanel;
    private final PathfindingPanel pathfindingPanel;
    private final HistoryPanel historyPanel;
    private final SettingsPanel settingsPanel;

    public MainLayout(Stage stage) {
        rootWrapper = new StackPane();
        root = new BorderPane();
        root.getStyleClass().add("root-layout");
        rootWrapper.getChildren().add(root);

        Sidebar sidebar = new Sidebar(this);
        contentArea = new StackPane();
        contentArea.getStyleClass().add("content-area");

        ScrollPane scrollPane = new ScrollPane(contentArea);
        scrollPane.setFitToWidth(true);
        scrollPane.setFitToHeight(true);
        scrollPane.getStyleClass().add("main-scroll");
        scrollPane.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scrollPane.setVbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);

        sortingPanel = new SortingPanel();
        searchingPanel = new SearchingPanel();
        pathfindingPanel = new PathfindingPanel();
        historyPanel = new HistoryPanel();
        settingsPanel = new SettingsPanel(stage);
        showPanel(sortingPanel);

        HBox body = new HBox(sidebar.getNode(), scrollPane);
        HBox.setHgrow(scrollPane, Priority.ALWAYS);
        root.setCenter(body);
    }

    public void showPanel(Node panel) {
        contentArea.getChildren().setAll(panel);
    }

    public void navigateTo(String section) {
        switch (section) {
            case "Sorting" -> showPanel(sortingPanel);
            case "Searching" -> showPanel(searchingPanel);
            case "Pathfinding" -> showPanel(pathfindingPanel);
            case "History" -> {
                historyPanel.refreshData();
                showPanel(historyPanel);
            }
            case "Settings" -> showPanel(settingsPanel);
            default -> showPanel(sortingPanel);
        }
    }

    public StackPane getRoot() {
        return rootWrapper;
    }
}
