package algorithms.searching;

public class SearchingAlgorithmFactory {

    public static SearchModel create(String name) {
        switch (name) {
            case "Linear Search": return new LinearSearchModel();
            case "Binary Search": return new BinarySearchModel();
            case "Jump Search":   return new JumpSearchModel();
            default: throw new IllegalArgumentException("Unknown: " + name);
        }
    }

    public static String[] allNames() {
        return new String[]{"Linear Search", "Binary Search", "Jump Search"};
    }
}
