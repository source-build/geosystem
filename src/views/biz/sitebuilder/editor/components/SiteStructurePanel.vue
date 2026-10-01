<template>
  <section class="editor-panel structure-panel">
    <div class="panel-head">
      <h3>页面模块</h3>
      <el-button size="small" text type="primary" @click="dialogShow = true">
        <el-icon><Plus /></el-icon>
        添加模块
      </el-button>
    </div>

    <draggable
      v-model="dragList"
      item-key="id"
      handle=".drag-handle"
      :animation="200"
      class="block-list"
      @update:model-value="handleReorder"
    >
      <template #item="{ element: block, index }">
        <button
          :key="block.id"
          class="block-item"
          :class="{ active: block.id === selectedId }"
          @click="emit('select', block.id)"
        >
          <el-icon class="drag-handle" title="拖动排序"><Rank /></el-icon>
          <span class="block-index">{{ String(index + 1).padStart(2, "0") }}</span>
          <span class="block-copy">
            <strong>{{ block.title }}</strong>
            <em>{{ typeLabel(block.type) }}</em>
          </span>
          <span class="block-actions">
            <el-icon title="上移" @click.stop="emit('move', block.id, -1)"><ArrowUp /></el-icon>
            <el-icon title="下移" @click.stop="emit('move', block.id, 1)"><ArrowDown /></el-icon>
            <el-icon :class="{ muted: !block.visible }" :title="block.visible ? '隐藏模块' : '显示模块'" @click.stop="emit('toggle', block.id)">
              <View v-if="block.visible" />
              <Hide v-else />
            </el-icon>
            <el-icon class="danger" title="删除模块" @click.stop="emit('remove', block.id)"><Delete /></el-icon>
          </span>
        </button>
      </template>
    </draggable>

    <el-empty v-if="!blocks.length" description="暂无模块" :image-size="72" />

    <el-dialog v-model="dialogShow" title="选择页面模块" width="600px" class="block-dialog">
      <div v-for="group in blockGroups" :key="group.name" class="dialog-group">
        <span class="group-name">{{ group.name }}</span>
        <div class="option-grid">
          <button
            v-for="type in group.types"
            :key="type"
            class="option-card"
            :class="{ 'is-checked': selectedTypes.includes(type) }"
            :style="{ '--type-color': blockTypeMeta[type].color }"
            @click="toggleType(type)"
          >
            <span class="option-icon">
              <el-icon><component :is="blockTypeMeta[type].icon" /></el-icon>
            </span>
            <span class="option-copy">
              <strong>{{ blockTypeMeta[type].label }}</strong>
              <em>{{ blockTypeMeta[type].description }}</em>
            </span>
            <span v-if="selectedTypes.includes(type)" class="option-order">{{ selectedTypes.indexOf(type) + 1 }}</span>
          </button>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <span>已选择 {{ selectedTypes.length }} 个模块，将按选择顺序添加</span>
          <div>
            <el-button @click="dialogShow = false">取消</el-button>
            <el-button type="primary" :disabled="!selectedTypes.length" @click="confirmBlocks">确认添加</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import draggable from "vuedraggable";
import type { SiteBlock, SiteBlockType } from "@/views/biz/sitebuilder/types";
import { blockGroups, blockTypeMeta } from "../blockCatalog";

const props = defineProps<{ blocks: SiteBlock[]; selectedId: string }>();
const emit = defineEmits<{ (event: "select", id: string): void; (event: "move", id: string, direction: -1 | 1): void; (event: "toggle", id: string): void; (event: "remove", id: string): void; (event: "add", type: SiteBlockType): void; (event: "reorder", ids: string[]): void }>();

/** 添加模块弹层显示状态 */
const dialogShow = ref(false);
/** 已勾选的模块类型（按选择顺序） */
const selectedTypes = ref<SiteBlockType[]>([]);
/** 拖拽排序列表副本 */
const dragList = ref<SiteBlock[]>([...props.blocks]);

/** 获取模块类型名称 */
const typeLabel = (type: string) => blockTypeMeta[type]?.label || type;

/** 切换模块类型勾选 */
const toggleType = (type: SiteBlockType) => {
  const index = selectedTypes.value.indexOf(type);
  if (index >= 0) selectedTypes.value.splice(index, 1);
  else selectedTypes.value.push(type);
};

