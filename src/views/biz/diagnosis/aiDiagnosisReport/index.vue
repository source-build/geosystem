<template>
  <div class="report-page">
    <!-- 筛选栏 -->
    <div class="report-bar">
      <div class="report-bar-left">
        <el-input size="small" v-model="queryParams.name" placeholder="搜索品牌" clearable style="width:180px" @clear="queryListData()" @keyup.enter="queryListData()">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select size="small" v-model="queryParams.status" placeholder="状态" clearable style="width:130px" @change="queryListData()">
          <el-option label="已提交" :value="1" />
          <el-option label="服务端排队中" :value="2" />
          <el-option label="客户端排队中" :value="3" />
          <el-option label="任务处理中" :value="4" />
          <el-option label="已取消" :value="5" />
          <el-option label="服务异常" :value="6" />
          <el-option label="处理完成" :value="7" />
          <el-option label="生成诊断报告中" :value="9" />
        </el-select>
        <el-button size="small" type="primary" @click="queryListData()">查询</el-button>
      </div>
      <span class="report-bar-count" v-if="dataListTotal">共 {{ dataListTotal }} 条</span>
    </div>

    <!-- 表格 -->
    <div class="report-main">
      <el-table
        :data="dataList"
        v-loading="loading"
        height="100%"
        row-key="id"
        :row-class-name="tableRowClass"
        style="width: 100%"
        :cell-style="{ padding: '8px 0' }"
        :header-cell-style="{ padding: '6px 0' }"
        size="small"
      >
        <!-- 展开行：AI 洞察 -->
        <el-table-column type="expand" label="洞察" width="60" fixed="left">
          <template #default="{ row }">
            <div class="expand-wrap" v-if="row.report?.executive_summary">
              <div class="expand-section" v-if="row.report.executive_summary.overall_position">
                <span class="expand-label">总评</span>
                <span class="expand-text">{{ row.report.executive_summary.overall_position }}</span>
              </div>
              <div class="expand-section" v-if="row.report.executive_summary.key_findings?.length">
                <span class="expand-label">关键发现</span>
                <div class="expand-tags">
                  <span class="expand-tag" v-for="(f, i) in row.report.executive_summary.key_findings" :key="i">{{ f }}</span>
                </div>
              </div>
              <div class="expand-section" v-if="row.report.executive_summary.priority_focus?.length">
                <span class="expand-label">优先方向</span>
                <div class="expand-tags" :class="{ 'expand-tags--locked': row.diagnose_result_options == 1 }">
                  <span class="expand-tag expand-tag--primary" v-for="(f, i) in row.report.executive_summary.priority_focus" :key="i">{{ f }}</span>
                </div>
              </div>
            </div>
            <div class="expand-wrap" v-else>
              <span class="expand-empty">暂无AI洞察数据</span>
            </div>
          </template>
        </el-table-column>

        <!-- 品牌/状态 -->
        <el-table-column label="品牌" min-width="220">
          <template #default="{ row }">
            <div class="cell-brand">
              <span class="brand-name">{{ row.name }}</span>
              <div class="brand-meta">
                <span class="brand-status" :class="getStatusClass(row)">
                  <i v-if="isInProgress(row)" class="status-pulse"></i>
                  {{ getStatusText(row) }}
                </span>
                <span class="brand-time">{{ formatTime(row.submit_time) }}</span>
                <span class="brand-duration" v-if="row.report?.ai_duration_sec&&row.status!=9">耗时 {{ formatDuration(row.report.ai_duration_sec) }}</span>
              </div>
              <div class="brand-keywords" v-if="row.report?.industry_keywords?.length">
                <span class="brand-keyword" v-for="(kw, i) in row.report.industry_keywords" :key="i">{{ kw }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 提及率 -->
        <el-table-column label="提及率" width="100" align="center">
          <template #default="{ row }">
            <div v-if="row.report && row.report.brand_mention_rate != null" class="mention-cell" :class="'mention-' + mentionLevel(row.report.brand_mention_rate)">
              <span class="mention-value">{{ row.report.brand_mention_rate }}<small>%</small>
                <i class="mention-arrow">
                  <el-icon v-if="row.report.brand_mention_rate >= 50"><Top /></el-icon>
                  <el-icon v-else-if="row.report.brand_mention_rate >= 10"><Right /></el-icon>
                  <el-icon v-else><Bottom /></el-icon>
                </i>
              </span>
            </div>
            <span v-else class="value-empty">--</span>
          </template>
        </el-table-column>

        <!-- 排位 -->
        <el-table-column width="100" align="center">
          <template #header>
            <span>平均排位</span>
            <el-tooltip placement="top" effect="dark">
              <template #content>
                <div>排位越低越好，排位1说明AI第一个就推荐你</div>
                <div>该值为所有AI平台回答的综合平均排位</div>
              </template>
              <el-icon style="margin-left:4px;cursor:pointer;color:#909399;"><QuestionFilled /></el-icon>
            </el-tooltip>
          </template>
          <template #default="{ row }">
            <template v-if="row.report&&row.report.brand_avg_position">
              <span class="value-text">{{ row.report.brand_avg_position ?? '--' }}</span>
              <div class="value-hint">越小越好</div>
            </template>
            <span v-else class="value-empty">--</span>
          </template>
        </el-table-column>

        <!-- 回答 -->
        <el-table-column width="100" align="center">
          <template #header>
            <span>AI有效回答</span>
            <el-tooltip placement="top" effect="dark">
              <template #content>
                <div>AI回答总数：所有AI平台回答次数之和</div>
                <div>未提及：回答中未提及该品牌的次数</div>
              </template>
              <el-icon style="margin-left:4px;cursor:pointer;color:#909399;"><QuestionFilled /></el-icon>
            </el-tooltip>
          </template>
          <template #default="{ row }">
            <template v-if="row.report">
              <span class="value-text">{{ row.report.total_answers ?? '--' }}<small class="value-unit">次</small></span>
              <div class="value-hint" v-if="row.report.context_distribution?.not_mentioned">未提及 {{ row.report.context_distribution.not_mentioned }} 次</div>
            </template>
            <span v-else class="value-empty">--</span>
          </template>
        </el-table-column>

        <!-- 排名 -->
        <el-table-column width="130" align="center">
          <template #header>
            <span>排名</span>
            <el-tooltip placement="top" effect="dark">
              <template #content>
                <div>No.1：品牌排第一位的次数</div>
                <div>Top3：品牌排前三位的次数</div>
              </template>
              <el-icon style="margin-left:4px;cursor:pointer;color:#909399;"><QuestionFilled /></el-icon>
            </el-tooltip>
          </template>
          <template #default="{ row }">
            <div class="rank-wrap" v-if="row.report">
              <template v-if="row.report.brand_first_count||row.report.brand_top3_count">
                <span class="rank-tag rank-tag--gold" v-if="row.report.brand_first_count">No.1 x{{ row.report.brand_first_count }}</span>
                <span class="rank-tag rank-tag--primary" v-if="row.report.brand_top3_count">Top3 x{{ row.report.brand_top3_count }}</span>
              </template>
              <span v-else class="value-empty">--</span>
            </div>
          </template>
        </el-table-column>

        <!-- 各平台表现 -->
        <el-table-column label="各平台表现" min-width="550">
          <template #default="{ row }">
            <div v-if="!row.report" class="platform-loading">
              <i class="platform-spin"></i>
              <span>{{ getProcessingTitle(row) }}</span>
            </div>
            <!-- 有answers明细时，增强版展示 -->
            <div v-else-if="row.report.answers?.length" class="platform-list">
              <div class="platform-row" v-for="pf in row.report.platform_summary" :key="pf.platform">
                <img v-if="getPlatformIcon(pf.platform)" :src="getPlatformIcon(pf.platform)" class="platform-icon" />
                <span class="platform-letter" v-else>{{ pf.platform.charAt(0).toUpperCase() }}</span>
                <span class="platform-name">{{ getPlatformLabel(pf.platform) }}</span>
                <span class="platform-answers">
                  <template v-for="a in getPlatformAnswers(row.report.answers, pf.platform)" :key="a.sequence">
                    <el-tooltip v-if="a.mentioned" :content="a.angle + ' · ' + getContextLabel(a.mention_context_type)" placement="top" :show-after="300">
                      <el-icon class="answer-icon answer-yes"><CircleCheckFilled /></el-icon>
                    </el-tooltip>
                    <el-tooltip v-else :content="a.angle + '：未提及'" placement="top" :show-after="300">
                      <el-icon class="answer-icon answer-no"><CircleCloseFilled /></el-icon>
                    </el-tooltip>
                  </template>
                </span>
                <span class="platform-search-tag" v-if="hasPlatformSearch(row.report.answers, pf.platform)">联网</span>
                <span class="platform-percent" :class="rateClass(pf.mention_rate)">{{ pf.mention_rate }}%</span>
                <span class="platform-bar"><span class="platform-bar-fill" :class="rateBarClass(pf.mention_rate)" :style="{width:Math.min(pf.mention_rate,100)+'%'}"></span></span>
                <span class="platform-meta">位<strong>{{ pf.avg_position||0 }}</strong> 提<strong>{{ pf.mentioned_count||0 }}</strong>/<strong>{{ pf.total||0 }}</strong></span>
                <span class="platform-compete" v-if="pf.top_competitors?.length">
                  <span>竟:</span>
                  <span class="platform-compete-tag" v-for="c in pf.top_competitors.slice(0,2)" :key="c">{{ c }}</span>
                </span>
              </div>
              <div class="platform-row platform-row--failed" v-for="fp in row.report.failedPlatforms" :key="'fail-'+fp.name">
                <img v-if="getPlatformIcon(fp.name)" :src="getPlatformIcon(fp.name)" class="platform-icon platform-icon--failed" />
                <span class="platform-letter platform-icon--failed" v-else>{{ fp.name.charAt(0).toUpperCase() }}</span>
                <span class="platform-name platform-name--failed">{{ getPlatformLabel(fp.name) }}</span>
                <span class="platform-error">分析失败：{{ fp.reason }}</span>
              </div>
            </div>
            <!-- 降级：无answers明细，使用platform_summary汇总 -->
            <div v-else class="platform-list">
              <div class="platform-row" v-for="pf in row.report.platform_summary" :key="pf.platform">
                <img v-if="getPlatformIcon(pf.platform)" :src="getPlatformIcon(pf.platform)" class="platform-icon" />
                <span class="platform-letter" v-else>{{ pf.platform.charAt(0).toUpperCase() }}</span>
                <span class="platform-name">{{ getPlatformLabel(pf.platform) }}</span>
                <span class="platform-percent" :class="rateClass(pf.mention_rate)">{{ pf.mention_rate }}%</span>
                <span class="platform-bar"><span class="platform-bar-fill" :class="rateBarClass(pf.mention_rate)" :style="{width:Math.min(pf.mention_rate,100)+'%'}"></span></span>
                <span class="platform-meta">位<strong>{{ pf.avg_position }}</strong> 提<strong>{{ pf.mentioned_count }}</strong>/<strong>{{ pf.total }}</strong></span>
                <span class="platform-compete" v-if="pf.top_competitors?.length">
                  <span class="platform-compete-tag" v-for="c in pf.top_competitors.slice(0,2)" :key="c">{{ c }}</span>
                </span>
              </div>
              <div class="platform-row platform-row--failed" v-for="fp in row.report.failedPlatforms" :key="'fail-'+fp.name">
                <img v-if="getPlatformIcon(fp.name)" :src="getPlatformIcon(fp.name)" class="platform-icon platform-icon--failed" />
                <span class="platform-letter platform-icon--failed" v-else>{{ fp.name.charAt(0).toUpperCase() }}</span>
                <span class="platform-name platform-name--failed">{{ getPlatformLabel(fp.name) }}</span>
                <span class="platform-error">分析失败：{{ fp.reason }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 语境分布 -->
        <el-table-column width="200">
          <template #header>
            <span>语境分布</span>
            <el-tooltip placement="top" effect="dark">
              <template #content>
                <div>重点推荐：AI把品牌放在首位或单独推荐</div>
                <div>一般推荐：品牌在推荐列表中被提到</div>
                <div>顺带提及：品牌在列举时被提到，无展开</div>
                <div>负面评价：AI对品牌有批评或负面描述</div>
                <div>未提及：品牌未被提及的回答数</div>
              </template>
              <el-icon style="margin-left:4px;cursor:pointer;color:#909399;"><QuestionFilled /></el-icon>
            </el-tooltip>
          </template>
          <template #default="{ row }">
            <div class="context-wrap" v-if="row.report?.context_distribution">
              <div class="context-bar">
                <el-tooltip content="重点推荐" placement="top" :show-after="200"><span class="context-segment context-segment--focus" :style="{width:getDistPercent(row.report.context_distribution,'focus')+'%'}"></span></el-tooltip>
                <el-tooltip content="一般推荐" placement="top" :show-after="200"><span class="context-segment context-segment--normal" :style="{width:getDistPercent(row.report.context_distribution,'normal')+'%'}"></span></el-tooltip>
                <el-tooltip content="顺带提及" placement="top" :show-after="200"><span class="context-segment context-segment--brief" :style="{width:getDistPercent(row.report.context_distribution,'brief')+'%'}"></span></el-tooltip>
                <el-tooltip content="负面评价" placement="top" :show-after="200"><span class="context-segment context-segment--negative" :style="{width:getDistPercent(row.report.context_distribution,'negative')+'%'}"></span></el-tooltip>
                <el-tooltip content="未提及" placement="top" :show-after="200"><span class="context-segment context-segment--unmentioned" :style="{width:getDistPercent(row.report.context_distribution,'not_mentioned')+'%'}"></span></el-tooltip>
              </div>
              <div class="context-legend">
                <el-tooltip content="重点推荐：AI把品牌放在首位或单独推荐" placement="top" :show-after="200">
                  <span class="context-legend-item"><i class="context-dot context-dot--focus"></i>{{ row.report.context_distribution.focus || 0 }}</span>
                </el-tooltip>
                <el-tooltip content="一般推荐：品牌在推荐列表中被提到" placement="top" :show-after="200">
                  <span class="context-legend-item"><i class="context-dot context-dot--normal"></i>{{ row.report.context_distribution.normal || 0 }}</span>
                </el-tooltip>
                <el-tooltip content="顺带提及：品牌在列举时被提到，无展开" placement="top" :show-after="200">
                  <span class="context-legend-item"><i class="context-dot context-dot--brief"></i>{{ row.report.context_distribution.brief || 0 }}</span>
                </el-tooltip>
                <el-tooltip content="负面评价：AI对品牌有批评或负面描述" placement="top" :show-after="200">
                  <span class="context-legend-item"><i class="context-dot context-dot--negative"></i>{{ row.report.context_distribution.negative || 0 }}</span>
                </el-tooltip>
                <el-tooltip content="未提及：品牌未被提及的回答数" placement="top" :show-after="200">
                  <span class="context-legend-item"><i class="context-dot context-dot--unmentioned"></i>{{ row.report.context_distribution.not_mentioned || 0 }}</span>
                </el-tooltip>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- AI 总评 -->
        <el-table-column label="AI 总评" min-width="350">
          <template #default="{ row }">
            <div class="summary-card" v-if="row.report?.executive_summary?.overall_position">
              <span class="summary-badge">AI</span>
              <div class="summary-body">
                <span class="summary-text">{{ row.report.executive_summary.overall_position }}</span>
                <div class="summary-extras" v-if="row.report.executive_summary.key_findings?.length">
                  <el-tooltip v-for="(f, i) in row.report.executive_summary.key_findings.slice(0, 2)" :key="i" :content="f" placement="top" effect="dark" :show-after="300">
                    <span class="summary-extra">{{ f }}</span>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 其他 -->
        <el-table-column label="其他" min-width="180">
          <template #default="{ row }">
            <span v-if="row.status === 6 && row.exception_reason" class="other-reason">失败：{{ row.exception_reason }}</span>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-if="canViewReport(row)" type="primary" link size="small" @click.stop="handleViewReport(row)">
              详情<el-icon class="ml-4px"><ArrowRight /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="report-pagination">
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.page_size"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="dataListTotal"
        @size-change="queryListData(false)"
        @current-change="queryListData(false)"
        size="small"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="aiDiagnosisReport">
import dayjs from "dayjs";
import { showToastFail } from "@/components/f-toast";
import { getDiagnoseReportList } from "@/api/biz/diagnosis";

const router = useRouter();

/** 列表加载状态 */
const loading = ref(false);
/** 诊断报告列表数据 */
const dataList = ref<any[]>([]);
/** 列表总条数 */
const dataListTotal = ref(0);
/** 查询参数（页码、每页条数、品牌名称、任务状态） */
const queryParams = ref({
  page: 1,
  page_size: 10,
  name: "",
  status: "" as number | "",
});

/** AI平台映射表：平台key → 中文名称 + 图标 */
const platformMap: Record<string, { label: string; icon: string }> = {
  deepseek:   { label: "DeepSeek",   icon: new URL("@/assets/imgs/ai/deepseek.png", import.meta.url).href },
  doubao:     { label: "豆包",       icon: new URL("@/assets/imgs/ai/doubao.png", import.meta.url).href },
  glm:        { label: "智谱清言",   icon: new URL("@/assets/imgs/ai/glm.png", import.meta.url).href },
  kimi:       { label: "KIMI",       icon: new URL("@/assets/imgs/ai/kimi.png", import.meta.url).href },
  qianwen:    { label: "通义千问",   icon: new URL("@/assets/imgs/ai/qianwen.png", import.meta.url).href },
  yiyan:      { label: "文心一言",   icon: new URL("@/assets/imgs/ai/yiyan.png", import.meta.url).href },
  yuanbao:    { label: "腾讯元宝",   icon: new URL("@/assets/imgs/ai/yuanbao.png", import.meta.url).href },
  nano:       { label: "纳米AI",     icon: new URL("@/assets/imgs/ai/nano.png", import.meta.url).href },
  chatgpt:    { label: "ChatGPT",    icon: "" },
  gemini:     { label: "Gemini",     icon: "" },
  perplexity: { label: "Perplexity", icon: "" },
};

/** 正在处理中的任务状态码 */
const IN_PROGRESS = [1, 2, 3, 4, 9];

/** 任务状态文案映射 */
const statusTextMap: Record<string, string> = {
  "7_completed": "完成",
  "7_failed": "失败",
  "9": "诊断报告生成中",
  "4": "分析中",
  "5": "已取消",
  "6": "失败",
};

/** 任务状态样式映射 */
const statusClassMap: Record<string, string> = {
  "7_completed": "status-success",
  "7_failed": "status-error",
  "4": "status-running",
  "9": "status-running",
  "5": "status-dim",
  "6": "status-dim",
};

/** 处理中状态描述映射 */
const processingTitleMap: Record<number, string> = {
  1: "等待处理",
  2: "排队中",
  3: "排队中",
  4: "AI问答中",
  9: "生成报告",
};

/** 获取平台图标地址 */
const getPlatformIcon = computed(() => (n: string) => platformMap[n]?.icon || "");

/** 获取平台中文名称 */
const getPlatformLabel = computed(() => (n: string) => platformMap[n]?.label || n);

/** 判断任务是否正在处理中 */
const isInProgress = computed(() => (item: any) => IN_PROGRESS.includes(item.status));

/** 判断诊断报告是否已进入可查看的终态 */
const canViewReport = computed(() => (item: any) => ["completed", "failed"].includes(item.report?.status));

/** 格式化时间为 MM-DD HH:mm */
const formatTime = computed(() => (t: string) => (t ? dayjs(t).format("MM-DD HH:mm") : "--"));

/** 格式化耗时秒数为可读文本 */
const formatDuration = computed(() => (sec: number) => {
  if (sec < 60) return `${sec}秒`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `${m}分${s}秒` : `${m}分钟`;
});

/** 获取任务状态文案 */
const getStatusText = computed(() => (item: any) => {
  if (item.status === 7) return statusTextMap[`7_${item.report?.status}`] || "完成";
  return statusTextMap[String(item.status)] || "排队中";
});

/** 获取任务状态对应的 CSS class */
const getStatusClass = computed(() => (item: any) => {
  if (item.status === 7) return statusClassMap[`7_${item.report?.status}`] || "status-success";
  return statusClassMap[String(item.status)] || "status-wait";
});

/** 获取处理中状态的描述文案 */
const getProcessingTitle = computed(() => (item: any) => processingTitleMap[item.status] || "处理中");

/** 根据提及率返回颜色等级 class */
const rateClass = computed(() => (r: number) => (r >= 80 ? "rate-high" : r >= 50 ? "rate-medium" : "rate-low"));

/** 根据提及率返回进度条颜色 class */
const rateBarClass = computed(() => (r: number) => (r >= 80 ? "bar-high" : r >= 50 ? "bar-medium" : "bar-low"));

/** 根据提及率返回趋势等级：high >=50 / medium >=10 / low <10 */
const mentionLevel = computed(() => (rate: number) => {
  if (rate >= 50) return "high";
  if (rate >= 10) return "medium";
  return "low";
});

/** 计算语境分布某项的百分比 */
const getDistPercent = computed(() => (dist: any, key: string) => {
  if (!dist) return 0;
  const t = (dist.focus || 0) + (dist.normal || 0) + (dist.brief || 0) + (dist.negative || 0) + (dist.not_mentioned || 0);
  return t ? ((dist[key] || 0) / t) * 100 : 0;
});

/** 语境类型中文映射 */
const contextTypeMap: Record<string, string> = {
  focus: "重点推荐",
  normal: "一般推荐",
  brief: "顺带提及",
  negative: "负面评价",
};

/** 获取语境类型中文名称 */
const getContextLabel = (type: string) => contextTypeMap[type] || type;

/** 从answers中筛选指定平台的回答列表，按sequence排序 */
const getPlatformAnswers = (answers: any[], platform: string) => {
  return answers.filter(a => a.platform === platform).sort((a, b) => a.sequence - b.sequence);
};

/** 判断某平台是否有联网搜索 */
const hasPlatformSearch = (answers: any[], platform: string) => {
  return answers.some(a => a.platform === platform && a.ai_has_search);
};

/** 表格行 class 回调，可查看报告的行添加可点击样式 */
const tableRowClass = ({ row }: any) => (canViewReport.value(row) ? "report-row-clickable" : "");

/** 点击查看报告详情 */
const handleViewReport = (item: any) => {
  if (!canViewReport.value(item)) return;
  router.push({ path: "/biz/diagnosis/aiDiagnosisReportDetail", query: { id: item.id } });
};

/** 查询诊断报告列表数据 */
async function queryListData(resetPage = true) {
  if (resetPage) queryParams.value.page = 1;
  loading.value = true;
  try {
    const p: any = { page: queryParams.value.page, page_size: queryParams.value.page_size };
    if (queryParams.value.name) p.name = queryParams.value.name;
    if (queryParams.value.status) p.status = queryParams.value.status;
    const { data: res } = await getDiagnoseReportList(p);
    const rows = res.result?.rows || [];
    rows.forEach((row: any) => {
      if (row.report?.handle_fail_ais?.length) {
        const seen = new Set<string>();
        const failed: { name: string; reason: string }[] = [];
        for (const item of row.report.handle_fail_ais) {
          try {
            const parsed = JSON.parse(item);
            if (parsed.name && !seen.has(parsed.name)) {
              seen.add(parsed.name);
              failed.push({ name: parsed.name, reason: parsed.reason || "分析失败" });
            }
          } catch {}
        }
        row.report.failedPlatforms = failed;
      }
    });
    dataList.value = rows;
    dataListTotal.value = res.result?.total || 0;
  } catch (e: any) {
    showToastFail(e?.err_msg || "获取失败");
    dataList.value = [];
    dataListTotal.value = 0;
  } finally {
    loading.value = false;
  }
}

onMounted(() => queryListData());
</script>

<style lang="scss" scoped>
$orange: #f97316;
$orange-bg: #fff7ed;

.report-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #fff;

  .report-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    flex-shrink: 0;

    .report-bar-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .report-bar-count {
      font-size: 12px;
      color: var(--el-color-text-placeholder);
    }
  }

  .report-main {
    flex: 1;
    overflow: hidden;
  }

  .report-pagination {
    padding: 10px 16px;
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid var(--el-border-color-lighter);
    flex-shrink: 0;
  }
}

