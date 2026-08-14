<template>
  <div class="role">
    <el-alert title="本页支持角色支持继承规则(树形结构)，子角色的权限会自动继承自父角色，设置权限策略时需要注意继承关系，避免重复授权。" effect="dark"
      style="margin-bottom: 10px" color="#fff" show-icon :closable="false">
      <template #icon>
        <Bell />
      </template>
    </el-alert>

    <div class="card">
      <div class="container-head">
        <div class="container-head-column">
          <h5 class="container-label">角色列表</h5>
        </div>
        <el-button v-permission="'add'" type="primary" @click="openNewDialog">新增角色</el-button>
        <el-button icon="Refresh" text @click="queryListData" />
      </div>
      <el-table v-loading="loading" :data="roleTree" row-key="id" :tree-props="{ children: 'children' }"
        default-expand-all>
        <el-table-column type="index" width="60" label="序号" align="center" />
        <el-table-column show-overflow-tooltip min-width="200" label="角色名称" prop="label" />
        <el-table-column show-overflow-tooltip min-width="120" label="权限字符" prop="alias" />
        <el-table-column align="center" width="120" label="角色类型">
          <template #default="{ row }">
            <span class="role-tag role-out" v-if="isSystemRole(row.alias)">内置角色</span>
            <span class="role-tag role-in" v-else>普通角色</span>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip min-width="200" label="角色描述" prop="describe" />
        <el-table-column align="center" width="100" label="状态" fixed="right">
          <template #default="{ row }">
            <f-status-badge v-if="row.status === 1" text="启用" type="success" plain />
            <f-status-badge v-else text="禁用" type="danger" plain />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="250" fixed="right"
          v-if="checkPermission(['add', 'edit', 'delete', 'permissions'])">
          <template #default="scope">
            <div class="flex justify-end">
              <el-button v-permission="'add'" size="small" link type="success" icon="Plus"
                @click="openNewChildDialog(scope.row)">新增</el-button>
              <el-button v-permission="'edit'" size="small" link type="primary" icon="Edit"
                @click="openEditDialog(scope.row)">修改</el-button>
              <el-button v-permission="'delete'" size="small" link type="danger" icon="Delete"
                @click="deleteSubmit(scope.row)" v-if="!isSystemRole(scope.row.alias)">删除</el-button>
              <el-button v-permission="'permissions'" size="small" link type="warning" icon="Key"
                @click="openGrantDrawer(scope.row)">策略</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑角色弹窗 -->
    <el-dialog v-model="dialogShow" :title="dialogType === 0 ? '新增角色' : '编辑角色'" destroy-on-close append-to-body
      width="700px">
      <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色名称" prop="label">
              <el-input v-model="form.label" placeholder="请输入角色名称" maxlength="128" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限字符" prop="alias">
              <el-input v-model.trim="form.alias" placeholder="请输入权限字符(英文)" maxlength="128" show-word-limit
                @input="form.alias = form.alias.replace(/[^a-zA-Z_]/g, '')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色类型" prop="role_type">
              <el-select v-model="form.role_type" placeholder="请选择角色类型" style="width: 100%">
                <el-option label="普通角色" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上级角色" prop="parent_id">
              <el-tree-select check-strictly v-model="form.parent_id" node-key="id" :data="treeSelectData"
                :render-after-expand="false" :props="{ label: 'label', children: 'children' }" default-expand-all
                placeholder="根角色" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :value="1">启用</el-radio>
                <el-radio :value="2">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="number">
              <el-input-number v-model="form.number" :min="1" :max="1000000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述" prop="describe">
              <el-input v-model.trim="form.describe" type="textarea" :rows="2" resize="none" placeholder="选填"
                maxlength="255" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogShow = false">取 消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 授权抽屉 -->
    <el-drawer v-model="grantDrawerShow" :title="`角色权限策略 - ${grantRole?.alias || ''}`" size="900px" destroy-on-close>
      <!-- 角色详情 -->
      <div class="grant-detail">
        <div class="grant-detail__item">
          <span class="grant-detail__label">角色名称</span>
          <span class="grant-detail__value grant-detail__value--primary">{{
            grantRole?.label
            }}</span>
        </div>
        <div class="grant-detail__item">
          <span class="grant-detail__label">权限字符</span>
          <span class="grant-detail__value">{{ grantRole?.alias }}</span>
        </div>
        <div class="grant-detail__item">
          <span class="grant-detail__label">角色描述</span>
          <span class="grant-detail__value">{{
            grantRole?.describe || "-"
            }}</span>
        </div>
        <div class="grant-detail__item" v-if="grantRole?.created_at">
          <span class="grant-detail__label">创建时间</span>
          <span class="grant-detail__value">{{
            dayjs(grantRole?.created_at).format("YYYY-MM-DD HH:mm:ss") || "-"
            }}</span>
        </div>
        <div class="grant-detail__item" v-if="grantRole?.updated_at">
          <span class="grant-detail__label">最后修改时间</span>
          <span class="grant-detail__value">{{
            dayjs(grantRole?.updated_at).format("YYYY-MM-DD HH:mm:ss") || "-"
            }}</span>
        </div>
      </div>
      <!-- 当前权限 -->
      <div class="grant-section" style="margin-bottom: 10px">
        <div class="grant-section__head" @click="grantOwnedExpanded = !grantOwnedExpanded">
          <div class="grant-section__left">
            <span class="grant-section__title">当前权限 ({{ grantOwnedList.length }})</span>
            <el-button v-if="grantOwnedSelected.length" size="small" type="danger" text
              @click.stop="handleBatchRemoveOwned">批量移除 ({{ grantOwnedSelected.length }})</el-button>
          </div>
          <el-icon class="grant-section__arrow" :class="{ 'grant-section__arrow--down': grantOwnedExpanded }">
            <ArrowRight />
          </el-icon>
        </div>
        <div class="grant-section__body" v-show="grantOwnedExpanded">
          <el-table v-if="grantOwnedList.length || grantOwnedLoading" :data="grantOwnedList" size="small"
            v-loading="grantOwnedLoading" max-height="240" @selection-change="handleOwnedSelectionChange">
            <el-table-column type="selection" width="40" align="center" />
            <el-table-column show-overflow-tooltip min-width="200" label="策略名称">
              <template #default="{ row }">
                <span>{{ row.name }}</span>
                <el-tooltip v-if="row.risk_level === 1" content="权限策略描述的权限过大，建议选择其他更精细的权限策略" placement="top">
                  <span class="grant-risk-tag">高风险</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column show-overflow-tooltip width="90" label="策略类型">
              <template #default>
                <span>系统策略</span>
              </template>
            </el-table-column>
            <el-table-column show-overflow-tooltip min-width="200" label="描述" prop="describe" />
            <el-table-column show-overflow-tooltip min-width="120" label="所属模块">
              <template #default="{ row }">
                <span>{{ getModuleName(row.map_data?.parent_id) }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" width="100" label="操作">
              <template #default="{ row }">
                <el-button link type="danger" icon="Delete" size="small" @click="handleRemoveOwnedPermission(row)" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <!-- 权限策略区域 -->
      <div class="grant-section">
        <div class="grant-section__head" @click="grantSectionExpanded = !grantSectionExpanded">
          <span class="grant-section__title">权限策略</span>
          <el-icon class="grant-section__arrow" :class="{ 'grant-section__arrow--down': grantSectionExpanded }">
            <ArrowRight />
          </el-icon>
        </div>
        <div class="grant-section__body" v-show="grantSectionExpanded">
          <div class="grant-transfer">
            <!-- 左侧：可选权限 -->
            <div class="grant-transfer__left">
              <div class="grant-transfer__header">
                <span>选择策略</span>
                <div class="grant-transfer__filters">
                  <el-tree-select v-model="grantCurrentDirId" :data="grantDirTreeSelectData" node-key="id"
                    check-strictly :render-after-expand="false" :props="{ label: 'name', children: 'children' }"
                    placeholder="全部模块" clearable size="small" style="width: 180px" @change="handleGrantDirChange">
                    <template #default="{ node, data }">
                      <span>{{ data.name }}</span>
                      <span class="grant-dir-count">{{
                        data.resource_count ?? 0
                        }}</span>
                    </template>
                  </el-tree-select>
                  <el-input prefix-icon="Search" clearable size="small" placeholder="搜索策略" v-model="grantSearchKeyword"
                    style="width: 150px" @clear="handleGrantSearch" @keyup.enter="handleGrantSearch" />
                  <el-button icon="Refresh" size="small" text @click="loadGrantPageList" />
                </div>
              </div>
              <el-table v-loading="grantLoading" :data="grantPageList" size="small"
                @selection-change="handleGrantSelectionChange" @row-click="handleGrantRowClick"
                :row-key="(row: any) => row.id" ref="grantTableRef" height="100%" :row-class-name="grantRowClassName">
                <el-table-column type="selection" width="40" align="center" :reserve-selection="true"
                  :selectable="grantSelectable" />
                <el-table-column show-overflow-tooltip min-width="200" label="策略名称" prop="name">
                  <template #default="{ row }">
                    <span>{{ row.name }}</span>
                    <el-tooltip v-if="row.risk_level === 1" content="权限策略描述的权限过大，建议选择其他更精细的权限策略" placement="top">
                      <span class="grant-risk-tag">高风险</span>
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip width="80" label="策略类型">
                  <template #default="{ row }">
                    <span>系统策略</span>
                  </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip min-width="200" label="描述" prop="describe" />
                <el-table-column show-overflow-tooltip min-width="120" label="所属模块" fixed="right">
                  <template #default="{ row }">
                    <span>{{ getModuleName(row.parent_id) }}</span>
                  </template>
                </el-table-column>
              </el-table>
              <div class="grant-pagination">
                <el-pagination size="small" layout="total, prev, pager, next" :total="grantTotal"
                  :page-size="grantPageSize" :current-page="grantCurrentPage" @current-change="handleGrantPageChange" />
              </div>
            </div>
            <!-- 右侧：已选权限 -->
            <div class="grant-transfer__right">
              <div class="grant-transfer__header">
                <span>已选策略 ({{ grantSelected.length }})</span>
                <el-button size="small" text type="danger" @click="clearGrantSelected">清空</el-button>
              </div>
              <div class="grant-transfer__body">
                <div class="grant-selected-item" v-for="item in grantSelected" :key="item.id">
                  <div class="grant-selected-item__info">
                    <span class="grant-selected-item__name">{{
                      item.name
                      }}</span>
                    <span class="grant-selected-item__desc">{{
                      item.describe
                      }}</span>
                  </div>
                  <el-icon size="14" class="grant-selected-item__remove" @click="removeGrantItem(item)">
                    <Close />
                  </el-icon>
                </div>
                <div v-if="grantSelected.length === 0" class="grant-transfer__empty">
                  请从左侧选择权限
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="grant-footer">
          <el-button @click="grantDrawerShow = false">取 消</el-button>
          <el-button type="primary" @click="submitGrant" :loading="grantSubmitLoading">确认新增授权</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts" name="role">
import { ElMessageBox, FormInstance, FormRules } from "element-plus";
import { listToTreeOptimized } from "@/utils/array";
import {
  roleList,
  addRole,
  editRole,
  delRole,
  queryRolePermissions,
  addRolePermissions,
  removeRolePermissions,
} from "@/api/system/role";
import {
  queryResourceMappingPage,
  queryResourceMappingDirectoryList,
  queryResourceMappingOptions,
} from "@/api/system/permissionManage";
import dayjs from "dayjs";
import { getSystemFixedRoles } from "@/api/role";
import { checkPermission } from "@/directives/permission";

/** 列表加载状态 */
const loading = ref(false);
/** 所有角色扁平列表 */
const allRoles = ref<any[]>([]);
/** 弹窗显示状态 */
const dialogShow = ref(false);
/** 弹窗类型：0=新增，1=编辑 */
const dialogType = ref(0);
/** 正在编辑的角色ID */
let editId: number | null = null;
/** 表单提交loading */
const submitLoading = ref(false);
/** 表单引用 */
const ruleFormRef = ref<FormInstance>();
/** 表单初始值 */
const formInit = {
  parent_id: 0,
  label: "",
  alias: "",
  describe: "",
  number: 1,
  status: 1 as 1 | 2,
  role_type: 1,
};
/** 表单数据 */
const form = reactive({ ...formInit });
/** 校验规则 */
const rules = reactive<FormRules>({
  label: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  alias: [
    { required: true, message: "请输入权限字符", trigger: "blur" },
    {
      pattern: /^[a-zA-Z_]+$/,
      message: "仅限英文字母和下划线",
      trigger: "blur",
    },
  ],
  number: [{ required: true, message: "请输入排序", trigger: "blur" }],
});
/** 系统内置角色列表 */
const systemRoles = ref<string[]>([]);

// --- 授权抽屉 ---
/** 授权抽屉显示状态 */
const grantDrawerShow = ref(false);
/** 当前授权的角色对象 */
const grantRole = ref<any>(null);
/** 授权搜索关键词 */
const grantSearchKeyword = ref("");
/** 授权当前选中的目录ID，空=全部 */
const grantCurrentDirId = ref<number | undefined>(undefined);
/** 授权目录列表 */
const grantDirList = ref<any[]>([]);
/** 授权表格引用 */
const grantTableRef = ref<any>();
/** 授权表格loading */
const grantLoading = ref(false);
/** 授权分页列表数据（当前页） */
const grantPageList = ref<any[]>([]);
/** 授权分页总数 */
const grantTotal = ref(0);
/** 授权当前页码 */
const grantCurrentPage = ref(1);
/** 授权每页条数 */
const grantPageSize = ref(20);
/** 授权已选中的权限列表（跨页累积） */
const grantSelected = ref<any[]>([]);
/** 授权提交loading */
const grantSubmitLoading = ref(false);
/** 权限策略区域是否展开 */
const grantSectionExpanded = ref(true);
/** 当前权限区域是否展开 */
const grantOwnedExpanded = ref(true);
/** 当前权限列表 */
const grantOwnedList = ref<any[]>([]);
/** 当前权限loading */
const grantOwnedLoading = ref(false);
/** 当前权限表格多选列表 */
const grantOwnedSelected = ref<any[]>([]);
/** 页面级资源映射详情 Map（name → 资源详情），用于当前权限展示完整字段 */
const resourceOptionsMap = ref<Map<string, any>>(new Map());

/** 授权目录树选择器数据 */
const grantDirTreeSelectData = computed(() =>
  listToTreeOptimized(grantDirList.value),
);
/** 已拥有权限的资源名称集合（用于禁用可选列表中的行） */
const grantOwnedNameSet = computed(
  () => new Set(grantOwnedList.value.map((r) => r.name)),
);
/** 角色树形结构 */
const roleTree = computed(() => listToTreeOptimized(allRoles.value));
/** 上级角色选择器数据（含"根目录"虚拟节点） */
const treeSelectData = computed(() => [
  {
    id: 0,
    label: "根角色",
    children: listToTreeOptimized(allRoles.value),
  },
]);
// 判断是否是系统内置角色（系统内置角色不允许编辑和删除）
const isSystemRole = computed(() => {
  return (role: string) => systemRoles.value.includes(role);
});

/** 根据 parent_id 从目录列表中查找模块名称 */
const getModuleName = (parentId: number | undefined) => {
  if (!parentId) return "-";
  const dir = grantDirList.value.find((d) => d.id === parentId);
  return dir?.name || "-";
};

/** 判断可选权限表格行是否可选（已拥有权限不可选） */
const grantSelectable = (row: any) => !grantOwnedNameSet.value.has(row.name);

/** 已拥有权限行样式（灰色） */
const grantRowClassName = ({ row }: { row: any }) => {
  return grantOwnedNameSet.value.has(row.name) ? "grant-row--owned" : "";
};

/** 当前权限表格多选变化 */
const handleOwnedSelectionChange = (rows: any[]) => {
  grantOwnedSelected.value = rows;
};

/** 批量移除当前权限 */
const handleBatchRemoveOwned = async () => {
  if (!grantOwnedSelected.value.length)
    return showToastFail("请选择要移除的权限");
  const names = grantOwnedSelected.value.map((r) => r.name);
  try {
    await ElMessageBox.confirm(
      `确认移除选中的 ${names.length} 个权限?`,
      "确认消息",
      {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
      },
    );
    showLoading();
    await removeRolePermissions({
      role_name: grantRole.value?.alias,
      resource_names: names,
    });
    showToastOk("移除成功");
    await loadGrantResources();
  } catch (err: any) {
    if (err !== "cancel") showToastFail(err.err_msg || "移除失败");
  } finally {
    hideLoading();
  }
};

/** 移除单个当前权限 */
const handleRemoveOwnedPermission = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确认移除权限「${row.name}」?`, "确认消息", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });
    showLoading();
    await removeRolePermissions({
      role_name: grantRole.value?.alias,
      resource_names: [row.name],
    });
    showToastOk("移除成功");
    await loadGrantResources();
  } catch (err: any) {
    if (err !== "cancel") showToastFail(err.err_msg || "移除失败");
  } finally {
    hideLoading();
  }
};

/** 目录树选择器变化，重新请求第一页 */
const handleGrantDirChange = () => {
  grantCurrentPage.value = 1;
  loadGrantPageList();
};

/** 搜索触发，重置到第一页 */
const handleGrantSearch = () => {
  grantCurrentPage.value = 1;
  loadGrantPageList();
};

/** 分页切换 */
const handleGrantPageChange = (page: number) => {
  grantCurrentPage.value = page;
  loadGrantPageList();
};

/** 点击行切换选中状态（已拥有权限不响应） */
const handleGrantRowClick = (row: any) => {
  if (grantOwnedNameSet.value.has(row.name)) return;
  grantTableRef.value?.toggleRowSelection(row);
};

/** 表格多选变化，跨页累积同步已选列表，最多100个 */
const handleGrantSelectionChange = (rows: any[]) => {
  const currentPageIds = new Set(grantPageList.value.map((item) => item.id));
  const selectedIds = new Set(rows.map((r) => r.id));
  // 移除当前页中取消选中的
  grantSelected.value = grantSelected.value.filter(
    (r) => !currentPageIds.has(r.id) || selectedIds.has(r.id),
  );
  // 新增当前页中新选中的
  const existIds = new Set(grantSelected.value.map((r) => r.id));
  const newlyAdded = rows.filter((r) => !existIds.has(r.id));
  const remain = 100 - grantSelected.value.length;
  if (remain <= 0) {
    showToastFail("最多选择100个资源");
    nextTick(() => {
      rows.forEach((row) => {
        if (!existIds.has(row.id))
          grantTableRef.value?.toggleRowSelection(row, false);
      });
    });
    return;
  }
  grantSelected.value = [
    ...grantSelected.value,
    ...newlyAdded.slice(0, remain),
  ];
  if (newlyAdded.length > remain) {
    showToastFail("最多选择100个资源，已自动截断");
    nextTick(() => {
      newlyAdded.slice(remain).forEach((row) => {
        grantTableRef.value?.toggleRowSelection(row, false);
      });
    });
  }
};

/** 清空已选 */
const clearGrantSelected = () => {
  grantSelected.value = [];
  grantTableRef.value?.clearSelection();
};

/** 从已选列表中移除某个权限 */
const removeGrantItem = (item: any) => {
  grantSelected.value = grantSelected.value.filter((r) => r.id !== item.id);
  grantTableRef.value?.toggleRowSelection(item, false);
};

/** 打开授权抽屉 */
const openGrantDrawer = async (row: any) => {
  grantRole.value = row;
  grantSelected.value = [];
  grantSearchKeyword.value = "";
  grantCurrentDirId.value = undefined;
  grantCurrentPage.value = 1;
  grantDrawerShow.value = true;
  await loadGrantResources();
};

/** 提交授权保存 */
const submitGrant = async () => {
  if (!grantSelected.value.length) return showToastFail("请选择权限");
  if (grantSelected.value.length > 100)
    return showToastFail("单次最多授权100个资源");
  grantSubmitLoading.value = true;
  showLoading();
  try {
    await addRolePermissions({
      role_name: grantRole.value?.alias,
      resource_names: grantSelected.value.map((r) => r.name),
    });
    showToastOk("授权成功");
    grantSelected.value = [];
    grantTableRef.value?.clearSelection();
    await loadGrantResources();
  } catch (err: any) {
    showToastFail("授权失败 " + (err.err_msg || ""));
  } finally {
    grantSubmitLoading.value = false;
    hideLoading();
  }
};

/** 打开新增角色弹窗（顶级角色） */
const openNewDialog = () => {
  dialogType.value = 0;
  editId = null;
  Object.assign(form, { ...formInit });
  dialogShow.value = true;
};

/** 打开新增子角色弹窗，预填当前行作为上级角色 */
const openNewChildDialog = (row: any) => {
  dialogType.value = 0;
  editId = null;
  Object.assign(form, { ...formInit, parent_id: row.id });
  dialogShow.value = true;
};

/** 打开编辑角色弹窗，用当前行数据填充表单 */
const openEditDialog = (row: any) => {
  dialogType.value = 1;
  editId = row.id;
  Object.assign(form, {
    parent_id: row.parent_id,
    label: row.label,
    alias: row.alias,
    describe: row.describe,
    number: row.number,
    status: row.status,
  });
  dialogShow.value = true;
};

/** 提交角色表单（新增或编辑），成功后刷新列表 */
const submitForm = async () => {
  const validate = await ruleFormRef.value?.validate((valid: any) => valid);
  if (!validate) return;

  submitLoading.value = true;
  try {
    const payload = { ...form };
    if (dialogType.value === 0) {
      await addRole(payload);
      showToastOk("新增成功");
    } else {
      await editRole(editId!, payload);
      showToastOk("编辑成功");
    }
    dialogShow.value = false;
    await queryListData();
  } catch (err: any) {
    showToastFail("操作失败 " + (err.err_msg || ""));
  } finally {
    submitLoading.value = false;
  }
};

/** 确认删除角色，成功后刷新列表 */
const deleteSubmit = async (row: any) => {
  try {
    await ElMessageBox.confirm("确认删除该角色?", "确认消息", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });
    showLoading();
    await delRole(row.id);
    showToastOk("删除成功");
    await queryListData();
  } catch (err: any) {
    if (err !== "cancel") showToastFail(err.err_msg || "删除失败");
  } finally {
    hideLoading();
  }
};

/** 加载所有角色列表并构建树 */
async function queryListData() {
  loading.value = true;
  try {
    const { data: response }: any = await roleList({});
    allRoles.value = response.result || [];
  } catch (err: any) {
    showToastFail(err.err_msg || "加载角色列表失败");
  } finally {
    loading.value = false;
  }
}

/** 加载授权抽屉：并行请求目录、资源列表、已有权限，然后本地匹配 */
async function loadGrantResources() {
  grantLoading.value = true;
  grantOwnedLoading.value = true;
  try {
    const params: any = {
      page: grantCurrentPage.value,
      page_size: grantPageSize.value,
    };
    if (grantCurrentDirId.value) params.parent_id = grantCurrentDirId.value;
    const keyword = grantSearchKeyword.value.trim();
    if (keyword) params.keyword = keyword;

    const [dirRes, pageRes, permRes]: any[] = await Promise.all([
      queryResourceMappingDirectoryList(),
      queryResourceMappingPage(params),
      queryRolePermissions({ role_name: grantRole.value?.alias }),
    ]);

    // 目录
    const dirData =
      dirRes?.data?.response?.result || dirRes?.data?.result || [];
    grantDirList.value = dirData;

    // 资源分页列表
    const pageResult = pageRes?.data?.result || {};
    const rows = pageResult.rows || pageResult.list || [];
    grantPageList.value = rows;
    grantTotal.value = pageResult.total || 0;

    // 已有权限：解析二维数组，用 resourceOptionsMap 补充完整详情
    const rawPerms: string[][] = permRes?.data?.result || [];
    const ownedNames = new Set<string>();
    grantOwnedList.value = rawPerms.map((item) => {
      const [_roleName, resourceName, method] = item;
      ownedNames.add(resourceName);
      const mapData = resourceOptionsMap.value.get(resourceName) || {};
      return {
        name: resourceName,
        method,
        describe: mapData.describe || "",
        risk_level: mapData.risk_level ?? 0,
        map_data: mapData,
      };
    });

    // 恢复已选项 + 禁用已拥有权限行
    nextTick(() => {
      const selectedIdSet = new Set(grantSelected.value.map((r) => r.id));
      grantPageList.value.forEach((row) => {
        if (ownedNames.has(row.name)) return;
        if (selectedIdSet.has(row.id)) {
          grantTableRef.value?.toggleRowSelection(row, true);
        }
      });
      grantTableRef.value?.doLayout();
    });
  } catch (err: any) {
    showToastFail(err.err_msg || "加载失败");
  } finally {
    grantLoading.value = false;
    grantOwnedLoading.value = false;
  }
}

/** 加载所有资源映射选项，构建 name→详情 Map */
async function loadResourceOptions() {
  try {
    const { data: res }: any = await queryResourceMappingOptions({});
    const list: any[] = res?.result || res?.response?.result || [];
    const map = new Map<string, any>();
    list.forEach((item) => map.set(item.name, item));
    resourceOptionsMap.value = map;
  } catch (err: any) {
    showToastFail(err.err_msg || "加载资源选项失败");
  }
}

/** 加载可选权限分页列表（翻页/搜索/筛选时调用） */
async function loadGrantPageList() {
  const params: any = {
    page: grantCurrentPage.value,
    page_size: grantPageSize.value,
  };
  if (grantCurrentDirId.value) params.parent_id = grantCurrentDirId.value;
  const keyword = grantSearchKeyword.value.trim();
  if (keyword) params.keyword = keyword;
  grantLoading.value = true;

  try {
    const { data: response }: any = await queryResourceMappingPage(params);
    const rows = response.result.rows || [];
    grantPageList.value = rows;
    grantTotal.value = response.result.total;
    nextTick(() => {
      const ownedNames = grantOwnedNameSet.value;
      const selectedIdSet = new Set(grantSelected.value.map((r) => r.id));
      grantPageList.value.forEach((row) => {
        if (ownedNames.has(row.name)) return;
        if (selectedIdSet.has(row.id)) {
          grantTableRef.value?.toggleRowSelection(row, true);
        }
      });
    });
  } catch (err: any) {
    showToastFail(err.err_msg || "加载失败");
  } finally {
    grantLoading.value = false;
  }
}

/** 查询系统内置角色列表 */
async function querySystemRoles() {
  try {
    const { data: response }: any = await getSystemFixedRoles();
    systemRoles.value = response.result || [];
  } catch (err: any) {
    showToastFail(err.err_msg || "加载系统内置角色列表失败");
  }
}

queryListData();
loadResourceOptions();
querySystemRoles();
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

.role {
  position: absolute;
  inset: 0;
  margin: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.grant-detail {
  display: flex;
  gap: 20px;
  padding: 10px 0;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-top: 0;

  &__item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__label {
    font-size: 12px;
    color: #909399;
  }

  &__value {
    font-size: 13px;
    color: #303030;

    &--primary {
      font-weight: 600;
      color: var(--el-color-primary);
    }
  }
}

.grant-section {
  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    height: 40px;
    box-sizing: border-box;
    background-color: #fafbfc;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    cursor: pointer;
    user-select: none;

    &:hover {
      background-color: #f5f7fa;
    }
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: #303030;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 0;
    overflow: hidden;
  }

  &__arrow {
    font-size: 14px;
    color: #909399;
    transition: transform 0.2s;

    &--down {
      transform: rotate(90deg);
    }
  }

  &__body {
    margin-top: 8px;
  }
}

.grant-dir-count {
  font-size: 10px;
  color: #909399;
  background-color: #f4f4f5;
  border-radius: 8px;
  padding: 0 5px;
  line-height: 16px;
  margin-left: 6px;
}

.grant-risk-tag {
  font-size: 10px;
  color: var(--el-color-danger);
  text-decoration: underline dashed;
  text-underline-offset: 3px;
  margin-left: 4px;
  cursor: help;
}

.grant-transfer {
  display: flex;
  gap: 12px;
  height: calc(100vh - 400px);
  min-height: 260px;

  .grant-transfer__left {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    overflow: hidden;

    :deep(.el-table) {
      th.el-table__cell {
        padding: 4px 0;
        background-color: #fafbfc;
      }

      td.el-table__cell {
        padding: 2px 0;
      }
    }
  }

  .grant-transfer__right {
    width: 240px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    overflow: hidden;
  }

  .grant-transfer__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    background-color: #fafbfc;
    border-bottom: 1px solid var(--el-border-color-lighter);
    font-size: 13px;
    font-weight: 600;
    color: #303030;
    flex-shrink: 0;

    .grant-transfer__filters {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }

  .grant-transfer__body {
    flex: 1;
    overflow-y: auto;
  }

  .grant-transfer__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 12px;
    color: #c0c4cc;
  }
}

.grant-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 4px 8px;
  border-top: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}

.grant-selected-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px;

  &:hover {
    background-color: #f0f5ff;
  }

  &:nth-child(1) {
    margin-top: 5px;
  }

  .grant-selected-item__info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    overflow: hidden;
    flex: 1;
    min-width: 0;
  }

  .grant-selected-item__name {
    font-size: 12px;
    color: #303030;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .grant-selected-item__desc {
    font-size: 11px;
    color: #909399;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .grant-selected-item__remove {
    flex-shrink: 0;
    cursor: pointer;
    color: #909399;
    margin-left: 6px;

    &:hover {
      color: var(--el-color-danger);
    }
  }
}

:deep(.grant-row--owned) {
  opacity: 0.45;
  pointer-events: none;

  td {
    background-color: #f5f7fa !important;
  }
}

.grant-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.role-tag {
  display: inline-block;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 11px;
  line-height: 1;
  font-weight: 500;
}

.role-in {
  color: #059669;
  background: rgba(16, 185, 129, 0.06);
}

.role-out {
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
}
</style>
