<template><div class="preview-banner"><span class="icon"><el-icon><Lock /></el-icon></span><div><strong>{{ title }}</strong><p>{{ description }}</p></div><button type="button" @click="requireFullEdition(title, 'generate')">{{ DEMO_CONFIG.cta.getFullEdition }}</button></div></template>
<script setup lang="ts">
import { DEMO_CONFIG } from "@/config/demo";
import { useAuraPreviewGate } from "../preview/useAuraPreviewGate";
defineProps<{ title: string; description: string }>();
const { requireFullEdition } = useAuraPreviewGate();
</script>
<style lang="scss" scoped>
.preview-banner { display: flex; align-items: center; gap: 12px; padding: 13px 16px; border: 1px solid rgba(124,58,237,.13); border-radius: 14px; background: linear-gradient(110deg,rgba(245,243,255,.95),rgba(253,242,248,.9)); .icon { display: grid; width: 34px; height: 34px; flex-shrink: 0; place-items: center; border-radius: 10px; color: #fff; background: var(--ai-grad); } div { min-width: 0; flex: 1; } strong { color: var(--ai-ink); font-size: 13px; } p { margin: 3px 0 0; color: var(--ai-muted); font-size: 11px; line-height: 1.5; } button { flex-shrink: 0; padding: 8px 13px; border: 0; border-radius: 9px; color: #fff; background: var(--ai-grad); font-size: 11px; cursor: pointer; } }
@media (max-width: 600px) { .preview-banner { align-items: flex-start; flex-wrap: wrap; button { width: 100%; } } }
</style>
