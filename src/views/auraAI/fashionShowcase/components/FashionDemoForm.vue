<template>
  <aside class="panel left">
    <div class="panel-head">
      <span class="head-ico"><el-icon><ShoppingBag /></el-icon></span>
      <div class="head-text">
        <h3>AI 服饰套图</h3>
        <p>上传服装图与专属模特，自动生成整套服饰场景图</p>
      </div>
    </div>

    <div class="panel-body">
      <!-- 上传服装图 -->
      <section class="field">
        <div class="field-label">
          <span>上传服装图 <i class="req">*</i></span>
          <span class="tip">{{ fileList.length }}/5 张</span>
        </div>
        <el-upload
          @click.capture="onUploadClick"
          v-model:file-list="fileList"
          class="upload"
          list-type="picture-card"
          accept="image/*"
          :auto-upload="false"
          :limit="5"
          :on-change="onFileChange"
          :on-exceed="onExceed"
          :on-preview="onPreviewUpload"
        >
          <el-icon class="upload-ico"><Plus /></el-icon>
        </el-upload>
        <div class="upload-notice">
          <el-icon class="upload-notice-ico"><InfoFilled /></el-icon>
          <span>建议上传 <b>同一款服装</b> 的多角度图片，如正面、背面、侧面与局部细节，素材越完整，AI 策划场景越精准。</span>
        </div>
        <p class="hint">支持 1-5 张，单张不超过 10M</p>
      </section>

      <!-- 出图比例（全局默认） -->
      <section class="field">
        <div class="field-label"><span>出图比例</span></div>
        <div class="ratio-grid">
          <button class="ratio" :class="{ on: form.ratio === 'auto' }" @click="form.ratio = 'auto'">
            <div class="flex flex-col items-center justify-center gap-y-[3px]" style="height: 100%;">
              <span class="ratio-text">自动</span>
              <span class="ratio-sub">自适应处理</span>
            </div>
          </button>
          <button
            v-for="r in RATIO_OPTS"
            :key="r.value"
            class="ratio"
            :class="{ on: form.ratio === r.value }"
            @click="form.ratio = r.value"
          >
            <span class="ratio-box"><span class="ratio-shape" :style="ratioShape(r)"></span></span>
            <span class="ratio-text">{{ r.value }}</span>
          </button>
        </div>
      </section>

      <!-- 定制专属模特 -->
      <section class="field">
        <div class="field-label"><span>定制专属模特 <i class="req">*</i></span></div>
        <div class="model-section">
          <!-- 模式切换 -->
          <div class="model-tabs">
            <button class="model-tab" :class="{ on: modelMode === 'upload' }" @click="modelMode = 'upload'">上传本地</button>
            <button class="model-tab" :class="{ on: modelMode === 'ai' }" @click="modelMode = 'ai'">AI 生成模特</button>
            <button class="model-tab" :class="{ on: modelMode === 'library' }" @click="switchToLibrary">我的模特库</button>
            <button class="model-tab" :class="{ on: modelMode === 'public' }" @click="modelMode = 'public'">公共</button>
          </div>

          <!-- 上传本地 -->
          <div v-if="modelMode === 'upload'" class="model-upload-area">
            <el-upload
              @click.capture="onModelUploadClick"
              :show-file-list="false"
              :auto-upload="false"
              accept="image/*"
              :on-change="onModelFileChange"
            >
              <button class="model-pick-btn" type="button"><el-icon><Plus /></el-icon>选择模特图片</button>
            </el-upload>
            <p class="hint">支持 1 张，单张不超过 10M，建议全身 / 半身清晰照</p>
          </div>

          <!-- AI 生成 -->
          <div v-else-if="modelMode === 'ai'" class="ai-model-form">
            <div class="sub-field">
              <span class="sub-label">性别 <i class="req">*</i></span>
              <div class="chip-wrap">
                <button v-for="g in GENDER_OPTS" :key="g" class="chip sm" :class="{ on: modelForm.gender === g }" @click="modelForm.gender = g">{{ g }}</button>
              </div>
            </div>
            <div class="sub-field">
              <span class="sub-label">年龄段 <i class="req">*</i></span>
              <div class="chip-wrap">
                <button v-for="a in ageOptions" :key="a" class="chip sm" :class="{ on: modelForm.age === a }" @click="modelForm.age = a">{{ a }}</button>
              </div>
            </div>
            <div class="sub-field">
              <span class="sub-label">面孔特征 <i class="req">*</i></span>
              <div class="chip-wrap">
                <button v-for="r in RACE_OPTS" :key="r" class="chip sm" :class="{ on: modelForm.race === r }" @click="modelForm.race = r">{{ r }}</button>
              </div>
            </div>
            <div class="sub-field">
              <span class="sub-label">身材 <i class="req">*</i></span>
              <div class="chip-wrap">
                <button v-for="b in BODY_OPTS" :key="b" class="chip sm" :class="{ on: modelForm.body === b }" @click="modelForm.body = b">{{ b }}</button>
              </div>
            </div>
            <div class="sub-field">
              <span class="sub-label">气质风格</span>
              <div class="chip-wrap">
                <button v-for="v in VIBE_OPTS" :key="v" class="chip sm" :class="{ on: modelForm.vibe === v }" @click="modelForm.vibe = v">{{ v }}</button>
              </div>
            </div>
            <div class="sub-field">
              <span class="sub-label">外貌细节（可选）</span>
              <el-input
                v-model="modelForm.appearance"
                type="textarea"
                :rows="2"
                maxlength="200"
                show-word-limit
                resize="none"
                placeholder="补充提示词，如：长发、戴帽子、微笑等"
              />
            </div>
            <button v-if="modelGenAssistant" class="ai-action-btn" :disabled="genModelBusy" @click="generateModel">
              <f-svg-icon name="magic" size="14px" color="currentColor" />
              <span>{{ genModelBusy ? "生成中…" : modelGenAssistant.name }}</span>
              <span v-if="!genModelBusy && modelGenPriceText" class="ai-action-price">{{ modelGenPriceText }}</span>
            </button>
          </div>

          <!-- 我的模特库（持久化保存的模特，点击使用 / 删除） -->
          <div v-else-if="modelMode === 'library'" class="library-area">
            <div v-if="myLibrary.length" class="library-grid">
              <div
                v-for="m in myLibrary"
                :key="m.id"
                class="lib-card"
                :class="{ on: currentModel && currentModel.id === m.id }"
              >
                <el-image
                  class="lib-img"
                  :src="toFileUrl(m.image_key || m.image)"
                  fit="cover"
                >
                  <template #error><div class="lib-img-err"><el-icon><Picture /></el-icon></div></template>
                </el-image>
                <!-- 左上角复选按钮：选用/取消 -->
                <button
                  class="lib-select"
                  :class="{ on: currentModel && currentModel.id === m.id }"
                  :title="currentModel && currentModel.id === m.id ? '取消选用' : '选用此模特'"
                  @click.stop="selectLibraryModel(m)"
                ><el-icon><Check /></el-icon></button>
                <!-- 右上角操作：放大 + 删除 -->
                <div class="lib-actions">
                  <button class="lib-act" title="放大查看" @click.stop="openLibPreview(m)"><el-icon><ZoomIn /></el-icon></button>
                  <button class="lib-act danger" title="删除" @click.stop="onDeleteMyModel(m)"><el-icon><Delete /></el-icon></button>
                </div>
                <span v-if="m.name" class="lib-name">{{ m.name }}</span>
              </div>
            </div>
            <div v-else class="lib-empty">
              <el-icon class="lib-empty-ico"><Picture /></el-icon>
              <p>模特库还是空的</p>
              <span>在「AI 生成」里生成后点击保存即可入库</span>
            </div>
          </div>

          <!-- 公共模特库（内置静态模特，点击选用） -->
          <div v-else-if="modelMode === 'public'" class="library-area">
            <div class="library-grid">
              <div
                v-for="(m, i) in PUBLIC_MODELS"
                :key="i"
                class="lib-card"
                :class="{ on: currentModel && currentModel.source === 'public' && currentModel.key === m.key }"
                title="点击选用"
                @click="selectPublicModel(m)"
              >
                <el-image class="lib-img" :src="m.url" fit="cover">
                  <template #error><div class="lib-img-err"><el-icon><Picture /></el-icon></div></template>
                </el-image>
                <span v-if="currentModel && currentModel.source === 'public' && currentModel.key === m.key" class="sel-check"><el-icon><Check /></el-icon></span>
                <div class="lib-actions">
                  <button class="lib-act" title="放大查看" @click.stop="openPublicPreview(m)"><el-icon><ZoomIn /></el-icon></button>
                </div>
              </div>
            </div>
          </div>

          <!-- 当前已选模特（醒目卡片，与下方网格区分） -->
          <div v-if="currentModel" class="current-model">
            <div class="current-model-head">
              <span class="current-model-label"><el-icon><CircleCheckFilled /></el-icon>当前选中模特</span>
              <span class="current-model-src">{{ modelTagText }}</span>
            </div>
            <div class="model-preview">
              <el-image
                :src="currentModel.url"
                :preview-src-list="[currentModel.url]"
                fit="cover"
                preview-teleported
                hide-on-click-modal
              >
                <template #error><div class="model-preview-err"><el-icon><Picture /></el-icon></div></template>
              </el-image>
              <button class="model-remove" title="移除" @click="removeModel"><el-icon><Close /></el-icon></button>
            </div>
          </div>

          <!-- 最近生成（临时异步任务，24h 后过期；非「我的模特库」。已完成可点击复用 / 保存到库） -->
          <div v-if="modelTasks.length" class="my-models">
            <div class="my-models-head">
              <span class="my-models-label">最近生成</span>
              <span class="my-models-tip">临时记录 · 24 小时后自动清理</span>
            </div>
            <div class="my-models-list">
              <div
                v-for="t in modelTasks"
                :key="t.field"
                class="my-model-thumb"
                :class="{ on: currentModel && currentModel.field != null && String(currentModel.field) === String(t.field), gen: t.status === 'generating', saved: !!t.saved }"
                :title="thumbTitle(t)"
                @click="reapplyModel(t)"
              >
                <img v-if="t.status === 'success' && t.image" :src="t.image" alt="模特" />
                <span v-else class="thumb-spin"><el-icon class="is-loading"><Loading /></el-icon></span>
                <span v-if="currentModel && currentModel.field != null && String(currentModel.field) === String(t.field)" class="sel-check"><el-icon><Check /></el-icon></span>
                <!-- 未保存：hover 显示保存按钮；已保存：仅绿色边框标识（见 .saved） -->
                <button v-if="t.status === 'success' && !t.saved" class="thumb-save" title="保存到模特库" @click.stop="saveToLibrary(t)">
                  <el-icon><FolderAdd /></el-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 场景方案（AI 策划 + 复选 + 单个设置） -->
      <section class="field">
        <div class="field-label">
          <span>场景方案 <i class="req">*</i></span>
          <button v-if="planAssistant" class="plan-btn" :disabled="genPlansBusy" @click="generatePlans">
            <f-svg-icon name="magic" size="13px" color="currentColor" />{{ genPlansBusy ? "策划中…" : planAssistant.name }}<span v-if="!genPlansBusy && planPriceText" class="plan-price">{{ planPriceText }}</span>
          </button>
        </div>
        <div v-if="genPlansBusy && !scenes.length" class="plan-loading">
          <el-icon class="plan-loading-ico"><MagicStick /></el-icon><span>AI 正在策划场景方案…</span>
        </div>
        <div v-else-if="!scenes.length" class="scene-empty" :class="{ clickable: !!planAssistant && !genPlansBusy }" @click="onClickEmptyPlan">
          <el-icon class="scene-empty-ico"><Picture /></el-icon>
          <p class="scene-empty-title">暂无场景方案</p>
          <span class="scene-empty-desc">{{ planAssistant ? "点击此处或右上角按钮，根据服装图与模特图自动策划" : "正在加载策划功能…" }}</span>
        </div>
        <div v-if="planTitle && scenes.length" class="plan-title">
          <span class="plan-title-text">{{ planTitle }}</span>
          <span v-if="planCategory" class="plan-cat">{{ planCategory }}</span>
        </div>
        <div v-if="scenes.length" class="scene-list">
          <div v-for="s in scenes" :key="s.uid" class="scene-item" :class="{ on: s.checked }">
            <div class="scene-head">
              <el-checkbox v-model="s.checked" class="scene-check" />
              <div class="scene-info">
                <div class="scene-title-row">
                  <span class="scene-name">{{ s.name }}</span>
                  <span v-if="s.type" class="scene-tag">{{ s.type }}</span>
                </div>
                <span class="scene-desc">数量：{{ s.quantity }} · 比例：{{ s.ratio || "自适应" }} · {{ sceneModel(s)?.name || "未选模型" }}</span>
              </div>
                <div class="scene-actions">
                  <button class="mod-act danger" title="删除" @click="removeScene(s)"><el-icon><Delete /></el-icon></button>
              <el-popover v-model:visible="popoverVisible[s.uid]" trigger="click" :placement="popoverPlacement" :width="560" popper-class="scene-cfg-pop">
                <template #reference>
                  <button class="mod-act" title="设置"><el-icon><Setting /></el-icon></button>
                </template>
                <div class="cfg-pop-header">
                  <div class="cfg-pop-head-text">
                    <span class="cfg-pop-title">{{ s.name }}</span>
                    <span v-if="s.type" class="cfg-pop-sub">{{ s.type }}</span>
                  </div>
                  <button class="cfg-close" @click="popoverVisible[s.uid] = false"><el-icon><Close /></el-icon></button>
                </div>
                <div class="cfg-pop-body">
                  <div class="cfg-field"><label>方案标题</label><el-input v-model="s.name" placeholder="如：极简灰调棚内特写" /></div>
                  <div class="cfg-field"><label>建议方向</label><el-input v-model="s.type" placeholder="如：高端棚拍" /></div>
                  <div class="cfg-field">
                    <label>模型 <i class="req">*</i></label>
                    <el-select :teleported="false" v-model="s.modelId" placeholder="请选择模型">
                      <el-option v-for="m in models" :key="m.id" :label="m.name" :value="m.id">
                        <div class="model-opt">
                          <div class="model-opt-main">
                            <span class="model-opt-name">{{ m.name }}</span>
                            <span v-if="m.description" class="model-opt-desc">{{ m.description }}</span>
                          </div>
                          <div class="model-opt-side">
                            <span v-if="m.type" class="model-opt-type" :class="m.type">{{ typeLabel(m.type) }}</span>
                            <span v-if="m.vendor" class="model-opt-vendor">{{ m.vendor }}</span>
                          </div>
                        </div>
                      </el-option>
                    </el-select>
                  </div>
                  <div class="cfg-field"><label>出图数量</label><el-input-number v-model="s.quantity" :min="1" :max="20" /></div>
                  <div class="cfg-field">
                    <label>图片比例</label>
                    <el-select :teleported="false" v-model="s.ratio" filterable allow-create default-first-option placeholder="选择比例">
                      <el-option label="自适应" value="" />
                      <el-option v-for="r in ratioOptions(s)" :key="r" :label="r" :value="r" />
                    </el-select>
                    <span v-if="!sceneRatios(s).length" class="cfg-hint-inline">该模型不支持参数级比例，将自适应出图</span>
                  </div>
                </div>
              </el-popover>
                </div>
              </div>
              <el-input
                v-model="s.prompt"
                class="scene-prompt"
                type="textarea"
                :rows="5"
                resize="none"
                placeholder="生图提示词（AI 生成，可编辑）"
              />
          </div>
        </div>
      </section>
    </div>

    <!-- 底部生成 -->
    <div class="panel-foot">
      <div class="cost">
        预计消耗 <b><count-to :startVal="prevCostValue" :endVal="costDisplay.value" :duration="800" :decimals="costDisplay.decimals" /></b> 算力
        <span v-if="checkedSceneCount" class="cost-detail">（{{ checkedSceneCount }} 个场景 · {{ totalImageCount }} 张图）</span>
      </div>
      <button class="gen-btn" @click="onGenerate">
        <f-svg-icon name="magic" color="#fff" size="20" />生成套图
      </button>
    </div>

    <!-- 上传进度弹窗 -->
    <el-dialog
      v-model="uploadVisible"
      width="380px"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body
      class="upload-progress-dialog"
    >
      <div class="upload-progress-body">
        <div class="up-icon"><el-icon class="is-loading"><Loading /></el-icon></div>
        <div class="up-title">正在上传图片</div>
        <div class="up-label">{{ uploadLabel }}</div>
        <el-progress :percentage="uploadPercent" color="#7c3aed" :stroke-width="8" :show-text="true" />
      </div>
    </el-dialog>

    <!-- 模特库图片放大预览（独立 viewer，仅放大按钮触发） -->
    <el-image-viewer
      v-if="libPreviewVisible"
      :url-list="[libPreviewUrl]"
      :initial-index="0"
      hide-on-click-modal
      teleported
      @close="libPreviewVisible = false"
    />
    <!-- 已上传服装图放大预览 -->
    <el-image-viewer
      v-if="uploadPreviewVisible"
      :url-list="[uploadPreviewUrl]"
      :initial-index="0"
      hide-on-click-modal
      teleported
      @close="uploadPreviewVisible = false"
    />
  </aside>
