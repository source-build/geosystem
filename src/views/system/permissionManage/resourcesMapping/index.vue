<template>
  <div
    class="vertical-layout resources-mapping"
    @click="closeContextMenu"
    @contextmenu="closeContextMenu"
  >
    <div class="left-panel">
      <div class="panel-head">
        <h5 class="container-label">模块目录</h5>
        <el-button
          icon="Plus"
          size="small"
          text
          type="primary"
          @click="openNewModuleDialog"
        />
      </div>

      <div class="module-filter">
        <el-input
          prefix-icon="Search"
          clearable
          size="small"
          placeholder="搜索模块"
          v-model="moduleFilter"
        />
      </div>

      <div class="module-list-wrapper">
        <div
          class="module-item"
          :class="{ 'module-item--active': currentModuleId === 0 }"
          @click="handleSelectAll"
        >
          <div class="module-item__inner">
            <el-icon size="14" class="module-item__icon"><DataBoard /></el-icon>
            <span class="module-item__name">全部资源</span>
          </div>
          <span class="module-item__count">{{ totalResourceCount }}</span>
        </div>

        <el-tree
          ref="moduleTreeRef"
          :data="moduleTree"
          :props="{ label: 'name', children: 'children' }"
          node-key="id"
          highlight-current
          default-expand-all
          :expand-on-click-node="false"
          :filter-node-method="filterModuleNode"
          @node-click="handleModuleClick"
        >
          <template #default="{ node }">
            <div
              class="module-item"
              @contextmenu.prevent="handleDirContextMenu($event, node.data)"
            >
              <div class="module-item__inner">
                <el-icon size="14" class="module-item__icon">
                  <FolderOpened v-if="node.expanded" />
                  <Folder v-else />
                </el-icon>
                <span class="module-item__name">{{ node.data.name }}</span>
              </div>
              <span class="module-item__count">
                {{ node.data.resource_count || 0 }}
              </span>
            </div>
          </template>
        </el-tree>
      </div>
    </div>

    <!-- 目录右键菜单 -->
    <div
      v-if="contextMenuShow"
      class="dir-context-menu"
      :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
    >
      <div class="dir-context-menu__item" @click="handleContextEdit">
        <el-icon size="14"><Edit /></el-icon>
        <span>重命名</span>
      </div>
      <div class="dir-context-menu__item" @click="handleContextAdd">
        <el-icon size="14"><Plus /></el-icon>
        <span>新增子目录</span>
      </div>
      <div
        class="dir-context-menu__item dir-context-menu__item--danger"
        :class="{ 'dir-context-menu__item--disabled': contextMenuHasChildren }"
        @click="handleContextDelete"
      >
        <el-icon size="14"><Delete /></el-icon>
        <span>删除目录</span>
      </div>
    </div>

    <div class="right-panel">
      <el-alert
        title="此页面维护系统API接口资源的映射关系，方便非开发人员理解权限含义，请谨慎操作。"
        effect="dark"
        style="margin-bottom: 10px"
        color="#fff"
        show-icon
        :closable="false"
      >
        <template #icon><Bell /></template>
      </el-alert>

      <div class="card">
        <div class="container-head justify-between pb-[10px]">
          <h5 class="container-label !mb-0">
            {{ currentModuleLabel }}
            <span v-if="resourceList.length > 0" class="count-text"
              >({{ resourceList.length }})</span
            >
          </h5>
          <div class="flex items-center">
            <el-input
              prefix-icon="Search"
              clearable
              placeholder="搜索API路径 / 资源名称"
              v-model="searchKeyword"
              style="width: 220px; margin-right: 10px"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
            <el-button @click="handleSearch">查询</el-button>
            <el-button
              type="primary"
              @click="openNewDialog"
              :disabled="!currentModuleId"
              >新增映射</el-button
            >
            <el-button
              type="success"
              @click="openBatchDialog"
              :disabled="!currentModuleId"
              >批量新增</el-button
            >
            <el-button icon="RefreshRight" circle @click="loadResourceList" />
          </div>
        </div>

        <div class="flex-1" style="min-height: 0">
          <el-table
            v-loading="loading"
            :data="resourceList"
            row-key="id"
            style="width: 100%; height: 100%"
          >
            <el-table-column
              show-overflow-tooltip
              min-width="230"
              label="资源名称"
              prop="name"
              align="left"
            >
              <template #default="{ row }">
                <span>{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column
              align="left"
              show-overflow-tooltip
              min-width="220"
              label="资源描述"
              prop="describe"
            />
            <el-table-column
              align="left"
              show-overflow-tooltip
              min-width="300"
              label="API路径"
              prop="path"
            >
              <template #default="{ row }">
                <span class="api-path-text" @click="copyText(row.path)">{{
                  row.path
                }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" min-width="160" label="请求方法">
              <template #default="{ row }">
                <template
                  v-for="(m, idx) in parseMethodStr(row.method)"
                  :key="idx"
                >
                  <el-tag
                    :type="getMethodTagType(m)"
                    size="small"
                    effect="dark"
                    style="margin: 1px 2px"
                  >
                    {{ m }}
                  </el-tag>
                </template>
              </template>
            </el-table-column>

            <el-table-column align="center" min-width="90" label="风险等级">
              <template #default="{ row }">
                <el-tag
                  v-if="row.risk_level === 1"
                  type="danger"
                  size="small"
                  effect="plain"
                  >高风险</el-tag
                >
                <el-tag v-else type="info" size="small" effect="plain"
                  >无</el-tag
                >
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              width="80"
              label="状态"
              fixed="right"
            >
              <template #default="{ row }">
                <f-status-badge
                  v-if="row.status === 1"
                  text="启用"
                  type="success"
                  plain
                />
                <f-status-badge v-else text="禁用" type="danger" plain />
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              align="center"
              width="200"
              fixed="right"
            >
              <template #default="scope">
                <el-button
                  size="small"
                  link
                  type="info"
                  icon="CopyDocument"
                  @click="openCopyDialog(scope.row)"
                  >复制</el-button
                >
                <el-button
                  size="small"
                  link
                  type="primary"
                  icon="Edit"
                  @click="openEditDialog(scope.row)"
                  >修改</el-button
                >
                <el-button
                  size="small"
                  link
                  type="danger"
                  icon="Delete"
                  @click="deleteSubmit(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 新增/编辑模块目录弹窗 -->
    <el-dialog
      v-model="moduleDialogShow"
      :title="moduleDialogType === 0 ? '新增模块目录' : '编辑模块目录'"
      destroy-on-close
      append-to-body
      width="480px"
    >
      <el-form
        ref="moduleFormRef"
        :model="moduleForm"
        :rules="moduleRules"
        label-width="80px"
      >
        <el-form-item label="上级目录" prop="parent_id">
          <el-tree-select
            check-strictly
            v-model="moduleForm.parent_id"
            node-key="id"
            :data="moduleTreeSelectData"
            :render-after-expand="false"
            :props="{ label: 'name', children: 'children' }"
            default-expand-all
            placeholder="根目录"
            :disabled="moduleDialogType === 1"
          />
        </el-form-item>
        <el-form-item label="目录名称" prop="name">
          <el-input
            v-model="moduleForm.name"
            placeholder="请输入模块目录名称"
            maxlength="128"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="描述" prop="describe">
          <el-input
            v-model="moduleForm.describe"
            placeholder="请输入目录描述"
            maxlength="255"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="moduleDialogShow = false">取 消</el-button>
          <el-button
            type="primary"
            @click="submitModuleForm"
            :loading="moduleSubmitLoading"
            >确认</el-button
          >
        </div>
      </template>
    </el-dialog>

    <!-- 批量新增资源映射弹窗 -->
    <el-dialog
      v-model="batchDialogShow"
      title="批量新增资源映射"
      destroy-on-close
      append-to-body
      width="1100px"
      :close-on-click-modal="false"
    >
      <div class="batch-dialog-body">
        <!-- 左侧：API路由选择 -->
        <div class="batch-left">
          <div class="batch-left__header">
            <el-input
              prefix-icon="Search"
              clearable
              size="small"
              placeholder="搜索服务名称或API路径"
              v-model="batchSearch"
            />
            <span class="batch-left__hint">勾选路由添加至右侧</span>
          </div>
          <div class="batch-left__content">
            <div class="batch-service-list">
              <div
                class="batch-service-item"
                v-for="item in batchFilteredServiceList"
                :key="item.service"
                :class="{
                  'batch-service-item--active':
                    batchActiveService === item.service,
                }"
                @click="batchActiveService = item.service"
              >
                <div class="batch-service-item__text">
                  <span class="batch-service-item__label">{{
                    item.serviceName
                  }}</span>
                  <span class="batch-service-item__key">{{
                    item.service
                  }}</span>
                </div>
                <span class="batch-service-item__count">{{
                  item.routes.length
                }}</span>
              </div>
              <div
                v-if="batchFilteredServiceList.length === 0"
                class="panel-empty"
              >
                无匹配服务
              </div>
            </div>
            <div class="batch-route-list">
              <div
                class="batch-route-list__header"
                v-if="batchActiveService && !batchSearch"
              >
                <span class="batch-route-list__service">
                  {{
                    apiResourceList.find(
                      (s) => s.service === batchActiveService,
                    )?.serviceName
                  }}
                </span>
                <span class="batch-route-list__divider">/</span>
                <span class="batch-route-list__key">{{
                  batchActiveService
                }}</span>
                <span class="batch-route-list__total"
                  >共 {{ batchFilteredRoutes.length }} 个接口</span
                >
              </div>
              <div class="batch-route-list__body">
                <el-checkbox-group
                  v-model="batchCheckedKeys"
                  @change="handleBatchCheckChange"
                >
                  <div
                    class="batch-route-item"
                    v-for="(route, idx) in batchFilteredRoutes"
                    :key="route.method + ':' + route.path + idx"
                  >
                    <el-checkbox
                      :label="route.method + ':' + route.path"
                      :value="route.method + ':' + route.path"
                    >
                      <span class="batch-route-item__inner">
                        <span
                          class="batch-route-item__method"
                          :class="'method-' + route.method.toLowerCase()"
                          >{{ route.method }}</span
                        >
                        <span class="batch-route-item__path">{{
                          route.path
                        }}</span>
                      </span>
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
                <div
                  v-if="batchFilteredRoutes.length === 0"
                  class="panel-empty"
                >
                  <template v-if="!batchActiveService && !batchSearch"
                    >请先选择左侧服务</template
                  >
                  <template v-else>无匹配的API路由</template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：已选路由表单列表 -->
        <div class="batch-right">
          <div class="batch-right__header">
            <span class="batch-right__title"
              >已选资源（{{ batchItems.length }}）</span
            >
            <span class="batch-right__hint">请为每个资源填写信息</span>
          </div>
          <div class="batch-right__body" v-if="batchItems.length > 0">
            <div
              class="batch-form-card"
              v-for="(item, index) in batchItems"
              :key="item._uid"
            >
              <div class="batch-form-card__head">
                <div class="batch-form-card__api">
                  <span
                    class="batch-route-item__method"
                    :class="'method-' + item.method[0]?.toLowerCase()"
                    style="transform: scale(0.85)"
                    >{{ item.method[0] }}</span
                  >
                  <span class="batch-form-card__path">{{ item.path }}</span>
                </div>
                <el-button
                  link
                  type="danger"
                  icon="Delete"
                  @click="removeBatchItem(index)"
                />
              </div>
              <el-form
                :model="item"
                :rules="batchItemRules"
                label-width="auto"
                size="small"
                :ref="
                  (el: any) => {
                    if (el) batchFormRefs[item._uid] = el;
                  }
                "
              >
                <el-row :gutter="12">
                  <el-col :span="12">
                    <el-form-item label="资源名称" prop="name">
                      <el-input
                        v-model="item.name"
                        placeholder="首字母大写 仅支持英文和下划线"
                        maxlength="128"
                        @input="
                          item.name = item.name.replace(/[^a-zA-Z_]/g, '')
                        "
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="所属模块" prop="parent_id">
                      <el-tree-select
                        check-strictly
                        v-model="item.parent_id"
                        node-key="id"
                        :data="moduleTreeSelectData"
                        :render-after-expand="false"
                        :props="{ label: 'name', children: 'children' }"
                        default-expand-all
                        placeholder="请选择"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="资源描述" prop="describe">
                      <el-input
                        v-model="item.describe"
                        placeholder="例如：查询用户列表的权限"
                        maxlength="255"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="风险等级" prop="risk_level">
                      <el-select v-model="item.risk_level" style="width: 100%">
                        <el-option label="无" :value="0" />
                        <el-option label="高风险" :value="1" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="状态" prop="status">
                      <el-select v-model="item.status" style="width: 100%">
                        <el-option label="启用" :value="1" />
                        <el-option label="禁用" :value="2" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </div>
          <div v-else class="panel-empty" style="height: 200px">
            请从左侧勾选API路由
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchDialogShow = false">取 消</el-button>
          <el-button
            type="primary"
            @click="submitBatchForm"
            :loading="batchSubmitLoading"
            :disabled="batchItems.length === 0"
          >
            确认提交（{{ batchItems.length }} 项）
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增/编辑资源映射弹窗 -->
    <el-dialog
      v-model="dialogShow"
      :title="dialogType === 0 ? '新增资源映射' : '编辑资源映射'"
      destroy-on-close
      append-to-body
      width="860px"
    >
      <el-form
        ref="ruleFormRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="所属模块" prop="parent_id">
              <el-tree-select
                check-strictly
                v-model="form.parent_id"
                node-key="id"
                :data="moduleTreeSelectData"
                :render-after-expand="false"
                :props="{ label: 'name', children: 'children' }"
                default-expand-all
                placeholder="请选择所属模块"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资源名称" prop="name">
              <el-input
                v-model="form.name"
                placeholder="首字母大写,驼峰,仅支持英文和下划线"
                maxlength="128"
                show-word-limit
                @input="form.name = form.name.replace(/[^a-zA-Z_]/g, '')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资源描述" prop="describe">
              <el-input
                v-model="form.describe"
                type="textarea"
                :rows="1"
                resize="none"
                placeholder="例如：查询用户列表的权限"
                maxlength="255"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="风险等级" prop="risk_level">
              <el-select
                v-model="form.risk_level"
                placeholder="请选择风险等级"
                style="width: 100%"
              >
                <el-option label="无" :value="0" />
                <el-option label="高风险" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="API路径" prop="path">
              <el-input
                v-model="form.path"
                placeholder="例如：/api/v1/user/list"
                maxlength="512"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求方法" prop="method">
              <el-select
                v-model="form.method"
                placeholder="请选择请求方法"
                style="width: 100%"
                multiple
                collapse-tags
                collapse-tags-tooltip
              >
                <el-option label="GET" value="GET" />
                <el-option label="POST" value="POST" />
                <el-option label="PUT" value="PUT" />
                <el-option label="DELETE" value="DELETE" />
                <el-option label="PATCH" value="PATCH" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="api-quick-select">
          <div
            class="api-quick-select__header"
            @click="apiQuickPanelVisible = !apiQuickPanelVisible"
          >
            <span class="api-quick-select__title">
              <el-icon size="14"><Grid /></el-icon>
              快速选择API路径
            </span>
            <el-icon
              size="14"
              class="api-quick-select__arrow"
              :class="{ 'is-open': apiQuickPanelVisible }"
            >
              <ArrowDown />
            </el-icon>
          </div>
          <div class="api-quick-select__body" v-show="apiQuickPanelVisible">
            <div class="api-quick-select__toolbar">
              <el-input
                prefix-icon="Search"
                clearable
                size="small"
                placeholder="搜索服务名称或API路径"
                v-model="apiQuickSearch"
                style="width: 240px"
              />
              <span class="api-quick-select__hint"
                >点击路由自动填入上方表单</span
              >
            </div>
            <div class="api-quick-select__content">
              <div class="service-list">
                <div
                  class="service-item"
                  v-for="item in filteredServiceList"
                  :key="item.service"
                  :class="{
                    'service-item--active': activeServiceName === item.service,
                  }"
                  @click="activeServiceName = item.service"
                >
                  <div class="service-item__text">
                    <span class="service-item__label">{{
                      item.serviceName
                    }}</span>
                    <span class="service-item__key">{{ item.service }}</span>
                  </div>
                  <span class="service-item__count">{{
                    item.routes?.length ?? 0
                  }}</span>
                </div>
                <div
                  v-if="filteredServiceList.length === 0"
                  class="panel-empty"
                >
                  无匹配服务
                </div>
              </div>
              <div class="route-list">
                <div
                  class="route-list__header"
                  v-if="activeServiceName && !apiQuickSearch"
                >
                  <span class="route-list__service">{{
                    apiResourceList.find((s) => s.service === activeServiceName)
                      ?.serviceName
                  }}</span>
                  <span class="route-list__divider">/</span>
                  <span class="route-list__key">{{ activeServiceName }}</span>
                  <span class="route-list__total"
                    >共 {{ filteredRoutes.length }} 个接口</span
                  >
                </div>
                <div class="route-list__body">
                  <div
                    class="route-item"
                    v-for="(route, idx) in filteredRoutes"
                    :key="route.path + idx"
                    :class="{
                      'route-item--selected':
                        form.path === route.method + ':' + route.path,
                    }"
                    @click="handleSelectRoute(route)"
                  >
                    <span
                      class="route-item__method"
                      :class="'method-' + route.method.toLowerCase()"
                    >
                      {{ route.method }}
                    </span>
                    <span class="route-item__path">{{ route.path }}</span>
                  </div>
                  <div v-if="filteredRoutes.length === 0" class="panel-empty">
                    <template v-if="!activeServiceName && !apiQuickSearch"
                      >请先选择左侧服务</template
                    >
                    <template v-else>无匹配的API路由</template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <el-row :gutter="20" style="margin-top: 12px">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :value="1">启用</el-radio>
                <el-radio :value="2">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="number">
              <el-input-number
                v-model="form.number"
                :min="1"
                :max="1000000"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogShow = false">取 消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading"
            >确认</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="resourcesMapping">
