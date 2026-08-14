<template>
  <div class="vertical-layout page-table-layout">
    <!-- 查询表单 -->
    <div class="inline-form mb-10 flex">
      <el-form :inline="true">
        <el-form-item label="昵称">
          <el-input
            placeholder="请输入昵称"
            v-model="queryParams.nick_name"
            :clearable="true"
            style="width: 200px"
            @clear="queryListData"
            @keyup.enter.native="queryListData"
          />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input
            placeholder="请输入手机号"
            v-model="queryParams.phone"
            :clearable="true"
            style="width: 180px"
            @clear="queryListData"
            @keyup.enter.native="queryListData"
          />
        </el-form-item>
        <el-form-item label="平台ID">
          <el-input
            placeholder="请输入平台ID"
            v-model="queryParams.platform_id"
            :clearable="true"
            style="width: 220px"
            @clear="queryListData"
            @keyup.enter.native="queryListData"
          />
        </el-form-item>
        <el-form-item label="租户">
          <el-select
            v-model="queryParams.tenant_id"
            placeholder="请选择租户"
            :clearable="true"
            filterable
            style="width: 180px"
            @clear="queryListData"
            @change="queryListData"
          >
            <el-option
              v-for="item in tenantOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select
            v-model="queryParams.platform_type"
            placeholder="请选择用户类型"
            :clearable="true"
            style="width: 150px"
            @clear="queryListData"
            @change="queryListData"
          >
            <el-option label="管理端" :value="1" />
            <el-option label="普通用户" :value="2" />
            <el-option label="商户" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="queryListData">
            搜索
          </el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="flex-1"></div>
      <el-button icon="RefreshRight" circle @click="queryListData" />
    </div>

    <!-- 主内容区 -->
    <div class="main">
      <div class="content">
        <!-- 头部操作栏 -->
        <div class="container-head justify-between mb-[6px]">
          <el-segmented
            v-model="statusActive"
            :options="statusOptions"
            @change="handleStatusChange"
          />
          <div class="type-statistics">
            <div class="stat-item" v-if="isRoot">
              <span class="stat-dot" style="background: #ccc"></span>
              <span class="stat-label">总数量</span>
              <span class="stat-value">{{ typeStatistics.count }}</span>
            </div>
            <span class="stat-divider" v-if="isRoot"></span>
            <div class="stat-item">
              <span class="stat-dot" style="background: #67c23a"></span>
              <span class="stat-label">管理端</span>
              <span class="stat-value" style="color: #67c23a">{{
                typeStatistics.admin
              }}</span>
            </div>
            <span class="stat-divider"></span>
            <div class="stat-item" v-if="isRoot">
              <span class="stat-dot" style="background: #409eff"></span>
              <span class="stat-label">普通用户</span>
              <span class="stat-value" style="color: #409eff">{{
                typeStatistics.user
              }}</span>
            </div>
          </div>
        </div>

        <!-- 用户列表表格 -->
        <el-table
          v-loading="loading"
          :data="dataList"
          :cell-style="{ padding: '4px 0' }"
        >
          <el-table-column label="用户信息" width="300" fixed="left">
            <template #default="{ row }">
              <div class="user-info-cell">
                <div class="avatar-wrapper">
                  <f-image
                    v-if="row.avatar"
                    class="user-avatar"
                    :src="row.avatar"
                    fit="cover"
                    preview
                  />
                  <f-image adminAvatar v-else class="user-avatar-empty" />
                  <div
                    class="online-indicator"
                    :class="row.online_class"
                    v-if="!row.platform_id.startsWith('2') && row.online_at"
                  ></div>
                </div>
                <div class="user-detail">
                  <div class="user-name-row">
                    <span class="user-name">{{
                      row.nick_name || "未设置昵称"
                    }}</span>
                    <f-status-badge
                      v-if="getUserType(row.platform_id)"
                      :text="getUserType(row.platform_id)"
                      :type="getUserTypeColor(row.platform_id)"
                      plain
                      class="user-type-badge"
                    />
                  </div>
                  <div class="user-meta" v-if="row.tenant_name">
                    <span class="platform-id">租户：{{ row.tenant_name }}</span>
                  </div>
                  <div class="user-meta" v-else-if="row.tenant_id">
                    <span class="platform-id">租户ID：{{ row.tenant_id }}</span>
                  </div>
                  <div class="user-meta">
                    <span class="platform-id">PID：{{ row.platform_id }}</span>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="基本信息" width="200" align="left">
            <template #default="{ row }">
              <div class="compact-info">
                <div class="info-row">
                  <span class="info-label">性别</span>
                  <span class="info-value">{{
                    getGenderText(row.gender)
                  }}</span>
                </div>
                <div class="info-row" v-if="hasBirthday(row)">
                  <span class="info-label">生日</span>
                  <span class="info-value">{{ formatBirthday(row) }}</span>
                </div>
                <div
                  class="info-row"
                  v-if="row.province || row.city || row.area"
                >
                  <span class="info-label">地区</span>
                  <span class="info-value">{{
                    [row.province, row.city, row.area].filter(Boolean).join("/")
                  }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="账号信息" width="200" align="left">
            <template #default="{ row }">
              <div class="compact-info">
                <div class="info-row">
                  <span class="info-label">状态</span>
                  <span :style="{ color: getStatusColor(row.status) }">{{
                    getStatusText(row.status)
                  }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">角色</span>
                  <div class="role-tags">
                    <span v-if="!row.roles" style="font-size: 12px"
                      >普通用户</span
                    >
                    <span
                      v-else
                      v-for="item in getRoleList(row.roles)"
                      style="font-size: 12px"
                      :class="{
                        '!text-[#ff0000]': item.role === 'root',
                        '!text-[#007bff]': item.role === 'tenant',
                        '!text-[#e68f05]': item.role.includes('superTenant'),
                      }"
                    >
                      {{ item.text }}
                    </span>
                  </div>
                </div>
                <div class="info-row">
                  <span class="info-label">实名</span>
                  <span
                    style="font-size: 12px"
                    :style="
                      row.identification === 1
                        ? 'color: var(--el-color-success)'
                        : ''
                    "
                  >
                    {{ row.identification === 1 ? "已实名" : "未实名" }}
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="最后登录信息" min-width="260" align="left">
            <template #default="{ row }">
              <div class="compact-info" v-if="row.last_login_record">
                <div class="info-row">
                  <span class="info-label">登录地点</span>
                  <span class="info-value">{{
                    row.last_login_record.place || "-"
                  }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">IP地址</span>
                  <span class="info-value">{{
                    row.last_login_record.ip || "-"
                  }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">登录方式</span>
                  <span class="info-value">{{
                    getLoginMethodText(row.last_login_record.login_method)
                  }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">登录环境</span>
                  <span class="info-value">{{
                    getDeviceTypeText(row.last_login_record.device_type)
                  }}</span>
                </div>
              </div>
              <div class="compact-info" v-else>
                <div class="info-row">
                  <span class="info-value" style="color: #9ca3af"
                    >暂无登录记录</span
                  >
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="登录设备信息" min-width="260" align="left">
            <template #default="{ row }">
              <div class="compact-info" v-if="row.last_login_device">
                <div class="info-row">
                  <span class="info-label">设备ID</span>
                  <span class="info-value">{{
                    row.last_login_device.device_id || "-"
                  }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">设备名称</span>
                  <span class="info-value" style="line-height: 1.3">{{
                    row.last_login_device.device_name || "-"
                  }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">登录次数</span>
                  <span class="info-value">{{
                    row.last_login_device.login_count || 0
                  }}</span>
                </div>
              </div>
              <div class="compact-info" v-else>
                <div class="info-row">
                  <span class="info-value" style="color: #9ca3af"
                    >暂无登录设备信息</span
                  >
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="时间信息" width="280">
            <template #default="{ row }">
              <div class="compact-active">
                <div class="active-row !justify-start">
                  <span class="active-label">注册时间</span>
                  <span class="active-value">{{
                    dayjs(row.created_at).format("YYYY-MM-DD HH:mm")
                  }}</span>
                </div>
                <div class="active-row !justify-start" v-if="row.last_login">
                  <span class="active-label">最后登录</span>
                  <span class="active-value">{{
                    dayjs(row.last_login).format("YYYY-MM-DD HH:mm")
                  }}</span>
                  <span class="active-value !text-[#e13e07]"
                    >({{ dayjs(row.last_login).fromNow() }})</span
                  >
                </div>
                <div class="active-row !justify-start" v-if="row.online_at">
                  <span class="active-label">上线时间</span>
                  <span class="active-value active-recent">{{
                    dayjs(row.online_at).format("HH:mm:ss")
                  }}</span>
                  <span class="active-value active-recent"
                    >({{ dayjs(row.online_at).fromNow() }})</span
                  >
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="账号授权方式" min-width="530">
            <template #default="{ row }">
              <div class="auth-methods">
                <div
                  v-if="!row.user_auths || row.user_auths.length === 0"
                  class="no-auth"
                >
                  <span class="no-auth-text">未绑定任何授权方式</span>
                </div>
                <div v-else class="auth-list">
                  <div
                    v-for="auth in row.user_auths"
                    :key="auth.id"
                    class="auth-item"
                  >
                    <span class="auth-type">{{ auth.typeText }}</span>
                    <el-tooltip
                      v-if="auth.identity_type.includes('MP')"
                      effect="dark"
                      :content="auth.identifier"
                      placement="top"
                    >
                      <span class="auth-identifier">{{ auth.identifier }}</span>
                    </el-tooltip>
                    <span class="auth-identifier" v-else>{{
                      auth.identifier
                    }}</span>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="120"
            fixed="right"
          >
            <template #default="{ row }">
              <div class="flex items-center justify-center gap-x-[5px]">
                <!-- <el-button size="small" icon="Delete" link type="danger">删除</el-button> -->
                <el-dropdown trigger="click" v-if="row.roles != 'root'">
                  <el-button size="small" icon="Files" link type="primary">操作</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="openRoleDialog(row)" v-if="row.platform_id.startsWith('1')">授权角色</el-dropdown-item>
                      <el-dropdown-item>账户封禁</el-dropdown-item>
                      <el-dropdown-item>强制登退</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="footer-pagination-container">
          <el-pagination
            v-model:current-page="queryParams.page"
            v-model:page-size="queryParams.page_size"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="dataListTotal"
            @size-change="() => queryListData(false)"
            @current-change="() => queryListData(false)"
          />
        </div>
      </div>
    </div>

    <!-- 角色授权对话框 -->
    <el-dialog
      v-model="roleDialogShow"
      title="角色授权"
      destroy-on-close
      append-to-body
      width="600px"
    >
      <div v-if="roleDialogUser" class="role-auth-panel">
        <div class="role-auth-info">
          <f-image
            :src="roleDialogUser.avatar"
            adminAvatar
            class="role-auth-avatar"
          />
          <div class="role-auth-meta">
            <span class="role-auth-name">{{ roleDialogUser.nick_name || "未设置昵称" }}</span>
            <span class="role-auth-dept">PID：{{ roleDialogUser.platform_id }}</span>
          </div>
          <div class="role-auth-count">
            请谨慎操作，避免对系统安全造成影响
          </div>
        </div>
        <el-divider style="margin: 12px 0" />
        <div class="role-auth-body" v-loading="roleDialogLoading">
          <el-tree
            ref="roleTreeRef"
            :data="roleTreeData"
            show-checkbox
            check-strictly
            node-key="alias"
            :default-checked-keys="userCurrentRoles"
            :props="{ label: 'label', children: 'children' }"
            default-expand-all
            :expand-on-click-node="false"
            @check-change="handleRoleTreeCheckChange"
          >
            <template #default="{ data }">
              <span class="role-tree-node">
                <el-icon
                  v-if="data.children"
                  size="14"
                  style="margin-right: 4px"
                ><Folder /></el-icon>
                <span>{{ data.label }}</span>
              </span>
            </template>
          </el-tree>
          <div v-if="roleTreeData.length === 0 && !roleDialogLoading" class="role-auth-empty">
            暂无可授权角色
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="roleDialogShow = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="users">
import {
  queryUserList,
  queryUserStatusCount,
  queryUserPlatformTypeCount,
  queryUserListFromTenant,
  queryUserStatusCountFromTenant,
  queryUserPlatformTypeCountFromTenant,
} from "@/api/user/users";
import { queryTenantOptions } from "@/api/tenantManage/tenant";
import { roleList } from "@/api/system/role";
import { getRoleForUser, addUserGroupingPolicy, removeUserGroupingPolicy } from "@/api/system/policyAuth";
import { showToastOk, showToastFail, showLoading } from "@/components/f-toast";
import dayjs from "dayjs";
import { isSuperAdmin } from "@/utils/auth";

const router = useRoute();
const isRoot = isSuperAdmin();

// 角色映射
const roleMap: Record<string, string> = {
  root: "超级管理员",
  tenant: "租户管理员",
  superTenant: "总租户",
  admUser: "管理端用户",
  regularuser: " 租户C端用户",
};

// 授权类型映射
const authTypeMap: Record<string, string> = {
  // ============ 管理端 ============
  ADMIN: "总后台登录账号",
  TENANT: "租户后台登录账号",

  // ============ 用户 ============
  USER_PHONE: "用户绑定手机号",
  USER_WX_MP: "用户微信小程序",
  USER_ALIPAY_MP: "用户支付宝小程序",
  USER_WX_C: "用户微信公众号",

  // ============ 商家 ============
  MCH_PHONE: "商家绑定手机号",
  MCH_WX_MP: "商家微信小程序",
  MCH_WX_C: "商家绑定公众号",
};

// 登录方式映射
const loginMethodMap: Record<string, string> = {
  WX_H5: "微信公众号",
  WX_MP: "微信小程序",
  ALIPAY_MP: "支付宝小程序",
  PHONE_CAPT: "手机验证码",
  ADMIN: "管理端登录",
};

// 设备类型映射
const deviceTypeMap: Record<string, string> = {
  WEB: "PC浏览器",
  H5: "手机浏览器",
  WX_H5: "微信公众号",
  WX_MP: "微信小程序",
  ALIPAY_MP: "支付宝小程序",
};

const loading = ref(false);
const dataList = ref<any[]>([]);
const dataListTotal = ref(0);
const tenantOptions = ref<any[]>([]);

// 类型统计数据
const typeStatistics = ref({
  admin: 0,
  user: 0,
  merchant: 0,
  count: 0,
});

// 状态选项源数据
const statusOptionsSource = [
  { label: "全部", value: -1 },
  { label: "正常", value: 0 },
  { label: "禁用中", value: 1 },
  { label: "已注销", value: 2 },
  { label: "锁定中", value: 3 },
];
const statusOptions = ref(Object.assign([], statusOptionsSource));
const statusActive = ref(-1);

// 查询参数
const queryParams = ref({
  page: 1,
  page_size: 20,
  nick_name: "",
  phone: "",
  platform_id: "",
  tenant_id: "",
  platform_type: undefined as number | undefined,
  status: undefined as number | undefined,
});

/** 获取性别文本 */
const getGenderText = (gender: number) => {
  const map: Record<number, string> = {
    0: "未知",
    1: "女",
    2: "男",
  };
  return map[gender] || "未知";
};

/** 是否有生日信息 */
const hasBirthday = (row: any) => {
  return row.birth_year || row.birth_month || row.birth_day;
};

/** 格式化生日 */
const formatBirthday = (row: any) => {
  const parts = [];
  if (row.birth_year) parts.push(row.birth_year + "年");
  if (row.birth_month) parts.push(row.birth_month + "月");
  if (row.birth_day) parts.push(row.birth_day + "日");
  return parts.join("") || "未设置";
};

/** 获取用户类型 */
const getUserType = (platformId: string) => {
  if (!platformId) return "";
  if (platformId.startsWith("1")) return "管理端用户";
  if (platformId.startsWith("2")) return "普通用户";
  if (platformId.startsWith("3")) return "租户用户";
  return "";
};

/** 获取用户类型颜色 */
const getUserTypeColor = (platformId: string) => {
  if (!platformId) return "info";
  if (platformId.startsWith("1")) return "success";
  if (platformId.startsWith("2")) return "info";
  if (platformId.startsWith("3")) return "primary";
  return "info";
};

/** 获取状态文本 */
const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: "正常",
    1: "禁用",
    2: "已注销",
    3: "锁定",
    4: "账号未绑定任何部门成员",
  };
  return map[status] || "未知";
};

/** 获取状态颜色 */
const getStatusColor = computed(() => {
  return (status: number) => {
    const map: Record<number, string> = {
      0: "var(--el-color-success)", // 正常
      1: "var(--el-color-danger)", // 禁用
      2: "var(--el-color-info)", // 已注销
      3: "var(--el-color-warning)", // 锁定
      4: "var(--el-color-danger)", // 账号未绑定成员
    };
    return map[status] || "info";
  };
});

/** 获取登录方式文本 */
const getLoginMethodText = (loginMethod: string) => {
  return loginMethodMap[loginMethod] || loginMethod || "-";
};

/** 获取设备类型文本 */
const getDeviceTypeText = (deviceType: string) => {
  return deviceTypeMap[deviceType] || deviceType || "-";
};

/** 获取角色列表 */
const getRoleList = (roles: string) => {
  if (!roles) return [];

  return roles
    .split(",")
    .filter((r) => r.trim())
    .map((r) => {
      return { text: roleMap[r] || r, role: r };
    });
};

/** 重置查询 */
const handleReset = () => {
  statusActive.value = -1;
  queryParams.value = {
    page: 1,
    page_size: 20,
    nick_name: "",
    phone: "",
    platform_id: "",
    tenant_id: "",
    platform_type: undefined,
    status: -1,
  };
  queryListData();
};

/** 切换状态 */
const handleStatusChange = (value: number) => {
  statusActive.value = value;
  queryParams.value.status = value;
  queryParams.value.page = 1;
  queryListData(false);
};

/** 获取租户选项 */
const getTenantOptions = async () => {
  try {
    const { data: response } = await queryTenantOptions();
    tenantOptions.value = (response.result || []).map((item: any) => ({
      label: item.tenant_name,
      value: item.tenant_id,
    }));
  } catch (error: any) {
    showToastFail(error.err_msg || "获取租户选项失败");
  }
};

/** 清空状态统计 */
const clearStatusCount = () => {
  statusOptions.value = JSON.parse(JSON.stringify(statusOptionsSource));
};

/** 获取用户平台类型统计 */
async function getUserPlatformTypeCountRequest() {
  try {
    const params: any = {};
    // 传递其他筛选条件
    if (queryParams.value.nick_name) {
      params.nick_name = queryParams.value.nick_name;
    }
    if (queryParams.value.phone) {
      params.phone = queryParams.value.phone;
    }
    if (queryParams.value.platform_id) {
      params.platform_id = queryParams.value.platform_id;
    }
    if (queryParams.value.tenant_id) {
      params.tenant_id = queryParams.value.tenant_id;
    }
    if (
      queryParams.value.status !== undefined &&
      queryParams.value.status !== -1
    ) {
      params.status = queryParams.value.status;
    }

    let reqFn = queryUserPlatformTypeCount;
    if (!isRoot) {
      reqFn = queryUserPlatformTypeCountFromTenant;
    }

    const { data: response } = await reqFn(params);

    if (response.result && typeof response.result === "object") {
      typeStatistics.value = {
        admin: response.result[1] || 0,
        user: response.result[2] || 0,
        merchant: response.result[3] || 0,
        count: response.result["count"],
      };
    }
  } catch (error: any) {
    showToastFail(error.err_msg || "获取用户平台类型统计失败");
    console.error("获取用户平台类型统计失败", error);
  }
}

/** 获取用户状态统计 */
async function getUserStatusCountRequest() {
  try {
    const params: any = {};
    // 传递其他筛选条件（除了 status）
    if (queryParams.value.nick_name)
      params.nick_name = queryParams.value.nick_name;
    if (queryParams.value.phone) params.phone = queryParams.value.phone;
    if (queryParams.value.platform_id)
      params.platform_id = queryParams.value.platform_id;
    if (queryParams.value.tenant_id)
      params.tenant_id = queryParams.value.tenant_id;
    if (queryParams.value.platform_type)
      params.platform_type = queryParams.value.platform_type;

    let reqFn = queryUserStatusCount;
    if (!isRoot) {
      reqFn = queryUserStatusCountFromTenant;
    }

    const { data: response } = await reqFn(params);
    clearStatusCount();
    await nextTick();

    if (response.result && typeof response.result === "object") {
      Object.keys(response.result).forEach((key) => {
        const item: any = statusOptions.value.find((e: any) => e.value == key);
        if (item) {
          item.label = `${item.label.split("(")[0]}(${response.result[key]})`;
        }
      });
    }
  } catch (error: any) {
    showToastFail(error.err_msg || "获取用户状态统计失败");
    console.error("获取用户状态统计失败", error);
  }
}

/** 获取列表数据 */
async function queryListData(isRefresh: boolean = true) {
  loading.value = true;
  try {
    const params: any = { ...queryParams.value };
    // 移除 undefined 值
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === "") {
        delete params[key];
      }
    });

    if (params.status == undefined) {
      params.status = -1;
    }

    let reqFn = queryUserList;
    if (!isRoot) {
      reqFn = queryUserListFromTenant;
    }

    const { data: response } = await reqFn(params);
    console.log(response.result);
    const rows = response.result.rows || [];

    for (let i = 0; i < rows.length; i++) {
      const item = rows[i];
      // 用户在线
      if (item.online_at) {
        item.online_at = item.online_at * 1000;
        item.online_class = `online-indicator--online`;
      } else {
        item.online_class = `online-indicator--offline`;
      }

      // 用户授权信息
      if (item.user_auths) {
        try {
          const authList = JSON.parse(item.user_auths);
          item.user_auths = authList.map((auth: any) => ({
            ...auth,
            typeText: authTypeMap[auth.identity_type] || auth.identity_type,
          }));
        } catch {
          item.user_auths = [];
        }
      } else {
        item.user_auths = [];
      }

      // 用户登录信息
      if (item.last_login_record) {
        try {
          item.last_login_record = JSON.parse(item.last_login_record);
        } catch (error) {
          console.error("解析用户登录信息失败", error);
        }
      }

      // 用户登录设备信息
      if (item.last_login_device) {
        try {
          item.last_login_device = JSON.parse(item.last_login_device);
        } catch (error) {
          console.error("解析用户登录设备信息失败", error);
        }
      }
    }

    dataList.value = rows;
    dataListTotal.value = response.result.total || 0;

    // 只在刷新时获取类型统计
    if (isRefresh) {
      getUserPlatformTypeCountRequest();
    }

    // 获取状态统计
    getUserStatusCountRequest();
  } catch (error: any) {
    showToastFail(error.err_msg || "获取列表失败");
    dataList.value = [];
    dataListTotal.value = 0;
    typeStatistics.value = { admin: 0, user: 0, merchant: 0, count: 0 };
  } finally {
    loading.value = false;
  }
}

/* ==================== 角色授权弹窗 ==================== */

const roleDialogShow = ref(false);
const roleDialogUser = ref<any>(null);
const roleDialogLoading = ref(false);
const roleTreeRef = ref<any>();
const allRoles = ref<any[]>([]);
const userCurrentRoles = ref<string[]>([]);

/** 将扁平角色列表按 parent_id 转为树结构 */
const roleTreeData = computed(() => {
  if (!allRoles.value.length) return [];
  const list = allRoles.value.map((r: any) => ({
    id: r.id,
    alias: r.alias,
    label: r.label,
    parent_id: r.parent_id ?? 0,
  }));
  return buildRoleTree(list, 0);
});

const buildRoleTree = (list: any[], parentId: number): any[] => {
  return list
    .filter((item) => item.parent_id === parentId)
    .map((item) => {
      const children = buildRoleTree(list, item.id);
      if (children.length) {
        return { ...item, children };
      }
      return { ...item, children: undefined };
    });
};

/** 加载所有普通角色 */
async function loadAllRoles() {
  try {
    const { data: response }: any = await roleList({});
    const roles = response.result || [];
    allRoles.value = roles.filter((r: any) => r.type === 1 && r.status === 1);
  } catch (err: any) {
    showToastFail(err.err_msg || "加载角色列表失败");
  }
}

/** 打开角色授权弹窗 */
const openRoleDialog = async (row: any) => {
  roleDialogUser.value = row;
  roleDialogShow.value = true;
  roleDialogLoading.value = true;

  try {
    // 并行加载角色列表和用户当前角色
    const [, roleResp]: any[] = await Promise.all([
      loadAllRoles(),
      getRoleForUser(row.id),
    ]);
    userCurrentRoles.value = roleResp?.data?.result || [];
  } catch (err: any) {
    showToastFail(err.err_msg || "加载角色信息失败");
  } finally {
    roleDialogLoading.value = false;
  }
};

/** el-tree 节点勾选变化 */
const handleRoleTreeCheckChange = async (data: any, checked: boolean) => {
  if (!roleDialogUser.value) return;

  // 跳过非用户操作引起的状态变化（default-checked-keys 初始化等）
  if (checked && userCurrentRoles.value.includes(data.alias)) return;
  if (!checked && !userCurrentRoles.value.includes(data.alias)) return;

  if (checked) {
    // 授权角色
    try {
      showLoading("正在授权...");
      await addUserGroupingPolicy({
        id: roleDialogUser.value.id,
        roles: [data.alias],
      });
      showToastOk("授权成功");
      if (!userCurrentRoles.value.includes(data.alias)) {
        userCurrentRoles.value.push(data.alias);
      }
    } catch (err: any) {
      showToastFail(err.err_msg || "授权失败");
      roleTreeRef.value?.setChecked(data.alias, false);
    }
  } else {
    // 至少保留一个角色
    if (userCurrentRoles.value.length <= 1) {
      showToastFail("至少需要保留一个角色");
      roleTreeRef.value?.setChecked(data.alias, true);
      return;
    }
    try {
      showLoading("正在取消授权...");
      const oldRoles = [...userCurrentRoles.value];
      const newRoles = oldRoles.filter((r) => r !== data.alias);
      await removeUserGroupingPolicy({
        id: roleDialogUser.value.id,
        old_roles: oldRoles,
        new_roles: newRoles,
      });
      showToastOk("取消授权成功");
      userCurrentRoles.value = newRoles;
    } catch (err: any) {
      showToastFail(err.err_msg || "取消授权失败");
      roleTreeRef.value?.setChecked(data.alias, true);
    }
  }
};

onMounted(() => {
  if (router.query.platform_id) {
    queryParams.value.platform_id = router.query.platform_id as string;
  }

  queryListData();
  getTenantOptions();
});
</script>

<style lang="scss" scoped>
// 状态切换卡样式
.container-head {
  .el-segmented {
    --el-segmented-item-selected-color: #fff;
    --el-segmented-item-selected-bg-color: var(--el-color-primary);
    --el-border-radius-base: 14px;
  }
}

// 类型统计样式
.type-statistics {
  display: flex;
  align-items: center;
  gap: 0;
  border-radius: 8px;
  padding: 4px 12px;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0 10px;
    white-space: nowrap;

    .stat-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .stat-label {
      font-size: 12px;
      color: #8c8c8c;
    }

    .stat-value {
      font-size: 14px;
      color: #1f2937;
    }
  }

  .stat-divider {
    width: 1px;
    height: 14px;
    background: #e5e7eb;
    flex-shrink: 0;
  }
}

