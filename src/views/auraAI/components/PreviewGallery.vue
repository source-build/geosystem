<template>
  <div class="gallery-wrap">
    <div class="gallery-tools">
      <div class="chips"><button v-for="category in categories" :key="category" :class="{ active: activeCategory === category }" @click="activeCategory = category">{{ category }}</button></div>
      <span>{{ filteredItems.length }} 个演示项目</span>
    </div>
    <div v-if="filteredItems.length" class="gallery">
      <article v-for="item in filteredItems" :key="item.id" class="card" tabindex="0" @click="emit('open', item)" @keyup.enter="emit('open', item)">
        <div class="cover"><img :src="item.coverUrl" :alt="item.title" loading="lazy" /><span class="status" :class="item.status">{{ statusLabel[item.status] }}</span><div class="hover-actions"><button aria-label="查看详情" @click.stop="emit('open', item)"><el-icon><ZoomIn /></el-icon></button><button aria-label="使用同款" @click.stop="locked('使用同款', 'useTemplate')"><el-icon><MagicStick /></el-icon></button></div></div>
        <div class="meta"><strong>{{ item.title }}</strong><p>{{ item.category }} · {{ item.modelName }}</p><div><span>{{ item.createdAt }}</span><span v-if="item.likes"><el-icon><Star /></el-icon>{{ item.likes }}</span></div></div>
      </article>
    </div>
    <el-empty v-else description="当前筛选下暂无演示内容" />
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import type { AuraPreviewItem } from "../preview/types";
import { useAuraPreviewGate } from "../preview/useAuraPreviewGate";
const props = defineProps<{ items: AuraPreviewItem[] }>();
const emit = defineEmits<{ (e: "open", item: AuraPreviewItem): void }>();
const { requireFullEdition } = useAuraPreviewGate();
const activeCategory = ref("全部");
const categories = computed(() => ["全部", ...Array.from(new Set(props.items.map((item) => item.category)))]);
const filteredItems = computed(() => activeCategory.value === "全部" ? props.items : props.items.filter((item) => item.category === activeCategory.value));
const statusLabel = { success: "已完成", partial: "部分完成", processing: "演示处理中", failed: "失败" };
const locked = (name: string, action: "useTemplate") => requireFullEdition(name, action);
</script>
<style lang="scss" scoped>
.gallery-wrap { min-height: 0; }.gallery-tools { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; > span { flex-shrink: 0; color: var(--ai-muted); font-size: 10px; } }.chips { display: flex; gap: 7px; overflow-x: auto; button { flex-shrink: 0; padding: 6px 10px; border: 1px solid var(--ai-border); border-radius: 16px; color: var(--ai-ink-soft); background: #fff; font-size: 10px; cursor: pointer; &.active { color: var(--ai-violet-deep); border-color: var(--ai-border-strong); background: var(--ai-tint-strong); } } }
.gallery { display: grid; grid-template-columns: repeat(auto-fill,minmax(190px,1fr)); gap: 14px; }.card { min-width: 0; overflow: hidden; border: 1px solid var(--ai-border); border-radius: 14px; outline: none; background: #fff; cursor: pointer; box-shadow: 0 5px 18px rgba(31,34,51,.04); transition: border-color .2s, transform .2s, box-shadow .2s; &:hover,&:focus-visible { border-color: var(--ai-border-strong); box-shadow: var(--ai-shadow); transform: translateY(-2px); .hover-actions { opacity: 1; } } }.cover { position: relative; aspect-ratio: 4/3; overflow: hidden; background: var(--ai-tint); img { width: 100%; height: 100%; object-fit: cover; } }.status { position: absolute; top: 8px; left: 8px; padding: 3px 7px; border-radius: 9px; color: #fff; background: #10b981; font-size: 9px; &.partial { background: #f59e0b; } &.processing { background: #8b5cf6; } &.failed { background: #ef4444; } }.hover-actions { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 8px; opacity: 0; background: rgba(31,34,51,.25); transition: opacity .2s; button { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid rgba(255,255,255,.5); border-radius: 50%; color: #fff; background: rgba(255,255,255,.18); cursor: pointer; backdrop-filter: blur(8px); } }.meta { padding: 11px; strong { display: block; overflow: hidden; color: var(--ai-ink); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; } p { margin: 4px 0 9px; color: var(--ai-muted); font-size: 10px; } > div { display: flex; align-items: center; justify-content: space-between; color: var(--ai-muted); font-size: 9px; span { display: inline-flex; align-items: center; gap: 2px; } } }
@media (max-width: 520px) { .gallery { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 9px; }.meta { padding: 9px; } }
</style>