</template>

<script setup lang="ts" name="fashionForm">
import { computed, reactive, ref } from "vue";
import { useWindowSize } from "@vueuse/core";
import { CountTo } from "vue3-count-to";
import { fashionCases } from "../../preview/fixtures";
import { previewAsset } from "../../preview/assets";
import { useAuraPreviewGate } from "../../preview/useAuraPreviewGate";

interface SceneItem {
  uid: string;
  name: string;
  type: string;
  checked: boolean;
  modelId: string;
  quantity: number;
  ratio: string;
  prompt: string;
}

const { requireFullEdition } = useAuraPreviewGate();
const { width: viewportWidth } = useWindowSize();
const popoverPlacement = computed(() => viewportWidth.value <= 720 ? "bottom" : "right-start");
const sourceImages = fashionCases.slice(0, 2).map((item) => item.sourceUrls[0] || item.coverUrl).filter(Boolean);
const initialFiles = sourceImages.map((url, index) => ({ name: `正式案例服装图 ${index + 1}`, url, status: "success" as const, uid: index + 1 }));
const fileList = ref<any[]>(initialFiles);
const form = reactive({ ratio: "3:4" });
const RATIO_OPTS = ["1:1", "3:4", "4:5", "9:16"].map((value) => ({ value }));
const GENDER_OPTS = ["女", "男"];
const ageOptions = ["18-24 岁", "25-34 岁", "35-44 岁", "45 岁以上"];
const RACE_OPTS = ["东亚面孔", "欧美面孔", "南亚面孔", "多元混血"];
const BODY_OPTS = ["纤细", "匀称", "健美", "曲线"];
const VIBE_OPTS = ["清冷高级", "自然松弛", "甜美活力", "都市干练"];
const modelForm = reactive({ gender: "女", age: ageOptions[1], race: RACE_OPTS[0], body: BODY_OPTS[1], vibe: VIBE_OPTS[0], appearance: "自然长发，妆容干净，神态松弛，商业时装模特质感。" });
const modelMode = ref<"upload" | "ai" | "library" | "public">("public");
const modelGenAssistant = { name: "生成专属模特" };
const modelGenPriceText = "12 算力";
const genModelBusy = ref(false);

