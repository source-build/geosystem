<template>
  <div class="vertical-layout page-table-layout">
    <div class="main">
      <div class="content">
        <div class="container-head justify-between">
          <h5 class="container-label">菜单列表</h5>
          <div class="flex items-center mb-[10px]">
            <el-button type="primary" @click="openNewDialog()" v-permission="'add'"
              >新增菜单</el-button
            >
            <el-button icon="Refresh" text @click="queryAllMenu" />
          </div>
        </div>
        <el-table style="height:100%" v-loading="loading" :data="list" row-key="id">
          <el-table-column
            align="left"
            show-overflow-tooltip
            min-width="180"
            label="名称"
            prop="name"
          >
            <template #default="scope">
              <span
                v-if="scope.row.type == 3"
                style="cursor: pointer; text-decoration: underline"
                @click="copyText(scope.row.name)"
                >{{
                  scope.row.describe || permissionName(scope.row.name) || "-"
                }}</span
              >
              <span v-else>{{ scope.row.name || "-" }}</span>
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            width="180"
            label="简称"
            prop="short_name"
            align="center"
          >
            <template #default="scope">
              <span>{{ scope.row.short_name || "-" }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" width="80" label="类型">
            <template #default="scope">
              <span v-if="scope.row.type == 1">目录</span>
              <span v-if="scope.row.type == 2">菜单</span>
              <f-status-badge plain type="success" v-if="scope.row.type == 3"
                >按钮</f-status-badge
              >
            </template>
          </el-table-column>
          <el-table-column align="center" width="80" label="图标">
            <template #default="{ row }">
              <!-- 本地图标 -->
              <div
                class="flex items-center justify-center"
                v-if="row.icon_type == 1"
              >
                <f-svg-icon :name="row.icon" />
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" width="120" label="排序">
            <template #default="{ row }">
              <el-input-number
                v-model="row.number"
                :min="0"
                :max="65535"
                :controls="false"
                size="small"
                style="width: 80px"
                @blur="handleNumberChange(row)"
                @keyup.enter="handleNumberChange(row)"
                v-permission="'number'"
              />
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            show-overflow-tooltip
            min-width="250"
            label="路由地址"
            prop="addr"
          />
          <el-table-column align="center" min-width="100" label="是否显示">
            <template #default="scope">
              <span v-if="scope.row.show == 1">显示</span>
              <span v-if="scope.row.show == 2" class="text-[#FF4D4F]">隐藏</span>
            </template>
          </el-table-column>
          <el-table-column align="center" min-width="100" label="是否缓存">
            <template #default="scope">
              <template v-if="scope.row.type == 2">
                <span v-if="scope.row.cache == 1">缓存</span>
                <span v-if="scope.row.cache == 2">不缓存</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            show-overflow-tooltip
            min-width="140"
            label="资源策略"
          >
            <template #default="{ row }">
              <span v-if="row.type == 3">{{ row.resource_name || "-" }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column align="center" min-width="100" label="状态">
            <template #default="scope">
              <span v-if="scope.row.status == 1">启用</span>
              <span v-if="scope.row.status == 2" style="color: red">禁用</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            min-width="250"
            fixed="right"
            v-if="checkPermission(['add', 'edit', 'delete'])"
          >
            <template #default="scope">
              <el-button
                v-permission="['add', 'edit']"
                size="small"
                link
                type="info"
                icon="CopyDocument"
                @click="openCopyDialog(scope.row)"
                >复制</el-button
              >
              <el-button
                v-permission="'edit'"
                size="small"
                link
                type="primary"
                icon="Edit"
                @click="openEditDialog(scope.row)"
                >修改</el-button
              >
              <el-button
                v-permission="'add'"
                size="small"
                link
                type="success"
                icon="Plus"
                v-if="scope.row.type == 1 || scope.row.type == 2"
                @click="openNewDialog(scope.row.id, scope.row.type)"
                >新增</el-button
              >
              <el-button
                v-permission="'delete'"
                size="small"
                link
                type="danger"
                icon="Delete"
                @click="deleteSubmit(scope.row)"
                v-if="scope.row.children.length == 0"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog
      v-model="dialogShow"
      :title="dialogShowType == 0 ? '新增' : '编辑'"
      destroy-on-close
      append-to-body
      width="850px"
      align-center
    >
      <el-form
        ref="ruleFormRef"
        :model="data.form"
        :rules="data.rules"
        label-width="100px"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级菜单" prop="parent_id">
              <el-tree-select
                check-strictly
                v-model="data.form.parent_id"
                node-key="id"
                :data="selectMenus"
                :render-after-expand="false"
                default-expand-all
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单类型" prop="type">
              <el-radio-group
                v-model="data.form.type"
                @change="handleTypeChange"
                :disabled="dialogShowType === 1"
              >
                <el-radio :value="1">目录</el-radio>
                <el-radio :value="2">菜单</el-radio>
                <el-radio :value="3" v-if="data.form.parent_type === 2"
                  >按钮</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="number">
              <el-input-number
                v-model="data.form.number"
                :min="1"
                placeholder="排序"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="data.form.type !== 3">
            <el-form-item label="图标类型" prop="icon_type">
              <el-select v-model="data.form.icon_type" placeholder="选择">
                <el-option label="无图标" :value="0" />
                <el-option label="本地图标" :value="1" />
                <el-option label="Iconfont图标" :value="2" disabled />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="data.form.type !== 3">
            <el-form-item label="菜单图标" prop="icon">
              <el-popover
                placement="bottom"
                title="选择图标"
                :width="300"
                trigger="click"
                v-if="data.form.icon_type > 0"
              >
                <template #reference>
                  <div style="display: flex; align-items: center">
                    <f-svg-icon
                      :name="data.form.icon"
                      size="20px"
                      v-if="data.form.icon"
                      style="margin-right: 10px"
                    />
                    <el-button size="small">选择</el-button>
                  </div>
                </template>
                <div class="icon-select">
                  <div
                    class="item"
                    v-for="item in iconList"
                    @click="
                      () => {
                        data.form.icon = item;
                      }
                    "
                  >
                    <f-svg-icon :name="item" size="20px" color="#333" />
                  </div>
                </div>
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="data.form.type == 3 ? 24 : 12">
            <el-form-item
              :label="data.form.type == 3 ? '按钮类型' : '菜单名称'"
              prop="name"
            >
              <template v-if="data.form.type == 3">
                <el-radio-group
                  v-model="data.form.name"
                  @change="handleQuickActionChange"
                >
                  <el-radio
                    v-for="action in quickActions"
                    :key="action.value"
                    :value="action.value"
                    >{{ action.label }}</el-radio
                  >
                  <el-radio value="__custom__">自定义</el-radio>
                </el-radio-group>
                <div
                  v-if="isCustomAction"
                  style="display: flex; gap: 8px; margin-top: 6px"
                >
                  <el-input
                    v-model="customActionName"
                    placeholder="权限字符（英文）"
                    style="flex: 1"
                    @input="customActionName = customActionName.replace(/[^a-zA-Z_]/g, '')"
                  />
                  <el-input
                    v-model="data.form.describe"
                    placeholder="中文描述"
                    style="flex: 1; margin-right: 20px"
                  />
                </div>
                <div
                  v-if="data.form.name && data.form.name !== '__custom__'"
                  class="action-name-hint"
                >
                  权限字符：<code @click="copyText(data.form.name)">{{
                    data.form.name
                  }}</code>
                </div>
                <div
                  v-if="isCustomAction && customActionName"
                  class="action-name-hint"
                >
                  权限字符：<code @click="copyText(customActionName)">{{
                    customActionName
                  }}</code>
                </div>
              </template>
              <el-input
                v-else
                v-model="data.form.name"
                placeholder="请输入菜单名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="data.form.type == 3">
            <el-form-item label="按钮策略" prop="resource_name">
              <el-input
                v-model="data.form.resource_name"
                placeholder="从下方选择资源策略"
                readonly
                clearable
                @clear="data.form.resource_name = ''"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="data.form.type == 3">
            <div class="resource-picker">
              <div class="resource-picker__filters">
                <el-tree-select
                  v-model="resourcePickerDirId"
                  :data="resourcePickerDirTree"
                  node-key="id"
                  check-strictly
                  :render-after-expand="false"
                  :props="{ label: 'name', children: 'children' }"
                  placeholder="全部模块"
                  clearable
                  size="small"
                  style="width: 180px"
                  @change="handleResourcePickerSearch"
                >
                  <template #default="{ data }">
                    <span>{{ data.name }}</span>
                    <span class="resource-picker-dir-count">{{
                      data.resource_count ?? 0
                    }}</span>
                  </template>
                </el-tree-select>
                <el-input
                  prefix-icon="Search"
                  clearable
                  size="small"
                  placeholder="搜索策略"
                  v-model="resourcePickerKeyword"
                  style="width: 140px"
                  @clear="handleResourcePickerSearch"
                  @keyup.enter="handleResourcePickerSearch"
                />
              </div>
              <el-table
                v-loading="resourcePickerLoading"
                :data="resourcePickerList"
                size="small"
                height="200"
                highlight-current-row
                @row-click="handleResourcePickerRowClick"
                :row-class-name="
                  ({ row }: any) =>
                    row.name === data.form.resource_name
                      ? 'resource-picker-row--active'
                      : ''
                "
              >
                <el-table-column
                  show-overflow-tooltip
                  min-width="120"
                  label="策略名称"
                  prop="name"
                >
                  <template #default="{ row }">
                    <span>{{ row.name }}</span>
                    <el-tooltip
                      v-if="row.risk_level === 1"
                      content="权限策略描述的权限过大，建议选择其他更精细的权限策略"
                      placement="top"
                    >
                      <span
                        style="
                          font-size: 10px;
                          color: var(--el-color-danger);
                          text-decoration: underline dashed;
                          text-underline-offset: 3px;
                          margin-left: 4px;
                          cursor: help;
                        "
                        >高风险</span
                      >
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column
                  show-overflow-tooltip
                  min-width="180"
                  label="描述"
                  prop="describe"
                />
                <el-table-column
                  show-overflow-tooltip
                  width="110"
                  label="所属模块"
                >
                  <template #default="{ row }">
                    <span>{{ getPickerModuleName(row.parent_id) }}</span>
                  </template>
                </el-table-column>
              </el-table>
              <div class="resource-picker__pagination">
                <el-pagination
                  size="small"
                  layout="total, prev, pager, next"
                  :total="resourcePickerTotal"
                  :page-size="resourcePickerPageSize"
                  :current-page="resourcePickerPage"
                  @current-change="
                    (page: number) => {
                      resourcePickerPage = page;
                      loadResourcePickerList();
                    }
                  "
                />
              </div>
            </div>
          </el-col>
          <el-col :span="12" v-if="data.form.type == 1">
            <el-form-item label="菜单简称" prop="short_name">
              <el-input
                v-model="data.form.short_name"
                placeholder="请输入菜单简称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="data.form.type == 2">
            <el-form-item label="组件名称" prop="route_name">
              <el-input
                v-model="data.form.route_name"
                placeholder="请输入组件名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="data.form.type == 2">
            <el-form-item label="路由地址" prop="addr">
              <el-input v-model="data.form.addr" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="data.form.type == 2">
            <el-form-item label="组件地址" prop="path">
              <el-input v-model="data.form.path" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否显示" prop="show">
              <el-radio-group v-model="data.form.show">
                <el-radio :value="1">显示</el-radio>
                <el-radio :value="2">隐藏</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="data.form.type == 2">
            <el-form-item label="是否缓存" prop="cache">
              <el-radio-group v-model="data.form.cache">
                <el-radio :value="1">缓存</el-radio>
                <el-radio :value="2">不缓存</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="data.form.type == 1 || data.form.type == 3 ? 12 : 24">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="data.form.status">
                <el-radio :value="1">启用</el-radio>
                <el-radio :value="2">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogShow = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts" name="menus">
import { ElMessageBox, FormInstance } from "element-plus";
import {
  addMenu,
  allMenu,
  editMenu,
  delMenu,
  updateMenuNumber,
} from "@/api/system/menu";
import {
  queryResourceMappingPage,
  queryResourceMappingDirectoryList,
} from "@/api/system/permissionManage";
import { listToTreeOptimized } from "@/utils/array";
import { checkPermission } from "@/directives/permission";

const list: Ref<any[]> = ref([]);
const loading: Ref<boolean> = ref(false);
// 存储原始排序值，用于比较是否发生变化
const originalNumbers = ref<Map<any, number>>(new Map());
const iconList = Object.keys(
  import.meta.glob("/src/assets/svg/*.svg"),
).map((path) => path.replace("/src/assets/svg/", "").replace(".svg", ""));
const dialogShow: Ref<boolean> = ref(false);
const dialogShowType: Ref<number> = ref(0);
let editId: any = null;
const ruleFormRef: Ref = ref<FormInstance>();
const initFormData = {
  parent_id: 0,
  parent_type: 0,
  // 排序
  number: 1,
  // 名称
  name: "",
  // 简称
  short_name: "",
  // 类型 1:目录 2:菜单 3:按钮
  type: 1,
  // 组件名称
  route_name: "",
  // 路由地址
  addr: "",
  // 菜单路径
  path: "",
  // 图标类型 0:无图标 1:本地图标 2:iconfont图标
  icon_type: 1,
  // 图标
  icon: "",
  show: 1,
  cache: 1,
  status: 1,
  // 资源策略名称（按钮权限时使用）
  resource_name: "",
  // 按钮描述（按钮权限时的中文说明）
  describe: "",
};
/** 按钮名称快捷选项 */
const quickActions = [
  { label: "列表", value: "list" },
  { label: "新增", value: "add" },
  { label: "修改", value: "edit" },
  { label: "删除", value: "delete" },
  { label: "导入", value: "import" },
  { label: "导出", value: "export" },
  { label: "详情", value: "detail" },
  { label: "审核", value: "approval" },
];
/** 快捷选项值列表（用于编辑回显判断） */
const quickActionValues = quickActions.map((a) => a.value);
/** 自定义按钮名称 */
const customActionName = ref("");
/** 当前按钮是否为自定义模式 */
const isCustomAction = ref(false);
/** 资源策略选择器 */
const resourcePickerLoading = ref(false);
const resourcePickerList = ref<any[]>([]);
const resourcePickerTotal = ref(0);
const resourcePickerPage = ref(1);
const resourcePickerPageSize = ref(10);
const resourcePickerKeyword = ref("");
const resourcePickerDirId = ref<number | undefined>(undefined);
const resourcePickerDirList = ref<any[]>([]);
const data = reactive({
  form: <any>{ ...initFormData },
  rules: {
    type: [{ required: true, message: "请选择", trigger: "blur" }],
    name: [{ required: true, message: "请填写完整", trigger: "blur" }],
    route_name: [{ required: true, message: "请填写完整", trigger: "blur" }],
    addr: [{ required: true, message: "请填写完整", trigger: "blur" }],
    icon_type: [{ required: true, message: "请选择", trigger: "blur" }],
    path: [{ required: true, message: "请填写完整", trigger: "blur" }],
  },
});
// 上级菜单
const selectMenus: Ref<any[]> = ref([
  { id: 0, label: "主类目", value: 0, children: [] },
]);

const resourcePickerDirTree = computed(() =>
  listToTreeOptimized(resourcePickerDirList.value),
);
// 根据权限字符显示中文名称
const permissionName = computed(() => {
  return (name: string) => {
    const action = quickActions.find((a) => a.value === name);
    return action ? action.label : name;
  };
});

/** 菜单类型切换时重置名称 */
const handleTypeChange = (val: number) => {
  if (val === 3) {
    data.form.name = quickActions[0].value;
    data.form.describe = quickActions[0].label;
    initResourcePicker();
  } else {
    data.form.name = "";
    data.form.describe = "";
  }
  customActionName.value = "";
  isCustomAction.value = false;
};
/** 快捷选项切换 */
const handleQuickActionChange = (val: string) => {
  isCustomAction.value = val === "__custom__";
  if (val !== "__custom__") {
    customActionName.value = "";
    // 预设选项：describe 自动填入中文标签
    const action = quickActions.find((a) => a.value === val);
    data.form.describe = action ? action.label : "";
  } else {
    data.form.describe = "";
  }
};
/** 复制文本 */
const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    showToastOk("复制成功");
  } catch {
    showToastFail("复制失败");
  }
};
/** 根据 parent_id 查找模块名称 */
const getPickerModuleName = (parentId: number | undefined) => {
  if (!parentId) return "-";
  const dir = resourcePickerDirList.value.find((d: any) => d.id === parentId);
  return dir?.name || "-";
};
/** 初始化资源选择器（加载目录+列表） */
function initResourcePicker() {
  resourcePickerKeyword.value = "";
  resourcePickerDirId.value = undefined;
  resourcePickerPage.value = 1;
  if (!resourcePickerDirList.value.length) loadResourcePickerDirs();
  loadResourcePickerList();
}
/** 加载资源目录 */
async function loadResourcePickerDirs() {
  try {
    const { data: res }: any = await queryResourceMappingDirectoryList();
    resourcePickerDirList.value = res?.response?.result || res?.result || [];
  } catch {}
}
/** 加载资源分页列表 */
async function loadResourcePickerList() {
  resourcePickerLoading.value = true;
  try {
    const params: any = {
      page: resourcePickerPage.value,
      page_size: resourcePickerPageSize.value,
    };
    if (resourcePickerDirId.value) params.parent_id = resourcePickerDirId.value;
    const keyword = resourcePickerKeyword.value.trim();
    if (keyword) params.keyword = keyword;
    const { data: res }: any = await queryResourceMappingPage(params);
    const result = res?.result || {};
    resourcePickerList.value = result.rows || result.list || [];
    resourcePickerTotal.value = result.total || 0;
  } catch (err: any) {
    showToastFail(err.err_msg || "加载资源列表失败");
  } finally {
    resourcePickerLoading.value = false;
  }
}
/** 搜索/筛选触发 */
const handleResourcePickerSearch = () => {
  resourcePickerPage.value = 1;
  loadResourcePickerList();
};
/** 选中某个资源 */
const handleResourcePickerRowClick = (row: any) => {
  data.form.resource_name = row.name;
};
/** 新增 */
const openNewDialog = (parseId?: any, parentType?: any) => {
  dialogShowType.value = 0;
  editId = null;
  data.form = { ...initFormData };
  customActionName.value = "";
  isCustomAction.value = false;
  // 存在父级
  if (parseId) {
    data.form.parent_id = parseId;
    data.form.parent_type = parentType;
    // 在菜单下新增时默认选中按钮类型
    if (parentType === 2) {
      data.form.type = 3;
      data.form.name = quickActions[0].value;
    }
  }

  dialogShow.value = true;
  if (data.form.type === 3) initResourcePicker();
};
/** 编辑 */
const openEditDialog = (item: any) => {
  dialogShowType.value = 1;
  editId = item.id;
  data.form = {
    parent_id: item.parent_id,
    parent_type: item.parent_type || 0,
    // 排序
    number: item.number,
    // 名称
    name: item.name,
    // 简称
    short_name: item.short_name,
    // 类型 1:目录 2:菜单 3:按钮
    type: item.type,
    // 组件名称
    route_name: item.route_name,
    // 路由地址
    addr: item.addr,
    // 菜单路径
    path: item.path,
    // 图标类型 0:无图标 1:本地图标 2:iconfont图标
    icon_type: item.icon_type,
    // 图标
    icon: item.icon,
    show: item.show,
    cache: item.cache,
    status: item.status,
    // 资源策略名称
    resource_name: item.resource_name || "",
    // 按钮描述
    describe: item.describe || "",
  };
  // 按钮权限需要查找父级类型
  if (item.type === 3) {
    data.form.parent_type = 2;
    // 不在预设中则设为自定义
    if (!quickActionValues.includes(item.name)) {
      customActionName.value = item.name;
      data.form.name = "__custom__";
      isCustomAction.value = true;
    } else {
      customActionName.value = "";
      isCustomAction.value = false;
    }
  }
  dialogShow.value = true;
  if (item.type === 3) initResourcePicker();
};
/** 复制 */
const openCopyDialog = (item: any) => {
  dialogShowType.value = 0;
  editId = null;
  data.form = {
    parent_id: item.parent_id,
    parent_type: item.type === 3 ? 2 : 0,
    // 排序
    number: item.number,
    // 名称
    name: item.name,
    // 类型 1:目录 2:菜单 3:按钮
    type: item.type,
    // 组件名称
    route_name: item.route_name,
    // 路由地址
    addr: item.addr,
    // 菜单路径
    path: item.path,
    // 图标类型 0:无图标 1:本地图标 2:iconfont图标
    icon_type: item.icon_type,
    // 图标
    icon: item.icon,
    show: item.show,
    cache: item.cache,
    status: item.status,
    // 资源策略名称
    resource_name: item.resource_name || "",
    // 按钮描述
    describe: item.describe || "",
  };
  if (item.type === 3) {
    if (!quickActionValues.includes(item.name)) {
      customActionName.value = item.name;
      data.form.name = "__custom__";
      isCustomAction.value = true;
    } else {
      customActionName.value = "";
      isCustomAction.value = false;
    }
    initResourcePicker();
  } else {
    customActionName.value = "";
  }
  dialogShow.value = true;
};
/** 提交表单 */
const submitForm = async () => {
  const validate = await ruleFormRef.value.validate((valid: any) => {
    return valid;
  });
  if (!validate) {
    return;
  }

  if (data.form.type == 2 && data.form.icon_type >= 1 && !data.form.icon) {
    showToastFail("请选择菜单图标");
    return;
  }

  if (
    data.form.type == 3 &&
    data.form.name === "__custom__" &&
    !customActionName.value.trim()
  ) {
    showToastFail("请输入自定义按钮名称");
    return;
  }

  if (data.form.type == 3 && !data.form.resource_name) {
    showToastFail("请选择资源策略");
    return;
  }

  showLoading("正在处理");
  let requestMethod: any = null;
  let form: any = { ...data.form };
  // 按钮权限只提交必要字段
  if (form.type === 3) {
    delete form.route_name;
    delete form.addr;
    delete form.path;
    delete form.icon_type;
    delete form.icon;
    delete form.cache;
    delete form.short_name;
  }
  delete form.parent_type;
  // 替换自定义占位符为实际名称
  if (form.name === "__custom__") {
    form.name = customActionName.value;
  }
  // 新增
  if (!editId) {
    requestMethod = addMenu(form);
  } else {
    // 编辑
    requestMethod = editMenu(editId, form);
  }
  try {
    const { data: response } = await requestMethod;
    dialogShow.value = false;
    showToastOk(response.msg);
    queryAllMenu();
  } catch (error: any) {
    showToastFail(error.err_msg);
  }
};
/** 删除 */
const deleteSubmit = async (item: any) => {
  try {
    await ElMessageBox.confirm("确认删除该数据?", "确认消息", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch (error) {
    return;
  }

  showLoading("正在处理");
  try {
    const { data: response } = await delMenu(item.id);
    showToastOk(response.msg);
    queryAllMenu();
  } catch (error: any) {
    showToastFail(error.err_msg);
  }
};
/** 处理排序变化，当输入框失焦或按下回车时触发 */
const handleNumberChange = async (row: any) => {
  const originalValue = originalNumbers.value.get(row.id);
  const newValue = row.number;

  // 如果值没有变化，不做任何操作
  if (originalValue === newValue) {
    return;
  }

  // 验证排序值是否合法
  if (
    newValue === null ||
    newValue === undefined ||
    newValue < 0 ||
    newValue > 65535
  ) {
    showToastFail("排序值必须在0-65535之间");
    // 恢复原值
    row.number = originalValue || 0;
    return;
  }

  try {
    showLoading("更新排序中...");
    await updateMenuNumber(row.id, { number: newValue });
    originalNumbers.value.set(row.id, newValue);
    showToastOk("排序更新成功");
    queryAllMenu();
  } catch (error: any) {
    showToastFail(error.err_msg || "更新排序失败");
    row.number = originalValue || 0;
  }
};
/** 获取菜单列表 */
async function queryAllMenu() {
  loading.value = true;
  try {
    const { data: response } = await allMenu();
    const flatList = response.result || [];
    list.value = menuTreeHandler(flatList, 0);
    // 选择器过滤掉按钮权限
    selectMenus.value[0].children = menuTreeHandler(
      flatList.filter((item: any) => item.type !== 3),
      0,
    );
    console.log(list.value);

    // 保存原始排序值
    saveNumbers(response.result);
  } catch (error: any) {
    showToastFail(error.err_msg);
  } finally {
    loading.value = false;
  }
}
/** 保存所有菜单的原始排序值,用于后续比较是否发生变化 */
const saveNumbers = (rows: any[]) => {
  originalNumbers.value.clear();
  rows.forEach((item) => {
    originalNumbers.value.set(item.id, item.number || 0);
  });
};
/** 递归处理菜单树 */
function menuTreeHandler(arr: Array<any>, parseId: any) {
  let list: Array<any> = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (item.parent_id == parseId) {
      list.push({
        ...item,
        label: item.name,
        value: item.id,
        children: menuTreeHandler(arr, item.id),
      });
    }
  }

  return list;
}

queryAllMenu();
</script>
<style lang="scss" scoped>
.menus {
  position: absolute;
  inset: 0;
  margin: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.icon-select {
  max-height: 300px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  column-gap: 5px;
  row-gap: 5px;
  overflow-y: auto;
  .item {
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #e3e3e3;
    border-radius: 2px;
    cursor: pointer;
    user-select: none;
    &:hover {
      opacity: 0.8;
    }
    &:active {
      opacity: 0.7;
    }
  }
}

.resource-picker {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 10px;
  margin-left: 100px;
  margin-bottom: 15px;

  &__filters {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  &__pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
  }
}

.resource-picker-dir-count {
  font-size: 10px;
  color: #909399;
  background-color: #f4f4f5;
  border-radius: 8px;
  padding: 0 5px;
  line-height: 16px;
  margin-left: 6px;
}

:deep(.resource-picker-row--active) td {
  background-color: var(--el-color-primary-light-9) !important;
  font-weight: 600;
}

.action-name-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;

  code {
    font-family: "SFMono-Regular", Consolas, Menlo, monospace;
    font-size: 12px;
    color: var(--el-color-success);
    background-color: #f5f7fa;
    padding: 1px 6px;
    border-radius: 3px;
    cursor: pointer;
    user-select: all;

    &:hover {
      color: var(--el-color-primary);
    }
  }
}
</style>
