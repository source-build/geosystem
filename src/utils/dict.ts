import { queryDictValuesRquest } from "@/api/system/dict";

export interface DictValue {
  id: number; // 字典项id
  label: string; // 字典项标签
  value: string | number; // 字典项值
  remarks: string; // 备注
}

/** 查询字典数据
 * @param key 字典key
 * @param valueType 返回的数据类型（默认返回字符串）
 * @returns Array
 */
export function queryDict(
  key: string,
  valueType?: string,
): Promise<Array<DictValue>> {
  return new Promise(async (resolve) => {
    if (!key) {
      resolve([]);
      return;
    }

    try {
      const { data: response } = await queryDictValuesRquest(key);
      let rows = response.result || [];
      if (valueType) {
        for (let i = 0; i < rows.length; i++) {
          const item = rows[i];
          if (valueType == "number") {
            item.value = parseInt(item.value);
          }
        }
      }
      resolve(rows);
    } catch (error: any) {
      showToastFail(error.err_msg);
      resolve([]);
    }
  });
}

/** 获取字典项 */
export function getDict(
  dicts: Array<DictValue>,
  value: string | number,
): DictValue | null {
  for (let i = 0; i < dicts.length; i++) {
    const item = dicts[i];
    if (item.value == value) {
      return item;
    }
  }

  return null;
}

/** 根据value获取字典label */
export function getDictLabel(
  dicts: Array<DictValue>,
  value: any,
): string | null {
  if (!dicts) return "";

  for (let i = 0; i < dicts.length; i++) {
    const item = dicts[i];
    if (item.value == value) {
      return item.label;
    }
  }

  return null;
}
