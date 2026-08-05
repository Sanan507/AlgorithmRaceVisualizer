package com.algorithmrace.visualizer.algorithms.trees;

import com.algorithmrace.visualizer.dto.TreeNodeDto;
import com.algorithmrace.visualizer.dto.TreeSimulationFrame;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

public class AVLTreeModel {

    public static class Node {
        public int val;
        public int height = 1;
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

    private int height(Node n) {
        return n == null ? 0 : n.height;
    }

    private int getBalance(Node n) {
        return n == null ? 0 : height(n.left) - height(n.right);
    }

    public static TreeNodeDto toDto(Node n) {
        if (n == null) return null;
        int lH = n.left != null ? n.left.height : 0;
        int rH = n.right != null ? n.right.height : 0;
        int bf = lH - rH;
        return new TreeNodeDto(
            n.val,
            n.height,
            bf,
            "BLACK",
            toDto(n.left),
            toDto(n.right)
        );
    }

    private Node rotateRight(Node y) {
        Node x = y.left;
        Node T2 = x.right;
        x.right = y;
        y.left = T2;
        y.height = Math.max(height(y.left), height(y.right)) + 1;
        x.height = Math.max(height(x.left), height(x.right)) + 1;
        return x;
    }

    private Node rotateLeft(Node x) {
        Node y = x.right;
        Node T2 = y.left;
        y.left = x;
        x.right = T2;
        x.height = Math.max(height(x.left), height(x.right)) + 1;
        y.height = Math.max(height(y.left), height(y.right)) + 1;
        return y;
    }

    public List<TreeSimulationFrame> buildTree(List<Integer> values) {
        List<TreeSimulationFrame> frames = new ArrayList<>();
        root = null;
        frames.add(new TreeSimulationFrame(
            frames.size(),
            toDto(root),
            null,
            List.of(),
            "Initialized empty AVL Tree.",
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
        
        boolean[] duplicateFound = new boolean[]{false};
        root = insertRecursive(root, val, frames, duplicateFound);

        if (!duplicateFound[0]) {
            frames.add(new TreeSimulationFrame(
                frames.size(),
                toDto(root),
                val,
                List.of(val),
                "AVL Tree balanced after inserting node " + val + ".",
                "INSERT_DONE",
                null,
                2
            ));
        }

        return frames;
    }

    private Node insertRecursive(Node node, int val, List<TreeSimulationFrame> frames, boolean[] duplicateFound) {
        if (node == null) {
            Node newNode = new Node(val);
            frames.add(new TreeSimulationFrame(
                frames.size(),
                toDto(root == null ? newNode : root),
                val,
                List.of(val),
                "Inserted node " + val + " into AVL Tree.",
                "INSERT",
                null,
                3
            ));
            return newNode;
        }

        if (val < node.val) {
            node.left = insertRecursive(node.left, val, frames, duplicateFound);
        } else if (val > node.val) {
            node.right = insertRecursive(node.right, val, frames, duplicateFound);
        } else {
            duplicateFound[0] = true;
            frames.add(new TreeSimulationFrame(
                frames.size(),
                toDto(root),
                val,
                List.of(val),
                "Value " + val + " already exists in AVL Tree. Duplicate ignored.",
                "DUPLICATE_SKIPPED",
                null,
                4
            ));
            return node;
        }

        node.height = 1 + Math.max(height(node.left), height(node.right));
        int balance = getBalance(node);

        // Left Left Case (LL Rotation)
        if (balance > 1 && val < node.left.val) {
            frames.add(new TreeSimulationFrame(
                frames.size(),
                toDto(root),
                node.val,
                List.of(node.val, node.left.val),
                "Unbalanced node " + node.val + " (BF=" + balance + "). Executing LL (Right) Rotation.",
                "ROTATION_LL",
                "LL",
                5
            ));
            return rotateRight(node);
        }

        // Right Right Case (RR Rotation)
        if (balance < -1 && val > node.right.val) {
            frames.add(new TreeSimulationFrame(
                frames.size(),
                toDto(root),
                node.val,
                List.of(node.val, node.right.val),
                "Unbalanced node " + node.val + " (BF=" + balance + "). Executing RR (Left) Rotation.",
                "ROTATION_RR",
                "RR",
                6
            ));
            return rotateLeft(node);
        }

        // Left Right Case (LR Rotation)
        if (balance > 1 && val > node.left.val) {
            frames.add(new TreeSimulationFrame(
                frames.size(),
                toDto(root),
                node.val,
                List.of(node.val, node.left.val),
                "Unbalanced node " + node.val + " (BF=" + balance + "). Executing LR Rotation (Left-Rotate child " + node.left.val + ", then Right-Rotate " + node.val + ").",
                "ROTATION_LR",
                "LR",
                7
            ));
            node.left = rotateLeft(node.left);
            return rotateRight(node);
        }

        // Right Left Case (RL Rotation)
        if (balance < -1 && val < node.right.val) {
            frames.add(new TreeSimulationFrame(
                frames.size(),
                toDto(root),
                node.val,
                List.of(node.val, node.right.val),
                "Unbalanced node " + node.val + " (BF=" + balance + "). Executing RL Rotation (Right-Rotate child " + node.right.val + ", then Left-Rotate " + node.val + ").",
                "ROTATION_RL",
                "RL",
                8
            ));
            node.right = rotateRight(node.right);
            return rotateLeft(node);
        }

        return node;
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
                    "Target " + val + " found in AVL Tree!",
                    "SEARCH_FOUND",
                    null,
                    9
                ));
                return frames;
            }

            frames.add(new TreeSimulationFrame(
                frames.size(),
                toDto(root),
                curr.val,
                new ArrayList<>(path),
                "Searching for " + val + ": visited node " + curr.val + " (BF=" + getBalance(curr) + ").",
                "SEARCH_VISIT",
                null,
                10
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
            "Target " + val + " not found in AVL Tree.",
            "SEARCH_NOT_FOUND",
            null,
            11
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
            "In-Order traversal visited node " + n.val + " (BF=" + getBalance(n) + ").",
            "TRAVERSAL_VISIT",
            null,
            12
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
            "Pre-Order traversal visited node " + n.val + " (BF=" + getBalance(n) + ").",
            "TRAVERSAL_VISIT",
            null,
            13
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
            "Post-Order traversal visited node " + n.val + " (BF=" + getBalance(n) + ").",
            "TRAVERSAL_VISIT",
            null,
            14
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
                "Level-Order traversal visited node " + curr.val + " (BF=" + getBalance(curr) + ").",
                "TRAVERSAL_VISIT",
                null,
                15
            ));
            if (curr.left != null) queue.add(curr.left);
            if (curr.right != null) queue.add(curr.right);
        }
    }
}
