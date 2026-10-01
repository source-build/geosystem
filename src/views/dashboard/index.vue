<template>
  <div class="geo-dashboard">
    <section class="dashboard-hero">
      <div class="hero-content">
        <div class="hero-badge">
          <el-icon><View /></el-icon>
          {{ DEMO_CONFIG.dashboard.badge }}
        </div>
        <h1>{{ DEMO_CONFIG.dashboard.title }}</h1>
        <p>{{ DEMO_CONFIG.dashboard.description }}</p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="goDiagnosis">
            <el-icon><Aim /></el-icon>{{ DEMO_CONFIG.cta.startDiagnosis }}
          </el-button>
          <el-button size="large" @click="goReports">
            {{ DEMO_CONFIG.cta.viewReports }}<el-icon class="ml-6"><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="experience-path" aria-label="体验路径">
          <template v-for="(step, index) in DEMO_CONFIG.experienceSteps" :key="step">
            <span>{{ index + 1 }}</span><strong>{{ step }}</strong>
            <el-icon v-if="index < DEMO_CONFIG.experienceSteps.length - 1"><Right /></el-icon>
          </template>
        </div>
      </div>
      <div class="hero-visual" aria-hidden="true">
        <div class="signal-orbit signal-orbit--outer"></div>
        <div class="signal-orbit signal-orbit--inner"></div>
        <div class="signal-core">
          <img src="/logo.png" alt="" />
          <strong>GEO</strong>
          <span>AI Visibility</span>
        </div>
        <div
          v-for="(platform, index) in heroPlatforms"
          :key="platform.name"
          class="signal-node"
          :class="`signal-node--${index + 1}`"
        >
          <img :src="platform.icon" alt="" />
        </div>
      </div>
    </section>

    <div class="demo-note">
      <el-icon><InfoFilled /></el-icon>
      <span>{{ DEMO_CONFIG.dashboard.demoNote }}</span>
    </div>

    <el-skeleton v-if="loading" :rows="8" animated class="dashboard-loading" />

    <template v-else>
      <el-alert
        v-if="loadError"
        class="dashboard-alert"
        type="warning"
        :closable="false"
        show-icon
        title="部分 GEO 数据暂时未能加载"
      >
        <template #default>
          <span>你仍可继续体验诊断功能，或</span>
          <el-button link type="primary" @click="loadDashboard">重新加载</el-button>
        </template>
      </el-alert>

      <section class="metric-grid" aria-label="GEO 核心指标">
        <GeoMetricCard
          label="诊断报告"
          :value="metrics.reportCount"
          hint="已创建的品牌 AI 可见度报告"
          icon="DocumentChecked"
        />
        <GeoMetricCard
          label="平均品牌提及率"
          :value="formatRate(metrics.averageMentionRate)"
          unit="%"
          hint="所有有效报告的平均表现"
          icon="TrendCharts"
          tone="success"
        />
        <GeoMetricCard
          label="覆盖 AI 平台"
          :value="metrics.platformCount"
          unit="个"
          hint="已纳入诊断的平台数量"
          icon="Connection"
          tone="info"
        />
        <GeoMetricCard
          label="识别竞争品牌"
          :value="metrics.competitorCount"
          unit="个"
          hint="报告中出现的竞争品牌去重统计"
          icon="Histogram"
          tone="warning"
        />
      </section>

      <div class="dashboard-grid dashboard-grid--primary">
        <PlatformOverview
          :platforms="platformMetrics"
          @view-reports="goReports"
          @start-diagnosis="goDiagnosis"
        />
        <InsightPanel
          :brand="latestInsight.brand"
          :findings="latestInsight.findings"
          :priorities="latestInsight.priorities"
          @view-report="openLatestReport"
          @start-diagnosis="goDiagnosis"
        />
      </div>

      <div class="dashboard-grid dashboard-grid--secondary">
        <RecentDiagnosis
          :tasks="latestTasks"
          @view-all="goReports"
          @open-task="openTask"
          @start-diagnosis="goDiagnosis"
        />

        <section class="dashboard-card full-edition-card">
          <div>
            <span class="card-eyebrow">GEO GROWTH LOOP</span>
            <h2>从诊断走向持续增长</h2>
            <p>完整版覆盖内容策略、AI 批量创作、知识库和多渠道发布，让诊断结论真正转化为品牌 AI 可见度。</p>
          </div>
          <div class="capability-list">
            <div v-for="item in DEMO_CONFIG.fullEdition.capabilities" :key="item.title" class="capability-item">
              <el-icon><component :is="item.icon" /></el-icon>
              <span><strong>{{ item.title }}</strong><small>{{ item.description }}</small></span>
            </div>
          </div>
          <el-button type="primary" plain class="edition-cta" @click="copyWechat">
            {{ DEMO_CONFIG.cta.getFullEdition }}
          </el-button>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts" name="dashboard">
