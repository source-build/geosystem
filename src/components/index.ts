import {
  showToast,
  showLoading,
  showToastFail,
  showToastOk,
} from "./f-toast";

// 导出一个配置,用于 app.use() 安装组件库使用
export default {
  install(app: any) {
    /**
     * 新版 vue3.0 提供的 provide/inject 用于跨组件传递数据
     * 用法: 在组件中 const toast = inject('toast')
     */
    app.provide("toast", {
      show: showToast,
      success: showToastOk,
      fail: showToastFail,
      loading: showLoading,
    });
  },
};
