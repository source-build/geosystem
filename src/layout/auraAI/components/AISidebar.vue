<template>
  <aside class="ai-sidebar" :class="{ collapsed, 'mobile-open': mobileOpen }">
    <button class="brand" type="button" @click="go('/aura/workspace')">
      <img :src="logoSrc" alt="意境 AI" />
      <span class="brand-text"><strong>意境 <em>AI</em></strong><small>创作工坊</small></span>
    </button>
    <nav class="nav" aria-label="意境 AI 导航">
      <section v-for="section in AURA_MENU" :key="section.group" class="nav-section">
        <h2>{{ section.group }}</h2>
        <router-link
          v-for="item in section.items"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
          :title="collapsed ? item.title : undefined"
          @click="emit('close')"
        >
          <span class="indicator"></span>
          <f-svg-icon :name="item.icon" size="18px" :color="isActive(item.path) ? '#6d28d9' : '#53566a'" />
          <span class="label">{{ item.title }}</span>
          <span v-if="item.fullEdition" class="edition">完整版</span>
        </router-link>
      </section>
    </nav>
    <div class="upgrade" :class="{ mini: collapsed }">
      <el-icon><Lightning /></el-icon>
      <template v-if="!collapsed">
        <div><strong>解锁完整创作链路</strong><small>模型调用、上传、生成与商用导出</small></div>
        <button type="button" @click="requireFullEdition('意境 AI 完整版', 'generate')">获取完整版</button>
      </template>
    </div>
  </aside>
</template>

<script setup lang="ts" name="AuraSidebar">
import { useRoute, useRouter } from "vue-router";
import { AURA_MENU } from "@/views/auraAI/preview/menu";
import { previewAsset } from "@/views/auraAI/preview/assets";
import { useAuraPreviewGate } from "@/views/auraAI/preview/useAuraPreviewGate";

defineProps<{ collapsed: boolean; mobileOpen: boolean }>();
const emit = defineEmits<{ (e: "close"): void }>();
const route = useRoute();
const router = useRouter();
const logoSrc = previewAsset("aura-logo.svg");
const { requireFullEdition } = useAuraPreviewGate();
const isActive = (path: string) => path.includes("/preview/") ? route.path === path : route.path.startsWith(path);
const go = (path: string) => router.push(path);
</script>

<style lang="scss" scoped>
.ai-sidebar { position: relative; z-index: 4; display: flex; width: var(--ai-sidebar-w); height: 100vh; flex-shrink: 0; flex-direction: column; padding: 16px 13px; border-right: 1px solid var(--ai-border); background: var(--ai-surface); backdrop-filter: blur(24px); transition: width .28s ease, transform .28s ease; }
.ai-sidebar.collapsed { width: var(--ai-sidebar-w-collapsed); .brand-text,.nav-section h2,.label,.edition,.upgrade div,.upgrade button { display: none; } .brand { justify-content: center; padding-inline: 0; } .nav-item { justify-content: center; padding: 0; } }
.brand { display: flex; align-items: center; gap: 10px; width: 100%; padding: 3px 5px 17px; border: 0; color: inherit; background: none; text-align: left; cursor: pointer; img { width: 40px; height: 40px; flex-shrink: 0; border-radius: 12px; box-shadow: 0 5px 14px rgba(78,37,132,.18); } .brand-text { display: flex; min-width: 0; flex-direction: column; white-space: nowrap; } strong { font-size: 18px; } em { color: var(--ai-violet-deep); font-style: normal; } small { margin-top: 2px; color: var(--ai-muted); font-size: 10px; letter-spacing: 2px; } }
.nav { flex: 1; min-height: 0; overflow-y: auto; scrollbar-width: none; }
.nav-section { margin-top: 8px; h2 { margin: 0; padding: 9px 11px 6px; color: var(--ai-muted); font-size: 11px; font-weight: 600; letter-spacing: 1px; } }
.nav-item { position: relative; display: flex; height: 42px; align-items: center; gap: 11px; margin: 3px 0; padding: 0 11px; border-radius: 11px; color: var(--ai-ink-soft); font-size: 13px; text-decoration: none; transition: background .18s ease, color .18s ease; .indicator { position: absolute; left: 3px; width: 3px; height: 0; border-radius: 3px; background: var(--ai-violet-deep); transition: height .2s ease; } .label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .edition { margin-left: auto; padding: 2px 5px; border-radius: 8px; color: var(--ai-violet-deep); background: var(--ai-tint-strong); font-size: 9px; white-space: nowrap; } &:hover,&.active { color: var(--ai-violet-deep); background: var(--ai-tint-strong); } &.active .indicator { height: 17px; } }
.upgrade { display: flex; align-items: center; gap: 9px; margin-top: 12px; padding: 13px; border: 1px solid var(--ai-border); border-radius: 15px; background: #fff; box-shadow: var(--ai-shadow); > .el-icon { flex-shrink: 0; color: var(--ai-violet-deep); font-size: 20px; } div { display: flex; min-width: 0; flex: 1; flex-direction: column; } strong { font-size: 12px; } small { margin-top: 3px; color: var(--ai-muted); font-size: 9px; line-height: 1.4; } button { flex-shrink: 0; padding: 6px 8px; border: 0; border-radius: 8px; color: #fff; background: var(--ai-grad); font-size: 10px; cursor: pointer; } &.mini { justify-content: center; padding: 12px 0; } }
@media (max-width: 820px) { .ai-sidebar { position: fixed; z-index: 9; left: 0; top: 0; width: min(82vw, 272px); transform: translateX(-105%); box-shadow: var(--ai-shadow-lg); &.mobile-open { transform: translateX(0); } &.collapsed { width: min(82vw, 272px); .brand-text,.nav-section h2,.label,.edition,.upgrade div,.upgrade button { display: initial; } .brand,.nav-item { justify-content: flex-start; padding-inline: 11px; } } } }
@media (prefers-reduced-motion: reduce) { .ai-sidebar,.nav-item { transition: none; } }
</style>