import { getDiagnoseReportList, queryLatestTaskList } from "@/api/biz/diagnosis";
import { DEMO_CONFIG, copyText } from "@/config/demo";
import deepseekIcon from "@/assets/imgs/ai/deepseek.png";
import doubaoIcon from "@/assets/imgs/ai/doubao.png";
import glmIcon from "@/assets/imgs/ai/glm.png";
import kimiIcon from "@/assets/imgs/ai/kimi.png";
import nanoIcon from "@/assets/imgs/ai/nano.png";
import qianwenIcon from "@/assets/imgs/ai/qianwen.png";
import yiyanIcon from "@/assets/imgs/ai/yiyan.png";
import yuanbaoIcon from "@/assets/imgs/ai/yuanbao.png";
import GeoMetricCard from "./components/GeoMetricCard.vue";
import InsightPanel from "./components/InsightPanel.vue";
import PlatformOverview, { type PlatformMetric } from "./components/PlatformOverview.vue";
import RecentDiagnosis from "./components/RecentDiagnosis.vue";

const router = useRouter();
const loading = ref(true);
const loadError = ref(false);
const reportRows = ref<any[]>([]);
const reportTotal = ref(0);
const latestTasks = ref<any[]>([]);

const platformMap: Record<string, { label: string; icon: string }> = {
  deepseek: { label: "DeepSeek", icon: deepseekIcon },
  doubao: { label: "豆包", icon: doubaoIcon },
  glm: { label: "智谱清言", icon: glmIcon },
  kimi: { label: "KIMI", icon: kimiIcon },
  nano: { label: "纳米AI", icon: nanoIcon },
  qianwen: { label: "通义千问", icon: qianwenIcon },
  yiyan: { label: "文心一言", icon: yiyanIcon },
  yuanbao: { label: "腾讯元宝", icon: yuanbaoIcon },
};

const heroPlatforms = ["deepseek", "doubao", "kimi", "qianwen"].map((name) => ({ name, ...platformMap[name] }));

const completedReports = computed(() =>
  reportRows.value.filter((item) => item.report?.status === "completed"),
);

const metrics = computed(() => {
  const platformNames = new Set<string>();
  const competitors = new Set<string>();
  const mentionRates: number[] = [];

  completedReports.value.forEach((item) => {
    const report = item.report || {};
    const rate = Number(report.brand_mention_rate);
    if (Number.isFinite(rate)) mentionRates.push(rate);

    for (const platform of report.platform_summary || []) {
      if (platform.platform) platformNames.add(platform.platform);
      for (const competitor of platform.top_competitors || []) competitors.add(competitor);
    }
    for (const competitor of report.competitors || []) {
      const name = typeof competitor === "string" ? competitor : competitor.brand;
      if (name) competitors.add(name);
    }
  });

  return {
    reportCount: reportTotal.value || reportRows.value.length,
    averageMentionRate: mentionRates.length
      ? mentionRates.reduce((sum, value) => sum + value, 0) / mentionRates.length
      : 0,
    platformCount: platformNames.size,
    competitorCount: competitors.size,
  };
});

const platformMetrics = computed<PlatformMetric[]>(() => {
  const aggregate = new Map<string, { weightedRate: number; samples: number }>();

  completedReports.value.forEach((item) => {
    for (const platform of item.report?.platform_summary || []) {
      const name = platform.platform;
      if (!name) continue;
      const samples = Number(platform.total) || 0;
      const rate = Number(platform.mention_rate) || 0;
      const current = aggregate.get(name) || { weightedRate: 0, samples: 0 };
      current.weightedRate += rate * Math.max(samples, 1);
      current.samples += Math.max(samples, 1);
      aggregate.set(name, current);
    }
  });

  return Array.from(aggregate.entries())
    .map(([name, value]) => ({
      name,
      label: platformMap[name]?.label || name,
      icon: platformMap[name]?.icon || "",
      rate: value.samples ? value.weightedRate / value.samples : 0,
      samples: value.samples,
    }))
    .sort((a, b) => b.rate - a.rate);
});

