<template>
  <section class="editor-panel build-status-panel">
    <div class="panel-head">
      <h3>构建状态</h3>
      <div class="head-actions">
        <span v-if="elapsed" class="elapsed">耗时 {{ elapsed }}</span>
        <span v-if="build" :class="['status-pill', statusTone]">
          <span class="pill-dot" />
          {{ statusLabel }}
        </span>
        <el-button v-if="build && !isTerminalBuild" text size="small" type="danger" @click="handleCancel">
          取消构建
        </el-button>
        <el-tooltip v-if="hasData" content="清除本次构建记录" placement="top">
          <button class="clear-btn" type="button" @click="emit('clear')">
            <el-icon><Delete /></el-icon>
          </button>
        </el-tooltip>
      </div>
    </div>

    <!-- 总进度 -->
    <div v-if="build" class="progress-line">
      <div class="progress-track">
        <div class="progress-fill" :class="{ error: statusTone === 'danger' }" :style="{ width: `${progress}%` }" />
      </div>
      <span class="progress-num">{{ progress }}%</span>
    </div>

    <!-- 阶段步进（最新在最上） -->
    <p v-if="!build" class="empty-hint">尚未提交构建任务，点击顶部“构建”按钮开始</p>
    <ol v-else class="stage-list">
      <li v-for="stage in displayStages" :key="stage.key" :class="stage.state">
        <span class="stage-icon">
          <el-icon v-if="stage.state === 'done'"><Check /></el-icon>
          <el-icon v-else-if="stage.state === 'failed'"><Close /></el-icon>
          <span v-else-if="stage.state === 'active'" class="stage-spinner" />
          <span v-else class="stage-blank" />
        </span>
        <div class="stage-body">
          <div class="stage-title">
            <b>{{ stage.label }}</b>
            <time v-if="stage.time">{{ stage.time }}</time>
          </div>
          <p class="stage-desc">{{ stage.message || stage.desc }}</p>
        </div>
      </li>
    </ol>

    <el-alert
      v-if="build?.error_message"
      class="panel-alert"
      :title="build.error_message"
      type="error"
      :closable="false"
    />
    <el-alert
      v-if="build?.billing_error"
      class="panel-alert"
      :title="`账务异常：${build.billing_error}`"
      type="error"
      :closable="false"
    />

    <!-- 模拟预览切换器（仅模拟模式显示） -->
    <div v-if="DEMO" class="demo-bar">
      <span>模拟预览</span>
      <el-radio-group v-model="demoStatus" size="small">
        <el-radio-button value="planning">规划中</el-radio-button>
        <el-radio-button value="generating_spec">生成中</el-radio-button>
        <el-radio-button value="completed">已完成</el-radio-button>
        <el-radio-button value="failed">失败</el-radio-button>
      </el-radio-group>
    </div>
  </section>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { Check, Close, Delete } from "@element-plus/icons-vue";
import { useDemoGate } from "@/composables/useDemoGate";
import type { SiteBuild, SiteBuildEvent, SiteBuildStatus } from "@/views/biz/sitebuilder/types";
import { buildStatusViews } from "../types";

/** 模拟数据开关：false 接入真实构建数据 */
const DEMO = true;

const props = defineProps<{ build?: SiteBuild; events: SiteBuildEvent[] }>();

const emit = defineEmits<{ clear: [] }>();
const { requireFullEdition } = useDemoGate("sitebuilder");

/** 模拟预览状态 */
const demoStatus = ref<SiteBuildStatus>("generating_spec");

/** 构建阶段定义 */
const STAGES: { key: SiteBuildStatus; label: string; desc: string }[] = [
  { key: "queued", label: "等待构建", desc: "任务已提交，等待调度" },
  { key: "resolving_context", label: "冻结建站资料", desc: "固化草稿、素材与企业知识" },
  { key: "planning", label: "规划全站创意", desc: "AI 制定全站创作方案" },
  { key: "generating_spec", label: "AI 生成页面", desc: "逐页产出完整 HTML" },
  { key: "validating_spec", label: "校验页面安全性", desc: "净化链接、素材与样式" },
  { key: "storing_artifact", label: "保存构建产物", desc: "上传静态站点并生成版本" },
];

