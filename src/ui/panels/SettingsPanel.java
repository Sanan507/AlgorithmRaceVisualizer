package ui.panels;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.CheckBox;
import javafx.scene.control.Label;
import javafx.scene.control.RadioButton;
import javafx.scene.control.Slider;
import javafx.scene.control.TextArea;
import javafx.scene.control.ToggleGroup;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.FileChooser;
import javafx.stage.Stage;
import model.AlgorithmModel;
import utils.AppSettings;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import javafx.scene.image.ImageView;
import javafx.scene.image.WritableImage;
import javafx.animation.FadeTransition;
import javafx.util.Duration;
import javafx.scene.layout.StackPane;

public class SettingsPanel extends VBox {
    private final Stage stage;

    public SettingsPanel(Stage stage) {
        this.stage = stage;
        getStyleClass().add("content-panel");
        setPadding(new Insets(24));
        setSpacing(20);
        buildUI();
    }

    private void buildUI() {
        Label header = new Label("Settings");
        header.getStyleClass().add("panel-header");
        Label sub = new Label("Customize visuals, audio, defaults, and saved configurations.");
        sub.getStyleClass().add("panel-subheader");

        VBox themeCard = makeCard("Theme", "Switch between dark and light mode.");
        ToggleGroup themeGroup = new ToggleGroup();
        RadioButton darkRb = new RadioButton("Dark Theme");
        RadioButton lightRb = new RadioButton("Light Theme");
        darkRb.setToggleGroup(themeGroup);
        lightRb.setToggleGroup(themeGroup);
        darkRb.setSelected(!"light".equals(AppSettings.getTheme()));
        lightRb.setSelected("light".equals(AppSettings.getTheme()));
        darkRb.getStyleClass().add("styled-radio");
        lightRb.getStyleClass().add("styled-radio");
        darkRb.setOnAction(e -> applyTheme("dark"));
        lightRb.setOnAction(e -> applyTheme("light"));
        themeCard.getChildren().add(new HBox(16, darkRb, lightRb));

        VBox soundCard = makeCard("Sound Effects", "Toggle feedback tones for comparisons, swaps, and winners.");
        CheckBox soundCheck = new CheckBox("Enable sound effects");
        soundCheck.setSelected(AppSettings.isSoundEnabled());
        soundCheck.getStyleClass().add("styled-check");
        soundCheck.selectedProperty().addListener((o, oldValue, enabled) -> {
            AppSettings.setSoundEnabled(enabled);
            AlgorithmModel.setSoundEnabled(enabled);
        });
        soundCard.getChildren().add(soundCheck);

        VBox sizeCard = makeCard("Defaults", "Set the default sorting array size and global animation speed.");
        Slider sizeSlider = new Slider(10, 120, AppSettings.getArraySize());
        sizeSlider.setShowTickLabels(true);
        sizeSlider.setShowTickMarks(true);
        sizeSlider.setMajorTickUnit(20);
        sizeSlider.getStyleClass().add("styled-slider");
        sizeSlider.valueProperty().addListener((o, oldValue, value) -> AppSettings.setArraySize(value.intValue()));
        Slider speedSlider = new Slider(1, 10, AppSettings.getSpeed());
        speedSlider.setShowTickLabels(true);
        speedSlider.setShowTickMarks(true);
        speedSlider.setMajorTickUnit(1);
        speedSlider.getStyleClass().add("styled-slider");
        speedSlider.valueProperty().addListener((o, oldValue, value) -> AppSettings.setSpeed(value.intValue()));
        sizeCard.getChildren().addAll(makeSmallLabel("Default array size"), sizeSlider, makeSmallLabel("Default speed"), speedSlider);

        VBox fileCard = makeCard("Save / Load Configuration", "Export or import your preferred theme, speed, audio, and algorithm defaults.");
        TextArea preview = new TextArea(AppSettings.exportConfig());
        preview.setEditable(false);
        preview.setPrefRowCount(7);
        preview.getStyleClass().add("explanation-area");
        Button saveBtn = makeButton("Save Config", "btn-primary");
        Button loadBtn = makeButton("Load Config", "btn-secondary");
        saveBtn.setOnAction(e -> saveConfig(preview));
        loadBtn.setOnAction(e -> loadConfig(preview));
        HBox fileButtons = new HBox(10, saveBtn, loadBtn);
        fileButtons.setAlignment(Pos.CENTER_LEFT);
        fileCard.getChildren().addAll(preview, fileButtons);

        VBox fsCard = makeCard("Fullscreen", "Toggle immersive fullscreen mode.");
        Button fsBtn = makeButton("Toggle Fullscreen", "btn-secondary");
        fsBtn.setOnAction(e -> stage.setFullScreen(!stage.isFullScreen()));
        fsCard.getChildren().add(fsBtn);

        VBox aboutCard = makeCard("About", "");
        Label about = new Label(
            "Algorithm Race Visualizer v2.1\n" +
            "JavaFX desktop application with MVC-style package separation, worker-thread races, canvas animation, charts, settings, and DSA visualizations.");
        about.getStyleClass().add("about-text");
        about.setWrapText(true);
        aboutCard.getChildren().add(about);

        getChildren().addAll(header, sub, themeCard, soundCard, sizeCard, fileCard, fsCard, aboutCard);
    }