const latestReport = computed(() => completedReports.value[0] || null);
const latestInsight = computed(() => ({
  brand: latestReport.value?.name || "",
  findings: latestReport.value?.report?.executive_summary?.key_findings || [],
  priorities: latestReport.value?.report?.executive_summary?.priority_focus || [],
}));

const formatRate = (value: number) => Number(value || 0).toFixed(value % 1 === 0 ? 0 : 1);
const goDiagnosis = () => router.push("/biz/diagnosis/aiDiagnosis");
const goReports = () => router.push("/biz/diagnosis/aiDiagnosisReport");
const openLatestReport = () => {
  if (!latestReport.value?.id) return goReports();
  router.push({ path: "/biz/diagnosis/aiDiagnosisReportDetail", query: { id: latestReport.value.id } });
};
const openTask = (task: any) => {
  if (task.status === 7) {
    router.push({ path: "/biz/diagnosis/aiDiagnosisReportDetail", query: { id: task.id } });
    return;
  }
  goDiagnosis();
};

const copyWechat = async () => {
  const ok = await copyText(DEMO_CONFIG.contact.wechat);
  if (ok) showToastOk(`已复制微信号：${DEMO_CONFIG.contact.wechat}`);
  else showToastFail("复制失败，请手动复制");
};

async function loadDashboard() {
  loading.value = true;
  loadError.value = false;
  const [reportsResult, tasksResult] = await Promise.allSettled([
    getDiagnoseReportList({ page: 1, page_size: 20 }),
    queryLatestTaskList(),
  ]);

  if (reportsResult.status === "fulfilled") {
    reportRows.value = reportsResult.value.data.result?.rows || [];
    reportTotal.value = reportsResult.value.data.result?.total || reportRows.value.length;
  } else {
    reportRows.value = [];
    reportTotal.value = 0;
    loadError.value = true;
  }

  if (tasksResult.status === "fulfilled") {
    latestTasks.value = tasksResult.value.data.result || [];
  } else {
    latestTasks.value = [];
    loadError.value = true;
  }
  loading.value = false;
}

onMounted(loadDashboard);
</script>

<style lang="scss" scoped>
.geo-dashboard {
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 20px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: var(--el-fill-color-extra-light);
}

.dashboard-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.55fr);
  min-height: 300px;
  overflow: hidden;
  border-radius: 20px;
  background:
    radial-gradient(circle at 82% 15%, rgba(96, 165, 250, 0.24), transparent 30%),
    linear-gradient(125deg, #0f2557 0%, #164da1 58%, #2478e8 100%);
  box-shadow: 0 18px 45px rgba(22, 77, 161, 0.2);
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 42px 44px;
  color: #fff;

  h1 { max-width: 720px; margin: 14px 0 12px; font-size: clamp(28px, 3vw, 42px); line-height: 1.2; letter-spacing: -1px; }
  > p { max-width: 680px; margin: 0; color: rgba(255, 255, 255, 0.76); font-size: 14px; line-height: 1.8; }
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.09);
  font-size: 11px;
  backdrop-filter: blur(10px);
}

