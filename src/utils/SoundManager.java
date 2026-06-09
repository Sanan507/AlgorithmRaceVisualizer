package utils;

import javafx.event.ActionEvent;
import javafx.scene.Scene;
import javafx.scene.control.ButtonBase;
import javafx.scene.control.ComboBoxBase;
import javafx.scene.control.Slider;
import javafx.scene.input.MouseEvent;

import javax.sound.midi.MidiChannel;
import javax.sound.midi.MidiSystem;
import javax.sound.midi.Synthesizer;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * SoundManager provides beautiful MIDI-based sound feedback for the visualizer.
 * Uses a Vibraphone instrument for pleasant, resonant tones.
 * Gracefully degrades if MIDI is unavailable — the app will still run fine.
 */
public final class SoundManager {
    private static final ExecutorService AUDIO = Executors.newSingleThreadExecutor(r -> {
        Thread thread = new Thread(r, "ui-sound-engine");
        thread.setDaemon(true);
        return thread;
    });

    private static volatile Synthesizer synthesizer;
    private static volatile MidiChannel channel;
    private static volatile boolean enabled = true;
    private static volatile boolean initialized = false;
    private static volatile long lastUiNs = 0;
    private static volatile long lastCompareNs = 0;
    private static volatile long lastSwapNs = 0;

    private SoundManager() { }

    /**
     * Lazily initializes the MIDI synthesizer. Called on first use rather than
     * in a static block, so that any failure cannot crash the class loader.
     */
    private static synchronized void ensureInitialized() {
        if (initialized) return;
        initialized = true;
        try {
            synthesizer = MidiSystem.getSynthesizer();
            synthesizer.open();
            MidiChannel[] channels = synthesizer.getChannels();
            if (channels != null && channels.length > 0) {
                channel = channels[0];
                // 11 = Vibraphone for a beautiful, resonant soundtrack effect
                channel.programChange(11);
            }
        } catch (Exception e) {
            // MIDI is optional; missing audio devices should never break the app.
            synthesizer = null;
            channel = null;
        }
    }

    public static void setEnabled(boolean value) {
        enabled = value;
    }

    public static boolean isEnabled() {
        return enabled;
    }

    public static void install(Scene scene) {
        // Trigger lazy init on install so MIDI is ready before first sound
        ensureInitialized();

        scene.addEventFilter(ActionEvent.ACTION, event -> {
            Object target = event.getTarget();
            if (target instanceof ComboBoxBase<?>) {
                playSelect();
            } else if (target instanceof ButtonBase) {
                playClick();
            }
        });
        scene.addEventFilter(MouseEvent.MOUSE_RELEASED, event -> {
            if (event.getTarget() instanceof Slider) {
                playSlider();
            }
        });
    }

    public static void playClick() {
        throttleUi(() -> playChord(100, 60, 64, 67));
    }

    public static void playSelect() {
        throttleUi(() -> playChord(100, 67, 71, 76));
    }

    public static void playSlider() {
        throttleUi(() -> playChord(100, 60, 65));
    }

    public static void playCompare() {
        long now = System.nanoTime();
        if (now - lastCompareNs < 95_000_000L) return;
        lastCompareNs = now;
        playChord(80, 72, 79);
    }

    public static void playSwap() {
        long now = System.nanoTime();
        if (now - lastSwapNs < 120_000_000L) return;
        lastSwapNs = now;
        playChord(120, 50, 57, 62);
    }

    public static void playStart() {
        playSequence(new int[][]{{60, 64}, {67, 72}}, 120);
    }

    public static void playPause() {
        playChord(120, 60, 63);
    }

    public static void playResume() {
        playSequence(new int[][]{{67, 72}, {76, 79}}, 120);
    }

    public static void playReset() {
        playSequence(new int[][]{{67, 71}, {60, 64}}, 150);
    }

    public static void playDone() {
        playSequence(new int[][]{{60, 64, 67}, {67, 72, 76}}, 150);
    }

    public static void playWinner() {
        playSequence(new int[][]{{60, 64}, {64, 67}, {67, 72, 76, 79}}, 180);
    }

    private static void throttleUi(Runnable cue) {
        long now = System.nanoTime();
        if (now - lastUiNs < 45_000_000L) return;
        lastUiNs = now;
        cue.run();
    }

    private static void playChord(int durationMs, int... notes) {
        if (!enabled) return;
        ensureInitialized();
        MidiChannel ch = channel;
        if (ch == null) return;
        AUDIO.submit(() -> {
            try {
                for (int note : notes) ch.noteOn(note, 80);
                Thread.sleep(durationMs);
                for (int note : notes) ch.noteOff(note);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } catch (Exception ignored) {
                // Sound is optional
            }
        });
    }

    private static void playSequence(int[][] chordSequence, int durationMs) {
        if (!enabled) return;
        ensureInitialized();
        MidiChannel ch = channel;
        if (ch == null) return;
        AUDIO.submit(() -> {
            try {
                for (int[] chord : chordSequence) {
                    for (int note : chord) ch.noteOn(note, 80);
                    Thread.sleep(durationMs);
                    for (int note : chord) ch.noteOff(note);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } catch (Exception ignored) {
                // Sound is optional
            }
        });
    }
}
