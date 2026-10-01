<template>
  <section class="editor-panel settings-panel" :class="{ collapsed }">
    <div class="panel-head" :class="{ clickable: disabled }" @click="toggleCollapsed">
      <h3>
        <el-icon v-if="disabled" class="collapse-caret" :class="{ open: !collapsed }"><CaretRight /></el-icon>
        网站设置
      </h3>
      <span v-if="disabled" class="plain-tag is-primary">全站配置 · 首页可编辑</span>
      <span v-else class="plain-tag">基础</span>
    </div>
    <el-form v-show="!collapsed" label-position="top" :disabled="disabled">
      <div v-if="disabled" class="lock-tip">
        <el-icon><WarningFilled /></el-icon>
        <span>网站设置为全站配置，请切回首页编辑</span>
      </div>
      <el-form-item label="项目名称">
        <el-input v-model="project.name" maxlength="100" :disabled="disabled" />
      </el-form-item>
      <div class="inline-items">
        <el-form-item label="品牌名称 / Logo 文案" class="grow-item">
          <el-input v-model="settings.logo_text" maxlength="60" :disabled="disabled" />
        </el-form-item>
        <el-form-item label="主题色">
          <el-color-picker
            v-model="siteSpec.theme.primary_color"
            :predefine="presetColors"
            :show-alpha="false"
            :disabled="disabled"
          />
        </el-form-item>
      </div>
      <el-form-item label="转化按钮文案">
        <el-input v-model="settings.contact_button_text" maxlength="30" :disabled="disabled" />
      </el-form-item>
      <el-form-item label="站点类型">
        <el-select v-model="project.site_type" :disabled="disabled">
          <el-option label="企业官网" value="company" />
          <el-option label="产品落地页" value="product" />
          <el-option label="解决方案" value="solution" />
        </el-select>
      </el-form-item>
      <el-form-item label="视觉风格">
        <el-select v-model="siteSpec.theme.style" placeholder="选择视觉风格" popper-class="site-style-dropdown" :disabled="disabled">
          <el-option v-for="item in styleOptions" :key="item.id" :label="item.label" :value="item.value">
            <div class="style-option">
              <span class="style-label">{{ item.label }}</span>
              <span v-if="item.remarks" class="style-remarks">{{ item.remarks }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="网站 Logo">
            <div
              v-if="settings.logo_image_key"
              class="site-image-thumb"
              :class="{ disabled }"
              title="点击重新选择"
              @click="!disabled && openImagePicker('logo_image_key')"
            >
              <el-image :src="mediaPreviewUrls[settings.logo_image_key]" fit="contain" />
              <button v-if="!disabled" type="button" class="thumb-remove" aria-label="移除Logo" @click.stop="settings.logo_image_key = ''">
                <el-icon><Close /></el-icon>
              </button>
            </div>
            <div
              v-else
              class="site-image-thumb is-empty"
              :class="{ disabled }"
              @click="!disabled && openImagePicker('logo_image_key')"
            >
              <el-icon><Plus /></el-icon>
              <span>选择 Logo</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="站点图标">
            <div
              v-if="settings.favicon_key"
              class="site-image-thumb is-favicon"
              :class="{ disabled }"
              title="点击重新选择"
              @click="!disabled && openImagePicker('favicon_key')"
            >
              <el-image :src="mediaPreviewUrls[settings.favicon_key]" fit="contain" />
              <button v-if="!disabled" type="button" class="thumb-remove" aria-label="移除图标" @click.stop="settings.favicon_key = ''">
                <el-icon><Close /></el-icon>
              </button>
            </div>
            <div
              v-else
              class="site-image-thumb is-empty is-favicon"
              :class="{ disabled }"
              @click="!disabled && openImagePicker('favicon_key')"
            >
              <el-icon><Plus /></el-icon>
              <span>选择图标</span>
            </div>
            <span class="field-hint">浏览器标签页图标</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="SEO 标题">
        <el-input v-model="settings.seo_title" maxlength="100" placeholder="留空则使用项目名称" :disabled="disabled" />
      </el-form-item>
      <el-form-item label="SEO 描述">
        <el-input
          v-model="settings.seo_description"
          type="textarea"
          :rows="2"
          maxlength="255"
          show-word-limit
          placeholder="留空则构建时根据首屏内容自动生成"
          :disabled="disabled"
        />
      </el-form-item>
    </el-form>

  </section>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useDemoGate } from "@/composables/useDemoGate";
import type { SiteProject, SiteSpec } from "@/views/biz/sitebuilder/types";
import type { EditorSettings } from "../types";

const props = defineProps<{ project: SiteProject; settings: EditorSettings; siteSpec: SiteSpec; disabled?: boolean }>();
const { requireFullEdition } = useDemoGate("sitebuilder");
const mediaPreviewUrls = ref<Record<string, string>>({});
const styleOptions = ref([
  { id: 1, label: "商务简约", value: "商务简约", remarks: "本地演示选项" },
  { id: 2, label: "现代科技", value: "现代科技", remarks: "本地演示选项" },
  { id: 3, label: "专业可信", value: "专业可信", remarks: "本地演示选项" },
]);
const presetColors = ["#2563eb", "#7c3aed", "#0d9488", "#dc2626", "#d97706", "#0f172a"];
const collapsed = ref(false);