const modelImage = (index: number) => fashionCases[index]?.sourceUrls[1] || fashionCases[index]?.coverUrl || previewAsset(`models/model-${index + 1}.svg`);
const PUBLIC_MODELS = [
  { key: "public-1", name: "自然光女模特", url: modelImage(0) },
  { key: "public-2", name: "都市通勤女模特", url: modelImage(1) },
  { key: "public-3", name: "轻奢棚拍女模特", url: modelImage(2) },
];
const myLibrary = ref([
  { id: "library-1", name: "静奢通勤模特", image_key: modelImage(3), image: modelImage(3) },
  { id: "library-2", name: "度假氛围模特", image_key: modelImage(4), image: modelImage(4) },
]);
const currentModel = ref<any>({ ...PUBLIC_MODELS[0], source: "public" });
const modelTagText = computed(() => currentModel.value?.source === "public" ? "公共模特" : currentModel.value?.source === "library" ? "我的模特库" : currentModel.value?.source === "ai" ? "AI 生成" : "本地上传");
const modelTasks = ref([
  { field: "demo-model-1", status: "success", image: modelImage(5), saved: false },
]);

const models = [
  { id: "fashion-pro", name: "Aura Fashion Pro", description: "服饰结构与面料表现稳定", type: "quality", vendor: "Aura", price: 7, ratios: ["1:1", "3:4", "4:5", "9:16"] },
  { id: "portrait-x", name: "Aura Portrait X", description: "人物一致性与商业人像优化", type: "quality", vendor: "Aura", price: 9, ratios: ["3:4", "4:5", "9:16"] },
];
const scenes = ref<SceneItem[]>([
  { uid: "studio", name: "高端棚拍 Lookbook", type: "品牌视觉", checked: true, modelId: "fashion-pro", quantity: 2, ratio: "3:4", prompt: "高级灰影棚，柔和轮廓光，完整展示服装剪裁、面料纹理与人物比例，商业 Lookbook 摄影。" },
  { uid: "street", name: "都市街景通勤", type: "社交媒体", checked: true, modelId: "fashion-pro", quantity: 2, ratio: "4:5", prompt: "现代城市建筑与自然日光，模特松弛行走，突出服装搭配和真实通勤氛围。" },
  { uid: "holiday", name: "海岸度假氛围", type: "内容种草", checked: true, modelId: "portrait-x", quantity: 2, ratio: "4:5", prompt: "明亮海岸与度假酒店场景，自然风感与轻松姿态，画面清透、有高端旅行杂志质感。" },
]);
const planAssistant = { name: "AI 策划" };
const planPriceText = "8 算力";
const genPlansBusy = ref(false);
const planTitle = ref("服饰多场景商业拍摄方案");
const planCategory = ref("服装 · 女装");
const popoverVisible = reactive<Record<string, boolean>>({});
const checkedScenes = computed(() => scenes.value.filter((item) => item.checked));
const checkedSceneCount = computed(() => checkedScenes.value.length);
const totalImageCount = computed(() => checkedScenes.value.reduce((sum, item) => sum + item.quantity, 0));
const totalCost = computed(() => checkedScenes.value.reduce((sum, item) => sum + item.quantity * (models.find((model) => model.id === item.modelId)?.price || 0), 0));
const costDisplay = computed(() => ({ value: totalCost.value, decimals: 0 }));
const prevCostValue = ref(totalCost.value);
const uploadVisible = ref(false);
const uploadLabel = ref("");
const uploadPercent = ref(0);
const libPreviewVisible = ref(false);
const libPreviewUrl = ref("");
const uploadPreviewVisible = ref(false);
const uploadPreviewUrl = ref("");