:deep(.el-table__body-wrapper) {
  &::-webkit-scrollbar { height: 0; display: none; }
  scrollbar-width: none;
}
:deep(.el-table__body tr:hover > td.el-table__cell) {
  background-color: #fff !important;
}
:deep(.el-table__cell) {
  padding: 8px 0;
}
:deep(.el-table th.el-table__cell) {
  padding: 6px 0;
}
:deep(.el-table .el-table__expand-icon) {
  margin-right: 0;
}
:deep(.report-row-clickable) {
  cursor: pointer;
}

.cell-brand {
  display: flex;
  flex-direction: column;
  gap: 4px;
  line-height: 1.3;

  .brand-name {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    white-space: normal;
    word-break: break-all;
    line-height: 1.4;
  }

  .brand-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .brand-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    width: fit-content;
    font-size: 10px;
    font-weight: 500;
    padding: 1px 8px;
    border-radius: 10px;
    line-height: 17px;
    white-space: nowrap;

    &.status-success { color: var(--el-color-success); background: var(--el-color-success-light-9); }
    &.status-error   { color: var(--el-color-danger); background: var(--el-color-danger-light-9); }
    &.status-running { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
    &.status-dim     { color: var(--el-color-danger); background: var(--el-color-danger-light-9); }
    &.status-wait    { color: $orange; background: $orange-bg; }
  }

  .status-pulse {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
    animation: dpulse 1.4s ease-in-out infinite;
  }

  .brand-time {
    font-size: 11px;
    color: var(--el-color-text-placeholder);
    line-height: 17px;
    white-space: nowrap;
  }

  .brand-duration {
    font-size: 10px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    padding: 0 5px;
    border-radius: 3px;
    line-height: 16px;
    white-space: nowrap;
  }

  .brand-keywords {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    margin-top: 2px;

    .brand-keyword {
      font-size: 10px;
      color: var(--el-color-text-secondary);
      background: var(--el-fill-color-light);
      padding: 0 5px;
      border-radius: 3px;
      line-height: 16px;
    }
  }
}