const TERMINAL_LABELS: Partial<Record<SiteBuildStatus, string>> = {
  completed: "构建完成，可预览新版本",
  failed: "构建失败，已保留草稿",
  cancelled: "构建已取消",
};

/** 当前是否有真实构建数据 */
const hasData = computed(() => !!props.build);

/** 展示用构建（模拟优先） */
const build = computed<SiteBuild | undefined>(() => (DEMO ? mockBuild(demoStatus.value) : props.build));
const isTerminalBuild = computed(() => ["completed", "failed", "cancelled"].includes(build.value?.status || ""));

/** 取消任务会修改正式构建状态，体验版在请求前统一拦截。 */
const handleCancel = async () => {
  await requireFullEdition("取消站点构建", "cancel");
};

/** 展示用事件 */
const stageEvents = computed<SiteBuildEvent[]>(() => (DEMO ? mockEvents(demoStatus.value) : props.events));

/** 当前所处阶段序号：失败/取消时定位到最后一个有事件的阶段 */
const activeIndex = computed(() => {
  const status = build.value?.status;
  if (!status) return -1;
  if (status === "completed") return STAGES.length;
  if (status === "failed" || status === "cancelled") {
    let last = -1;
    stageEvents.value.forEach((event) => {
      const index = STAGES.findIndex((stage) => stage.key === event.status);
      if (index >= 0) last = Math.max(last, index);
    });
    return last;
  }
  return STAGES.findIndex((stage) => stage.key === status);
});

/** 展示阶段列表：附状态与事件，最新在最上 */
const displayStages = computed(() => {
  const status = build.value?.status;
  const terminal = status && TERMINAL_LABELS[status]
    ? { key: status, label: buildStatusViews[status].label, desc: TERMINAL_LABELS[status]! }
    : null;
  const all = [...STAGES, ...(terminal ? [terminal] : [])];
  const failedIndex = status === "failed" ? activeIndex.value : -1;

  const stateOf = (index: number, isTerminal: boolean) => {
    if (status === "failed") {
      if (isTerminal) return "failed";
      if (index < failedIndex) return "done";
      return index === failedIndex ? "failed" : "pending";
    }
    if (status === "cancelled") {
      return index < activeIndex.value ? "done" : "pending";
    }
    if (index < activeIndex.value) return "done";
    if (index === activeIndex.value) return isTerminal ? "done" : "active";
    return "pending";
  };

  return all
    .map((stage, index) => {
      const event = [...stageEvents.value].reverse().find((item) => item.status === stage.key);
      return {
        ...stage,
        message: event?.message && event.message !== stage.label ? event.message : undefined,
        time: event ? dayjs(event.created_at).format("HH:mm:ss") : "",
        state: stateOf(index, terminal?.key === stage.key),
      };
    })
    .reverse();
});

/** 总进度百分比 */
const progress = computed(() => {
  if (!build.value) return 0;
  if (build.value.status === "completed") return 100;
  return Math.min(96, Math.round(((activeIndex.value + 0.4) / STAGES.length) * 100));
});

/** 状态标签文案 */
const statusLabel = computed(() => buildStatusViews[build.value?.status || "queued"].label);

/** 当前时间心跳（驱动进行中构建的耗时刷新） */
const nowTick = ref(Date.now());
let tickTimer: number | undefined;
onMounted(() => {
  tickTimer = window.setInterval(() => (nowTick.value = Date.now()), 1000);
});
onBeforeUnmount(() => {
  if (tickTimer) window.clearInterval(tickTimer);
});

