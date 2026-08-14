<template>
  <el-drawer v-model="visible" title="系统设置" show-close :with-header="false">
    <div class="drawer-content">
      <!-- 菜单栏设置 -->
      <div class="drawer-opt">
        <div class="drawer-header-title">菜单栏设置</div>
        <div class="menu-container">
          <div class="setting-item">
            <label class="setting-label">菜单栏类型</label>
            <div class="menu-layout-options">
              <div
                class="layout-option"
                :class="{
                  active: systemConf.menuType == 'left-horizontal',
                }"
                @click="handlerClick('left-horizontal')"
              >
                <div class="layout-icon">
                  <div class="normal-layout-preview">
                    <div class="normal-sidebar">
                      <div class="menu-item active"></div>
                      <div class="menu-item"></div>
                      <div class="menu-item"></div>
                    </div>
                    <div class="normal-content">
                      <div class="content-header"></div>
                      <div class="content-body">
                        <div class="content-line"></div>
                        <div class="content-line"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="layout-name">树形菜单</div>
              </div>

              <div
                class="layout-option"
                :class="{
                  active:
                    !systemConf.menuType ||
                    systemConf.menuType == 'left-submenu-horizontal',
                }"
                @click="handlerClick('left-submenu-horizontal')"
              >
                <div class="layout-icon">
                  <div class="two-column-layout-preview">
                    <div class="first-column">
                      <div class="menu-item active"></div>
                      <div class="menu-item"></div>
                    </div>
                    <div class="second-column">
                      <div class="sub-menu-item active"></div>
                      <div class="sub-menu-item"></div>
                      <div class="sub-menu-item"></div>
                    </div>
                    <div class="content-area">
                      <div class="content-header"></div>
                      <div class="content-body">
                        <div class="content-line"></div>
                        <div class="content-line"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="layout-name">多列菜单</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 主题设置 -->
      <div class="drawer-opt">
        <div class="drawer-header-title">主题设置</div>
        <div class="menu-container">
          <div class="setting-item">
            <label class="setting-label">主题选择</label>
            <div class="theme-options">
              <div
                class="item"
                v-for="item in defaultColorList"
                @click="handlerThemeChange(item)"
                :style="{ '--color': item.primaryColor }"
              >
                <div class="box"></div>
              </div>
              <el-color-picker
                @change="handlerCustomThemeColorChange"
                v-model="customThemeColor"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>
<script setup lang="ts">
import { saveCurrentConfigToStorage, systemConfig } from "@/hooks/config";
import { setThemeColor } from "@/theme";

const visible = defineModel("visible", {
  default: false,
});
const systemConf = systemConfig;
// 默认的主题列表
const defaultColorList = [
  {
    primaryColor: "#fc5e02",
    successColor: "#21ba45",
    warningColor: "#f2711c",
    dangerColor: "#db2828",
    errorColor: "#db2828",
    infoColor: "#909399",
  },
  {
    primaryColor: "#005eec",
    successColor: "#21ba45",
    warningColor: "#f2711c",
    dangerColor: "#db2828",
    errorColor: "#db2828",
    infoColor: "#909399",
  },
  {
    primaryColor: "#e74c3c",
    successColor: "#21ba45",
    warningColor: "#f2711c",
    dangerColor: "#db2828",
    errorColor: "#db2828",
    infoColor: "#909399",
  },
  {
    primaryColor: "#2ecc71",
    successColor: "#21ba45",
    warningColor: "#f2711c",
    dangerColor: "#db2828",
    errorColor: "#db2828",
    infoColor: "#909399",
  },
  {
    primaryColor: "#8e44ad",
    successColor: "#21ba45",
    warningColor: "#f2711c",
    dangerColor: "#db2828",
    errorColor: "#db2828",
    infoColor: "#909399",
  },
  {
    primaryColor: "#2c3e50",
    successColor: "#21ba45",
    warningColor: "#f2711c",
    dangerColor: "#db2828",
    errorColor: "#db2828",
    infoColor: "#909399",
  },
  {
    primaryColor: "#1abc9c",
    successColor: "#21ba45",
    warningColor: "#f2711c",
    dangerColor: "#db2828",
    errorColor: "#db2828",
    infoColor: "#909399",
  },
  {
    primaryColor: "#ffd32a",
    successColor: "#21ba45",
    warningColor: "#f2711c",
    dangerColor: "#db2828",
    errorColor: "#db2828",
    infoColor: "#909399",
  },
  {
    primaryColor: "#00d8d6",
    successColor: "#21ba45",
    warningColor: "#f2711c",
    dangerColor: "#db2828",
    errorColor: "#db2828",
    infoColor: "#909399",
  },
  {
    primaryColor: "#3c40c6",
    successColor: "#21ba45",
    warningColor: "#f2711c",
    dangerColor: "#db2828",
    errorColor: "#db2828",
    infoColor: "#909399",
  },
  {
    primaryColor: "#f53b57",
    successColor: "#21ba45",
    warningColor: "#f2711c",
    dangerColor: "#db2828",
    errorColor: "#db2828",
    infoColor: "#909399",
  },
  {
    primaryColor: "#3d3d3d",
    successColor: "#21ba45",
    warningColor: "#f2711c",
    dangerColor: "#db2828",
    errorColor: "#db2828",
    infoColor: "#909399",
  },
  {
    primaryColor: "#7d5fff",
    successColor: "#21ba45",
    warningColor: "#f2711c",
    dangerColor: "#db2828",
    errorColor: "#db2828",
    infoColor: "#909399",
  },
];
// 自定义主题颜色
const customThemeColor = ref("#005eec");

