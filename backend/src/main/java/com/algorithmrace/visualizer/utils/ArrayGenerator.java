package com.algorithmrace.visualizer.utils;

import java.util.Arrays;
import java.util.Random;

public final class ArrayGenerator {
    private ArrayGenerator() {}

    public enum ArrayType {
        RANDOM, NEARLY_SORTED, REVERSED, FEW_UNIQUE
    }

    public static int[] generate(int size, ArrayType type) {
        int safeSize = Math.max(2, Math.min(size, 160));
        int[] arr = new int[safeSize];
        Random rng = new Random();
        switch (type) {
            case RANDOM -> {
                for (int i = 0; i < safeSize; i++) arr[i] = rng.nextInt(95) + 5;
            }
            case NEARLY_SORTED -> {
                for (int i = 0; i < safeSize; i++) arr[i] = i + 1;
                for (int k = 0; k < Math.max(1, safeSize / 10); k++) {
                    int a = rng.nextInt(safeSize);
                    int b = rng.nextInt(safeSize);
                    int t = arr[a];
                    arr[a] = arr[b];
                    arr[b] = t;
                }
                arr = normalize(arr);
            }
            case REVERSED -> {
                for (int i = 0; i < safeSize; i++) arr[i] = safeSize - i;
                arr = normalize(arr);
            }
            case FEW_UNIQUE -> {
                int[] vals = {10, 25, 50, 75, 90};
                for (int i = 0; i < safeSize; i++) arr[i] = vals[rng.nextInt(vals.length)];
            }
        }
        return arr;
    }

    public static int[] normalize(int[] arr) {
        int max = Arrays.stream(arr).max().orElse(1);
        int min = Arrays.stream(arr).min().orElse(0);
        int range = max - min;
        if (range == 0) return arr.clone();
        int[] norm = new int[arr.length];
        for (int i = 0; i < arr.length; i++) {
            norm[i] = (int) (((arr[i] - min) / (double) range) * 95) + 5;
        }
        return norm;
    }

    public static ArrayType fromLabel(String label) {
        return switch (label == null ? "" : label) {
            case "Nearly Sorted" -> ArrayType.NEARLY_SORTED;
            case "Reversed" -> ArrayType.REVERSED;
            case "Few Unique" -> ArrayType.FEW_UNIQUE;
            default -> ArrayType.RANDOM;
        };
    }
}
