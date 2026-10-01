<template>
  <div class="showcase-page">
    <AuraPreviewBanner :title="pageTitle" :description="description" />
    <div class="showcase-body">
      <PreviewConfigPanel :kind="kind" />
      <section class="gallery-panel">
        <header class="tabs" role="tablist" :aria-label="`${pageTitle}内容类型`"><button role="tab" :aria-selected="tab === 'cases'" :class="{ active: tab === 'cases' }" @click="tab = 'cases'">创作案例<span>{{ cases.length }}</span></button><button role="tab" :aria-selected="tab === 'works'" :class="{ active: tab === 'works' }" @click="tab = 'works'">我的作品<span>{{ works.length }}</span></button><button class="refresh" aria-label="恢复演示快照" @click="refresh"><el-icon><Refresh /></el-icon></button></header>
        <div class="gallery-content"><PreviewGallery :items="tab === 'cases' ? cases : works" @open="openDetail" /></div>
      </section>
    </div>
    <PreviewDetailDialog v-model="detailVisible" :item="selectedItem" />
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import type { AuraPreviewItem } from "../preview/types";
import { fashionCases, fashionWorks, productCases, productWorks } from "../preview/fixtures";
import AuraPreviewBanner from "./AuraPreviewBanner.vue";
import PreviewConfigPanel from "./PreviewConfigPanel.vue";
import PreviewGallery from "./PreviewGallery.vue";
import PreviewDetailDialog from "./PreviewDetailDialog.vue";
const props = defineProps<{ kind: "product" | "fashion" }>();
const tab = ref<"cases" | "works">("cases"); const selectedItem = ref<AuraPreviewItem | null>(null); const detailVisible = ref(false);
const pageTitle = computed(() => props.kind === "product" ? "AI 商品套图 · 完整版预览" : "AI 服饰套图 · 完整版预览");
const description = computed(() => props.kind === "product" ? "浏览商品首屏、白底、场景与细节图的完整套图结构；生成和上传能力在完整版开放。" : "浏览虚拟模特、棚拍 Lookbook 与多场景内容图；模型调用和素材上传在完整版开放。");
const cases = computed(() => props.kind === "product" ? productCases : fashionCases); const works = computed(() => props.kind === "product" ? productWorks : fashionWorks);
const openDetail = (item: AuraPreviewItem) => { selectedItem.value = item; detailVisible.value = true; };
const refresh = () => { tab.value = "cases"; showToastOk("已恢复本地演示快照"); };
</script>
<style lang="scss" scoped>
.showcase-page { display: flex; min-height: 100%; flex-direction: column; gap: 14px; }.showcase-body { display: flex; min-height: 620px; flex: 1; gap: 14px; }.gallery-panel { display: flex; min-width: 0; flex: 1; flex-direction: column; overflow: hidden; border: 1px solid var(--ai-border); border-radius: var(--ai-radius); background: var(--ai-surface-solid); box-shadow: var(--ai-shadow); }.tabs { display: flex; flex-shrink: 0; align-items: center; padding: 0 17px; border-bottom: 1px solid var(--ai-border); > button { position: relative; display: inline-flex; height: 52px; align-items: center; gap: 6px; margin-right: 20px; padding: 0 2px; border: 0; color: var(--ai-muted); background: none; font-size: 12px; font-weight: 600; cursor: pointer; span { padding: 2px 6px; border-radius: 8px; background: var(--ai-tint); font-size: 9px; } &.active { color: var(--ai-violet-deep); &::after { content: ""; position: absolute; right: 0; bottom: -1px; left: 0; height: 2px; border-radius: 2px; background: var(--ai-grad); } } } .refresh { display: grid; width: 30px; height: 30px; place-items: center; margin: 0 0 0 auto; border: 1px solid var(--ai-border); border-radius: 8px; background: #fff; } }.gallery-content { flex: 1; min-height: 0; padding: 15px 17px; overflow-y: auto; }
@media (max-width: 760px) { .showcase-body { min-height: 0; flex-direction: column; }.gallery-panel { min-height: 620px; } }
</style>
