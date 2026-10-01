import { ElMessageBox } from "element-plus";
import { DEMO_CONFIG, copyText } from "@/config/demo";

type DemoSection = "aura" | "sitebuilder" | "mediaRelease";

type DemoSectionConfig = {
  actions: Record<string, string>;
};

/** 公开体验版统一能力拦截：任何真实副作用都必须在请求前调用。 */
export function useDemoGate(section: DemoSection) {
  const requireFullEdition = async (
    capability: string,
    action: string,
    description?: string,
  ) => {
    const config = DEMO_CONFIG[section] as DemoSectionConfig;
    const actionDescription = config.actions[action];

    try {
      await ElMessageBox.confirm(
        `${description || actionDescription || DEMO_CONFIG.fullEdition.description}\n\n${DEMO_CONFIG.contact.tip}\n微信：${DEMO_CONFIG.contact.wechat}`,
        `${capability} · 完整版能力`,
        {
          confirmButtonText: "复制微信号",
          cancelButtonText: "继续浏览",
          type: "info",
          distinguishCancelAndClose: true,
          customStyle: { maxWidth: "460px" },
        },
      );
      const copied = await copyText(DEMO_CONFIG.contact.wechat);
      if (copied) showToastOk(`已复制微信号：${DEMO_CONFIG.contact.wechat}`);
      else showToastFail("复制失败，请手动复制微信号");
    } catch {
      // 继续浏览，无需额外处理
    }
  };

  return { requireFullEdition };
}
