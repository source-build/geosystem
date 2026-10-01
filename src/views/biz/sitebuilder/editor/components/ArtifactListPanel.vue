<template>
  <section class="editor-panel artifact-list-panel">
    <div class="panel-head">
      <h3>构建产物</h3>
      <el-button text size="small" icon="Refresh" @click="emit('refresh')">刷新</el-button>
    </div>

    <div v-if="artifacts.length" class="artifact-list">
      <div v-for="item in artifacts" :key="item.id" class="artifact-item">
        <span class="artifact-mark" aria-hidden="true">
          <el-icon><Link /></el-icon>
        </span>
        <div class="artifact-copy">
          <strong>{{ artifactLabel(item) }}</strong>
          <span>{{ formatTime(item.created_at) }}</span>
        </div>
        <el-button v-if="item.access_url" type="primary" text size="small" @click="openArtifact(item.access_url)">
          访问
          <el-icon><ArrowRight /></el-icon>
        </el-button>
        <span v-else class="empty-url">暂无访问地址</span>
      </div>
    </div>
    <el-empty v-else description="暂无构建产物" :image-size="72" />
  </section>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { useDemoGate } from "@/composables/useDemoGate";
import type { SiteArtifact } from "@/views/biz/sitebuilder/types";

const { artifacts } = defineProps<{ artifacts: SiteArtifact[] }>();
const emit = defineEmits<{ (event: "refresh"): void }>();
const { requireFullEdition } = useDemoGate("sitebuilder");

/** 格式化产物创建时间 */
const formatTime = (value: string) => value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "-";

/** 构建页面名称 */
const artifactLabel = (item: SiteArtifact) => {
  const prefix = `builds/${item.build_id}/`;
  const path = item.storage_key.includes(prefix) ? item.storage_key.split(prefix)[1] : item.storage_key;
  return path === "index.html" ? "首页预览" : `页面预览 · /${path.replace(/\/index\.html$/, "")}`;
};

/** 构建产物访问在打开新窗口前统一拦截。 */
const openArtifact = async (_url: string) => {
  await requireFullEdition("访问构建产物", "download");
};
</script>

<style lang="scss" scoped>
.editor-panel {
  border-radius: 16px;
  background: var(--el-bg-color);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.artifact-list-panel {
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

  .artifact-list {
    display: grid;
    gap: 8px;
  }

  .artifact-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 11px;
    border-radius: 10px;
    background: var(--el-fill-color-lighter);
    transition: background-color 0.18s ease;

    &:hover {
      background: var(--el-fill-color-light);
    }
  }

  .artifact-mark {
    display: inline-flex;
    width: 28px;
    height: 28px;
    flex: 0 0 28px;
    align-items: center;
    justify-content: center;
    border-radius: 9px;
    background: var(--el-color-primary);
    color: #fff;
    font-size: 13px;
  }

  .artifact-copy {
    display: grid;
    min-width: 0;
    flex: 1;
    gap: 3px;

    strong {
      overflow: hidden;
      color: var(--el-text-color-primary);
      font-size: 13px;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    span {
      color: var(--el-text-color-secondary);
      font-size: 12px;
      font-variant-numeric: tabular-nums;
    }
  }

  .empty-url {
    flex-shrink: 0;
    color: var(--el-text-color-placeholder);
    font-size: 12px;
  }
}
</style>
