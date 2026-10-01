<template>
  <div class="case-gallery">
    <div class="toolbar">
      <div class="cats"><button v-for="item in categories" :key="item" :class="{ on: category === item }" @click="switchCategory(item)">{{ item }}</button></div>
      <span class="count">共 {{ total }} 套案例</span>
    </div>
    <div v-if="sourceMessage" class="source-notice"><el-icon><InfoFilled /></el-icon>{{ sourceMessage }}</div>
    <div v-if="items.length" class="masonry">
      <article v-for="item in items" :key="item.id" class="showcase-card">
        <button class="cover" type="button" @click="emit('open', item)">
          <img :src="activeImage(item)" :alt="item.title" loading="lazy" />
          <span v-if="item.sourceUrls[0]" class="src-thumb"><img :src="item.sourceUrls[0]" alt="案例原始素材" /><em>{{ kind === 'product' ? '原图' : '服装图' }}</em></span>
          <span class="corner-tag"><el-icon><PictureFilled /></el-icon>{{ imageCount(item) }} 张{{ kind === 'product' ? '套图' : '成片' }}</span>
          <span class="cover-hover"><el-icon><ZoomIn /></el-icon>查看详情</span>
        </button>
        <div class="card-info">
          <h4>{{ item.title }}</h4>
          <div class="meta"><span class="model-chip">{{ item.modelName }}</span><span class="meta-chip">{{ item.category }}</span></div>
          <div class="case-foot">
            <div class="case-stats"><button type="button" @click="requireFullEdition('案例点赞', 'share')"><f-svg-icon name="like" size="14px" color="#8a8fa3" />{{ item.likes }}</button><span><f-svg-icon name="browse" size="14px" color="#8a8fa3" />{{ item.views }}</span></div>
            <button class="use-btn" type="button" @click="emit('open', item)">使用同款<el-icon><ArrowRight /></el-icon></button>
          </div>
        </div>
      </article>
    </div>
    <div v-else-if="loading" class="loading"><el-icon class="is-loading"><Loading /></el-icon><span>正在加载公开案例</span></div>
    <div v-else class="empty"><el-icon><Picture /></el-icon><h4>暂无案例</h4><p>切换其它分类，或稍后再来看看</p></div>
    <div v-if="hasMore" ref="sentinel" class="sentinel"><span v-if="loading">加载中…</span></div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useIntersectionObserver } from "@vueuse/core";
import { getPublicGallery, getPublicGalleryCategories } from "../preview/publicGalleryClient";
import type { AuraPreviewItem } from "../preview/types";
import type { PublicGalleryKind } from "../preview/publicGalleryTypes";
import { useAuraPreviewGate } from "../preview/useAuraPreviewGate";

const props = defineProps<{ kind: PublicGalleryKind }>();
const emit = defineEmits<{ (e: "open", item: AuraPreviewItem): void; (e: "count", count: number): void }>();
const { requireFullEdition } = useAuraPreviewGate();
const categories = ref(["全部"]); const category = ref("全部"); const items = ref<AuraPreviewItem[]>([]); const total = ref(0); const page = ref(1); const loading = ref(false); const hasMore = ref(false); const sourceMessage = ref(""); const sentinel = ref<HTMLElement>();
let controller: AbortController | undefined; let requestVersion = 0;
const imageCount = (item:AuraPreviewItem) => item.sections.reduce((sum,section)=>sum+section.images.length,0);
const activeImage = (item:AuraPreviewItem) => item.coverUrl || item.sections[0]?.images[0]?.url || "";

async function load(reset = true) {
  if (loading.value || (!reset && !hasMore.value)) return;
  if (reset) { controller?.abort(); controller = new AbortController(); page.value = 1; hasMore.value = true; }
  const version = ++requestVersion; loading.value = true;
  try {
    const result = await getPublicGallery({ kind: props.kind, category: category.value, page: page.value, pageSize: 12, signal: controller?.signal });
    if (version !== requestVersion) return;
    items.value = reset ? result.rows : [...items.value, ...result.rows.filter(row => !items.value.some(item => item.id === row.id))];
    total.value = result.total; sourceMessage.value = "";
    hasMore.value = items.value.length < result.total && result.rows.length > 0; page.value += 1; emit("count", result.total);
  } catch (error:any) { if (error?.name !== "AbortError") sourceMessage.value = "案例加载失败，请稍后重试"; }
  finally { if (version === requestVersion) loading.value = false; }
}
async function switchCategory(value:string){ if(category.value===value)return;category.value=value;await load(true); }
async function refresh(){ await load(true); }
defineExpose({ refresh });
useIntersectionObserver(sentinel,([entry])=>{if(entry?.isIntersecting&&hasMore.value&&!loading.value)load(false)},{rootMargin:"180px"});
onMounted(async()=>{ const rows=await getPublicGalleryCategories(props.kind); categories.value=["全部",...Array.from(new Set(rows))]; await nextTick(); load(true); });
onBeforeUnmount(()=>controller?.abort());
</script>

