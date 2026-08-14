/**
 * SSE (Server-Sent Events) uniapp 连接管理器
 */

import { getLocalStoreToken } from "@/utils/auth";

// import { getToken } from "@/utils/auth";

/** SSE 消息事件类型枚举 */
export enum MessageEventType {
  /** 连接事件，在连接成功后发送 */
  Connect = "connect",
  /** 心跳事件 */
  Heartbeat = "heartbeat",
  /** 消息事件 */
  Message = "message",
  /** 关闭事件 */
  Close = "close",
}

export interface SSEConfig {
  /** SSE 服务端 URL */
  url?: string;
  /** 连接超时时间（毫秒） */
  timeout?: number;
  /** 最大重连次数 */
  maxRetries?: number;
  /** 重连间隔（毫秒） */
  retryInterval?: number;
  /** 是否启用自动重连 */
  autoReconnect?: boolean;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 连接参数 */
  params?: Record<string, string>;
}

export interface SSEEvent {
  /** 事件类型 */
  type: MessageEventType | string; // 支持枚举类型和自定义字符串类型
  /** 事件数据 */
  data: string;
  /** 事件 ID */
  id?: string;
  /** 重连时间（服务端指定的重连间隔，毫秒） */
  retry?: number;
}

export type SSEEventListener = (event: SSEEvent) => void;

/** SSE 连接状态类型
 * connecting: 连接中
 * open: 连接成功
 * closed: 已关闭
 * error: 连接错误
 */
export type SSEStatus = "connecting" | "open" | "closed" | "error";

/** SSE 连接管理器 */
export class SSEManager {
  private config: SSEConfig | null = null;
  private retryTimer: NodeJS.Timeout | null = null;
  private status: SSEStatus = "closed";
  private baseUrl: string = "";
  private buffer: string = "";
  private retryCount = 0;
  private serverRetryInterval: number | null = null; // 服务端指定的重连间隔
  private abortController: AbortController | null = null; // 用于取消请求
  private listeners: Map<string, Set<SSEEventListener>> = new Map();

  constructor({ baseUrl }: { baseUrl?: string; deviceType?: string }) {
    if (baseUrl) {
      this.baseUrl = baseUrl;
      return;
    }

    this.baseUrl = import.meta.env.VITE_APP_API_GATEWAY;
  }

