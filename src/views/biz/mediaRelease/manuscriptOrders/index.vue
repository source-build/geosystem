<template>
  <div class="manuscript-orders vertical-layout page-table-layout">
    <section class="release-filter-panel">
      <el-form :inline="true" size="small" @submit.prevent="handleSearch">
        <el-form-item label="订单号">
          <el-input v-model="queryParams.order_no" placeholder="请输入完整订单号" clearable style="width: 210px"
            @clear="handleSearch" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="稿件/媒体">
          <el-input v-model="queryParams.keyword" placeholder="搜索稿件标题或媒体名称" clearable style="width: 220px"
            @clear="handleSearch" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="投稿方式">
          <el-select v-model="queryParams.submission_mode" placeholder="全部" clearable style="width: 120px"
            @change="handleSearch">
            <el-option label="原创文章" :value="1" />
            <el-option label="转载链接" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 140px"
            @change="handleSearch">
            <el-option v-for="item in orderStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 240px" @change="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" native-type="submit">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </section>

    <div class="main">
      <div class="content">
        <div class="container-head justify-between mb-[10px]">
          <div class="container-head-column">
            <h5 class="container-label !mb-0">全部投稿</h5>
            <div class="order-type-tabs">
              <button
                v-for="tab in orderTypeTabs"
                :key="tab.label"
                type="button"
                class="order-type-tab"
                :class="{ [`is-type-${tab.value ?? 'all'}`]: true, 'is-active': selectedMediaType === tab.value }"
                @click="handleMediaTypeChange(tab.value)"
              >
                {{ tab.label }}
              </button>
            </div>
            <span class="release-total">共 {{ dataListTotal }} 条记录</span>
          </div>
          <el-button icon="RefreshRight" circle size="small" title="刷新列表" @click="refreshDemoOrders" />
        </div>

        <el-table :data="dataList" row-key="id" size="small" class="release-order-table">
          <el-table-column label="稿件与订单" min-width="300">
            <template #default="{ row }">
              <div class="manuscript-cell">
                <button type="button" class="manuscript-cell-title" :title="row.article_title" @click="openDetail(row)">
                  {{ row.article_title || "未命名稿件" }}
                </button>
                <div class="manuscript-cell-meta">
                  <span class="submission-mode" :class="`is-mode-${row.submission_mode}`">
                    {{ submissionModeLabel(row.submission_mode) }}
                  </span>
                  <span class="order-number">订单 {{ row.order_no || "-" }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="投稿媒体" min-width="175">
            <template #default="{ row }">
              <div class="media-cell">
                <span class="media-cell-mark">{{ getMediaInitial(row.provider_media_name) }}</span>
                <div class="media-cell-info">
                  <strong :title="row.provider_media_name">{{ row.provider_media_name || "未知媒体" }}</strong>
                  <span
                    v-if="Number(row.provider_media_type) === 6 && shortVideoPlatformLabel(row)"
                    class="media-subtype is-platform"
                  >
                    <img v-if="shortVideoPlatformIcon(row)" :src="shortVideoPlatformIcon(row)" :alt="shortVideoPlatformLabel(row)" />
                    {{ shortVideoPlatformLabel(row) }}
                  </span>
                  <span
                    v-else-if="row.provider_media_subtype && Number(row.provider_media_type) !== 3"
                    :class="['media-subtype', Number(row.provider_media_type) === 5 ? (isVideoSubtype(row) ? 'is-video' : 'is-image') : '']"
                  >
                    <el-icon v-if="Number(row.provider_media_type) === 5">
                      <VideoPlay v-if="isVideoSubtype(row)" />
                      <Picture v-else />
                    </el-icon>
                    {{ row.provider_media_subtype }}
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="媒体类型" width="112" align="center">
            <template #default="{ row }">
              <div class="media-type-cell">
                <span class="media-type-label" :class="`is-type-${row.provider_media_type}`">
                  {{ mediaTypeLabel(row.provider_media_type) }}
                </span>
                <span
                  v-if="Number(row.provider_media_type) === 3 && wechatPlacementLabel(row)"
                  class="wechat-placement-label"
                  :class="{ 'is-secondary': wechatPlacementLabel(row) === '普条' }"
                >
                  {{ wechatPlacementLabel(row) }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="投稿费用" width="120">
            <template #default="{ row }">
              <div class="cost-cell">
                <strong><em>{{ formatNumber(row.power) }}</em> 算力</strong>
                <span v-if="Number(row.refund_power) > 0" class="cost-refund">
                  已退 {{ formatNumber(row.refund_power) }} 算力
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="订单进度" width="130">
            <template #default="{ row }">
              <span class="order-status" :class="orderStatusMeta(row.status).className">
                <i></i>{{ orderStatusMeta(row.status).label }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="三方状态" width="120">
            <template #default="{ row }">
              <span
                v-if="Number(row.provider_status) !== 0"
                class="provider-status"
                :class="providerStatusMeta(row.provider_status).className"
              >
                <span>{{ providerStatusMeta(row.provider_status).label }}</span>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="时间相关" width="170" align="center">
            <template #default="{ row }">
              <div class="time-cell">
                <span><i>下单</i>{{ formatDateTime(row.created_at) }}</span>
                <span v-if="row.published_at" class="is-published-time">
                  <i>出稿</i>{{ formatDateTime(row.published_at) }}
                </span>
                <span v-else><i>更新</i>{{ formatDateTime(row.updated_at) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="195" fixed="right" align="center">
            <template #default="{ row }">
              <div class="row-actions">
                <span class="result-pending" :class="{ 'is-success': row.status === 3 || row.status === 6 }">
                  {{ resultText(row) }}
                </span>
                <el-button type="primary" link icon="View" @click="openDetail(row)">详情</el-button>
                <el-dropdown
                  v-if="hasRowAction(row)"
                  trigger="click"
                  @command="(command: string) => handleRowAction(command, row)"
                >
                  <el-button type="primary" link>
                    更多<el-icon class="row-actions-more-icon"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item v-if="rowActionAvailability(row).withdraw" command="withdraw">退单</el-dropdown-item>
                      <el-dropdown-item v-if="rowActionAvailability(row).urge" command="urge">催稿</el-dropdown-item>
                      <el-dropdown-item v-if="rowActionAvailability(row).refund" command="refund">申请退款</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="暂无符合条件的投稿记录" :image-size="72" />
          </template>
        </el-table>

        <div class="footer-pagination-container">
          <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.page_size" size="small"
            :page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next, jumper" :total="dataListTotal" />
        </div>
      </div>
    </div>

    <el-dialog v-model="detailDialogShow" title="投稿订单详情" width="70vw" append-to-body align-center
      destroy-on-close class="submission-order-detail-dialog">
      <div v-if="detailData" class="submission-order-detail">
        <header class="detail-overview">
          <div class="detail-overview-identity">
            <span class="order-status" :class="orderStatusMeta(detailData.status).className">
              <i></i>{{ orderStatusMeta(detailData.status).label }}
            </span>
            <div class="detail-overview-order">
              <span>订单号</span>
              <strong>{{ detailData.order_no || "-" }}</strong>
            </div>
          </div>
          <div class="detail-overview-facts">
            <div><span>投稿方式</span><strong>{{ submissionModeLabel(detailData.submission_mode) }}</strong></div>
            <div><span>投稿媒体</span><strong>{{ detailData.provider_media_name || "-" }}</strong></div>
            <div><span>消耗算力</span><strong class="is-power">{{ formatNumber(detailData.power) }}</strong></div>
          </div>
          <div class="detail-overview-actions">
            <span v-if="Number(detailData.status) === 5" class="detail-actions-hint">
              该体验订单用于展示异常状态，完整版支持人工协助处理
            </span>
            <template v-else>
              <el-button v-if="rowActionAvailability(detailData).withdraw" size="small" type="danger" plain
                @click="handleRowAction('withdraw', detailData)">
                <el-icon><RefreshLeft /></el-icon>退单
              </el-button>
              <el-button v-if="rowActionAvailability(detailData).urge" size="small" type="primary" plain
                @click="handleRowAction('urge', detailData)">
                <el-icon><Bell /></el-icon>催稿
              </el-button>
              <el-button v-if="rowActionAvailability(detailData).refund" size="small" type="warning" plain
                @click="handleRowAction('refund', detailData)">
                <el-icon><Coin /></el-icon>申请退款
              </el-button>
            </template>
          </div>
        </header>

        <div class="detail-grid">
          <div class="detail-primary">
            <section class="manuscript-detail-section">
              <div class="detail-section-head manuscript-detail-head">
                <div><el-icon><Document /></el-icon><h4>稿件内容</h4></div>
                <div class="detail-material-actions">
                  <el-button size="small" icon="Upload" @click="gateCapability('素材上传', 'upload')">上传素材</el-button>
                  <el-button size="small" icon="Connection" @click="gateCapability('媒体授权', 'authorize')">授权媒体账号</el-button>
                </div>
              </div>
              <div class="manuscript-detail-meta">
                <span class="submission-mode" :class="`is-mode-${detailData.submission_mode}`">
                  {{ submissionModeLabel(detailData.submission_mode) }}
                </span>
                <span>{{ mediaTypeLabel(detailData.provider_media_type) }}</span>
                <span v-if="detailData.provider_media_subtype">{{ detailData.provider_media_subtype }}</span>
              </div>
              <h3>{{ detailData.article_title }}</h3>
              <div class="markdown-preview-container">
                <MdPreview
                  :model-value="detailData.article_content"
                  preview-theme="github"
                  code-theme="github"
                  :no-highlight="true"
                  :no-katex="true"
                  :no-mermaid="true"
                  :no-echarts="true"
                />
              </div>
              <div class="publishing-requirements">
                <h5>发布要求</h5>
                <ul><li v-for="item in detailData.requirements" :key="item">{{ item }}</li></ul>
                <p v-if="detailData.remark"><strong>订单备注：</strong>{{ detailData.remark }}</p>
              </div>
            </section>
          </div>

          <aside class="detail-sidebar">
            <section class="detail-section info-section">
              <div class="detail-section-head"><div><el-icon><Tickets /></el-icon><h4>订单信息</h4></div></div>
              <dl>
                <div><dt>媒体类型</dt><dd>{{ mediaTypeLabel(detailData.provider_media_type) }}</dd></div>
                <div v-if="detailData.provider_media_subtype"><dt>投稿子类型</dt><dd>{{ detailData.provider_media_subtype }}</dd></div>
                <div><dt>渠道状态</dt><dd :class="providerStatusMeta(detailData.provider_status).detailClassName">{{ providerStatusMeta(detailData.provider_status).label }}</dd></div>
                <div><dt>算力状态</dt><dd :class="powerStatusMeta(detailData).className">{{ powerStatusMeta(detailData).label }}</dd></div>
                <div v-if="Number(detailData.refund_power) > 0"><dt>退款算力</dt><dd class="is-success">{{ formatNumber(detailData.refund_power) }}</dd></div>
                <div><dt>下单时间</dt><dd>{{ formatDateTime(detailData.created_at) }}</dd></div>
                <div><dt>更新时间</dt><dd>{{ formatDateTime(detailData.updated_at) }}</dd></div>
              </dl>
            </section>
            <section class="detail-section timeline-section">
              <div class="detail-section-head">
                <div><el-icon class="is-info"><Clock /></el-icon><h4>订单进度</h4></div>
                <el-radio-group v-model="timelineView" size="small" class="timeline-view-switch">
                  <el-radio-button value="order">订单进度</el-radio-button>
                  <el-radio-button value="power">算力进度</el-radio-button>
                </el-radio-group>
              </div>
              <el-timeline>
                <el-timeline-item v-for="item in activeTimeline" :key="item.key" :timestamp="item.time"
                  :type="timelineItemType(item.status)" :hollow="item.status === 'wait'" placement="top">
                  <div class="timeline-node" :class="`is-${item.status}`">
                    <div class="timeline-node-title">
                      <strong>{{ item.title }}</strong>
                      <span v-if="item.isCurrent" class="timeline-current-label">当前</span>
                    </div>
                    <p>{{ item.description }}</p>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </section>
          </aside>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="ManuscriptOrders">
import { computed, reactive, ref, watch } from "vue";
import { MdPreview } from "md-editor-v3";
import "md-editor-v3/lib/preview.css";
import { showToastOk } from "@/components/f-toast";
import { useDemoGate } from "@/composables/useDemoGate";
import { demoOrders, type DemoOrder } from "../demoData";

type DateRange = [string, string] | [] | null;
type TimelineStatus = "finish" | "process" | "error" | "wait";
type TimelineNode = { key: string; title: string; description: string; time?: string; status: TimelineStatus; isCurrent?: boolean };

interface QueryParams {
  page: number;
  page_size: number;
  order_no: string;
  keyword: string;
  submission_mode: number | undefined;
  status: number | undefined;
  provider_media_type: number | undefined;
}

const { requireFullEdition } = useDemoGate("mediaRelease");
const orderStatusOptions = [
  { label: "待提交", value: 1 }, { label: "处理中", value: 2 }, { label: "已出稿", value: 3 },
  { label: "退款处理中", value: 4 }, { label: "异常待处理", value: 5 }, { label: "已完成", value: 6 },
  { label: "已退款", value: 7 }, { label: "已关闭", value: 8 },
];
const orderTypeTabs = [
  { value: undefined, label: "全部" }, { value: 1, label: "网媒" }, { value: 2, label: "自媒体" },
  { value: 3, label: "公众号" }, { value: 4, label: "微博" }, { value: 5, label: "小红书" },
  { value: 6, label: "短视频" },
] as Array<{ value: number | undefined; label: string }>;
const queryParams = reactive<QueryParams>({
  page: 1, page_size: 10, order_no: "", keyword: "", submission_mode: undefined,
  status: undefined, provider_media_type: undefined,
});
const dateRange = ref<DateRange>([]);
const selectedMediaType = ref<number | undefined>(undefined);
const detailDialogShow = ref(false);
const detailData = ref<DemoOrder | null>(null);
const timelineView = ref<"order" | "power">("order");

const filteredOrders = computed(() => demoOrders.filter((row) => {
  const keyword = queryParams.keyword.trim().toLowerCase();
  const orderNo = queryParams.order_no.trim().toLowerCase();
  const createdDate = row.created_at.slice(0, 10);
  const dateMatches = !Array.isArray(dateRange.value) || dateRange.value.length !== 2
    || (createdDate >= dateRange.value[0] && createdDate <= dateRange.value[1]);
  return (!orderNo || row.order_no.toLowerCase().includes(orderNo))
    && (!keyword || row.article_title.toLowerCase().includes(keyword) || row.provider_media_name.toLowerCase().includes(keyword))
    && (queryParams.submission_mode === undefined || row.submission_mode === queryParams.submission_mode)
    && (queryParams.status === undefined || row.status === queryParams.status)
    && (queryParams.provider_media_type === undefined || row.provider_media_type === queryParams.provider_media_type)
    && dateMatches;
}));
const dataListTotal = computed(() => filteredOrders.value.length);
const dataList = computed(() => filteredOrders.value.slice(
  (queryParams.page - 1) * queryParams.page_size,
  queryParams.page * queryParams.page_size,
));

const orderTimeline = computed<TimelineNode[]>(() => {
  const detail = detailData.value;
  if (!detail) return [];
  const nodes: TimelineNode[] = [
    { key: "created", title: "订单创建", description: `已创建投稿订单并冻结 ${formatNumber(detail.power)} 算力`, time: formatDateTime(detail.created_at), status: "finish" },
  ];
  if (detail.status !== 1) nodes.push({ key: "submitted", title: "提交媒体", description: `稿件已提交至 ${detail.provider_media_name}`, time: formatDateTime(detail.created_at), status: "finish" });
  if (detail.published_at) nodes.push({ key: "published", title: "出稿成功", description: `稿件已由 ${detail.provider_media_name} 发布`, time: formatDateTime(detail.published_at), status: "finish", isCurrent: [3, 6].includes(detail.status) });
  if (detail.status === 2) nodes.push({ key: "processing", title: detail.provider_status === 2 ? "渠道已收稿" : "渠道待处理", description: detail.provider_status === 2 ? "媒体已接收稿件，等待发布" : "稿件已进入渠道处理队列", time: formatDateTime(detail.updated_at), status: "process", isCurrent: true });
  if (detail.status === 5) nodes.push({ key: "exception", title: "订单处理异常", description: detail.remark || "订单处理出现异常，等待人工确认", time: formatDateTime(detail.updated_at), status: "error", isCurrent: true });
  if (detail.status === 7) nodes.push({ key: "refunded", title: "退款成功", description: `已退还 ${formatNumber(detail.refund_power)} 算力`, time: formatDateTime(detail.updated_at), status: "finish", isCurrent: true });
  if (detail.status === 6) nodes.push({ key: "completed", title: "订单已完成", description: "订单服务流程已结束", time: formatDateTime(detail.updated_at), status: "finish", isCurrent: true });
  return nodes.reverse();
});
const powerTimeline = computed<TimelineNode[]>(() => {
  const detail = detailData.value;
  if (!detail) return [];
  const frozen: TimelineNode = { key: "frozen", title: "算力已冻结", description: `已冻结 ${formatNumber(detail.power)} 算力`, time: formatDateTime(detail.created_at), status: "finish" };
  if (detail.status === 7) return [
    { key: "refunded", title: "算力已退还", description: `已退还 ${formatNumber(detail.refund_power)} 算力`, time: formatDateTime(detail.updated_at), status: "finish", isCurrent: true },
    { key: "deducted", title: "算力已扣除", description: `已扣除 ${formatNumber(detail.power)} 算力`, time: formatDateTime(detail.published_at || detail.updated_at), status: "finish" },
    frozen,
  ];
  if ([3, 6].includes(detail.status)) return [
    { key: "deducted", title: "算力已扣除", description: `已扣除 ${formatNumber(detail.power)} 算力`, time: formatDateTime(detail.published_at || detail.updated_at), status: "finish", isCurrent: true },
    frozen,
  ];
  if (detail.status === 5) return [{ key: "power-exception", title: "等待算力处理", description: "异常订单的算力保持冻结，等待人工确认", time: formatDateTime(detail.updated_at), status: "error", isCurrent: true }, frozen];
  return [{ ...frozen, isCurrent: true }];
});
const activeTimeline = computed(() => timelineView.value === "order" ? orderTimeline.value : powerTimeline.value);

const orderStatusMap: Record<number, { label: string; className: string }> = {
  1: { label: "待提交", className: "is-waiting" }, 2: { label: "处理中", className: "is-processing" },
  3: { label: "已出稿", className: "is-published" }, 4: { label: "退款处理中", className: "is-refunding" },
  5: { label: "异常待处理", className: "is-exception" }, 6: { label: "已完成", className: "is-completed" },
  7: { label: "已退款", className: "is-refunded" }, 8: { label: "已关闭", className: "is-closed" },
};
const providerStatusMap: Record<number, { label: string; className: string; detailClassName: string }> = {
  0: { label: "未知", className: "is-unknown", detailClassName: "is-info" },
  1: { label: "未处理", className: "is-waiting", detailClassName: "is-info" },
  2: { label: "已收稿", className: "is-processing", detailClassName: "is-processing" },
  3: { label: "已出稿", className: "is-published", detailClassName: "is-success" },
  4: { label: "申请退款", className: "is-refunding", detailClassName: "is-warning" },
  5: { label: "拒绝退款", className: "is-exception", detailClassName: "is-danger" },
  6: { label: "撤稿", className: "is-closed", detailClassName: "is-danger" },
};
const mediaTypeNames: Record<number, string> = { 1: "网媒", 2: "自媒体", 3: "公众号", 4: "微博", 5: "小红书", 6: "短视频" };
const shortVideoIcons: Record<string, string> = { 抖音: "images/douyin.svg", 视频号: "images/shipinghao.svg", 快手: "images/kuaishou.svg", 西瓜视频: "images/xiguaship.svg" };

function handleSearch() { queryParams.page = 1; }
function handleReset() {
  Object.assign(queryParams, { page: 1, page_size: 10, order_no: "", keyword: "", submission_mode: undefined, status: undefined, provider_media_type: undefined });
  selectedMediaType.value = undefined;
  dateRange.value = [];
}
function handleMediaTypeChange(value: number | undefined) {
  if (selectedMediaType.value === value) return;
  selectedMediaType.value = value;
  queryParams.provider_media_type = value;
  queryParams.page = 1;
}
function refreshDemoOrders() { queryParams.page = 1; showToastOk("已刷新本地投稿快照"); }
function openDetail(row: DemoOrder) { detailData.value = row; timelineView.value = "order"; detailDialogShow.value = true; }
function getMediaInitial(name?: string) { return (name || "媒").trim().slice(0, 1); }
function wechatPlacementLabel(row: DemoOrder) { return Number(row.provider_media_type) === 3 ? row.provider_media_subtype || "" : ""; }
function isVideoSubtype(row: DemoOrder) { return /视频/.test(String(row.provider_media_subtype || "")); }
function shortVideoPlatformLabel(row: DemoOrder) { return String(row.provider_media_channel || "").trim(); }
function shortVideoPlatformIcon(row: DemoOrder) { const icon = shortVideoIcons[shortVideoPlatformLabel(row)]; return icon ? `${import.meta.env.BASE_URL}${icon}` : ""; }
function submissionModeLabel(mode?: number) { return ({ 1: "原创", 2: "转载" } as Record<number, string>)[Number(mode)] || "未知方式"; }
function mediaTypeLabel(type?: number) { return mediaTypeNames[Number(type)] || "未知媒体类型"; }
function formatNumber(value: unknown) { return Number.isFinite(Number(value)) ? Number(value).toLocaleString("zh-CN", { maximumFractionDigits: 2 }) : "0"; }
function formatDateTime(value?: string) { return value ? value.replace("T", " ").replace(/\+.*$/, "").slice(0, 16) : "-"; }
function orderStatusMeta(status?: number) { return orderStatusMap[Number(status)] || { label: "未知状态", className: "is-closed" }; }
function providerStatusMeta(status?: number) { return providerStatusMap[Number(status)] || providerStatusMap[0]; }
function resultText(row: DemoOrder) { if ([3, 6].includes(row.status)) return "已出稿"; if (row.status === 7) return "已退款"; if (row.status === 8) return "已关闭"; if (row.status === 5) return "异常待处理"; return "暂未出稿"; }
function rowActionAvailability(row: DemoOrder) { return { withdraw: row.status === 2 && [0, 1].includes(row.provider_status), urge: row.status === 2 && row.provider_status === 2, refund: row.status === 3 || (row.status === 2 && row.provider_status === 2) }; }
function hasRowAction(row: DemoOrder) { const actions = rowActionAvailability(row); return actions.withdraw || actions.urge || actions.refund; }
function powerStatusMeta(row: DemoOrder) {
  if (row.status === 7) return { label: `已退还 ${formatNumber(row.refund_power)} 算力`, className: "is-success" };
  if ([3, 6].includes(row.status)) return { label: `已扣除 ${formatNumber(row.power)} 算力`, className: "is-success" };
  if (row.status === 5) return { label: `已冻结 ${formatNumber(row.power)} 算力`, className: "is-danger" };
  return { label: `已冻结 ${formatNumber(row.power)} 算力`, className: "is-warning" };
}
function timelineItemType(status: TimelineStatus) { return ({ finish: "success", process: "primary", error: "danger", wait: "info" } as const)[status]; }
function gateCapability(capability: string, action: "upload" | "authorize") {
  return requireFullEdition(capability, action, `${capability}属于完整版能力。体验版不会上传文件、发起授权或绑定媒体账号。`);
}
function handleRowAction(action: string, row: DemoOrder) {
  const meta = {
    withdraw: ["订单退单", "withdraw", "退单会修改真实投稿状态"],
    urge: ["订单催稿", "urge", "催稿会通知真实媒体服务方"],
    refund: ["订单退款", "refund", "退款申请涉及真实订单与资金流程"],
  } as const;
  const current = meta[action as keyof typeof meta];
  if (!current) return;
  return requireFullEdition(current[0], current[1], `${current[2]}。当前订单「${row.order_no}」为虚构数据，体验版不会执行任何变更。`);
}

watch([() => queryParams.page_size, dataListTotal], () => {
  const maxPage = Math.max(1, Math.ceil(dataListTotal.value / queryParams.page_size));
  if (queryParams.page > maxPage) queryParams.page = maxPage;
});
watch(detailDialogShow, (visible) => { if (!visible) detailData.value = null; });
</script>

<style lang="scss" scoped>
.manuscript-orders {
  .release-filter-panel {
    padding: 12px 16px 2px;
    margin-bottom: 10px;
    border-radius: 8px;
    background: #fff;
    :deep(.el-form-item) { margin-right: 14px; margin-bottom: 10px; }
  }
  .container-head-column {
    display: flex; align-items: center; gap: 12px;
    .release-total { color: var(--el-text-color-secondary); font-size: 12px; }
  }
  .order-type-tabs {
    display: flex; align-items: center; gap: 4px; padding: 3px; border-radius: 8px; background: var(--el-fill-color-light);
    .order-type-tab {
      padding: 4px 12px; border: 0; border-radius: 6px; background: transparent; color: var(--el-text-color-regular);
      cursor: pointer; font-size: 12px; line-height: 18px; transition: background-color 0.18s ease, color 0.18s ease;
      &:hover { color: var(--el-color-primary); }
      &:focus-visible { outline: 2px solid var(--el-color-primary-light-5); outline-offset: 1px; }
      &.is-active { background: var(--el-bg-color); box-shadow: 0 1px 2px rgb(0 0 0 / 8%); color: var(--el-color-primary); font-weight: 600; }
      &.is-type-1.is-active { color: #d97706; } &.is-type-2.is-active { color: #4cad2e; }
      &.is-type-3.is-active { color: #0f9f8e; } &.is-type-4.is-active { color: #e66b78; }
      &.is-type-5.is-active { color: #e8505b; } &.is-type-6.is-active { color: #6279dc; }
    }
  }
  :deep(.release-order-table) {
    .el-table__header th { height: 42px; background: var(--el-fill-color-light); color: var(--el-text-color-secondary); font-weight: 500; }
    .el-table__row { height: 72px; td { padding: 10px 0; } &:hover > td.el-table__cell { background: var(--el-fill-color-light); } }
  }
  .manuscript-cell {
    min-width: 0;
    .manuscript-cell-title {
      display: block; max-width: 100%; padding: 0; border: 0; background: transparent; color: var(--el-text-color-primary);
      cursor: pointer; font-size: 13px; font-weight: 600; line-height: 1.45; overflow-wrap: anywhere; text-align: left;
      white-space: normal; transition: color 0.2s;
      &:hover { color: var(--el-color-primary); }
    }
    .manuscript-cell-meta {
      display: flex; align-items: center; gap: 9px; min-width: 0; margin-top: 7px;
      .order-number { overflow: hidden; color: var(--el-text-color-secondary); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
    }
  }
  .submission-mode {
    flex-shrink: 0; padding: 3px 8px; border-radius: 4px; font-size: 11px; line-height: 1.2;
    &.is-mode-1 { background: var(--el-color-success-light-9); color: var(--el-color-success); }
    &.is-mode-2 { background: var(--el-color-warning-light-9); color: var(--el-color-warning); }
  }
  .media-cell {
    display: flex; align-items: center; gap: 6px; min-width: 0;
    .media-cell-mark { display: flex; width: 32px; height: 32px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 6px; background: var(--el-color-primary-light-9); color: var(--el-color-primary); font-size: 14px; font-weight: 600; }
    .media-cell-info {
      display: flex; min-width: 0; flex-direction: column; line-height: 1.2;
      strong, span { display: flex; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      strong { color: var(--el-text-color-primary); font-size: 12px; font-weight: 600; }
      span { margin-top: 3px; color: var(--el-text-color-secondary); font-size: 11px; }
      .media-subtype {
        &.is-image, &.is-video, &.is-platform { display: inline-flex; width: fit-content; max-width: 100%; align-items: center; gap: 3px; padding: 1px 7px; border-radius: 4px; font-size: 10.5px; line-height: 16px; }
        .el-icon { flex-shrink: 0; font-size: 11px; }
        &.is-image { background: #fff0f2; color: #e6455a; }
        &.is-video { background: #fff5e8; color: #d97706; }
        &.is-platform { gap: 4px; padding: 0; color: var(--el-text-color-secondary); img { width: 13px; height: 13px; flex-shrink: 0; object-fit: contain; } }
      }
    }
  }
  .media-type-cell {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    .media-type-label {
      display: inline-flex; min-width: 48px; align-items: center; justify-content: center; padding: 3px 8px; border-radius: 999px;
      background: var(--el-color-info); color: #fff; font-size: 11px; font-weight: 500; line-height: 16px; white-space: nowrap;
      &.is-type-1 { background: #d97706; } &.is-type-2 { background: #4cad2e; } &.is-type-3 { background: #0f9f8e; }
      &.is-type-4 { background: #e66b78; } &.is-type-5 { background: #e8505b; } &.is-type-6 { background: #6279dc; }
    }
    .wechat-placement-label { padding: 1px 6px; border-radius: 3px; background: var(--el-color-primary-light-9); color: var(--el-color-primary); font-size: 10px; line-height: 15px; &.is-secondary { background: var(--el-color-warning-light-9); color: var(--el-color-warning-dark-2); } }
  }
  .cost-cell {
    display: flex; flex-direction: column; align-items: flex-start; line-height: 1.25;
    strong { color: var(--el-text-color-regular); font-size: 11px; font-weight: 500; em { color: var(--el-color-warning); font-size: 15px; font-style: normal; font-weight: 700; } }
    > span { margin-top: 5px; color: var(--el-text-color-secondary); font-size: 11px; &.cost-refund { color: var(--el-color-success); } }
  }
  .time-cell {
    display: flex; flex-direction: column;
    span { display: flex; align-items: center; color: var(--el-text-color-regular); font-size: 11px; line-height: 1.8; white-space: nowrap; i { min-width: 28px; margin-right: 6px; color: var(--el-text-color-secondary); font-style: normal; } &.is-published-time, &.is-published-time i { color: var(--el-color-success); } }
  }
  .row-actions {
    display: flex; align-items: center; justify-content: center; gap: 12px;
    :deep(.el-link), :deep(.el-button) { margin: 0; font-size: 12px; }
    .row-actions-more-icon { margin-left: 2px; font-size: 11px; }
  }
  .order-status {
    display: inline-flex; align-items: center; gap: 7px; color: var(--el-text-color-regular); font-size: 12px; white-space: nowrap;
    i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    &.is-waiting, &.is-refunding { color: var(--el-color-warning); }
    &.is-processing { color: var(--el-color-primary); i { animation: order-status-breathing 1.6s ease-in-out infinite; } }
    &.is-published, &.is-completed { color: var(--el-color-success); }
    &.is-exception { color: var(--el-color-danger); }
    &.is-refunded, &.is-closed { color: var(--el-color-info); }
  }
  .provider-status {
    display: inline-flex; overflow: hidden; align-items: stretch; border-radius: 4px; background: var(--el-fill-color-light); color: var(--el-text-color-secondary); font-size: 11px; line-height: 20px; white-space: nowrap;
    > span { padding: 0 8px; font-weight: 500; }
    &.is-waiting, &.is-refunding { background: var(--el-color-warning-light-9); color: var(--el-color-warning-dark-2); }
    &.is-processing { background: var(--el-color-primary-light-9); color: var(--el-color-primary-dark-2); }
    &.is-published { background: var(--el-color-success-light-9); color: var(--el-color-success-dark-2); }
    &.is-exception, &.is-closed { background: var(--el-color-danger-light-9); color: var(--el-color-danger-dark-2); }
  }
  .result-pending { color: var(--el-text-color-secondary); font-size: 12px; &.is-success { color: var(--el-color-success); } }
}

:global(.submission-order-detail-dialog .el-dialog__body) {
  display: flex; flex-direction: column; box-sizing: border-box; height: min(780px, calc(100dvh - 160px));
  padding-top: 12px; padding-bottom: 16px; overflow: hidden;
}
.submission-order-detail {
  display: flex; flex: 1; min-height: 0; flex-direction: column; color: var(--el-text-color-regular);
  .detail-overview {
    display: flex; flex-shrink: 0; align-items: center; justify-content: space-between; gap: 24px; padding: 4px 0 10px; border-bottom: 1px solid var(--el-border-color-lighter);
    .detail-overview-identity, .detail-overview-facts { display: flex; align-items: center; }
    .detail-overview-identity { gap: 16px; }
    .detail-overview-order, .detail-overview-facts > div { span, strong { display: block; } span { color: var(--el-text-color-secondary); font-size: 11px; } strong { margin-top: 4px; color: var(--el-text-color-primary); font-size: 13px; font-weight: 600; } }
    .detail-overview-order { padding-left: 16px; border-left: 1px solid var(--el-border-color-lighter); strong { font-size: 14px; } }
    .detail-overview-facts {
      align-items: stretch; margin-left: auto;
      > div { min-width: 108px; padding: 0 16px; border-left: 1px solid var(--el-border-color-lighter); &:first-child { border-left: 0; } strong { overflow: hidden; max-width: 160px; text-overflow: ellipsis; white-space: nowrap; } .is-power { color: var(--el-color-warning); font-size: 16px; } }
    }
    .detail-overview-actions {
      display: flex; flex-shrink: 0; align-items: center; justify-content: flex-end; padding-left: 16px; border-left: 1px solid var(--el-border-color-lighter);
      :deep(.el-button) { display: inline-flex; align-items: center; gap: 4px; margin: 0; .el-icon { font-size: 13px; } + .el-button { margin-left: 8px; } }
    }
  }
  .order-status { display: inline-flex; align-items: center; gap: 7px; font-size: 12px; white-space: nowrap; i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; } &.is-waiting, &.is-refunding { color: var(--el-color-warning); } &.is-processing { color: var(--el-color-primary); } &.is-published, &.is-completed { color: var(--el-color-success); } &.is-exception { color: var(--el-color-danger); } &.is-refunded, &.is-closed { color: var(--el-color-info); } }
  .detail-grid {
    display: grid; flex: 1; grid-template-columns: minmax(0, 1.7fr) minmax(260px, 0.7fr); min-height: 0; gap: 24px;
    .detail-primary, .detail-sidebar { min-width: 0; }
    .detail-primary { display: flex; min-height: 0; height: 100%; }
    .detail-sidebar { display: flex; height: 100%; min-height: 0; flex-direction: column; padding-left: 24px; border-left: 1px solid var(--el-border-color-lighter); }
  }
  .detail-actions-hint { display: block; max-width: 240px; color: var(--el-color-warning); font-size: 12px; line-height: 1.5; text-align: right; }
  .detail-section { padding: 14px 0; border-bottom: 1px solid var(--el-border-color-lighter); &:last-child { border-bottom: 0; } }
  .detail-section-head {
    display: flex; align-items: center; justify-content: space-between; padding-right: 5px; margin-bottom: 16px;
    > div { display: flex; align-items: center; gap: 7px; }
    .el-icon { color: var(--el-color-primary); font-size: 16px; &.is-info { color: var(--el-color-info); } }
    h4 { margin: 0; color: var(--el-text-color-primary); font-size: 14px; font-weight: 600; }
  }
  .manuscript-detail-section {
    display: flex; width: 100%; min-height: 0; flex-direction: column; padding: 20px 0;
    .manuscript-detail-head { flex-shrink: 0; }
    .detail-material-actions { display: flex; gap: 8px; }
    .manuscript-detail-meta { display: flex; align-items: center; gap: 8px; color: var(--el-text-color-secondary); font-size: 12px; }
    > h3 { margin: 14px 0 12px; color: var(--el-text-color-primary); font-size: 20px; line-height: 1.5; }
    .markdown-preview-container { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; border-top: 1px solid var(--el-border-color-lighter); border-bottom: 1px solid var(--el-border-color-lighter); }
    :deep(.md-editor) { background: transparent; }
    :deep(.md-editor-preview-wrapper) { padding: 18px 4px; }
    :deep(.md-editor-preview) { color: var(--el-text-color-regular); font-size: 14px; }
    .publishing-requirements {
      flex-shrink: 0; padding-top: 14px;
      h5 { margin: 0 0 8px; color: var(--el-text-color-primary); font-size: 13px; }
      ul { display: flex; flex-wrap: wrap; gap: 6px 20px; padding-left: 18px; margin: 0; color: var(--el-text-color-regular); font-size: 12px; line-height: 1.7; }
      p { padding: 8px 10px; margin: 10px 0 0; border-radius: 5px; background: var(--el-fill-color-light); color: var(--el-text-color-secondary); font-size: 12px; line-height: 1.6; }
    }
  }
  .info-section dl {
    margin: 0;
    div { display: grid; grid-template-columns: 82px minmax(0, 1fr); gap: 14px; padding: 10px 0; border-bottom: 1px solid var(--el-border-color-lighter); &:first-child { padding-top: 0; } &:last-child { padding-bottom: 0; border-bottom: 0; } dt { color: var(--el-text-color-secondary); font-size: 12px; } dd { margin: 0; overflow-wrap: anywhere; color: var(--el-text-color-regular); font-size: 12px; text-align: right; &.is-success { color: var(--el-color-success); font-weight: 600; } &.is-warning { color: var(--el-color-warning); font-weight: 600; } &.is-info { color: var(--el-text-color-secondary); font-weight: 600; } &.is-processing { color: var(--el-color-primary); font-weight: 600; } &.is-danger { color: var(--el-color-danger); font-weight: 600; } } }
  }
  .timeline-section {
    display: grid; grid-template-rows: auto minmax(0, 1fr); flex: 1; min-height: 0; overflow: hidden;
    .detail-section-head { margin-bottom: 12px; .timeline-view-switch { flex-shrink: 0; gap: 0; } }
    :deep(.el-timeline) { min-height: 0; padding-left: 4px; margin-bottom: 0; overflow-y: auto; overscroll-behavior: contain; }
    :deep(.el-timeline-item__timestamp) { margin-bottom: 3px; color: var(--el-text-color-secondary); font-size: 11px; }
    :deep(.el-timeline-item__content) { color: var(--el-text-color-regular); font-size: 12px; }
    :deep(.el-timeline-item:last-child) { padding-bottom: 0; }
    .timeline-node {
      .timeline-node-title { display: flex; align-items: center; gap: 6px; }
      strong { display: block; color: var(--el-text-color-primary); font-size: 13px; font-weight: 600; line-height: 1.5; }
      p { margin: 4px 0 0; color: var(--el-text-color-secondary); font-size: 12px; line-height: 1.6; white-space: pre-wrap; }
      .timeline-current-label { padding: 0 5px; border-radius: 3px; background: var(--el-color-primary-light-9); color: var(--el-color-primary); font-size: 10px; font-weight: 500; line-height: 16px; }
      &.is-process strong { color: var(--el-color-primary); }
      &.is-error strong, &.is-error p { color: var(--el-color-danger); }
      &.is-error .timeline-current-label { background: var(--el-color-danger-light-9); color: var(--el-color-danger); }
      &.is-wait strong { color: var(--el-text-color-secondary); }
    }
  }
}

@keyframes order-status-breathing {
  0%, 100% { box-shadow: 0 0 0 0 transparent; transform: scale(1); }
  50% { box-shadow: 0 0 0 3px var(--el-color-primary-light-9); transform: scale(1.05); }
}
@media (prefers-reduced-motion: reduce) { .manuscript-orders .order-status.is-processing i { animation: none; } }
@media (max-width: 760px) {
  .manuscript-orders {
    .release-filter-panel :deep(.el-form-item) { display: flex; margin-right: 0; }
    .release-filter-panel :deep(.el-form-item__content > *) { width: 100% !important; }
    .container-head-column { align-items: flex-start; flex-direction: column; }
    .order-type-tabs { max-width: 100%; overflow-x: auto; }
  }
  :global(.submission-order-detail-dialog) { width: 92vw !important; }
  :global(.submission-order-detail-dialog .el-dialog__body) { display: block; height: auto; max-height: calc(100dvh - 132px); overflow-y: auto; }
  .submission-order-detail {
    .detail-overview {
      align-items: flex-start; flex-direction: column;
      .detail-overview-facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); width: 100%; margin-left: 0; > div { min-width: 0; padding: 0 10px; &:first-child { padding-left: 0; } strong { max-width: 100%; } } }
      .detail-overview-actions { width: 100%; padding: 12px 0 0; border-left: 0; .detail-actions-hint { max-width: 100%; text-align: left; } }
    }
    .detail-grid { grid-template-columns: minmax(0, 1fr); .detail-primary { height: auto; } .detail-sidebar { height: auto; padding: 20px 0 0; border-top: 1px solid var(--el-border-color-lighter); border-left: 0; } }
    .manuscript-detail-section { .manuscript-detail-head { align-items: flex-start; flex-direction: column; gap: 12px; } .detail-material-actions { flex-wrap: wrap; } .markdown-preview-container { max-height: none; overflow: visible; } }
    .timeline-section { flex: none; min-height: auto; }
  }
}
</style>