// 用户信息单元格
.user-info-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;

  .avatar-wrapper {
    position: relative;
    flex-shrink: 0;
    width: 50px;
    height: 50px;

    .user-avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid transparent;
    }

    .user-avatar-empty {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #8a8e99;
      font-size: 16px;
      border: 2px solid transparent;
    }

    .online-indicator {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 15px;
      height: 15px;
      border-radius: 50%;
      border: 2px solid #fff;

      &--online {
        background-color: #52c41a;
      }

      &--offline {
        background-color: #d9d9d9;
      }

      &--away {
        background-color: #faad14;
      }
    }
  }

  .user-detail {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    margin-left: 5px;

    .user-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 2px;
    }

    .user-name {
      font-size: 13px;
      font-weight: 500;
      color: #1f2937;
      line-height: 1.2;
    }

    .user-type-badge {
      font-size: 10px;
      padding: 3px 5px;
      line-height: 1;
      border-radius: 4px;
    }

    .user-meta {
      display: flex;
      align-items: center;
      font-size: 12px;
      column-gap: 8px;
      line-height: 1.2;
      margin-top: 5px;

      .platform-id {
        color: #6b7280;
      }

      .online-dot {
        font-size: 12px;
        line-height: 1;
        white-space: nowrap;

        &.online {
          color: #52c41a !important;
        }

        &.offline {
          color: #9ca3af;
        }
      }
    }
  }
}

