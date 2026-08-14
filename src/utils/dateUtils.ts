import dayjs from "dayjs";

/** 计算年龄
 * @param {string} birthDateString - 出生日期字符串（格式：'YYYY-MM-DD'）
 * @returns {number} 年龄
 */
export function calculateAge(birthDateString: string): number {
  const today = dayjs();
  const birthDate = dayjs(birthDateString);

  // 校验日期有效性
  if (!birthDate.isValid()) {
    throw new Error("Invalid birth date");
  }

  let age = today.year() - birthDate.year();

  // 判断是否已过生日
  const isBirthdayNotReached =
    today.month() < birthDate.month() ||
    (today.month() === birthDate.month() && today.date() < birthDate.date());

  if (isBirthdayNotReached) {
    age--;
  }

  // 处理未来日期的情况
  return age >= 0 ? age : 0;
}
