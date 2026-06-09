package utils;

import java.util.prefs.Preferences;

public class AppSettings {
    private static final Preferences prefs = Preferences.userNodeForPackage(AppSettings.class);

    public static void setTheme(String theme) { prefs.put("theme", theme); }
    public static String getTheme() { return prefs.get("theme", "dark"); }

    public static void setSpeed(int speed) { prefs.putInt("speed", speed); }
    public static int getSpeed() { return prefs.getInt("speed", 5); }

    public static void setSoundEnabled(boolean enabled) { prefs.putBoolean("sound", enabled); }
    public static boolean isSoundEnabled() { return prefs.getBoolean("sound", true); }

    public static void setArraySize(int size) { prefs.putInt("arraySize", size); }
    public static int getArraySize() { return prefs.getInt("arraySize", 30); }

    public static void setDefaultSortingAlgorithms(String value) { prefs.put("sortingAlgorithms", value); }
    public static String getDefaultSortingAlgorithms() {
        return prefs.get("sortingAlgorithms", "Bubble Sort,Quick Sort,Merge Sort");
    }

    public static void setDefaultSearchingTarget(int target) { prefs.putInt("searchTarget", target); }
    public static int getDefaultSearchingTarget() { return prefs.getInt("searchTarget", 50); }

    public static void setPathfindingAlgorithm(String algorithm) { prefs.put("pathfindingAlgorithm", algorithm); }
    public static String getPathfindingAlgorithm() { return prefs.get("pathfindingAlgorithm", "A* Search"); }

    public static String exportConfig() {
        return String.join("\n",
            "theme=" + getTheme(),
            "speed=" + getSpeed(),
            "sound=" + isSoundEnabled(),
            "arraySize=" + getArraySize(),
            "sortingAlgorithms=" + getDefaultSortingAlgorithms(),
            "searchTarget=" + getDefaultSearchingTarget(),
            "pathfindingAlgorithm=" + getPathfindingAlgorithm());
    }

    public static void importConfig(String text) {
        if (text == null) return;
        for (String line : text.split("\\R")) {
            int idx = line.indexOf('=');
            if (idx < 1) continue;
            String key = line.substring(0, idx).trim();
            String value = line.substring(idx + 1).trim();
            switch (key) {
                case "theme" -> setTheme(value);
                case "speed" -> setSpeed(parseInt(value, getSpeed()));
                case "sound" -> setSoundEnabled(Boolean.parseBoolean(value));
                case "arraySize" -> setArraySize(parseInt(value, getArraySize()));
                case "sortingAlgorithms" -> setDefaultSortingAlgorithms(value);
                case "searchTarget" -> setDefaultSearchingTarget(parseInt(value, getDefaultSearchingTarget()));
                case "pathfindingAlgorithm" -> setPathfindingAlgorithm(value);
                default -> { }
            }
        }
    }

    private static int parseInt(String value, int fallback) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ex) {
            return fallback;
        }
    }
}