  /** 连接 SSE 服务 */
  async connect(config?: SSEConfig): Promise<void> {
    if (this.status === "open") {
      console.log("[SSE] 连接已建立，忽略本次连接请求");
      return;
    }

    // 重置连接
    this.resetConnection();

    this.config = {
      timeout: 30000,
      maxRetries: 10,
      retryInterval: 3000,
      autoReconnect: true,
      ...config,
    };

    // 连接中状态
    this.setStatus("connecting");

    let token = getLocalStoreToken();
    const headers: Record<string, string> = config?.headers || {
      Accept: "text/event-stream",
      Authorization: "Bearer " + token,
    };
    if (!headers["Accept"]) {
      headers["Accept"] = "text/event-stream";
    }

    // 创建 AbortController 用于取消请求
    this.abortController = new AbortController();

    // 构建查询参数
    const queryParams = new URLSearchParams(config?.params || {}).toString();
    const url = `${this.baseUrl}/online/sse/connect${queryParams ? `?${queryParams}` : ""}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: headers,
        signal: this.abortController.signal,
      });
      console.log(response);
      if (!response.ok) {
        if (response.status == 400) {
          console.log("[SSE] 身份验证失败");
          this.setStatus("closed");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.setOpenStatus();

      // 获取可读流
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("无法获取响应流");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      // 读取数据流
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log("[SSE] 流已结束");
          this.setStatus("closed");
          break;
        }

        try {
          // 解码数据
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // 处理数据
          this.processSSEData(chunk);
        } catch (error: any) {
          console.error("[SSE] 数据处理错误:", error);
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("[SSE] 连接已取消");
        this.setStatus("closed");
      } else {
        this.setStatus("error");
        console.error("[SSE] 创建连接失败:", error);
      }
    }
  }

  /** 重置连接 */
  resetConnection(): void {
    // 取消现有连接
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    // 清除重连定时器
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    this.buffer = "";
    this.serverRetryInterval = null;
  }

  /** 添加事件监听器 */
  addEventListener(
    eventType: MessageEventType | string,
    listener: SSEEventListener,
  ): void {
    const key =
      typeof eventType === "string" ? eventType : (eventType as string);
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);
  }

  /** 移除事件监听器 */
  removeEventListener(
    eventType: MessageEventType | string,
    listener: SSEEventListener,
  ): void {
    const key =
      typeof eventType === "string" ? eventType : (eventType as string);
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.listeners.delete(key);
      }
    }
  }

  /** 清理所有监听器 */
  clearAllListeners(): void {
    this.listeners.clear();
  }

  /** 关闭 SSE 连接 */
  close(): void {
    this.resetConnection();
    this.setStatus("closed");
  }

  /** 设置连接成功状态 */
  setOpenStatus(): void {
    // 重置重试次数
    this.retryCount = 0;
    this.setStatus("open");
  }

  /** 获取当前连接状态 */
  getStatus(): SSEStatus {
    return this.status;
  }

  /** 获取当前配置 */
  getConfig(): SSEConfig | null {
    return this.config;
  }

  /** 是否已连接 */
  isConnected(): boolean {
    return this.status === "open";
  }

  /** 发送数据（SSE 只读，不支持发送数据） */
  sendData(data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      reject(new Error("SSE 是单向连接，不支持发送数据到服务器"));
    });
  }

  /** 处理 SSE 数据 */
  private processSSEData(data: string): void {
    // 将新数据添加到缓冲区
    this.buffer += data;

    // 按行分割数据
    const lines = this.buffer.split("\n");
    this.buffer = lines.pop() || ""; // 保留最后一行（可能不完整）

    let currentEvent: Partial<SSEEvent> = {};

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine === "") {
        // 空行表示事件结束
        if (currentEvent.data !== undefined) {
          // 尝试将事件类型转换为枚举值，如果不在枚举中则保持原字符串
          let eventType = currentEvent.type as MessageEventType;
          if (Object.values(MessageEventType).includes(eventType)) {
            eventType = eventType;
          }

          const event: SSEEvent = {
            type: eventType,
            data: currentEvent.data.replace(/\n$/, ""), // 移除末尾的换行符
            id: currentEvent.id,
            retry: currentEvent.retry,
          };

          // 服务端指定的重连间隔
          if (event.retry && !isNaN(event.retry)) {
            this.serverRetryInterval = event.retry;
            console.info(`[SSE] 服务端指定重连间隔: ${event.retry}ms`);
          }

          this.handleEvent(event);
          currentEvent = {};
        }
      } else if (trimmedLine.startsWith(":")) {
        // 注释行，忽略
        continue;
      } else {
        // 解析字段
        const colonIndex = trimmedLine.indexOf(":");
        if (colonIndex > 0) {
          const field = trimmedLine.substring(0, colonIndex).trim();
          let value = trimmedLine.substring(colonIndex + 1).trim();

          // 移除单个前导空格（SSE 规范）
          if (value.startsWith(" ")) {
            value = value.substring(1);
          }

          switch (field) {
            case "data":
              currentEvent.data = (currentEvent.data || "") + value + "\n";
              break;
            case "event":
              currentEvent.type = value;
              break;
            case "id":
              currentEvent.id = value;
              break;
            case "retry":
              const retryValue = parseInt(value, 10);
              if (!isNaN(retryValue) && retryValue > 0) {
                currentEvent.retry = retryValue;
              }
              break;
          }
        }
      }
    }
  }

  /** 自动重连 */
  private scheduleReconnect(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }

    if (!this.config || this.retryCount >= (this.config.maxRetries || 5)) {
      console.warn("[SSE] 达到最大重连次数，停止重连");
      return;
    }

    this.retryCount++;

    // 优先使用服务端指定的重连间隔，其次使用配置的间隔
    const interval =
      this.serverRetryInterval || this.config.retryInterval || 3000;

    console.warn(`[SSE] 将在 ${interval}ms 后进行第 ${this.retryCount} 次重连`);

    this.retryTimer = setTimeout(() => {
      if (this.config?.autoReconnect) {
        try {
          this.connect(this.config);
        } catch (error: any) {
          console.error("[SSE] 重连失败:", error);
        }
      }
    }, interval);
  }

  /** 设置连接状态 */
  private setStatus(status: SSEStatus, stopReconnect: boolean = false): void {
    const oldStatus = this.status;
    this.status = status;

    if (oldStatus !== status) {
      console.info(`[SSE] 状态变更: ${oldStatus} -> ${status}`);
      if (!this.config?.autoReconnect || stopReconnect) return;

      // 启用自动重连
      if (status === "error" || status === "closed") {
        this.scheduleReconnect();
      }
    }
  }

  /** 处理事件 */
  private handleEvent(event: SSEEvent): void {
    // 触发特定事件类型的监听器
    const key =
      typeof event.type === "string" ? event.type : (event.type as string);
    const typeListeners = this.listeners.get(key);
    if (typeListeners) {
      typeListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error: any) {
          console.error("[SSE] 事件监听器执行错误:", error);
        }
      });
    }

    // 触发通用事件监听器
    const allListeners = this.listeners.get("*");
    if (allListeners) {
      allListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error: any) {
          console.error("[SSE] 通用事件监听器执行错误:", error);
        }
      });
    }
  }
}