import { ElMessageBox, FormInstance, FormRules } from "element-plus";
import { listToTreeOptimized } from "@/utils/array";
import {
  queryResourceMappingList,
  createResourceMapping,
  editResourceMapping,
  deleteResourceMapping,
  queryResourceMappingDirectoryList,
  createResourceMappingDirectory,
  queryAPIResourceList,
} from "@/api/system/permissionManage";

const loading = ref(false); // 资源列表加载状态
const searchKeyword = ref(""); // 搜索关键词（匹配API路径、资源名称、描述）
const resourceList = ref<any[]>([]); // 资源映射列表（仅 type=2 的资源记录）
const totalResourceCount = ref(0); // 全部资源总数（用于"全部资源"角标，不随模块筛选变化）
const dirList = ref<any[]>([]); // 模块目录列表（type=1 的目录记录，扁平结构）

const apiResourceList = ref<
  {
    service: string;
    serviceName: string;
    routes: { path: string; method: string }[];
  }[]
>([]); // 后端API资源列表，按服务分组
const apiQuickPanelVisible = ref(true); // 快速选择API路径面板展开状态
const apiQuickSearch = ref(""); // API快速选择面板的搜索关键词
const activeServiceName = ref(""); // API面板当前选中的服务名

// ─── 批量新增相关状态 ───
const batchDialogShow = ref(false); // 批量新增弹窗显示状态
const batchSearch = ref(""); // 批量面板搜索关键词
const batchActiveService = ref(""); // 批量面板当前选中服务
const batchCheckedKeys = ref<string[]>([]); // 批量面板已勾选的路由 key（格式 "METHOD:path"）
const batchItems = ref<any[]>([]); // 批量新增的表单数据列表
const batchFormRefs = reactive<Record<string, any>>({}); // 批量表单引用映射
const batchSubmitLoading = ref(false); // 批量提交loading
let batchUid = 0; // 批量项唯一ID计数器
const batchItemRules = reactive<FormRules>({
  parent_id: [{ required: true, message: "请选择所属模块", trigger: "change" }],
  name: [{ required: true, message: "请输入资源名称", trigger: "blur" }],
  path: [{ required: true, message: "请输入API路径", trigger: "blur" }],
});

