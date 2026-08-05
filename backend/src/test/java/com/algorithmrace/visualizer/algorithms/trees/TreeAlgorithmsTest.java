package com.algorithmrace.visualizer.algorithms.trees;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.algorithmrace.visualizer.dto.TreeSimulationFrame;
import com.algorithmrace.visualizer.dto.TreeSimulationRequest;
import com.algorithmrace.visualizer.dto.TreeSimulationResponse;
import com.algorithmrace.visualizer.service.SimulationService;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class TreeAlgorithmsTest {

    private final SimulationService simulationService = new SimulationService();

    @Test
    @DisplayName("Verify sorted insertion for BST, AVL, and Red-Black trees")
    void testSortedInsertion() {
        List<Integer> sorted = List.of(10, 20, 30, 40, 50, 60, 70);

        // BST
        BSTModel bst = new BSTModel();
        List<TreeSimulationFrame> bstFrames = bst.buildTree(sorted);
        assertNotNull(bst.getRoot());
        assertEquals(10, bst.getRoot().val); // Unbalanced, root is first element

        // AVL
        AVLTreeModel avl = new AVLTreeModel();
        List<TreeSimulationFrame> avlFrames = avl.buildTree(sorted);
        assertNotNull(avl.getRoot());
        assertEquals(40, avl.getRoot().val); // Balanced, root becomes 40

        // Red-Black
        RedBlackTreeModel rb = new RedBlackTreeModel();
        List<TreeSimulationFrame> rbFrames = rb.buildTree(sorted);
        assertNotNull(rb.getRoot());
        assertTrue(rb.checkRootBlack());
        assertTrue(rb.checkNoRedRed());
        assertTrue(rb.checkEqualBlackHeight());
    }

    @Test
    @DisplayName("Verify duplicate handling across all tree types")
    void testDuplicateHandling() {
        List<Integer> values = List.of(50, 30, 70, 30, 50, 70);

        // BST
        BSTModel bst = new BSTModel();
        List<TreeSimulationFrame> bstFrames = bst.buildTree(values);
        boolean bstDuplicateFrame = bstFrames.stream()
                .anyMatch(f -> "DUPLICATE_SKIPPED".equals(f.eventType()));
        assertTrue(bstDuplicateFrame, "BST should record duplicate skipped frames");

        // AVL
        AVLTreeModel avl = new AVLTreeModel();
        List<TreeSimulationFrame> avlFrames = avl.buildTree(values);
        boolean avlDuplicateFrame = avlFrames.stream()
                .anyMatch(f -> "DUPLICATE_SKIPPED".equals(f.eventType()));
        assertTrue(avlDuplicateFrame, "AVL should record duplicate skipped frames");

        // Red-Black
        RedBlackTreeModel rb = new RedBlackTreeModel();
        List<TreeSimulationFrame> rbFrames = rb.buildTree(values);
        boolean rbDuplicateFrame = rbFrames.stream()
                .anyMatch(f -> "DUPLICATE_SKIPPED".equals(f.eventType()));
        assertTrue(rbDuplicateFrame, "Red-Black should record duplicate skipped frames");
    }

    @Test
    @DisplayName("Verify AVL LL, RR, LR, and RL rotations")
    void testAVLRotations() {
        // LL Rotation (Inserting 30, 20, 10)
        AVLTreeModel llTree = new AVLTreeModel();
        llTree.buildTree(List.of(30, 20, 10));
        assertEquals(20, llTree.getRoot().val, "LL rotation should set root to 20");
        assertEquals(10, llTree.getRoot().left.val);
        assertEquals(30, llTree.getRoot().right.val);

        // RR Rotation (Inserting 10, 20, 30)
        AVLTreeModel rrTree = new AVLTreeModel();
        rrTree.buildTree(List.of(10, 20, 30));
        assertEquals(20, rrTree.getRoot().val, "RR rotation should set root to 20");
        assertEquals(10, rrTree.getRoot().left.val);
        assertEquals(30, rrTree.getRoot().right.val);

        // LR Rotation (Inserting 30, 10, 20)
        AVLTreeModel lrTree = new AVLTreeModel();
        lrTree.buildTree(List.of(30, 10, 20));
        assertEquals(20, lrTree.getRoot().val, "LR rotation should set root to 20");
        assertEquals(10, lrTree.getRoot().left.val);
        assertEquals(30, lrTree.getRoot().right.val);

        // RL Rotation (Inserting 10, 30, 20)
        AVLTreeModel rlTree = new AVLTreeModel();
        rlTree.buildTree(List.of(10, 30, 20));
        assertEquals(20, rlTree.getRoot().val, "RL rotation should set root to 20");
        assertEquals(10, rlTree.getRoot().left.val);
        assertEquals(30, rlTree.getRoot().right.val);
    }

    @Test
    @DisplayName("Verify Red-Black tree invariants (Root-Black, No Red-Red, Equal Black Height)")
    void testRedBlackInvariants() {
        List<Integer> dataset = List.of(45, 12, 67, 3, 24, 55, 89, 1, 8, 20, 30);
        RedBlackTreeModel rb = new RedBlackTreeModel();
        rb.buildTree(dataset);

        assertTrue(rb.checkRootBlack(), "Red-Black root must be black");
        assertTrue(rb.checkNoRedRed(), "Red-Black tree must not contain any red parent with red child");
        assertTrue(rb.checkEqualBlackHeight(), "Red-Black tree must have equal black-height on all paths");
    }

    @Test
    @DisplayName("Verify SimulationService tree simulation API")
    void testSimulationServiceTreeApi() {
        TreeSimulationRequest request = new TreeSimulationRequest(
            "avl",
            "insert",
            List.of(50, 30, 70),
            40,
            null
        );

        TreeSimulationResponse response = simulationService.simulateTree(request);
        assertNotNull(response);
        assertEquals("avl", response.treeType());
        assertFalse(response.frames().isEmpty());
        
        // Traversal request test
        TreeSimulationRequest travReq = new TreeSimulationRequest(
            "bst",
            "traversal",
            List.of(50, 30, 70, 20, 40),
            null,
            "in"
        );
        TreeSimulationResponse travResp = simulationService.simulateTree(travReq);
        assertNotNull(travResp);
        assertEquals(List.of(20, 30, 40, 50, 70), travResp.traversalOutput());
    }
}
