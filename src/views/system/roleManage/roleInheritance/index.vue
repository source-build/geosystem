<template>
  <div class="role-inheritance">
    <el-alert
      title="角色继承允许一个角色自动获得另一个角色的所有权限策略。常用于需要复用已有角色权限的场景，如总租户继承租户的基础权限。继承关系独立于角色树形结构。"
      effect="dark"
      style="margin-bottom: 10px"
      color="#fff"
      show-icon
      :closable="false"
    >
      <template #icon><Connection /></template>
    </el-alert>

    <div class="main-layout">
      <!-- 左侧：继承关系列表 -->
      <div class="panel-left card">
        <div class="container-head">
          <div class="container-head-column">
            <h5 class="container-label">继承关系</h5>
            <el-tag size="small" effect="plain" round v-if="list.length"
              >{{ list.length }} 条</el-tag
            >
          </div>
          <div class="container-head-actions">
            <el-button type="primary" icon="Plus" @click="openAddDialog"
              >添加继承</el-button
            >
            <el-button icon="Refresh" text @click="queryList" />
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && list.length === 0" class="empty-state">
          <el-empty description="暂无角色继承关系">
            <el-button type="primary" @click="openAddDialog">添加第一条继承</el-button>
          </el-empty>
        </div>

        <!-- 继承关系列表 -->
        <div v-else class="inheritance-list" v-loading="loading">
          <transition-group name="list" tag="div" class="inheritance-items">
            <div
              class="inheritance-card"
              v-for="item in list"
              :key="`${item.child_alias}-${item.parent_alias}`"
            >
              <div class="inheritance-card__body">
                <div class="role-badge role-badge--child">
                  <span class="role-badge__name">{{ item.child_label }}</span>
                  <span class="role-badge__alias">{{ item.child_alias }}</span>
                </div>

                <div class="inheritance-flow">
                  <span class="inheritance-flow__line"></span>
                  <span class="inheritance-flow__label">继承</span>
                  <span class="inheritance-flow__line"></span>
                </div>

                <div class="role-badge role-badge--parent">
                  <span class="role-badge__name">{{ item.parent_label }}</span>
                  <span class="role-badge__alias">{{ item.parent_alias }}</span>
                </div>
              </div>

              <el-tooltip content="取消继承" placement="top">
                <el-button
                  class="inheritance-card__action"
                  link
                  type="danger"
                  icon="Delete"
                  @click="handleRemove(item)"
                />
              </el-tooltip>
            </div>
          </transition-group>
        </div>
      </div>

      <!-- 右侧：关系图 -->
      <div class="panel-right card">
        <div class="container-head">
          <div class="container-head-column">
            <h5 class="container-label">关系图</h5>
          </div>
        </div>

        <div class="graph-wrapper" v-if="graphNodes.length" v-loading="loading">
          <VueFlow
            :nodes="graphNodes"
            :edges="graphEdges"
            :default-viewport="{ zoom: 0.7, x: 0, y: 0 }"
            :min-zoom="0.2"
            :max-zoom="1.5"
            fit-view-on-init
            :fit-view-options="{ padding: 0.8 }"
          >
            <template #node-role="{ data }">
              <Handle type="target" :position="Position.Top" />
              <div class="graph-node" :class="{ 'graph-node--root': data.isRoot }">
                {{ data.label }}
              </div>
              <Handle type="source" :position="Position.Bottom" />
            </template>

            <Background :gap="16" :size="1" />
            <Controls position="bottom-right" />
          </VueFlow>
        </div>

        <!-- 图空状态 -->
        <div v-else-if="!loading" class="graph-empty">
          <el-empty description="暂无继承关系，无法生成关系图" :image-size="80" />
        </div>
      </div>
    </div>

    <!-- 添加继承弹窗 -->
    <el-dialog
      v-model="dialogShow"
      title="添加角色继承"
      destroy-on-close
      append-to-body
      width="580px"
    >
      <div class="dialog-hint">
        <el-icon><InfoFilled /></el-icon>
        <span>子角色将自动获得父角色的所有权限策略，包括后续父角色新增的权限。</span>
      </div>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="90px"
        style="margin-top: 16px"
      >
        <el-form-item label="子角色" prop="child_role">
          <el-select
            v-model="form.child_role"
            filterable
            placeholder="搜索并选择角色（继承方）"
            style="width: 100%"
          >
            <el-option
              v-for="role in availableChildRoles"
              :key="role.alias"
              :label="role.label"
              :value="role.alias"
            >
              <div class="role-option">
                <span class="role-option__label">{{ role.label }}</span>
                <span class="role-option__alias">{{ role.alias }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="继承自" prop="parent_role">
          <el-select
            v-model="form.parent_role"
            filterable
            placeholder="搜索并选择角色（被继承方）"
            style="width: 100%"
          >
            <el-option
              v-for="role in availableParentRoles"
              :key="role.alias"
              :label="role.label"
              :value="role.alias"
            >
              <div class="role-option">
                <span class="role-option__label">{{ role.label }}</span>
                <span class="role-option__alias">{{ role.alias }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogShow = false">取 消</el-button>
          <el-button
            type="primary"
            @click="submitAdd"
            :loading="submitLoading"
            :disabled="!form.child_role || !form.parent_role"
            >确认继承</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="roleInheritance">
import { ElMessageBox, FormInstance, FormRules } from "element-plus";
import { VueFlow, Handle, Position } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import dagre from "@dagrejs/dagre";
import type { Node, Edge } from "@vue-flow/core";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";
import {
  roleInheritanceList,
  addRoleInheritance,
  removeRoleInheritance,
} from "@/api/system/roleInheritance";
import { roleList } from "@/api/system/role";
import { showToastOk, showToastFail, showLoading, hideLoading } from "@/components/f-toast";

/** 列表加载状态 */
const loading = ref(false);
/** 继承关系列表 */
const list = ref<any[]>([]);
/** 弹窗显示状态 */
const dialogShow = ref(false);
/** 提交loading */
const submitLoading = ref(false);
/** 表单引用 */
const formRef = ref<FormInstance>();
/** 表单数据 */
const form = reactive({
  child_role: "",
  parent_role: "",
});
/** 校验规则 */
const rules = reactive<FormRules>({
  child_role: [{ required: true, message: "请选择子角色", trigger: "change" }],
  parent_role: [{ required: true, message: "请选择被继承角色", trigger: "change" }],
});
/** 所有角色选项（仅 type=1 普通角色，status=1 启用） */
const roleOptions = ref<any[]>([]);

/** 可选的子角色列表（排除已选的父角色） */
const availableChildRoles = computed(() =>
  roleOptions.value.filter((r) => r.alias !== form.parent_role),
);

/** 可选的父角色列表（排除已选的子角色） */
const availableParentRoles = computed(() =>
  roleOptions.value.filter((r) => r.alias !== form.child_role),
);

/* ==================== 关系图计算 ==================== */

/** 收集所有唯一角色及其继承层级（用于 dagre 布局） */
const graphNodes = computed<Node[]>(() => {
  if (!list.value.length) return [];

  // 收集所有角色：alias => { label, alias }
  const roleMap = new Map<string, { label: string; alias: string }>();
  for (const item of list.value) {
    if (!roleMap.has(item.child_alias)) {
      roleMap.set(item.child_alias, { label: item.child_label, alias: item.child_alias });
    }
    if (!roleMap.has(item.parent_alias)) {
      roleMap.set(item.parent_alias, { label: item.parent_label, alias: item.parent_alias });
    }
  }

  // 构建继承图 child => [parent]
  const childToParents = new Map<string, string[]>();
  const parentSet = new Set<string>();
  for (const item of list.value) {
    const arr = childToParents.get(item.child_alias) || [];
    arr.push(item.parent_alias);
    childToParents.set(item.child_alias, arr);
    parentSet.add(item.parent_alias);
  }

  // 找到根节点（只作为 parent，不作为 child）
  const rootNodes: string[] = [];
  for (const alias of roleMap.keys()) {
    if (!childToParents.has(alias)) {
      rootNodes.push(alias);
    }
  }

  // BFS 分层
  const rankMap = new Map<string, number>();
  const queue: { alias: string; rank: number }[] = rootNodes.map((a) => ({ alias: a, rank: 0 }));
  while (queue.length) {
    const { alias, rank } = queue.shift()!;
    if (rankMap.has(alias)) continue;
    rankMap.set(alias, rank);
    // 找到所有继承 alias 的子角色（childToParents 中 parent 包含 alias 的）
    for (const [child, parents] of childToParents) {
      if (parents.includes(alias) && !rankMap.has(child)) {
        queue.push({ alias: child, rank: rank + 1 });
      }
    }
  }
  // 没被 BFS 访问到的（孤立节点）放到 rank 0
  for (const alias of roleMap.keys()) {
    if (!rankMap.has(alias)) rankMap.set(alias, 0);
  }

  // 用 dagre 自动布局
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 70, ranksep: 90 });

  for (const [alias, role] of roleMap) {
    g.setNode(alias, { width: 140, height: 36 });
  }
  for (const item of list.value) {
    g.setEdge(item.parent_alias, item.child_alias);
  }
  dagre.layout(g);

  const nodes: Node[] = [];
  for (const [alias, role] of roleMap) {
    const nodeData = g.node(alias);
    nodes.push({
      id: alias,
      type: "role",
      position: { x: nodeData.x - nodeData.width / 2, y: nodeData.y - nodeData.height / 2 },
      data: {
        label: role.label,
        alias: role.alias,
        isRoot: !childToParents.has(alias),
      },
    });
  }

  return nodes;
});

