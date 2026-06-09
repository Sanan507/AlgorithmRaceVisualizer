package utils;

import java.util.Arrays;
import java.util.Random;

public class ArrayGenerator {

    public enum ArrayType { RANDOM, NEARLY_SORTED, REVERSED, FEW_UNIQUE }

    public static int[] generate(int size, ArrayType type) {
        int[] arr = new int[size];
        switch (type) {
            case RANDOM: {
                Random rng = new Random();
                for (int i = 0; i < size; i++) arr[i] = rng.nextInt(95) + 5;
                break;
            }
            case NEARLY_SORTED: {
                for (int i = 0; i < size; i++) arr[i] = i + 1;
                Random rng = new Random();
                for (int k = 0; k < size / 10; k++) {
                    int a = rng.nextInt(size), b = rng.nextInt(size);
                    int t = arr[a]; arr[a] = arr[b]; arr[b] = t;
                }
                break;
            }
            case REVERSED: {
                for (int i = 0; i < size; i++) arr[i] = size - i;
                break;
            }
            case FEW_UNIQUE: {
                int[] vals = {10, 25, 50, 75, 90};
                Random rng = new Random();
                for (int i = 0; i < size; i++) arr[i] = vals[rng.nextInt(vals.length)];
                break;
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
        for (int i = 0; i < arr.length; i++)
            norm[i] = (int)(((arr[i] - min) / (double) range) * 95) + 5;
        return norm;
    }
}
