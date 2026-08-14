<template>
  <div class="ad">
    <!-- Hero 区域 -->
    <div class="ad-hero">
      <div class="ad-hero-decor ad-hero-decor--1"></div>
      <div class="ad-hero-decor ad-hero-decor--2"></div>
      <div class="ad-hero-inner">
        <div class="ad-hero-head">
          <div class="ad-hero-head-left">
            <h2 class="ad-hero-title">你的品牌，AI 怎么看？ 🤔</h2>
            <p class="ad-hero-desc">
              输入品牌关键词与行业词，一键检测主流 AI 平台是否提及你的品牌。
            </p>
          </div>
          <div class="ad-hero-head-right">
            <div class="ad-hero-badge">AI 品牌雷达</div>
            <div class="ad-hero-stats">
              <div class="ad-hero-stat">
                <span class="ad-hero-stat-num">8</span>
                <span class="ad-hero-stat-label">平台覆盖</span>
              </div>
              <div class="ad-hero-divider"></div>
              <div class="ad-hero-stat">
                <span class="ad-hero-stat-num">100%</span>
                <span class="ad-hero-stat-label">实时检测</span>
              </div>
              <div class="ad-hero-divider"></div>
              <div class="ad-hero-stat">
                <span class="ad-hero-stat-num">40m</span>
                <span class="ad-hero-stat-label">深度检测</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 核心输入区融入 hero -->
        <div class="ad-hero-form">
          <div class="ad-hero-row">
            <div class="ad-hero-field">
              <span class="ad-hero-field-label">品牌名称</span>
              <div class="ad-hero-tag-input">
                <input
                  class="ad-hero-tag-input-inner"
                  v-model="brandInput"
                  placeholder="建议填写品牌全称+简称，如德施曼智能锁,德施曼"
                />
              </div>
            </div>
            <div class="ad-hero-field" style="max-width: 500px;">
              <span class="ad-hero-field-label">行业关键词</span>
              <div class="ad-hero-tag-input">
                <el-tag
                  v-for="(tag, idx) in industryList"
                  :key="idx"
                  closable
                  size="small"
                  round
                  effect="dark"
                  @close="handleRemoveIndustry(idx)"
                  >{{ tag }}</el-tag
                >
                <input
                  class="ad-hero-tag-input-inner"
                  v-model="industryInput"
                  :placeholder="
                    industryList.length >= MAX_INDUSTRY_WORDS
                      ? '已达上限'
                      : '回车添加多个行业关键词'
                  "
                  :disabled="industryList.length >= MAX_INDUSTRY_WORDS"
                  @keydown.enter.prevent="handleAddIndustry"
                  @blur="handleAddIndustry"
                />
              </div>
            </div>
            <el-button
              class="ad-hero-submit"
              type="primary"
              round
              @click="handleSubmit"
              :loading="submitLoading"
              :disabled="!selectedPlatforms.length"
            >
              <el-icon class="mr-[6px]"><Promotion /></el-icon>
              开始诊断
              <span class="ad-hero-submit-price">消耗{{ currentPrice }} 算力</span>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 进行中的任务条 -->
    <div class="ad-task-bar" v-if="taskList.length">
      <div class="ad-task-bar-left">
        <div
          class="ad-task-bar-icon"
          :class="getStatusClass(taskList[currentTaskIndex].status)"
        >
          <div
            class="ad-task-bar-loader-ring"
            v-if="taskList[currentTaskIndex].status !== 7"
          ></div>
          <el-icon v-else :size="14"><CircleCheck /></el-icon>
        </div>
        <div class="ad-task-bar-carousel">
          <transition name="ad-task-slide" mode="out-in">
            <div class="ad-task-bar-info" :key="currentTaskIndex">
              <div class="ad-task-bar-title-row">
                <span class="ad-task-bar-title">{{
                  taskList[currentTaskIndex].name
                }}</span>
                <span
                  class="ad-task-status"
                  :class="
                    'ad-task-status--' +
                    getStatusBadgeType(taskList[currentTaskIndex].status)
                  "
                  >{{ getStatusText(taskList[currentTaskIndex].status) }}</span
                >
              </div>
              <div class="ad-task-bar-meta">
                <!-- <span>{{ taskList[currentTaskIndex].ai_platforms }}</span> -->
                <!-- <span class="ad-task-bar-dot">·</span> -->
                <span
                  >预计消耗算力：{{
                    taskList[currentTaskIndex].consumption_amount
                  }}</span
                >
                <span class="ad-task-bar-dot">·</span>
                <span
                  >行业关键词：{{
                    taskList[currentTaskIndex].industry_keywords
                  }}</span
                >
                <span class="ad-task-bar-dot">·</span>
                <span
                  >创建时间：{{
                    dayjs(taskList[currentTaskIndex].submit_time).format(
                      "YYYY-MM-DD HH:mm:ss",
                    )
                  }}</span
                >
              </div>
            </div>
          </transition>
        </div>
      </div>
      <div class="ad-task-bar-right">
        <el-button
          v-if="taskList[currentTaskIndex].status === 7"
          size="small"
          link
          type="primary"
          @click.stop="handleGoReport(taskList[currentTaskIndex])"
          >查看诊断报告 →</el-button
        >
        <el-button
          v-if="[1, 2, 3].includes(taskList[currentTaskIndex].status)"
          size="small"
          link
          type="danger"
          @click.stop="handleCancelTask(taskList[currentTaskIndex].id)"
          >取消任务</el-button
        >
        <span class="ad-task-bar-counter" v-if="taskList.length > 1"
          >{{ currentTaskIndex + 1 }}/{{ taskList.length }}</span
        >
      </div>
    </div>

    <!-- 最近完成诊断报告提醒 -->
    <div
      class="ad-task-notify"
      v-if="hasInProgressTasks && recentCompletedTasks.length > 0"
    >
      <div
        class="ad-task-notify-inner"
        v-for="task in recentCompletedTasks"
        :key="task.id"
      >
        <div class="ad-task-notify-left">
          <el-icon :size="14" color="var(--el-color-success)"
            ><CircleCheck
          /></el-icon>
          <span class="ad-task-notify-text"
            >诊断报告已生成：{{ task.name }}</span
          >
        </div>
        <el-button
          type="primary"
          link
          size="small"
          @click="handleGoReport(task)"
          >查看报告</el-button
        >
      </div>
    </div>

    <!-- 主内容 -->
    <div class="ad-body">
      <!-- 左：配置 -->
      <div class="ad-form">
        <!-- 平台选择 -->
        <div class="ad-section">
          <div class="ad-section-hd">
            <span class="ad-section-num">01</span>
            <div class="ad-section-text">
              <span class="ad-section-title">选择检测平台</span>
              <span class="ad-section-sub">可多选，默认检测全部平台</span>
            </div>
            <el-button
              text
              size="small"
              type="primary"
              @click="handleToggleAll"
            >
              {{
                selectedPlatforms.length === aiPlatforms.length
                  ? "取消全选"
                  : "全选"
              }}
            </el-button>
          </div>
          <div class="ad-platforms">
            <div
              class="ad-pf"
              v-for="p in aiPlatforms"
              :key="p.name"
              :class="{ 'ad-pf--on': selectedPlatforms.includes(p.name) }"
              @click="handleTogglePlatform(p.name)"
            >
              <img class="ad-pf-img" :src="p.icon" :alt="p.label" />
              <span class="ad-pf-name">{{ p.label }}</span>
            </div>
          </div>
        </div>

        <!-- 选项 -->
        <div class="ad-section">
          <div class="ad-section-hd">
            <span class="ad-section-num">02</span>
            <div class="ad-section-text">
              <span class="ad-section-title">诊断选项</span>
            </div>
          </div>
          <div class="ad-options">
            <div
              class="ad-opt"
              :class="{ 'ad-opt--on': reportOption === 'none' }"
              @click="reportOption = 'none'"
            >
              <el-icon :size="16"><CircleCheck /></el-icon>
              <div class="ad-opt-text">
                <span class="ad-opt-label">仅查看结果</span>
                <span class="ad-opt-desc">快速检测，只展示 AI 提及情况</span>
              </div>
            </div>
            <div
              class="ad-opt"
              :class="{ 'ad-opt--on': reportOption === 'report' }"
              @click="reportOption = 'report'"
            >
              <span class="ad-opt-badge">+{{ optimizeSuanli }} 算力</span>
              <el-icon :size="16"><Document /></el-icon>
              <div class="ad-opt-text">
                <span class="ad-opt-label">生成建议报告</span>
                <span class="ad-opt-desc"
                  >附带优化建议，帮你提升 AI 可见度</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右：说明卡片 -->
      <div class="ad-side">
        <div class="ad-side-card">
          <div class="ad-side-card-hd">
            <div class="ad-side-card-icon">🔍</div>
            <div class="ad-side-card-hd-text">
              <span class="ad-side-card-title">什么是 AI 品牌诊断？</span>
              <span class="ad-side-card-sub">AI 时代的品牌雷达</span>
            </div>
          </div>
          <p class="ad-side-card-p">
            AI 品牌诊断可以帮助你了解：当用户在 AI 平台（如
            DeepSeek、KIMI、豆包等）中询问与你品牌相关的问题时，AI
            是否会提及你的品牌名称。
          </p>
          <div class="ad-side-card-divider"></div>
          <p class="ad-side-card-p">
            <strong>适用场景</strong>
          </p>
          <ul class="ad-side-card-list">
            <li>品牌在 AI 时代的知名度评估</li>
            <li>竞品对比分析</li>
            <li>SEO/AEO 优化参考</li>
            <li>市场推广策略调整</li>
          </ul>
        </div>

        <div class="ad-side-card">
          <div class="ad-side-card-hd">
            <div class="ad-side-card-icon">💡</div>
            <div class="ad-side-card-hd-text">
              <span class="ad-side-card-title">使用提示</span>
              <span class="ad-side-card-sub">让诊断结果更精准</span>
            </div>
          </div>
          <ul class="ad-side-card-list">
            <li>
              品牌名称建议填写<strong>全称 + 简称</strong>，如「小米科技,小米」
            </li>
            <li>行业词越精准，诊断结果越有参考价值</li>
            <li>建议生成报告可获取 AI 提及优化建议</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 结果区 -->
    <div class="ad-result" v-if="hasResult">
      <div class="ad-result-hd">
        <div class="ad-result-hd-left">
          <el-icon :size="18" color="var(--el-color-primary)"
            ><DataAnalysis
          /></el-icon>
          <span class="ad-result-title">诊断结果</span>
        </div>
        <span class="ad-result-tip">检测完成</span>
      </div>
      <div class="ad-result-body">
        <div class="ad-result-empty">
          <el-icon :size="32" color="var(--el-text-color-placeholder)"
            ><DataAnalysis
          /></el-icon>
          <span>结果将在此处展示</span>
        </div>
      </div>
    </div>

    <!-- 确认弹窗 -->
    <el-dialog
      v-model="confirmShow"
      title="确认诊断信息"
      width="480px"
      destroy-on-close
    >
      <div class="confirm-info">
        <div class="confirm-row">
          <span class="confirm-label">品牌名称</span>
          <span class="confirm-value">{{ brandInput.trim() }}</span>
        </div>
        <div class="confirm-row">
          <span class="confirm-label">行业关键词</span>
          <div class="confirm-tags">
            <el-tag
              v-for="(tag, idx) in industryList"
              :key="idx"
              size="small"
              round
              >{{ tag }}</el-tag
            >
          </div>
        </div>
        <div class="confirm-row">
          <span class="confirm-label">检测平台</span>
          <div class="confirm-tags">
            <el-tag
              v-for="name in selectedPlatforms"
              :key="name"
              size="small"
              round
              >{{
                aiPlatforms.find((p) => p.name === name)?.label || name
              }}</el-tag
            >
          </div>
        </div>
        <div class="confirm-row">
          <span class="confirm-label">诊断选项</span>
          <span class="confirm-value">{{
            reportOption === "report" ? "生成建议报告" : "仅查看结果"
          }}</span>
        </div>
        <div class="confirm-row">
          <span class="confirm-label">消耗算力</span>
          <span class="confirm-amount">{{ currentPrice }} 算力</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="confirmShow = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitTask"
          >确认诊断</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="aiDiagnosis">
