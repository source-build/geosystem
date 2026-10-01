<template>
  <header class="editor-header">
    <div class="header-context">
      <el-tooltip content="返回上一页">
        <el-button text class="back-button" aria-label="返回上一页" @click="emit('back')">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
      </el-tooltip>
      <span class="header-mark" aria-hidden="true">{{ initial }}</span>
      <div class="project-context">
        <span>AI 建站编辑器</span>
        <strong>{{ projectName || "加载中" }}</strong>
      </div>
      <span v-if="version" class="version-tag">
        <span class="version-tag-dot" aria-hidden="true"></span>
        已构建 <b>v{{ version }}</b>
      </span>
    </div>

    <div class="header-actions">
      <el-button :loading="saving" @click="emit('save-project')">保存草稿</el-button>
      <el-button type="primary" :loading="building" @click="emit('build')">
        <el-icon><Position /></el-icon>
        构建站点
      </el-button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ projectName?: string; version?: number; saving: boolean; building: boolean }>();
const emit = defineEmits<{ (event: "back"): void; (event: "save-project"): void; (event: "build"): void }>();

/** 项目首字 */
const initial = computed(() => props.projectName?.slice(0, 1) || "S");
</script>

<style lang="scss" scoped>
.editor-header {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 9px 14px;
  border-radius: 14px;
  background: var(--el-bg-color);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);

  .header-context {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 10px;
  }

  .back-button {
    padding: 0 6px;
    font-size: 16px;
  }

  .header-mark {
    display: inline-flex;
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    align-items: center;
    justify-content: center;
    border-radius: 11px;
    background: linear-gradient(135deg, #60a5fa, #2563eb);
    color: #fff;
    font-size: 15px;
    font-weight: 700;
  }

  .project-context {
    display: grid;
    min-width: 0;
    gap: 2px;

    span {
      color: var(--el-text-color-secondary);
      font-size: 11px;
    }

    strong {
      overflow: hidden;
      color: var(--el-text-color-primary);
      font-size: 15px;
      font-variant-numeric: tabular-nums;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .version-tag {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 5px;
    padding: 5px 9px;
    border-radius: 8px;
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
    font-variant-numeric: tabular-nums;

    .version-tag-dot {
      width: 5px;
      height: 5px;
      flex: 0 0 5px;
      border-radius: 50%;
      background: var(--el-color-primary);
      box-shadow: 0 0 0 3px var(--el-color-primary-light-8);
    }

    b {
      font-size: 12px;
      font-weight: 750;
    }
  }

  .header-actions {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
  }
}

@media (max-width: 860px) {
  .editor-header {
    align-items: stretch;
    flex-direction: column;

    .header-actions .el-button {
      flex: 1;
    }
  }
}
</style>
