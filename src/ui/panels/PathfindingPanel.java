package ui.panels;

import algorithms.pathfinding.CellState;
import algorithms.pathfinding.GridCell;
import algorithms.pathfinding.PathfindingFactory;
import algorithms.pathfinding.PathfindingModel;
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
import javafx.scene.control.TextArea;
import javafx.scene.control.ToggleButton;
import javafx.scene.layout.FlowPane;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import model.AlgorithmModel;
import utils.AppSettings;
import utils.ComplexityInfo;
import utils.MazeGenerator;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

public class PathfindingPanel extends VBox {
    private static final int ROWS = 18;
    private static final int COLS = 28;
    private static final int START_ROW = 2;
    private static final int START_COL = 2;
    private static final int END_ROW = ROWS - 3;
    private static final int END_COL = COLS - 3;

    private static final Color COL_EMPTY = Color.web("#1E1E2E");
    private static final Color COL_WALL = Color.web("#374151");
    private static final Color COL_START = Color.web("#10B981");
    private static final Color COL_END = Color.web("#EF4444");
    private static final Color COL_VISITED = Color.web("#3730A3");
    private static final Color COL_FRONTIER = Color.web("#7C3AED");
    private static final Color COL_PATH = Color.web("#F59E0B");

    private Slider speedSlider;
    private ComboBox<String> algo1Box;
    private ComboBox<String> algo2Box;
    private ComboBox<String> algo3Box;
    private ComboBox<String> algo4Box;
    private CheckBox thirdLaneCheck;
    private CheckBox fourthLaneCheck;
    private Button startBtn;
    private Button pauseBtn;
    private Button resetBtn;
    private Button clearBtn;
    private ToggleButton wallToggle;
    private ComboBox<String> mazeTypeBox;
    private Button mazeBtn;
    private Label winnerLabel;
    private GridPane raceGrid;
    private BarChart<String, Number> comparisonChart;
    private TextArea explanationArea;
    private final boolean[][] walls = new boolean[ROWS][COLS];
    private final List<PathRacePane> racePanes = new ArrayList<>();
    private volatile boolean running = false;
    private volatile boolean cancelled = false;
    private volatile boolean paused = false;
    private final Object pauseLock = new Object();

    public PathfindingPanel() {
        getStyleClass().add("content-panel");
        setPadding(new Insets(18));
        setSpacing(10);
        buildUI();
    }

