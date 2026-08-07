import { TreeNodeDto, TreeSimulationFrame, TreeSimulationRequest, TreeSimulationResponse } from '../models/types';

// BST Node
interface BSTNode {
  val: number;
  left?: BSTNode | null;
  right?: BSTNode | null;
}

// AVL Node
interface AVLNode {
  val: number;
  height: number;
  left?: AVLNode | null;
  right?: AVLNode | null;
}

// Red Black Node
interface RBNode {
  val: number;
  color: 'RED' | 'BLACK';
  left?: RBNode | null;
  right?: RBNode | null;
}

// Depth & Height helpers
function getBSTHeight(n: BSTNode | null | undefined): number {
  if (!n) return 0;
  return 1 + Math.max(getBSTHeight(n.left), getBSTHeight(n.right));
}

function bstToDto(n: BSTNode | null | undefined): TreeNodeDto | null {
  if (!n) return null;
  const lH = getBSTHeight(n.left);
  const rH = getBSTHeight(n.right);
  return {
    val: n.val,
    height: 1 + Math.max(lH, rH),
    balanceFactor: lH - rH,
    color: 'BLACK',
    left: bstToDto(n.left),
    right: bstToDto(n.right),
  };
}

function getAVLHeight(n: AVLNode | null | undefined): number {
  return n ? n.height : 0;
}

function getAVLBalance(n: AVLNode | null | undefined): number {
  return n ? getAVLHeight(n.left) - getAVLHeight(n.right) : 0;
}

function avlToDto(n: AVLNode | null | undefined): TreeNodeDto | null {
  if (!n) return null;
  const lH = getAVLHeight(n.left);
  const rH = getAVLHeight(n.right);
  return {
    val: n.val,
    height: n.height,
    balanceFactor: lH - rH,
    color: 'BLACK',
    left: avlToDto(n.left),
    right: avlToDto(n.right),
  };
}

function getRBHeight(n: RBNode | null | undefined): number {
  if (!n) return 0;
  return 1 + Math.max(getRBHeight(n.left), getRBHeight(n.right));
}

function rbToDto(n: RBNode | null | undefined): TreeNodeDto | null {
  if (!n) return null;
  const lH = getRBHeight(n.left);
  const rH = getRBHeight(n.right);
  return {
    val: n.val,
    height: 1 + Math.max(lH, rH),
    balanceFactor: lH - rH,
    color: n.color,
    left: rbToDto(n.left),
    right: rbToDto(n.right),
  };
}

// AVL Rotations
function rotateRightAVL(y: AVLNode): AVLNode {
  const x = y.left!;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  y.height = Math.max(getAVLHeight(y.left), getAVLHeight(y.right)) + 1;
  x.height = Math.max(getAVLHeight(x.left), getAVLHeight(x.right)) + 1;
  return x;
}

function rotateLeftAVL(x: AVLNode): AVLNode {
  const y = x.right!;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  x.height = Math.max(getAVLHeight(x.left), getAVLHeight(x.right)) + 1;
  y.height = Math.max(getAVLHeight(y.left), getAVLHeight(y.right)) + 1;
  return y;
}

// Generic search helper for offline fallback
function searchTreeNodes<T extends { val: number; left?: T | null; right?: T | null }>(
  root: T | null,
  target: number,
  toDto: (n: any) => TreeNodeDto | null,
  treeName: string,
  frames: TreeSimulationFrame[]
) {
  let curr = root;
  const path: number[] = [];
  let found = false;
  while (curr) {
    path.push(curr.val);
    if (curr.val === target) {
      found = true;
      frames.push({
        frameIndex: frames.length,
        root: toDto(root),
        activeNodeVal: curr.val,
        highlightNodes: [...path],
        explanation: `Target ${target} found in ${treeName}!`,
        eventType: 'SEARCH_FOUND',
      });
      break;
    }
    frames.push({
      frameIndex: frames.length,
      root: toDto(root),
      activeNodeVal: curr.val,
      highlightNodes: [...path],
      explanation: `Searching for ${target}: visited node ${curr.val}.`,
      eventType: 'SEARCH_VISIT',
    });
    curr = target < curr.val ? (curr.left || null) : (curr.right || null);
  }
  if (!found) {
    frames.push({
      frameIndex: frames.length,
      root: toDto(root),
      highlightNodes: [...path],
      explanation: `Target ${target} not found in ${treeName}.`,
      eventType: 'SEARCH_NOT_FOUND',
    });
  }
}

