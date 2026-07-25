package com.algorithmrace.visualizer.algorithms.sorting;

import com.algorithmrace.visualizer.model.AlgorithmModel;

public class CocktailSortModel extends AlgorithmModel {

	private int start;
	private int end;
	private int index;
	private boolean forward;
	private boolean swappedInPass;

	public CocktailSortModel() {super("Cocktail Sort", "O(n^2)");}

	@Override
	public void step() {
		if (isDone()) return;

		if (forward) {
			if (index < end) {
				compare(index, index + 1);

				if (array[index] > array[index + 1]) {
					swap(index, index + 1);
					swappedInPass = true;
				}

				index++;
			} else {
				if (!swappedInPass) {
					markDone();
					return;
				}

				swappedInPass = false;
				end--;
				forward = false;
				index = end - 1;
			}
		} else {
			if (index >= start) {
				compare(index, index + 1);

				if (array[index] > array[index + 1]) {
					swap(index, index + 1);
					swappedInPass = true;
				}

				index--;
			} else {
				start++;

				if (!swappedInPass || start >= end) {
					markDone();
					return;
				}

				swappedInPass = false;
				forward = true;
				index = start;
			}
		}
	}

	@Override
	public void resetState(int[] newArray) {
		setArray(newArray);
		resetStats();

		start = 0;
		end = array.length - 1;
		index = 0;
		forward = true;
		swappedInPass = false;
	}
}
