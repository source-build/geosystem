<template>
  <div
    class="full-layout dashboard font-inter antialiased"
    style="overflow-y: auto"
  >
    <div class="dashboard-layout grid grid-cols-1 lg:grid-cols-3 gap-20 mb-8">
      <div class="main lg:col-span-2">
        <!-- 数据概览卡片 -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-20 mb-20"
        >
          <!-- 销售额卡片-1 -->
          <div
            class="bg-card-bg rounded-14 p-20 card-shadow card-hover"
            style="animation-delay: 0.3s"
          >
            <div class="flex items-center justify-between mb-20">
              <div>
                <h3 class="text-text-muted font-medium text-16">本月销售额</h3>
                <p class="text-14 text-success flex items-center mt-4">
                  <f-svg-icon name="fa-arrow-up" size="13" color="#10b981" />
                  <span id="sales-growth">12.5%</span>
                  <span class="text-text-muted ml-4">vs 上月</span>
                </p>
              </div>
              <div
                class="bg-primary/10 text-primary rounded-50 p-12 w-45 h-45 flex items-center justify-center"
              >
                <f-svg-icon
                  name="salesVolume"
                  size="20"
                  color="var(--el-color-primary)"
                />
              </div>
            </div>
            <div class="flex items-end justify-between">
              <div>
                <p class="text-28 font-bold animate-value" id="sales-value">
                  <count-to
                    :startVal="0"
                    :endVal="56892"
                    :duration="1000"
                    :useEasing="false"
                    :decimals="2"
                  />
                </p>
                <p class="text-14 text-text-muted mt-1">
                  较去年同期
                  <span class="text-success font-medium">+18.2%</span>
                </p>
              </div>
            </div>
          </div>

          <!-- 订单量卡片 -->
          <div
            class="bg-card-bg rounded-14 p-20 card-shadow card-hover"
            style="animation-delay: 0.3s"
          >
            <div class="flex items-center justify-between mb-20">
              <div>
                <h3 class="text-text-muted font-medium text-16">服务订单量</h3>
                <p class="text-14 text-success flex items-center mt-4">
                  <f-svg-icon name="fa-arrow-up" size="13" color="#10b981" />
                  <span id="sales-growth">12.5%</span>
                  <span class="text-text-muted ml-4">vs 上月</span>
                </p>
              </div>
              <div
                class="bg-secondary/10 text-secondary rounded-50 p-12 w-45 h-45 flex items-center justify-center"
              >
                <f-svg-icon
                  name="order"
                  size="20"
                  color="var(--el-color-success)"
                />
              </div>
            </div>
            <div class="flex items-end justify-between">
              <div>
                <p class="text-28 font-bold animate-value" id="sales-value">
                  <count-to
                    :startVal="0"
                    :endVal="4523"
                    :duration="1000"
                    :useEasing="false"
                  />
                </p>
                <p class="text-14 text-text-muted mt-1">
                  日均 <span class="font-medium">275</span> 单
                </p>
              </div>
            </div>
          </div>

          <!-- 陪诊师数量卡片 -->
          <div
            class="bg-card-bg rounded-14 p-20 card-shadow card-hover"
            style="animation-delay: 0.3s"
          >
            <div class="flex items-center justify-between mb-20">
              <div>
                <h3 class="text-text-muted font-medium text-16">陪诊师数量</h3>
                <p class="text-14 text-success flex items-center mt-4">
                  <f-svg-icon name="fa-arrow-up" size="13" color="#10b981" />
                  <span id="sales-growth">15.2%</span>
                  <span class="text-text-muted ml-4">vs 上月</span>
                </p>
              </div>
              <div
                class="bg-warning/10 text-warning rounded-50 p-12 w-45 h-45 flex items-center justify-center"
              >
                <f-svg-icon
                  name="user-fill"
                  size="20"
                  color="var(--el-color-warning)"
                />
              </div>
            </div>
            <div class="flex items-end justify-between">
              <div>
                <p class="text-28 font-bold animate-value" id="sales-value">
                  <count-to
                    :startVal="0"
                    :endVal="189"
                    :duration="1000"
                    :useEasing="false"
                  />
                </p>
                <p class="text-14 text-text-muted mt-1">
                  本月新增 <span class="font-medium">24</span> 位
                </p>
              </div>
            </div>
          </div>

          <!-- 用户数量卡片 -->
          <div
            class="bg-card-bg rounded-14 p-20 card-shadow card-hover"
            style="animation-delay: 0.3s"
          >
            <div class="flex items-center justify-between mb-20">
              <div>
                <h3 class="text-text-muted font-medium text-16">注册用户数</h3>
                <p class="text-14 text-success flex items-center mt-4">
                  <f-svg-icon name="fa-arrow-up" size="13" color="#10b981" />
                  <span id="sales-growth">23.8%</span>
                  <span class="text-text-muted ml-4">vs 上月</span>
                </p>
              </div>
              <div
                class="bg-danger/10 text-danger rounded-50 p-12 w-45 h-45 flex items-center justify-center"
              >
                <f-svg-icon
                  name="user-fill"
                  size="20"
                  color="var(--el-color-warning)"
                />
              </div>
            </div>
            <div class="flex items-end justify-between">
              <div>
                <p class="text-28 font-bold animate-value" id="sales-value">
                  <count-to
                    :startVal="0"
                    :endVal="452300"
                    :duration="1000"
                    :useEasing="false"
                  />
                </p>
                <p class="text-14 text-text-muted mt-1">
                  活跃用户 <span class="font-medium">68.5%</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <!-- 主要图表区域 -->
        <div class="grid grid-cols-1 gap-y-20 2xl:grid-cols-3 2xl:gap-20 mb-20">
          <!-- 趋势图卡片 -->
          <div
            class="bg-card-bg rounded-14 p-24 card-shadow lg:col-span-2 card-hover"
            style="animation-delay: 0.7s"
          >
            <div class="flex items-center justify-between mb-24">
              <h3 class="text-18 font-semibold">业务趋势分析</h3>
              <div class="flex space-x-8">
                <button
                  class="px-12 py-4 text-14 rounded-8 text-white"
                  style="background-color: var(--el-color-primary);"
                >
                  周
                </button>
                <button
                  class="px-12 py-4 text-14 rounded-8 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  月
                </button>
                <button
                  class="px-12 py-4 text-14 rounded-8 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  年
                </button>
              </div>
            </div>
            <div id="trendChart" class="chart-container"></div>
          </div>
          <!-- 订单日程卡片 -->
          <div
            class="bg-card-bg rounded-14 p-24 card-shadow card-hover"
            style="animation-delay: 0.8s"
          >
            <div class="flex items-center justify-between mb-20">
              <h3 class="text-18 font-semibold">服务订单日程</h3>
              <button class="text-gray-400 hover:text-gray-600">
                <i class="fa fa-ellipsis-v"></i>
              </button>
            </div>
            <div class="chart-container">
              <div class="w-full h-full" style="position: relative">
                <div style="position: absolute; inset: 0; overflow-y: auto">
                  <el-calendar
                    v-model="calendarValue"
                    v-loading="calendarLoading"
                  >
                    <template #date-cell="{ data }">
                      <div class="date-item">
                        <span class="title">{{ data.day.split("-")[2] }}</span>
                        <span
                          class="amount flex items-end"
                          v-if="data.day.split('-')[2] == 8"
                          >132单</span
                        >
                      </div>
                    </template>
                  </el-calendar>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 开通城市图卡片 -->
        <div
          class="bg-card-bg rounded-14 p-24 card-shadow card-hover fade-in mb-20"
          style="animation-delay: 0.8s"
        >
          <div class="flex items-center justify-between mb-24">
            <h3 class="text-18 font-semibold">服务覆盖城市</h3>
            <button class="text-gray-400 hover:text-gray-600">
              <i class="fa fa-ellipsis-v"></i>
            </button>
          </div>
          <div class="h-450">
            <div
              id="cityChart"
              class="w-full h-full"
              style="background-color: #f6f6f6"
            ></div>
          </div>
        </div>
        <!-- 最新订单 -->
        <!-- <div
          class="bg-card-bg rounded-14 p-24 card-shadow card-hover fade-in mb-20"
          style="animation-delay: 0.8s"
        >
          <div class="flex items-center justify-between mb-24">
            <h3 class="text-18 font-semibold">最新订单</h3>
            <button class="text-gray-400 hover:text-gray-600">
              <i class="fa fa-ellipsis-v"></i>
            </button>
          </div>
          <div class="h-350">
            <div
              id="cityChart"
              class="w-full h-full"
              style="background-color: #f6f6f6"
            ></div>
          </div>
        </div> -->
      </div>
      <div class="right flex flex-col gap-y-20">
        <!-- 系统通知 -->
        <div
          class="bg-card-bg rounded-14 p-20 card-shadow lg:col-span-2 card-hover fade-in"
          style="animation-delay: 0.1s"
        >
          <div class="flex items-center justify-between mb-24">
            <h3 class="text-18 font-semibold">
              系统通知
              <span class="text-14 ml-8" style="color: var(--el-color-primary);">(4条未读)</span>
            </h3>
            <button class="hover:text-primary/80 text-14" style="color: var(--el-color-primary);">
              全部标为已读
            </button>
          </div>
          <div class="space-y-10 max-h-250 overflow-y-auto scrollbar-hide">
            <div
              class="flex items-start p-10 bg-primary/5 rounded-8 border-l-4 border-primary"
            >
              <div class="flex-shrink-0 pt-2">
                <el-icon color="#3b82f6">
                  <CircleCheckFilled />
                </el-icon>
              </div>
              <div class="ml-12">
                <p class="text-14 font-medium" style="color: #1e293b">
                  系统更新通知
                </p>
                <p class="text-13 text-text-muted mt-5">
                  系统将于本周日凌晨2点进行维护，请提前做好准备
                </p>
                <p class="text-12 text-text-muted mt-5">2025-06-28 10:30</p>
              </div>
            </div>
            <div
              class="flex items-start p-10 bg-secondary/5 rounded-8 border-l-4 border-secondary"
            >
              <div class="flex-shrink-0 pt-2">
                <el-icon color="#10b981">
                  <CircleCheckFilled />
                </el-icon>
              </div>
              <div class="ml-12">
                <p class="text-14 font-medium" style="color: #1e293b">
                  陪诊师认证成功
                </p>
                <p class="text-13 text-text-muted mt-5">
                  李医生（ID: 10086）的认证申请已通过审核
                </p>
                <p class="text-12 text-text-muted mt-5">2025-06-28 10:30</p>
              </div>
            </div>
            <div
              class="flex items-start p-10 bg-warning/5 rounded-8 border-l-4 border-warning"
            >
              <div class="flex-shrink-0 pt-2">
                <el-icon color="#f59e0b">
                  <CircleCheckFilled />
                </el-icon>
              </div>
              <div class="ml-12">
                <p class="text-14 font-medium" style="color: #1e293b">
                  服务异常提醒
                </p>
                <p class="text-13 text-text-muted mt-5">
                  今日在线问诊服务响应时间较长，请关注系统负载
                </p>
                <p class="text-12 text-text-muted mt-5">2025-06-28 10:30</p>
              </div>
            </div>
            <div
              class="flex items-start p-10 bg-danger/5 rounded-8 border-l-4 border-danger"
            >
              <div class="flex-shrink-0 pt-2">
                <el-icon color="#ef4444">
                  <CircleCheckFilled />
                </el-icon>
              </div>
              <div class="ml-12">
                <p class="text-14 font-medium" style="color: #1e293b">
                  订单退款通知
                </p>
                <p class="text-13 text-text-muted mt-5">
                  订单#10012已全额退款，原因：用户取消服务
                </p>
                <p class="text-12 text-text-muted mt-5">2025-06-28 10:30</p>
              </div>
            </div>
          </div>
        </div>
        <!-- 待办事项 -->
        <div
          class="bg-card-bg rounded-14 p-20 card-shadow card-hover fade-in"
          style="animation-delay: 0.2s"
        >
          <div class="flex items-center justify-between mb-24">
            <h3 class="text-18 font-semibold">
              待办事项
              <span class="text-14 ml-8" style="color: var(--el-color-primary)"
                >(3项)</span
              >
            </h3>
            <button
              class="hover:text-primary/80 text-14"
              style="color: var(--el-color-primary)"
            >
              新增
            </button>
          </div>
          <div class="space-y-10 max-h-250 overflow-y-auto scrollbar-hide">
            <div class="flex items-center p-12 bg-gray-50 rounded-8">
              <input
                type="checkbox"
                class="h-14 w-14 focus:ring-primary border-gray-300 rounded"
                style="color: var(--el-color-primary)"
              />
              <div class="ml-12">
                <p class="text-14 font-medium">审核陪诊师申请 (5)</p>
                <p class="text-12 text-text-muted mt-4">
                  今日需完成5位医生的资质审核
                </p>
              </div>
              <span
                class="ml-auto px-8 py-4 text-12 font-medium bg-primary/10 text-primary rounded-30"
              >
                紧急
              </span>
            </div>
            <div class="flex items-center p-12 bg-gray-50 rounded-8">
              <input
                type="checkbox"
                class="h-14 w-14 text-warning focus:ring-warning border-gray-300 rounded"
              />
              <div class="ml-12">
                <p class="text-14 font-medium">服务合同续签</p>
                <p class="text-12 text-text-muted mt-4">
                  与XX医院的合作协议即将到期
                </p>
              </div>
              <span
                class="ml-auto px-8 py-4 text-12 font-medium bg-warning/10 text-warning rounded-30"
              >
                即将到期
              </span>
            </div>
            <div class="flex items-center p-12 bg-gray-50 rounded-8">
              <input
                type="checkbox"
                class="h-14 w-14 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <div class="ml-12">
                <p class="text-14 font-medium">系统数据备份</p>
                <p class="text-12 text-text-muted mt-4">
                  执行每周数据全量备份任务
                </p>
              </div>
              <span
                class="ml-auto px-8 py-4 text-12 font-medium bg-gray-100 text-gray-700 rounded-30"
              >
                常规
              </span>
            </div>
            <div class="flex items-center p-12 bg-gray-50 rounded-8">
              <input
                type="checkbox"
                class="h-14 w-14 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <div class="ml-12">
                <p class="text-14 font-medium line-through text-text-muted">
                  月度财务报表
                </p>
                <p class="text-12 text-text-muted mt-1">
                  已提交5月份财务报表至总公司
                </p>
              </div>
              <span
                class="ml-auto px-8 py-4 text-12 font-medium bg-success/10 text-success rounded-30"
              >
                已完成
              </span>
            </div>
          </div>
        </div>
        <!-- 服务器状态卡片 -->
        <div
          class="bg-card-bg rounded-14 p-20 card-shadow mb-8 fade-in"
          style="animation-delay: 1.1s"
        >
          <div class="flex items-center justify-between mb-20">
            <h3 class="text-18 font-semibold">系统资源监控</h3>
            <div class="flex items-center">
              <span
                class="inline-flex items-center justify-center w-12 h-12 rounded-30 bg-success mr-2 pulse-animation"
              ></span>
              <span class="text-14 text-success">系统正常运行中</span>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-1 gap-25">
            <div class="bg-gray-50 rounded-8 p-12">
              <div class="flex items-center justify-between mb-8">
                <h4 class="text-14 font-medium text-text-muted">CPU使用率</h4>
                <span class="text-14 font-medium">32%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-30 h-10">
                <div
                  class="bg-primary h-10 rounded-30"
                  style="width: 32%"
                ></div>
              </div>
            </div>
            <div class="bg-gray-50 rounded-8 p-12">
              <div class="flex items-center justify-between mb-8">
                <h4 class="text-14 font-medium text-text-muted">内存使用率</h4>
                <span class="text-14 font-medium">48%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-30 h-10">
                <div
                  class="bg-secondary h-10 rounded-30"
                  style="width: 48%"
                ></div>
              </div>
            </div>
            <div class="bg-gray-50 rounded-8 p-12">
              <div class="flex items-center justify-between mb-8">
                <h4 class="text-14 font-medium text-text-muted">磁盘使用率</h4>
                <span class="text-14 font-medium">65%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-30 h-10">
                <div
                  class="bg-warning h-10 rounded-30"
                  style="width: 65%"
                ></div>
              </div>
            </div>
          </div>
        </div>
        <!-- 服务类型统计 -->
        <!-- <div
          class="bg-card-bg rounded-14 p-24 card-shadow card-hover fade-in"
          style="animation-delay: 0.8s"
        >
          <div class="flex items-center justify-between mb-20">
            <h3 class="text-18 font-semibold">服务类型统计</h3>
            <button class="text-gray-400 hover:text-gray-600">
              <i class="fa fa-ellipsis-v"></i>
            </button>
          </div>
          <div class="chart-container">
            <div id="cityChart1" class="w-full h-full" style="background-color: #f6f6f6;"></div>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import * as echarts from "echarts";
