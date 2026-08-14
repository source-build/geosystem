import mitt from "mitt";

/** 事件总线 */
const bus = mitt<Events>();

type Events = {
  "nav-path": any; // 导航路径变化事件
  "uncheck-dashboard": any; // 取消选中仪表盘事件
  "refresh-account-balance": void; // 刷新账户算力事件
};

export default bus;