function ratioShape(item: { value: string }) {
  const [width, height] = item.value.split(":").map(Number);
  const max = 24;
  return width >= height
    ? { width: `${max}px`, height: `${Math.max(9, max * height / width)}px` }
    : { width: `${Math.max(9, max * width / height)}px`, height: `${max}px` };
}
function typeLabel(type: string) { return type === "fast" ? "快速" : "高品质"; }
function toFileUrl(value: string) { return value; }
function sceneModel(scene: SceneItem) { return models.find((item) => item.id === scene.modelId); }
function sceneRatios(scene: SceneItem) { return sceneModel(scene)?.ratios || []; }
function ratioOptions(scene: SceneItem) { return sceneRatios(scene); }
function switchToLibrary() { modelMode.value = "library"; }
function selectLibraryModel(model: any) {
  currentModel.value = currentModel.value?.id === model.id ? null : { id: model.id, name: model.name, url: toFileUrl(model.image_key || model.image), source: "library" };
}
function selectPublicModel(model: any) { currentModel.value = { ...model, source: "public" }; }
function removeModel() { currentModel.value = null; }
function openLibPreview(model: any) { libPreviewUrl.value = toFileUrl(model.image_key || model.image); libPreviewVisible.value = true; }
function openPublicPreview(model: any) { libPreviewUrl.value = model.url; libPreviewVisible.value = true; }
function onDeleteMyModel(_model?: any) { requireFullEdition("删除我的模特", "delete"); }
function thumbTitle(task: any) { return task.saved ? "已保存到模特库" : task.status === "success" ? "点击复用此模特" : "生成中"; }
function reapplyModel(task: any) { if (task.status === "success") currentModel.value = { field: task.field, url: task.image, source: "ai", name: "AI 生成模特" }; }
function saveToLibrary(_task?: any) { requireFullEdition("保存模特到我的模特库", "generate"); }
function removeScene(scene: SceneItem) { scenes.value = scenes.value.filter((item) => item.uid !== scene.uid); }
function onUploadClick(event: Event) { event.preventDefault(); event.stopPropagation(); requireFullEdition("上传服装素材", "upload"); }
function onModelUploadClick(event: Event) { event.preventDefault(); event.stopPropagation(); requireFullEdition("上传模特图片", "upload"); }
function onFileChange() { fileList.value = initialFiles; requireFullEdition("上传服装素材", "upload"); }
function onModelFileChange() { requireFullEdition("上传模特图片", "upload"); }
function onExceed() { requireFullEdition("上传更多服装素材", "upload"); }
function onPreviewUpload(file: any) { uploadPreviewUrl.value = file.url; uploadPreviewVisible.value = true; }
function generateModel() { requireFullEdition("AI 生成专属模特", "generate"); }
function generatePlans() { requireFullEdition("AI 策划场景方案", "generate"); }
function onClickEmptyPlan() { requireFullEdition("AI 策划场景方案", "generate"); }
function onGenerate() { requireFullEdition("生成服饰套图", "generate"); }
</script>

