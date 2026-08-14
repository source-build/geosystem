import COS from "cos-js-sdk-v5";
// @ts-ignore
import OSS from "ali-oss";
import { storeConfig } from "@/hooks/config";
import { joinUrl } from "./url";

/** 对象存储服务 */
export class OSD {
  /** COS实例 */
  cos: COS | null = null;
  /** OSS实例 */
  oss: OSS | null = null;
  /** 配置参数 */
  options: any = null;

  constructor({ cos, oss, options }: { cos?: COS; oss?: OSS; options: any }) {
    if (!cos && !oss) {
      throw new Error("对象存储实例均未初始化");
    }
    if (cos) {
      this.cos = cos;
    }
    if (oss) {
      this.oss = oss;
    }
    this.options = options;
  }

  /** 检查是否初始化 */
  checkInit(): boolean {
    return this.cos || this.oss;
  }

  /** 删除对象 */
  deleteObject(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.checkInit()) return reject("对象存储实例均未初始化");

      if (this.cos) {
        this.cos.deleteObject(
          {
            Bucket: this.options.Bucket,
            Region: this.options.Region,
            Key: key,
          },
          function (err, data) {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          }
        );
        return;
      }

      if (this.oss) {
        // TODO 待实现
      }
    });
  }

  /** 删除多个对象 */
  deleteMultipleObject(keys: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.checkInit()) return reject("对象存储实例均未初始化");

      if (this.cos) {
        this.cos.deleteMultipleObject(
          {
            Bucket: this.options.bucket,
            Region: this.options.region,
            Objects: keys.map((key) => ({ Key: key })),
          },
          function (err, data) {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          }
        );
        return;
      }

      if (this.oss) {
        // TODO 待实现
      }
    });
  }
}

/** 安全拼接对象存储对象url */
export function osdUrl(path: string) {
  if (!storeConfig.osdDomain) return path;
  return joinUrl(storeConfig.osdDomain, path);
}
