package com.algorithmrace.visualizer.algorithms.trees;

import com.algorithmrace.visualizer.dto.TreeNodeDto;
import com.algorithmrace.visualizer.dto.TreeSimulationFrame;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

public class RedBlackTreeModel {

  public static final boolean RED = true;
  public static final boolean BLACK = false;

  public static class Node {
    public int val;
    public boolean color = RED;
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

  public static boolean isRed(Node x) {
    if (x == null) return false;
    return x.color == RED;
  }

  public static int getTreeHeight(Node n) {
    if (n == null) return 0;
    return 1 + Math.max(getTreeHeight(n.left), getTreeHeight(n.right));
  }

  public static TreeNodeDto toDto(Node n) {
    if (n == null) return null;
    int lH = getTreeHeight(n.left);
    int rH = getTreeHeight(n.right);
    int h = 1 + Math.max(lH, rH);
    int bf = lH - rH;
    return new TreeNodeDto(
        n.val, h, bf, n.color == RED ? "RED" : "BLACK", toDto(n.left), toDto(n.right));
  }

  private Node rotateLeft(Node h, List<TreeSimulationFrame> frames) {
    Node x = h.right;
    h.right = x.left;
    x.left = h;
    x.color = h.color;
    h.color = RED;
    if (frames != null) {
      frames.add(
          new TreeSimulationFrame(
              frames.size(),
              toDto(root),
              x.val,
              List.of(h.val, x.val),
              "Left rotation around node " + h.val + " (fixing right-leaning red link).",
              "ROTATION_LEFT",
              "LEFT",
              1));
    }
    return x;
  }

  private Node rotateRight(Node h, List<TreeSimulationFrame> frames) {
    Node x = h.left;
    h.left = x.right;
    x.right = h;
    x.color = h.color;
    h.color = RED;
    if (frames != null) {
      frames.add(
          new TreeSimulationFrame(
              frames.size(),
              toDto(root),
              x.val,
              List.of(h.val, x.val),
              "Right rotation around node " + h.val + " (fixing double left-leaning red links).",
              "ROTATION_RIGHT",
              "RIGHT",
              2));
    }
    return x;
  }

  private void flipColors(Node h, List<TreeSimulationFrame> frames) {
    h.color = RED;
    if (h.left != null) h.left.color = BLACK;
    if (h.right != null) h.right.color = BLACK;
    if (frames != null) {
      frames.add(
          new TreeSimulationFrame(
              frames.size(),
              toDto(root),
              h.val,
              List.of(h.val),
              "Flipped colors for node " + h.val + ": children set to BLACK, node set to RED.",
              "RECOLOR",
              null,
              3));
    }
  }

  public List<TreeSimulationFrame> buildTree(List<Integer> values) {
    List<TreeSimulationFrame> frames = new ArrayList<>();
    root = null;
    frames.add(
        new TreeSimulationFrame(
            frames.size(),
            toDto(root),
            null,
            List.of(),
            "Initialized empty Red-Black Tree.",
            "INIT",
            null,
            4));

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
    boolean[] duplicateFound = new boolean[] {false};

    root = insertRecursive(root, val, frames, duplicateFound);

    // Root invariant: Root must always be BLACK
    if (root != null && root.color == RED) {
      root.color = BLACK;
      frames.add(
          new TreeSimulationFrame(
              frames.size(),
              toDto(root),
              root.val,
              List.of(root.val),
              "Enforced Root-Black invariant: root " + root.val + " set to BLACK.",
              "RECOLOR",
              null,
              5));
    }

    if (!duplicateFound[0]) {
      frames.add(
          new TreeSimulationFrame(
              frames.size(),
              toDto(root),
              val,
              List.of(val),
              "Red-Black Tree invariants satisfied after inserting " + val + ".",
              "INSERT_DONE",
              null,
              6));
    }

    return frames;
  }

  private Node insertRecursive(
      Node h, int val, List<TreeSimulationFrame> frames, boolean[] duplicateFound) {
    if (h == null) {
      Node newNode = new Node(val);
      frames.add(
          new TreeSimulationFrame(
              frames.size(),
              toDto(root == null ? newNode : root),
              val,
              List.of(val),
              "Inserted node " + val + " as RED.",
              "INSERT",
              null,
              7));
      return newNode;
    }

    if (val < h.val) {
      h.left = insertRecursive(h.left, val, frames, duplicateFound);
    } else if (val > h.val) {
      h.right = insertRecursive(h.right, val, frames, duplicateFound);
    } else {
      duplicateFound[0] = true;
      frames.add(
          new TreeSimulationFrame(
              frames.size(),
              toDto(root),
              val,
              List.of(val),
              "Value " + val + " already exists in Red-Black Tree. Duplicate ignored.",
              "DUPLICATE_SKIPPED",
              null,
              8));
      return h;
    }

    // LLRB Balancing steps
    if (isRed(h.right) && !isRed(h.left)) {
      h = rotateLeft(h, frames);
    }
    if (isRed(h.left) && isRed(h.left.left)) {
      h = rotateRight(h, frames);
    }
    if (isRed(h.left) && isRed(h.right)) {
      flipColors(h, frames);
    }

    return h;
  }

