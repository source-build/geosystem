<template>
  <div class="works-page"><AuraPreviewBanner title="我的作品 · 演示快照" description="这里展示商品与服饰创作的本地示例；删除、分享、下载和再次创作不会在体验版执行。" /><section class="works-card"><header role="tablist" aria-label="作品类型"><button role="tab" :aria-selected="tab === 'product'" :class="{ active: tab === 'product' }" @click="tab = 'product'">商品套图<span>{{ productWorks.length }}</span></button><button role="tab" :aria-selected="tab === 'fashion'" :class="{ active: tab === 'fashion' }" @click="tab = 'fashion'">服饰套图<span>{{ fashionWorks.length }}</span></button><button class="refresh" aria-label="恢复演示快照" @click="refresh"><el-icon><Refresh /></el-icon></button></header><main><PreviewGallery :items="currentItems" @open="openDetail" /></main></section><PreviewDetailDialog v-model="detailVisible" :item="selectedItem" /></div>
</template>
<script setup lang="ts" name="AuraWorks">
import { computed, ref } from "vue";
import AuraPreviewBanner from "../components/AuraPreviewBanner.vue";
import PreviewGallery from "../components/PreviewGallery.vue";
import PreviewDetailDialog from "../components/PreviewDetailDialog.vue";
import { fashionWorks, productWorks } from "../preview/fixtures";
import type { AuraPreviewItem } from "../preview/types";
const tab = ref<"product" | "fashion">("product"); const selectedItem = ref<AuraPreviewItem | null>(null); const detailVisible = ref(false);
const currentItems = computed(() => tab.value === "product" ? productWorks : fashionWorks);
const openDetail = (item: AuraPreviewItem) => { selectedItem.value = item; detailVisible.value = true; };
const refresh = () => { tab.value = "product"; showToastOk("已恢复本地演示快照"); };
</script>
<style lang="scss" scoped>
.works-page { display: flex; min-height: 100%; flex-direction: column; gap: 14px; }.works-card { min-height: 620px; flex: 1; overflow: hidden; border: 1px solid var(--ai-border); border-radius: var(--ai-radius); background: #fff; box-shadow: var(--ai-shadow); > header { display: flex; align-items: center; padding: 0 18px; border-bottom: 1px solid var(--ai-border); > button { position: relative; display: inline-flex; height: 52px; align-items: center; gap: 6px; margin-right: 20px; padding: 0 2px; border: 0; color: var(--ai-muted); background: none; font-size: 12px; cursor: pointer; span { padding: 2px 6px; border-radius: 8px; background: var(--ai-tint); font-size: 9px; } &.active { color: var(--ai-violet-deep); font-weight: 700; &::after { content:""; position:absolute; right:0; bottom:-1px; left:0; height:2px; background:var(--ai-grad); } } } .refresh { display: grid; width:30px; height:30px; place-items:center; margin:0 0 0 auto; border:1px solid var(--ai-border); border-radius:8px; } } > main { padding: 16px 18px; } }
</style>
