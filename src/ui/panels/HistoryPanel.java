package ui.panels;

import javafx.collections.FXCollections;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;
import javafx.stage.FileChooser;
import model.RaceRecord;
import utils.HistoryManager;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.List;

public class HistoryPanel extends VBox {

    private TableView<RaceRecord> table;

    public HistoryPanel() {
        getStyleClass().add("content-panel");
        setPadding(new Insets(18));
        setSpacing(15);
        buildUI();
    }

    private void buildUI() {
        HBox headerBox = new HBox(10);
        headerBox.setAlignment(Pos.CENTER_LEFT);
        
        VBox titleBox = new VBox(5);
        Label header = new Label("Race History & Leaderboard");
        header.getStyleClass().add("panel-header");
        Label sub = new Label("Review past performance data of your algorithm races.");
        sub.getStyleClass().add("panel-subheader");
        titleBox.getChildren().addAll(header, sub);

        Button refreshBtn = new Button("Refresh");
        refreshBtn.getStyleClass().addAll("styled-btn", "btn-primary");
        refreshBtn.setOnAction(e -> refreshData());

        Button clearBtn = new Button("Clear History");
        clearBtn.getStyleClass().addAll("styled-btn", "btn-secondary");
        clearBtn.setOnAction(e -> {
            HistoryManager.clearHistory();
            refreshData();
        });

        Button exportBtn = new Button("Export CSV");
        exportBtn.getStyleClass().addAll("styled-btn", "btn-secondary");
        exportBtn.setOnAction(e -> exportCsv());

        HBox btnBox = new HBox(10, refreshBtn, exportBtn, clearBtn);
        btnBox.setAlignment(Pos.CENTER_RIGHT);
        HBox.setHgrow(titleBox, Priority.ALWAYS);
        
        headerBox.getChildren().addAll(titleBox, btnBox);

        table = new TableView<>();
        table.getStyleClass().add("styled-table");
        VBox.setVgrow(table, Priority.ALWAYS);

        TableColumn<RaceRecord, String> colDate = new TableColumn<>("Timestamp");
        colDate.setCellValueFactory(new PropertyValueFactory<>("timestamp"));
        colDate.setPrefWidth(160);

        TableColumn<RaceRecord, String> colAlgo = new TableColumn<>("Algorithm");
        colAlgo.setCellValueFactory(new PropertyValueFactory<>("algorithm"));
        colAlgo.setPrefWidth(150);

        TableColumn<RaceRecord, Integer> colSize = new TableColumn<>("Array Size");
        colSize.setCellValueFactory(new PropertyValueFactory<>("arraySize"));
        colSize.setPrefWidth(100);

        TableColumn<RaceRecord, String> colData = new TableColumn<>("Dataset");
        colData.setCellValueFactory(new PropertyValueFactory<>("dataset"));
        colData.setPrefWidth(120);

        TableColumn<RaceRecord, Integer> colComp = new TableColumn<>("Comparisons");
        colComp.setCellValueFactory(new PropertyValueFactory<>("comparisons"));
        colComp.setPrefWidth(110);

        TableColumn<RaceRecord, Integer> colSwaps = new TableColumn<>("Swaps");
        colSwaps.setCellValueFactory(new PropertyValueFactory<>("swaps"));
        colSwaps.setPrefWidth(90);

        TableColumn<RaceRecord, Long> colTime = new TableColumn<>("Time (ms)");
        colTime.setCellValueFactory(new PropertyValueFactory<>("timeMs"));
        colTime.setPrefWidth(100);

        table.getColumns().add(colDate);
        table.getColumns().add(colAlgo);
        table.getColumns().add(colSize);
        table.getColumns().add(colData);
        table.getColumns().add(colComp);
        table.getColumns().add(colSwaps);
        table.getColumns().add(colTime);

        getChildren().addAll(headerBox, table);
        refreshData();
    }

    public void refreshData() {
        List<RaceRecord> records = HistoryManager.loadHistory();
        table.setItems(FXCollections.observableArrayList(records));
    }

    private void exportCsv() {
        FileChooser chooser = new FileChooser();
        chooser.setTitle("Export Race History");
        chooser.getExtensionFilters().add(new FileChooser.ExtensionFilter("CSV Files", "*.csv"));
        chooser.setInitialFileName("race_history_export.csv");
        File file = chooser.showSaveDialog(getScene().getWindow());
        if (file != null) {
            try {
                File source = new File("race_history.csv");
                if (source.exists()) {
                    Files.copy(source.toPath(), file.toPath(), StandardCopyOption.REPLACE_EXISTING);
                }
            } catch (IOException ex) {
                System.err.println("Failed to export CSV: " + ex.getMessage());
            }
        }
    }
}
