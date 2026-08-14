/** 拼接url，使用场景，防止域名拼接错误，例如：域名结尾带/或path不是以/开头时候 */
export function joinUrl(domain: string, path: string) {
  const cleanDomain = domain.endsWith("/") ? domain.slice(0, -1) : domain;
  const p = path.startsWith("/") ? path.slice(1) : path;
  return `${cleanDomain}/${p}`;
}