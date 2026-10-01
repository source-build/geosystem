<template>
  <article class="site-template-card" :style="{ '--template-color': template.color }">
    <div class="template-thumbnail">
      <div class="thumbnail-nav"><span class="thumbnail-logo">{{ template.name.slice(0, 1) }}</span><i></i><i></i><i></i></div>
      <div class="thumbnail-hero"><span>{{ typeLabel }}</span><strong>{{ template.name }}</strong><i></i><button type="button">{{ template.settings.contact_button_text }}</button></div>
      <div class="thumbnail-content"><span></span><span></span><span></span></div>
    </div>
    <div class="template-body">
      <div class="template-heading"><div><h3>{{ template.name }}</h3><span>{{ template.style }}</span></div><el-tag size="small" effect="plain">{{ template.blocks.length }} 个模块</el-tag></div>
      <p>{{ template.description }}</p>
      <div class="block-tags"><el-tag v-for="item in template.blocks" :key="item" size="small" effect="plain">{{ item }}</el-tag></div>
      <el-button type="primary" class="use-button" @click="emit('use', template)">以此模板创建<el-icon><ArrowRight /></el-icon></el-button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { SiteTemplate } from "@/views/biz/sitebuilder/siteTemplates";

const props = defineProps<{ template: SiteTemplate }>();
const emit = defineEmits<{ (event: "use", template: SiteTemplate): void }>();

/** 模板类型名称 */
const typeLabel = computed(() => ({ company: "企业官网", product: "产品落地页", solution: "解决方案" }[props.template.siteType]));
</script>

<style lang="scss" scoped>
.site-template-card { overflow: hidden; border: 1px solid var(--el-border-color-lighter); border-radius: 12px; background: var(--el-bg-color); box-shadow: var(--el-box-shadow-lighter); transition: border-color 0.2s ease, box-shadow 0.2s ease; }
.site-template-card:hover, .site-template-card:focus-within { border-color: var(--el-color-primary-light-5); box-shadow: var(--el-box-shadow); }
.template-thumbnail { min-height: 205px; padding: 16px 18px; background: linear-gradient(145deg, color-mix(in srgb, var(--template-color), var(--el-bg-color) 8%), color-mix(in srgb, var(--template-color), #0f172a 35%)); color: #fff; }
.thumbnail-nav { display: flex; align-items: center; gap: 8px; }
.thumbnail-logo { display: inline-flex; width: 26px; height: 26px; align-items: center; justify-content: center; margin-right: auto; border: 1px solid rgba(255,255,255,.42); border-radius: 8px; background: rgba(255,255,255,.14); font-size: 12px; font-weight: 700; }
.thumbnail-nav i { width: 18px; height: 4px; border-radius: 99px; background: rgba(255,255,255,.45); }
.thumbnail-hero { display: grid; gap: 9px; padding: 30px 2px 20px; }
.thumbnail-hero span { font-size: 12px; font-weight: 600; opacity: .82; }
.thumbnail-hero strong { font-size: 23px; letter-spacing: -.02em; }
.thumbnail-hero i { width: 68%; height: 5px; border-radius: 99px; background: rgba(255,255,255,.46); }
.thumbnail-hero button { width: max-content; margin-top: 4px; padding: 7px 10px; border: 0; border-radius: 6px; background: #fff; color: var(--template-color); font: inherit; font-size: 11px; font-weight: 700; }
.thumbnail-content { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.thumbnail-content span { height: 32px; border: 1px solid rgba(255,255,255,.2); border-radius: 5px; background: rgba(255,255,255,.13); }
.template-body { padding: 18px; }
.template-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.template-heading h3 { margin: 0; color: var(--el-text-color-primary); font-size: 18px; font-weight: 650; }
.template-heading span { display: block; margin-top: 5px; color: var(--el-text-color-secondary); font-size: 12px; }
.template-body p { min-height: 44px; margin: 14px 0; color: var(--el-text-color-secondary); font-size: 13px; line-height: 1.65; }
.block-tags { display: flex; min-height: 50px; flex-wrap: wrap; align-content: flex-start; gap: 6px; overflow: hidden; }
.use-button { width: 100%; margin-top: 16px; }
</style>
