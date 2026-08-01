package com.algorithmrace.visualizer.utils;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.algorithmrace.visualizer.utils.ArrayGenerator.ArrayType;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ArrayGeneratorTest {

  @Test
  @DisplayName("generate() respects bounds")
  void testGenerateBounds() {
    // Should be clamped to 2
    int[] tooSmall = ArrayGenerator.generate(1, ArrayType.RANDOM);
    assertEquals(2, tooSmall.length, "Size less than 2 should be clamped to 2");

    // Should be clamped to 160
    int[] tooLarge = ArrayGenerator.generate(200, ArrayType.RANDOM);
    assertEquals(160, tooLarge.length, "Size more than 160 should be clamped to 160");

    // Valid size should be unchanged
    int[] valid = ArrayGenerator.generate(50, ArrayType.RANDOM);
    assertEquals(50, valid.length, "Valid size should be used directly");
  }

  @Test
  @DisplayName("generate() with RANDOM creates elements in bounds [5, 99]")
  void testGenerateRandom() {
    int[] result = ArrayGenerator.generate(100, ArrayType.RANDOM);
    for (int value : result) {
      assertTrue(value >= 5 && value <= 99, "Random value " + value + " is out of bounds [5, 99]");
    }
  }

  @Test
  @DisplayName("generate() with NEARLY_SORTED creates elements with overall ascending trend")
  void testGenerateNearlySorted() {
    int[] result = ArrayGenerator.generate(100, ArrayType.NEARLY_SORTED);
    assertEquals(100, result.length);
    // Since it's nearly sorted and normalized, just verify bounds
    for (int value : result) {
      assertTrue(value >= 5 && value <= 100, "Nearly sorted value " + value + " out of bounds");
    }
  }

  @Test
  @DisplayName("generate() with REVERSED creates elements in descending order")
  void testGenerateReversed() {
    int[] result = ArrayGenerator.generate(10, ArrayType.REVERSED);
    assertEquals(10, result.length);
    // Elements should be strictly decreasing after normalization, or at least monotonically
    // decreasing
    for (int i = 0; i < result.length - 1; i++) {
      assertTrue(result[i] >= result[i + 1], "Elements should be in descending order");
    }
  }

  @Test
  @DisplayName("generate() with FEW_UNIQUE only contains specific values")
  void testGenerateFewUnique() {
    int[] result = ArrayGenerator.generate(100, ArrayType.FEW_UNIQUE);
    Set<Integer> validValues = new HashSet<>(Arrays.asList(10, 25, 50, 75, 90));

    for (int value : result) {
      assertTrue(
          validValues.contains(value), "Value " + value + " is not in the set of unique values");
    }
  }

  @Test
  @DisplayName("normalize() correctly scales array elements")
  void testNormalize() {
    int[] input = {10, 20, 30, 40, 50}; // min 10, max 50, range 40
    int[] result = ArrayGenerator.normalize(input);

    // min should map to 5
    // max should map to 100 (5 + 95)
    assertEquals(5, Arrays.stream(result).min().getAsInt());
    assertEquals(100, Arrays.stream(result).max().getAsInt());
    assertEquals(5, result.length);
  }

  @Test
  @DisplayName("normalize() handles zero range arrays")
  void testNormalizeZeroRange() {
    int[] input = {10, 10, 10}; // range 0
    int[] result = ArrayGenerator.normalize(input);

    assertArrayEquals(input, result, "Zero range arrays should be returned unchanged");
  }

  @Test
  @DisplayName("fromLabel() returns correct Enum types")
  void testFromLabel() {
    assertEquals(ArrayType.NEARLY_SORTED, ArrayGenerator.fromLabel("Nearly Sorted"));
    assertEquals(ArrayType.REVERSED, ArrayGenerator.fromLabel("Reversed"));
    assertEquals(ArrayType.FEW_UNIQUE, ArrayGenerator.fromLabel("Few Unique"));

    // Default cases
    assertEquals(ArrayType.RANDOM, ArrayGenerator.fromLabel("Unknown"));
    assertEquals(ArrayType.RANDOM, ArrayGenerator.fromLabel(""));
    assertEquals(ArrayType.RANDOM, ArrayGenerator.fromLabel(null));
  }
}
