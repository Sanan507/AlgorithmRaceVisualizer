package ui.panels;

import algorithms.sorting.SortingAlgorithmFactory;
import controller.RaceController;
import javafx.animation.AnimationTimer;
import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.chart.BarChart;
import javafx.scene.chart.CategoryAxis;
import javafx.scene.chart.NumberAxis;
import javafx.scene.chart.XYChart;
import javafx.scene.control.Button;
import javafx.scene.control.CheckBox;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.Slider;
import javafx.scene.control.Spinner;
import javafx.scene.control.TextArea;
import javafx.scene.control.TextField;
import javafx.scene.layout.FlowPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import model.AlgorithmModel;
import utils.AppSettings;
import utils.ArrayGenerator;
import utils.ArrayGenerator.ArrayType;
import utils.ComplexityInfo;
import utils.HistoryManager;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class SortingPanel extends VBox {
    private static final String[] ALGO_NAMES = SortingAlgorithmFactory.allNames();

    private ComboBox<String> algo1Box, algo2Box, algo3Box;
    private CheckBox threeWayCheck;
    private ComboBox<String> arrayTypeBox;
    private Spinner<Integer> arraySizeSpinner;
    private TextField customArrayField;
    private Slider speedSlider;
    private Button startBtn;
    private Button pauseBtn;
    private Button resetBtn;
    private Label winnerLabel;
    private HBox canvasRow;
    private BarChart<String, Number> comparisonChart;
    private TextArea explanationArea;
    private final List<AlgoRacePane> racePanes = new ArrayList<>();
    private final RaceController raceController;
    private int[] currentArray;

    public SortingPanel() {
        getStyleClass().add("content-panel");
        setPadding(new Insets(16, 18, 18, 18));
        setSpacing(8);
        raceController = new RaceController(makeListener());
        buildUI();
    }

    private void buildUI() {
        Label header = new Label("Sorting Algorithm Race");
        header.getStyleClass().add("panel-header");
        Label sub = new Label("Run multiple algorithms in parallel on identical data and compare their work.");
        sub.getStyleClass().add("panel-subheader");

        FlowPane configRow = new FlowPane(14, 10);
        configRow.setAlignment(Pos.CENTER_LEFT);
        configRow.getStyleClass().add("config-row");
        configRow.setPadding(new Insets(14, 16, 14, 16));

        List<String> saved = new ArrayList<>(Arrays.asList(AppSettings.getDefaultSortingAlgorithms().split(",")));
        algo1Box = makeAlgoBox(saved.size() > 0 ? saved.get(0) : "Bubble Sort");
        algo2Box = makeAlgoBox(saved.size() > 1 ? saved.get(1) : "Quick Sort");
        algo3Box = makeAlgoBox(saved.size() > 2 ? saved.get(2) : "Merge Sort");

        threeWayCheck = new CheckBox("3-way race");
        threeWayCheck.getStyleClass().add("styled-check");
        threeWayCheck.setSelected(true);
        threeWayCheck.selectedProperty().addListener((o, oldValue, selected) -> {
            algo3Box.setDisable(!selected);
            buildRacePanes();
        });

        arrayTypeBox = new ComboBox<>();
        arrayTypeBox.getItems().addAll("Random", "Nearly Sorted", "Reversed", "Few Unique", "Custom");
        arrayTypeBox.setValue("Random");
        arrayTypeBox.getStyleClass().add("styled-combo");
        arrayTypeBox.setPrefWidth(184);

        customArrayField = new TextField("5, 12, 3, 8, 1");
        customArrayField.getStyleClass().add("styled-text-field");
        customArrayField.setPrefWidth(220);
        customArrayField.setVisible(false);
        customArrayField.setManaged(false);

        arrayTypeBox.valueProperty().addListener((o, oldValue, newValue) -> {
            boolean isCustom = "Custom".equals(newValue);
            customArrayField.setVisible(isCustom);
            customArrayField.setManaged(isCustom);
            arraySizeSpinner.setDisable(isCustom);
        });

        arraySizeSpinner = new Spinner<>(10, 120, AppSettings.getArraySize(), 5);
        arraySizeSpinner.setPrefWidth(126);
        arraySizeSpinner.getStyleClass().add("styled-spinner");

        speedSlider = new Slider(1, 10, AppSettings.getSpeed());
        speedSlider.setPrefWidth(190);
        speedSlider.getStyleClass().add("styled-slider");
        speedSlider.valueProperty().addListener((o, oldValue, value) -> {
            int speed = value.intValue();
            AppSettings.setSpeed(speed);
            raceController.setSpeedForAll(speedToDelay(speed));
        });

        algo1Box.setOnAction(e -> refreshExplanation());
        algo2Box.setOnAction(e -> refreshExplanation());
        algo3Box.setOnAction(e -> refreshExplanation());

        configRow.getChildren().addAll(
            makeField("Lane 1", algo1Box),
            makeField("Lane 2", algo2Box),
            makeField("Lane 3", new HBox(8, threeWayCheck, algo3Box)),
            makeField("Dataset", arrayTypeBox),
            makeField("Custom Array", customArrayField),
            makeField("Array Size", arraySizeSpinner),
            makeField("Animation Speed", speedSlider)
        );

        HBox btnRow = new HBox(10);
        btnRow.setAlignment(Pos.CENTER_LEFT);
        startBtn = makeBtn("Start Race", "btn-primary");
        pauseBtn = makeBtn("Pause", "btn-secondary");
        resetBtn = makeBtn("Stop / Reset", "btn-secondary");
        pauseBtn.setDisable(true);
        winnerLabel = new Label("");
        winnerLabel.getStyleClass().add("winner-label");
        startBtn.setOnAction(e -> startRace());
        pauseBtn.setOnAction(e -> togglePause());
        resetBtn.setOnAction(e -> resetRace());
        btnRow.getChildren().addAll(startBtn, pauseBtn, resetBtn, winnerLabel);

        canvasRow = new HBox(12);
        canvasRow.setAlignment(Pos.CENTER);
        canvasRow.getStyleClass().add("canvas-row");
        canvasRow.setMinHeight(314);
        canvasRow.setPrefHeight(348);
        canvasRow.setMaxHeight(380);
        canvasRow.setPadding(new Insets(10));

        HBox bottom = new HBox(12);
        bottom.setMinHeight(185);
        bottom.setPrefHeight(205);
        CategoryAxis xAxis = new CategoryAxis();
        NumberAxis yAxis = new NumberAxis();
        comparisonChart = new BarChart<>(xAxis, yAxis);
        comparisonChart.setTitle("Performance Comparison");
        comparisonChart.setLegendVisible(false);
        comparisonChart.setAnimated(true);
        comparisonChart.getStyleClass().add("metric-chart");
        HBox.setHgrow(comparisonChart, Priority.ALWAYS);

        explanationArea = new TextArea();
        explanationArea.setEditable(false);
        explanationArea.setWrapText(true);
        explanationArea.getStyleClass().add("explanation-area");
        explanationArea.setPrefWidth(420);
        explanationArea.setMinHeight(180);
        refreshExplanation();
        bottom.getChildren().addAll(comparisonChart, explanationArea);

        getChildren().addAll(header, sub, configRow, btnRow, canvasRow, bottom);
        buildRacePanes();
    }

    private void buildRacePanes() {
        if (canvasRow == null) return;
        canvasRow.getChildren().clear();
        racePanes.clear();
        currentArray = generateArray();

        for (String name : selectedAlgorithms()) {
            AlgorithmModel model = SortingAlgorithmFactory.create(name);
            model.resetState(currentArray);
            model.setStepDelayMs(speedToDelay((int) speedSlider.getValue()));
            AlgoRacePane pane = new AlgoRacePane(model);
            racePanes.add(pane);
            HBox.setHgrow(pane, Priority.ALWAYS);
            canvasRow.getChildren().add(pane);
        }
        Platform.runLater(() -> racePanes.forEach(AlgoRacePane::renderNow));
        updateChart();
    }

    private void startRace() {
        raceController.reset();
        AlgorithmModel.playStart();
        saveSortingDefaults();
        buildRacePanes();
        winnerLabel.setText("");
        List<AlgorithmModel> models = racePanes.stream().map(AlgoRacePane::getModel).toList();
        raceController.setModels(models);
        raceController.start();
        racePanes.forEach(AlgoRacePane::startRendering);
        startBtn.setDisable(true);
        pauseBtn.setDisable(false);
        pauseBtn.setText("Pause");
    }

    private void togglePause() {
        if (raceController.isPaused()) {
            raceController.resume();
            AlgorithmModel.playResume();
            pauseBtn.setText("Pause");
        } else {
            raceController.pause();
            AlgorithmModel.playPause();
            pauseBtn.setText("Resume");
        }
    }

    private void resetRace() {
        raceController.reset();
        AlgorithmModel.playReset();
        racePanes.forEach(AlgoRacePane::stopRendering);
        buildRacePanes();
        startBtn.setDisable(false);
        pauseBtn.setDisable(true);
        pauseBtn.setText("Pause");
        winnerLabel.setText("");
    }

    private RaceController.RaceListener makeListener() {
        return new RaceController.RaceListener() {
            @Override public void onStep(AlgorithmModel model) { updateChart(); }

            @Override public void onWinner(AlgorithmModel model) {
                AlgorithmModel.playWinner();
                winnerLabel.setText("Winner: " + model.getName() + " (" + model.getTimeMs() + " ms)");
            }

            @Override public void onAllDone() {
                startBtn.setDisable(false);
                pauseBtn.setDisable(true);
                updateChart();
                
                // Save history
                String datasetType = arrayTypeBox.getValue();
                int size = currentArray.length;
                for (AlgoRacePane pane : racePanes) {
                    AlgorithmModel m = pane.getModel();
                    HistoryManager.saveRecord(m.getName(), size, datasetType, m.getComparisons(), m.getSwaps(), m.getTimeMs());
                }
            }
        };
    }

    private void updateChart() {
        if (comparisonChart == null) return;
        XYChart.Series<String, Number> series = new XYChart.Series<>();
        for (AlgoRacePane pane : racePanes) {
            AlgorithmModel model = pane.getModel();
            series.getData().add(new XYChart.Data<>(model.getName(), model.getComparisons() + model.getSwaps()));
        }
        comparisonChart.getData().clear();
        comparisonChart.getData().add(series);
    }

    private void refreshExplanation() {
        if (explanationArea == null || algo1Box == null) return;
        ComplexityInfo.Info info = ComplexityInfo.get(algo1Box.getValue());
        explanationArea.setText(
            algo1Box.getValue() + "\n\n" +
            info.theory + "\n\n" +
            "Best: " + info.best + "    Average: " + info.average + "\n" +
            "Worst: " + info.worst + "    Space: " + info.space + "\n\n" +
            "Pseudocode\n" + info.pseudocode);
    }

    private List<String> selectedAlgorithms() {
        List<String> names = new ArrayList<>();
        names.add(algo1Box.getValue());
        names.add(algo2Box.getValue());
        if (threeWayCheck.isSelected()) names.add(algo3Box.getValue());
        return names;
    }

    private void saveSortingDefaults() {
        AppSettings.setArraySize(arraySizeSpinner.getValue());
        AppSettings.setDefaultSortingAlgorithms(String.join(",", selectedAlgorithms()));
    }

    private int[] generateArray() {
        if ("Custom".equals(arrayTypeBox.getValue())) {
            try {
                String[] parts = customArrayField.getText().split(",");
                int[] customArr = new int[parts.length];
                for (int i = 0; i < parts.length; i++) {
                    customArr[i] = Integer.parseInt(parts[i].trim());
                }
                if (customArr.length > 0) return customArr;
            } catch (Exception ignored) {
                // If parsing fails, default to random below
            }
            return ArrayGenerator.generate(20, ArrayType.RANDOM); // fallback
        }

        ArrayType type = switch (arrayTypeBox.getValue()) {
            case "Nearly Sorted" -> ArrayType.NEARLY_SORTED;
            case "Reversed" -> ArrayType.REVERSED;
            case "Few Unique" -> ArrayType.FEW_UNIQUE;
            default -> ArrayType.RANDOM;
        };
        return ArrayGenerator.generate(arraySizeSpinner.getValue(), type);
    }

    private Label makeLabel(String text) {
        Label label = new Label(text);
        label.getStyleClass().add("config-label");
        return label;
    }

    private VBox makeField(String labelText, javafx.scene.Node control) {
        VBox field = new VBox(5);
        field.getStyleClass().add("form-field");
        Label label = makeLabel(labelText);
        field.getChildren().addAll(label, control);
        
        // Hide entire VBox if its only control is hidden (for custom array field)
        control.visibleProperty().addListener((o, oldV, visible) -> {
            field.setVisible(visible);
            field.setManaged(visible);
        });
        field.setVisible(control.isVisible());
        field.setManaged(control.isManaged());
        
        return field;
    }

    private Button makeBtn(String text, String style) {
        Button button = new Button(text);
        button.getStyleClass().addAll("styled-btn", style);
        return button;
    }

    private ComboBox<String> makeAlgoBox(String value) {
        ComboBox<String> box = new ComboBox<>();
        box.getItems().addAll(ALGO_NAMES);
        box.setValue(Arrays.asList(ALGO_NAMES).contains(value) ? value : ALGO_NAMES[0]);
        box.getStyleClass().add("styled-combo");
        box.setPrefWidth(184);
        box.setMinWidth(168);
        box.setOnAction(e -> {
            refreshExplanation();
            if (!startBtn.isDisabled()) buildRacePanes();
        });
        return box;
    }

    private int speedToDelay(int speed) {
        return Math.max(1, 210 - speed * 20);
    }
}

