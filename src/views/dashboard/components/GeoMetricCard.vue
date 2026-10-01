<template>
  <div class="geo-metric-card">
    <div class="metric-head">
      <span class="metric-label">{{ label }}</span>
      <span class="metric-icon" :class="`metric-icon--${tone}`">
        <el-icon :size="18"><component :is="icon" /></el-icon>
      </span>
    </div>
    <div class="metric-value">
      <span>{{ value }}</span>
      <small v-if="unit">{{ unit }}</small>
    </div>
    <p class="metric-hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    value: string | number;
    hint: string;
    icon: string;
    unit?: string;
    tone?: "primary" | "success" | "warning" | "info";
  }>(),
  {
    unit: "",
    tone: "primary",
  },
);
</script>

<style lang="scss" scoped>
.geo-metric-card {
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 14px;
  background: var(--el-bg-color);
  box-shadow: 0 8px 24px rgba(31, 41, 55, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: var(--el-color-primary-light-7);
    box-shadow: 0 12px 30px rgba(31, 41, 55, 0.07);
  }
}

.metric-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.metric-label {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  font-weight: 500;
}

.metric-icon {
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;

  &--primary { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
  &--success { color: var(--el-color-success); background: var(--el-color-success-light-9); }
  &--warning { color: var(--el-color-warning); background: var(--el-color-warning-light-9); }
  &--info { color: var(--el-color-info); background: var(--el-color-info-light-9); }
}

.metric-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 14px;
  color: var(--el-text-color-primary);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.5px;

  small {
    color: var(--el-text-color-secondary);
    font-size: 13px;
    font-weight: 500;
  }
}

.metric-hint {
  margin: 8px 0 0;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
  line-height: 1.5;
}
</style>
