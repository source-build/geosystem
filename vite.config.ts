import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import VueSetupExtend from "vite-plugin-vue-setup-extend";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import path from "path";
import { viteCommonjs } from "@originjs/vite-plugin-commonjs";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/adm/",
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // 移除console.log
        drop_debugger: true, // 移除debugger
      },
    },
  },
  resolve: {
    // 解决vite依赖解析问题(ringo/engine，由ali-oss依赖)
    dedupe: ["ringo/engine"],
    alias: {
      "~/": `${path.resolve(__dirname, "src")}/`,
      "@": path.resolve(__dirname, "src"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "~/styles/element/index.scss" as *;`,
        api: "modern-compiler",
        silenceDeprecations: ["legacy-js-api"],
      },
    },
  },
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver({ importStyle: "sass" })],
      imports: ["vue", "vue-router"],
      dirs: ["./src/components/f-toast/index.ts", "./src/utils/osd.ts"],
      dts: "./src/auto-imports.d.ts",
    }),
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: "sass",
        }),
      ],
    }),
    VueSetupExtend(),
    createSvgIconsPlugin({
      // 图标文件夹为src/assets/icons
      iconDirs: [path.resolve(process.cwd(), "src/assets/svg")],
      // 指定symbolId格式
      symbolId: "icon-[dir]-[name]",
    }),
    viteCommonjs(),
  ],
  server: {
    hmr: true,
    host: "127.0.0.1",
    port: 5555,
    proxy: {
      // 演示模式无需后端；接入真实后端时改为你的网关地址
      "/api": {
        target: "http://localhost:8000",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