const currentModuleId = ref<number>(0); // 当前选中的模块目录ID，0 表示"全部资源"
const moduleTreeRef = ref<any>(null); // 模块目录树组件引用
const moduleFilter = ref(""); // 模块目录树搜索关键词

const moduleDialogShow = ref(false); // 模块目录弹窗显示状态
const moduleDialogType = ref(0); // 模块目录弹窗类型：0=新增，1=编辑
let editModuleId: number | null = null; // 正在编辑的目录ID
const moduleSubmitLoading = ref(false); // 模块目录表单提交loading
const moduleFormRef = ref<FormInstance>(); // 模块目录表单引用
const moduleFormInit = { parent_id: 0, name: "", describe: "", number: 1 }; // 模块目录表单初始值
const moduleForm = reactive({ ...moduleFormInit }); // 模块目录表单数据
const moduleRules = reactive<FormRules>({
  name: [{ required: true, message: "请输入目录名称", trigger: "blur" }],
  number: [{ required: true, message: "请输入排序", trigger: "blur" }],
});

const dialogShow = ref(false); // 资源映射弹窗显示状态
const dialogType = ref(0); // 资源映射弹窗类型：0=新增，1=编辑
let editResourceId: number | null = null; // 正在编辑的资源映射ID
const submitLoading = ref(false); // 资源映射表单提交loading
const ruleFormRef = ref<FormInstance>(); // 资源映射表单引用
const formInit = {
  parent_id: 0,
  name: "",
  path: "",
  describe: "",
  method: [] as string[],
  number: 1,
  status: 1 as 1 | 2,
  risk_level: 0 as 0 | 1,
}; // 资源映射表单初始值
const form = reactive({ ...formInit }); // 资源映射表单数据
const rules = reactive<FormRules>({
  parent_id: [{ required: true, message: "请选择所属模块", trigger: "change" }],
  name: [{ required: true, message: "请输入资源名称", trigger: "blur" }],
  path: [{ required: true, message: "请输入API路径", trigger: "blur" }],
  method: [{ required: true, message: "请输入请求方法", trigger: "blur" }],
  number: [{ required: true, message: "请输入排序", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
});

/** 按搜索关键词过滤后的API服务列表（有搜索词时只显示有匹配路由的服务） */
const filteredServiceList = computed(() => {
  const keyword = apiQuickSearch.value.trim().toLowerCase();
  if (!keyword) return apiResourceList.value;
  return apiResourceList.value.filter((item) => {
    if (item.service.toLowerCase().includes(keyword)) return true;
    if (item.serviceName.toLowerCase().includes(keyword)) return true;
    return item.routes.some(
      (r) =>
        r.path.toLowerCase().includes(keyword) ||
        r.method.toLowerCase().includes(keyword),
    );
  });
});
/** 当前选中服务下过滤后的API路由列表 */
const filteredRoutes = computed(() => {
  const keyword = apiQuickSearch.value.trim().toLowerCase();

  // 有搜索关键词时：如果选中了服务，只显示该服务的匹配路由；否则显示全部匹配路由
  if (keyword) {
    const sourceList = activeServiceName.value
      ? apiResourceList.value.filter(
          (s) => s.service === activeServiceName.value,
        )
      : filteredServiceList.value;
    const result: { path: string; method: string }[] = [];
    for (const svc of sourceList) {
      for (const r of svc.routes) {
        if (
          r.path.toLowerCase().includes(keyword) ||
          r.method.toLowerCase().includes(keyword) ||
          svc.service.toLowerCase().includes(keyword) ||
          svc.serviceName.toLowerCase().includes(keyword)
        ) {
          result.push(r);
        }
      }
    }
    return result;
  }

  // 无搜索关键词：显示选中服务的全部路由
  if (!activeServiceName.value) return [];
  return (
    apiResourceList.value.find((s) => s.service === activeServiceName.value)
      ?.routes || []
  );
});
/** 模块目录树结构（由扁平列表转换） */
const moduleTree = computed(() => listToTreeOptimized(dirList.value));

/** ─── 批量新增相关计算属性 ─── */
/** 批量面板：按搜索关键词过滤后的API服务列表 */
const batchFilteredServiceList = computed(() => {
  const keyword = batchSearch.value.trim().toLowerCase();
  if (!keyword) return apiResourceList.value;
  return apiResourceList.value.filter((item) => {
    if (item.service.toLowerCase().includes(keyword)) return true;
    if (item.serviceName.toLowerCase().includes(keyword)) return true;
    return item.routes.some(
      (r) =>
        r.path.toLowerCase().includes(keyword) ||
        r.method.toLowerCase().includes(keyword),
    );
  });
});
/** 批量面板：当前选中服务下过滤后的路由列表 */
const batchFilteredRoutes = computed(() => {
  const keyword = batchSearch.value.trim().toLowerCase();
  if (keyword) {
    const sourceList = batchActiveService.value
      ? apiResourceList.value.filter(
          (s) => s.service === batchActiveService.value,
        )
      : batchFilteredServiceList.value;
    const result: { path: string; method: string }[] = [];
    for (const svc of sourceList) {
      for (const r of svc.routes) {
        if (
          r.path.toLowerCase().includes(keyword) ||
          r.method.toLowerCase().includes(keyword) ||
          svc.service.toLowerCase().includes(keyword) ||
          svc.serviceName.toLowerCase().includes(keyword)
        ) {
          result.push(r);
        }
      }
    }
    return result;
  }
  if (!batchActiveService.value) return [];
  return (
    apiResourceList.value.find((s) => s.service === batchActiveService.value)
      ?.routes || []
  );
});
/** 模块目录树选择器数据（含"根目录"虚拟节点） */
const moduleTreeSelectData = computed(() => [
  {
    id: 0,
    name: "根目录",
    value: 0,
    children: listToTreeOptimized(dirList.value),
  },
]);
/** 当前选中模块的名称，用于右侧面板标题 */
const currentModuleLabel = computed(() => {
  if (!currentModuleId.value) return "全部资源";
  const mod = dirList.value.find((m) => m.id === currentModuleId.value);
  return mod ? mod.name : "全部资源";
});
/** 根据HTTP方法名返回对应的Tag颜色类型 */
const getMethodTagType = computed(() => {
  return (method: string) => {
    const map: Record<string, string> = {
      GET: "success",
      POST: "primary",
      PUT: "warning",
      DELETE: "danger",
      PATCH: "info",
      HEAD: "info",
      OPTIONS: "warning",
    };
    return map[method.toUpperCase()] || "info";
  };
});

// 监听模块搜索关键词变化，过滤目录树节点
watch(moduleFilter, (val) => {
  moduleTreeRef.value?.filter(val);
});

/** 模块目录树节点过滤方法，按名称模糊匹配 */
const filterModuleNode = (value: string, data: any) => {
  if (!value) return true;
  return data.name.toLowerCase().includes(value.toLowerCase());
};

/** 将后端 method 字符串解析为数组，如 "(GET)|(POST)" → ["GET","POST"]，"GET" → ["GET"] */
const parseMethodStr = (str: string): string[] => {
  if (!str) return [];
  if (str.includes(")|(")) {
    return str.split(")|(").map((s) => s.replace(/^\(|\)$/g, ""));
  }
  return [str.replace(/^\(|\)$/g, "")];
};

/** 复制文本到剪贴板 */
const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    showToastOk("复制成功");
  } catch (err) {
    showToastFail("复制失败" + err);
  }
};

