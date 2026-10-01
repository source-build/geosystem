<template>
  <div class="showcase">
    <slot name="form" />
    <section class="panel right">
      <div class="tabs" role="tablist" :aria-label="`${title}内容类型`">
        <button class="tab" role="tab" :aria-selected="tab === 'cases'" :class="{ on: tab === 'cases' }" @click="tab = 'cases'">创作案例<span class="tab-num">{{ casesCount }}</span></button>
        <button class="tab" role="tab" :aria-selected="tab === 'mine'" :class="{ on: tab === 'mine' }" @click="tab = 'mine'">我的作品<span class="tab-num">{{ worksCount }}</span></button>
        <button class="tab-refresh" type="button" title="刷新当前列表" aria-label="刷新当前列表" @click="emit('refresh', tab)"><el-icon><Refresh /></el-icon></button>
      </div>
      <div class="tab-content">
        <div class="tab-pane" :class="{ on: tab === 'cases' }"><slot name="cases" /></div>
        <div class="tab-pane" :class="{ on: tab === 'mine' }"><slot name="works" /></div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
defineProps<{ title: string; casesCount: number; worksCount: number }>();
const emit = defineEmits<{ (e: "refresh", tab: "cases" | "mine"): void }>();
const tab = ref<"cases" | "mine">("cases");
</script>

<style lang="scss" scoped>
.showcase{display:flex;gap:16px;height:100%;min-height:0}.panel{border:1px solid var(--ai-border);border-radius:var(--ai-radius);background:var(--ai-surface-solid);box-shadow:0 8px 28px rgba(76,29,149,.06)}.right{display:flex;min-width:0;flex:1;flex-direction:column;overflow:hidden}.tabs{display:flex;flex-shrink:0;gap:4px;padding:0 20px;border-bottom:1px solid var(--ai-border)}.tab{position:relative;display:flex;height:54px;align-items:center;gap:6px;margin-right:22px;padding:0 2px;border:0;color:var(--ai-muted);background:none;font-size:14.5px;font-weight:600;cursor:pointer;transition:color .2s}.tab-num{padding:1px 7px;border-radius:10px;color:var(--ai-muted);background:var(--ai-tint);font-size:11px;font-weight:700}.tab.on{color:var(--ai-violet-deep)}.tab.on .tab-num{color:var(--ai-violet-deep);background:var(--ai-tint-strong)}.tab.on::after{content:"";position:absolute;right:0;bottom:-1px;left:0;height:2.5px;border-radius:3px;background:linear-gradient(90deg,#8b5cf6,#7c3aed)}.tab-refresh{display:grid;width:32px;height:32px;align-self:center;place-items:center;margin-left:auto;border:1px solid var(--ai-border);border-radius:9px;color:var(--ai-ink-soft);background:#fff;cursor:pointer;transition:.3s}.tab-refresh:hover{transform:rotate(180deg);color:var(--ai-violet-deep);border-color:var(--ai-violet);background:var(--ai-tint)}.tab-content{position:relative;min-height:0;flex:1}.tab-pane{position:absolute;inset:0;padding:16px 20px 20px;overflow-y:auto;background:var(--ai-surface-solid);scrollbar-width:thin}.tab-pane.on{z-index:1}.tab-pane:not(.on){visibility:hidden;pointer-events:none}
@media(max-width:900px){.showcase{height:auto;min-height:100%;flex-direction:column}.right{min-height:680px}.tab-pane{position:absolute}}
@media(max-width:520px){.tabs{padding:0 12px}.tab{margin-right:10px;font-size:13px}.tab-pane{padding:12px}}
</style>
