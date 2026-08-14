/** 获取操作系统类型 */
export function getOperatingSystem() {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("mac os x")) {
    return "macOS";
  } else if (userAgent.includes("windows")) {
    return "Windows";
  } else if (userAgent.includes("linux")) {
    return "Linux";
  } else if (userAgent.includes("android")) {
    return "Android";
  } else if (userAgent.includes("ios")) {
    return "iOS";
  } else {
    return "Unknown Device";
  }
}

/** 获取浏览器信息 */
export function getBrowserInfo() {
  const userAgent = navigator.userAgent.toLowerCase();
  let browserName = "Unknown";
  let browserVersion = "Unknown";

  // 检测浏览器类型
  if (userAgent.includes("edge")) {
    browserName = "Microsoft Edge";
    // 提取版本号
    const versionMatch = userAgent.match(/edge\/([\d.]+)/);
    if (versionMatch && versionMatch[1]) {
      browserVersion = versionMatch[1];
    }
  } else if (userAgent.includes("edg")) {
    // Chromium内核的Edge浏览器标识
    browserName = "Microsoft Edge (Chromium)";
    const versionMatch = userAgent.match(/edg\/([\d.]+)/);
    if (versionMatch && versionMatch[1]) {
      browserVersion = versionMatch[1];
    }
  } else if (userAgent.includes("chrome")) {
    // 排除其他基于Chrome的浏览器
    if (!userAgent.includes("opr") && !userAgent.includes("brave")) {
      browserName = "Google Chrome";
      const versionMatch = userAgent.match(/chrome\/([\d.]+)/);
      if (versionMatch && versionMatch[1]) {
        browserVersion = versionMatch[1];
      }
    }
  } else if (userAgent.includes("firefox")) {
    browserName = "Mozilla Firefox";
    const versionMatch = userAgent.match(/firefox\/([\d.]+)/);
    if (versionMatch && versionMatch[1]) {
      browserVersion = versionMatch[1];
    }
  } else if (userAgent.includes("safari")) {
    // 排除其他基于WebKit的浏览器
    if (!userAgent.includes("chrome") && !userAgent.includes("edge")) {
      browserName = "Safari";
      const versionMatch = userAgent.match(/version\/([\d.]+)/);
      if (versionMatch && versionMatch[1]) {
        browserVersion = versionMatch[1];
      }
    }
  } else if (userAgent.includes("opr")) {
    browserName = "Opera";
    const versionMatch = userAgent.match(/opr\/([\d.]+)/);
    if (versionMatch && versionMatch[1]) {
      browserVersion = versionMatch[1];
    }
  } else if (userAgent.includes("brave")) {
    browserName = "Brave";
    const versionMatch = userAgent.match(/brave\/([\d.]+)/);
    if (versionMatch && versionMatch[1]) {
      browserVersion = versionMatch[1];
    }
  }

  return {
    name: browserName,
    version: browserVersion,
    userAgent: navigator.userAgent,
  };
}

/** 浏览器指纹信息接口 */
export interface BrowserFingerprintInfo {
  fingerprint: string;
  rawData: {
    baseInfo: string[];
    advancedInfo: string[];
  };
  generationTime: Date;
}

/** 生成浏览器指纹（用于近似标识同一浏览器）*/
export async function generateBrowserFingerprint(): Promise<BrowserFingerprintInfo> {
  // 1. 基础环境信息（必选，兼容性好）
  const baseInfo: string[] = [
    navigator.userAgent,
    navigator.platform,
    navigator.hardwareConcurrency.toString(),
    navigator.deviceMemory?.toString() || "unknown",
    navigator.language,
    new Date().getTimezoneOffset().toString(),
    `${screen.width}x${screen.height}:${screen.colorDepth}`,
    navigator.cookieEnabled ? "cookies=on" : "cookies=off",
    navigator.doNotTrack ? "dnt=on" : "dnt=off",
  ];

  // 2. 高级特性信息（可选，提升唯一性）
  const advancedInfo: string[] = [];

  // 2.1 检测支持的MIME类型
  try {
    const mimeTypes = Array.from(navigator.mimeTypes).map((mt) => mt.type);
    advancedInfo.push(`mime=${mimeTypes.sort().join(",")}`);
  } catch (e) {
    advancedInfo.push("mime=unknown");
  }

  // 2.2 检测可用字体
  try {
    const fontTest = await testAvailableFonts();
    advancedInfo.push(`fonts=${fontTest}`);
  } catch (e) {
    advancedInfo.push("fonts=unknown");
  }

  // 2.3 检测Canvas渲染特性
  try {
    const canvasFingerprint = getCanvasFingerprint();
    advancedInfo.push(`canvas=${canvasFingerprint}`);
  } catch (e) {
    advancedInfo.push("canvas=unknown");
  }

  // 3. 组合所有信息
  const rawFingerprint = [...baseInfo, ...advancedInfo].join("|");

  // 4. 哈希处理
  const fingerprint = hashString(rawFingerprint);

  return {
    fingerprint,
    rawData: {
      baseInfo,
      advancedInfo,
    },
    generationTime: new Date(),
  };
}

/** 检测可用字体 */
function testAvailableFonts(): Promise<string> {
  return new Promise((resolve) => {
    // 常见系统字体列表
    const testFonts: string[] = [
      "Arial",
      "Times New Roman",
      "Courier New",
      "Microsoft YaHei",
      "SimSun",
      "Helvetica",
      "Roboto",
      "PingFang SC",
      "Arial Unicode MS",
    ];
    const defaultFont = "sans-serif";

    // 创建离屏Canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      resolve("canvas-unsupported");
      return;
    }

    canvas.width = 200;
    canvas.height = 50;
    ctx.font = `16px ${defaultFont}`;

    // 测量默认字体宽度
    const defaultWidth = ctx.measureText("abcdefghijklmnopqrstuvwxyz").width;
    const availableFonts: string[] = [];

    // 检测每个测试字体
    testFonts.forEach((font) => {
      try {
        ctx.font = `16px "${font}", ${defaultFont}`;
        const testWidth = ctx.measureText("abcdefghijklmnopqrstuvwxyz").width;
        if (Math.abs(testWidth - defaultWidth) > 0.1) {
          // 允许微小的浮点误差
          availableFonts.push(font);
        }
      } catch (e) {
        // 忽略字体解析错误
      }
    });

    resolve(availableFonts.join(","));
  });
}

/** 获取Canvas指纹 */
function getCanvasFingerprint(): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return "canvas-unsupported";
  }

  canvas.width = 256;
  canvas.height = 64;

  // 绘制特定图形和文本以触发渲染差异
  ctx.fillStyle = "#f00";
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = "#0f0";
  ctx.font = "16px Arial";
  ctx.fillText("browser-fingerprint", 10, 30);

  const gradient = ctx.createLinearGradient(0, 0, 256, 0);
  gradient.addColorStop(0, "#00f");
  gradient.addColorStop(1, "#f00");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 40, 256, 20);

  // 返回Base64的前100个字符作为指纹
  return canvas.toDataURL("image/png").slice(0, 100);
}

/** 字符串哈希函数
 * @param str 输入字符串
 * @returns 32位十六进制哈希值
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转换为32位整数
  }
  // 转换为十六进制并补全8位
  return Math.abs(hash).toString(16).padStart(8, "0");
}
