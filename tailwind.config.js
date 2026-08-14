/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    // 内边距
    padding: Array.from({ length: 1000 }).reduce((map, _, index) => {
      map[index] = `${index}px`;
      return map;
    }, {}),
    // 外边距
    spacing: Array.from({ length: 1000 }).reduce((map, _, index) => {
      map[index] = `${index}px`;
      return map;
    }, {}),
    // 圆角
    borderRadius: Array.from({ length: 100 }).reduce((map, _, index) => {
      map[index] = `${index}px`;
      return map;
    }, {}),
    extend: {
      // 宽度
      width: Array.from({ length: 1000 }).reduce((map, _, index) => {
        map[index] = `${index}px`;
        return map;
      }, {}),
      // 高度
      height: Array.from({ length: 1000 }).reduce((map, _, index) => {
        map[index] = `${index}px`;
        return map;
      }, {}),
      // 字体大小
      fontSize: Array.from({ length: 100 }).reduce((map, _, index) => {
        map[index] = `${index}px`;
        return map;
      }, {}),
      // 行高
      lineHeight: Array.from({ length: 1000 }).reduce((map, _, index) => {
        map[index] = `${index}px`;
        return map;
      }, {}),
      // 屏幕
      screens: {},
      // 颜色
      colors: {
        //主色
        primary: "#3b82f6",
        // 次要色
        secondary: "#10b981",
        // 警告色
        warning: "#f59e0b",
        // 危险色
        danger: "#ef4444",
        // 信息色
        info: "#6366f1",
        // 成功色
        success: "#10b981",
        // 深色（文本/背景）
        dark: "#1e293b",
        // 浅色（背景）
        light: "#f5f7fa",
        // 卡片背景色
        "card-bg": "#ffffff",
        // 浅色边框
        "border-light": "#e2e8f0",
        // 柔和文本色（灰）
        "text-muted": "#64748b",
      },
      // 字体
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 12px rgba(0, 0, 0, 0.05)",
        "card-hover": "0 8px 24px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};
