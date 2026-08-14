<template>
  <div class="page-rd" v-loading="loading">
    <div class="rd" v-if="report && task">
      <div class="rd-hero">
        <div class="rd-hero-top">
          <span class="rd-back" @click="goBack">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
            返回
          </span>
          <span :class="['st-pill', `st--${task.status}`]"><i></i>{{ ST[task.status] }}</span>
          <div class="rd-hero-status">
            <div class="rd-platforms">
              <el-tooltip v-for="p in report.ai_platforms" :key="p" :content="PF[p]" placement="bottom">
                <img v-if="platformIcons[p]" :src="platformIcons[p]" class="pf-icon pf-icon--dot" />
                <span v-else :class="['pf-dot', `pf--${p}`]">{{ PF[p]?.charAt(0) }}</span>
              </el-tooltip>
            </div>
            <span v-if="consumptionAmount > 0" class="rd-hero-cost">
              <span class="rd-hero-cost-val">{{ consumptionSuanli }} 算力</span>
              <span class="rd-hero-cost-label">消耗算力</span>
            </span>
          </div>
        </div>
        <div class="rd-hero-body">
          <div class="rd-hero-info">
            <h1>{{ report.brand_name }}</h1>
            <div class="rd-hero-tags">
              <span v-for="kw in report.industry_keywords" :key="kw">{{ kw }}</span>
            </div>
            <p v-if="report.executive_summary?.overall_position" class="rd-hero-desc">{{ report.executive_summary.overall_position }}。</p>
            <div class="rd-hero-meta">
              <span v-if="task.submit_time">创建时间：{{ dayjs(task.submit_time).format('YYYY-MM-DD HH:mm:ss') }}</span>
              <span v-if="task.finish_time">完成时间：{{ dayjs(task.finish_time).format('YYYY-MM-DD HH:mm:ss') }}</span>
              <span v-if="report.ai_duration_sec">耗时：{{ formatDuration(report.ai_duration_sec) }}</span>
              <span>共 <span style="color: #4a4a4a">{{ report.total_answers }}</span> 条回答</span>
            </div>
            <div v-if="(task.status === 5 || task.status === 6) && task.exception_stage && task.exception_stage > 0"
              class="rd-hero-error">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--el-color-danger)"
                stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
              <span>异常：{{ EXCEPTION_STAGE[task.exception_stage] }}</span>
              <span v-if="task.exception_reason"> - {{ task.exception_reason }}</span>
            </div>
          </div>
          <div class="rd-hero-stats">
            <div class="stat-card stat-card--primary">
              <span class="stat-num">{{ report.brand_mention_rate }}<small>%</small></span>
              <span class="stat-label">品牌提及率</span>
              <span v-if="report.previous_comparison"
                :class="['stat-delta', report.previous_comparison.mention_rate_change > 0 ? 'up' : 'down']">
                {{ report.previous_comparison.mention_rate_change > 0 ? '↑' : '↓' }}{{
                  Math.abs(report.previous_comparison.mention_rate_change) }}%
              </span>
            </div>
            <div class="stat-card">
              <span class="stat-num">{{ report.brand_avg_position }}</span>
              <span class="stat-label">平均排位</span>
              <span v-if="report.previous_comparison"
                :class="['stat-delta', report.previous_comparison.avg_position_change < 0 ? 'up' : 'down']">
                {{ report.previous_comparison.avg_position_change < 0 ? '↑' : '↓' }}{{
                  Math.abs(report.previous_comparison.avg_position_change) }}位 </span>
            </div>
            <div class="stat-card">
              <span class="stat-num">{{ report.brand_mention_count }}<small>/{{ report.total_answers }}</small></span>
              <span class="stat-label">提及次数</span>
            </div>
            <div class="stat-card">
              <el-tooltip placement="top">
                <template #content>
                  <div>TOP1：品牌排第一位的次数</div>
                  <div>TOP3：品牌排前三位的次数</div>
                </template>
                <el-icon class="stat-card-tip" :size="15" color="var(--el-text-color-placeholder)">
                  <Warning />
                </el-icon>
              </el-tooltip>
              <span class="stat-num">{{ report.brand_first_count }}<small> · </small>{{ report.brand_top3_count
                }}</span>
              <span class="stat-label">TOP1 · TOP3 <small>(次)</small></span>
            </div>
          </div>
        </div>
      </div>

      <!-- ====== 关键发现 + 优先方向====== -->
      <div v-if="report.executive_summary" class="rd-duo">
        <div class="card">
          <div class="card-head">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--el-color-primary)"
              stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <h3>关键发现</h3>
          </div>
          <div class="finding-list">
            <div v-for="(f, i) in report.executive_summary.key_findings" :key="i" class="finding-item">
              <span class="finding-no">{{ i + 1 }}</span>
              <p>{{ f }}。</p>
            </div>
          </div>
        </div>
        <div class="card" :class="{ 'card--locked': task.diagnose_result_options === 1 }">
          <div class="card-head">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--el-color-success)"
              stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="M22 4 12 14.01l-3-3" />
            </svg>
            <h3>优化方向</h3>
          </div>
          <div class="finding-list" :class="{ 'finding-list--blur': task.diagnose_result_options === 1 }">
            <div v-for="(f, i) in report.executive_summary.priority_focus" :key="i"
              class="finding-item finding-item--green">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--el-color-success)"
                stroke-width="2.5">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
              <p>{{ f }}。</p>
            </div>
          </div>
          <div v-if="task.diagnose_result_options === 1" class="card-lock">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--el-color-warning)"
              stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span class="card-lock-title">解锁优化建议</span>
            <p class="card-lock-desc">本次诊断仅查看结果，解锁后可获取 AI 针对性的优化方案</p>
            <el-button type="primary" size="small" round>{{ optimizeSuanli }} 算力 解锁优化建议</el-button>
          </div>
        </div>
      </div>

      <!-- ====== 平台表现概览====== -->
      <div class="card">
        <h3 class="card-title">平台表现概览</h3>
        <div class="plat-overview">
          <div v-for="pc in allPlatformCards" :key="pc.platform"
            :class="['plat-card', pc.status !== 'normal' ? 'plat-card--disabled' : '']">
            <div class="plat-card-head">
              <span class="pf-badge-plain">
                <img v-if="platformIcons[pc.platform]" :src="platformIcons[pc.platform]"
                  :class="['pf-icon', pc.status !== 'normal' ? 'pf-icon--off' : '']" />
                {{ PF[pc.platform] }}
              </span>
            </div>
            <template v-if="pc.status === 'normal'">
              <div class="plat-card-body">
                <div class="plat-card-primary">
                  <span class="plat-card-num" :style="{ color: getColorByRate(parseFloat(pc.data.mention_rate)) }">{{
                    pc.data.mention_rate }}<small>%</small></span>
                  <span class="plat-card-sub">提及率</span>
                </div>
                <div class="plat-card-secondary">
                  <div class="plat-card-stat">
                    <el-icon size="11" color="var(--el-color-info)">
                      <Medal />
                    </el-icon>
                    <span class="plat-card-rank"
                      :style="{ color: getColorByPosition(parseFloat(pc.data.avg_position)) }">#{{
                        pc.data.avg_position||0 }}</span>
                    <span class="plat-card-sub">排位</span>
                  </div>
                  <div class="plat-card-stat">
                    <el-icon size="11" color="var(--el-color-info)">
                      <Guide />
                    </el-icon>
                    <span class="plat-card-rank">{{ pc.data.mentioned_count||0 }}<small><span class="mx-[2px]">/</span>{{
                      pc.data.total||0 }}</small></span>
                    <span class="plat-card-sub">提及</span>
                  </div>
                </div>
                <div class="plat-card-bar">
                  <div :style="{
                    width: parseFloat(pc.data.mention_rate) + '%',
                    background: getColorByRate(parseFloat(pc.data.mention_rate))
                  }"></div>
                </div>
              </div>
              <div class="plat-card-comps">
                <span v-for="c in pc.data.top_competitors" :key="c" class="mini-tag">{{ c }}</span>
              </div>
            </template>
            <div v-else-if="pc.status === 'failed'" class="plat-card-status">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--el-color-danger)"
                stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
              <span class="plat-card-status-text plat-card-status-text--error">诊断失败</span>
              <span v-if="pc.reason" class="plat-card-status-reason">{{ pc.reason }}</span>
            </div>
            <div v-else class="plat-card-status">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#C0C4CC" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
              </svg>
              <span class="plat-card-status-text">未选择</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ====== 语境分布 + 推荐角度 + 历史对比 ====== -->
      <div class="rd-trio">
        <div class="card card--compact">
          <h3 class="card-title">语境分布</h3>
          <div class="ctx-list">
            <div v-for="c in ctxItems" :key="c.key" class="ctx-row">
              <div class="flex w-full">
                <div class="ctx-row-left">
                  <span class="ctx-row-dot" :style="{ background: c.color }"></span>
                  <div class="ctx-row-info">
                    <span class="ctx-row-label">{{ c.label }}</span>
                    <span class="ctx-row-desc">{{ c.desc }}</span>
                  </div>
                </div>
                <div class="ctx-row-right">
                  <span class="ctx-row-val">{{ c.val }}<small>次</small></span>
                </div>
              </div>
              <div class="flex w-full items-center pl-[20px]">
                <div class="ctx-row-bar flex-1">
                  <div style="opacity: 0.8;" :style="{ width: c.pct + '%', background: c.color }"></div>
                </div>
                <span class="ctx-row-pct">{{ c.pct }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card card--compact">
          <div class="card-title-row">
            <h3 class="card-title">推荐角度表现</h3>
            <div class="angle-title-icons">
              <template v-for="(p, pi) in report.ai_platforms" :key="p">
                <img v-if="platformIcons[p]" :src="platformIcons[p]" class="angle-stack-icon"
                  :style="{ zIndex: report.ai_platforms.length - pi }" />
                <span v-else :class="['pf-micro', `pf--${p}`]">{{ PF[p]?.charAt(0) }}</span>
              </template>
            </div>
          </div>
          <div class="angle-list">
            <div v-for="(a, ai) in report.angle_summary" :key="a.angle" class="angle-item">
              <div class="angle-item-body">
                <div class="angle-item-top">
                  <div class="angle-item-left">
                    <span class="angle-item-rank">{{ ai + 1 }}</span>
                    <span class="angle-item-name">{{ a.angle }}</span>
                    <div class="angle-item-tag">回答:<span style="font-weight: 600;">{{ a.total||0 }}</span><span
                        style="opacity: 0.5;margin: 0 4px;">|</span>提及:<span style="font-weight: 600;">{{
                        a.mentioned_count||0 }}</span></div>
                  </div>
                  <span class="angle-item-val"
                    :style="{ color: (a.mention_rate||0) >= 60 ? 'var(--el-color-success)' : (a.mention_rate||0) >= 30 ? 'var(--el-color-warning)' : 'var(--el-color-danger)' }">{{
                      a.mention_rate||0 }}%</span>
                </div>
                <div class="angle-item-question">{{ a.question }}？</div>
                <div class="angle-item-bar">
                  <div :style="{ width: (a.mention_rate||0) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card card--compact">
          <template v-if="report.previous_comparison">
            <h3 class="card-title">历史对比 <small>vs {{ report.previous_comparison.prev_diagnosed_at }}</small></h3>
            <div class="hist-list">
              <div class="hist-row">
                <span class="hist-row-label">提及率</span>
                <span :class="['hist-row-val', report.previous_comparison.mention_rate_change > 0 ? 'up' : 'down']">
                  {{ report.previous_comparison.mention_rate_change > 0 ? '+' : '' }}{{
                    report.previous_comparison.mention_rate_change }}%
                </span>
                <div class="hist-row-bar">
                  <div
                    :style="{ width: Math.abs(report.previous_comparison.mention_rate_change) + '%', background: report.previous_comparison.mention_rate_change > 0 ? 'var(--el-color-success)' : 'var(--el-color-danger)' }">
                  </div>
                </div>
              </div>
              <div class="hist-row">
                <span class="hist-row-label">平均排位</span>
                <span :class="['hist-row-val', report.previous_comparison.avg_position_change < 0 ? 'up' : 'down']">
                  {{ report.previous_comparison.avg_position_change < 0 ? '↑' : '↓' }}{{
                    Math.abs(report.previous_comparison.avg_position_change) }}位 </span>
              </div>
              <div class="hist-row">
                <span class="hist-row-label">提及次数</span>
                <span :class="['hist-row-val', report.previous_comparison.mention_count_change > 0 ? 'up' : 'down']">
                  {{ report.previous_comparison.mention_count_change > 0 ? '+' : '' }}{{
                    report.previous_comparison.mention_count_change }}次
                </span>
              </div>
            </div>
            <div v-if="report.previous_comparison.new_competitors?.length" class="hist-tags">
              <span class="hist-tags-title">新增竞品</span>
              <span v-for="c in report.previous_comparison.new_competitors" :key="c" class="mini-tag mini-tag--red">{{ c
                }}</span>
            </div>
            <div v-if="report.previous_comparison.disappeared_competitors?.length" class="hist-tags">
              <span class="hist-tags-title">消失竞品</span>
              <span v-for="c in report.previous_comparison.disappeared_competitors" :key="c" class="mini-tag">{{ c
                }}</span>
            </div>
          </template>
          <template v-else>
            <h3 class="card-title">历史对比</h3>
            <div class="empty-hint">
              <el-icon size="28" color="var(--el-text-color-placeholder)"><DataLine /></el-icon>
              <span>暂无历史对比数据</span>
              <p>完成第二次诊断后即可查看对比趋势</p>
            </div>
          </template>
        </div>
      </div>

      <!-- ====== 竞品分析 ====== -->
      <div class="card">
        <h3 class="card-title">竞品分析 <small>{{ report.competitors?.length || 0 }} 个品牌</small></h3>
        <div class="comp-grid">
          <div v-for="(comp, idx) in report.competitors" :key="comp.brand" class="comp-item">
            <div class="comp-item-head">
              <div class="comp-item-head-left">
                <span class="comp-rank" :class="{ 'comp-rank--top': idx < 3 }">{{ idx + 1 }}</span>
                <strong>{{ comp.brand }}</strong>
              </div>
              <span class="comp-rate-pill" :style="{ color: getCompRateColor(parseFloat(comp.mention_rate||0)) }"><small>提及率</small>{{ comp.mention_rate }}%</span>
            </div>
            <div class="comp-item-bar">
              <div :style="{ width: comp.mention_rate + '%', background: getCompRateColor(parseFloat(comp.mention_rate||0)) }"></div>
            </div>
            <div class="comp-item-stats">
              <span>提及 {{ comp.mentioned_count||0 }} 次</span>
              <span class="comp-position" :style="{ color: getColorByPosition(parseFloat(comp.avg_position||0)) }">排位
                #{{ comp.avg_position||0 }}
                <el-icon size="12">
                  <Top v-if="(comp.avg_position||0) <= 3" />
                  <Bottom v-else />
                </el-icon>
              </span>
            </div>
            <div v-if="comp.ai_positioning" class="comp-item-pos">{{ comp.ai_positioning }}</div>
            <div class="comp-item-platforms">
              <template v-for="p in comp.mentioned_platforms" :key="p">
                <img v-if="platformIcons[p]" :src="platformIcons[p]" class="pf-icon pf-icon--micro" />
                <span v-else :class="['pf-micro', `pf--${p}`]">{{ PF[p]?.charAt(0) }}</span>
              </template>
            </div>
            <div v-if="comp.mentioned_angles?.length" class="comp-item-tags">
              <span class="comp-tag-label">角度</span>
              <div class="comp-tag-list">
                <span v-for="a in comp.mentioned_angles" :key="a" class="comp-tag">{{ a }}</span>
              </div>
            </div>
            <div v-if="comp.strong_angles?.length" class="comp-item-tags">
              <span class="comp-tag-label comp-tag-label--success">强项</span>
              <div class="comp-tag-list">
                <span v-for="a in comp.strong_angles" :key="a" class="comp-tag comp-tag--success">{{ a }}</span>
              </div>
            </div>
            <div v-if="comp.weak_angles?.length" class="comp-item-tags">
              <span class="comp-tag-label comp-tag-label--danger">弱项</span>
              <div class="comp-tag-list">
                <span v-for="a in comp.weak_angles" :key="a" class="comp-tag comp-tag--danger">{{ a }}</span>
              </div>
            </div>
            <div v-if="comp.recommend_reasons?.length" class="comp-item-reasons">
              <div v-for="(r, ri) in comp.recommend_reasons" :key="ri" class="comp-reason">{{ r }}</div>
            </div>
            <div v-if="comp.advantage_over_target" class="comp-item-adv">
              <el-icon size="10" color="var(--el-color-warning)" style="margin-top: 2px;"><Warning /></el-icon>
              {{ comp.advantage_over_target }}
            </div>
          </div>
        </div>
      </div>

      <!-- ====== 深度洞察 ====== -->
      <div class="rd-duo">
        <!-- 平台洞察 -->
        <div class="card">
          <h3 class="card-title">平台差异解读</h3>
          <template v-if="report.platform_insights?.length">
            <div class="ins-list">
              <div v-for="ins in report.platform_insights" :key="ins.platform" class="ins-item">
                <div class="ins-item-head">
                  <span :class="['pf-badge pf-badge--sm', `pf--${ins.platform}`]">
                    <img v-if="platformIcons[ins.platform]" :src="platformIcons[ins.platform]" class="pf-icon" />
                    {{ PF[ins.platform] }}
                  </span>
                  <span :class="ins.brand_mentioned ? 'pill-yes' : 'pill-no'">{{ ins.brand_mentioned ? '已提及' : '未提及'
                  }}</span>
                </div>
                <p class="ins-reason">{{ ins.possible_reason }}</p>
                <div class="ins-metas">
                  <span class="mini-tag">{{ ins.brand_diversity }}</span>
                  <span class="mini-tag">{{ ins.response_style }}</span>
                </div>
              </div>
            </div>
          </template>
          <div v-else class="empty-hint">
            <el-icon size="28" color="var(--el-text-color-placeholder)"><Document /></el-icon>
            <span>暂无平台差异解读数据</span>
          </div>
        </div>

        <!-- 品牌差距 -->
        <div class="card">
          <h3 class="card-title">品牌差距分析</h3>
          <div v-if="report.brand_gap_analysis" class="gap-list">
            <div class="gap-item">
              <div class="gap-head" style="color:var(--el-color-warning)">
                <el-icon size="14"><Notification /></el-icon>
                内容缺失
              </div>
              <ul v-if="report.brand_gap_analysis.content_gap?.length">
                <li v-for="(g, i) in report.brand_gap_analysis.content_gap" :key="i">{{ g }}</li>
              </ul>
              <span v-else style="color:var(--el-text-color-placeholder);font-size:12px;">暂无内容缺失分析数据</span>
            </div>
            <div class="gap-item">
              <div class="gap-head" style="color:var(--el-color-danger)">
                <el-icon size="14"><Guide /></el-icon>
                场景缺席
              </div>
              <ul>
                <li v-for="(g, i) in report.brand_gap_analysis.context_gap" :key="i">{{ g }}</li>
              </ul>
            </div>
            <div class="gap-item">
              <div class="gap-head" style="color:var(--el-color-primary)"><el-icon size="14"><Crop /></el-icon> 定位差距</div>
              <p>{{ report.brand_gap_analysis.positioning_gap }}</p>
            </div>
            <div v-if="report.brand_gap_analysis.root_cause_if_not_mentioned" class="gap-item gap-item--alert">
              <div class="gap-head" style="color:var(--el-color-danger)"><el-icon size="14"><Money /></el-icon>根因分析</div>
              <p>{{ report.brand_gap_analysis.root_cause_if_not_mentioned }}</p>
            </div>
          </div>
          <div v-else class="empty-hint">
            <el-icon size="28" color="var(--el-text-color-placeholder)"><Document /></el-icon>
            <span>暂无品牌差距分析数据</span>
          </div>
        </div>
      </div>

      <!-- ====== 回答明细 ====== -->
      <div class="card">
        <div class="card-toolbar">
          <h3 class="card-title">回答明细 <small>{{ filteredAnswers.length }} 条</small></h3>
          <div class="filters">
            <el-select v-model="fAngle" placeholder="角度" clearable size="small" style="width:110px"><el-option
                v-for="a in angleOpts" :key="a" :label="a" :value="a" /></el-select>
            <el-select v-model="fMentioned" placeholder="提及" clearable size="small" style="width:90px"><el-option
                label="已提及" :value="true" /><el-option label="未提及" :value="false" /></el-select>
          </div>
        </div>
        <div class="pf-tabs">
          <span class="pf-tab" :class="{ 'pf-tab--active': !fPlatform }" @click="fPlatform = ''">全部</span>
          <span v-for="p in report.ai_platforms" :key="p" class="pf-tab" :class="{ 'pf-tab--active': fPlatform === p }"
            @click="fPlatform = fPlatform === p ? '' : p">
            <img v-if="platformIcons[p]" :src="platformIcons[p]" class="pf-icon pf-icon--dot" />
            <span v-else :class="['pf-micro', `pf--${p}`]">{{ PF[p]?.charAt(0) }}</span>
            {{ PF[p] }}
          </span>
        </div>
        <div class="ans-list">
          <div v-for="(a, i) in filteredAnswers" :key="i" :class="['ans', a.mentioned ? `ans--${a.mention_context_type || 'normal'}` : 'ans--no']">
            <div class="ans-bar">
              <span :class="['pf-badge pf-badge--sm', `pf--${a.platform}`]">
                <img v-if="platformIcons[a.platform]" :src="platformIcons[a.platform]" class="pf-icon" style="background-color: #fff;border-radius: 50px;padding: 1px;" />
                {{ PF[a.platform] }}
              </span>
              <span class="mini-tag">{{ a.angle }}</span>
              <span v-if="a.ai_has_search" class="mini-tag mini-tag--blue">联网</span>
              <span class="mini-tag">#{{ a.sequence }}</span>
              <div style="flex:1"></div>
              <span v-if="a.mentioned" :class="['ctx-pill', `ctx-pill--${a.mention_context_type}`]">{{
                CTX[a.mention_context_type]
              }}</span>
              <span v-else class="ctx-pill">未提及</span>
              <span v-if="a.mention_position" class="ans-rank">排位 #{{ a.mention_position }}</span>
            </div>
            <p class="ans-q">{{ a.question }}？</p>
            <p v-if="a.user_scenario" class="ans-scene">提问场景描述：{{ a.user_scenario }}</p>
            <div v-if="a.mentioned && a.mention_context_quote" class="ans-quote">
              <blockquote>所提原文片段：{{ a.mention_context_quote }}。</blockquote>
            </div>
            <div v-if="a.mention_description" class="ans-quote" style="background-color: var(--el-color-success-light-9);">
              <p style="color: var(--el-color-success);font-weight: bold;">概括总结：{{ a.mention_description }}</p>
            </div>
            <div v-if="a.mentioned_brands?.length" class="ans-brands">
              <span class="ans-brands-title">提及品牌：</span>
              <span v-for="b in a.mentioned_brands" :key="b"
                :class="['mini-tag', b === report.brand_name ? 'mini-tag--blue' : '']">{{ b }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ====== 生成问题 ====== -->
      <div class="card">
        <h3 class="card-title">生成的诊断问题</h3>
        <div class="q-grid">
          <div v-for="(q, i) in report.generated_questions" :key="i" class="q-item">
            <span class="q-no">Q{{ i + 1 }}</span>
            <div>
              <span class="mini-tag">{{ q.angle }}</span>
              <p class="q-text">{{ q.question }}？</p>
              <p v-if="q.user_scenario" class="q-scene">{{ q.user_scenario }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="rd-empty" v-if="!loading && (!report || !task)">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--el-text-color-placeholder)"
        stroke-width="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
      <p>报告数据加载失败，请稍后重试</p>
      <el-button type="primary" size="small" @click="$router.back()">返回上一页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts" name="aiDiagnosisReportDetail">
import { ref, computed, onMounted } from "vue";
import { getDiagnoseReportDetail, queryPricingInfo } from "@/api/biz/diagnosis";
import iconDoubao from "@/assets/imgs/ai/doubao.png";
import iconKimi from "@/assets/imgs/ai/kimi.png";
import iconDeepseek from "@/assets/imgs/ai/deepseek.png";
import iconYiyan from "@/assets/imgs/ai/yiyan.png";
import iconYuanbao from "@/assets/imgs/ai/yuanbao.png";
import iconQianwen from "@/assets/imgs/ai/qianwen.png";
import iconGlm from "@/assets/imgs/ai/glm.png";
import iconNano from "@/assets/imgs/ai/nano.png";
import { goBack } from "@/utils/route";
import dayjs from "dayjs";

const route = useRoute();

/** AI平台图标映射 */
const platformIcons: Record<string, string> = {
  doubao: iconDoubao,
  kimi: iconKimi,
  deepseek: iconDeepseek,
  yiyan: iconYiyan,
  yuanbao: iconYuanbao,
  qianwen: iconQianwen,
  glm: iconGlm,
  nano: iconNano,
};

/** AI平台中文名称映射 */
const PF: Record<string, string> = { doubao: "豆包", kimi: "Kimi", deepseek: "DeepSeek", yiyan: "文心一言", yuanbao: "腾讯元宝", qianwen: "通义千问", glm: "智谱清言", nano: "纳米AI" };
/** 诊断任务状态映射（status: 1已提交 2服务端排队 3客户端排队 4处理中 5已取消 6服务异常 7处理完成 9生成报告中） */
const ST: Record<number, string> = { 1: "已提交", 2: "服务端排队中", 3: "客户端排队中", 4: "处理中", 5: "已取消", 6: "服务异常", 7: "处理完成", 9: "生成诊断报告中" };
/** 异常阶段映射 */
const EXCEPTION_STAGE: Record<number, string> = {
  0: "无异常", 1: "生成提示词阶段失败", 2: "读取缓存AI回答失败", 3: "获取分析结果模板失败",
  4: "生成诊断报告失败", 5: "部分AI平台分析失败", 6: "获取深度分析模板失败",
  7: "格式化深度分析提示词失败", 8: "深度分析调用大模型失败", 9: "解析深度分析结果失败"
};
/** 语境类型映射 */
const CTX: Record<string, string> = { focus: "重点推荐", normal: "一般推荐", brief: "顺带提及", negative: "负面评价" };
/** 语境类型颜色映射 */
const CC: Record<string, string> = { focus: "var(--el-color-success)", normal: "var(--el-color-primary)", brief: "var(--el-color-warning)", negative: "var(--el-color-danger)", not_mentioned: "#C0C4CC" };

/** 页面加载状态 */
const loading = ref(false);
/** 诊断报告数据 */
const report = ref<any>(null);
/** 诊断任务数据 */
const task = ref<any>(null);
/** 回答筛选-平台 */
const fPlatform = ref("");
/** 回答筛选-角度 */
const fAngle = ref("");
/** 回答筛选-是否提及 */
const fMentioned = ref<boolean | string>("");
const optimizePrice = ref("0.00");

/** 语境分布数据（带百分比和颜色） */
const ctxItems = computed(() => {
  if (!report.value) return [];
  const d = report.value.context_distribution || {};
  const t = report.value.total_answers || 1;
  return [
    { key: "focus", label: "重点推荐", desc: "AI将品牌放在首位或单独推荐", val: d.focus || 0, pct: Math.round(((d.focus || 0) / t) * 100), color: CC.focus },
    { key: "normal", label: "一般推荐", desc: "品牌在推荐列表中被提到", val: d.normal || 0, pct: Math.round(((d.normal || 0) / t) * 100), color: CC.normal },
    { key: "brief", label: "顺带提及", desc: "品牌在列举时被提到", val: d.brief || 0, pct: Math.round(((d.brief || 0) / t) * 100), color: CC.brief },
    { key: "negative", label: "负面评价", desc: "AI对品牌有批评或负面描述", val: d.negative || 0, pct: Math.round(((d.negative || 0) / t) * 100), color: CC.negative },
    { key: "not_mentioned", label: "未提及", desc: "回答中未出现该品牌", val: d.not_mentioned || 0, pct: Math.round(((d.not_mentioned || 0) / t) * 100), color: CC.not_mentioned },
  ];
});

/** 回答角度去重选项 */
const angleOpts = computed(() => {
  if (!report.value) return [];
  return [...new Set(report.value.answers.map((a: any) => a.angle))];
});

/** 按平台/角度/提及状态筛选后的回答列表 */
const filteredAnswers = computed(() => {
  if (!report.value) return [];
  return report.value.answers.filter((a: any) => {
    if (fPlatform.value && a.platform !== fPlatform.value) return false;
    if (fAngle.value && a.angle !== fAngle.value) return false;
    if (fMentioned.value !== "" && a.mentioned !== fMentioned.value) return false;
    return true;
  }).sort((a: any, b: any) => (a.mention_position || 999) - (b.mention_position || 999));
});

/** 获取指标颜色（提及率）：达标返回深蓝黑，否则返回danger色 */
const getColorByRate = computed(() => (rate: number) => (rate >= 60 ? "var(--el-color-success)" : "var(--el-color-danger)"));

/** 获取竞品提及率颜色：≥50% success，25%-50% 橙色，<25% danger */
const getCompRateColor = computed(() => (rate: number) => (rate >= 50 ? "var(--el-color-success)" : rate >= 25 ? "#F5A623" : "var(--el-color-danger)"));

/** 获取指标颜色（排位）：达标返回success色，否则返回danger色 */
const getColorByPosition = computed(() => (pos: number) => (pos > 0 ? "var(--el-text-color-primary)" : "var(--el-color-danger)"));

/** 将秒数格式化为 X时X分X秒 */
const formatDuration = computed(() => (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}时`);
  if (m > 0 || h > 0) parts.push(`${m}分`);
  parts.push(`${s}秒`);
  return parts.join("");
});

/** 实际消耗金额（diagnose_result_options=2时为task_price+suggest_report_price） */
const consumptionAmount = computed(() => {
  if (!task.value) return 0;
  return task.value.consumption_amount || 0;
});

/** 消耗算力 */
const consumptionSuanli = computed(() => consumptionAmount.value || 0);

/** 优化建议消耗算力 */
const optimizeSuanli = computed(() => Number(optimizePrice.value) || 0);

/** 所有8个平台的表现概览（含正常/失败/未选择三种状态） */
const allPlatformCards = computed(() => {
  if (!report.value) return [];
  const allKeys = Object.keys(PF);
  const summaryMap: Record<string, any> = {};
  (report.value.platform_summary || []).forEach((ps: any) => {
    summaryMap[ps.platform] = ps;
  });
  const failMap: Record<string, string> = {};
  (report.value.handle_fail_ais || []).forEach((item: any) => {
    try {
      const parsed = typeof item === "string" ? JSON.parse(item) : item;
      if (parsed.name) failMap[parsed.name] = parsed.reason || "";
    } catch { /* ignore */ }
  });
  const selectedSet = new Set(report.value.ai_platforms || []);
  return allKeys.map((key) => {
    if (summaryMap[key]) {
      return { platform: key, status: "normal", data: summaryMap[key] };
    }
    if (failMap[key]) {
      return { platform: key, status: "failed", data: null, reason: failMap[key] };
    }
    return { platform: key, status: "unselected", data: null };
  });
});

/** 加载诊断报告详情数据 */
async function loadReportDetail() {
  const id = route.query.id as string;
  if (!id) return;
  loading.value = true;
  try {
    const { data: response } = await getDiagnoseReportDetail(id);
    console.log(response.result);
    report.value = response.result.report;
    task.value = response.result.task;
  } finally {
    loading.value = false;
  }
}
/** 加载定价信息 */
async function loadPricing() {
  try {
    const { data: response } = await queryPricingInfo();
    optimizePrice.value = response.result?.ai_diagnose_task_optimize_price ?? "0.00";
  } catch {
  }
}

onMounted(() => {
  loadReportDetail();
  loadPricing();
});
</script>

<style lang="scss" scoped>
.page-rd {
  height: 100%;
  overflow-y: auto;
}

.rd {
  padding: 16px 20px 48px;
  background: #f5f7fa;
  overflow-y: auto;
}

.rd-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;

  p {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

.pf-icon {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  object-fit: contain;
  vertical-align: middle;
  display: inline-block;

  &--dot {
    width: 20px;
    height: 20px;
    border-radius: 50px;
  }

  &--micro {
    width: 15px;
    height: 15px;
    border-radius: 3px;
  }

  &--off {
    opacity: 0.35;
    filter: grayscale(1);
  }
}

.rd-hero {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

  .rd-hero-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    align-items: center;
    gap: 12px;
  }

  .rd-hero-status {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-left: auto;
  }

  .rd-hero-body {
    display: flex;
    gap: 32px;
    align-items: flex-start;
  }

  .rd-hero-info {
    flex: 1;
    min-width: 0;

    h1 {
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 6px;
      color: var(--el-text-color-primary);
    }
  }

  .rd-hero-tags {
    display: flex;
    gap: 4px;
    margin-bottom: 10px;

    span {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }
  }

  .rd-hero-desc {
    font-size: 13px;
    line-height: 1.7;
    color: var(--el-text-color-regular);
    margin: 0 0 10px;
  }

  .rd-hero-meta {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .rd-hero-error {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-color-danger);
  }

  .rd-hero-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    flex-shrink: 0;
    width: 320px;
  }
}

.rd-hero-cost {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.rd-hero-cost-val {
  font-size: 16px;
  font-weight: 700;
  color: var(--el-color-danger);
  line-height: 1;
}

.rd-hero-cost-label {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  line-height: 1;
  margin-top: 4px;
}

.rd-back {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 13px;
  color: var(--el-text-color-secondary);

  &:hover {
    color: var(--el-color-primary);
  }
}

.rd-platforms {
  display: flex;
  gap: 10px;
  align-items: center;
}

.pf-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
}

.pf--qianwen {
  background-color: #615bec;
}

.pf--yiyan {
  background-color: #1A73E8;
}

.pf--glm {
  background-color: #3962ff;
}

.pf--doubao {
  background-color: #3370FF;
}

.pf--kimi {
  background-color: #1a1a1a;
}

.pf--deepseek {
  background-color: #4D6BFE;
}

.pf--yuanbao {
  background-color: #07c161;
}

.pf--nano {
  background-color: #d3141e;
}

.st-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;

  i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: block;
  }

  &.st--7 {
    background: var(--el-color-success-light-9);
    color: var(--el-color-success);

    i {
      background: var(--el-color-success);
    }
  }

  &.st--4,
  &.st--9 {
    background: #fdf6ec;
    color: #E6A23C;

    i {
      background: #E6A23C;
      animation: blink 1.5s infinite;
    }
  }

  &.st--1,
  &.st--2,
  &.st--3 {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);

    i {
      background: var(--el-color-primary);
    }
  }

  &.st--5,
  &.st--6 {
    background: #fef0f0;
    color: #F56C6C;

    i {
      background: #F56C6C;
    }
  }
}

@keyframes blink {

  0%,
  100% {
    opacity: 1
  }

  50% {
    opacity: .3
  }
}

@keyframes barGrow {
  from {
    transform: scaleX(0);
  }

  to {
    transform: scaleX(1);
  }
}

.stat-card {
  background: #f7f9fc;
  border-radius: 10px;
  padding: 14px 16px;
  text-align: center;
  position: relative;

  &--primary {
    background: var(--el-color-primary);

    .stat-num,
    .stat-num small {
      color: #fff;
    }

    .stat-label {
      color: rgba(255, 255, 255, .75);
    }

    .stat-delta {
      color: rgba(255, 255, 255, .85);
    }
  }
}

.stat-num {
  font-size: 26px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  display: block;
  line-height: 1.1;

  small {
    font-size: 14px;
    font-weight: 400;
    color: var(--el-text-color-secondary);
  }
}

.stat-card-tip {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}

.stat-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  display: block;
  margin-top: 2px;
}

.stat-delta {
  font-size: 11px;
  font-weight: 600;
  display: block;
  margin-top: 2px;

  &.up {
    color: var(--el-color-success);
  }

  &.down {
    color: var(--el-color-danger);
  }
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  position: relative;
}

.card--locked {
  overflow: hidden;
}

.finding-list--blur {
  min-height: 160px;
  filter: blur(4px);
  user-select: none;
  pointer-events: none;
  mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
}

.card-lock {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 20px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, #fff 30%);
}

.card-lock-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.card-lock-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin: 0;
  text-align: center;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 14px;

  small {
    font-weight: 400;
    color: var(--el-text-color-secondary);
    margin-left: 6px;
    font-size: 12px;
  }
}

.card-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;

  h3 {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
  }
}

.card-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.pf-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.pf-tab {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  background: #f0f2f5;
  color: var(--el-text-color-regular);
  transition: all .15s;

  &:hover {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }

  &--active {
    background: var(--el-color-primary);
    color: #fff;

    &:hover {
      background: var(--el-color-primary);
      color: #fff;
    }
  }
}

.rd-duo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;

  .card {
    margin-bottom: 0;
    display: flex;
    flex-direction: column;
  }
}

.mini-tag {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  background: #f0f2f5;
  color: var(--el-text-color-regular);
  line-height: 1.5;

  &--blue {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }

  &--red {
    background: #fef0f0;
    color: #F56C6C;
  }

  &--green {
    background: #f0f9eb;
    color: #67C23A;
  }
}

.pf-badge-plain {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);

  .pf-icon {
    width: 18px;
    height: 18px;
  }
}

.pf-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;

  &--sm {
    padding: 3px 4px;
    font-size: 11px;
    padding-right: 8px;
  }
}

.pf-micro {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  font-size: 9px;
  font-weight: 700;
  color: #fff;

  &--off {
    background: #dcdfe6 !important;
    color: #999;
  }
}

.finding-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.finding-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-regular);

  p {
    margin: 0;
  }

  &--green svg {
    flex-shrink: 0;
    margin-top: 3px;
  }
}

.finding-no {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}

.plat-overview {
  display: flex;
  gap: 8px;
}

.plat-card {
  flex: 0 0 calc((100% - 56px) / 8);
  display: flex;
  flex-direction: column;
  border: 1px solid #eef1f6;
  border-radius: 10px;
  padding: 14px 12px;
  text-align: center;
  transition: box-shadow .2s;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  }

  .plat-card-head {
    margin-bottom: 10px;
  }

  .plat-card-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 10px;
  }

  .plat-card-primary {
    text-align: center;

    .plat-card-num {
      font-size: 22px;
      font-weight: 700;
      display: block;
    }

    .plat-card-sub {
      display: block;
      margin-top: 2px;
    }
  }

  .plat-card-secondary {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px 0;
    border-top: 1px solid #f0f2f5;
    border-bottom: 1px solid #f0f2f5;
  }

  .plat-card-stat {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .plat-card-num {
    font-size: 16px;
    font-weight: 700;

    small {
      font-size: 11px;
      font-weight: 400;
    }
  }

  .plat-card-rank {
    font-size: 11px;
    font-weight: 700;
    display: flex;

    small {
      font-size: 11px;
      font-weight: 400;
      color: var(--el-text-color-secondary);
    }
  }

  .plat-card-sub {
    font-size: 10px;
    color: var(--el-text-color-secondary);
  }

  .plat-card-bar {
    height: 4px;
    background: #f0f2f5;
    border-radius: 2px;
    overflow: hidden;

    div {
      height: 100%;
      border-radius: 2px;
      transform-origin: left;
      animation: barGrow .6s ease-out;
    }
  }

  .plat-card-comps {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    justify-content: center;
  }

  &--disabled {
    background: #fafbfc;
    opacity: .7;
  }

  .plat-card-status {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .plat-card-status-text {
    font-size: 11px;
    color: #C0C4CC;
    font-weight: 500;

    &--error {
      color: var(--el-color-danger);
    }
  }

  .plat-card-status-reason {
    font-size: 10px;
    color: var(--el-text-color-secondary);
    line-height: 1.4;
    word-break: break-all;
  }
}

.card--compact {
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.rd-trio {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;

  .card {
    margin-bottom: 0;
  }
}

.ctx-list {
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.ctx-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  flex-direction: column;
  gap: 4px;
}

.ctx-row-left {
  display: flex;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.ctx-row-dot {
  width: 11px;
  height: 11px;
  border-radius: 3px;
  flex-shrink: 0;
  margin-top: 1px;
}

.ctx-row-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.ctx-row-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1;
}

.ctx-row-desc {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 4px;
}

.ctx-row-right {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}

.ctx-row-val {
  font-size: 15px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1;

  small {
    font-size: 11px;
    font-weight: 400;
    color: var(--el-text-color-secondary);
    margin-left: 2px;
    line-height: 1;
  }
}

.ctx-row-pct {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  text-align: right;
  margin-left: 5px;
  line-height: 1;
}

.ctx-row-bar {
  height: 4px;
  background: #f0f2f5;
  border-radius: 2px;
  overflow: hidden;

  div {
    height: 100%;
    border-radius: 2px;
    transform-origin: left;
    animation: barGrow .6s ease-out;
  }
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-title-row .card-title {
  margin: 0;
}

.angle-title-icons {
  display: flex;
  align-items: center;
  padding-right: 4px;
}

.angle-stack-icon {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  object-fit: contain;
  border: 2px solid #fff;
  margin-left: -5px;
  position: relative;
  background-color: #fff;

  &:first-child {
    margin-left: 0;
  }
}

.angle-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.angle-item {
  border-radius: 8px;
  background: #fafbfc;
  padding: 8px 10px;
}

.angle-item-body {
  min-width: 0;
}

.angle-item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
}

.angle-item-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.angle-item-rank {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.angle-item-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.angle-item-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.angle-item-val {
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.angle-item-question {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.angle-item-bar {
  height: 3px;
  background: #f0f2f5;
  border-radius: 7px;
  overflow: hidden;

  div {
    height: 100%;
    border-radius: 2px;
    background: var(--el-color-success);
    transform-origin: left;
    animation: barGrow .6s ease-out;
    opacity: 0.9;
  }
}

.hist-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hist-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.hist-row-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  flex: 1;
}

.hist-row-val {
  font-size: 18px;
  font-weight: 700;

  &.up {
    color: var(--el-color-success);
  }

  &.down {
    color: var(--el-color-danger);
  }
}

.hist-row-bar {
  flex: 0 0 100%;
  height: 4px;
  background: #f0f2f5;
  border-radius: 2px;
  overflow: hidden;

  div {
    height: 100%;
    border-radius: 2px;
    transform-origin: left;
    animation: barGrow .6s ease-out;
  }
}

.hist-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
}

.hist-tags-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  flex: 0 0 100%;
}

.empty-hint {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  gap: 8px;
  min-height: 120px;

  span {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }

  p {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
    margin: 0;
  }
}

.comp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.comp-item {
  border: 1px solid #eef1f6;
  border-radius: 10px;
  padding: 14px;
  transition: box-shadow .2s;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  }

  .comp-item-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    .comp-item-head-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    strong {
      font-size: 14px;
    }
  }

  .comp-item-bar {
    height: 4px;
    background: #f0f2f5;
    border-radius: 2px;
    overflow: hidden;

    div {
      height: 100%;
      border-radius: 2px;
      background: var(--el-color-primary);
      transform-origin: left;
      animation: barGrow .6s ease-out;
    }
  }

  .comp-item-stats {
    display: flex;
    gap: 12px;
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  .comp-position {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-weight: 600;
  }

  .comp-item-pos {
    font-size: 11px;
    color: var(--el-color-primary);
    padding: 4px 8px;
    background: var(--el-color-primary-light-9);
    border-radius: 4px;
  }

  .comp-item-platforms {
    display: flex;
    gap: 5px;
    align-items: center;
  }

  .comp-item-tags {
    display: flex;
    gap: 6px;
    align-items: flex-start;
  }

  .comp-tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .comp-item-reasons {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 11px;
    color: var(--el-text-color-regular);
    padding: 6px 8px;
    background: #f8f9fb;
    border-radius: 6px;
  }

  .comp-item-adv {
    font-size: 10px;
    color: var(--el-color-warning);
    display: flex;
    align-items: flex-start;
    gap: 4px;
    line-height: 1.5;
    font-weight: 500;
  }
}

.comp-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 700;
  background: #f0f2f5;
  color: var(--el-text-color-secondary);

  &--top {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}

.comp-rate-pill {
  position: relative;
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  font-size: 13px;
  font-weight: 700;

  small {
    font-size: 9px;
    font-weight: 400;
    color: var(--el-text-color-secondary);
    align-self: flex-end;
    margin-bottom: 1px;
  }
}

.comp-tag-label {
  font-size: 10px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;

  &--success {
    color: var(--el-color-success);
  }

  &--danger {
    color: var(--el-color-danger);
  }
}

.comp-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  background: #f0f2f5;
  color: var(--el-text-color-regular);

  &--success {
    background: var(--el-color-success-light-9);
    color: var(--el-color-success);
  }

  &--danger {
    background: var(--el-color-danger-light-9);
    color: var(--el-color-danger);
  }
}

.comp-reason {
  line-height: 1.5;

  &::before {
    content: "•";
    margin-right: 4px;
    color: var(--el-text-color-secondary);
  }
}

.ins-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ins-item {
  padding: 10px 12px;
  border: 1px solid #eef1f6;
  border-radius: 8px;

  .ins-item-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }
}

.ins-reason {
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
  margin: 0 0 6px;
}

.ins-metas {
  display: flex;
  gap: 4px;
}

.pill-yes {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  background: #f0f9eb;
  color: #67C23A;
}

.pill-no {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  background: #fef0f0;
  color: #F56C6C;
}

.gap-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gap-item {
  padding: 10px 12px;
  border: 1px solid #eef1f6;
  border-radius: 8px;

  ul {
    margin: 0;
    padding-left: 16px;

    li {
      font-size: 12px;
      line-height: 1.6;
      color: var(--el-text-color-regular);
      margin-bottom: 2px;
    }
  }

  p {
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
    margin: 0;
  }

  &--alert {
    border-color: #fde2e2;
    background: #fef8f8;
  }
}

.gap-head {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 6px;
}

.up {
  color: var(--el-color-success);
}

.down {
  color: var(--el-color-danger);
}

.filters {
  display: flex;
  gap: 6px;
}

.ans-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #f7f9fc;
  border-radius: 10px;
}

.ans {
  padding: 14px 16px;
  border-radius: 10px;
  transition: box-shadow .15s;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

  &--focus {
    .ans-q {
      color: var(--el-color-success) !important;
    }
  }

  &--normal {
    .ans-q {
      color: var(--el-color-primary) !important;
    }
  }

  &--brief {
    .ans-q {
      color: #D4910A !important;
    }
  }

  &--negative {
    .ans-q {
      color: var(--el-color-danger) !important;
    }
  }

  &--no {
    .ans-q {
      color: var(--el-text-color-secondary) !important;
    }
  }

  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  }

  .ans-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
  }

  .ans-q {
    font-size: 15px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin: 0 0 3px;
  }

  .ans-scene {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin: 0 0 6px;
    margin-bottom: 10px;
  }

  .ans-rank {
    font-size: 12px;
    font-weight: 700;
    color: var(--el-color-primary);
  }

  .ans-quote {
    padding: 10px 14px;
    background: #f7f9fc;
    border-radius: 8px;
    margin: 8px 0;

    blockquote {
      font-size: 13px;
      font-style: italic;
      line-height: 1.6;
      color: var(--el-text-color-primary);
      margin: 0 0 4px;
    }

    p {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin: 0;
    }
  }

  .ans-brands {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 6px;

    .ans-brands-title{
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}

.ctx-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  background: #f0f2f5;
  color: var(--el-text-color-secondary);

  &--focus {
    background: var(--el-color-success-light-9);
    color: var(--el-color-success);
  }

  &--normal {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }

  &--brief {
    background: #FDF6EC;
    color: #D4910A;
  }

  &--negative {
    background: var(--el-color-danger-light-9);
    color: var(--el-color-danger);
  }
}

.q-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 10px;
}

.q-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 1px solid #eef1f6;
  border-radius: 8px;
  transition: box-shadow .15s;

  &:hover {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  }
}

.q-no {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: var(--el-color-primary);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.q-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--el-text-color-primary);
  margin: 4px 0 0;
  font-weight: 500;
}

.q-scene {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  margin: 2px 0 0;
}
</style>
