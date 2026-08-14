import { DEMO_CONFIG } from "@/config/demo";

if (import.meta.env.MODE != "development") {
  console.log(`

    ▗▄▄▖ ▗▄▖ ▗▖ ▗▖▗▄▄▖  ▗▄▄▖▗▄▄▄▖    ▗▄▄▖ ▗▖ ▗▖▗▄▄▄▖▗▖   ▗▄▄▄
    ▐▌   ▐▌ ▐▌▐▌ ▐▌▐▌ ▐▌▐▌   ▐▌       ▐▌ ▐▌▐▌ ▐▌  █  ▐▌   ▐▌  █
     ▝▀▚▖▐▌ ▐▌▐▌ ▐▌▐▛▀▚▖▐▌   ▐▛▀▀▘    ▐▛▀▚▖▐▌ ▐▌  █  ▐▌   ▐▌  █
    ▗▄▄▞▘▝▚▄▞▘▝▚▄▞▘▐▌ ▐▌▝▚▄▄▖▐▙▄▄▖    ▐▙▄▞▘▝▚▄▞▘▗▄█▄▖▐▙▄▄▖▐▙▄▄▀


  `);

  console.log(
    `%c✨ ${DEMO_CONFIG.productName}·生成式优化引擎 ｜ 开源体验版 ｜ 完整源码：微信 ${DEMO_CONFIG.contact.wechat}`,
    "background: linear-gradient(45deg, #ff6b6b, #ffe66d, #6dfff9); " +
      "background-size: 400% 400%; " +
      "animation: gradient 3s ease infinite; " +
      "display: inline-block; " +
      "padding: 10px 20px; " +
      "border-radius: 5px;"
  );

  console.log(
    `%c🔒 本仓库为体验版，核心模块已裁剪。完整版源码/技术支持/定制开发请联系作者`,
    "display: inline-block; ",
  );
}
