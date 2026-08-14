import { useDark } from "@vueuse/core";
import { getDarkColor, getLightColor } from "./helpers";

/** Element Plus 主题色权重 */
const EL_PRIMARY_COLOR_WEIGHT: number[] = [300, 500, 700, 800, 900];

interface ThemeColor {
  primaryColor: string;
  successColor?: string;
  warningColor?: string;
  dangerColor?: string;
  errorColor?: string;
  infoColor?: string;
}

/** 加载默认主题颜色 */
export function loadDefaultThemeColor() {
  const themeColor = localStorage.getItem("themeColor");
  if (themeColor) {
    const themeColorObj = JSON.parse(themeColor);
    if (themeColorObj.primaryColor) {
      document.documentElement.style.setProperty(
        "--el-color-primary",
        themeColorObj.primaryColor
      );
    }
    if (themeColorObj.successColor) {
      document.documentElement.style.setProperty(
        "--el-color-success",
        themeColorObj.successColor
      );
    }
    if (themeColorObj.warningColor) {
      document.documentElement.style.setProperty(
        "--el-color-warning",
        themeColorObj.warningColor
      );
    }
    if (themeColorObj.dangerColor) {
      document.documentElement.style.setProperty(
        "--el-color-danger",
        themeColorObj.dangerColor
      );
    }
    if (themeColorObj.errorColor) {
      document.documentElement.style.setProperty(
        "--el-color-error",
        themeColorObj.errorColor
      );
    }
    if (themeColorObj.infoColor) {
      document.documentElement.style.setProperty(
        "--el-color-info",
        themeColorObj.infoColor
      );
    }
    setThemeDerivativeColor(themeColorObj);
  }
}

/** 设置主题颜色 */
export function setThemeColor(item: ThemeColor) {
  document.documentElement.style.setProperty(
    "--el-color-primary",
    item.primaryColor
  );
  if (item.successColor) {
    document.documentElement.style.setProperty(
      "--el-color-success",
      item.successColor
    );
  }
  if (item.warningColor) {
    document.documentElement.style.setProperty(
      "--el-color-warning",
      item.warningColor
    );
  }
  if (item.dangerColor) {
    document.documentElement.style.setProperty(
      "--el-color-danger",
      item.dangerColor
    );
  }
  if (item.errorColor) {
    document.documentElement.style.setProperty(
      "--el-color-error",
      item.errorColor
    );
  }
  if (item.infoColor) {
    document.documentElement.style.setProperty(
      "--el-color-info",
      item.infoColor
    );
  }
  const themeColor = localStorage.getItem("themeColor");
  if (themeColor) {
    const themeColorObj = JSON.parse(themeColor);
    if (item.primaryColor) {
      themeColorObj.primaryColor = item.primaryColor;
    }
    if (item.successColor) {
      themeColorObj.successColor = item.successColor;
    }
    if (item.warningColor) {
      themeColorObj.warningColor = item.warningColor;
    }
    if (item.dangerColor) {
      themeColorObj.dangerColor = item.dangerColor;
    }
    if (item.errorColor) {
      themeColorObj.errorColor = item.errorColor;
    }
    if (item.infoColor) {
      themeColorObj.infoColor = item.infoColor;
    }
    if (item.blackColor) {
      themeColorObj.blackColor = item.blackColor;
    }
    localStorage.setItem("themeColor", JSON.stringify(themeColorObj));
    setThemeDerivativeColor(themeColorObj);
  } else {
    localStorage.setItem("themeColor", JSON.stringify(item));
    setThemeDerivativeColor(item);
  }
}

/** 设置主题衍生颜色 */
export function setThemeDerivativeColor(item: ThemeColor) {
  if (item.primaryColor) {
    const vars = generateColorVariants(item.primaryColor, "primary");
    Object.keys(vars).forEach((key) => {
      document.documentElement.style.setProperty(key, vars[key]);
    });
  }
  if (item.successColor) {
    const vars = generateColorVariants(item.successColor, "success");
    Object.keys(vars).forEach((key) => {
      document.documentElement.style.setProperty(key, vars[key]);
    });
  }
  if (item.warningColor) {
    const vars = generateColorVariants(item.warningColor, "warning");
    Object.keys(vars).forEach((key) => {
      document.documentElement.style.setProperty(key, vars[key]);
    });
  }
  if (item.dangerColor) {
    const vars = generateColorVariants(item.dangerColor, "danger");
    Object.keys(vars).forEach((key) => {
      document.documentElement.style.setProperty(key, vars[key]);
    });
  }
  if (item.errorColor) {
    const vars = generateColorVariants(item.errorColor, "error");
    Object.keys(vars).forEach((key) => {
      document.documentElement.style.setProperty(key, vars[key]);
    });
  }
  if (item.infoColor) {
    const vars = generateColorVariants(item.infoColor, "info");
    Object.keys(vars).forEach((key) => {
      document.documentElement.style.setProperty(key, vars[key]);
    });
  }
}

/** 生成衍生颜色变量（基于 Element Plus 的 Sass 混合规则）*/
export function generateColorVariants(
  color: string,
  prefix: string,
  isDark?: boolean
): Record<string, string> {
  const variants: Record<string, string> = {};
  variants[`--el-color-${prefix}`] = color;
  variants[`--el-color-${prefix}-dark-2`] = getDarkColor(color, 0.2);
  for (const weight of EL_PRIMARY_COLOR_WEIGHT) {
    variants[`--el-color-${prefix}-light-${weight / 100}`] = getLightColor(
      color,
      weight / 1000,
      isDark
    );
  }

  return variants;
}

/** 初始化主题 */
export function initTheme(): void {
  loadDefaultThemeColor();
  updateThemeMode(useDark().value);
  watchDarkMode();
}

/** 监听暗黑模式变化 */
function watchDarkMode() {
  const isDark = useDark();
  watch(
    () => isDark.value,
    (newValue) => {
      updateThemeMode(newValue);
    }
  );
}

/** 更新主题模式 */
export function updateThemeMode(isDark: boolean) {
  // 暗黑模式
  if (isDark) {
    document.documentElement.style.setProperty("--layout-card-container-bg-color", "#0e1626");
    document.documentElement.style.setProperty("--layout-main-bg-color", "#141d31");
    document.documentElement.style.setProperty("--el-bg-color", "#0e1626");
    return
  } 
  
  // 浅色模式
  document.documentElement.style.setProperty("--layout-card-container-bg-color", "#fff");
  document.documentElement.style.setProperty("--layout-main-bg-color", "#f6f8fa");
  document.documentElement.style.removeProperty("--el-bg-color");
}