const toggleCollapsed = () => {
  if (props.disabled) collapsed.value = !collapsed.value;
};

/** 云素材能力在打开选择器前拦截，不加载正式云空间组件。 */
const openImagePicker = async (_field: "logo_image_key" | "favicon_key") => {
  await requireFullEdition("选择云素材", "media");
};

watch(() => props.disabled, (disabled) => { collapsed.value = disabled; }, { immediate: true });
watch(
  () => [props.project.media_preview_urls, props.project.logo_image_key, props.project.logo_image_url, props.project.favicon_key, props.project.favicon_url] as const,
  ([urls, logoKey, logoUrl, faviconKey, faviconUrl]) => {
    if (urls) Object.assign(mediaPreviewUrls.value, urls);
    if (logoKey && logoUrl) mediaPreviewUrls.value[logoKey] = logoUrl;
    if (faviconKey && faviconUrl) mediaPreviewUrls.value[faviconKey] = faviconUrl;
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.editor-panel {
  border-radius: 16px;
  background: var(--el-bg-color);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.settings-panel {
  padding: 16px;

  &.collapsed .panel-head {
    margin-bottom: 0;
  }

  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    &.clickable {
      cursor: pointer;
    }

    h3 {
      display: flex;
      align-items: center;
      gap: 7px;
      margin: 0;
      color: var(--el-text-color-primary);
      font-size: 14px;
      font-weight: 650;

      &::before {
        width: 8px;
        height: 8px;
        border-radius: 3px;
        background: var(--el-color-primary);
        content: "";
      }

      .collapse-caret {
        color: var(--el-text-color-secondary);
        font-size: 12px;
        transition: transform 0.18s ease;

        &.open {
          transform: rotate(90deg);
        }
      }
    }
  }

  .plain-tag {
    padding: 2px 8px;
    border-radius: 99px;
    background: var(--el-fill-color);
    color: var(--el-text-color-secondary);
    font-size: 11px;
    line-height: 16px;

    &.is-primary {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }
  }

  .site-image-thumb {
    position: relative;
    display: flex;
    width: 100%;
    height: 56px;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 0 0 1px var(--el-border-color-lighter) inset;
    overflow: hidden;
    cursor: pointer;

    &.is-favicon {
      width: 56px;
      height: 56px;
      flex: 0 0 56px;

      .el-image {
        padding: 8px;
      }
    }

    &.disabled {
      cursor: not-allowed;
    }

    .el-image {
      display: block;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      padding: 6px;
    }

    :deep(.el-image__inner) {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    &.is-empty {
      flex-direction: column;
      gap: 3px;
      box-shadow: none;
      border: 1px dashed var(--el-border-color);
      color: var(--el-text-color-secondary);
      font-size: 10px;
      line-height: 1;

      .el-icon {
        font-size: 14px;
        line-height: 1;
      }

      span {
        line-height: 1;
      }

      &:not(.disabled):hover {
        border-color: var(--el-color-primary);
        color: var(--el-color-primary);
      }
    }

    .thumb-remove {
      position: absolute;
      top: 1px;
      right: 1px;
      z-index: 2;
      display: grid;
      width: 15px;
      height: 15px;
      place-items: center;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: rgb(15 23 42 / 72%);
      color: #fff;
      font-size: 10px;
      cursor: pointer;
    }
  }

  .field-hint {
    display: block;
    margin-top: 4px;
    color: var(--el-text-color-secondary);
    font-size: 11px;
    line-height: 16px;
  }

  .lock-tip {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 12px;
    padding: 5px 8px;
    border-radius: 6px;
    background: var(--el-color-warning-light-9);
    color: var(--el-color-warning);
    font-size: 11px;
    line-height: 15px;

    .el-icon {
      flex: 0 0 auto;
      font-size: 13px;
    }
  }

  .inline-items {
    display: flex;
    align-items: flex-start;
    gap: 12px;

    .grow-item {
      flex: 1;
      min-width: 0;
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 13px;
  }

  :deep(.el-form-item__label) {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  :deep(.el-select) {
    width: 100%;
  }
}
</style>

<style lang="scss">
// 下拉浮层挂在 body 下,需用 popper-class 全局定制
.site-style-dropdown {
  .el-select-dropdown__item {
    height: auto;
    padding: 8px 32px 8px 12px;
    line-height: 1.4;
  }

  .style-option {
    display: grid;
    gap: 2px;

    .style-label {
      color: var(--el-text-color-primary);
      font-size: 13px;
    }

    .style-remarks {
      color: var(--el-text-color-secondary);
      font-size: 11px;
      line-height: 1.5;
    }
  }

  .el-select-dropdown__item.is-selected .style-label {
    color: var(--el-color-primary);
    font-weight: 600;
  }
}
</style>
