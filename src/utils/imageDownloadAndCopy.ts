/** 回调函数类型定义 */
type CopyCallback = (success: boolean, message: string) => void;

/** 支持的图片MIME类型 */
type SupportedMimeTypes = "image/png" | "image/jpeg" | "image/gif";

/** 通过网络URL下载图片并复制到剪贴板（支持格式转换）
 * @param imageUrl - 图片的网络URL地址
 * @param callback - 操作结果回调函数
 */
async function downloadAndCopyImage(
  imageUrl: string,
  callback: CopyCallback
): Promise<void> {
  try {
    const response = await fetch(imageUrl, {
      mode: "cors",
      headers: {
        Accept: "image/png, image/jpeg, image/gif, image/webp",
      },
    });

    if (!response.ok) {
      throw new Error(`图片下载失败，状态码: ${response.status}`);
    }

    let blob = await response.blob();

    const mimeType = blob.type as SupportedMimeTypes | "image/webp";
    let targetMimeType: SupportedMimeTypes = "image/png"; // 默认转换为PNG

    // 检查是否为支持的类型
    if (["image/png", "image/jpeg", "image/gif"].includes(mimeType)) {
      targetMimeType = mimeType as SupportedMimeTypes;
    } else {
      blob = await convertToSupportedFormat(blob, targetMimeType);
    }

    if (!navigator.clipboard || !window.ClipboardItem) {
      return copyWithFallback(blob, callback);
    }

    const clipboardItem = new ClipboardItem({
      [blob.type]: blob,
    });

    await navigator.clipboard.write([clipboardItem]);
    callback(true, "图片已成功复制到剪贴板");
  } catch (error) {
    console.error("下载或复制图片失败:", error);
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    callback(false, `操作失败: ${errorMessage}`);
  }
}

/** 将图片转换为剪贴板支持的格式
 * @param blob - 原始图片Blob
 * @param targetMimeType - 目标MIME类型
 * @returns 转换后的Blob
 */
function convertToSupportedFormat(
  blob: Blob,
  targetMimeType: SupportedMimeTypes
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blobUrl = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(blobUrl);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("无法获取Canvas上下文"));
        return;
      }

      ctx.drawImage(img, 0, 0);
      canvas.toBlob((convertedBlob) => {
        if (convertedBlob) {
          resolve(convertedBlob);
        } else {
          reject(new Error(`无法转换图片为${targetMimeType}格式`));
        }
      }, targetMimeType);
    };

    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error("图片加载失败，无法进行格式转换"));
    };

    img.src = blobUrl;
  });
}

/** 降级复制方案，用于不支持现代剪贴板API的环境
 * @param imageBlob - 图片Blob对象
 * @param callback - 回调函数
 */
function copyWithFallback(imageBlob: Blob, callback: CopyCallback): void {
  try {
    const blobUrl = URL.createObjectURL(imageBlob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(blobUrl);

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        callback(false, "无法获取Canvas上下文");
        return;
      }

      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");

      const textarea = document.createElement("textarea");
      textarea.value = dataUrl;
      document.body.appendChild(textarea);
      textarea.select();

      const success = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (success) {
        callback(true, "图片已成功复制到剪贴板（兼容模式）");
      } else {
        callback(false, "复制失败，请手动保存图片");
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      callback(false, "图片处理失败");
    };

    img.src = blobUrl;
  } catch (error) {
    console.error("兼容模式复制失败:", error);
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    callback(false, `兼容模式失败: ${errorMessage}`);
  }
}

export default downloadAndCopyImage;