/** 关系图的边 */
const graphEdges = computed<Edge[]>(() => {
  return list.value.map((item, index) => ({
    id: `e-${item.child_alias}-${item.parent_alias}-${index}`,
    source: item.parent_alias,
    target: item.child_alias,
    animated: true,
    type: "smoothstep",
    label: "继承",
    labelStyle: { fill: "#64748b", fontSize: 12, fontWeight: 500 },
    labelBgStyle: { fill: "#fff" },
    labelBgPadding: [4, 8] as [number, number],
    labelBgBorderRadius: 4,
  }));
});

/* ==================== 操作方法 ==================== */

/** 打开添加弹窗 */
const openAddDialog = () => {
  form.child_role = "";
  form.parent_role = "";
  dialogShow.value = true;
};

/** 提交添加继承 */
const submitAdd = async () => {
  const validate = await formRef.value?.validate((valid: any) => valid);
  if (!validate) return;

  submitLoading.value = true;
  try {
    await addRoleInheritance({ child_role: form.child_role, parent_role: form.parent_role });
    showToastOk("继承添加成功");
    dialogShow.value = false;
    await queryList();
  } catch (err: any) {
    showToastFail(err.err_msg || "添加失败");
  } finally {
    submitLoading.value = false;
  }
};

/** 取消继承 */
const handleRemove = async (item: any) => {
  try {
    await ElMessageBox.confirm(
      `确认取消「${item.child_label}」对「${item.parent_label}」的继承？取消后子角色将不再自动获得父角色的权限。`,
      "取消继承",
      {
        confirmButtonText: "确认取消",
        cancelButtonText: "返回",
        type: "warning",
      },
    );
    showLoading();
    await removeRoleInheritance({
      child_role: item.child_alias,
      parent_role: item.parent_alias,
    });
    showToastOk("已取消继承");
    await queryList();
  } catch (err: any) {
    if (err !== "cancel") showToastFail(err.err_msg || "取消失败");
  } finally {
    hideLoading();
  }
};

