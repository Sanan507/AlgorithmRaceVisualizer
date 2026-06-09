package main;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.stage.Stage;
import model.AlgorithmModel;
import ui.MainLayout;
import utils.AppSettings;
import utils.SoundManager;

public class Main extends Application {
    public static final String APP_TITLE = "Algorithm Race Visualizer";
    public static final double MIN_WIDTH = 1280;
    public static final double MIN_HEIGHT = 780;

    @Override
    public void start(Stage primaryStage) {
        AlgorithmModel.setSoundEnabled(AppSettings.isSoundEnabled());
        MainLayout layout = new MainLayout(primaryStage);
        Scene scene = new Scene(layout.getRoot(), MIN_WIDTH, MIN_HEIGHT);
        SoundManager.install(scene);
        scene.getStylesheets().add(getClass()
            .getResource("/ui/styles/" + ("light".equals(AppSettings.getTheme()) ? "light-theme.css" : "dark-theme.css"))
            .toExternalForm());

        primaryStage.setTitle(APP_TITLE);
        primaryStage.setMinWidth(MIN_WIDTH);
        primaryStage.setMinHeight(MIN_HEIGHT);
        primaryStage.setWidth(MIN_WIDTH);
        primaryStage.setHeight(MIN_HEIGHT);
        primaryStage.setFullScreen(false);
        primaryStage.setScene(scene);
        primaryStage.show();
        primaryStage.setMaximized(true);
    }

    public static void main(String[] args) {
        launch(args);
    }
}
