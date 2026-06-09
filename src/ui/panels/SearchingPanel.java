package ui.panels;

import algorithms.searching.SearchModel;
import algorithms.searching.SearchingAlgorithmFactory;
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
import utils.ComplexityInfo;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

public class SearchingPanel extends VBox {
    private static final Color BG = Color.web("#111827");
    private static final Color BAR = Color.web("#4B8FD4");
    private static final Color VISIT = Color.web("#7C3AED");
    private static final Color FOUND = Color.web("#10B981");
    private static final Color CUR = Color.web("#F59E0B");

    private Spinner<Integer> targetSpinner;
    private ComboBox<String> algo1Box;
    private ComboBox<String> algo2Box;
    private ComboBox<String> algo3Box;
    private CheckBox thirdLaneCheck;
    private Slider speedSlider;
    private Button startBtn;
    private Button resetBtn;
    private Label winnerLabel;
    private HBox raceRow;
    private BarChart<String, Number> comparisonChart;
    private TextArea explanationArea;
    private final List<SearchRacePane> racePanes = new ArrayList<>();
    private int[] dataset;
    private volatile boolean cancelled = false;
    private volatile boolean running = false;

    public SearchingPanel() {
        getStyleClass().add("content-panel");
        setPadding(new Insets(18));
        setSpacing(10);
        buildUI();
    }

    private void buildUI() {
        Label header = new Label("Searching Algorithm Race");
        header.getStyleClass().add("panel-header");
        Label sub = new Label("Linear, Binary, and Jump Search compete on the same values and target.");
        sub.getStyleClass().add("panel-subheader");

        FlowPane controls = new FlowPane(14, 10);
        controls.getStyleClass().add("config-row");
        controls.setPadding(new Insets(12, 16, 12, 16));
        controls.setAlignment(Pos.CENTER_LEFT);

        String[] names = SearchingAlgorithmFactory.allNames();
        algo1Box = makeAlgoBox(names[0]);
        algo2Box = makeAlgoBox(names[1]);
        algo3Box = makeAlgoBox(names[2]);
        thirdLaneCheck = new CheckBox("3-way race");
        thirdLaneCheck.getStyleClass().add("styled-check");
        thirdLaneCheck.setSelected(true);
        thirdLaneCheck.selectedProperty().addListener((o, oldValue, selected) -> {
            algo3Box.setDisable(!selected);
            if (!running) buildRacePanes();
        });

        dataset = ArrayGenerator.generate(42, ArrayGenerator.ArrayType.RANDOM);
        int randomTarget = dataset[(int) (Math.random() * dataset.length)];
        targetSpinner = new Spinner<>(1, 100, AppSettings.getDefaultSearchingTarget() > 0 ? AppSettings.getDefaultSearchingTarget() : randomTarget);
        targetSpinner.setPrefWidth(110);
        targetSpinner.getStyleClass().add("styled-spinner");

        speedSlider = new Slider(1, 10, AppSettings.getSpeed());
        speedSlider.setPrefWidth(190);
        speedSlider.getStyleClass().add("styled-slider");

        startBtn = makeButton("Start Search Race", "btn-primary");
        resetBtn = makeButton("Random Data", "btn-secondary");
        winnerLabel = new Label("");
        winnerLabel.getStyleClass().add("winner-label");
        startBtn.setOnAction(e -> startRace());
        resetBtn.setOnAction(e -> resetRace());

        controls.getChildren().addAll(
            makeField("Lane 1", algo1Box),
            makeField("Lane 2", algo2Box),
            makeField("Lane 3", new HBox(8, thirdLaneCheck, algo3Box)),
            makeField("Target", targetSpinner),
            makeField("Speed", speedSlider),
            startBtn, resetBtn, winnerLabel
        );

        raceRow = new HBox(12);
        raceRow.getStyleClass().add("canvas-row");
        raceRow.setPadding(new Insets(10));
        raceRow.setMinHeight(280);
        raceRow.setPrefHeight(310);
        raceRow.setMaxHeight(330);

        HBox bottom = new HBox(12);
        bottom.setMinHeight(185);
        bottom.setPrefHeight(205);
        comparisonChart = new BarChart<>(new CategoryAxis(), new NumberAxis());
        comparisonChart.setTitle("Search Comparison");
        comparisonChart.setLegendVisible(false);
        comparisonChart.setAnimated(true);
        comparisonChart.getStyleClass().add("metric-chart");
        HBox.setHgrow(comparisonChart, Priority.ALWAYS);

        explanationArea = new TextArea();
        explanationArea.setEditable(false);
        explanationArea.setWrapText(true);
        explanationArea.getStyleClass().add("explanation-area");
        explanationArea.setPrefWidth(440);
        explanationArea.setText(buildExplanation());
        bottom.getChildren().addAll(comparisonChart, explanationArea);

        getChildren().addAll(header, sub, controls, raceRow, bottom);
        buildRacePanes(false);
    }

    private void buildRacePanes() {
        buildRacePanes(false);
    }