/** 查询继承关系列表 */
async function queryList() {
  loading.value = true;
  try {
    const { data: response }: any = await roleInheritanceList();
    list.value = response.result || [];
  } catch (err: any) {
    showToastFail(err.err_msg || "加载继承关系失败");
  } finally {
    loading.value = false;
  }
}

/** 加载角色选项（用于下拉框） */
async function queryRoleOptions() {
  try {
    const { data: response }: any = await roleList({});
    const roles = response.result || [];
    roleOptions.value = roles.filter(
      (r: any) => r.type === 1 && r.status === 1,
    );
  } catch (err: any) {
    showToastFail(err.err_msg || "加载角色列表失败");
  }
}

queryList();
queryRoleOptions();
</script>

<style lang="scss" scoped>
:deep(.el-alert--info.is-dark) {
  background-color: white;
  color: #303030;
  border: 1px solid #ebeef5;
}

:deep(.el-alert__title) {
  font-size: 12px;
}

.role-inheritance {
  position: absolute;
  inset: 0;
  margin: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* ---------- 主布局：左右分栏 ---------- */
.main-layout {
  display: flex;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.panel-left {
  flex: 0 0 420px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* ---------- 头部 ---------- */
.container-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  padding-left: 15px;
}

.container-head-column {
  display: flex;
  align-items: center;
  gap: 8px;
}

.container-head-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.container-label {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

/* ---------- 空状态 ---------- */
.empty-state {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

/* ---------- 卡片列表 ---------- */
.inheritance-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.inheritance-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.inheritance-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);

    .inheritance-card__action {
      opacity: 1;
    }
  }

  &__body {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    gap: 0;
  }

  &__action {
    flex-shrink: 0;
    margin-left: 16px;
    opacity: 0;
    transition: opacity 0.2s;
  }
}

/* ---------- 角色徽章 ---------- */
.role-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 6px 14px;
  border-radius: 6px;
  min-width: 100px;
  box-sizing: border-box;

  &--child {
    background: #ecf5ff;
    border: 1px solid #d9ecff;
  }

  &--parent {
    background: #f0f9eb;
    border: 1px solid #e1f3d8;
  }

  &__name {
    font-size: 13px;
    font-weight: 600;
    color: #303030;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 140px;
  }

  &__alias {
    font-size: 11px;
    color: #909399;
    font-family: Menlo, Monaco, "Courier New", monospace;
  }
}

