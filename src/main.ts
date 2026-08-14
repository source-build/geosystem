import { createApp } from "vue";
import "./style.css";
import "./console";
import App from "./App.vue";
import router from "./router";
import pinia from "./store/pinia";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import componentsCtl from "./components/index";
import "element-plus/theme-chalk/src/message-box.scss";
import "element-plus/theme-chalk/dark/css-vars.css";
import ElementPlus from "element-plus";
// @ts-ignore
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
// @ts-ignore
import "virtual:svg-icons-register";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { initConfigGlobal } from "./hooks/config";
import { initTheme } from "./theme/index";
import { initConnect } from "./hooks/connect";
import { installDirectives } from "./directives";
import "./assets/fonts/font.css";

dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

// 初始化配置
initConfigGlobal();
// 初始化主题
initTheme();
// 初始化连接
initConnect();

const app = createApp(App);
// 配置全局属性，可在所有template中直接使用
app.config.globalProperties.$ElIconsKey = [];
app.config.globalProperties.osdUrl = osdUrl;

app.use(pinia);
app.use(componentsCtl);
app.use(ElementPlus, {
  locale: zhCn,
});
installDirectives(app);

// 注册element-plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.config.globalProperties.$ElIconsKey.push(key);
  app.component(key, component);
}

app.use(router).mount("#app");