import { ElMessageBox } from "element-plus";
import bus from "@/utils/bus";
import {
  createAIDiagnoseTask,
  queryPricingInfo,
  queryLatestTaskList,
  cancelDiagnoseTask,
} from "@/api/biz/diagnosis";
import dayjs from "dayjs";

const MAX_INDUSTRY_WORDS = 3;

/** 进行中状态 */
const IN_PROGRESS_STATUSES = [1, 2, 3, 4, 9];

/** AI平台列表 */
const aiPlatforms = [
  {
    name: "deepseek",
    label: "DeepSeek",
    icon: new URL("@/assets/imgs/ai/deepseek.png", import.meta.url).href,
  },
  {
    name: "doubao",
    label: "豆包",
    icon: new URL("@/assets/imgs/ai/doubao.png", import.meta.url).href,
  },
  {
    name: "glm",
    label: "智谱清言",
    icon: new URL("@/assets/imgs/ai/glm.png", import.meta.url).href,
  },
  {
    name: "kimi",
    label: "KIMI",
    icon: new URL("@/assets/imgs/ai/kimi.png", import.meta.url).href,
  },
  {
    name: "nano",
    label: "纳米AI",
    icon: new URL("@/assets/imgs/ai/nano.png", import.meta.url).href,
  },
  {
    name: "qianwen",
    label: "通义千问",
    icon: new URL("@/assets/imgs/ai/qianwen.png", import.meta.url).href,
  },
  {
    name: "yiyan",
    label: "文心一言",
    icon: new URL("@/assets/imgs/ai/yiyan.png", import.meta.url).href,
  },
  {
    name: "yuanbao",
    label: "腾讯元宝",
    icon: new URL("@/assets/imgs/ai/yuanbao.png", import.meta.url).href,
  },
];

