<template>
  <el-dialog :model-value="modelValue" width="min(920px, 92vw)" destroy-on-close append-to-body class="aura-detail-dialog" @update:model-value="emit('update:modelValue', $event)">
    <template #header><div class="dialog-title"><span>演示作品详情</span><small>本地脱敏快照</small></div></template>
    <template v-if="item">
      <div class="summary"><img :src="item.sourceUrls[0]" :alt="`${item.title} 原始示例`" /><div><h2>{{ item.title }}</h2><p>{{ item.category }} · {{ item.modelName }}</p><div class="tags"><span v-for="tag in item.tags" :key="tag">{{ tag }}</span></div><dl><div><dt>状态</dt><dd>{{ statusLabel[item.status] }}</dd></div><div><dt>演示消耗</dt><dd>{{ item.cost }} 算力</dd></div><div><dt>生成时间</dt><dd>{{ item.createdAt }}</dd></div></dl></div></div>
      <section v-for="section in item.sections" :key="section.id" class="section"><header><div><h3>{{ section.name }}</h3><p>{{ section.description }}</p></div><span>{{ section.quantity }} 张 · {{ section.ratio }} · {{ section.resolution }}</span></header><div class="images"><button v-for="(img, index) in section.images" :key="img.id" type="button" @click="openViewer(section.images.map((row) => row.url), index)"><img :src="img.url" :alt="img.label" /><span>{{ img.label }}</span></button></div></section>
    </template>
    <template #footer><div class="footer-actions"><el-button @click="emit('update:modelValue', false)">继续浏览</el-button><el-button @click="requireFullEdition('下载整套素材', 'download')">下载全部</el-button><el-button type="primary" @click="requireFullEdition('一键做同款', 'useTemplate')">一键做同款</el-button></div></template>
    <el-image-viewer v-if="viewerVisible" :url-list="viewerUrls" :initial-index="viewerIndex" hide-on-click-modal teleported @close="viewerVisible = false" />
  </el-dialog>
</template>
<script setup lang="ts">
import { ref } from "vue";
import type { AuraPreviewItem } from "../preview/types";
import { useAuraPreviewGate } from "../preview/useAuraPreviewGate";
defineProps<{ modelValue: boolean; item?: AuraPreviewItem | null }>();
const emit = defineEmits<{ (e: "update:modelValue", value: boolean): void }>();
const { requireFullEdition } = useAuraPreviewGate();
const statusLabel = { success: "已完成", partial: "部分完成", processing: "演示处理中", failed: "失败" };
const viewerVisible = ref(false); const viewerUrls = ref<string[]>([]); const viewerIndex = ref(0);
const openViewer = (urls: string[], index: number) => { viewerUrls.value = urls; viewerIndex.value = index; viewerVisible.value = true; };
</script>
<style lang="scss" scoped>
.dialog-title { display: flex; align-items: center; gap: 9px; font-weight: 700; small { padding: 3px 7px; border-radius: 9px; color: #7c3aed; background: #f3e8ff; font-size: 9px; } }.summary { display: grid; grid-template-columns: 150px 1fr; gap: 18px; padding: 15px; border-radius: 14px; background: #f8f7fc; > img { width: 150px; height: 150px; border-radius: 12px; object-fit: cover; } h2 { margin: 4px 0 6px; font-size: 18px; } p { margin: 0; color: #74788b; font-size: 11px; } }.tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0; span { padding: 4px 7px; border-radius: 9px; color: #6d28d9; background: #ede9fe; font-size: 9px; } }dl { display: flex; flex-wrap: wrap; gap: 18px; margin: 0; div { display: flex; flex-direction: column; gap: 3px; } dt { color: #8a8fa3; font-size: 9px; } dd { margin: 0; color: #353849; font-size: 11px; } }.section { margin-top: 20px; > header { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; margin-bottom: 10px; h3 { margin: 0; font-size: 14px; } p { margin: 3px 0 0; color: #8a8fa3; font-size: 10px; } > span { color: #8a8fa3; font-size: 9px; } } }.images { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; button { position: relative; overflow: hidden; padding: 0; border: 0; border-radius: 12px; background: #f4f2f8; cursor: zoom-in; img { display: block; width: 100%; aspect-ratio: 4/3; object-fit: cover; } span { position: absolute; left: 8px; bottom: 8px; padding: 4px 7px; border-radius: 7px; color: #fff; background: rgba(31,34,51,.55); font-size: 9px; } } }.footer-actions { display: flex; justify-content: flex-end; gap: 8px; }
@media (max-width: 600px) { .summary { grid-template-columns: 1fr; > img { width: 100%; height: auto; aspect-ratio: 4/3; } }.images { grid-template-columns: 1fr; }.section > header { align-items: flex-start; flex-direction: column; }.footer-actions { flex-wrap: wrap; :deep(.el-button) { flex: 1; margin: 0; } } }
</style>
