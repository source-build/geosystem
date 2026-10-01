<template>
  <nav class="page-bar editor-panel" aria-label="站点页面列表">
    <div class="page-scroll">
      <button
        v-for="(page, index) in pages"
        :key="page.id"
        class="page-chip"
        :class="{ active: page.id === activePageId }"
        :title="index === 0 ? '首页' : page.path"
        @click="emit('select-page', page.id)"
      >
        <span class="page-index">
          <el-icon v-if="index === 0"><HomeFilled /></el-icon>
          <template v-else>{{ index + 1 }}</template>
        </span>
        <span class="page-name">{{ page.name }}</span>
        <el-popover v-if="page.id === activePageId" placement="bottom" :width="280" trigger="click">
          <template #reference>
            <el-icon class="chip-edit" title="配置页面" @click.stop><EditPen /></el-icon>
          </template>
          <div class="page-form">
            <span class="page-form-label">页面标题</span>
            <el-input
              :model-value="page.name"
              size="small"
              placeholder="例如：产品介绍"
              maxlength="30"
              @update:model-value="(value: string) => emit('update-page', page.id, { name: value })"
            />
            <span class="page-form-label">页面路径</span>
            <el-input
              :model-value="page.path"
              size="small"
              :disabled="index === 0"
              placeholder="例如：/products"
              maxlength="60"
              @update:model-value="(value: string) => emit('update-page', page.id, { path: value })"
            />
            <span class="page-form-label">页面提示词</span>
            <el-input
              :model-value="page.prompt"
              type="textarea"
              :rows="3"
              placeholder="例如：面向制造业客户，重点介绍行业解决方案。"
              maxlength="500"
              show-word-limit
              @update:model-value="(value: string) => emit('update-page', page.id, { prompt: value })"
            />
          </div>
        </el-popover>
        <el-icon v-if="index > 0" class="chip-remove" title="删除页面" @click.stop="emit('remove-page', page.id)"><Close /></el-icon>
      </button>

      <button class="page-add" @click="emit('add-page')">
        <el-icon><Plus /></el-icon>
        添加页面
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import type { SitePage } from "@/views/biz/sitebuilder/types";

defineProps<{ pages: SitePage[]; activePageId: string }>();
const emit = defineEmits<{
  (event: "select-page", id: string): void;
  (event: "add-page"): void;
  (event: "remove-page", id: string): void;
  (event: "update-page", id: string, patch: Partial<Pick<SitePage, "name" | "path" | "prompt">>): void;
}>();
</script>

<style lang="scss" scoped>
.editor-panel {
  border-radius: 16px;
  background: var(--el-bg-color);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.page-bar {
  padding: 7px 10px;

  .page-scroll {
    display: flex;
    align-items: center;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .page-chip {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 6px;
    padding: 6px 9px;
    border: 0;
    border-radius: 10px;
    background: var(--el-fill-color-lighter);
    font: inherit;
    cursor: pointer;
    transition: background-color 0.18s ease;

    &:hover {
      background: var(--el-fill-color);
    }

    &.active {
      background: var(--el-color-primary-light-9);

      .page-index {
        background: var(--el-color-primary);
        color: #fff;
      }

      .page-name {
        color: var(--el-color-primary);
      }
    }

    &:focus-visible {
      outline: 2px solid var(--el-color-primary);
      outline-offset: 2px;
    }

    .el-icon {
      cursor: pointer;

      &:hover {
        color: var(--el-color-danger);
      }
    }

    .chip-edit {
      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  .page-index {
    display: inline-flex;
    width: 18px;
    height: 18px;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: var(--el-fill-color);
    color: var(--el-text-color-secondary);
    font-size: 10px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    transition: background-color 0.18s ease, color 0.18s ease;

    .el-icon {
      font-size: 11px;
    }
  }

  .page-name {
    overflow: hidden;
    max-width: 120px;
    color: var(--el-text-color-primary);
    font-size: 12px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .page-add {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 4px;
    padding: 6px 11px;
    border: 1px dashed var(--el-border-color);
    border-radius: 10px;
    background: transparent;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    cursor: pointer;
    transition: border-color 0.18s ease, color 0.18s ease;

    &:hover {
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }

    &:focus-visible {
      outline: 2px solid var(--el-color-primary);
      outline-offset: 2px;
    }
  }
}

// popover 内容挂载在 body 下,不能嵌套在 .page-bar 里
.page-form {
  display: grid;
  gap: 8px;
}

.page-form-label {
  margin-top: 2px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