/** 已选中的检测平台 */
const selectedPlatforms = ref<string[]>(aiPlatforms.map((p) => p.name));
/** 品牌输入框值 */
const brandInput = ref("");
/** 行业词输入框值 */
const industryInput = ref("");
/** 已添加的行业关键词 */
const industryList = ref<string[]>([]);
/** 报告选项：none=仅查看结果，report=生成建议报告 */
const reportOption = ref("none");
/** 提交加载状态 */
const submitLoading = ref(false);
/** 确认弹窗显示状态 */
const confirmShow = ref(false);
/** 是否有诊断结果 */
const hasResult = ref(false);
/** 最新任务列表 */
const taskList = ref<any[]>([]);
/** 最近完成的诊断报告（30分钟内，用于通知提醒） */
const recentCompletedTasks = ref<any[]>([]);
/** 当前轮播索引 */
const currentTaskIndex = ref(0);
/** 轮播定时器 */
let carouselTimer: ReturnType<typeof setInterval> | null = null;
/** 单次诊断任务价格 */
const taskPrice = ref("0.00");
/** 优化建议附加价格 */
const optimizePrice = ref("0.00");

/** 当前消耗算力（基础价格 + 优化建议价格） */
const currentPrice = computed(() => {
  const base = Number(taskPrice.value) || 0;
  const opt =
    reportOption.value === "report" ? Number(optimizePrice.value) || 0 : 0;
  return base + opt;
});

