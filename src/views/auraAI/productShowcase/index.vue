<template>
  <div class="showcase-route-page">
    <AuraShowcaseShell title="AI 商品套图" :cases-count="casesCount" :works-count="productWorks.length" @refresh="refresh">
      <template #form><ShowcaseDemoForm /></template>
      <template #cases><PublicCaseGallery ref="casesRef" kind="product" @count="casesCount=$event" @open="openDetail" /></template>
      <template #works><DemoWorksGallery ref="worksRef" :items="productWorks" @open="openDetail" /></template>
    </AuraShowcaseShell>
    <ReadOnlyCaseDialog v-model="detailVisible" :item="selectedItem" />
  </div>
</template>
<script setup lang="ts" name="AuraProductShowcase">
import { ref } from "vue"; import AuraShowcaseShell from "../components/AuraShowcaseShell.vue"; import PublicCaseGallery from "../components/PublicCaseGallery.vue"; import DemoWorksGallery from "../components/DemoWorksGallery.vue"; import ReadOnlyCaseDialog from "../components/ReadOnlyCaseDialog.vue"; import ShowcaseDemoForm from "./components/ShowcaseDemoForm.vue"; import { productWorks } from "../preview/fixtures"; import type { AuraPreviewItem } from "../preview/types";
const casesCount=ref(0); const casesRef=ref<InstanceType<typeof PublicCaseGallery>>(); const worksRef=ref<InstanceType<typeof DemoWorksGallery>>(); const selectedItem=ref<AuraPreviewItem|null>(null); const detailVisible=ref(false); const openDetail=(item:AuraPreviewItem)=>{selectedItem.value=item;detailVisible.value=true}; const refresh=(tab:"cases"|"mine")=>tab==="cases"?casesRef.value?.refresh():worksRef.value?.refresh();
</script>

<style scoped>
.showcase-route-page { height: 100%; min-height: 0; }
@media (max-width: 900px) { .showcase-route-page { height: auto; min-height: 100%; } }
</style>
