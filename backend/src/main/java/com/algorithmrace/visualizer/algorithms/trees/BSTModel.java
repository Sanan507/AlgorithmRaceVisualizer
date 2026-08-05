package com.algorithmrace.visualizer.algorithms.trees;

import com.algorithmrace.visualizer.dto.TreeNodeDto;
import com.algorithmrace.visualizer.dto.TreeSimulationFrame;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

public class BSTModel {

    public static class Node {
        public int val;
        public Node left;
        public Node right;

        public Node(int val) {
            this.val = val;
        }
    }

    private Node root;

    public Node getRoot() {
        return root;
    }

    public void setRoot(Node root) {
        this.root = root;
    }

    public static int getHeight(Node n) {
        if (n == null) return 0;
        return 1 + Math.max(getHeight(n.left), getHeight(n.right));
    }

    public static TreeNodeDto toDto(Node n) {
        if (n == null) return null;
        int lH = getHeight(n.left);
        int rH = getHeight(n.right);
        int h = 1 + Math.max(lH, rH);
        int bf = lH - rH;
        return new TreeNodeDto(
            n.val,
            h,
            bf,
            "BLACK",
            toDto(n.left),
            toDto(n.right)
        );
    }

    public List<TreeSimulationFrame> buildTree(List<Integer> values) {
        List<TreeSimulationFrame> frames = new ArrayList<>();
        root = null;
        frames.add(new TreeSimulationFrame(
            frames.size(),
            toDto(root),
            null,
            List.of(),
            "Initialized empty Binary Search Tree.",
            "INIT",
            null,
            1
        ));

        if (values != null) {
            for (Integer val : values) {
                if (val != null) {
                    insertWithFrames(val, frames);
                }
            }
        }
        return frames;
    }

    public List<TreeSimulationFrame> insertWithFrames(int val, List<TreeSimulationFrame> frames) {
        if (frames == null) frames = new ArrayList<>();
        
        if (root == null) {
            root = new Node(val);
            frames.add(new TreeSimulationFrame(
                frames.size(),
                toDto(root),
                val,
                List.of(val),
                "Inserted root node " + val + ".",
                "INSERT",
                null,
                2
            ));
            return frames;
        }

        Node curr = root;
        List<Integer> path = new ArrayList<>();
        while (curr != null) {
            path.add(curr.val);
            if (val == curr.val) {
                frames.add(new TreeSimulationFrame(
                    frames.size(),
                    toDto(root),
                    val,
                    new ArrayList<>(path),
                    "Value " + val + " already exists in BST. Duplicate ignored.",
                    "DUPLICATE_SKIPPED",
                    null,
                    3
                ));
                return frames;
            } else if (val < curr.val) {
                if (curr.left == null) {
                    curr.left = new Node(val);
                    path.add(val);
                    frames.add(new TreeSimulationFrame(
                        frames.size(),
                        toDto(root),
                        val,
                        new ArrayList<>(path),
                        "Inserted node " + val + " to the left of " + curr.val + ".",
                        "INSERT",
                        null,
                        4
                    ));
                    break;
                }
                curr = curr.left;
            } else {
                if (curr.right == null) {
                    curr.right = new Node(val);
                    path.add(val);
                    frames.add(new TreeSimulationFrame(
                        frames.size(),
                        toDto(root),
                        val,
                        new ArrayList<>(path),
                        "Inserted node " + val + " to the right of " + curr.val + ".",
                        "INSERT",
                        null,
                        5
                    ));
                    break;
                }
                curr = curr.right;
            }
        }
        return frames;
    }