    private void buildRacePanes(boolean prepareForRace) {
        racePanes.forEach(SearchRacePane::stopRendering);
        raceRow.getChildren().clear();
        racePanes.clear();
        for (String name : selectedAlgorithms()) {
            SearchModel model = SearchingAlgorithmFactory.create(name);
            model.resetState(dataset);
            model.setTarget(targetSpinner.getValue());
            model.setStepDelayMs(speedToDelay());
            SearchRacePane pane = new SearchRacePane(model, prepareForRace ? null : dataset);
            racePanes.add(pane);
            HBox.setHgrow(pane, Priority.ALWAYS);
            raceRow.getChildren().add(pane);
        }
        Platform.runLater(() -> racePanes.forEach(SearchRacePane::renderNow));
        updateChart();
    }

    private void startRace() {
        if (running) return;
        AppSettings.setDefaultSearchingTarget(targetSpinner.getValue());
        cancelled = false;
        running = true;
        startBtn.setDisable(true);
        resetBtn.setDisable(true);
        winnerLabel.setText("");
        buildRacePanes(true);
        racePanes.forEach(SearchRacePane::startRendering);

        AtomicInteger doneCount = new AtomicInteger(0);
        AtomicReference<SearchModel> winner = new AtomicReference<>();
        int total = racePanes.size();

        for (SearchRacePane pane : racePanes) {
            SearchModel model = pane.getModel();
            Thread thread = new Thread(() -> {
                long started = System.currentTimeMillis();
                while (!cancelled && !model.isDone()) {
                    model.step();
                    model.setTimeMs(System.currentTimeMillis() - started);
                    Platform.runLater(this::updateChart);
                    try {
                        Thread.sleep(model.getStepDelayMs());
                    } catch (InterruptedException ex) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
                if (!cancelled && model.isDone()) {
                    if (winner.compareAndSet(null, model)) {
                        Platform.runLater(() -> winnerLabel.setText("Winner: " + model.getName()
                            + " (" + model.getComparisons() + " checks)"));
                        AlgorithmModel.playWinner();
                    }
                    if (doneCount.incrementAndGet() == total) {
                        Platform.runLater(() -> {
                            running = false;
                            startBtn.setDisable(false);
                            resetBtn.setDisable(false);
                            racePanes.forEach(SearchRacePane::stopRendering);
                            updateChart();
                        });
                    }
                }
            }, model.getName() + "-search-race");
            thread.setDaemon(true);
            thread.start();
        }
    }

    private void resetRace() {
        cancelled = true;
        running = false;
        startBtn.setDisable(false);
        resetBtn.setDisable(false);
        winnerLabel.setText("");
        dataset = ArrayGenerator.generate(42, ArrayGenerator.ArrayType.RANDOM);
        buildRacePanes();
    }

    private void updateChart() {
        XYChart.Series<String, Number> series = new XYChart.Series<>();
        for (SearchRacePane pane : racePanes) {
            SearchModel model = pane.getModel();
            series.getData().add(new XYChart.Data<>(model.getName(), model.getComparisons()));
        }
        comparisonChart.getData().clear();
        comparisonChart.getData().add(series);
    }

    private String buildExplanation() {
        StringBuilder builder = new StringBuilder("Search Race\n\n");
        builder.append("Before the race, every lane previews the same random dataset. ")
            .append("When the race starts, Binary Search and Jump Search sort their own private copies because those algorithms require ordered data.\n\n");
        for (String name : selectedAlgorithms()) {
            ComplexityInfo.Info info = ComplexityInfo.get(name);
            builder.append(name)
                .append(" - Average: ").append(info.average)
                .append(", Worst: ").append(info.worst)
                .append("\n").append(info.theory).append("\n\n");
        }
        return builder.toString();
    }

    private int speedToDelay() {
        return Math.max(1, 205 - (int) speedSlider.getValue() * 20);
    }

    private Label makeLabel(String text) {
        Label label = new Label(text);
        label.getStyleClass().add("config-label");
        return label;
    }

    private VBox makeField(String labelText, javafx.scene.Node control) {
        VBox field = new VBox(5);
        field.getStyleClass().add("form-field");
        field.getChildren().addAll(makeLabel(labelText), control);
        return field;
    }

    private ComboBox<String> makeAlgoBox(String selected) {
        ComboBox<String> box = new ComboBox<>();
        box.getItems().addAll(SearchingAlgorithmFactory.allNames());
        box.setValue(Arrays.asList(SearchingAlgorithmFactory.allNames()).contains(selected)
            ? selected
            : SearchingAlgorithmFactory.allNames()[0]);
        box.getStyleClass().add("styled-combo");
        box.setPrefWidth(184);
        box.setOnAction(e -> {
            explanationArea.setText(buildExplanation());
            if (!running) buildRacePanes();
        });
        return box;
    }

    private List<String> selectedAlgorithms() {
        List<String> selected = new ArrayList<>();
        selected.add(algo1Box.getValue());
        selected.add(algo2Box.getValue());
        if (thirdLaneCheck.isSelected()) selected.add(algo3Box.getValue());
        return selected;
    }

    private Button makeButton(String text, String styleClass) {
        Button button = new Button(text);
        button.getStyleClass().addAll("styled-btn", styleClass);
        return button;
    }

    private static class SearchRacePane extends VBox {
        private final SearchModel model;
        private final int[] previewArray;
        private final Canvas canvas = new Canvas(360, 220);
        private AnimationTimer timer;
        private Label checksLabel;
        private Label timeLabel;

        SearchRacePane(SearchModel model, int[] previewArray) {
            this.model = model;
            this.previewArray = previewArray == null ? null : previewArray.clone();
            getStyleClass().add("race-pane");
            build();
        }

        private void build() {
            HBox header = new HBox(10);
            header.getStyleClass().add("race-pane-header");
            header.setPadding(new Insets(10, 14, 10, 14));
            header.setAlignment(Pos.CENTER_LEFT);
            Label title = new Label(model.getName());
            title.getStyleClass().add("race-pane-title");
            Label complexity = new Label(model.getComplexity());
            complexity.getStyleClass().add("complexity-badge");
            Region spacer = new Region();
            HBox.setHgrow(spacer, Priority.ALWAYS);
            header.getChildren().addAll(title, complexity, spacer);

            StackPane wrap = new StackPane(canvas);
            wrap.getStyleClass().add("canvas-wrap");
            wrap.setMinHeight(188);
            wrap.setPrefHeight(210);
            VBox.setVgrow(wrap, Priority.ALWAYS);
            canvas.widthProperty().bind(wrap.widthProperty());
            canvas.heightProperty().bind(wrap.heightProperty());
            canvas.widthProperty().addListener(e -> draw());
            canvas.heightProperty().addListener(e -> draw());

            checksLabel = new Label("0");
            timeLabel = new Label("0 ms");
            HBox stats = new HBox(0);
            stats.getStyleClass().add("stats-bar");
            stats.getChildren().addAll(makeStatBox(checksLabel, "Checks"), makeDivider(), makeStatBox(timeLabel, "Time"));

            model.comparisonsProperty().addListener((o, oldValue, value) -> Platform.runLater(() -> checksLabel.setText(value.toString())));
            model.timeMsProperty().addListener((o, oldValue, value) -> Platform.runLater(() -> timeLabel.setText(value + " ms")));

            getChildren().addAll(header, wrap, stats);
            Platform.runLater(this::draw);
        }

        private VBox makeStatBox(Label valueLabel, String labelText) {
            VBox box = new VBox(2);
            box.setAlignment(Pos.CENTER);
            box.setPadding(new Insets(6, 18, 6, 18));
            HBox.setHgrow(box, Priority.ALWAYS);
            valueLabel.getStyleClass().add("stat-value");
            Label label = new Label(labelText);
            label.getStyleClass().add("stat-name");
            box.getChildren().addAll(valueLabel, label);
            return box;
        }

        private Region makeDivider() {
            Region divider = new Region();
            divider.getStyleClass().add("stat-divider");
            divider.setMinWidth(1);
            divider.setPrefWidth(1);
            return divider;
        }

        void startRendering() {
            timer = new AnimationTimer() {
                @Override public void handle(long now) { draw(); }
            };
            timer.start();
        }

        void stopRendering() {
            if (timer != null) timer.stop();
            draw();
        }

        void renderNow() {
            draw();
        }

        SearchModel getModel() {
            return model;
        }

        private void draw() {
            double width = canvas.getWidth();
            double height = canvas.getHeight();
            if (width <= 0 || height <= 0) return;
            GraphicsContext gc = canvas.getGraphicsContext2D();
            gc.setTextAlign(javafx.scene.text.TextAlignment.CENTER);
            gc.setTextBaseline(javafx.geometry.VPos.BOTTOM);
            gc.setFill(BG);
            gc.fillRect(0, 0, width, height);

            int[] arr = previewArray != null ? previewArray : model.getArray();
            if (arr == null || arr.length == 0) return;
            int n = arr.length;
            double barW = Math.max(2, (width - n) / n);
            double gap = Math.max(1, (width - barW * n) / (n + 1));
            for (int i = 0; i < n; i++) {
                Color color = BAR;
                if (previewArray == null) {
                    if (i == model.getFoundIndex()) color = FOUND;
                    else if (contains(model.getHighlight(), i)) color = CUR;
                    else if (contains(model.getSearchPath(), i)) color = VISIT;
                }

                double barH = (arr[i] / 100.0) * (height - 24); // More space at top for text
                double x = gap + i * (barW + gap);
                double y = height - barH - 8;
                gc.setFill(color);
                gc.fillRoundRect(x, y, barW, barH, 3, 3);
                
                // Draw value above the bar if it's wide enough
                if (barW >= 4) {
                    double fontSize = Math.min(12, Math.max(8, barW * 0.9));
                    gc.setFont(javafx.scene.text.Font.font("System", javafx.scene.text.FontWeight.BOLD, fontSize));
                    gc.setFill(Color.web("#9CA3AF")); // light grey text
                    gc.fillText(String.valueOf(arr[i]), x + barW / 2, y - 2);
                }
            }
        }

        private boolean contains(int[] arr, int value) {
            if (arr == null) return false;
            for (int item : arr) if (item == value) return true;
            return false;
        }
    }
}