class AlgoRacePane extends VBox {
    private static final Color COL_DEFAULT = Color.web("#4B8FD4");
    private static final Color COL_COMPARE = Color.web("#F59E0B");
    private static final Color COL_SORTED = Color.web("#10B981");
    private static final Color COL_BG = Color.web("#111827");

    private final AlgorithmModel model;
    private Canvas canvas;
    private StackPane canvasWrap;
    private AnimationTimer timer;
    private Label statusLbl;
    private Label swapValLbl;
    private Label compValLbl;
    private Label timeValLbl;

    AlgoRacePane(AlgorithmModel model) {
        this.model = model;
        getStyleClass().add("race-pane");
        setSpacing(0);
        build();
    }

    private void build() {
        HBox header = new HBox(10);
        header.getStyleClass().add("race-pane-header");
        header.setPadding(new Insets(10, 14, 10, 14));
        header.setAlignment(Pos.CENTER_LEFT);

        Label nameLbl = new Label(model.getName());
        nameLbl.getStyleClass().add("race-pane-title");
        Label complexityLbl = new Label(model.getComplexity());
        complexityLbl.getStyleClass().add("complexity-badge");
        statusLbl = new Label("Ready");
        statusLbl.getStyleClass().add("status-label");
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        header.getChildren().addAll(nameLbl, complexityLbl, spacer, statusLbl);

        canvas = new Canvas(400, 180);
        canvasWrap = new StackPane(canvas);
        canvasWrap.getStyleClass().add("canvas-wrap");
        canvasWrap.setMinHeight(224);
        canvasWrap.setPrefHeight(252);
        canvasWrap.setMaxHeight(280);
        canvas.widthProperty().bind(canvasWrap.widthProperty());
        canvas.heightProperty().bind(canvasWrap.heightProperty().subtract(12));
        canvas.widthProperty().addListener((o, oldValue, value) -> drawFrame());
        canvas.heightProperty().addListener((o, oldValue, value) -> drawFrame());
        canvasWrap.layoutBoundsProperty().addListener((o, oldValue, value) -> drawFrame());

        swapValLbl = new Label("0");
        compValLbl = new Label("0");
        timeValLbl = new Label("0 ms");
        HBox statsBar = new HBox(0);
        statsBar.getStyleClass().add("stats-bar");
        statsBar.setAlignment(Pos.CENTER);
        statsBar.getChildren().addAll(
            makeStatBox(swapValLbl, "Swaps"),
            makeStatDivider(),
            makeStatBox(compValLbl, "Comparisons"),
            makeStatDivider(),
            makeStatBox(timeValLbl, "Time")
        );

        model.swapsProperty().addListener((o, oldValue, value) -> Platform.runLater(() -> swapValLbl.setText(value.toString())));
        model.comparisonsProperty().addListener((o, oldValue, value) -> Platform.runLater(() -> compValLbl.setText(value.toString())));
        model.timeMsProperty().addListener((o, oldValue, value) -> Platform.runLater(() -> timeValLbl.setText(value + " ms")));
        model.statusProperty().addListener((o, oldValue, value) -> Platform.runLater(() -> {
            statusLbl.setText(value);
            statusLbl.getStyleClass().removeAll("status-done", "status-running");
            if ("Done!".equals(value)) statusLbl.getStyleClass().add("status-done");
            else if (value.contains("Run")) statusLbl.getStyleClass().add("status-running");
        }));

        getChildren().addAll(header, canvasWrap, statsBar);
        Platform.runLater(this::drawFrame);
    }