    public List<TreeSimulationFrame> searchWithFrames(int val) {
        List<TreeSimulationFrame> frames = new ArrayList<>();
        List<Integer> path = new ArrayList<>();
        Node curr = root;

        while (curr != null) {
            path.add(curr.val);
            if (curr.val == val) {
                frames.add(new TreeSimulationFrame(
                    frames.size(),
                    toDto(root),
                    curr.val,
                    new ArrayList<>(path),
                    "Target " + val + " found in BST!",
                    "SEARCH_FOUND",
                    null,
                    6
                ));
                return frames;
            }

            frames.add(new TreeSimulationFrame(
                frames.size(),
                toDto(root),
                curr.val,
                new ArrayList<>(path),
                "Searching for " + val + ": visited node " + curr.val + ".",
                "SEARCH_VISIT",
                null,
                7
            ));

            if (val < curr.val) {
                curr = curr.left;
            } else {
                curr = curr.right;
            }
        }

        frames.add(new TreeSimulationFrame(
            frames.size(),
            toDto(root),
            null,
            new ArrayList<>(path),
            "Target " + val + " not found in BST.",
            "SEARCH_NOT_FOUND",
            null,
            8
        ));
        return frames;
    }

    public List<TreeSimulationFrame> traverseWithFrames(String type, List<Integer> output) {
        List<TreeSimulationFrame> frames = new ArrayList<>();
        if (output == null) output = new ArrayList<>();
        List<Integer> visited = new ArrayList<>();

        if ("in".equalsIgnoreCase(type)) {
            inOrder(root, visited, output, frames);
        } else if ("pre".equalsIgnoreCase(type)) {
            preOrder(root, visited, output, frames);
        } else if ("post".equalsIgnoreCase(type)) {
            postOrder(root, visited, output, frames);
        } else {
            // Level order
            levelOrder(root, visited, output, frames);
        }
        return frames;
    }

    private void inOrder(Node n, List<Integer> visited, List<Integer> output, List<TreeSimulationFrame> frames) {
        if (n == null) return;
        inOrder(n.left, visited, output, frames);
        visited.add(n.val);
        output.add(n.val);
        frames.add(new TreeSimulationFrame(
            frames.size(),
            toDto(root),
            n.val,
            new ArrayList<>(visited),
            "In-Order traversal visited node " + n.val + ". Visited: " + visited,
            "TRAVERSAL_VISIT",
            null,
            9
        ));
        inOrder(n.right, visited, output, frames);
    }

    private void preOrder(Node n, List<Integer> visited, List<Integer> output, List<TreeSimulationFrame> frames) {
        if (n == null) return;
        visited.add(n.val);
        output.add(n.val);
        frames.add(new TreeSimulationFrame(
            frames.size(),
            toDto(root),
            n.val,
            new ArrayList<>(visited),
            "Pre-Order traversal visited node " + n.val + ". Visited: " + visited,
            "TRAVERSAL_VISIT",
            null,
            10
        ));
        preOrder(n.left, visited, output, frames);
        preOrder(n.right, visited, output, frames);
    }

    private void postOrder(Node n, List<Integer> visited, List<Integer> output, List<TreeSimulationFrame> frames) {
        if (n == null) return;
        postOrder(n.left, visited, output, frames);
        postOrder(n.right, visited, output, frames);
        visited.add(n.val);
        output.add(n.val);
        frames.add(new TreeSimulationFrame(
            frames.size(),
            toDto(root),
            n.val,
            new ArrayList<>(visited),
            "Post-Order traversal visited node " + n.val + ". Visited: " + visited,
            "TRAVERSAL_VISIT",
            null,
            11
        ));
    }

    private void levelOrder(Node n, List<Integer> visited, List<Integer> output, List<TreeSimulationFrame> frames) {
        if (n == null) return;
        Queue<Node> queue = new LinkedList<>();
        queue.add(n);
        while (!queue.isEmpty()) {
            Node curr = queue.poll();
            visited.add(curr.val);
            output.add(curr.val);
            frames.add(new TreeSimulationFrame(
                frames.size(),
                toDto(root),
                curr.val,
                new ArrayList<>(visited),
                "Level-Order traversal visited node " + curr.val + ". Visited: " + visited,
                "TRAVERSAL_VISIT",
                null,
                12
            ));
            if (curr.left != null) queue.add(curr.left);
            if (curr.right != null) queue.add(curr.right);
        }
    }
}