<style lang="scss" scoped>
.panel {
  background: var(--ai-surface-solid);
  border: 1px solid var(--ai-border);
  border-radius: var(--ai-radius);
  box-shadow: 0 8px 28px rgba(76, 29, 149, 0.06);
}

.left {
  display: flex;
  flex: 0 0 400px;
  flex-direction: column;
  width: 400px;
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, #fbfaff 100%);

  .panel-head {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 18px 18px 15px;
    border-bottom: 1px solid var(--ai-border);
    background: linear-gradient(120deg, rgba(139, 92, 246, 0.06), rgba(255, 255, 255, 0));

    .head-ico {
      display: grid;
      flex-shrink: 0;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 55%, #6d28d9 100%);
      color: #fff;
      font-size: 20px;
      box-shadow: 0 8px 18px rgba(124, 58, 237, 0.35);
    }
    .head-text {
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: var(--ai-ink);
      }
      p {
        margin: 2px 0 0;
        font-size: 12px;
        color: var(--ai-muted);
      }
    }
  }
  .panel-body {
    flex: 1;
    min-height: 0;
    padding: 4px 18px 18px;
    overflow-y: auto;
    scrollbar-width: thin;
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(139, 92, 246, 0.18);
      border-radius: 6px;
      &:hover {
        background: rgba(139, 92, 246, 0.3);
      }
    }
  }
  .panel-foot {
    padding: 14px 18px;
    border-top: 1px solid var(--ai-border);
    background: var(--ai-surface-solid);

    .cost {
      margin-bottom: 10px;
      font-size: 12px;
      color: var(--ai-muted);

      b {
        font-family: "DIN-Alternate", sans-serif;
        font-size: 17px;
        font-weight: 700;
        color: var(--ai-violet-deep);
      }
      .cost-detail {
        margin-left: 4px;
        font-size: 11px;
        color: var(--ai-muted);
      }
    }
    .gen-btn {
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      height: 46px;
      border: none;
      border-radius: 13px;
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 52%, #6d28d9 100%);
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.5px;
      cursor: pointer;
      box-shadow: 0 10px 22px rgba(124, 58, 237, 0.32);
      transition: transform 0.2s, box-shadow 0.2s;
      animation: gen-glow 2.6s ease-in-out infinite;

      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 60%;
        height: 100%;
        background: linear-gradient(120deg, transparent 25%, rgba(255, 255, 255, 0.16) 50%, transparent 75%);
        transform: translateX(-180%) skewX(-20deg);
        animation: gen-shine 3.4s ease-in-out infinite;
        pointer-events: none;
      }
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 14px 30px rgba(124, 58, 237, 0.5);

        &::before {
          animation-duration: 1.6s;
        }
      }
      &:active {
        transform: translateY(0);
      }
      > * {
        position: relative;
        z-index: 1;
      }
    }
    @keyframes gen-shine {
      0% {
        transform: translateX(-180%) skewX(-20deg);
      }
      100% {
        transform: translateX(320%) skewX(-20deg);
      }
    }
    @keyframes gen-glow {
      0%,
      100% {
        box-shadow: 0 10px 22px rgba(124, 58, 237, 0.32);
      }
      50% {
        box-shadow: 0 12px 28px rgba(139, 92, 246, 0.5);
      }
    }
  }
}

.field {
  margin-top: 18px;

  .field-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 9px;
    font-size: 13px;
    font-weight: 600;
    color: var(--ai-ink);

    > span:first-of-type::before {
      content: "";
      display: inline-block;
      width: 5px;
      height: 13px;
      margin-right: 7px;
      vertical-align: -2px;
      border-radius: 2px;
      background: linear-gradient(180deg, #8b5cf6, #7c3aed);
    }
    .req {
      color: var(--ai-coral);
      font-style: normal;
      margin-left: 2px;
    }
    .tip {
      font-size: 11px;
      font-weight: 500;
      color: var(--ai-muted);
    }
  }
  .sub-field {
    margin-top: 12px;
    &:first-of-type {
      margin-top: 0;
    }
  }
  .sub-label {
    display: block;
    margin-bottom: 7px;
    font-size: 12px;
    font-weight: 600;
    color: var(--ai-ink-soft);

    .req {
      color: var(--ai-coral);
      font-style: normal;
      margin-left: 2px;
    }
  }
  .hint {
    margin: 8px 0 0;
    font-size: 11px;
    color: var(--ai-muted);
  }
  .upload-notice {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    margin: 10px 0 0;
    padding: 9px 11px;
    border-radius: 9px;
    background: var(--ai-tint);
    font-size: 11.5px;
    line-height: 1.6;
    color: var(--ai-ink-soft);
    .upload-notice-ico {
      flex-shrink: 0;
      margin-top: 1px;
      font-size: 14px;
      color: var(--ai-violet);
    }
    b {
      color: var(--ai-violet-deep);
      font-weight: 600;
    }
  }
}

.chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  height: 33px;
  padding: 0 13px;
  border: 2px solid var(--ai-border);
  border-radius: 10px;
  background: #fff;
  color: var(--ai-ink-soft);
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    border-color: var(--ai-border-strong);
    color: var(--ai-violet-deep);
  }
  &.on {
    border-color: var(--ai-violet);
    background: var(--ai-tint-strong);
    color: var(--ai-violet-deep);
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.16);
  }
  &.sm {
    height: 28px;
    padding: 0 11px;
    font-size: 12px;
  }
}