// Generic traversal helper for offline fallback
function traverseTreeNodes<T extends { val: number; left?: T | null; right?: T | null }>(
  root: T | null,
  type: string,
  toDto: (n: any) => TreeNodeDto | null,
  treeName: string,
  frames: TreeSimulationFrame[],
  output: number[]
) {
  const visited: number[] = [];

  const addFrame = (nodeVal: number) => {
    visited.push(nodeVal);
    output.push(nodeVal);
    frames.push({
      frameIndex: frames.length,
      root: toDto(root),
      activeNodeVal: nodeVal,
      highlightNodes: [...visited],
      explanation: `${type.toUpperCase()} traversal visited node ${nodeVal} in ${treeName}.`,
      eventType: 'TRAVERSAL_VISIT',
    });
  };

  if (type === 'in') {
    const inOrder = (n: T | null | undefined) => {
      if (!n) return;
      inOrder(n.left);
      addFrame(n.val);
      inOrder(n.right);
    };
    inOrder(root);
  } else if (type === 'pre') {
    const preOrder = (n: T | null | undefined) => {
      if (!n) return;
      addFrame(n.val);
      preOrder(n.left);
      preOrder(n.right);
    };
    preOrder(root);
  } else if (type === 'post') {
    const postOrder = (n: T | null | undefined) => {
      if (!n) return;
      postOrder(n.left);
      postOrder(n.right);
      addFrame(n.val);
    };
    postOrder(root);
  } else {
    // Level order
    if (!root) return;
    const queue: T[] = [root];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      addFrame(curr.val);
      if (curr.left) queue.push(curr.left);
      if (curr.right) queue.push(curr.right);
    }
  }
}

