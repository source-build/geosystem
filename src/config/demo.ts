/**
 * 引流演示版全局配置
 *
 * 所有联系方式、二维码、文案集中在这里，改一处全局生效。
 * 上传开源平台前请核对 CONTACT 中的信息。
 */
export const DEMO_CONFIG = {
  /** 是否为引流演示版（锁定页、悬浮按钮等仅在 true 时出现） */
  enabled: true,

  /** 产品名称（对外展示） */
  productName: "蓝鲸GEO",

  /** 完整版说明 */
  fullEdition: {
    title: "完整版专属功能",
    description:
      "当前为您展示的是开源体验版，仅包含部分基础功能。" +
      "GEO 诊断报告、AI 批量创作、多渠道发布引擎、知识库等完整能力" +
      "仅在完整版中提供。获取完整源码、二次开发与部署支持，请扫码联系作者。",
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

/** 复制文本到剪贴板 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
