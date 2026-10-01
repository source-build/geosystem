<template>
  <div class="ai-layout">
    <div class="ai-aurora" aria-hidden="true"><span class="blob violet"></span><span class="blob pink"></span></div>
    <AISidebar :collapsed="collapsed" :mobile-open="mobileOpen" @close="mobileOpen = false" />
    <button v-if="mobileOpen" class="mobile-mask" aria-label="关闭导航" @click="mobileOpen = false"></button>
    <section class="ai-main">
      <AIHeader
        :collapsed="collapsed"
        @toggle="toggleSidebar"
        @open-mobile="mobileOpen = true"
      />
      <main class="ai-content">
        <router-view v-slot="{ Component, route }">
          <transition name="ai-view" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </router-view>
      </main>
    </section>
    <f-contact />
  </div>
</template>

<script setup lang="ts" name="AuraLayout">
import { ref } from "vue";
import AIHeader from "./components/AIHeader.vue";
import AISidebar from "./components/AISidebar.vue";

const collapsed = ref(false);
const mobileOpen = ref(false);
const toggleSidebar = () => {
  if (window.matchMedia("(max-width: 820px)").matches) mobileOpen.value = !mobileOpen.value;
  else collapsed.value = !collapsed.value;
};
</script>

<style lang="scss" scoped>
.ai-layout {
  --ai-bg: #f6f7fb; --ai-surface: rgba(255,255,255,.88); --ai-surface-solid: #fff;
  --ai-border: rgba(124,58,237,.1); --ai-border-strong: rgba(124,58,237,.2);
  --ai-ink: #202237; --ai-ink-soft: #53566a; --ai-muted: #7b8094;
  --ai-violet: #8b5cf6; --ai-violet-deep: #6d28d9; --ai-pink: #ec4899; --ai-coral: #fb7185;
  --ai-grad: linear-gradient(135deg,#8b5cf6,#6d28d9); --ai-grad-pink: linear-gradient(135deg,#ec4899,#8b5cf6);
  --ai-tint: rgba(139,92,246,.06); --ai-tint-strong: rgba(139,92,246,.11); --ai-tint-pink: rgba(236,72,153,.08);
  --ai-shadow: 0 8px 26px rgba(31,34,51,.06); --ai-shadow-lg: 0 18px 44px rgba(31,34,51,.1);
  --ai-radius: 18px; --ai-radius-sm: 12px; --ai-sidebar-w: 232px; --ai-sidebar-w-collapsed: 76px; --ai-header-h: 64px;
  position: relative; display: flex; width: 100vw; height: 100vh; overflow: hidden;
  color: var(--ai-ink); background: var(--ai-bg); font-family: "PingFang SC","Microsoft YaHei",system-ui,sans-serif;
}
.ai-aurora { position: absolute; inset: 0; overflow: hidden; pointer-events: none; .blob { position: absolute; width: 540px; height: 540px; border-radius: 50%; filter: blur(100px); opacity: .13; } .violet { top: -220px; left: -180px; background: #8b5cf6; } .pink { right: -180px; bottom: -240px; background: #ec4899; } }
.ai-main { position: relative; z-index: 1; display: flex; flex: 1; min-width: 0; height: 100vh; flex-direction: column; }
.ai-content { flex: 1; min-height: 0; padding: 16px 20px 20px; overflow-x: hidden; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(139,92,246,.25) transparent; }
.mobile-mask { position: fixed; z-index: 8; inset: 0; display: none; border: 0; background: rgba(31,34,51,.38); }
.ai-view-enter-active,.ai-view-leave-active { transition: opacity .22s ease, transform .22s ease; }
.ai-view-enter-from { opacity: 0; transform: translateY(8px); } .ai-view-leave-to { opacity: 0; transform: translateY(-4px); }
@media (max-width: 820px) { .mobile-mask { display: block; } .ai-content { padding: 12px; } }
@media (prefers-reduced-motion: reduce) { .ai-view-enter-active,.ai-view-leave-active { transition: none; } }
</style>