.upload {
  :deep(.el-upload--picture-card),
  :deep(.el-upload-list--picture-card .el-upload-list__item) {
    width: 86px;
    height: 86px;
    border-radius: 12px;
    border: 2px dashed var(--ai-border-strong);
  }
  :deep(.el-upload--picture-card:hover) {
    border-color: var(--ai-violet);
    color: var(--ai-violet);
  }
  .upload-ico {
    font-size: 22px;
    color: var(--ai-muted);
  }
}

.ratio-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.ratio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 9px 3px 8px;
  border: 2px solid var(--ai-border);
  border-radius: 10px;
  background: #fff;
  color: var(--ai-muted);
  cursor: pointer;
  transition: all 0.18s ease;

  .ratio-box {
    display: grid;
    place-items: center;
    height: 32px;
  }
  .ratio-shape {
    border: 2px solid currentColor;
    border-radius: 3px;
    transition: all 0.18s ease;
  }
  .ratio-text {
    font-family: "DIN-Alternate", sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: var(--ai-ink-soft);
  }
  .ratio-sub {
    font-family: "DIN-Alternate", sans-serif;
    font-size: 10px;
    color: var(--ai-muted);
  }
  &:hover {
    border-color: var(--ai-border-strong);
  }
  &.on {
    border-color: var(--ai-violet);
    background: var(--ai-tint-strong);
    color: var(--ai-violet-deep);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.16);

    .ratio-text {
      color: var(--ai-violet-deep);
    }
  }
}

/* ============ 定制专属模特 ============ */
.model-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.model-tabs {
  display: flex;
  gap: 6px;
  padding: 4px;
  border-radius: 11px;
  background: var(--ai-tint);

  .model-tab {
    flex: 1;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--ai-muted);
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;

    &.on {
      background: #fff;
      color: var(--ai-violet-deep);
      box-shadow: 0 3px 8px rgba(76, 29, 149, 0.1);
    }
  }
}
.model-upload-area {
  .model-pick-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    height: 70px;
    padding: 0 12px;
    border: 2px dashed var(--ai-border-strong);
    border-radius: 12px;
    background: #fff;
    color: var(--ai-violet-deep);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;

    .el-icon {
      font-size: 16px;
    }
    &:hover {
      border-color: var(--ai-violet);
      background: var(--ai-tint);
    }
  }
  .hint {
    margin: 7px 0 0;
  }
}
.ai-model-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  border-radius: 12px;
  background: var(--ai-tint);
}
.ai-action-btn {
  position: relative;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  height: 38px;
  margin-top: 6px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #ec4899, #be185d);
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(236, 72, 153, 0.28);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  .f-svg-icon {
    transition: transform 0.25s ease;
  }
  .ai-action-price {
    font-size: 11.5px;
    font-weight: 500;
    opacity: 0.85;
  }
  &:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 9px 18px rgba(236, 72, 153, 0.4);
    .f-svg-icon {
      transform: scale(1.15);
    }
  }
  &:disabled {
    cursor: progress;
    opacity: 0.7;
  }
}
.model-preview {
  position: relative;
  width: 120px;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid var(--ai-border-strong);
  background: linear-gradient(135deg, #ede9fe, #f5f3ff);
  box-shadow: 0 6px 16px rgba(76, 29, 149, 0.1);

  :deep(.el-image) {
    display: block;
    width: 100%;
    height: 100%;
  }
  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: zoom-in;
  }
  .model-preview-err {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    color: var(--ai-muted);
    font-size: 24px;
  }
  .model-remove {
    position: absolute;
    top: 6px;
    right: 6px;
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border: none;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.18s ease;

    &:hover {
      background: rgba(239, 68, 68, 0.85);
    }
  }
  .model-tag {
    position: absolute;
    bottom: 6px;
    left: 6px;
    padding: 2px 8px;
    border-radius: 6px;
    background: rgba(124, 58, 237, 0.85);
    color: #fff;
    font-size: 10.5px;
    font-weight: 600;
    backdrop-filter: blur(4px);
  }
}
/* 当前已选模特（醒目卡片，与下方网格区分） */
.current-model {
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding: 13px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.06));
  border: 1.5px solid rgba(139, 92, 246, 0.24);
  box-shadow: 0 6px 16px rgba(124, 58, 237, 0.1);

  .current-model-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .current-model-label {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    font-weight: 700;
    color: var(--ai-violet-deep);

    .el-icon {
      font-size: 16px;
      color: var(--ai-violet);
    }
  }
  .current-model-src {
    padding: 3px 10px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.75);
    color: var(--ai-violet-deep);
    font-size: 11px;
    font-weight: 600;
  }
  /* 预览图居中 + 选中描边 */
  .model-preview {
    margin: 0 auto;
    border-color: var(--ai-violet);
    box-shadow: 0 6px 18px rgba(124, 58, 237, 0.18);
  }
}
/* 选中勾选徽章（库卡片 / 最近生成缩略图共用） */
.sel-check {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #7c3aed;
  color: #fff;
  font-size: 11px;
  box-shadow: 0 2px 6px rgba(124, 58, 237, 0.4);
}

