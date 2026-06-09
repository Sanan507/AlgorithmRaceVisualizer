package utils;

import model.RaceRecord;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class HistoryManager {
    private static final String HISTORY_FILE = "race_history.csv";
    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    public static void saveRecord(String algorithm, int arraySize, String dataset, int comparisons, int swaps, long timeMs) {
        String timestamp = DATE_FORMAT.format(new Date());
        String line = String.format("%s,%d,%s,%d,%d,%d,%s\n", 
                algorithm, arraySize, dataset, comparisons, swaps, timeMs, timestamp);
        
        try (FileWriter fw = new FileWriter(HISTORY_FILE, true);
             BufferedWriter bw = new BufferedWriter(fw)) {
            bw.write(line);
        } catch (IOException e) {
            System.err.println("Failed to save race history: " + e.getMessage());
        }
    }

    public static List<RaceRecord> loadHistory() {
        List<RaceRecord> records = new ArrayList<>();
        if (!Files.exists(Paths.get(HISTORY_FILE))) {
            return records;
        }

        try (BufferedReader br = new BufferedReader(new FileReader(HISTORY_FILE))) {
            String line;
            while ((line = br.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length == 7) {
                    records.add(new RaceRecord(
                        parts[0], 
                        Integer.parseInt(parts[1]), 
                        parts[2], 
                        Integer.parseInt(parts[3]), 
                        Integer.parseInt(parts[4]), 
                        Long.parseLong(parts[5]), 
                        parts[6]
                    ));
                }
            }
        } catch (IOException | NumberFormatException e) {
            System.err.println("Failed to load race history: " + e.getMessage());
        }
        return records;
    }
    
    public static void clearHistory() {
        try {
            Files.deleteIfExists(Paths.get(HISTORY_FILE));
        } catch (IOException e) {
            System.err.println("Failed to clear race history: " + e.getMessage());
        }
    }
}
