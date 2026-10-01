<template>
  <section class="dashboard-card platform-card">
    <div class="card-heading">
      <div>
        <span class="card-eyebrow">AI PLATFORM COVERAGE</span>
        <h2>多平台品牌提及表现</h2>
        <p>提及率表示品牌在对应 AI 平台诊断问答中被提及的比例。</p>
      </div>
      <el-button link type="primary" @click="$emit('view-reports')">
        查看完整报告<el-icon class="ml-4"><ArrowRight /></el-icon>
      </el-button>
    </div>

    <div v-if="platforms.length" class="platform-list">
      <div v-for="platform in platforms" :key="platform.name" class="platform-row">
        <div class="platform-meta">
          <img v-if="platform.icon" :src="platform.icon" :alt="platform.label" />
          <span v-else class="platform-fallback">{{ platform.label.slice(0, 1) }}</span>
          <div>
            <strong>{{ platform.label }}</strong>
            <span>{{ platform.samples }} 个有效问答样本</span>
          </div>
        </div>
        <div class="platform-rate">
          <div class="rate-label">
            <span>品牌提及率</span>
            <strong>{{ formatRate(platform.rate) }}%</strong>
          </div>
          <el-progress
            :percentage="Math.min(100, Math.max(0, platform.rate))"
            :stroke-width="8"
            :show-text="false"
          />
        </div>
      </div>
    </div>

    <el-empty v-else description="暂无可聚合的平台数据">
      <el-button type="primary" @click="$emit('start-diagnosis')">开始首次诊断</el-button>
    </el-empty>
  </section>
</template>

<script setup lang="ts">
export interface PlatformMetric {
  name: string;
  label: string;
  icon: string;
  rate: number;
  samples: number;
}

defineProps<{ platforms: PlatformMetric[] }>();
defineEmits(["view-reports", "start-diagnosis"]);

const formatRate = (value: number) => Number(value || 0).toFixed(value % 1 === 0 ? 0 : 1);
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
  gap: 20px;
  margin-bottom: 20px;

  h2 {
    margin: 4px 0 6px;
    color: var(--el-text-color-primary);
    font-size: 18px;
    line-height: 1.4;
  }

  p {
    margin: 0;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 1.6;
  }
}

.card-eyebrow {
  color: var(--el-color-primary);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
}

.platform-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.platform-row {
  display: grid;
  grid-template-columns: minmax(150px, 0.8fr) minmax(180px, 1.2fr);
  align-items: center;
  gap: 24px;
}

.platform-meta {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 11px;

  img,
  .platform-fallback {
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 50%;
    background: #fff;
  }

  img { object-fit: contain; padding: 3px; box-sizing: border-box; }

  .platform-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-color-primary);
    font-size: 13px;
    font-weight: 700;
  }

  div {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 3px;
  }

  strong {
    overflow: hidden;
    color: var(--el-text-color-primary);
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: var(--el-text-color-placeholder);
    font-size: 11px;
  }
}

.platform-rate { min-width: 0; }
.rate-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 7px;
  color: var(--el-text-color-secondary);
  font-size: 11px;

  strong {
    color: var(--el-text-color-primary);
    font-size: 13px;
  }
}

@media (max-width: 720px) {
  .card-heading { flex-direction: column; }
  .platform-row { grid-template-columns: 1fr; gap: 10px; }
}
</style>