/** 点击"全部资源"，清除模块筛选和搜索关键词，重新加载列表 */
const handleSelectAll = () => {
  closeContextMenu();
  currentModuleId.value = 0;
  searchKeyword.value = "";
  moduleTreeRef.value?.setCurrentKey(null);
  loadResourceList();
};

/** 点击模块目录树节点，切换当前选中模块，清除搜索并重新加载列表 */
const handleModuleClick = (data: any) => {
  closeContextMenu();
  currentModuleId.value = data.id;
  searchKeyword.value = "";
  loadResourceList();
};

/** 触发搜索，将 keyword 传给后端重新请求列表 */
const handleSearch = () => {
  loadResourceList();
};

/** 在快速选择面板中点击API路由，自动填入表单的path和method字段 */
const handleSelectRoute = (route: { path: string; method: string }) => {
  form.path = route.path;
  form.method = [route.method];
};

/** 右键菜单状态 */
const contextMenuShow = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const contextMenuData = ref<any>(null);
/** 右键目标目录是否有子元素（子目录或子资源） */
const contextMenuHasChildren = computed(() => {
  const data = contextMenuData.value;
  if (!data) return false;
  // 有子目录
  if (dirList.value.some((d: any) => d.parent_id === data.id)) return true;
  // 有子资源
  if (data.resource_count > 0) return true;
  return false;
});

