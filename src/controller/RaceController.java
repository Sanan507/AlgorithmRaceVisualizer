package controller;

import javafx.application.Platform;
import model.AlgorithmModel;
import java.util.*;
import java.util.concurrent.*;

/**
 * RaceController manages parallel execution of multiple algorithms.
 * Each algorithm runs in its own thread via ExecutorService.
 * UI updates are dispatched via Platform.runLater() — non-blocking.
 */
public class RaceController {

    public interface RaceListener {
        void onStep(AlgorithmModel model);
        void onWinner(AlgorithmModel model);
        void onAllDone();
    }

    private ExecutorService executor;
    private List<AlgorithmModel> models = new ArrayList<>();
    private List<Future<?>> futures     = new ArrayList<>();
    private RaceListener listener;

    private volatile boolean paused    = false;
    private volatile boolean cancelled = false;
    private AlgorithmModel winner      = null;
    private int doneCount              = 0;

    private final Object pauseLock = new Object();

    public RaceController(RaceListener listener) {
        this.listener = listener;
    }

    public void setModels(List<AlgorithmModel> models) {
        this.models = models;
    }

    /**
     * Start all algorithms in parallel threads.
     * Each thread repeatedly calls step() until done or cancelled.
     */
    public void start() {
        cancelled = false; paused = false;
        winner = null; doneCount = 0;

        int n = models.size();
        executor = Executors.newFixedThreadPool(n);

        for (AlgorithmModel model : models) {
            model.setRunning(true);
            long startTime = System.currentTimeMillis();

            Future<?> f = executor.submit(() -> {
                try {
                    while (!model.isDone() && !cancelled) {
                        // Respect pause
                        synchronized (pauseLock) {
                            while (paused && !cancelled) pauseLock.wait();
                        }
                        if (cancelled) break;

                        model.step();
                        long elapsed = System.currentTimeMillis() - startTime;
                        model.setTimeMs(elapsed);

                        // Push UI update on JavaFX thread
                        Platform.runLater(() -> {
                            if (listener != null) listener.onStep(model);
                        });

                        // Speed delay
                        int delay = model.getStepDelayMs();
                        if (delay > 0) Thread.sleep(delay);
                    }

                    if (model.isDone()) {
                        Platform.runLater(() -> checkWinner(model));
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
            futures.add(f);
        }
        executor.shutdown();
    }

    private synchronized void checkWinner(AlgorithmModel model) {
        if (winner == null) {
            winner = model;
            if (listener != null) listener.onWinner(model);
        }
        doneCount++;
        if (doneCount >= models.size()) {
            if (listener != null) listener.onAllDone();
        }
    }

    public void pause() {
        paused = true;
        models.forEach(m -> { if (!m.isDone()) m.statusProperty().set("Paused"); });
    }

    public void resume() {
        paused = false;
        synchronized (pauseLock) { pauseLock.notifyAll(); }
        models.forEach(m -> { if (!m.isDone()) m.statusProperty().set("Running..."); });
    }

    public void reset() {
        cancelled = true;
        paused    = false;
        synchronized (pauseLock) { pauseLock.notifyAll(); }
        if (executor != null) {
            executor.shutdownNow();
            try { executor.awaitTermination(500, TimeUnit.MILLISECONDS); }
            catch (InterruptedException ignored) {}
        }
        futures.clear();
        winner = null; doneCount = 0;
    }

    public void setSpeedForAll(int delayMs) {
        models.forEach(m -> m.setStepDelayMs(delayMs));
    }

    public boolean isPaused()  { return paused; }
    public AlgorithmModel getWinner() { return winner; }
}
