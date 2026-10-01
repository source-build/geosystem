<template>
  <div class="works-gallery">
    <div class="demo-note"><el-icon><Lock /></el-icon>{{ DEMO_CONFIG.aura.publicGallery.worksNotice }}</div>
    <div class="grid"><article v-for="item in items" :key="item.id"><button class="cover" @click="emit('open', item)"><img :src="item.coverUrl" :alt="item.title" /><span>演示作品</span></button><div class="info"><h4>{{ item.title }}</h4><p>{{ item.category }} · {{ item.modelName }}</p><div><button @click="emit('open', item)">查看详情<el-icon><ArrowRight /></el-icon></button><button aria-label="分享作品" @click="requireFullEdition('分享作品', 'share')"><el-icon><Share /></el-icon></button><button aria-label="删除作品" @click="requireFullEdition('删除作品', 'delete')"><el-icon><Delete /></el-icon></button></div></div></article></div>
  </div>
</template>
<script setup lang="ts">
import { DEMO_CONFIG } from "@/config/demo";
import type { AuraPreviewItem } from "../preview/types";
import { useAuraPreviewGate } from "../preview/useAuraPreviewGate";
defineProps<{ items: AuraPreviewItem[] }>(); const emit=defineEmits<{(e:"open",item:AuraPreviewItem):void}>(); const {requireFullEdition}=useAuraPreviewGate();
function refresh(){showToastOk("已恢复本地演示快照")} defineExpose({refresh});
</script>
<style lang="scss" scoped>
.demo-note{display:flex;align-items:center;gap:6px;margin-bottom:14px;padding:9px 11px;border:1px solid var(--ai-border);border-radius:10px;color:var(--ai-muted);background:#faf9fc;font-size:11px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(245px,1fr));gap:16px}.grid article{overflow:hidden;border:1px solid var(--ai-border);border-radius:14px;background:#fff;box-shadow:0 5px 18px rgba(76,29,149,.05)}.cover{position:relative;display:block;width:100%;padding:0;border:0;background:#f3f1f7;cursor:pointer}.cover img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover}.cover span{position:absolute;top:9px;right:9px;padding:4px 7px;border-radius:7px;color:#fff;background:rgba(109,40,217,.82);font-size:9px}.info{padding:12px}.info h4{margin:0;font-size:14px}.info p{margin:5px 0 11px;color:var(--ai-muted);font-size:10px}.info>div{display:flex;gap:6px}.info button{display:grid;width:29px;height:29px;place-items:center;border:1px solid var(--ai-border);border-radius:8px;color:var(--ai-ink-soft);background:#fff;cursor:pointer}.info button:first-child{display:flex;width:auto;flex:1;align-items:center;justify-content:center;gap:3px;color:var(--ai-violet-deep);border-color:var(--ai-border-strong);background:var(--ai-tint);font-size:10px;font-weight:700}
</style>