/** 右键目录节点 */
const handleDirContextMenu = (e: MouseEvent, data: any) => {
  e.stopPropagation(); // 阻止冒泡到根容器关闭菜单
  contextMenuData.value = data;
  contextMenuX.value = e.clientX;
  contextMenuY.value = e.clientY;
  contextMenuShow.value = true;
};

/** 关闭右键菜单 */
const closeContextMenu = () => {
  contextMenuShow.value = false;
};

/** 右键菜单 - 编辑 */
const handleContextEdit = () => {
  const data = contextMenuData.value;
  closeContextMenu();
  openEditModuleDialog(data);
};

/** 右键菜单 - 新增子目录 */
const handleContextAdd = () => {
  const data = contextMenuData.value;
  closeContextMenu();
  moduleDialogType.value = 0;
  editModuleId = null;
  Object.assign(moduleForm, { ...moduleFormInit, parent_id: data.id });
  moduleDialogShow.value = true;
};

/** 右键菜单 - 删除 */
const handleContextDelete = () => {
  if (contextMenuHasChildren.value) {
    showToastFail("该目录下存在子目录或资源，无法删除");
    closeContextMenu();
    return;
  }
  const data = contextMenuData.value;
  closeContextMenu();
  handleDeleteModule(data);
};

// 页面初始化
onMounted(() => {
  loadDirList();
  loadResourceList();
  loadAPIResourceList();
});

/** 打开编辑目录弹窗 */
const openEditModuleDialog = (item: any) => {
  moduleDialogType.value = 1;
  editModuleId = item.id;
  Object.assign(moduleForm, {
    parent_id: item.parent_id || 0,
    name: item.name,
    describe: item.describe || "",
    number: item.number || 1,
  });
  moduleDialogShow.value = true;
};

/** 删除目录 */
const handleDeleteModule = async (item: any) => {
  try {
    await ElMessageBox.confirm(
      `确认删除目录「${item.name}」？该目录下的资源也会被一并删除。`,
      "确认删除",
      { confirmButtonText: "确认", cancelButtonText: "取消", type: "warning" },
    );
  } catch {
    return;
  }
  showLoading();
  try {
    await deleteResourceMapping(item.id);
    showToastOk("删除成功");
    // 如果删除的是当前选中的模块，切回全部
    if (currentModuleId.value === item.id) {
      currentModuleId.value = 0;
    }
    await Promise.all([loadDirList(), loadResourceList(), refreshTotalCount()]);
  } catch (err: any) {
    showToastFail(err.err_msg || "删除失败");
  } finally {
    hideLoading();
  }
};

/** 打开新增模块目录弹窗，预填当前选中的模块作为上级目录 */
const openNewModuleDialog = () => {
  moduleDialogType.value = 0;
  editModuleId = null;
  Object.assign(moduleForm, {
    ...moduleFormInit,
    parent_id: currentModuleId.value || 0,
  });
  moduleDialogShow.value = true;
};

/** 提交模块目录表单（新增/编辑），成功后刷新目录列表 */
const submitModuleForm = async () => {
  const validate = await moduleFormRef.value?.validate(
    (valid: boolean) => valid,
  );
  if (!validate) return;
  moduleSubmitLoading.value = true;
  try {
    if (moduleDialogType.value === 0) {
      await createResourceMappingDirectory({
        number: moduleForm.number,
        parent_id: moduleForm.parent_id,
        name: moduleForm.name,
        describe: moduleForm.describe,
      });
      showToastOk("新增目录成功");
    } else {
      await editResourceMapping(editModuleId!, {
        type: 1,
        number: moduleForm.number,
        parent_id: moduleForm.parent_id,
        name: moduleForm.name,
        describe: moduleForm.describe,
      });
      showToastOk("编辑目录成功");
    }
    moduleDialogShow.value = false;
    await Promise.all([loadDirList(), loadResourceList(), refreshTotalCount()]);
  } catch (err: any) {
    showToastFail(err.err_msg || "操作失败");
  } finally {
    moduleSubmitLoading.value = false;
  }
};

