/**
 * 路由路径动态匹配工具
 * 用于将带动态参数的路由模式（如 /foo/:id）与实际浏览器路径进行匹配
 */

/** 判断路由模式是否包含动态参数 */
export function isDynamicPattern(pattern: string): boolean {
  return pattern.includes(":");
}

/**
 * 将路由模式转换为正则表达式
 * /admin/user/:id  =>  /^\/admin\/user\/[^/]+$/  (单段匹配)
 * /admin/:category/:id  =>  /^\/admin\/[^/]+\/[^/]+$/
 * /admin/:id/detail  =>  /^\/admin\/[^/]+\/detail$/
 */
function patternToRegex(pattern: string): RegExp {
  const escaped = pattern
    // 先转义正则特殊字符（注意 : 不能转义，因为它是动态参数标识）
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    // 将 \:xxx 替换回 :xxx（因为上面的转义不会影响 :，这里保险处理）
    .replace(/\\:/g, ":")
    // 将 :paramName 替换为通配符（匹配非 / 的一段或多段路径）
    // 支持 :param、:param+、:param* 等 vue-router 风格
    .replace(/:[a-zA-Z_][\w]*\+?/g, "[^/]+")
    // 支持 (:param)? 可选参数组
    .replace(/\(([^)]*)\)/g, "(?:$1)?");

  return new RegExp(`^${escaped}$`);
}

/**
 * 判断实际路径是否匹配路由模式
 * @param pattern 路由模式（如 /admin/user/:id）
 * @param path 实际路径（如 /admin/user/123）
 */
export function matchPath(pattern: string, path: string): boolean {
  const regex = patternToRegex(pattern);
  return regex.test(path);
}