import AMapLoader from "@amap/amap-jsapi-loader";
import { CountTo } from "vue3-count-to";

// 业务趋势
// echarts实例
let businessTrendChartInstance: any = null;
// 统计类型 0-近15日 1-近7天 2:近1个月 3:近一年
const businessTrendChartType: any = ref(0);
let businessTrendChartOption: { [key: string]: any } = {
  tooltip: {
    trigger: "axis",
    axisPointer: {
      lineStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: "rgba(0,49,236,0)",
            },
            {
              offset: 0.5,
              color: "rgba(255, 255, 255,1)",
            },
            {
              offset: 1,
              color: "rgba(0,49,236,0)",
            },
          ],
          global: false,
        },
      },
    },
  },
  grid: {
    top: "10%",
    left: "3%",
    right: "3%",
    bottom: "8%",
  },
  xAxis: [
    {
      type: "category",
      axisLabel: {
        color: "#A5B3CD",
      },
      splitLine: {
        show: false,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      boundaryGap: false,
      data: [],
    },
  ],
  yAxis: [
    {
      type: "value",
      min: 0,
      splitNumber: 4,
      splitLine: {
        show: false,
        lineStyle: {
          color: "rgba(255,255,255,0.1)",
        },
      },
      axisLine: {
        show: false,
        lineStyle: {
          color: "#9581F5",
        },
      },
      axisLabel: {
        show: false,
      },
      axisTick: {
        show: false,
      },
    },
  ],
  series: [
    // 近一年成交数量
    {
      type: "line",
      smooth: true, //是否平滑
      showAllSymbol: true,
      symbol: "circle",
      symbolSize: 15,
      label: {
        show: false,
        position: "top",
        color: "#005eec",
      },
      lineStyle: {
        width: 3, // 折线宽度
      },
      itemStyle: {
        color: "#005eec",
        borderColor: "#fff",
        borderWidth: 3,
        shadowColor: "rgba(0, 0, 0, .0)",
        shadowBlur: 0,
        shadowOffsetY: 2,
        shadowOffsetX: 2,
      },
      tooltip: {
        show: true,
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(
          0,
          0,
          0,
          1,
          [
            {
              offset: 0,
              color: "rgba(0,103,236,0.2)",
            },
            {
              offset: 1,
              color: "rgba(0,103,251,0)",
            },
          ],
          false
        ),
        shadowColor: "rgba(0,103,251,0.8)",
        shadowBlur: 20,
      },
      // data: [332, 255, 407, 302, 453, 384, 456],
    },
    // 近一年成交金额
    {
      type: "line",
      smooth: true, // 是否平滑
      showAllSymbol: true,
      symbol: "circle",
      symbolSize: 15,
      label: {
        show: false,
        position: "top",
        color: "#ff4d4f",
      },
      lineStyle: {
        width: 3, // 折线宽度
        color: "#ff4d4f", // 线条颜色设为红色
      },
      itemStyle: {
        color: "#ff4d4f", // 节点颜色设为红色
        borderColor: "#fff",
        borderWidth: 3,
        shadowColor: "rgba(0, 0, 0, .0)",
        shadowBlur: 0,
        shadowOffsetY: 2,
        shadowOffsetX: 2,
      },
      tooltip: {
        show: true,
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(
          0,
          0,
          0,
          1,
          [
            {
              offset: 0,
              color: "rgba(255, 77, 79, 0.2)", // 红色渐变
            },
            {
              offset: 1,
              color: "rgba(255, 77, 79, 0)",
            },
          ],
          false
        ),
        shadowColor: "rgba(255, 77, 79, 0.8)",
        shadowBlur: 20,
      },
      // 初始数据为空，后续会填充
      data: [],
    },
  ],
};
// 订单日历
const calendarValue = ref(new Date());
// 日历加载
const calendarLoading = ref(false);
// 服务城市分布
// 地图加载失败
const cityChartMapLoadingFail: Ref<boolean> = ref(false);
let cityChartMapInstance: any = null;
let cityChartAMap: any = null;