/** 优化建议附加算力 */
const optimizeSuanli = computed(() => Number(optimizePrice.value) || 0);

/** 当前任务列表中是否有进行中的任务 */
const hasInProgressTasks = computed(() => {
  return taskList.value.some((t) => IN_PROGRESS_STATUSES.includes(t.status));
});

/** 切换选中/取消单个平台 */
const handleTogglePlatform = (name: string) => {
  const idx = selectedPlatforms.value.indexOf(name);
  if (idx > -1) {
    selectedPlatforms.value.splice(idx, 1);
  } else {
    selectedPlatforms.value.push(name);
  }
};

/** 全选/取消全选平台 */
const handleToggleAll = () => {
  if (selectedPlatforms.value.length === aiPlatforms.length) {
    selectedPlatforms.value = [];
  } else {
    selectedPlatforms.value = aiPlatforms.map((p) => p.name);
  }
};

/** 添加行业关键词 */
const handleAddIndustry = () => {
  const val = industryInput.value.trim();
  if (!val) return;
  if (industryList.value.length >= MAX_INDUSTRY_WORDS) return;
  if (industryList.value.includes(val)) return;
  industryList.value.push(val);
  industryInput.value = "";
};

/** 移除行业关键词 */
const handleRemoveIndustry = (idx: number) => {
  industryList.value.splice(idx, 1);
};

