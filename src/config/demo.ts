/**
 * 引流演示版全局配置
 *
 * 所有联系方式、二维码、文案集中在这里，改一处全局生效。
 * 上传开源平台前请核对 contact 中的信息。
 */
export const DEMO_CONFIG = {
  /** 是否为引流演示版（锁定页、悬浮按钮等仅在 true 时出现） */
  enabled: true,

  /** 产品名称（对外展示） */
  productName: "蓝鲸GEO",

  login: {
    valueProposition: "诊断品牌在主流 AI 平台中的可见度、推荐位置与竞争差距",
    journey: ["登录体验", "运行 AI 可见度诊断", "查看多平台报告"],
  },

  dashboard: {
    badge: "GEO 公开体验版",
    title: "看清品牌在 AI 推荐中的真实位置",
    description:
      "聚合多平台品牌提及率、推荐位置与竞争品牌，快速发现 AI 搜索中的内容缺口，并获得可执行的 GEO 优化方向。",
    demoNote: "当前指标来自脱敏演示快照，仅用于展示产品能力与分析路径。",
  },

  experienceSteps: ["AI 可见度诊断", "多平台报告", "洞察与行动", "内容增长闭环"],

  cta: {
    startDiagnosis: "开始 AI 可见度诊断",
    viewReports: "查看诊断报告",
    getFullEdition: "获取完整版源码",
    continueExperience: "继续体验 GEO 诊断",
  },

  aura: {
    badge: "意境 AI · 完整版能力预览",
    demoUser: {
      name: "体验用户",
      plan: "公开体验版",
      balance: 12680,
    },
    actions: {
      generate: "模型调用与套图生成属于完整版能力，体验版不会创建真实任务或消耗算力。",
      upload: "素材上传、云文件管理与对象存储能力仅在完整版开放。",
      share: "作品分享与公开案例管理属于完整版协作能力。",
      delete: "体验版数据为固定演示快照，不会执行删除操作。",
      recharge: "真实算力账户、套餐和充值能力仅在完整版开放。",
      useTemplate: "使用同款会回填配置并发起模型任务，该流程仅在完整版开放。",
      download: "原图与整套素材下载仅在完整版开放。",
    },
    publicGallery: {
      worksNotice: "我的作品为本地演示快照，不会读取正式账户数据",
    },
  },

  sitebuilder: {
    actions: {
      create: "创建站点项目会写入企业资料与知识库关联，该流程仅在完整版开放。",
      save: "站点草稿保存与版本管理属于完整版能力，体验版仅保留当前页面内的编辑效果。",
      media: "云素材选择、上传与对象存储能力仅在完整版开放。",
      build: "AI 建站构建会调用模型、生成站点产物并消耗账户资源，该流程仅在完整版开放。",
      cancel: "构建任务控制与状态同步属于完整版能力。",
      download: "站点源码与构建产物下载仅在完整版开放。",
    },
  },

  mediaRelease: {
    actions: {
      submit: "媒体投稿会创建真实发布订单并产生费用，该流程仅在完整版开放。",
      favorite: "媒体收藏会写入正式账户数据，该能力仅在完整版开放。",
      favoriteGroup: "收藏分组的新增、编辑与删除仅在完整版开放。",
      refund: "退款申请涉及真实订单与资金流程，仅在完整版开放。",
      urge: "催稿会通知真实媒体服务方，仅在完整版开放。",
      withdraw: "撤回会修改真实投稿订单状态，仅在完整版开放。",
      upload: "视频、图片与稿件素材上传仅在完整版开放。",
      authorize: "媒体账号授权与渠道绑定仅在完整版开放。",
    },
  },

  /** 完整版说明 */
  fullEdition: {
    title: "完整版能力预览",
    description:
      "当前页面属于完整版 GEO 增长闭环。公开体验版已开放 AI 可见度诊断与多平台报告；完整版进一步覆盖内容策略、批量创作、知识库、多渠道发布及商业化能力。",
    capabilities: [
      { title: "AI 内容生产", description: "从诊断缺口生成高相关内容", icon: "EditPen" },
      { title: "品牌知识库", description: "沉淀品牌事实与可信素材", icon: "Collection" },
      { title: "多渠道发布", description: "统一编排和追踪内容分发", icon: "Promotion" },
      { title: "增长运营", description: "多租户、计费与效果闭环", icon: "DataLine" },
    ],
  },

  lockedModules: [
    {
      keywords: ["文章", "内容", "创作", "SEO", "改写"],
      category: "AI 内容生产",
      description: "把诊断发现的品牌信息缺口转化为适合 AI 检索与引用的高质量内容。",
      features: ["基于 GEO 洞察生成选题", "AI 批量创作与改写", "品牌口径与质量校验", "内容任务协作流"],
    },
    {
      keywords: ["知识库", "素材", "词库", "品牌"],
      category: "品牌知识库",
      description: "集中管理品牌事实、产品资料与可信来源，为 AI 内容生产提供稳定依据。",
      features: ["品牌事实与产品资料管理", "行业词与问题库沉淀", "素材标签和智能检索", "创作引用与口径统一"],
    },
    {
      keywords: ["发布", "渠道", "媒体", "站点"],
      category: "多渠道发布",
      description: "将优化内容分发到目标渠道，形成从内容生产到平台覆盖的执行闭环。",
      features: ["渠道账号统一管理", "多平台发布任务编排", "发布状态与失败重试", "内容覆盖效果追踪"],
    },
    {
      keywords: ["租户", "计费", "订单", "套餐", "账户", "算力"],
      category: "商业化运营",
      description: "为团队和 SaaS 运营提供租户、套餐、计费与资源管理能力。",
      features: ["多租户与成员协作", "套餐和资源额度管理", "订单与计费流水", "运营数据与权限隔离"],
    },
    {
      keywords: ["系统", "配置", "权限", "日志", "任务", "监控"],
      category: "企业级系统能力",
      description: "保障 GEO 工作流可配置、可审计、可扩展，满足企业部署和协作要求。",
      features: ["细粒度权限与审计", "任务调度和运行监控", "业务参数统一配置", "企业部署与二次开发"],
    },
  ],

  lockedDefault: {
    category: "GEO 增长闭环",
    description: "该功能用于衔接诊断、内容、发布与效果追踪，是完整版工作流的一部分。",
    features: ["完整业务工作流", "团队协作与权限控制", "数据持续沉淀与复用", "源码与二次开发支持"],
  },

  /** 联系方式 */
  contact: {
    /** 微信号（文本展示 + 复制） */
    wechat: "GRXC2312",
    /** 微信/交流群二维码图片路径（public/qrcode.jpg）；为空则不显示 */
    qrcodeUrl: "/adm/qrcode.jpg",
    /** 引导文案 */
    tip: "添加微信备注「GEO源码」，获取完整版源码与技术支持",
  },
};

export function getLockedModuleConfig(title = "") {
  return (
    DEMO_CONFIG.lockedModules.find((module) =>
      module.keywords.some((keyword) => title.includes(keyword)),
    ) || DEMO_CONFIG.lockedDefault
  );
}

/** 复制文本到剪贴板 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
