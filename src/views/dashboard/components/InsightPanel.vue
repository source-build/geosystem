<template>
  <section class="dashboard-card insight-card">
    <div class="card-heading">
      <div>
        <span class="card-eyebrow">GEO INSIGHTS</span>
        <h2>关键发现与优化方向</h2>
        <p v-if="brand">来自最近报告：{{ brand }}</p>
      </div>
      <el-button link type="primary" @click="$emit('view-report')">查看报告</el-button>
    </div>

    <template v-if="findings.length || priorities.length">
      <div class="insight-section">
        <h3><el-icon><DataAnalysis /></el-icon>关键发现</h3>
        <ul>
          <li v-for="(item, index) in findings.slice(0, 3)" :key="`finding-${index}`">
            <span>{{ index + 1 }}</span>
            <p>{{ item }}</p>
          </li>
        </ul>
      </div>
      <div class="insight-section insight-section--action">
        <h3><el-icon><Promotion /></el-icon>优先行动</h3>
        <ul>
          <li v-for="(item, index) in priorities.slice(0, 3)" :key="`priority-${index}`">
            <span>{{ index + 1 }}</span>
            <p>{{ item }}</p>
          </li>
        </ul>
      </div>
    </template>

    <el-empty v-else description="生成诊断报告后，这里将展示 GEO 优化洞察">
      <el-button type="primary" @click="$emit('start-diagnosis')">开始诊断</el-button>
    </el-empty>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  brand?: string;
  findings: string[];
  priorities: string[];
}>();
defineEmits(["view-report", "start-diagnosis"]);
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
  margin-bottom: 18px;

  h2 { margin: 4px 0 5px; color: var(--el-text-color-primary); font-size: 18px; }
  p { margin: 0; color: var(--el-text-color-placeholder); font-size: 11px; }
}

.card-eyebrow {
  color: var(--el-color-primary);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
}

.insight-section {
  padding: 15px;
  border-radius: 12px;
  background: var(--el-fill-color-extra-light);

  & + & { margin-top: 12px; }
  &--action { background: var(--el-color-primary-light-9); }

  h3 {
    display: flex;
    align-items: center;
    gap: 7px;
    margin: 0 0 10px;
    color: var(--el-text-color-primary);
    font-size: 13px;
  }

  ul { display: flex; flex-direction: column; gap: 9px; margin: 0; padding: 0; list-style: none; }

  li {
    display: flex;
    align-items: flex-start;
    gap: 9px;

    > span {
      display: inline-flex;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      color: var(--el-color-primary);
      background: var(--el-bg-color);
      font-size: 10px;
      font-weight: 700;
    }

    p { margin: 0; color: var(--el-text-color-regular); font-size: 12px; line-height: 1.7; }
  }
}
</style>