/** 跳转到诊断报告 */
const handleGoReport = (task?: any) => {
  // TODO: 跳转到报告页
};

/** 获取任务状态文本 */
const getStatusText = computed(() => {
  const map: Record<number, string> = {
    1: "已提交",
    2: "服务端排队中",
    3: "客户端排队中",
    4: "任务处理中",
    5: "已取消",
    6: "服务异常",
    7: "诊断报告已生成",
    9: "生成诊断报告中",
  };
  return (status: number) => map[status] || "未知";
});

/** 获取状态图标容器样式类 */
const getStatusClass = computed(() => {
  return (status: number) =>
    status === 7 ? "ad-task-bar-icon--done" : "ad-task-bar-icon--loading";
});

/** 获取状态徽章类型 */
const getStatusBadgeType = computed(() => {
  const map: Record<number, string> = {
    1: "info",
    2: "warning",
    3: "warning",
    4: "primary",
    5: "info",
    6: "danger",
    7: "success",
    9: "primary",
  };
  return (status: number) => map[status] || "info";
});

/** 启动任务轮播 */
const startCarousel = () => {
  stopCarousel();
  if (taskList.value.length > 1) {
    carouselTimer = setInterval(() => {
      currentTaskIndex.value =
        (currentTaskIndex.value + 1) % taskList.value.length;
    }, 4000);
  }
};

/** 停止任务轮播 */
const stopCarousel = () => {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
};

/** 取消诊断任务 */
const handleCancelTask = async (taskId: number) => {
  const task = taskList.value.find((t) => t.id === taskId);
  if (!task) return;

  try {
    await ElMessageBox.confirm(
      `确定要取消任务「${task.name}」吗？取消后金额将退回账户。`,
      "取消确认",
      {
        confirmButtonText: "确定取消",
        cancelButtonText: "再想想",
        type: "warning",
      },
    );
  } catch (error) {
    return;
  }

  try {
    showLoading();
    await cancelDiagnoseTask({ task_id: taskId });
    showToastOk("任务已取消");
    loadLatestTasks();
    bus.emit("refresh-account-balance");
  } catch (error: any) {
    showToastFail(error?.err_msg || "取消任务失败");
  }
};

/** 校验并打开确认弹窗 */
const handleSubmit = () => {
  if (!brandInput.value.trim()) {
    showToastFail("请输入品牌名称");
    return;
  }
  if (!industryList.value.length) {
    showToastFail("请至少添加一个行业关键词");
    return;
  }
  if (!selectedPlatforms.value.length) {
    showToastFail("请至少选择一个检测平台");
    return;
  }
  confirmShow.value = true;
};

/** 确认提交诊断任务 */
const submitTask = async () => {
  submitLoading.value = true;
  try {
    await createAIDiagnoseTask({
      name: brandInput.value.trim(),
      industry_keywords: industryList.value,
      ai_platforms: selectedPlatforms.value,
      diagnose_result_options: reportOption.value === "report" ? 2 : 1,
    });
    showToastOk("任务创建成功");
    confirmShow.value = false;
    brandInput.value = "";
    industryList.value = [];
    loadLatestTasks();
    bus.emit("refresh-account-balance");
  } catch (e: any) {
    showToastFail(e?.err_msg || "创建任务失败");
  } finally {
    submitLoading.value = false;
  }
};

/** 加载定价信息 */
async function loadPricing() {
  try {
    const { data: response } = await queryPricingInfo();
    taskPrice.value = response.result?.ai_diagnose_task_price ?? "0.00";
    optimizePrice.value =
      response.result?.ai_diagnose_task_optimize_price ?? "0.00";
  } catch {
    taskPrice.value = "0.00";
    optimizePrice.value = "0.00";
  }
}

