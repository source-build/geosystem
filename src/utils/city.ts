/** 根据区县行政编码推导市级行政编码
 * @param countyCode 6位区县编码（如"530102"）
 * @returns 市级行政编码（如"530100"）
 */
export const deriveCityCode = (countyCode: string): string => {
  if (!countyCode || countyCode.length !== 6) {
    console.warn("无效的区县编码格式");
    return countyCode;
  }

  // 取前4位，后2位改为00
  return countyCode.substring(0, 4) + "00";
};

/** 根据区县行政编码推导省级行政编码
 * @param countyCode 6位区县编码（如"530102"）
 * @returns 省级行政编码（如"530000"）
 */
export const deriveProvinceCode = (countyCode: string): string => {
  if (!countyCode || countyCode.length !== 6) {
    console.warn("无效的区县编码格式");
    return countyCode;
  }

  // 取前2位，后4位改为0000
  return countyCode.substring(0, 2) + "0000";
};

/** 根据区县行政编码推导完整的省市编码信息
 * @param countyCode 6位区县编码（如"530102"）
 * @returns 包含省、市、县三级编码的对象
 */
export const deriveAdminCodes = (countyCode: string) => {
  if (!countyCode || countyCode.length !== 6) {
    console.warn("无效的区县编码格式");
    return {
      original: countyCode,
      county: countyCode,
      city: "",
      province: "",
    };
  }

  return {
    original: countyCode, // 原始区县编码：530102
    county: countyCode, // 区县编码：530102
    city: deriveCityCode(countyCode), // 市级编码：530100
    province: deriveProvinceCode(countyCode), // 省级编码：530000
  };
};