/** 打开新增资源映射弹窗，预填当前选中的模块ID */
const openNewDialog = () => {
  dialogType.value = 0;
  editResourceId = null;
  Object.assign(form, { ...formInit, parent_id: currentModuleId.value });
  dialogShow.value = true;
};

/** 打开编辑资源映射弹窗，用当前行数据填充表单 */
const openEditDialog = (row: any) => {
  dialogType.value = 1;
  editResourceId = row.id;
  Object.assign(form, {
    parent_id: row.parent_id,
    name: row.name,
    path: row.path,
    describe: row.describe,
    method: parseMethodStr(row.method),
    number: row.number,
    status: row.status,
    risk_level: row.risk_level ?? 0,
  });
  dialogShow.value = true;
};

/** 打开复制弹窗，用当前行数据填充表单 */
const openCopyDialog = async (row: any) => {
  dialogType.value = 0;
  editResourceId = null;
  Object.assign(form, {
    ...formInit,
    parent_id: row.parent_id,
    number: row.number,
    status: row.status,
    path: row.path,
    method: parseMethodStr(row.method),
  });
  console.log(row);

  dialogShow.value = true;
};

/** 打开批量新增弹窗，重置所有批量状态 */
const openBatchDialog = () => {
  batchSearch.value = "";
  batchActiveService.value = "";
  batchCheckedKeys.value = [];
  batchItems.value = [];
  batchSubmitLoading.value = false;
  batchUid = 0;
  // 默认选中第一个服务
  if (apiResourceList.value.length) {
    nextTick(() => {
      batchActiveService.value = apiResourceList.value[0].service;
    });
  }
  batchDialogShow.value = true;
};

/** 批量面板勾选变化时，同步 batchItems（增量添加，取消勾选则移除） */
const handleBatchCheckChange = (keys: string[]) => {
  const currentKeySet = new Set(batchItems.value.map((item) => item._key));
  const newKeySet = new Set(keys);

  // 移除已取消勾选的项
  batchItems.value = batchItems.value.filter((item) =>
    newKeySet.has(item._key),
  );

  // 新增勾选的项
  for (const key of keys) {
    if (!currentKeySet.has(key)) {
      const colonIdx = key.indexOf(":");
      const method = key.substring(0, colonIdx);
      const path = key.substring(colonIdx + 1);
      batchItems.value.push({
        _uid: ++batchUid,
        _key: key,
        parent_id: currentModuleId.value,
        name: "",
        path,
        describe: "",
        method: [method],
        number: 1,
        status: 1 as 1 | 2,
        risk_level: 0 as 0 | 1,
      });
    }
  }
};

/** 移除批量表单中的某一项，同时取消勾选 */
const removeBatchItem = (index: number) => {
  const removed = batchItems.value.splice(index, 1)[0];
  if (removed) {
    batchCheckedKeys.value = batchCheckedKeys.value.filter(
      (k) => k !== removed._key,
    );
  }
};

/** 提交批量新增表单，逐条校验后依次调用接口，间隔500ms */
const submitBatchForm = async () => {
  // 校验所有表单
  const validateResults = await Promise.all(
    batchItems.value.map((item) => {
      const formRef = batchFormRefs[item._uid];
      return formRef
        ? formRef.validate().then(
            () => true,
            () => false,
          )
        : Promise.resolve(false);
    }),
  );
  if (validateResults.some((v) => !v)) {
    showToastFail("请检查表单，确保所有必填项已填写");
    return;
  }

  batchSubmitLoading.value = true;
  let successCount = 0;
  let failCount = 0;

  showLoading("正在批量新增资源...");
  for (let i = 0; i < batchItems.value.length; i++) {
    const item = batchItems.value[i];
    try {
      await createResourceMapping({
        type: 2,
        parent_id: item.parent_id,
        name: item.name,
        path: item.path,
        describe: item.describe,
        method: item.method,
        number: item.number,
        status: item.status,
        risk_level: item.risk_level,
      });
      successCount++;
    } catch {
      failCount++;
    }
    // 非最后一项时等待500ms
    if (i < batchItems.value.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  batchSubmitLoading.value = false;

  if (failCount === 0) {
    showToastOk(`批量新增成功，共 ${successCount} 条`);
    batchDialogShow.value = false;
    await Promise.all([loadDirList(), loadResourceList(), refreshTotalCount()]);
  } else {
    showToastFail(`新增完成：成功 ${successCount} 条，失败 ${failCount} 条`);
    await Promise.all([loadDirList(), loadResourceList(), refreshTotalCount()]);
  }
};

/** 提交资源映射表单（新增或编辑），成功后刷新目录和资源列表 */
const submitForm = async () => {
  const validate = await ruleFormRef.value?.validate((valid: any) => valid);
  if (!validate) return;

  submitLoading.value = true;
  try {
    const payload = { ...form, type: 2 };
    if (dialogType.value === 0) {
      await createResourceMapping(payload);
      showToastOk("新增成功");
    } else {
      await editResourceMapping(editResourceId!, payload);
      showToastOk("编辑成功");
    }
    dialogShow.value = false;
    await Promise.all([loadDirList(), loadResourceList(), refreshTotalCount()]);
  } catch (err: any) {
    showToastFail("操作失败 " + err.err_msg);
  } finally {
    submitLoading.value = false;
  }
};

/** 确认删除资源映射记录，成功后刷新目录和资源列表 */
const deleteSubmit = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      "确认删除该资源？删除后角色管理、权限配置等将受到影响。",
      "确认消息",
      {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
      },
    );
  } catch (error) {
    return;
  }
  showLoading();
  try {
    await deleteResourceMapping(row.id);
    showToastOk("删除成功");
    await Promise.all([loadDirList(), loadResourceList(), refreshTotalCount()]);
  } catch (err: any) {
    showToastFail("删除失败 " + err.err_msg);
  }
};

/** 加载模块目录列表（扁平结构） */
async function loadDirList() {
  try {
    const { data: response }: any = await queryResourceMappingDirectoryList();
    if (response.result && response.result.length) {
      dirList.value = response.result;
    }
  } catch {}
}