/** 加载最新任务列表 */
async function loadLatestTasks() {
  try {
    const { data: response } = await queryLatestTaskList();
    const allTasks: any[] = response.result || [];

    // 分离进行中和已完成的任务
    const inProgress = allTasks.filter((t: any) =>
      IN_PROGRESS_STATUSES.includes(t.status),
    );
    const completed = allTasks.filter((t: any) => t.status === 7);

    // 过滤30分钟内完成的任务
    const now = dayjs();
    const recentCompleted = completed.filter((t: any) => {
      const finishTime = t.finish_time || t.complete_time || t.update_time;
      return finishTime && now.diff(dayjs(finishTime), "minute") < 30;
    });

    recentCompletedTasks.value = recentCompleted;

    if (inProgress.length > 0) {
      // 有进行中的任务，任务栏只展示进行中的
      taskList.value = inProgress;
    } else if (recentCompleted.length > 0) {
      // 没有进行中但有最近完成的，展示完成的
      taskList.value = recentCompleted;
    } else {
      taskList.value = [];
    }

    currentTaskIndex.value = 0;
    startCarousel();
  } catch {
    taskList.value = [];
    recentCompletedTasks.value = [];
  }
}

onMounted(() => {
  loadPricing();
  loadLatestTasks();
});

onBeforeUnmount(() => {
  stopCarousel();
});
</script>

<style lang="scss" scoped>
$bg: #f7f9fc;
$section-gap: 28px;

.ad {
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 100%;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

/* ── Hero ── */
.ad-hero {
  position: relative;
  padding: 36px 36px 28px;
  background: linear-gradient(135deg, #111827 0%, #1a2744 50%, #111827 100%);
  overflow: hidden;
  border-radius: 14px;
  margin-right: 10px;
  margin-left: 5px;
  margin-top: 10px;

  .ad-hero-decor {
    position: absolute;
    border-radius: 50%;

    &--1 {
      top: -80px;
      right: -30px;
      width: 280px;
      height: 280px;
      background: radial-gradient(
        circle,
        rgba(59, 130, 246, 0.18) 0%,
        transparent 70%
      );
    }

    &--2 {
      bottom: -80px;
      left: 25%;
      width: 220px;
      height: 220px;
      background: radial-gradient(
        circle,
        rgba(99, 102, 241, 0.14) 0%,
        transparent 70%
      );
    }
  }

  .ad-hero-inner {
    position: relative;
    z-index: 1;
  }

  /* 顶部两列：左标题 + 右 badge+指标 */
  .ad-hero-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 14px;
  }

  .ad-hero-head-left {
    flex: 1;
    min-width: 0;
  }

  .ad-hero-head-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
    flex-shrink: 0;
  }

  .ad-hero-title {
    font-size: 26px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 10px;
    letter-spacing: -0.5px;
    line-height: 1.3;
  }

  .ad-hero-desc {
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.7;
    margin: 0;
    max-width: 420px;
  }

  .ad-hero-badge {
    padding: 4px 12px;
    border-radius: 6px;
    border: 1px solid rgba(59, 130, 246, 0.3);
    background-color: rgba(59, 130, 246, 0.1);
    color: #93c5fd;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .ad-hero-stats {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px 14px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(148, 163, 184, 0.1);
  }

  .ad-hero-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;

    .ad-hero-stat-num {
      font-size: 17px;
      font-weight: 700;
      color: #fff;
    }

    .ad-hero-stat-label {
      font-size: 10px;
      color: #64748b;
      white-space: nowrap;
    }
  }

  .ad-hero-divider {
    width: 1px;
    height: 24px;
    background-color: #334155;
  }

  /* ── Hero 内嵌表单 ── */
  .ad-hero-form {
    padding-top: 20px;
    border-top: 1px solid rgba(148, 163, 184, 0.15);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ad-hero-row {
    display: flex;
    align-items: flex-end;
    gap: 12px;

    @media (max-width: 640px) {
      flex-wrap: wrap;
    }
  }

  .ad-hero-field {
    flex: 1;
    max-width: 320px;
    display: flex;
    flex-direction: column;
    gap: 5px;

    .ad-hero-field-label {
      font-size: 12px;
      font-weight: 500;
      color: #94a3b8;
      letter-spacing: 0.3px;
    }
  }

  /* 统一 tag 输入框样式 — 毛玻璃 */
  .ad-hero-tag-input {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    min-height: 36px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition: border-color 0.15s;

    &:focus-within {
      border-color: rgba(255, 255, 255, 0.35);
    }

    &:has(.ad-hero-tag-input-inner:disabled) {
      opacity: 0.7;
    }

    :deep(.el-tag) {
      background-color: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.2);
      color: #e2e8f0;

      .el-tag__close {
        color: #cbd5e1;

        &:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
      }
    }

    .ad-hero-tag-input-inner {
      flex: 1;
      min-width: 130px;
      border: none;
      outline: none;
      font-size: 13px;
      color: #fff;
      background: transparent;
      height: 24px;

      &::placeholder {
        color: rgba(255, 255, 255, 0.4);
      }

      &:disabled {
        opacity: 0.5;
      }
    }
  }

  .ad-hero-submit {
    flex-shrink: 0;
    height: 36px;
    font-weight: 600;
    line-height: 1;

    .ad-hero-submit-price {
      margin-left: 6px;
      padding: 4px 6px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.2);
      font-size: 11px;
      font-weight: 500;
      line-height: 1;
    }
  }
}