    private void buildUI() {
        Label header = new Label("Pathfinding Algorithm Race");
        header.getStyleClass().add("panel-header");
        Label sub = new Label("BFS, DFS, Dijkstra, and A* search the same grid at the same time.");
        sub.getStyleClass().add("panel-subheader");

        FlowPane controls = new FlowPane(14, 10);
        controls.getStyleClass().add("config-row");
        controls.setPadding(new Insets(12, 16, 12, 16));
        controls.setAlignment(Pos.CENTER_LEFT);

        String[] names = PathfindingFactory.allNames();
        algo1Box = makeAlgoBox(names[0]);
        algo2Box = makeAlgoBox(names[2]);
        algo3Box = makeAlgoBox(names[3]);
        algo4Box = makeAlgoBox(names[1]);
        thirdLaneCheck = new CheckBox("3-way race");
        thirdLaneCheck.getStyleClass().add("styled-check");
        thirdLaneCheck.setSelected(true);
        thirdLaneCheck.selectedProperty().addListener((o, oldValue, selected) -> {
            algo3Box.setDisable(!selected);
            if (!running) buildRacePanes();
        });
        fourthLaneCheck = new CheckBox("4th lane");
        fourthLaneCheck.getStyleClass().add("styled-check");
        fourthLaneCheck.setSelected(true);
        fourthLaneCheck.selectedProperty().addListener((o, oldValue, selected) -> {
            algo4Box.setDisable(!selected);
            if (!running) buildRacePanes();
        });

        speedSlider = new Slider(1, 10, AppSettings.getSpeed());
        speedSlider.setPrefWidth(190);
        speedSlider.getStyleClass().add("styled-slider");

        startBtn = makeButton("Start Path Race", "btn-primary");
        pauseBtn = makeButton("Pause", "btn-secondary");
        resetBtn = makeButton("Stop / Reset", "btn-secondary");
        clearBtn = makeButton("Clear Walls", "btn-secondary");
        pauseBtn.setDisable(true);
        wallToggle = new ToggleButton("Draw Walls");
        wallToggle.getStyleClass().addAll("styled-btn", "btn-secondary");

        mazeTypeBox = new ComboBox<>();
        mazeTypeBox.getItems().addAll(MazeGenerator.allNames());
        mazeTypeBox.setValue("Recursive Backtracker");
        mazeTypeBox.getStyleClass().add("styled-combo");
        mazeTypeBox.setPrefWidth(190);
        mazeBtn = makeButton("Generate Maze", "btn-primary");
        mazeBtn.setOnAction(e -> generateMaze());

        winnerLabel = new Label("");
        winnerLabel.getStyleClass().add("winner-label");

        startBtn.setOnAction(e -> startRace());
        pauseBtn.setOnAction(e -> togglePause());
        resetBtn.setOnAction(e -> resetGrid());
        clearBtn.setOnAction(e -> clearWalls());

        controls.getChildren().addAll(
            makeField("Lane 1", algo1Box),
            makeField("Lane 2", algo2Box),
            makeField("Lane 3", new HBox(8, thirdLaneCheck, algo3Box)),
            makeField("Lane 4", new HBox(8, fourthLaneCheck, algo4Box)),
            makeField("Speed", speedSlider),
            makeField("Maze Type", mazeTypeBox),
            mazeBtn, startBtn, pauseBtn, resetBtn, clearBtn, wallToggle, winnerLabel
        );

        raceGrid = new GridPane();
        raceGrid.getStyleClass().add("canvas-row");
        raceGrid.setPadding(new Insets(10));
        raceGrid.setHgap(12);
        raceGrid.setVgap(12);

        HBox bottom = new HBox(12);
        bottom.setMinHeight(185);
        bottom.setPrefHeight(205);
        comparisonChart = new BarChart<>(new CategoryAxis(), new NumberAxis());
        comparisonChart.setTitle("Pathfinding Comparison");
        comparisonChart.setLegendVisible(false);
        comparisonChart.setAnimated(true);
        comparisonChart.getStyleClass().add("metric-chart");
        HBox.setHgrow(comparisonChart, Priority.ALWAYS);

        explanationArea = new TextArea(buildExplanation());
        explanationArea.setEditable(false);
        explanationArea.setWrapText(true);
        explanationArea.getStyleClass().add("explanation-area");
        explanationArea.setPrefWidth(440);
        bottom.getChildren().addAll(comparisonChart, explanationArea);

        getChildren().addAll(header, sub, controls, raceGrid, bottom);
        buildRacePanes();
    }

    private void buildRacePanes() {
        racePanes.forEach(PathRacePane::stopRendering);
        raceGrid.getChildren().clear();
        racePanes.clear();
        List<String> names = selectedAlgorithms();
        for (int i = 0; i < names.size(); i++) {
            PathfindingModel model = createModel(names.get(i));
            PathRacePane pane = new PathRacePane(model);
            racePanes.add(pane);
            GridPane.setHgrow(pane, Priority.ALWAYS);
            GridPane.setVgrow(pane, Priority.ALWAYS);
            raceGrid.add(pane, i % 2, i / 2);
        }
        Platform.runLater(() -> racePanes.forEach(PathRacePane::renderNow));
        updateChart();
    }

    private PathfindingModel createModel(String name) {
        PathfindingModel model = PathfindingFactory.create(name);
        model.initGrid(ROWS, COLS);
        for (int r = 0; r < ROWS; r++) {
            for (int c = 0; c < COLS; c++) {
                if (walls[r][c]) model.getGrid()[r][c].state = CellState.WALL;
            }
        }
        model.start = model.getGrid()[START_ROW][START_COL];
        model.end = model.getGrid()[END_ROW][END_COL];
        model.start.state = CellState.START;
        model.end.state = CellState.END;
        model.setStepDelayMs(speedToDelay());
        model.reset();
        return model;
    }