// 紧凑信息布局
.compact-info {
  display: flex;
  flex-direction: column;

  .info-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;

    .info-label {
      color: #9ca3af;
      min-width: 28px;
    }

    .info-value {
      color: #374151;
      flex: 1;
    }

    .role-tags {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
  }
}

// 紧凑活跃信息
.compact-active {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .active-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 12px;

    .active-label {
      color: #9ca3af;
      min-width: 28px;
    }

    .active-value {
      color: #374151;

      &.active-recent {
        color: #52c41a;
      }
    }
  }
}

// ID文本
.id-text {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

// 授权方式
.auth-methods {
  .no-auth {
    display: flex;
    align-items: center;

    .no-auth-text {
      font-size: 12px;
      color: #9ca3af;
    }
  }

  .auth-list {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .auth-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;

      .auth-type {
        color: #6b7280;
        min-width: 90px;
        flex-shrink: 0;
        text-align: right;
      }

      .auth-identifier {
        color: #374151;
        font-size: 12px;
        font-family: monospace;
      }
    }
  }
}

// 角色授权弹窗
.role-auth-panel {
  .role-auth-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 0;
  }

  .role-auth-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .role-auth-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .role-auth-name {
      font-size: 15px;
      font-weight: 600;
      color: #303030;
    }

    .role-auth-dept {
      font-size: 12px;
      color: #909399;
    }
  }

  .role-auth-count {
    margin-left: auto;
    font-size: 13px;
    color: #606266;
    white-space: nowrap;

    em {
      font-style: normal;
      font-weight: 600;
      color: var(--el-color-primary);
    }
  }

  .role-auth-body {
    max-height: 400px;
    overflow-y: auto;
    padding: 4px 0;

    :deep(.el-tree) {
      background-color: transparent;
    }

    :deep(.el-tree-node__content) {
      height: 36px;
      border-radius: 4px;
      padding-right: 8px;

      &:hover {
        background-color: #f5f7fa;
      }
    }

    .role-tree-node {
      display: flex;
      align-items: center;
      font-size: 13px;
      color: #303030;
    }

    .role-auth-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 120px;
      font-size: 13px;
      color: #c0c4cc;
    }
  }
}
</style>
