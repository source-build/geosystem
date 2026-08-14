import dayjs, { Dayjs } from "dayjs";

// format: yyyy-MM-dd hh:mm:ss
export function formatDateYMDhms(input: string | number | Date) {
  if (!input) return "";

  if (typeof input == "string" && input == emptyTimeString) {
    return "-";
  }

  const date = new Date(input);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  const hour = ("0" + date.getHours()).slice(-2);
  const minute = ("0" + date.getMinutes()).slice(-2);
  const second = ("0" + date.getSeconds()).slice(-2);

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

/** 相对时间格式化函数（支持今天/昨天/前天/今年/去年/历史时间）
 * @param targetDate 目标时间（支持 Date 对象、时间戳、ISO 字符串等 dayjs 可解析格式）
 * @returns 格式化后的时间字符串
 */
export function formatRelativeTime(targetDate: Date | string | number): string {
  const target: Dayjs = dayjs(targetDate); // 转换为 dayjs 实例
  const now: Dayjs = dayjs(); // 当前时间

  // 校验目标时间有效性（处理无效输入）
  if (!target.isValid()) {
    console.warn(`Invalid target date: ${targetDate}`);
    return "无效时间";
  }

  // 今天判断（精确到天）
  if (target.isSame(now, "day")) {
    return `今天 ${target.format("HH:mm")}`;
  }

  // 昨天判断（当前时间前推 1 天）
  const yesterday = now.subtract(1, "day");
  if (target.isSame(yesterday, "day")) {
    return `昨天 ${target.format("HH:mm")}`;
  }

  // 前天判断（当前时间前推 2 天）
  const dayBeforeYesterday = now.subtract(2, "day");
  if (target.isSame(dayBeforeYesterday, "day")) {
    return `前天 ${target.format("HH:mm")}`;
  }

  // 非最近三天，按年份逻辑处理
  const currentYear = now.year();
  const targetYear = target.year();

  if (targetYear === currentYear) {
    // 今年：MM-DD HH:mm（补零格式，如 07-31 10:00）
    return target.format("MM-DD HH:mm");
  } else if (targetYear === currentYear - 1) {
    // 去年：去年 MM-DD（补零格式，如 去年 12-31）
    return `去年 ${target.format("MM-DD")}`;
  } else {
    // 超过去年：完整时间 YYYY-MM-DD HH:mm（补零格式，如 2023-01-01 00:00）
    return target.format("YYYY-MM-DD HH:mm");
  }
}

export const emptyTimeString = "0001-01-01T00:00:00Z";