/** 初始化图表 */
const initChart = () => {
  // 业务趋势
  businessTrendChartInstance = echarts.init(
    document.getElementById("trendChart")
  );
  const xM = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  // 近一年成交数量，呈波动上升趋势
  const yD = [180, 390, 570, 720, 550, 630, 680, 400, 590, 620, 740, 860];

  // 近一年成交金额
  const yD2 = [
    900, 1000, 1200, 1400, 1700, 1500, 2000, 2200, 2100, 2400, 2600, 2800,
  ];
  // 模拟增长趋势，基础值
  // let baseQuantity = 50;
  // let baseAmount = 1000;

  // 模拟季节性波动
  // const seasonality = [
  //   1.2, 1.1, 0.9, 0.8, 1.0, 1.3, 1.4, 1.2, 1.1, 0.9, 0.8, 1.2,
  // ];
  // for (let i = 0; i < xM.length; i++) {
  //   // 成交数量模拟数据，包含增长趋势和季节性波动
  //   const quantity = Math.floor(
  //     baseQuantity * (1 + 0.05 * i) * seasonality[i] + Math.random() * 20
  //   );
  //   yD.push(quantity);

  //   // 成交金额模拟数据，与成交数量相关，同时有自身波动
  //   const amount = Math.floor(
  //     baseAmount * (1 + 0.08 * i) * seasonality[i] + Math.random() * 500
  //   );
  //   yD2.push(amount);
  // }

  businessTrendChartOption.xAxis[0].data = xM.map((e) => e + "月");

  // 近一年成交数量
  businessTrendChartOption.series[0].data = yD;
  businessTrendChartOption.series[0].name = `近一年成交数量`;

  // 近一年成交金额
  businessTrendChartOption.series[1].name = `近一年成交金额`;
  businessTrendChartOption.series[1].data = yD2;

  console.log(businessTrendChartOption);

  businessTrendChartInstance.setOption(businessTrendChartOption);
};
/** 初始化服务城市分布地图 */
const initCityChart = async () => {
  try {
    const map = await AMapLoader.load({
      key: import.meta.env.VITE_APP_GD_MAP_KEY,
      version: "2.0",
      plugins: [],
    });
    cityChartAMap = map;
    let lat = 25.043024;
    let lng = 102.70721;
    cityChartMapInstance = new cityChartAMap.Map("cityChart", {
      viewMode: "2D", // 默认使用 2D 模式，如果希望使用带有俯仰角的 3D 模式，请设置 viewMode: '3D'
      zoom: 13, // 初始化地图层级
      center: [lng, lat], // 初始化地图中心点
      mapStyle: "amap://styles/whitesmoke", //设置地图的显示样式
    });
    // TODO 地图初始化完成，添加覆盖物
  } catch (error) {
    cityChartMapLoadingFail.value = true;
    console.log("高德地图加载失败", error);
  }
};

onMounted(() => {
  initChart();
  initCityChart();
});
onUnmounted(() => {
  businessTrendChartInstance?.dispose();
});
</script>
<style lang="scss" scoped>
:deep(.el-calendar-table .el-calendar-day) {
  height: 50px;
}
.dashboard {
  padding: 20px;
  .dashboard-layout {
  }
}
.date-item {
  height: 100%;
  display: flex;
  position: relative;
  .title {
    font-size: 12px;
  }
  .amount {
    position: absolute;
    left: -4px;
    bottom: -5px;
    font-size: 8px;
    text-align: center;
    color: white;
    background-color: var(--el-color-primary);
    padding: 1px 3px;
    border-radius: 2px;
    white-space: nowrap;
    font-weight: 600;
  }
}
.content-auto {
  content-visibility: auto;
}
.animate-value {
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.chart-container {
  height: 300px;
}
.card-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
.pulse-animation {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.badge-notification {
  position: relative;
}
.badge-notification::after {
  content: attr(data-count);
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}
</style>
