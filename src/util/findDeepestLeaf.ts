import { TreeNodeData } from "../data/TreeNodeData";

type DeepestResult = { leaf: TreeNodeData; depth: number };

const findDeepest = (current: TreeNodeData, depth: number): DeepestResult => {
  const currentChildren = current.getChildren();
  if (currentChildren.length === 0) {
    return { leaf: current, depth };
  }

  let result: DeepestResult = { leaf: current, depth };
  for (const child of currentChildren) {
    const found = findDeepest(child, depth + 1);
    if (found.depth > result.depth) {
      result = found;
    }
  }

  return result;
};

export const findDeepestLeaf = (node: TreeNodeData): TreeNodeData => {
  const result = findDeepest(node, 0);
  return result.leaf;
};