.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 26px; }
.hero-actions :deep(.el-button--default) { border-color: rgba(255, 255, 255, 0.3); color: #fff; background: rgba(255, 255, 255, 0.08); }
.hero-actions :deep(.el-button--default:hover) { border-color: rgba(255, 255, 255, 0.55); background: rgba(255, 255, 255, 0.15); }

.experience-path {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 11px;

  > span { display: inline-flex; width: 20px; height: 20px; align-items: center; justify-content: center; border-radius: 50%; color: #fff; background: rgba(255, 255, 255, 0.14); font-weight: 700; }
  strong { color: rgba(255, 255, 255, 0.86); font-weight: 500; }
}

.hero-visual { position: relative; min-height: 300px; }
.signal-orbit { position: absolute; top: 50%; left: 50%; border: 1px solid rgba(255, 255, 255, 0.16); border-radius: 50%; transform: translate(-50%, -50%); }
.signal-orbit--outer { width: 270px; height: 270px; }
.signal-orbit--inner { width: 170px; height: 170px; }
.signal-core { position: absolute; top: 50%; left: 50%; display: flex; width: 104px; height: 104px; align-items: center; justify-content: center; flex-direction: column; border: 1px solid rgba(255, 255, 255, 0.22); border-radius: 28px; color: #fff; background: rgba(255, 255, 255, 0.12); box-shadow: 0 18px 50px rgba(3, 22, 60, 0.3); transform: translate(-50%, -50%); backdrop-filter: blur(14px); }
.signal-core img { width: 27px; height: 27px; margin-bottom: 4px; }
.signal-core strong { font-size: 20px; letter-spacing: 1px; }
.signal-core span { color: rgba(255, 255, 255, 0.62); font-size: 9px; }
.signal-node { position: absolute; display: flex; width: 42px; height: 42px; align-items: center; justify-content: center; border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 50%; background: rgba(255, 255, 255, 0.9); box-shadow: 0 8px 24px rgba(7, 35, 82, 0.28); }
.signal-node img { width: 31px; height: 31px; object-fit: contain; }
.signal-node--1 { top: 14%; left: 47%; }
.signal-node--2 { top: 46%; right: 8%; }
.signal-node--3 { bottom: 8%; left: 45%; }
.signal-node--4 { top: 45%; left: 6%; }

.demo-note { display: flex; align-items: center; gap: 8px; margin: 14px 2px 0; color: var(--el-text-color-secondary); font-size: 11px; }
.demo-note .el-icon { color: var(--el-color-primary); }
.dashboard-loading { margin-top: 20px; padding: 24px; border-radius: 16px; background: var(--el-bg-color); }
.dashboard-alert { margin-top: 18px; }

.metric-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-top: 18px; }
.dashboard-grid { display: grid; gap: 16px; margin-top: 16px; }
.dashboard-grid--primary { grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr); }
.dashboard-grid--secondary { grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr); }

.dashboard-card { min-width: 0; padding: 22px; border: 1px solid var(--el-border-color-lighter); border-radius: 16px; background: var(--el-bg-color); box-shadow: 0 8px 24px rgba(31, 41, 55, 0.04); }
.card-eyebrow { color: var(--el-color-primary); font-size: 10px; font-weight: 700; letter-spacing: 1.2px; }
.full-edition-card { display: flex; flex-direction: column; background: linear-gradient(150deg, var(--el-bg-color) 0%, var(--el-color-primary-light-9) 100%); }
.full-edition-card h2 { margin: 5px 0 8px; color: var(--el-text-color-primary); font-size: 18px; }
.full-edition-card > div > p { margin: 0; color: var(--el-text-color-secondary); font-size: 12px; line-height: 1.7; }
.capability-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 18px 0; }
.capability-item { display: flex; min-width: 0; align-items: flex-start; gap: 9px; padding: 10px; border: 1px solid rgba(64, 128, 255, 0.1); border-radius: 10px; background: rgba(255, 255, 255, 0.64); }
.capability-item > .el-icon { margin-top: 2px; flex-shrink: 0; color: var(--el-color-primary); }
.capability-item span { display: flex; min-width: 0; flex-direction: column; gap: 3px; }
.capability-item strong { color: var(--el-text-color-primary); font-size: 12px; }
.capability-item small { color: var(--el-text-color-placeholder); font-size: 10px; line-height: 1.5; }
.edition-cta { width: 100%; margin-top: auto; }

@media (max-width: 1200px) {
  .metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dashboard-grid--primary,
  .dashboard-grid--secondary { grid-template-columns: 1fr; }
}

@media (max-width: 900px) {
  .dashboard-hero { grid-template-columns: 1fr; }
  .hero-content { padding: 34px 28px; }
  .hero-visual { display: none; }
}

@media (max-width: 600px) {
  .geo-dashboard { padding: 12px; }
  .hero-content { padding: 28px 20px; }
  .hero-actions :deep(.el-button) { width: 100%; margin-left: 0; }
  .experience-path .el-icon { display: none; }
  .metric-grid { grid-template-columns: 1fr; gap: 12px; }
  .capability-list { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
</style>
