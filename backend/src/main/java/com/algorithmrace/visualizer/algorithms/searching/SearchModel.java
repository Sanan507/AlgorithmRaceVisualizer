package com.algorithmrace.visualizer.algorithms.searching;

import com.algorithmrace.visualizer.model.AlgorithmModel;

public abstract class SearchModel extends AlgorithmModel {
    protected int target;
    protected int foundIndex = -1;
    protected int[] searchPath = new int[0];

    protected SearchModel(String name, String complexity) {
        super(name, complexity);
    }

    public void setTarget(int target) {
        this.target = target;
    }

    public int getFoundIndex() {
        return foundIndex;
    }

    public int[] getSearchPath() {
        return searchPath;
    }
}