/** 加载资源映射列表，仅筛选 type=2 的资源记录，支持 keyword 和 parent_id 后端筛选 */
async function loadResourceList() {
  loading.value = true;
  try {
    const keyword = searchKeyword.value.trim();
    const parent_id = currentModuleId.value || undefined;
    const params: { keyword?: string; parent_id?: number } = {};
    if (keyword) params.keyword = keyword;
    if (parent_id) params.parent_id = parent_id;
    const { data: response }: any = await queryResourceMappingList(
      Object.keys(params).length ? params : undefined,
    );
    const rows = response.result || [];
    const filtered = rows.filter((item: any) => item.type === 2);
    resourceList.value = filtered;
    // 无模块筛选时更新全部资源总数
    if (!currentModuleId.value) {
      totalResourceCount.value = filtered.length;
    }
  } catch {
  } finally {
    loading.value = false;
  }
}

/** 仅刷新"全部资源"总数，用于变更操作后调用 */
async function refreshTotalCount() {
  try {
    const { data: response }: any = await queryResourceMappingList();
    totalResourceCount.value = (response.result || []).filter(
      (item: any) => item.type === 2,
    ).length;
  } catch {}
}

/** 加载后端API资源列表，数据格式为 [{ service, routes }] */
async function loadAPIResourceList() {
  try {
    const { data: response }: any = await queryAPIResourceList();
    const rows = response.result.rows || [];
    const maps = response.result.map ? JSON.parse(response.result.map) : {};
    apiResourceList.value = rows.map((item: any) => {
      const serviceName = maps[item.service];
      return {
        ...item,
        serviceName: serviceName || item.serviceName || '',
        routes: item.routes || [],
      };
    });
    if (rows.length) {
      nextTick(() => {
        activeServiceName.value = rows[0].service;
      });
    }
  } catch {
    showToastFail("加载API资源列表失败");
  }
}
</script>

<style lang="scss" scoped>
.resources-mapping {
  flex-direction: row;
  gap: 10px;
}

.left-panel {
  width: 200px;
  min-width: 200px;
  height: 100%;
  background-color: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 5px 0 12px;
    flex-shrink: 0;

    .container-label {
      margin-bottom: 0;
      font-size: 15px;
    }
  }

  .module-filter {
    padding: 6px 10px;
    flex-shrink: 0;
    margin-top: 5px;
  }

  .module-list-wrapper {
    flex: 1;
    overflow-y: auto;
    padding: 0 6px 6px;

    > .module-item {
      margin-bottom: 2px;
      display: flex;
      align-items: center;
    }
  }
}

:deep(.el-tree) {
  background-color: transparent;
  --el-tree-node-hover-bg-color: transparent;
}

:deep(.el-tree .el-tree-node__content) {
  height: auto;
  padding: 0;
  border-radius: 4px;
  flex: 1;
  min-width: 0;

  &:hover {
    background-color: transparent;
  }
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: transparent;
}

:deep(.el-tree-node.is-current > .el-tree-node__content .module-item) {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 500;
}

.module-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  transition:
    background-color 0.2s,
    color 0.2s;
  margin-bottom: 1px;

  &:hover {
    background-color: #f0f5ff;
  }
  &:active {
    opacity: 0.85;
  }

  &--active {
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-weight: 500;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      width: 3px;
      height: 16px;
      border-radius: 0 3px 3px 0;
      background-color: var(--el-color-primary);
    }
  }

  .module-item__inner {
    display: flex;
    align-items: center;
    overflow: hidden;
    flex: 1;
    min-width: 0;
  }

  .module-item__icon {
    flex-shrink: 0;
    margin-right: 4px;
    color: var(--el-color-primary);
    opacity: 0.7;
  }

  .module-item__name {
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-left: 2px;
  }

  .module-item__count {
    flex-shrink: 0;
    font-size: 10px;
    color: #909399;
    background-color: #f4f4f5;
    border-radius: 8px;
    padding: 0 5px;
    line-height: 16px;
    margin-left: 4px;
    min-width: 16px;
    text-align: center;
  }
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;

  .card {
    flex: 1;
    flex-shrink: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .count-text {
    font-size: 14px;
    font-weight: 400;
    color: #909399;
  }
}

:deep(.el-alert--info.is-dark) {
  background-color: white;
  color: #303030;
  border: 1px solid #ebeef5;
}

:deep(.el-alert__title) {
  font-size: 12px;
}

.api-path-text {
  color: var(--el-color-success);
  cursor: pointer;
  user-select: none;
  font-family:
    "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  font-size: 13px;

  &:hover {
    color: var(--el-color-primary);
  }
}