@keyframes dpulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .2; }
}

.mention-cell {
  display: inline-flex;
  align-items: center;

  .mention-value {
    position: relative;
    display: inline-flex;
    align-items: baseline;
    font-size: 20px;
    font-weight: 700;
    line-height: 28px;

    small {
      font-size: 12px;
      font-weight: 500;
      margin-left: 1px;
    }
  }

  .mention-arrow {
    position: absolute;
    top: 0;
    left: -10px;
    font-size: 10px;
    line-height: 1;
  }

  &.mention-high {
    .mention-value { color: var(--el-color-primary); }
    .mention-arrow { color: var(--el-color-primary); }
  }

  &.mention-medium {
    .mention-value { color: var(--el-color-warning); }
    .mention-arrow { color: var(--el-color-warning); }
  }

  &.mention-low {
    .mention-value { color: var(--el-color-danger); }
    .mention-arrow { color: var(--el-color-danger); }
  }
}

.value-big {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-color-primary);
  line-height: 28px;

  small {
    font-size: 12px;
    font-weight: 500;
    margin-left: 1px;
  }
}

.value-text {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  line-height: 18px;

  .value-unit {
    font-size: 10px;
    font-weight: 400;
    color: var(--el-color-text-placeholder);
    margin-left: 1px;
    vertical-align: baseline;
  }
}