const handlerClick = (type: string) => {
  systemConf.menuType = type;
  systemConfig.menuType = type;
  saveCurrentConfigToStorage();
};
const handlerThemeChange = (item: any) => {
  setThemeColor(item);
};
const handlerCustomThemeColorChange = (val: string) => {
  setThemeColor({
    primaryColor: val,
  });
};
</script>
<style lang="scss" scoped>
.drawer-content {
  .drawer-opt {
    margin-bottom: 30px;

    .drawer-header-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 15px;
      color: #303133;
      margin-bottom: 20px;
    }

    .menu-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .setting-item {
      .setting-label {
        font-size: 14px;
        color: #606266;
        margin-bottom: 15px;
        display: block;
      }

      .theme-options {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        .item {
          --color: #409eff;
          width: 30px;
          height: 30px;
          border-radius: 4px;
          cursor: pointer;
          user-select: none;
          border: 1px solid transparent;
          padding: 2px;
          transition: all 0.2s;

          .box {
            width: 100%;
            height: 100%;
            background-color: var(--color);
            border-radius: 2px;
          }

          &:hover {
            opacity: 0.9;
            border-color: var(--color);
          }

          &:active {
            opacity: 0.7;
          }
        }
      }
    }

    .menu-layout-options {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .layout-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px 8px;
      border: 1.5px solid #e4e7ed;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      width: 110px;
      background: linear-gradient(145deg, #ffffff, #f8f9fa);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

      &:hover {
        border-color: var(--el-color-primary);
        box-shadow: 0 2px 8px rgba(252, 94, 2, 0.12);
        transform: translateY(-1px);
      }

      &.active {
        border-color: var(--el-color-primary);
        background: linear-gradient(145deg, #fff2ec, #fff5f0);
        box-shadow: 0 2px 8px rgba(252, 94, 2, 0.18);
      }

      .layout-icon {
        width: 60px;
        height: 40px;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .layout-name {
        font-size: 12px;
        color: #303133;
        font-weight: 500;
        text-align: center;
        line-height: 1.2;
      }
    }

    // 普通布局预览图样式
    .normal-layout-preview {
      display: flex;
      width: 54px;
      height: 32px;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      overflow: hidden;
      background-color: #fff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);

      .normal-sidebar {
        width: 16px;
        background: var(--el-color-primary);
        border-right: 1px solid #e4e7ed;
        padding: 4px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;

        .menu-item {
          width: 8px;
          height: 1.5px;
          background-color: rgba(255, 255, 255, 0.6);
          border-radius: 1px;
          transition: all 0.2s ease;

          &.active {
            background-color: #fff;
            width: 10px;
          }
        }
      }

      .normal-content {
        flex: 1;
        background-color: #fafafa;
        display: flex;
        flex-direction: column;

        .content-header {
          height: 6px;
          background: linear-gradient(90deg, #f0f0f0, #fafafa);
          border-bottom: 1px solid #e4e7ed;
        }

        .content-body {
          flex: 1;
          padding: 2px 3px;
          display: flex;
          flex-direction: column;
          gap: 2px;

          .content-line {
            height: 2px;
            background-color: #e0e0e0;
            border-radius: 1px;
          }
        }
      }
    }

    // 二级分类布局预览图样式
    .two-column-layout-preview {
      display: flex;
      width: 54px;
      height: 32px;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      overflow: hidden;
      background-color: #fff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);

      .first-column {
        width: 12px;
        background: var(--el-color-primary);
        border-right: 1px solid #e4e7ed;
        padding: 4px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;

        .menu-item {
          width: 8px;
          height: 1.5px;
          background-color: rgba(255, 255, 255, 0.6);
          border-radius: 1px;

          &.active {
            background-color: #fff;
            width: 10px;
          }
        }
      }

      .second-column {
        width: 14px;
        background: var(--el-color-primary);
        border-right: 1px solid #e4e7ed;
        padding: 4px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5px;

        .sub-menu-item {
          width: 10px;
          height: 1px;
          background-color: #fff;
          border-radius: 0.5px;

          &.active {
            background-color: #fff;
            width: 12px;
          }
        }
      }

      .content-area {
        flex: 1;
        background-color: #fafafa;
        display: flex;
        flex-direction: column;

        .content-header {
          height: 6px;
          background: linear-gradient(90deg, #f0f0f0, #fafafa);
          border-bottom: 1px solid #e4e7ed;
        }

        .content-body {
          flex: 1;
          padding: 2px 3px;
          display: flex;
          flex-direction: column;
          gap: 2px;

          .content-line {
            height: 2px;
            background-color: #e0e0e0;
            border-radius: 1px;
          }
        }
      }
    }
  }
}
</style>