    private void startRace() {
        if (running) return;
        cancelled = false;
        paused = false;
        running = true;
        startBtn.setDisable(true);
        pauseBtn.setDisable(false);
        pauseBtn.setText("Pause");
        resetBtn.setDisable(false);
        clearBtn.setDisable(true);
        wallToggle.setDisable(true);
        mazeBtn.setDisable(true);
        mazeTypeBox.setDisable(true);
        winnerLabel.setText("");
        buildRacePanes();
        racePanes.forEach(PathRacePane::startRendering);

        AtomicInteger doneCount = new AtomicInteger(0);
        AtomicReference<PathRacePane> winner = new AtomicReference<>();
        int total = racePanes.size();

        for (PathRacePane pane : racePanes) {
            Thread thread = new Thread(() -> {
                PathfindingModel model = pane.getModel();
                long started = System.currentTimeMillis();
                while (!cancelled && !model.isDone()) {
                    waitIfPaused();
                    if (cancelled) break;
                    model.step();
                    pane.setTimeMs(System.currentTimeMillis() - started);
                    Platform.runLater(() -> {
                        pane.renderNow();
                        updateChart();
                    });
                    try {
                        Thread.sleep(model.getStepDelayMs());
                    } catch (InterruptedException ex) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
                if (!cancelled && model.isPathFound()) {
                    markPath(model);
                    if (winner.compareAndSet(null, pane)) {
                        Platform.runLater(() -> winnerLabel.setText("Winner: " + model.getName()
                            + " (" + model.getSteps() + " steps)"));
                        AlgorithmModel.playWinner();
                    }
                }
                if (!cancelled && doneCount.incrementAndGet() == total) {
                    Platform.runLater(() -> {
                        running = false;
                        startBtn.setDisable(false);
                        pauseBtn.setDisable(true);
                        pauseBtn.setText("Pause");
                        resetBtn.setDisable(false);
                        clearBtn.setDisable(false);
                        wallToggle.setDisable(false);
                        racePanes.forEach(PathRacePane::stopRendering);
                        if (winner.get() == null) winnerLabel.setText("No path found");
                        updateChart();
                    });
                }
            }, pane.getModel().getName() + "-path-race");
            thread.setDaemon(true);
            thread.start();
        }
    }

    private void markPath(PathfindingModel model) {
        for (GridCell cell : model.getPath()) {
            if (cell.state != CellState.START && cell.state != CellState.END) cell.state = CellState.PATH;
        }
    }

    private void resetGrid() {
        cancelled = true;
        paused = false;
        synchronized (pauseLock) { pauseLock.notifyAll(); }
        AlgorithmModel.playReset();
        running = false;
        winnerLabel.setText("");
        racePanes.forEach(PathRacePane::stopRendering);
        for (int r = 0; r < ROWS; r++) {
            for (int c = 0; c < COLS; c++) walls[r][c] = false;
        }
        enableControls();
        buildRacePanes();
    }

    private void clearWalls() {
        if (running) return;
        for (int r = 0; r < ROWS; r++) {
            for (int c = 0; c < COLS; c++) walls[r][c] = false;
        }
        winnerLabel.setText("");
        buildRacePanes();
    }

    private void generateMaze() {
        if (running) return;
        MazeGenerator.MazeType type = MazeGenerator.fromName(mazeTypeBox.getValue());
        boolean[][] generated = MazeGenerator.generate(
            ROWS, COLS, START_ROW, START_COL, END_ROW, END_COL, type);
        for (int r = 0; r < ROWS; r++) {
            for (int c = 0; c < COLS; c++) {
                walls[r][c] = generated[r][c];
            }
        }
        winnerLabel.setText("");
        buildRacePanes();
    }

    private void togglePause() {
        if (!running) return;
        if (paused) {
            paused = false;
            synchronized (pauseLock) { pauseLock.notifyAll(); }
            pauseBtn.setText("Pause");
            AlgorithmModel.playResume();
        } else {
            paused = true;
            pauseBtn.setText("Resume");
            AlgorithmModel.playPause();
        }
    }

    private void waitIfPaused() {
        synchronized (pauseLock) {
            while (paused && !cancelled) {
                try {
                    pauseLock.wait();
                } catch (InterruptedException ex) {
                    Thread.currentThread().interrupt();
                    cancelled = true;
                    return;
                }
            }
        }
    }

    private void toggleWall(double mouseX, double mouseY, Canvas canvas) {
        if (running || !wallToggle.isSelected()) return;
        double cellW = canvas.getWidth() / COLS;
        double cellH = canvas.getHeight() / ROWS;
        int c = (int) (mouseX / cellW);
        int r = (int) (mouseY / cellH);
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
        if ((r == START_ROW && c == START_COL) || (r == END_ROW && c == END_COL)) return;
        walls[r][c] = !walls[r][c];
        buildRacePanes();
    }

    private void enableControls() {
        startBtn.setDisable(false);
        pauseBtn.setDisable(true);
        pauseBtn.setText("Pause");
        resetBtn.setDisable(false);
        clearBtn.setDisable(false);
        wallToggle.setDisable(false);
        mazeBtn.setDisable(false);
        mazeTypeBox.setDisable(false);
    }

    private void updateChart() {
        XYChart.Series<String, Number> series = new XYChart.Series<>();
        for (PathRacePane pane : racePanes) {
            series.getData().add(new XYChart.Data<>(pane.getModel().getName(), pane.getModel().getSteps()));
        }
        comparisonChart.getData().clear();
        comparisonChart.getData().add(series);
    }

    private String buildExplanation() {
        StringBuilder builder = new StringBuilder("Pathfinding Race\n\n");
        for (String name : selectedAlgorithms()) {
            ComplexityInfo.Info info = ComplexityInfo.get(name);
            builder.append(name)
                .append(" - ").append(info.average)
                .append("\n").append(info.theory).append("\n\n");
        }
        return builder.toString();
    }

    private int speedToDelay() {
        return Math.max(1, 185 - (int) speedSlider.getValue() * 17);
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
        box.getItems().addAll(PathfindingFactory.allNames());
        box.setValue(Arrays.asList(PathfindingFactory.allNames()).contains(selected)
            ? selected
            : PathfindingFactory.allNames()[0]);
        box.getStyleClass().add("styled-combo");
        box.setPrefWidth(176);
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
        if (fourthLaneCheck.isSelected()) selected.add(algo4Box.getValue());
        return selected;
    }

    private Button makeButton(String text, String styleClass) {
        Button button = new Button(text);
        button.getStyleClass().addAll("styled-btn", styleClass);
        return button;
    }

    private class PathRacePane extends VBox {
        private final PathfindingModel model;
        private final Canvas canvas = new Canvas(460, 210);
        private AnimationTimer timer;
        private Label stepsLabel;
        private Label timeLabel;
        private long timeMs = 0;

        PathRacePane(PathfindingModel model) {
            this.model = model;
            getStyleClass().add("race-pane");
            build();
        }

        private void build() {
            HBox header = new HBox(10);
            header.getStyleClass().add("race-pane-header");
            header.setPadding(new Insets(8, 12, 8, 12));
            header.setAlignment(Pos.CENTER_LEFT);
            Label title = new Label(model.getName());
            title.getStyleClass().add("race-pane-title");
            Region spacer = new Region();
            HBox.setHgrow(spacer, Priority.ALWAYS);
            header.getChildren().addAll(title, spacer);

            StackPane wrap = new StackPane(canvas);
            wrap.getStyleClass().add("canvas-wrap");
            wrap.setMinHeight(190);
            wrap.setPrefHeight(220);
            VBox.setVgrow(wrap, Priority.ALWAYS);
            canvas.widthProperty().bind(wrap.widthProperty());
            canvas.heightProperty().bind(wrap.heightProperty());
            canvas.widthProperty().addListener(e -> draw());
            canvas.heightProperty().addListener(e -> draw());
            canvas.setOnMousePressed(e -> toggleWall(e.getX(), e.getY(), canvas));

            stepsLabel = new Label("0");
            timeLabel = new Label("0 ms");
            HBox stats = new HBox(0);
            stats.getStyleClass().add("stats-bar");
            stats.getChildren().addAll(makeStatBox(stepsLabel, "Steps"), makeDivider(), makeStatBox(timeLabel, "Time"));

            model.stepsProperty().addListener((o, oldValue, value) -> Platform.runLater(() -> stepsLabel.setText(value.toString())));
            getChildren().addAll(header, wrap, stats);
            Platform.runLater(this::draw);
        }

        private VBox makeStatBox(Label valueLabel, String labelText) {
            VBox box = new VBox(2);
            box.setAlignment(Pos.CENTER);
            box.setPadding(new Insets(7, 18, 7, 18));
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

        PathfindingModel getModel() {
            return model;
        }

        void setTimeMs(long timeMs) {
            this.timeMs = timeMs;
            Platform.runLater(() -> timeLabel.setText(timeMs + " ms"));
        }

        private void draw() {
            double width = canvas.getWidth();
            double height = canvas.getHeight();
            if (width <= 0 || height <= 0 || model.getGrid() == null) return;
            double cellW = width / COLS;
            double cellH = height / ROWS;
            GraphicsContext gc = canvas.getGraphicsContext2D();
            gc.setFill(Color.web("#111827"));
            gc.fillRect(0, 0, width, height);
            for (int r = 0; r < ROWS; r++) {
                for (int c = 0; c < COLS; c++) {
                    GridCell cell = model.getGrid()[r][c];
                    Color color = switch (cell.state) {
                        case WALL -> COL_WALL;
                        case START -> COL_START;
                        case END -> COL_END;
                        case VISITED -> COL_VISITED;
                        case FRONTIER -> COL_FRONTIER;
                        case PATH -> COL_PATH;
                        default -> COL_EMPTY;
                    };
                    gc.setFill(color);
                    gc.fillRoundRect(c * cellW + 1, r * cellH + 1, cellW - 2, cellH - 2, 3, 3);
                }
            }
        }
    }
}
