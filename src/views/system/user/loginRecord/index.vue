<template>
  <div class="vertical-layout page-table-layout">
    <div class="inline-form mb-10 flex">
      <el-form :inline="true">
        <el-form-item label="昵称">
          <el-input
            placeholder="请输入昵称"
            v-model="queryParams.nick_name"
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
            style="width: 200px"
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
        <el-form-item label="登录方式">
          <el-select
            v-model="queryParams.login_method"
            placeholder="请选择登录方式"
            :clearable="true"
            style="width: 150px"
            @clear="queryListData"
            @change="queryListData"
          >
            <el-option label="微信公众号" value="WX_H5" />
            <el-option label="微信小程序" value="WX_MP" />
            <el-option label="支付宝小程序" value="ALIPAY_MP" />
            <el-option label="手机验证码" value="PHONE_CAPT" />
            <el-option label="管理端登录" value="ADMIN" />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="登录环境">
          <el-select
            v-model="queryParams.device_type"
            placeholder="请选择登录环境"
            :clearable="true"
            style="width: 150px"
            @clear="queryListData"
            @change="queryListData"
          >
            <el-option label="PC浏览器" value="WEB" />
            <el-option label="手机浏览器" value="H5" />
            <el-option label="微信公众号" value="WX_H5" />
            <el-option label="微信小程序" value="WX_MP" />
            <el-option label="支付宝小程序" value="ALIPAY_MP" />
          </el-select>
        </el-form-item> -->
        <el-form-item label="登录时间">
          <el-date-picker
            v-model="loginTimeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            @change="queryListData"
            :disabled-date="disabledDate"
            :shortcuts="dateShortcuts"
            clearable
            style="width: 380px"
          />
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
    <div class="main">
      <div class="content">
        <el-table
          v-loading="loading"
          :data="dataList"
          :cell-style="{ padding: '8px 0' }"
        >
          <el-table-column label="用户信息" min-width="280" fixed="left">
            <template #default="{ row }">
              <div class="user-info-cell-simple">
                <div class="avatar-wrapper">
                  <f-image
                    v-if="row.user_avatar"
                    class="user-avatar"
                    :src="row.user_avatar"
                    fit="cover"
                    preview
                  />
                  <f-image adminAvatar v-else class="user-avatar-empty" />
                </div>
                <div class="user-detail">
                  <div
                    class="user-name click-active"
                    @click="handleUserClick(row.user_platform_id)"
                  >
                    {{ row.user_nick_name || "-" }}
                  </div>
                  <div class="user-id">ID：{{ row.user_id }}</div>
                  <div class="user-pid">PID：{{ row.user_platform_id }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="登录方式" min-width="180">
            <template #default="{ row }">
              <div class="info-value">
                {{ getLoginMethodText(row.login_method) }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="登录地点" width="160" align="left">
            <template #default="{ row }">
              <div class="info-value">{{ row.place || "-" }}</div>
            </template>
          </el-table-column>

          <el-table-column label="IP地址" width="140" align="center">
            <template #default="{ row }">
              <div class="info-value">{{ row.ip || "-" }}</div>
            </template>
          </el-table-column>

          <el-table-column label="登录环境" min-width="150" align="center">
            <template #default="{ row }">
              <div class="info-value">
                {{ getDeviceTypeText(row.device_type) }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="设备信息" min-width="300" align="left">
            <template #default="{ row }">
              <div class="compact-info" v-if="row.device_info">
                <div class="info-row">
                  <span class="info-label">设备ID</span>
                  <span class="info-value">{{
                    row.device_info.device_id || "-"
                  }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">设备名称</span>
                  <span class="info-value" style="line-height: 1.2">{{
                    row.device_info.device_name || "-"
                  }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">该设备登录次数</span>
                  <span class="info-value">{{
                    row.device_info.login_count || 0
                  }}</span>
                </div>
              </div>
              <div class="info-value" v-else style="color: #9ca3af">-</div>
            </template>
          </el-table-column>

          <el-table-column
            label="登录时间"
            width="250"
            align="center"
            fixed="right"
          >
            <template #default="{ row }">
              <div class="info-value">
                {{ dayjs(row.created_at).format("YYYY-MM-DD HH:mm:ss")
                }}<span style="color: var(--el-color-primary)"
                  >（{{ dayjs(row.created_at).fromNow() }}）</span
                >
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div class="footer-pagination-container">
          <el-pagination
            v-model:current-page="queryParams.page"
            v-model:page-size="queryParams.page_size"
            :page-sizes="[10, 20, 30, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="dataListTotal"
            @size-change="queryListData"
            @current-change="queryListData"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="loginRecord">
import {
  queryLoginRecordList,
  queryLoginRecordListFromTenant,
} from "@/api/user/users";
import { queryTenantOptions } from "@/api/tenantManage/tenant";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import { isSuperAdmin } from "@/utils/auth";

const router = useRouter();
const isRoot = isSuperAdmin();

// 登录方式映射
const loginMethodMap: Record<string, string> = {
  WX_H5: "微信公众号登录",
  WX_MP: "微信小程序登录",
  ALIPAY_MP: "支付宝小程序登录",
  PHONE_CAPT: "手机验证码登录",
  ADMIN: "后台登录",
};
// 设备类型映射
const deviceTypeMap: Record<string, string> = {
  WEB: "PC浏览器",
  H5: "手机浏览器",
  WX_H5: "微信公众号登录",
  WX_MP: "微信小程序登录",
  ALIPAY_MP: "支付宝小程序登录",
};

const loading = ref(false);
const dataList = ref<any[]>([]);
const dataListTotal = ref(0);
const tenantOptions = ref<any[]>([]);
const loginTimeRange = ref<any[]>([]);

// 时间选择器快捷选项
const dateShortcuts = [
  {
    text: "近1小时",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000);
      return [start, end];
    },
  },
  {
    text: "近24小时",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24);
      return [start, end];
    },
  },
  {
    text: "近一周",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: "近一个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      return [start, end];
    },
  },
  {
    text: "近三个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 3);
      return [start, end];
    },
  },
];