// Main fallback simulator supporting ALL operations across ALL 3 tree types
export function generateClientTreeSimulation(req: TreeSimulationRequest): TreeSimulationResponse {
  const treeType = req.treeType || 'bst';
  const op = req.operation || 'build';
  const rawValues = req.values !== undefined ? req.values : [50, 30, 70, 20, 40, 60, 80];

  // If operation is insert and rawValues ends with target, strip target for base tree build
  let initialValues = rawValues;
  if (op === 'insert' && req.target !== undefined && rawValues.length > 0 && rawValues[rawValues.length - 1] === req.target) {
    initialValues = rawValues.slice(0, rawValues.length - 1);
  }

  const frames: TreeSimulationFrame[] = [];
  const traversalOutput: number[] = [];

  if (treeType === 'avl') {
    let root: AVLNode | null = null;
    frames.push({
      frameIndex: 0,
      root: null,
      explanation: 'Initialized empty AVL Tree.',
      eventType: 'INIT',
    });

    const insertAVL = (node: AVLNode | null, val: number): AVLNode => {
      if (!node) {
        return { val, height: 1 };
      }
      if (val < node.val) {
        node.left = insertAVL(node.left || null, val);
      } else if (val > node.val) {
        node.right = insertAVL(node.right || null, val);
      } else {
        frames.push({
          frameIndex: frames.length,
          root: avlToDto(root),
          activeNodeVal: val,
          highlightNodes: [val],
          explanation: `Value ${val} already exists in AVL Tree. Duplicate ignored.`,
          eventType: 'DUPLICATE_SKIPPED',
        });
        return node;
      }

      node.height = 1 + Math.max(getAVLHeight(node.left), getAVLHeight(node.right));
      const balance = getAVLBalance(node);

      if (balance > 1 && val < (node.left?.val || 0)) {
        frames.push({
          frameIndex: frames.length,
          root: avlToDto(root),
          activeNodeVal: node.val,
          explanation: `Unbalanced node ${node.val} (BF=${balance}). Executing LL (Right) Rotation.`,
          eventType: 'ROTATION_LL',
          rotationType: 'LL',
        });
        return rotateRightAVL(node);
      }
      if (balance < -1 && val > (node.right?.val || 0)) {
        frames.push({
          frameIndex: frames.length,
          root: avlToDto(root),
          activeNodeVal: node.val,
          explanation: `Unbalanced node ${node.val} (BF=${balance}). Executing RR (Left) Rotation.`,
          eventType: 'ROTATION_RR',
          rotationType: 'RR',
        });
        return rotateLeftAVL(node);
      }
      if (balance > 1 && val > (node.left?.val || 0)) {
        frames.push({
          frameIndex: frames.length,
          root: avlToDto(root),
          activeNodeVal: node.val,
          explanation: `Unbalanced node ${node.val} (BF=${balance}). Executing LR Rotation.`,
          eventType: 'ROTATION_LR',
          rotationType: 'LR',
        });
        node.left = rotateLeftAVL(node.left!);
        return rotateRightAVL(node);
      }
      if (balance < -1 && val < (node.right?.val || 0)) {
        frames.push({
          frameIndex: frames.length,
          root: avlToDto(root),
          activeNodeVal: node.val,
          explanation: `Unbalanced node ${node.val} (BF=${balance}). Executing RL Rotation.`,
          eventType: 'ROTATION_RL',
          rotationType: 'RL',
        });
        node.right = rotateRightAVL(node.right!);
        return rotateLeftAVL(node);
      }

      return node;
    };

    initialValues.forEach((v) => {
      root = insertAVL(root, v);
      frames.push({
        frameIndex: frames.length,
        root: avlToDto(root),
        activeNodeVal: v,
        explanation: `Inserted ${v} into AVL Tree.`,
        eventType: 'INSERT',
      });
    });

    if (op === 'insert' && req.target !== undefined) {
      root = insertAVL(root, req.target);
      frames.push({
        frameIndex: frames.length,
        root: avlToDto(root),
        activeNodeVal: req.target,
        explanation: `Inserted node ${req.target} into AVL Tree.`,
        eventType: 'INSERT_DONE',
      });
    } else if (op === 'search' && req.target !== undefined) {
      searchTreeNodes(root, req.target, avlToDto, 'AVL Tree', frames);
    } else if (op === 'traversal') {
      traverseTreeNodes(root, req.traversalType || 'in', avlToDto, 'AVL Tree', frames, traversalOutput);
    }
  } else if (treeType === 'red_black') {
    let root: RBNode | null = null;

    const isRed = (n: RBNode | null | undefined) => !!n && n.color === 'RED';

    const rotateLeftRB = (h: RBNode): RBNode => {
      const x = h.right!;
      h.right = x.left;
      x.left = h;
      x.color = h.color;
      h.color = 'RED';
      return x;
    };

    const rotateRightRB = (h: RBNode): RBNode => {
      const x = h.left!;
      h.left = x.right;
      x.right = h;
      x.color = h.color;
      h.color = 'RED';
      return x;
    };

    const flipColorsRB = (h: RBNode) => {
      h.color = 'RED';
      if (h.left) h.left.color = 'BLACK';
      if (h.right) h.right.color = 'BLACK';
    };

    const insertRB = (h: RBNode | null, val: number): RBNode => {
      if (!h) return { val, color: 'RED' };
      if (val < h.val) h.left = insertRB(h.left || null, val);
      else if (val > h.val) h.right = insertRB(h.right || null, val);
      else return h;

      if (isRed(h.right) && !isRed(h.left)) h = rotateLeftRB(h);
      if (isRed(h.left) && isRed(h.left?.left)) h = rotateRightRB(h);
      if (isRed(h.left) && isRed(h.right)) flipColorsRB(h);

      return h;
    };

    initialValues.forEach((v) => {
      root = insertRB(root, v);
      if (root) root.color = 'BLACK';
      frames.push({
        frameIndex: frames.length,
        root: rbToDto(root),
        activeNodeVal: v,
        explanation: `Inserted ${v} into Red-Black Tree. Enforced root-black.`,
        eventType: 'INSERT',
      });
    });

    if (op === 'insert' && req.target !== undefined) {
      root = insertRB(root, req.target);
      if (root) root.color = 'BLACK';
      frames.push({
        frameIndex: frames.length,
        root: rbToDto(root),
        activeNodeVal: req.target,
        explanation: `Inserted ${req.target} into Red-Black Tree. Enforced root-black.`,
        eventType: 'INSERT_DONE',
      });
    } else if (op === 'search' && req.target !== undefined) {
      searchTreeNodes(root, req.target, rbToDto, 'Red-Black Tree', frames);
    } else if (op === 'traversal') {
      traverseTreeNodes(root, req.traversalType || 'in', rbToDto, 'Red-Black Tree', frames, traversalOutput);
    }
  } else {
    // BST
    let root: BSTNode | null = null;
    const insertBST = (n: BSTNode | null, val: number): BSTNode => {
      if (!n) return { val };
      if (val < n.val) n.left = insertBST(n.left || null, val);
      else if (val > n.val) n.right = insertBST(n.right || null, val);
      return n;
    };

    initialValues.forEach((v) => {
      root = insertBST(root, v);
      frames.push({
        frameIndex: frames.length,
        root: bstToDto(root),
        activeNodeVal: v,
        explanation: `Inserted ${v} into Binary Search Tree.`,
        eventType: 'INSERT',
      });
    });

    if (op === 'insert' && req.target !== undefined) {
      root = insertBST(root, req.target);
      frames.push({
        frameIndex: frames.length,
        root: bstToDto(root),
        activeNodeVal: req.target,
        explanation: `Inserted ${req.target} into Binary Search Tree.`,
        eventType: 'INSERT_DONE',
      });
    } else if (op === 'search' && req.target !== undefined) {
      searchTreeNodes(root, req.target, bstToDto, 'Binary Search Tree', frames);
    } else if (op === 'traversal') {
      traverseTreeNodes(root, req.traversalType || 'in', bstToDto, 'Binary Search Tree', frames, traversalOutput);
    }
  }

  return { treeType, frames, traversalOutput };
}