    private void applyTheme(String theme) {
        Scene scene = stage.getScene();
        StackPane root = (StackPane) scene.getRoot();
        
        // Take a snapshot of the current state
        WritableImage snapshot = root.snapshot(new javafx.scene.SnapshotParameters(), null);
        ImageView imageView = new ImageView(snapshot);
        root.getChildren().add(imageView);
        
        // Swap stylesheets
        scene.getStylesheets().clear();
        scene.getStylesheets().add(getClass().getResource("/ui/styles/" + theme + "-theme.css").toExternalForm());
        AppSettings.setTheme(theme);
        
        // Fade out the old snapshot
        FadeTransition ft = new FadeTransition(Duration.millis(500), imageView);
        ft.setFromValue(1.0);
        ft.setToValue(0.0);
        ft.setOnFinished(e -> root.getChildren().remove(imageView));
        ft.play();
    }

    private void saveConfig(TextArea preview) {
        FileChooser chooser = new FileChooser();
        chooser.setTitle("Save Algorithm Race Configuration");
        chooser.getExtensionFilters().add(new FileChooser.ExtensionFilter("Configuration", "*.properties"));
        chooser.setInitialFileName("algorithm-race-config.properties");
        File file = chooser.showSaveDialog(stage);
        if (file == null) return;
        try {
            String config = AppSettings.exportConfig();
            Files.writeString(file.toPath(), config);
            preview.setText(config);
        } catch (IOException ex) {
            preview.setText("Unable to save configuration: " + ex.getMessage());
        }
    }

    private void loadConfig(TextArea preview) {
        FileChooser chooser = new FileChooser();
        chooser.setTitle("Load Algorithm Race Configuration");
        chooser.getExtensionFilters().add(new FileChooser.ExtensionFilter("Configuration", "*.properties"));
        File file = chooser.showOpenDialog(stage);
        if (file == null) return;
        try {
            String config = Files.readString(file.toPath());
            AppSettings.importConfig(config);
            preview.setText(AppSettings.exportConfig());
            applyTheme(AppSettings.getTheme());
            AlgorithmModel.setSoundEnabled(AppSettings.isSoundEnabled());
        } catch (IOException ex) {
            preview.setText("Unable to load configuration: " + ex.getMessage());
        }
    }

    private VBox makeCard(String title, String desc) {
        VBox card = new VBox(10);
        card.getStyleClass().add("settings-card");
        card.setPadding(new Insets(16, 20, 16, 20));
        Label titleLbl = new Label(title);
        titleLbl.getStyleClass().add("settings-card-title");
        card.getChildren().add(titleLbl);
        if (!desc.isEmpty()) {
            Label descLbl = new Label(desc);
            descLbl.getStyleClass().add("settings-card-desc");
            descLbl.setWrapText(true);
            card.getChildren().add(descLbl);
        }
        return card;
    }

    private Label makeSmallLabel(String text) {
        Label label = new Label(text);
        label.getStyleClass().add("config-label");
        return label;
    }

    private Button makeButton(String text, String styleClass) {
        Button button = new Button(text);
        button.getStyleClass().addAll("styled-btn", styleClass);
        return button;
    }
}