/* ── 进行中任务条 ── */
.ad-task-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 15px 0;
  padding: 10px 16px;
  background-color: #fff;
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: border-color 0.15s;

  &:hover {
    border-color: var(--el-color-primary-light-5);

    .ad-task-bar-link {
      color: var(--el-color-primary);
    }
  }

  .ad-task-bar-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  .ad-task-bar-icon {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &.ad-task-bar-icon--loading {
      .ad-task-bar-loader-ring {
        width: 18px;
        height: 18px;
        border: 2px solid var(--el-color-primary-light-8);
        border-top-color: var(--el-color-primary);
        border-radius: 50%;
        animation: ad-spin 0.8s linear infinite;
      }
    }

    &.ad-task-bar-icon--done {
      color: var(--el-color-success);
    }
  }

  .ad-task-bar-carousel {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .ad-task-bar-info {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .ad-task-bar-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;
    }

    .ad-task-bar-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .ad-task-status {
      flex-shrink: 0;
      font-size: 10px;
      font-weight: 500;
      padding: 3px 6px;
      border-radius: 3px;
      line-height: 1.5;

      &.ad-task-status--info {
        color: var(--el-color-info);
        background-color: var(--el-color-info-light-9);
      }

      &.ad-task-status--warning {
        color: var(--el-color-warning);
        background-color: var(--el-color-warning-light-9);
      }

      &.ad-task-status--primary {
        color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }

      &.ad-task-status--success {
        color: var(--el-color-success);
        background-color: var(--el-color-success-light-9);
      }
    }

    .ad-task-bar-meta {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: var(--el-text-color-placeholder);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1;

      .ad-task-bar-dot {
        color: var(--el-border-color);
        flex-shrink: 0;
      }
    }
  }

  .ad-task-bar-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    .ad-task-bar-counter {
      font-size: 11px;
      color: var(--el-text-color-placeholder);
      background: var(--el-fill-color-light);
      padding: 2px 8px;
      border-radius: 10px;
      min-width: 32px;
      text-align: center;
    }
  }
}

/* ── 最近完成通知 ── */
.ad-task-notify {
  margin: 8px 15px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ad-task-notify-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background-color: var(--el-color-success-light-9);
  border-radius: 8px;
  border: 1px solid var(--el-color-success-light-8);
}

.ad-task-notify-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ad-task-notify-text {
  font-size: 12px;
  color: var(--el-color-success);
  font-weight: 500;
}

.ad-task-slide-enter-active,
.ad-task-slide-leave-active {
  transition: all 0.3s ease;
}

.ad-task-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.ad-task-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

