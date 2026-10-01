<template>
  <section class="dashboard-card recent-card">
    <div class="card-heading">
      <div>
        <span class="card-eyebrow">RECENT DIAGNOSIS</span>
        <h2>最近诊断任务</h2>
      </div>
      <el-button link type="primary" @click="$emit('view-all')">全部任务</el-button>
    </div>

    <div v-if="tasks.length" class="task-list">
      <button
        v-for="task in tasks.slice(0, 4)"
        :key="task.id"
        class="task-item"
        type="button"
        @click="$emit('open-task', task)"
      >
        <span class="task-status" :class="`task-status--${statusMeta(task.status).tone}`">
          <el-icon :size="15"><component :is="statusMeta(task.status).icon" /></el-icon>
        </span>
        <span class="task-main">
          <strong>{{ task.name || "未命名品牌" }}</strong>
          <span>{{ platformCount(task.ai_platforms) }} 个 AI 平台 · {{ task.industry_keywords || "未设置行业词" }}</span>
        </span>
        <span class="task-side">
          <el-tag :type="statusMeta(task.status).tag" effect="light" size="small">
            {{ statusMeta(task.status).label }}
          </el-tag>
          <time>{{ formatTime(task.finish_time || task.submit_time) }}</time>
        </span>
        <el-icon class="task-arrow"><ArrowRight /></el-icon>
      </button>
    </div>

    <el-empty v-else description="暂无诊断任务">
      <el-button type="primary" @click="$emit('start-diagnosis')">创建诊断任务</el-button>
    </el-empty>
  </section>
</template>

<script setup lang="ts">
import dayjs from "dayjs";

defineProps<{ tasks: any[] }>();
defineEmits(["view-all", "open-task", "start-diagnosis"]);

const STATUS_MAP: Record<number, { label: string; tone: string; tag: "success" | "warning" | "info" | "danger" | "primary"; icon: string }> = {
  1: { label: "已提交", tone: "info", tag: "info", icon: "Clock" },
  2: { label: "排队中", tone: "warning", tag: "warning", icon: "Clock" },
  3: { label: "排队中", tone: "warning", tag: "warning", icon: "Clock" },
  4: { label: "分析中", tone: "primary", tag: "primary", icon: "Loading" },
  5: { label: "已取消", tone: "info", tag: "info", icon: "CircleClose" },
  6: { label: "诊断失败", tone: "danger", tag: "danger", icon: "Warning" },
  7: { label: "报告已生成", tone: "success", tag: "success", icon: "CircleCheck" },
  9: { label: "生成报告中", tone: "primary", tag: "primary", icon: "Loading" },
};

const statusMeta = (status: number) => STATUS_MAP[status] || STATUS_MAP[1];
const platformCount = (platforms: string) => platforms ? platforms.split(",").filter(Boolean).length : 0;
const formatTime = (time?: string) => time ? dayjs(time).format("MM-DD HH:mm") : "--";
</script>

<style lang="scss" scoped>
.dashboard-card {
  min-width: 0;
  padding: 22px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 16px;
  background: var(--el-bg-color);
  box-shadow: 0 8px 24px rgba(31, 41, 55, 0.04);
}

.card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;

  h2 { margin: 4px 0 0; color: var(--el-text-color-primary); font-size: 18px; }
}

.card-eyebrow {
  color: var(--el-color-primary);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
}

.task-list { display: flex; flex-direction: column; }

.task-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 13px 4px;
  border: 0;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  color: inherit;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:last-child { border-bottom: 0; }
  &:hover { background: var(--el-fill-color-extra-light); }
  &:focus-visible { outline: 2px solid var(--el-color-primary-light-5); outline-offset: 2px; }
}

.task-status {
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;

  &--success { color: var(--el-color-success); background: var(--el-color-success-light-9); }
  &--warning { color: var(--el-color-warning); background: var(--el-color-warning-light-9); }
  &--primary { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
  &--danger { color: var(--el-color-danger); background: var(--el-color-danger-light-9); }
  &--info { color: var(--el-color-info); background: var(--el-color-info-light-9); }
}

.task-main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;

  strong { overflow: hidden; color: var(--el-text-color-primary); font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
  span { overflow: hidden; color: var(--el-text-color-placeholder); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
}

.task-side {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  gap: 5px;

  time { color: var(--el-text-color-placeholder); font-size: 10px; }
}

.task-arrow { color: var(--el-text-color-placeholder); }

@media (max-width: 620px) {
  .task-item { grid-template-columns: auto minmax(0, 1fr) auto; }
  .task-side { display: none; }
}
</style>