.value-empty {
  font-size: 12px;
  color: var(--el-color-text-placeholder);
  line-height: 28px;
}

.value-hint {
  font-size: 9px;
  color: var(--el-color-text-placeholder);
  line-height: 1;
}

.rank-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;

  .rank-tag {
    display: inline-block;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    line-height: 15px;

    &--gold   { color: var(--el-color-warning); background: var(--el-color-warning-light-9); }
    &--primary { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
  }
}

.other-reason {
  font-size: 11px;
  color: var(--el-color-danger);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.platform-loading {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--el-color-primary);
  padding: 2px 0;

  .platform-spin {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid var(--el-color-primary-light-9);
    border-top-color: var(--el-color-primary);
    border-radius: 50%;
    animation: spin .7s linear infinite;
    flex-shrink: 0;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.platform-list {
  display: flex;
  flex-direction: column;
  gap: 5px;

  .platform-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--el-color-text-regular);
    white-space: nowrap;
    line-height: 22px;
  }

  .platform-icon {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .platform-letter {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--el-color-primary);
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .platform-name {
    font-weight: 500;
    color: var(--el-color-text-primary);
    min-width: 56px;
    max-width: 70px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .platform-percent {
    font-weight: 700;
    font-size: 12px;
    min-width: 38px;

    &.rate-high   { color: var(--el-color-success); }
    &.rate-medium { color: var(--el-color-primary); }
    &.rate-low    { color: $orange; }
  }

  .platform-bar {
    width: 50px;
    height: 4px;
    background: var(--el-fill-color);
    border-radius: 2px;
    overflow: hidden;
    flex-shrink: 0;

    .platform-bar-fill {
      display: block;
      height: 100%;
      border-radius: 2px;

      &.bar-high   { background: var(--el-color-success); }
      &.bar-medium { background: var(--el-color-primary); }
      &.bar-low    { background: $orange; }
    }
  }

  .platform-meta {
    font-size: 10px;
    color: var(--el-color-text-placeholder);
    white-space: nowrap;

    strong {
      font-size: 11px;
      font-weight: 600;
      color: var(--el-color-text-regular);
    }
  }

  .platform-compete {
    display: flex;
    align-items: center;
    gap: 4px;
    line-height: 1;

    .platform-compete-tag {
      font-size: 10px;
      color: var(--el-color-text-regular);
      background: var(--el-fill-color-light);
      padding: 0 5px;
      border-radius: 3px;
      line-height: 16px;
    }
  }

  .platform-answers {
    display: inline-flex;
    align-items: center;
    gap: 1px;

    .answer-icon {
      font-size: 13px;
      cursor: pointer;
    }

    .answer-yes {
      color: var(--el-color-success);
    }

    .answer-no {
      color: var(--el-color-text-placeholder);
      opacity: 0.45;
    }
  }

  .platform-search-tag {
    font-size: 9px;
    font-weight: 500;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    padding: 0 4px;
    border-radius: 3px;
    line-height: 14px;
    white-space: nowrap;
  }

  .platform-row--failed {
    .platform-icon--failed {
      opacity: 0.4;
    }

    .platform-name--failed {
      opacity: 0.5;
    }

    .platform-error {
      font-size: 10px;
      color: var(--el-color-danger);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 200px;
    }
  }
}

.context-wrap {
  padding: 2px 0;

  .context-bar {
    display: flex;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    background: var(--el-fill-color);
    margin-bottom: 6px;

    .context-segment {
      display: block;
      height: 100%;
      cursor: pointer;
      transition: opacity .2s;

      &:hover { opacity: .7; }

      &--focus       { background: var(--el-color-success); }
      &--normal      { background: var(--el-color-primary); }
      &--brief       { background: var(--el-color-warning); }
      &--negative    { background: var(--el-color-danger); }
      &--unmentioned { background: var(--el-color-info); }
    }
  }

  .context-legend {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;

    .context-legend-item {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 10px;
      color: var(--el-color-text-regular);
      line-height: 16px;
      cursor: pointer;
    }

    .context-dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 2px;
      flex-shrink: 0;

      &--focus       { background: var(--el-color-success); }
      &--normal      { background: var(--el-color-primary); }
      &--brief       { background: var(--el-color-warning); }
      &--negative    { background: var(--el-color-danger); }
      &--unmentioned { background: var(--el-color-info); }
    }
  }
}

.summary-card {
  display: flex;
  gap: 8px;
  padding: 6px 0;

  .summary-badge {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: var(--el-color-primary);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    align-self: flex-start;
    margin-top: 3px;
  }

  .summary-body {
    flex: 1;
    min-width: 0;
  }

  .summary-text {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 12px;
    color: var(--el-color-text-regular);
    line-height: 1.6;
  }

  .summary-extras {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    margin-top: 4px;

    .summary-extra {
      font-size: 10px;
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      padding: 0 5px;
      border-radius: 3px;
      line-height: 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.expand-wrap {
  padding: 14px 20px 14px 52px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .expand-section {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .expand-label {
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 600;
    color: var(--el-color-text-placeholder);
    background: var(--el-fill-color-light);
    padding: 2px 8px;
    border-radius: 4px;
    line-height: 18px;
  }

  .expand-text {
    font-size: 12px;
    color: var(--el-color-text-regular);
    line-height: 1.6;
  }

  .expand-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    &--locked {
      position: relative;
      overflow: hidden;
      max-height: 26px;
      filter: blur(4px);
      user-select: none;
      cursor: default;
      mask-image: linear-gradient(to right, black 40%, transparent 100%);
      -webkit-mask-image: linear-gradient(to right, black 40%, transparent 100%);
    }

    .expand-tag {
      font-size: 11px;
      color: var(--el-color-text-regular);
      background: var(--el-fill-color-light);
      padding: 2px 8px;
      border-radius: 4px;
      line-height: 18px;

      &--primary {
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }
    }
  }

  .expand-empty {
    font-size: 12px;
    color: var(--el-color-text-placeholder);
  }
}
</style>
