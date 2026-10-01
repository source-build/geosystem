<template>
  <header class="ai-header">
    <div class="left">
      <button class="menu-toggle desktop-toggle" :aria-label="collapsed ? '展开导航' : '收起导航'" @click="emit('toggle')">
        <el-icon><Fold v-if="!collapsed" /><Expand v-else /></el-icon>
      </button>
      <button class="menu-toggle mobile-toggle" aria-label="打开导航" @click="emit('open-mobile')"><el-icon><Menu /></el-icon></button>
      <div class="title"><h1>{{ pageTitle }}</h1><p>用 AI 把内容洞察变成品牌视觉资产</p></div>
      <label class="search"><el-icon><Search /></el-icon><input v-model="keyword" aria-label="搜索预览内容" placeholder="搜索模板与作品…" @keyup.enter="onSearch" /><kbd>↵</kbd></label>
    </div>
    <div class="right">
      <button class="power" type="button" @click="go('/aura/compute')">
        <span class="power-icon"><el-icon><Lightning /></el-icon></span>
        <span><strong>{{ formattedBalance }}</strong><small>演示算力</small></span>
      </button>
      <button class="recharge" type="button" @click="requireFullEdition('算力充值', 'recharge')"><el-icon><Plus /></el-icon><span>充值</span></button>
      <el-popover placement="bottom-end" :width="330" trigger="click">
        <template #reference><button class="icon-btn" aria-label="查看演示通知"><el-icon><Bell /></el-icon><i></i></button></template>
        <div class="notice-panel"><header><strong>演示通知</strong><button @click="requireFullEdition('通知中心', 'share')">全部已读</button></header><article v-for="notice in auraNotices" :key="notice.id"><span :class="notice.tone"></span><div><strong>{{ notice.title }}</strong><p>{{ notice.description }}</p><small>{{ notice.time }}</small></div></article></div>
      </el-popover>
      <el-dropdown trigger="click" placement="bottom-end">
        <button class="user" type="button"><span class="avatar">体</span><span class="user-copy"><strong>{{ DEMO_CONFIG.aura.demoUser.name }}</strong><small>{{ DEMO_CONFIG.aura.demoUser.plan }}</small></span><el-icon><CaretBottom /></el-icon></button>
        <template #dropdown><el-dropdown-menu><el-dropdown-item @click="go('/aura/workspace')"><el-icon><HomeFilled /></el-icon>意境 AI 工作台</el-dropdown-item><el-dropdown-item @click="go('/admin/dashboard')"><el-icon><Back /></el-icon>返回 GEO 控制台</el-dropdown-item><el-dropdown-item divided @click="requireFullEdition('意境 AI 完整版', 'generate')"><el-icon><Promotion /></el-icon>获取完整版</el-dropdown-item></el-dropdown-menu></template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts" name="AuraHeader">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { DEMO_CONFIG } from "@/config/demo";
import { auraNotices } from "@/views/auraAI/preview/fixtures";
import { useAuraPreviewGate } from "@/views/auraAI/preview/useAuraPreviewGate";

defineProps<{ collapsed: boolean }>();
const emit = defineEmits<{ (e: "toggle"): void; (e: "open-mobile"): void }>();
const route = useRoute();
const router = useRouter();
const keyword = ref("");
const { requireFullEdition } = useAuraPreviewGate();
const pageTitle = computed(() => String(route.meta.title || "AI 创作工作台"));
const formattedBalance = computed(() => DEMO_CONFIG.aura.demoUser.balance.toLocaleString());
const go = (path: string) => router.push(path);
const onSearch = () => {
  if (!keyword.value.trim()) return;
  showToastOk(`已在本地演示内容中搜索“${keyword.value.trim()}”`);
};
</script>