/** 构建耗时 */
const elapsed = computed(() => {
  const current = build.value;
  if (!current?.created_at) return "";
  const terminal = ["completed", "failed", "cancelled"].includes(current.status);
  const end = terminal && current.updated_at ? dayjs(current.updated_at) : dayjs(nowTick.value);
  const seconds = Math.max(0, end.diff(dayjs(current.created_at), "second"));
  if (seconds < 60) return `${seconds} 秒`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分 ${String(seconds % 60).padStart(2, "0")} 秒`;
  return `${Math.floor(seconds / 3600)} 小时 ${Math.floor((seconds % 3600) / 60)} 分`;
});

/** 状态标签色调 */
const statusTone = computed(() => {
  if (!build.value) return "info";
  if (build.value.status === "failed") return "danger";
  if (build.value.status === "completed") return "success";
  return "warning";
});

/** 构造模拟构建数据 */
function mockBuild(status: SiteBuildStatus): SiteBuild {
  const now = Date.now();
  const at = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();
  return {
    id: 12,
    project_id: 3,
    status,
    deduct_amount: 12,
    billing_status: status === "completed" ? "consumed" : status === "failed" ? "refunded" : "pre_deducted",
    error_message: status === "failed" ? "AI 生成页面失败：模型输出被截断 finish_reason=max_tokens" : undefined,
    created_at: at(6),
    updated_at: at(1),
    ai_metadata: JSON.stringify({ prompt_version: "sitegen-v1", plan_tokens: 8210, page_tokens: 23450, repair_attempts: 1 }),
  } as SiteBuild;
}

/** 构造模拟事件数据 */
function mockEvents(status: SiteBuildStatus): SiteBuildEvent[] {
  const now = Date.now();
  const at = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();
  const flow: { status: SiteBuildStatus; message: string; minutesAgo: number }[] = [
    { status: "queued", message: "构建任务已排队", minutesAgo: 6 },
    { status: "resolving_context", message: "整理冻结站点上下文", minutesAgo: 5.6 },
    { status: "planning", message: "生成全站创作规划", minutesAgo: 5 },
    { status: "generating_spec", message: "AI 生成全部页面", minutesAgo: 4 },
    { status: "validating_spec", message: "校验 AI 页面产物", minutesAgo: 2 },
    { status: "storing_artifact", message: "保存构建产物", minutesAgo: 1.5 },
  ];
  const cutoff: Partial<Record<SiteBuildStatus, number>> = {
    planning: 2,
    generating_spec: 3,
    completed: flow.length - 1,
    failed: 3,
  };
  const list = flow.slice(0, (cutoff[status] ?? 0) + 1);
  if (status === "failed") list.push({ status: "failed", message: "AI 生成页面失败", minutesAgo: 2.5 });
  if (status === "completed") list.push({ status: "completed", message: "构建完成", minutesAgo: 1 });
  return list.map((item, index) => ({
    id: index + 1,
    status: item.status,
    message: item.message,
    created_at: at(item.minutesAgo),
  }));
}
</script>

<style lang="scss" scoped>
.editor-panel {
  border-radius: 16px;
  background: var(--el-bg-color);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.build-status-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;

  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
      display: flex;
      align-items: center;
      gap: 7px;
      margin: 0;
      color: var(--el-text-color-primary);
      font-size: 14px;
      font-weight: 650;

      &::before {
        width: 8px;
        height: 8px;
        border-radius: 3px;
        background: var(--el-color-primary);
        content: "";
      }
    }

    .head-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .elapsed {
      color: var(--el-text-color-secondary);
      font-size: 12px;
      font-variant-numeric: tabular-nums;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      line-height: 20px;
      white-space: nowrap;

      .pill-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentcolor;
        flex: none;
      }

      &.warning {
        background: var(--el-color-warning-light-9);
        color: var(--el-color-warning);
      }

      &.success {
        background: var(--el-color-success-light-9);
        color: var(--el-color-success);
      }

      &.danger {
        background: var(--el-color-danger-light-9);
        color: var(--el-color-danger);
      }

      &.info {
        background: var(--el-fill-color);
        color: var(--el-text-color-secondary);
      }

      &.warning .pill-dot,
      &.info .pill-dot {
        animation: pulse 1.6s ease-in-out infinite;
      }
    }

    .clear-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--el-text-color-secondary);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--el-fill-color);
        color: var(--el-color-danger);
      }
    }
  }

  .progress-line {
    display: flex;
    align-items: center;
    gap: 10px;

    .progress-track {
      flex: 1;
      height: 6px;
      border-radius: 99px;
      background: var(--el-fill-color-light);
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 99px;
      background: linear-gradient(90deg, var(--el-color-primary-light-3), var(--el-color-primary));
      transition: width 0.6s ease;

      &.error {
        background: linear-gradient(90deg, var(--el-color-danger-light-3), var(--el-color-danger));
      }
    }

    .progress-num {
      color: var(--el-text-color-secondary);
      font-size: 12px;
      font-variant-numeric: tabular-nums;
      min-width: 34px;
      text-align: right;
    }
  }

  .stage-list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      position: relative;
      display: flex;
      gap: 12px;
      padding-bottom: 18px;

      &:last-child {
        padding-bottom: 0;
      }

      // 连接线：由下往上，最新状态在最上
      &:not(:first-child) .stage-icon::before {
        content: "";
        position: absolute;
        top: -20px;
        left: 50%;
        width: 2px;
        height: 20px;
        transform: translateX(-50%);
        border-radius: 2px;
        background: var(--el-fill-color);
      }

      &.done:not(:first-child) .stage-icon::before {
        background: var(--el-color-success-light-5);
      }

      .stage-icon {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        font-size: 13px;
        margin-top: 2px;
      }

      .stage-body {
        flex: 1;
        min-width: 0;
        padding-top: 3px;
      }

      .stage-title {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;

        b {
          color: var(--el-text-color-primary);
          font-size: 13px;
          font-weight: 600;
        }

        time {
          color: var(--el-text-color-placeholder);
          font-size: 11px;
          font-variant-numeric: tabular-nums;
        }
      }

      .stage-desc {
        margin: 3px 0 0;
        color: var(--el-text-color-secondary);
        font-size: 12px;
        line-height: 1.5;
      }

      &.done {
        .stage-icon {
          background: var(--el-color-success-light-8);
          color: var(--el-color-success);
        }
      }

      &.active {
        .stage-icon {
          background: var(--el-color-primary-light-8);
          color: var(--el-color-primary);
          box-shadow: 0 0 0 4px var(--el-color-primary-light-9);
        }

        .stage-title b {
          color: var(--el-color-primary);
        }

        .stage-desc {
          color: var(--el-color-primary);
        }
      }

      &.failed {
        .stage-icon {
          background: var(--el-color-danger-light-8);
          color: var(--el-color-danger);
        }

        .stage-title b {
          color: var(--el-color-danger);
        }

        .stage-desc {
          color: var(--el-color-danger);
        }
      }

      &.pending {
        .stage-icon {
          background: var(--el-fill-color);
          color: var(--el-text-color-placeholder);
        }

        .stage-title b {
          color: var(--el-text-color-placeholder);
        }
      }
    }

    .stage-spinner {
      width: 12px;
      height: 12px;
      border: 2px solid var(--el-color-primary-light-5);
      border-top-color: var(--el-color-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .stage-blank {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--el-text-color-placeholder);
    }
  }

  .empty-hint {
    margin: 4px 0;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 1.6;
  }

  .panel-alert {
    border-radius: 10px;
  }

  .demo-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 10px;
    border: 1px dashed var(--el-border-color);
    border-radius: 10px;

    > span {
      color: var(--el-text-color-secondary);
      font-size: 12px;
      flex: none;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}
</style>
