
/**
 * 将列表转换为树结构
 * 优化版，避免重复遍历
 * 
 * @param list 输入列表
 * @returns 树结构数组
 */
export function listToTreeOptimized(list: any[]) {
  // 第一步：创建映射表（仅需一次循环）
  const map = list.reduce((acc, item) => {
    const node = { ...item, children: [] };
    acc.set(item.id, node);
    return acc;
  }, new Map());

  // 递归构建树的核心函数
  const buildTree = (nodeId: number) => {
    const node = map.get(nodeId);
    if (!node) return;

    // 查找所有以当前节点为父级的子节点
    const children = Array.from(map.values()).filter(
      (item: any) => item.parent_id === nodeId
    );

    // 递归处理子节点
    children.forEach((child: any) => {
      node.children.push(buildTree(child.id));
    });

    return node;
  };

  // 第二步：从根节点开始构建整棵树
  const roots: any[] = [];
  map.forEach((node: any) => {
    if (node.parent_id == null || !map.has(node.parent_id)) {
      roots.push(buildTree(node.id));
    }
  });

  return roots;
}