.my-models {
  display: flex;
  flex-direction: column;
  gap: 7px;

  .my-models-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }
  .my-models-label {
    font-size: 11.5px;
    font-weight: 600;
    color: var(--ai-muted);
  }
  .my-models-tip {
    font-size: 10.5px;
    color: var(--ai-muted);
    opacity: 0.75;
    white-space: nowrap;
  }
  .my-models-list {
    display: flex;
    gap: 8px;
    /* 上下留白：hover 上浮(translateY -2px)时不被 overflow 裁切 */
    padding: 5px 2px;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
  .my-model-thumb {
    position: relative;
    flex-shrink: 0;
    width: 52px;
    height: 68px;
    padding: 0;
    border: 2px solid var(--ai-border);
    border-radius: 9px;
    overflow: hidden;
    background: #fff;
    cursor: pointer;
    transition: all 0.18s ease;

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    &:hover {
      border-color: var(--ai-violet);
      transform: translateY(-2px);
    }
    /* 已保存到模特库：绿色 success 边框（.on 选中在其后定义，选中时紫色优先） */
    &.saved {
      border-color: #10b981;
    }
    &.on {
      border-color: var(--ai-violet);
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.25);
    }
    /* 生成中：虚线框 + 居中转圈 */
    &.gen {
      display: grid;
      place-items: center;
      border-style: dashed;
      border-color: var(--ai-border-strong);
      background: var(--ai-tint);
      cursor: progress;

      &:hover {
        transform: none;
        border-color: var(--ai-border-strong);
      }
    }
    .thumb-spin {
      display: grid;
      place-items: center;
      color: var(--ai-violet);
      font-size: 18px;
    }
    /* 保存到模特库（hover 显示） */
    .thumb-save {
      position: absolute;
      top: 3px;
      right: 3px;
      z-index: 2;
      display: grid;
      place-items: center;
      width: 20px;
      height: 20px;
      padding: 0;
      border: none;
      border-radius: 6px;
      background: rgba(124, 58, 237, 0.88);
      color: #fff;
      font-size: 12px;
      cursor: pointer;
      opacity: 0;
      transform: translateY(-3px);
      transition: all 0.18s ease;

      &:hover {
        background: #7c3aed;
      }
    }
    &:hover .thumb-save {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

/* ============ 我的模特库 ============ */
.library-area {
  min-height: 60px;
}
.library-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.lib-card {
  position: relative;
  aspect-ratio: 3 / 4;
  border: 2px solid var(--ai-border);
  border-radius: 9px;
  overflow: hidden;
  background: linear-gradient(135deg, #ede9fe, #f5f3ff);
  transition: all 0.18s ease;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  :deep(.lib-img) {
    display: block;
    width: 100%;
    height: 100%;
  }
  :deep(.lib-img img) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .lib-img-err {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    color: var(--ai-muted);
    font-size: 26px;
    background: linear-gradient(135deg, #ede9fe, #f5f3ff);
  }
  &:hover {
    border-color: var(--ai-violet);
    transform: translateY(-2px);
  }
  &.on {
    border-color: var(--ai-violet);
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.25);
  }
  /* 左上角复选按钮：选用/取消（常驻可见，与图片放大分离） */
  .lib-select {
    position: absolute;
    top: 5px;
    left: 5px;
    z-index: 3;
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border: 2px solid #fff;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.4);
    color: transparent;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.18s ease;
    backdrop-filter: blur(4px);

    .el-icon {
      font-size: 12px;
    }
    &:hover {
      background: rgba(124, 58, 237, 0.85);
      color: #fff;
    }
    &.on {
      background: #7c3aed;
      border-color: #7c3aed;
      color: #fff;
    }
  }
  /* 右上角操作组：放大 + 删除（hover 显示） */
  .lib-actions {
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 3;
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.18s ease;
  }
  &:hover .lib-actions {
    opacity: 1;
  }
  .lib-act {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    padding: 0;
    border: none;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.18s ease;

    &:hover {
      background: rgba(124, 58, 237, 0.9);
    }
    &.danger:hover {
      background: rgba(239, 68, 68, 0.9);
    }
  }
  .lib-name {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 3px 6px;
    background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.55));
    color: #fff;
    font-size: 10.5px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.lib-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 24px 12px;
  border: 2px dashed var(--ai-border-strong);
  border-radius: 12px;
  background: var(--ai-tint);
  text-align: center;

  .lib-empty-ico {
    font-size: 30px;
    color: var(--ai-violet);
    opacity: 0.5;
  }
  p {
    margin: 0;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--ai-ink-soft);
  }
  span {
    font-size: 11px;
    color: var(--ai-muted);
  }
}

/* ============ 场景方案 ============ */
/* AI 策划按钮：深色填充，明确可点 */
.plan-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 13px;
  border: none;
  border-radius: 9px;
  background: #1f2233;
  color: #fff;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  .f-svg-icon {
    transition: transform 0.25s ease;
  }
  .plan-price {
    margin-left: 2px;
    font-size: 11px;
    font-weight: 500;
    opacity: 0.7;
  }
  &:not(:disabled):hover {
    background: #2d2b3e;
    transform: translateY(-1px);
    box-shadow: 0 5px 12px rgba(31, 34, 51, 0.3);

    .f-svg-icon {
      transform: scale(1.15);
    }
  }
  &:disabled {
    cursor: progress;
    opacity: 0.75;
  }
}
/* 策划中加载态 */
.plan-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 26px 16px;
  border: 2px dashed var(--ai-border-strong);
  border-radius: 13px;
  background: var(--ai-tint);
  color: var(--ai-violet-deep);
  font-size: 13px;
  font-weight: 600;

  /* 呼吸动画：缩放 + 透明度脉动，体现「正在思考」 */
  .plan-loading-ico {
    font-size: 18px;
    color: var(--ai-violet);
    animation: plan-breathe 1.5s ease-in-out infinite;
  }
}
@keyframes plan-breathe {
  0%,
  100% {
    transform: scale(0.92);
    opacity: 0.65;
  }
  50% {
    transform: scale(1.18);
    opacity: 1;
  }
}
/* 策划结果标题（AI 产出，展示在场景列表上方） */
.plan-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  .plan-title-text {
    flex: 1;
    min-width: 0;
    font-size: 14px;
    font-weight: 700;
    color: var(--ai-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .plan-cat {
    flex-shrink: 0;
    padding: 3px 10px;
    border-radius: 8px;
    background: var(--ai-tint-strong);
    color: var(--ai-violet-deep);
    font-size: 11px;
    font-weight: 600;
  }
}
/* 缺省占位（未策划时展示，可点击触发策划） */
.scene-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 30px 16px;
  border: 2px dashed var(--ai-border-strong);
  border-radius: 13px;
  background: var(--ai-tint);
  text-align: center;
  transition: all 0.2s ease;

  .scene-empty-ico {
    font-size: 34px;
    color: var(--ai-violet);
    opacity: 0.55;
  }
  .scene-empty-title {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--ai-ink-soft);
  }
  .scene-empty-desc {
    font-size: 11.5px;
    color: var(--ai-muted);
  }
  &.clickable {
    cursor: pointer;
    &:hover {
      border-color: var(--ai-violet);
      background: var(--ai-tint-strong);

      .scene-empty-ico {
        opacity: 1;
      }
    }
  }
}
.scene-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.scene-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 9px 10px 9px 12px;
  border: 1px solid var(--ai-border);
  border-radius: 11px;
  background: #fff;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    border-color: var(--ai-border-strong);
    box-shadow: 0 4px 12px rgba(76, 29, 149, 0.08);
  }
  &.on {
    border-color: var(--ai-violet);
    background: var(--ai-tint);
  }
  /* 上部头部行：复选框 + 标题区 + 操作按钮（同一行） */
  .scene-head {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  /* 复选框（覆盖 EP 默认蓝色为 Aura 紫） */
  :deep(.el-checkbox) {
    flex-shrink: 0;
    height: auto;
    margin-top: 1px;
    --el-color-primary: #7c3aed;
  }
  .scene-info {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }
  .scene-title-row {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
  }
  .scene-name {
    min-width: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--ai-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .scene-tag {
    flex-shrink: 0;
    max-width: 40%;
    padding: 2px 8px;
    border-radius: 6px;
    background: var(--ai-tint-strong);
    color: var(--ai-violet-deep);
    font-size: 11px;
    font-weight: 600;
    line-height: 1.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .scene-desc {
    font-size: 11px;
    color: var(--ai-muted);
  }
  /* 生图提示词：列表内可编辑输入框（默认填入 AI 产出，占满整行） */
  .scene-prompt {
    width: 100%;
    margin-top: 5px;
    :deep(.el-textarea) {
      width: 100%;
    }
    :deep(.el-textarea__inner) {
      min-height: 60px !important;
      padding: 7px 9px;
      border-radius: 8px;
      border-width: 1.5px;
      border-color: var(--ai-border);
      font-size: 12px;
      line-height: 1.55;
      color: var(--ai-ink-soft);
      &:focus {
        border-color: var(--ai-violet);
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
      }
    }
  }
  .scene-actions {
    display: flex;
    flex-shrink: 0;
    gap: 5px;
  }
  .mod-act {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border: 1px solid var(--ai-border);
    border-radius: 8px;
    background: #fff;
    color: var(--ai-ink-soft);
    font-size: 15px;
    cursor: pointer;
    transition: all 0.18s ease;

    &:hover {
      color: var(--ai-violet-deep);
      border-color: var(--ai-violet);
      background: var(--ai-tint);
    }
    &.danger:hover {
      color: var(--ai-coral);
      border-color: var(--ai-coral);
      background: rgba(251, 113, 133, 0.08);
    }
  }
}
</style>

<style lang="scss">
/* 场景设置 popover（teleport 到 body，非 scoped） */
.scene-cfg-pop.el-popover.el-popper {
  padding: 0 !important;
  border-radius: 14px !important;
  border: 1px solid #e8e6f0 !important;
  box-shadow: 0 12px 36px rgba(31, 34, 51, 0.14) !important;
  /* 允许内部 el-select(teleported=false) 下拉框溢出弹层显示，不被圆角裁切 */
  overflow: visible !important;

  .el-select__wrapper {
    min-height: 34px;
    border-radius: 9px;
    box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.08) inset !important;
    transition: box-shadow 0.2s;
    &:hover {
      box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.16) inset !important;
    }
    &.is-focused {
      box-shadow: 0 0 0 2px #8b5cf6 inset !important;
    }
  }
  .el-input__wrapper {
    min-height: 34px;
    border-radius: 9px;
    box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.08) inset !important;
    &:hover {
      box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.16) inset !important;
    }
    &.is-focus {
      box-shadow: 0 0 0 2px #8b5cf6 inset !important;
    }
  }
}
.cfg-pop-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px 14px;
  border-bottom: 1px solid #f0eef5;
}
.cfg-pop-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 20px 20px;
  /* 不设 overflow/max-height：避免裁切 el-select(teleported=false) 的下拉选项 */
}
.cfg-pop-head-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.cfg-pop-title {
  font-size: 15px;
  font-weight: 700;
  color: #1f2233;
}
.cfg-pop-sub {
  font-size: 12px;
  color: #8a8fa3;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cfg-close {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: #8a8fa3;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.18s;
  &:hover {
    background: #f3f4f8;
    color: #1f2233;
  }
}
.cfg-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cfg-field label {
  font-size: 12px;
  font-weight: 500;
  color: #8a8fa3;

  .req {
    color: #fb7185;
    font-style: normal;
    margin-left: 2px;
  }
}
.cfg-field .el-select,
.cfg-field .el-input-number,
.cfg-field .el-input {
  width: 100%;
}
.cfg-hint-inline {
  font-size: 11px;
  color: #a0a4b4;
}
/* 模型选择下拉（popover 内 teleported=false，但仍需样式） */
.scene-cfg-pop .model-opt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}
.scene-cfg-pop .model-opt-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.scene-cfg-pop .model-opt-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2233;
}
.scene-cfg-pop .model-opt-desc {
  font-size: 12px;
  color: #8a8fa3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.scene-cfg-pop .model-opt-side {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
}
.scene-cfg-pop .model-opt-type {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;

  &.vision {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  }
  &.text {
    background: #64748b;
  }
}
.scene-cfg-pop .model-opt-vendor {
  font-size: 11px;
  color: #8a8fa3;
}