/** 禁用未来日期 */
const disabledDate = (time: Date) => {
  return time.getTime() > Date.now();
};

/** 点击用户名跳转到用户列表 */
const handleUserClick = (platformId: string) => {
  if (!platformId) return;
  router.push({
    path: "/admin/user/users",
    query: { platform_id: platformId },
  });
};

// 查询参数
const queryParams = ref({
  page: 1,
  page_size: 50,
  user_id: "",
  nick_name: "",
  platform_id: "",
  tenant_id: "",
  login_method: undefined as string | undefined,
  device_type: undefined as string | undefined,
  start_time: undefined as string | undefined,
  end_time: undefined as string | undefined,
});

/** 获取登录方式文本 */
const getLoginMethodText = (loginMethod: string) => {
  return loginMethodMap[loginMethod] || loginMethod || "-";
};

/** 获取设备类型文本 */
const getDeviceTypeText = (deviceType: string) => {
  return deviceTypeMap[deviceType] || deviceType || "-";
};

/** 重置查询 */
const handleReset = () => {
  loginTimeRange.value = [];
  queryParams.value = {
    page: 1,
    page_size: 50,
    user_id: "",
    nick_name: "",
    platform_id: "",
    tenant_id: "",
    login_method: undefined,
    device_type: undefined,
    start_time: undefined,
    end_time: undefined,
  };
  queryListData();
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

/** 获取列表数据 */
async function queryListData() {
  loading.value = true;
  try {
    const params: any = { ...queryParams.value };
    // 移除 undefined 值
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === "") {
        delete params[key];
      }
    });

    // 处理时间范围
    if (loginTimeRange.value && loginTimeRange.value.length > 0) {
      params.start_time = dayjs(loginTimeRange.value[0]).format(
        "YYYY-MM-DD HH:mm:ss",
      );
      params.end_time = dayjs(loginTimeRange.value[1]).format(
        "YYYY-MM-DD HH:mm:ss",
      );
    }

    let reqFn = queryLoginRecordList;
    if (!isRoot) {
      reqFn = queryLoginRecordListFromTenant;
    }

    const { data: response } = await reqFn(params);
    console.log(response.result);
    const rows = response.result.rows || [];

    for (let i = 0; i < rows.length; i++) {
      const item = rows[i];
      if (item.device_info) {
        try {
          item.device_info = JSON.parse(item.device_info);
        } catch (error) {
          console.log("解析device_info失败", error);
        }
      }
    }

    dataList.value = rows;
    dataListTotal.value = response.result.total || 0;
  } catch (error: any) {
    console.log(error);
    showToastFail(error.err_msg || "获取列表失败");
    dataList.value = [];
    dataListTotal.value = 0;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  queryListData();
  getTenantOptions();
});
</script>

<style lang="scss" scoped>
// 用户信息单元格（简化版）
.user-info-cell-simple {
  display: flex;
  align-items: center;
  gap: 12px;
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
    }

    .user-avatar-empty {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #8a8e99;
      font-size: 20px;
    }
  }

  .user-detail {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    line-height: 1.5;

    .user-name {
      font-size: 13px;
      font-weight: 500;
      color: #1f2937;
      line-height: 1.3;
      margin-bottom: 4px;
      transition: all 0.2s;

      &:hover {
        color: var(--el-color-primary);
        text-decoration: underline;
      }
    }

    .user-id {
      font-size: 12px;
      color: #6b7280;
      line-height: 1;
      margin-top: 3px;
    }

    .user-pid {
      font-size: 12px;
      color: #6b7280;
      line-height: 1;
      margin-top: 4px;
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
    gap: 8px;
    font-size: 13px;

    .info-label {
      color: #9ca3af;
      min-width: 32px;
    }

    .info-value {
      color: #374151;
      flex: 1;
    }
  }
}

.info-value {
  font-size: 13px;
  color: #374151;
}
</style>