/* ---------- 中间连线 ---------- */
.inheritance-flow {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  flex-shrink: 0;
  white-space: nowrap;

  &__line {
    display: inline-block;
    width: 20px;
    height: 1px;
    background: #c0c4cc;
  }

  &__label {
    font-size: 11px;
    color: var(--el-color-primary);
    font-weight: 500;
    padding: 2px 8px;
    background: var(--el-color-primary-light-9);
    border-radius: 10px;
    line-height: 1;
  }
}

/* ---------- 关系图画板 ---------- */
.graph-wrapper {
  flex: 1;
  min-height: 0;
  border-radius: 8px;
  overflow: hidden;
}

.graph-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

/* ---------- 图节点 ---------- */
.graph-node {
  padding: 6px 16px;
  border-radius: 4px;
  background: #fff;
  border: 1px solid #d0d7de;
  font-size: 12px;
  color: #2c3e50;
  white-space: nowrap;

  &--root {
    border-color: #2563eb;
  }
}

/* ---------- 弹窗提示 ---------- */
.dialog-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  background-color: #f4f4f5;
  border-radius: 8px;
  font-size: 12px;
  color: #606266;
  line-height: 1.6;

  .el-icon {
    flex-shrink: 0;
    margin-top: 2px;
    color: var(--el-color-primary);
  }
}

/* ---------- 下拉选项 ---------- */
.role-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  &__label {
    font-size: 14px;
    color: #303030;
  }

  &__alias {
    font-size: 11px;
    color: #909399;
    font-family: Menlo, Monaco, "Courier New", monospace;
  }
}

/* ---------- 列表动画 ---------- */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>

<!-- Vue Flow 主题覆盖（不能使用 scoped） -->
<style lang="scss">
.role-inheritance .vue-flow {
  .vue-flow__node-role {
    padding: 0;
    border: none;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
  }
}
</style>