<style lang="scss" scoped>
.case-gallery{min-height:100%}.toolbar{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:14px}.cats{display:flex;flex-wrap:wrap;gap:7px}.cats button{padding:6px 12px;border:1px solid transparent;border-radius:9px;color:var(--ai-muted);background:#f5f3f8;font-size:12px;cursor:pointer}.cats button.on{color:var(--ai-violet-deep);border-color:var(--ai-border-strong);background:var(--ai-tint)}.count{flex-shrink:0;color:var(--ai-muted);font-size:11px}.source-notice{display:flex;align-items:center;gap:6px;margin:-3px 0 13px;padding:8px 10px;border:1px solid #f4e7bd;border-radius:9px;color:#8a650f;background:#fffaf0;font-size:11px}.masonry{columns:280px;column-gap:16px}.showcase-card{display:inline-block;width:100%;margin:0 0 16px;overflow:hidden;break-inside:avoid;border:1px solid var(--ai-border);border-radius:15px;background:#fff;box-shadow:0 5px 18px rgba(76,29,149,.06);transition:.22s}.showcase-card:hover{transform:translateY(-3px);box-shadow:0 13px 28px rgba(76,29,149,.13)}.cover{position:relative;display:block;width:100%;padding:0;overflow:hidden;border:0;background:#f3f1f7;cursor:pointer}.cover>img{display:block;width:100%;min-height:220px;max-height:390px;object-fit:cover}.src-thumb{position:absolute;top:11px;left:11px;width:64px;height:64px;overflow:hidden;border:2px solid #fff;border-radius:11px;box-shadow:0 6px 16px rgba(2,24,46,.22)}.src-thumb img{width:100%;height:100%;object-fit:cover}.src-thumb em{position:absolute;inset:0;display:grid;place-items:center;color:#fff;background:rgba(0,0,0,.45);font-size:10px;font-style:normal;opacity:0;transition:.2s}.src-thumb:hover em{opacity:1}.corner-tag{position:absolute;right:11px;bottom:11px;display:flex;align-items:center;gap:4px;padding:6px 10px;border-radius:9px;color:#fff;background:rgba(0,0,0,.62);font-size:11px;backdrop-filter:blur(8px)}.cover-hover{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5px;color:#fff;background:linear-gradient(180deg,transparent 35%,rgba(76,29,149,.5));font-size:12px;font-weight:700;opacity:0;transition:.2s}.cover:hover .cover-hover{opacity:1}.card-info{display:flex;flex-direction:column;gap:9px;padding:12px 13px 14px}.card-info h4{margin:0;color:var(--ai-ink);font-size:16px}.meta{display:flex;flex-wrap:wrap;gap:6px}.meta span{padding:4px 8px;border-radius:6px;font-size:10px;font-weight:600}.model-chip{color:var(--ai-pink);background:var(--ai-tint-pink)}.meta-chip{color:var(--ai-violet-deep);background:var(--ai-tint)}.case-foot{display:flex;align-items:center;justify-content:space-between;gap:8px}.case-stats{display:flex;align-items:center;gap:11px;color:var(--ai-muted);font-size:10px}.case-stats button,.case-stats span{display:flex;align-items:center;gap:4px;padding:0;border:0;color:inherit;background:none;font-size:inherit}.case-stats button{cursor:pointer}.use-btn{display:flex;align-items:center;gap:3px;padding:6px 10px;border:1px solid var(--ai-border-strong);border-radius:8px;color:var(--ai-violet-deep);background:var(--ai-tint);font-size:11px;font-weight:700;cursor:pointer}.loading,.empty{display:flex;min-height:360px;align-items:center;justify-content:center;flex-direction:column;gap:9px;color:var(--ai-muted)}.loading .el-icon,.empty>.el-icon{font-size:36px;color:var(--ai-violet)}.empty h4,.empty p{margin:0}.sentinel{display:flex;height:34px;align-items:center;justify-content:center;color:var(--ai-muted);font-size:11px}@media(prefers-reduced-motion:reduce){.showcase-card,.cover-hover{transition:none}}
</style>