/* 上传进度弹窗（teleport 到 body，非 scoped） */
.upload-progress-dialog.el-dialog {
  border-radius: 18px !important;
  overflow: hidden;
}
.upload-progress-dialog .el-dialog__header {
  display: none;
}
.upload-progress-dialog .el-dialog__body {
  padding: 32px 28px 28px;
}
.upload-progress-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.upload-progress-body .up-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-bottom: 4px;
  border-radius: 14px;
  background: linear-gradient(135deg, #ede9fe, #f3eeff);
  color: #7c3aed;
  font-size: 24px;
}
.upload-progress-body .up-title {
  font-size: 15px;
  font-weight: 700;
  color: #1f2233;
}
.upload-progress-body .up-label {
  font-size: 12px;
  color: #8a8fa3;
  margin-bottom: 6px;
}
.upload-progress-body .el-progress {
  width: 100%;
}
</style>

<style lang="scss" scoped>
@media (max-width: 520px) {
  .left {
    width: 100%;
    max-width: 100%;
    flex: 0 0 auto;
  }

  .panel-foot {
    align-items: stretch;
    flex-direction: column;
  }

  .gen-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

<style lang="scss">
@media (max-width: 720px) {
  .scene-cfg-pop,
  .upload-progress-dialog.el-dialog {
    max-width: calc(100vw - 24px);
  }
}
</style>