@keyframes ad-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── 主内容 左右布局 ── */
.ad-body {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 20px;
  padding: 15px 15px 32px;
  align-items: flex-start;
}

/* ── 左侧表单 ── */
.ad-form {
  flex: 1;
  min-width: 0;
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: $section-gap;
}

.ad-section {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .ad-section-hd {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 2px;

    .ad-section-num {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .ad-section-text {
      display: flex;
      flex-direction: column;
      gap: 1px;
      flex: 1;

      .ad-section-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .ad-section-sub {
        font-size: 11px;
        color: var(--el-text-color-placeholder);
      }
    }
  }
}

/* 平台选择 */
.ad-platforms {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .ad-pf {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 20px;
    border: 1px solid var(--el-border-color-lighter);
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
    line-height: 1;

    .ad-pf-img {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }

    &:hover {
      border-color: var(--el-color-primary-light-5);
    }
  }

  .ad-pf--on {
    border-color: var(--el-color-primary-light-5);
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}

/* 选项卡片 */
.ad-options {
  display: flex;
  gap: 10px;

  .ad-opt {
    flex: 1;
    max-width: 280px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 8px;
    border: 1px solid var(--el-border-color-lighter);
    cursor: pointer;
    transition: all 0.15s;
    color: var(--el-text-color-secondary);
    position: relative;

    .ad-opt-badge {
      position: absolute;
      top: 3px;
      right: 4px;
      padding: 2px 8px;
      border-radius: 4px;
      background-color: var(--el-color-warning-light-9);
      color: var(--el-color-warning);
      font-size: 11px;
      font-weight: 600;
      line-height: 1.4;
    }

    .ad-opt-text {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .ad-opt-label {
        font-size: 13px;
        font-weight: 500;
      }

      .ad-opt-desc {
        font-size: 11px;
        color: var(--el-text-color-placeholder);
      }
    }

    &:hover {
      border-color: var(--el-color-primary-light-5);
    }
  }

  .ad-opt--on {
    border-color: var(--el-color-primary-light-5);
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);

    .ad-opt-badge {
      background-color: var(--el-color-primary);
      color: #fff;
    }

    .ad-opt-desc {
      color: var(--el-color-primary-light-3);
    }
  }
}

/* ── 右侧说明 ── */
.ad-side {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;

  .ad-side-card {
    background-color: #fff;
    border-radius: 12px;
    padding: 16px;
  }

  .ad-side-card-hd {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .ad-side-card-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background-color: var(--el-color-primary-light-9);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }

  .ad-side-card-hd-text {
    display: flex;
    flex-direction: column;
    gap: 1px;

    .ad-side-card-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .ad-side-card-sub {
      font-size: 11px;
      color: var(--el-text-color-placeholder);
    }
  }

  .ad-side-card-p {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.7;
    margin: 0;
  }

  .ad-side-card-divider {
    height: 1px;
    background-color: var(--el-border-color-extra-light);
    margin: 10px 0;
  }

  .ad-side-card-list {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.8;
    margin: 4px 0 0;
    padding-left: 16px;
  }
}

/* ── 结果区 ── */
.ad-result {
  margin: 0 24px 24px;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;

  .ad-result-hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px dashed var(--el-border-color-extra-light);

    .ad-result-hd-left {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .ad-result-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .ad-result-tip {
      font-size: 11px;
      color: var(--el-text-color-placeholder);
    }
  }

  .ad-result-body {
    padding: 24px 20px;
  }

  .ad-result-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 120px;
    font-size: 13px;
    color: var(--el-text-color-placeholder);
  }
}

.confirm-info {
  display: flex;
  flex-direction: column;
  gap: 14px;

  .confirm-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;

    .confirm-label {
      flex-shrink: 0;
      width: 72px;
      font-size: 13px;
      color: #909399;
      line-height: 24px;
      text-align: right;
    }

    .confirm-value {
      font-size: 13px;
      color: #303133;
      font-weight: 500;
      line-height: 24px;
    }

    .confirm-amount {
      font-size: 18px;
      font-weight: 700;
      color: var(--el-color-primary);
      line-height: 24px;
    }

    .confirm-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      line-height: 24px;
    }
  }
}
</style>