    private VBox makeStatBox(Label valueLabel, String labelText) {
        VBox box = new VBox(2);
        box.setAlignment(Pos.CENTER);
        box.setPadding(new Insets(8, 16, 8, 16));
        box.getStyleClass().add("stat-box");
        HBox.setHgrow(box, Priority.ALWAYS);
        valueLabel.getStyleClass().add("stat-value");
        Label nameLbl = new Label(labelText);
        nameLbl.getStyleClass().add("stat-name");
        box.getChildren().addAll(valueLabel, nameLbl);
        return box;
    }

    private Region makeStatDivider() {
        Region divider = new Region();
        divider.getStyleClass().add("stat-divider");
        divider.setPrefWidth(1);
        divider.setMinWidth(1);
        divider.setMaxWidth(1);
        return divider;
    }

    void startRendering() {
        timer = new AnimationTimer() {
            @Override public void handle(long now) { drawFrame(); }
        };
        timer.start();
    }

    void stopRendering() {
        if (timer != null) timer.stop();
        drawFrame();
    }

    void renderNow() {
        drawFrame();
    }

    private void drawFrame() {
        double width = canvas.getWidth();
        double height = canvas.getHeight();
        if (width <= 0 || height <= 0) return;

        GraphicsContext gc = canvas.getGraphicsContext2D();
        gc.setFill(COL_BG);
        gc.fillRect(0, 0, width, height);

        int[] arr = model.getArray();
        int[] highlight = model.getHighlight();
        int sortedBoundary = model.getSortedBoundary();
        if (arr == null || arr.length == 0) return;

        int n = arr.length;
        double barW = Math.max(2, (width - n) / n);
        double gap = Math.max(1, (width - barW * n) / (n + 1));

        for (int i = 0; i < n; i++) {
            double barH = (arr[i] / 100.0) * (height - 12);
            double x = gap + i * (barW + gap);
            double y = height - barH - 6;
            Color color = COL_DEFAULT;
            if (model.isDone()) color = COL_SORTED;
            else if (i == model.getPivotIndex()) color = Color.web("#D946EF"); // Purple pivot
            else if (i == model.getHeapBoundary()) color = Color.web("#F97316"); // Orange heap boundary
            else if (contains(highlight, i)) color = COL_COMPARE;
            else if (i >= model.getMergeRegionStart() && i <= model.getMergeRegionEnd()) color = Color.web("#06B6D4").deriveColor(0, 1, 1, 0.6); // Cyan merge region
            else if (i >= sortedBoundary) color = COL_SORTED.deriveColor(0, 1, 0.72, 1);

            gc.setFill(color);
            gc.fillRoundRect(x, y, barW, barH, 3, 3);
        }
    }

    private boolean contains(int[] arr, int value) {
        if (arr == null) return false;
        for (int item : arr) if (item == value) return true;
        return false;
    }

    AlgorithmModel getModel() {
        return model;
    }
}
