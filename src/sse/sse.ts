import { SSEManager, MessageEventType, SSEEvent } from "./manager";
import { DEMO_MODE } from "@/mock";

const sseManager = new SSEManager({ baseUrl: "" });
let isMerchantSSEInitialized = false;

/** 初始化 SSE 连接 */
export function initSSE() {
  // 演示模式：无后端，跳过 SSE 连接
  if (DEMO_MODE) return;

  sseManager.connect();

  if (isMerchantSSEInitialized) {
    console.log("[SSE] 已经初始化，跳过重复初始化");
    return;
  }

  isMerchantSSEInitialized = true;

  // 监听连接事件，连接成功后触发
  sseManager.addEventListener(MessageEventType.Connect, (event: SSEEvent) => {
    const data = JSON.parse(event.data);
    console.log("[监听连接事件] 连接成功事件:", data);
    sseManager.setOpenStatus();
  });

  // 监听消息事件
  sseManager.addEventListener(MessageEventType.Message, (event: SSEEvent) => {
    const data = JSON.parse(event.data);
    console.log("[监听消息事件] 收到消息:", data);
  });

  // 监听心跳事件
  sseManager.addEventListener(MessageEventType.Heartbeat, (event: SSEEvent) => {
    console.log("[监听心跳事件] 收到心跳:", event.data);
  });

  // 监听关闭事件
  sseManager.addEventListener(MessageEventType.Close, (event: SSEEvent) => {
    console.log("[监听关闭事件] 连接关闭:", event.data);
  });
}

/**
 * 关闭 SSE 连接
 */
export function closeSSE() {
  sseManager.clearAllListeners();
  sseManager.close();
  isMerchantSSEInitialized = false;
}

/**
 * 获取 SSE 管理器实例
 */
export function getSSEManager(): SSEManager | null {
  return sseManager;
}

/**
 * 检查 SSE 是否已连接
 */
export function isSSEConnected(): boolean {
  return sseManager?.isConnected() || false;
}