  public List<TreeSimulationFrame> searchWithFrames(int val) {
    List<TreeSimulationFrame> frames = new ArrayList<>();
    List<Integer> path = new ArrayList<>();
    Node curr = root;

    while (curr != null) {
      path.add(curr.val);
      String colorStr = curr.color == RED ? "RED" : "BLACK";
      if (curr.val == val) {
        frames.add(
            new TreeSimulationFrame(
                frames.size(),
                toDto(root),
                curr.val,
                new ArrayList<>(path),
                "Target " + val + " found in Red-Black Tree (" + colorStr + ")!",
                "SEARCH_FOUND",
                null,
                9));
        return frames;
      }

      frames.add(
          new TreeSimulationFrame(
              frames.size(),
              toDto(root),
              curr.val,
              new ArrayList<>(path),
              "Searching for " + val + ": visited node " + curr.val + " (" + colorStr + ").",
              "SEARCH_VISIT",
              null,
              10));

      if (val < curr.val) {
        curr = curr.left;
      } else {
        curr = curr.right;
      }
    }

    frames.add(
        new TreeSimulationFrame(
            frames.size(),
            toDto(root),
            null,
            new ArrayList<>(path),
            "Target " + val + " not found in Red-Black Tree.",
            "SEARCH_NOT_FOUND",
            null,
            11));
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

  private void inOrder(
      Node n, List<Integer> visited, List<Integer> output, List<TreeSimulationFrame> frames) {
    if (n == null) return;
    inOrder(n.left, visited, output, frames);
    visited.add(n.val);
    output.add(n.val);
    String colorStr = n.color == RED ? "RED" : "BLACK";
    frames.add(
        new TreeSimulationFrame(
            frames.size(),
            toDto(root),
            n.val,
            new ArrayList<>(visited),
            "In-Order traversal visited node " + n.val + " (" + colorStr + ").",
            "TRAVERSAL_VISIT",
            null,
            12));
    inOrder(n.right, visited, output, frames);
  }

  private void preOrder(
      Node n, List<Integer> visited, List<Integer> output, List<TreeSimulationFrame> frames) {
    if (n == null) return;
    visited.add(n.val);
    output.add(n.val);
    String colorStr = n.color == RED ? "RED" : "BLACK";
    frames.add(
        new TreeSimulationFrame(
            frames.size(),
            toDto(root),
            n.val,
            new ArrayList<>(visited),
            "Pre-Order traversal visited node " + n.val + " (" + colorStr + ").",
            "TRAVERSAL_VISIT",
            null,
            13));
    preOrder(n.left, visited, output, frames);
    preOrder(n.right, visited, output, frames);
  }

  private void postOrder(
      Node n, List<Integer> visited, List<Integer> output, List<TreeSimulationFrame> frames) {
    if (n == null) return;
    postOrder(n.left, visited, output, frames);
    postOrder(n.right, visited, output, frames);
    visited.add(n.val);
    output.add(n.val);
    String colorStr = n.color == RED ? "RED" : "BLACK";
    frames.add(
        new TreeSimulationFrame(
            frames.size(),
            toDto(root),
            n.val,
            new ArrayList<>(visited),
            "Post-Order traversal visited node " + n.val + " (" + colorStr + ").",
            "TRAVERSAL_VISIT",
            null,
            14));
  }

  private void levelOrder(
      Node n, List<Integer> visited, List<Integer> output, List<TreeSimulationFrame> frames) {
    if (n == null) return;
    Queue<Node> queue = new LinkedList<>();
    queue.add(n);
    while (!queue.isEmpty()) {
      Node curr = queue.poll();
      visited.add(curr.val);
      output.add(curr.val);
      String colorStr = curr.color == RED ? "RED" : "BLACK";
      frames.add(
          new TreeSimulationFrame(
              frames.size(),
              toDto(root),
              curr.val,
              new ArrayList<>(visited),
              "Level-Order traversal visited node " + curr.val + " (" + colorStr + ").",
              "TRAVERSAL_VISIT",
              null,
              15));
      if (curr.left != null) queue.add(curr.left);
      if (curr.right != null) queue.add(curr.right);
    }
  }

  // Helpers to verify Invariants in tests
  public boolean checkRootBlack() {
    if (root == null) return true;
    return root.color == BLACK;
  }

  public boolean checkNoRedRed() {
    return checkNoRedRedRecursive(root);
  }

  private boolean checkNoRedRedRecursive(Node n) {
    if (n == null) return true;
    if (isRed(n)) {
      if (isRed(n.left) || isRed(n.right)) return false;
    }
    return checkNoRedRedRecursive(n.left) && checkNoRedRedRecursive(n.right);
  }

  public boolean checkEqualBlackHeight() {
    if (root == null) return true;
    return getBlackHeight(root) != -1;
  }

  private int getBlackHeight(Node n) {
    if (n == null) return 1; // Null links are black
    int leftBH = getBlackHeight(n.left);
    int rightBH = getBlackHeight(n.right);
    if (leftBH == -1 || rightBH == -1 || leftBH != rightBH) return -1;
    return leftBH + (n.color == BLACK ? 1 : 0);
  }
}
