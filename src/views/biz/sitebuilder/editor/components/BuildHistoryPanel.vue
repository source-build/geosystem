<template>
  <section class="editor-panel build-history-panel">
    <div class="panel-head">
      <h3>构建历史</h3>
      <el-button text size="small" icon="Refresh" :loading="loading" :disabled="loading" @click="emit('refresh')">
        刷新
      </el-button>
    </div>

    <div v-if="builds.length" class="history-list">
      <div v-for="item in builds" :key="item.id" class="history-item">
        <div class="history-main">
          <span class="version-badge">v{{ item.version || "-" }}</span>
          <div class="history-info">
            <div class="history-title">
              <span :class="['mini-pill', statusTone(item.status)]">{{ statusLabel(item.status) }}</span>
            </div>
            <div class="history-meta">
              <time>{{ formatTime(item.created_at) }}</time>
              <span v-if="item.page_count">{{ item.page_count }} 个页面</span>
              <span>{{ item.deduct_amount > 0 ? `${item.deduct_amount} 算力` : "免费" }}</span>
              <el-tooltip v-if="item.error_message" :content="item.error_message" placement="top">
                <span class="meta-error">失败原因</span>
              </el-tooltip>
            </div>
          </div>
        </div>
        <div v-if="item.status === 'completed'" class="history-actions">
          <el-button text size="small" type="primary" :loading="downloadingId === item.id" @click="handleDownload(item)">
            下载
          </el-button>
        </div>
      </div>
    </div>
    <el-empty v-else description="暂无构建记录" :image-size="72" />
  </section>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { ref } from "vue";
import { useDemoGate } from "@/composables/useDemoGate";
import type { SiteBuildHistoryItem, SiteBuildStatus } from "@/views/biz/sitebuilder/types";
import { buildStatusViews } from "../types";

const { builds, loading } = defineProps<{ builds: SiteBuildHistoryItem[]; loading?: boolean }>();

const emit = defineEmits<{ (event: "refresh"): void }>();

const { requireFullEdition } = useDemoGate("sitebuilder");
/** 下载中的构建 ID（体验版始终为空，仅保留正式组件状态结构） */
const downloadingId = ref<number>();

/** 格式化构建时间 */
const formatTime = (value: string) => (value ? dayjs(value).format("MM-DD HH:mm") : "-");

/** 构建状态文案 */
const statusLabel = (status: SiteBuildStatus) => buildStatusViews[status].label;

/** 构建状态色调 */
const statusTone = (status: SiteBuildStatus) => buildStatusViews[status].type;

/** 下载会读取构建产物；在创建链接或请求数据前统一拦截。 */
const handleDownload = async (_item: SiteBuildHistoryItem) => {
  await requireFullEdition("下载站点源码", "download");
};
</script>

<style lang="scss" scoped>
.editor-panel {
  border-radius: 16px;
  background: var(--el-bg-color);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.build-history-panel {
  padding: 16px;

  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

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
        background: var(--el-color-success);
        content: "";
      }
    }
  }

  .history-list {
    display: grid;
    gap: 8px;
  }

  .history-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 11px;
    border-radius: 10px;
    background: var(--el-fill-color-lighter);
    transition: background-color 0.18s ease;

    &:hover {
      background: var(--el-fill-color-light);
    }
  }

  .history-main {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .version-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    min-width: 34px;
    height: 28px;
    padding: 0 8px;
    border-radius: 9px;
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-size: 12px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .history-info {
    display: grid;
    gap: 3px;
    min-width: 0;
  }

  .history-title {
    display: flex;
    align-items: center;
    gap: 8px;

    time {
      color: var(--el-text-color-secondary);
      font-size: 12px;
      font-variant-numeric: tabular-nums;
    }
  }

  .mini-pill {
    display: inline-flex;
    align-items: center;
    padding: 1px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    line-height: 18px;
    white-space: nowrap;

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
  }

  .history-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;

    .meta-error {
      color: var(--el-color-danger);
      cursor: pointer;
      text-decoration: underline dotted;
    }
  }

  .history-actions {
    display: flex;
    align-items: center;
    flex: none;
  }
}
</style>