/** 按选择顺序添加全部勾选模块 */
const confirmBlocks = () => {
  for (const type of selectedTypes.value) emit("add", type);
  dialogShow.value = false;
};

/** 拖拽结束后提交新顺序 */
const handleReorder = (list: SiteBlock[]) => {
  emit("reorder", list.map((block) => block.id));
};

watch(() => props.blocks, (blocks) => { dragList.value = [...blocks]; });
watch(dialogShow, (visible) => {
  if (visible) selectedTypes.value = [];
});

/** 打开模块选择弹窗(供父组件在新增页面后调用) */
const openDialog = () => { dialogShow.value = true; };
defineExpose({ openDialog });
</script>

<style lang="scss" scoped>
.editor-panel {
  border-radius: 16px;
  background: var(--el-bg-color);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.structure-panel {
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

  .block-list {
    display: grid;
    gap: 6px;
  }

  .block-item {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 7px;
    padding: 9px 10px;
    border: 0;
    border-radius: 10px;
    background: var(--el-fill-color-lighter);
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.18s ease;

    .drag-handle {
      flex: 0 0 auto;
      color: var(--el-text-color-placeholder);
      font-size: 13px;
      cursor: grab;

      &:hover {
        color: var(--el-color-primary);
      }

      &:active {
        cursor: grabbing;
      }
    }

    &:hover {
      background: var(--el-fill-color);
    }

    &.active {
      background: var(--el-color-primary-light-9);

      .block-index {
        background: var(--el-color-primary);
        color: #fff;
      }

      .block-copy strong {
        color: var(--el-color-primary);
      }
    }

    &:focus-visible {
      outline: 2px solid var(--el-color-primary);
      outline-offset: 2px;
    }
  }

  .block-index {
    display: inline-flex;
    width: 26px;
    height: 26px;
    flex: 0 0 26px;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: var(--el-fill-color);
    color: var(--el-text-color-secondary);
    font-size: 11px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    transition: background-color 0.18s ease, color 0.18s ease;
  }

  .block-copy {
    display: grid;
    min-width: 0;
    flex: 1;
    gap: 2px;

    strong {
      overflow: hidden;
      color: var(--el-text-color-primary);
      font-size: 13px;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    em {
      color: var(--el-text-color-secondary);
      font-size: 11px;
      font-style: normal;
    }
  }

  .block-actions {
    display: flex;
    flex: 0 0 auto;
    gap: 8px;
    color: var(--el-text-color-secondary);

    .el-icon {
      cursor: pointer;

      &:hover {
        color: var(--el-color-primary);
      }
    }

    .danger {
      &:hover {
        color: var(--el-color-danger);
      }
    }

    .muted {
      opacity: 0.35;
    }
  }
}

.block-dialog {
  .dialog-group {
    & + .dialog-group {
      margin-top: 16px;
    }
  }

  .group-name {
    display: block;
    margin-bottom: 8px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    font-weight: 600;
  }

  .option-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .option-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 12px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 12px;
    background: transparent;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: border-color 0.18s ease, background-color 0.18s ease;

    &:hover,
    &:focus-visible {
      border-color: color-mix(in srgb, var(--type-color), var(--el-border-color-lighter) 55%);
      background: color-mix(in srgb, var(--type-color), transparent 94%);
    }

    &.is-checked {
      border-color: var(--type-color);
      background: color-mix(in srgb, var(--type-color), transparent 92%);
    }

    &:focus-visible {
      outline: none;
    }

    .option-order {
      position: absolute;
      top: -7px;
      right: -7px;
      display: grid;
      width: 20px;
      height: 20px;
      place-items: center;
      border-radius: 50%;
      background: var(--type-color);
      color: #fff;
      font-size: 11px;
      font-weight: 600;
    }
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  .option-icon {
    display: inline-flex;
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: color-mix(in srgb, var(--type-color) 12%, transparent);
    color: var(--type-color);
    font-size: 15px;
  }

  .option-copy {
    display: grid;
    min-width: 0;
    gap: 2px;

    strong {
      color: var(--el-text-color-primary);
      font-size: 13px;
      font-weight: 600;
    }

    em {
      overflow: hidden;
      color: var(--el-text-color-secondary);
      font-size: 11px;
      font-style: normal;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