<style lang="scss" scoped>
.ai-header { position: relative; z-index: 3; display: flex; min-height: var(--ai-header-h); align-items: center; justify-content: space-between; gap: 16px; padding: 0 22px; border-bottom: 1px solid var(--ai-border); background: var(--ai-surface); backdrop-filter: blur(24px); }
.left,.right { display: flex; align-items: center; gap: 12px; min-width: 0; }.right { flex-shrink: 0; }
.menu-toggle,.icon-btn,.recharge { display: grid; width: 38px; height: 38px; flex-shrink: 0; place-items: center; border: 1px solid var(--ai-border); border-radius: 11px; color: var(--ai-ink-soft); background: #fff; cursor: pointer; transition: .18s ease; &:hover { color: var(--ai-violet-deep); border-color: var(--ai-border-strong); background: var(--ai-tint); } }
.mobile-toggle { display: none; }.title { min-width: 0; h1 { margin: 0; font-size: 16px; line-height: 1.2; } p { margin: 3px 0 0; color: var(--ai-muted); font-size: 11px; white-space: nowrap; } }
.search { display: flex; width: 230px; height: 38px; align-items: center; gap: 7px; padding: 0 10px; border: 1px solid transparent; border-radius: 11px; color: var(--ai-muted); background: var(--ai-tint); &:focus-within { border-color: var(--ai-violet); background: #fff; box-shadow: 0 0 0 3px rgba(139,92,246,.1); } input { min-width: 0; flex: 1; border: 0; outline: 0; color: var(--ai-ink); background: transparent; font-size: 12px; } kbd { padding: 1px 5px; border-radius: 5px; color: var(--ai-violet-deep); background: #fff; font-size: 10px; } }
.power { display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 11px 0 6px; border: 1px solid var(--ai-border); border-radius: 20px; color: var(--ai-ink); background: #fff; cursor: pointer; .power-icon { display: grid; width: 28px; height: 28px; place-items: center; border-radius: 50%; color: #fff; background: var(--ai-grad-pink); } > span:last-child { display: flex; flex-direction: column; align-items: flex-start; } strong { font-size: 12px; } small { color: var(--ai-muted); font-size: 9px; } }
.recharge { display: inline-flex; width: auto; padding: 0 10px; gap: 3px; color: var(--ai-pink); background: var(--ai-tint-pink); font-size: 11px; }
.icon-btn { position: relative; i { position: absolute; top: 8px; right: 8px; width: 7px; height: 7px; border: 2px solid #fff; border-radius: 50%; background: var(--ai-pink); } }
.user { display: flex; height: 42px; align-items: center; gap: 7px; padding: 0 7px 0 4px; border: 0; border-radius: 12px; color: var(--ai-ink); background: transparent; cursor: pointer; &:hover { background: var(--ai-tint); } .avatar { display: grid; width: 32px; height: 32px; place-items: center; border-radius: 50%; color: #fff; background: var(--ai-grad); font-weight: 700; } .user-copy { display: flex; flex-direction: column; align-items: flex-start; } strong { font-size: 11px; } small { color: var(--ai-muted); font-size: 9px; } }
.notice-panel { header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid #eee; button { border: 0; color: #7c3aed; background: none; cursor: pointer; font-size: 11px; } } article { display: flex; gap: 10px; padding: 12px 0; border-bottom: 1px solid #f2f2f5; > span { width: 8px; height: 8px; flex-shrink: 0; margin-top: 5px; border-radius: 50%; &.violet { background: #8b5cf6; } &.pink { background: #ec4899; } &.coral { background: #fb7185; } } strong { font-size: 12px; } p { margin: 3px 0; color: #62677a; font-size: 11px; } small { color: #969bad; font-size: 10px; } } }
@media (max-width: 1080px) { .search { display: none; } .title p { display: none; } }
@media (max-width: 820px) { .ai-header { padding: 0 12px; } .desktop-toggle { display: none; } .mobile-toggle { display: grid; } .recharge,.user-copy,.user > .el-icon { display: none; } }
@media (max-width: 520px) { .power > span:last-child,.icon-btn { display: none; } .power { padding-right: 6px; } .title h1 { max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } }
</style>
