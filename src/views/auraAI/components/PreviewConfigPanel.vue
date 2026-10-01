<template>
  <aside class="config-panel">
    <header><span class="step">01</span><div><h2>{{ kind === 'product' ? '商品套图配置' : '服饰套图配置' }}</h2><p>可调整本地预览选项，不会提交任务</p></div></header>
    <section><label>示例素材</label><button class="source" type="button" @click="requireFullEdition('上传创作素材', 'upload')"><img :src="sourceUrl" :alt="kind === 'product' ? '示例商品素材' : '示例服装素材'" /><span><el-icon><UploadFilled /></el-icon>上传新素材<small>完整版功能</small></span></button></section>
    <section v-if="kind === 'fashion'"><label>演示模特</label><div class="model-list"><button v-for="model in models" :key="model.name" :class="{ active: selectedModel === model.name }" @click="selectedModel = model.name"><img :src="model.url" :alt="model.name" /><span>{{ model.name }}</span></button></div></section>
    <section><label>生成模型</label><el-select v-model="model" style="width:100%"><el-option v-for="option in modelOptions" :key="option" :label="option" :value="option" /></el-select></section>
    <section><label>成片比例</label><div class="options"><button v-for="ratio in ratios" :key="ratio" :class="{ active: selectedRatio === ratio }" @click="selectedRatio = ratio">{{ ratio }}</button></div></section>
    <section><label>{{ kind === 'product' ? '视觉风格' : '场景方案' }}</label><div class="options"><button v-for="style in styles" :key="style" :class="{ active: selectedStyle === style }" @click="selectedStyle = style">{{ style }}</button></div></section>
    <section><div class="section-label"><label>创作描述</label><button @click="requireFullEdition('AI 帮写', 'generate')"><el-icon><MagicStick /></el-icon>AI 帮写</button></div><el-input v-model="prompt" type="textarea" :rows="3" resize="none" /></section>
    <div class="estimate"><span>演示估算</span><strong>{{ estimatedCost }} 算力 / {{ selectedRatio }}</strong></div>
    <el-button type="primary" size="large" class="generate" @click="requireFullEdition(kind === 'product' ? '生成商品套图' : '生成服饰套图', 'generate')"><el-icon><MagicStick /></el-icon>生成整套素材<small>完整版</small></el-button>
  </aside>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { previewAsset } from "../preview/assets";
import { useAuraPreviewGate } from "../preview/useAuraPreviewGate";
const props = defineProps<{ kind: "product" | "fashion" }>();
const { requireFullEdition } = useAuraPreviewGate();
const sourceUrl = computed(() => previewAsset(props.kind === "product" ? "product/source-1.svg" : "fashion/source-1.svg"));
const models = ["自然光模特", "轻奢棚拍", "都市街拍"].map((name, index) => ({ name, url: previewAsset(`models/model-${index + 1}.svg`) }));
const selectedModel = ref(models[0].name);
const modelOptions = computed(() => props.kind === "product" ? ["Aura Vision Pro", "Aura Studio", "Aura Render X"] : ["Aura Fashion Pro", "Aura Portrait X"]);
const model = ref(modelOptions.value[0]);
const ratios = ["1:1", "4:5", "3:4", "16:9"];
const selectedRatio = ref("4:5");
const styles = computed(() => props.kind === "product" ? ["轻奢质感", "自然生活", "未来科技", "东方美学"] : ["都市通勤", "度假松弛", "新中式", "街头潮流"]);
const selectedStyle = ref(styles.value[0]);
const prompt = ref(props.kind === "product" ? "柔和侧光，突出产品材质和品牌质感，画面干净高级。" : "自然姿态，真实面料纹理，统一人物与场景光线。" );
const estimatedCost = computed(() => selectedRatio.value === "16:9" ? 56 : 48);
</script>
<style lang="scss" scoped>
.config-panel { width: 330px; flex-shrink: 0; padding: 18px; border: 1px solid var(--ai-border); border-radius: var(--ai-radius); background: var(--ai-surface-solid); box-shadow: var(--ai-shadow); overflow-y: auto; > header { display: flex; gap: 10px; align-items: center; padding-bottom: 15px; border-bottom: 1px solid var(--ai-border); .step { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 10px; color: #fff; background: var(--ai-grad); font-size: 11px; font-weight: 700; } h2 { margin: 0; font-size: 15px; } p { margin: 3px 0 0; color: var(--ai-muted); font-size: 9px; } } section { margin-top: 16px; > label,.section-label label { display: block; margin-bottom: 7px; color: var(--ai-ink-soft); font-size: 11px; font-weight: 600; } }.source { display: grid; width: 100%; grid-template-columns: 82px 1fr; align-items: center; gap: 11px; padding: 8px; border: 1px dashed var(--ai-border-strong); border-radius: 12px; color: var(--ai-violet-deep); background: var(--ai-tint); cursor: pointer; img { width: 82px; height: 70px; border-radius: 9px; object-fit: cover; } > span { display: flex; align-items: center; justify-content: center; gap: 5px; flex-wrap: wrap; font-size: 11px; small { width: 100%; color: var(--ai-muted); font-size: 8px; } } }.model-list { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; button { overflow: hidden; padding: 3px; border: 1px solid var(--ai-border); border-radius: 9px; color: var(--ai-muted); background: #fff; cursor: pointer; img { width: 100%; aspect-ratio: 1; border-radius: 6px; object-fit: cover; } span { display: block; padding: 4px 0 2px; font-size: 8px; } &.active { color: var(--ai-violet-deep); border-color: var(--ai-violet); background: var(--ai-tint); } } }.options { display: flex; flex-wrap: wrap; gap: 6px; button { padding: 6px 9px; border: 1px solid var(--ai-border); border-radius: 8px; color: var(--ai-ink-soft); background: #fff; font-size: 9px; cursor: pointer; &.active { color: var(--ai-violet-deep); border-color: var(--ai-violet); background: var(--ai-tint); } } }.section-label { display: flex; align-items: center; justify-content: space-between; button { display: inline-flex; align-items: center; gap: 3px; border: 0; color: var(--ai-violet-deep); background: none; font-size: 9px; cursor: pointer; } }.estimate { display: flex; align-items: center; justify-content: space-between; margin: 17px 0 10px; padding: 10px; border-radius: 10px; color: var(--ai-muted); background: #f8f7fc; font-size: 9px; strong { color: var(--ai-ink); font-size: 10px; } }.generate { width: 100%; small { margin-left: 5px; padding: 2px 5px; border-radius: 6px; color: #fff; background: rgba(255,255,255,.18); font-size: 8px; } }
}
@media (max-width: 1000px) { .config-panel { width: 290px; } } @media (max-width: 760px) { .config-panel { width: 100%; max-height: none; } }
</style>
