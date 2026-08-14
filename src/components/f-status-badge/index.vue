<template>
  <div
    class="f-status-badge"
    :class="[`f-status-badge--${type}`, { 'is-plain': plain }]"
    :style="customStyle"
  >
    <slot>{{ text }}</slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  /** 显示文本 */
  text?: string;
  /** 类型：primary | success | warning | danger | info */
  type?: "primary" | "success" | "warning" | "danger" | "info";
  /** 是否为轻量模式（边框+文字色，背景透明） */
  plain?: boolean;
  /** 自定义背景色 */
  bgColor?: string;
  /** 自定义文字颜色 */
  textColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  text: "",
  type: "primary",
  plain: false,
  bgColor: "",
  textColor: "",
});

const customStyle = computed(() => {
  const style: Record<string, string> = {};

  if (props.bgColor) {
    style.backgroundColor = props.bgColor;
  }

  if (props.textColor) {
    style.color = props.textColor;
  }

  return style;
});
</script>

<style lang="scss" scoped>
.f-status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 13px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  white-space: nowrap;
  transition: all 0.2s ease;

  &--primary {
    background-color: var(--el-color-primary);
    color: #ffffff;
    
    &.is-plain {
      background-color: var(--el-color-primary-light-9);
      border: 1px solid var(--el-color-primary-light-5);
      color: var(--el-color-primary);
    }
  }

  &--success {
    background-color: var(--el-color-success);
    color: #ffffff;
    
    &.is-plain {
      background-color: var(--el-color-success-light-9);
      border: 1px solid var(--el-color-success-light-5);
      color: var(--el-color-success);
    }
  }

  &--warning {
    background-color: var(--el-color-warning);
    color: #ffffff;
    
    &.is-plain {
      background-color: var(--el-color-warning-light-9);
      border: 1px solid var(--el-color-warning-light-5);
      color: var(--el-color-warning);
    }
  }

  &--danger {
    background-color: var(--el-color-danger);
    color: #ffffff;
    
    &.is-plain {
      background-color: var(--el-color-danger-light-9);
      border: 1px solid var(--el-color-danger-light-5);
      color: var(--el-color-danger);
    }
  }

  &--info {
    background-color: var(--el-color-info);
    color: #ffffff;
    
    &.is-plain {
      background-color: var(--el-color-info-light-9);
      border: 1px solid var(--el-color-info-light-5);
      color: var(--el-color-info);
    }
  }
}
</style>
