package algorithms.searching;

import model.AlgorithmModel;

public abstract class SearchModel extends AlgorithmModel {
    protected int   target;
    protected int   foundIndex = -1;
    protected int[] searchPath = {};

    public SearchModel(String name, String complexity) {
        super(name, complexity);
    }

    public void  setTarget(int target)    { this.target = target; }
    public int   getFoundIndex()          { return foundIndex; }
    public int[] getSearchPath()          { return searchPath; }

    @Override public abstract void step();
    @Override public abstract void resetState(int[] newArray);
}