.api-quick-select {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
  margin: 0 10px;

  .api-quick-select__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 14px;
    background-color: #fafbfc;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f5f6f8;
    }

    .api-quick-select__title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #303030;
    }

    .api-quick-select__arrow {
      color: #909399;
      transition: transform 0.25s;

      &.is-open {
        transform: rotate(180deg);
      }
    }
  }

  .api-quick-select__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px 6px;
    border-top: 1px solid var(--el-border-color-lighter);

    .api-quick-select__hint {
      font-size: 12px;
      color: #c0c4cc;
    }
  }

  .api-quick-select__content {
    display: flex;
    height: 250px;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .service-list {
    width: 160px;
    min-width: 160px;
    border-right: 1px solid var(--el-border-color-lighter);
    overflow-y: auto;
    padding: 4px 0;

    .service-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 5px 10px;
      cursor: pointer;
      user-select: none;
      transition: all 0.15s;

      &:hover {
        background-color: #f0f5ff;
      }

      .service-item__text {
        display: flex;
        flex-direction: column;
        gap: 1px;
        overflow: hidden;
        flex: 1;
        min-width: 0;
      }

      .service-item__label {
        font-size: 12px;
        color: #303030;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .service-item__key {
        font-size: 10px;
        color: #909399;
        font-family: "SFMono-Regular", Consolas, Menlo, monospace;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .service-item__count {
        flex-shrink: 0;
        font-size: 10px;
        color: #909399;
        background-color: #f4f4f5;
        border-radius: 8px;
        padding: 0 5px;
        line-height: 16px;
        margin-left: 6px;
      }

      &--active {
        background-color: var(--el-color-primary-light-9);

        .service-item__label {
          color: var(--el-color-primary);
          font-weight: 500;
        }
        .service-item__key {
          color: var(--el-color-primary);
          opacity: 0.7;
        }
        .service-item__count {
          background-color: var(--el-color-primary-light-8);
          color: var(--el-color-primary);
        }
      }
    }
  }

  .route-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;

    .route-list__header {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 10px;
      border-bottom: 1px solid var(--el-border-color-extra-light, #f2f3f5);
      flex-shrink: 0;

      .route-list__service {
        font-size: 12px;
        font-weight: 500;
        color: #303030;
      }

      .route-list__divider {
        font-size: 11px;
        color: #dcdfe6;
      }

      .route-list__key {
        font-size: 10px;
        font-family: "SFMono-Regular", Consolas, Menlo, monospace;
        color: #909399;
      }

      .route-list__total {
        margin-left: auto;
        font-size: 10px;
        color: #c0c4cc;
      }
    }

    .route-list__body {
      flex: 1;
      overflow-y: auto;
      padding: 4px 0;
    }

    .route-item {
      display: flex;
      align-items: center;
      padding: 5px 10px;
      cursor: pointer;
      transition: background-color 0.15s;
      gap: 8px;

      &:hover {
        background-color: var(--el-color-primary-light-9);
      }

      &--selected {
        background-color: var(--el-color-primary-light-9);

        .route-item__path {
          color: var(--el-color-primary);
          font-weight: 500;
        }
      }

      .route-item__method {
        flex-shrink: 0;
        width: 42px;
        height: 18px;
        line-height: 18px;
        text-align: center;
        border-radius: 3px;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.3px;
        color: #fff;
        font-family: "SFMono-Regular", Consolas, Menlo, monospace;

        &.method-get {
          background-color: #61affe;
        }
        &.method-post {
          background-color: #49cc90;
        }
        &.method-put {
          background-color: #fca130;
        }
        &.method-delete {
          background-color: #f93e3e;
        }
        &.method-patch {
          background-color: #50e3c2;
        }
      }

      .route-item__path {
        font-family:
          "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier,
          monospace;
        font-size: 12px;
        color: #303030;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

.panel-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 12px;
  color: #c0c4cc;
}

.dir-context-menu {
  position: fixed;
  z-index: 9999;
  background: white;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 4px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  min-width: 130px;

  &__item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    font-size: 13px;
    cursor: pointer;
    user-select: none;
    color: #303030;

    &:hover {
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }

    &--danger {
      color: var(--el-color-danger);

      &:hover {
        background-color: var(--el-color-danger-light-9);
        color: var(--el-color-danger);
      }
    }

    &--disabled {
      opacity: 0.4;
      cursor: not-allowed;
      pointer-events: none;
    }
  }
}

/* ─── 批量新增弹窗样式 ─── */
.batch-dialog-body {
  display: flex;
  gap: 12px;
  height: 520px;
}

.batch-left {
  width: 440px;
  min-width: 440px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;

  .batch-left__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    flex-shrink: 0;

    .batch-left__hint {
      font-size: 11px;
      color: #c0c4cc;
      white-space: nowrap;
      margin-left: 8px;
    }
  }

  .batch-left__content {
    flex: 1;
    display: flex;
    min-height: 0;
  }

  .batch-service-list {
    width: 150px;
    min-width: 150px;
    border-right: 1px solid var(--el-border-color-lighter);
    overflow-y: auto;
    padding: 4px 0;
  }

  .batch-service-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 8px;
    cursor: pointer;
    user-select: none;
    transition: all 0.15s;

    &:hover {
      background-color: #f0f5ff;
    }

    &__text {
      display: flex;
      flex-direction: column;
      gap: 1px;
      overflow: hidden;
      flex: 1;
      min-width: 0;
    }

    &__label {
      font-size: 12px;
      color: #303030;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__key {
      font-size: 10px;
      color: #909399;
      font-family: "SFMono-Regular", Consolas, Menlo, monospace;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__count {
      flex-shrink: 0;
      font-size: 10px;
      color: #909399;
      background-color: #f4f4f5;
      border-radius: 8px;
      padding: 0 5px;
      line-height: 16px;
      margin-left: 4px;
    }

    &--active {
      background-color: var(--el-color-primary-light-9);

      .batch-service-item__label {
        color: var(--el-color-primary);
        font-weight: 500;
      }
      .batch-service-item__key {
        color: var(--el-color-primary);
        opacity: 0.7;
      }
    }
  }

  .batch-route-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;

    .batch-route-list__header {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 10px;
      border-bottom: 1px solid var(--el-border-color-extra-light, #f2f3f5);
      flex-shrink: 0;

      .batch-route-list__service {
        font-size: 12px;
        font-weight: 500;
        color: #303030;
      }
      .batch-route-list__divider {
        font-size: 11px;
        color: #dcdfe6;
      }
      .batch-route-list__key {
        font-size: 10px;
        font-family: "SFMono-Regular", Consolas, Menlo, monospace;
        color: #909399;
      }
      .batch-route-list__total {
        margin-left: auto;
        font-size: 10px;
        color: #c0c4cc;
      }
    }

    .batch-route-list__body {
      flex: 1;
      overflow-y: auto;
      padding: 4px 0;
    }
  }

  .batch-route-item {
    padding: 3px 8px;
    transition: background-color 0.15s;

    &:hover {
      background-color: var(--el-color-primary-light-9);
    }

    .batch-route-item__inner {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .batch-route-item__method {
      display: inline-block;
      width: 42px;
      height: 18px;
      line-height: 18px;
      text-align: center;
      border-radius: 3px;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.3px;
      color: #fff;
      font-family: "SFMono-Regular", Consolas, Menlo, monospace;
      flex-shrink: 0;

      &.method-get {
        background-color: #61affe;
      }
      &.method-post {
        background-color: #49cc90;
      }
      &.method-put {
        background-color: #fca130;
      }
      &.method-delete {
        background-color: #f93e3e;
      }
      &.method-patch {
        background-color: #50e3c2;
      }
    }

    .batch-route-item__path {
      font-family:
        "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
      font-size: 12px;
      color: #303030;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.batch-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;

  .batch-right__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    flex-shrink: 0;

    .batch-right__title {
      font-size: 13px;
      font-weight: 500;
      color: #303030;
    }
    .batch-right__hint {
      font-size: 11px;
      color: #c0c4cc;
    }
  }

  .batch-right__body {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }
}

.batch-form-card {
  background: #fafbfc;
  border: 1px solid var(--el-border-color-extra-light, #f2f3f5);
  border-radius: 6px;
  padding: 10px 12px 4px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  .batch-form-card__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .batch-form-card__api {
    display: flex;
    align-items: center;
    gap: 6px;
    overflow: hidden;
  }

  .batch-form-card__path {
    font-family: "SFMono-Regular", Consolas, Menlo, monospace;
    font-size: 12px;
    color: #606266;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.batch-route-item__method {
  display: inline-block;
  width: 42px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: #fff;
  font-family: "SFMono-Regular", Consolas, Menlo, monospace;
  flex-shrink: 0;

  &.method-get {
    background-color: #61affe;
  }
  &.method-post {
    background-color: #49cc90;
  }
  &.method-put {
    background-color: #fca130;
  }
  &.method-delete {
    background-color: #f93e3e;
  }
  &.method-patch {
    background-color: #50e3c2;
  }
}
</style>
