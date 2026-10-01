<template>
  <aside class="panel left">
    <div class="panel-head">
      <span class="head-ico">
        <f-svg-icon name="goods-tt" color="#fff" size="25"/>
      </span>
      <div class="head-text">
        <h3>AI 商品套图</h3>
        <p>上传产品图， 自动生成主图、详情页等整套电商图</p>
      </div>
    </div>

    <div class="panel-body">
      <!-- 电商平台 -->
      <section class="field">
        <div class="field-label">
          <span>电商平台 <i class="req">*</i></span>
        </div>
        <div class="chip-wrap">
          <button
            v-for="p in platforms"
            :key="p"
            class="chip"
            :class="{ on: form.platform === p }"
            @click="form.platform = p"
          >{{ p }}</button>
        </div>
      </section>

      <!-- 上传商品图 -->
      <section class="field">
        <div class="field-label">
          <span>上传商品图 <i class="req">*</i></span>
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
        >
          <el-icon class="upload-ico"><Plus /></el-icon>
        </el-upload>
        <div class="upload-notice">
          <el-icon class="upload-notice-ico"><InfoFilled /></el-icon>
          <span>请上传 <b>同一产品 / 整套产品</b> 图片，可上传多张不同角度 / 细节图，产品主体清晰的白底图效果更佳。</span>
        </div>
        <p class="hint">支持 1-3 张，单张不超过 10M，建议白底 / 纯色底</p>
      </section>

      <!-- 选择模型 -->
      <section class="field">
        <div class="field-label"><span>出图模型 <i class="req">*</i></span></div>
        <el-select v-model="selectedModelCode" class="sel" placeholder="请选择模型" popper-class="model-select-popper">
          <el-option v-for="m in models" :key="m.code" :label="m.name" :value="m.code">
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
      </section>

      <!-- 国家 / 地区 -->
      <section class="field">
        <div class="field-label"><span>国家 / 地区</span></div>
        <el-select v-model="form.region" class="sel">
          <el-option v-for="r in regions" :key="r" :label="r" :value="r" />
        </el-select>
      </section>

      <!-- 文案语种 -->
      <section class="field">
        <div class="field-label"><span>文案语种</span></div>
        <el-select v-model="form.copyLanguage" class="sel" filterable>
          <el-option v-for="l in copyLanguageOptions" :key="l" :label="l" :value="l" />
        </el-select>
      </section>

      <!-- 视觉风格 -->
      <section class="field">
        <div class="field-label"><span>视觉风格</span></div>
        <el-select v-model="form.visualStyle" class="sel" filterable clearable placeholder="选择视觉风格">
          <el-option v-for="v in visualStyleOptions" :key="v" :label="v" :value="v" />
        </el-select>
      </section>

      <!-- 目标市场 -->
      <section class="field">
        <div class="field-label"><span>目标市场</span></div>
        <el-select v-model="form.targetMarket" class="sel" filterable clearable placeholder="选择目标市场">
          <el-option v-for="t in targetMarketOptions" :key="t" :label="t" :value="t" />
        </el-select>
      </section>

      <!-- 全局默认配置（画面比例 + 分辨率，可一键应用到所有套图模块） -->
      <section v-if="modelRatios.length || modelSizes.length" class="field">
        <div class="field-label">
          <span>全局默认配置</span>
          <div class="apply-all-wrap">
            <span v-if="globalDirty" class="apply-dirty-hint"><i class="dirty-dot"></i>有未应用的变更</span>
            <button class="apply-all-btn" :class="{ dirty: globalDirty }" @click="applyGlobalToAll">
              <el-icon v-if="globalDirty" class="dirty-arrow"><Right /></el-icon>应用到所有模块
            </button>
          </div>
        </div>

        <!-- 画面比例 -->
        <div v-if="modelRatios.length" class="sub-field">
          <span class="sub-label">画面比例</span>
          <div class="ratio-grid">
            <button class="ratio" :class="{ on: form.ratio === 'auto' }" @click="form.ratio = 'auto'">
              <div class="flex flex-col items-center justify-center gap-y-[3px]" style="height: 100%;">
                <span class="ratio-text">自动</span>
                <span class="ratio-sub">自适应处理</span>
              </div>
            </button>
            <button
              v-for="r in modelRatios"
              :key="r.value"
              class="ratio"
              :class="{ on: form.ratio === r.value }"
              @click="form.ratio = r.value"
            >
              <span class="ratio-box"><span class="ratio-shape" :style="ratioShape(r)"></span></span>
              <span class="ratio-text">{{ r.value }}</span>
            </button>
          </div>
        </div>

        <!-- 分辨率（首位「自动」） -->
        <div v-if="modelSizes.length" class="sub-field">
          <span class="sub-label">分辨率</span>
          <div class="ratio-grid">
            <button class="ratio" :class="{ on: form.size === 'auto' }" @click="form.size = 'auto'">
              <span class="ratio-text">自动</span>
              <span class="ratio-sub">自适应处理</span>
            </button>
            <button
              v-for="s in modelSizes"
              :key="s.value"
              class="ratio"
              :class="{ on: form.size === s.value }"
              @click="form.size = s.value"
            >
              <span class="ratio-text">{{ s.title }}</span>
              <span class="ratio-sub">{{ s.sub }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- 商品卖点 -->
      <section class="field">
        <div class="field-label">
          <span>核心卖点</span>
          <button v-if="aiWriteAssistant" class="ai-write" :disabled="aiBusy" @click="aiWrite">
            <f-svg-icon :name="ASSISTANT_KEY_AI_WRITE" size="13px" color="currentColor" />{{ aiBusy ? "生成中…" : aiWriteAssistant.name }}<span v-if="!aiBusy && aiWritePriceText" class="ai-write-price">{{ aiWritePriceText }}</span>
          </button>
        </div>
        <el-input
          v-model="form.sellingPoints"
          class="ta"
          type="textarea"
          :rows="6"
          maxlength="800"
          show-word-limit
          resize="none"
          placeholder="建议包含以下信息生成更精准:
1.产品名称
2.核心卖点
3.适用人群
4.期望场景
5.具体参数"
        />
      </section>

      <!-- 套图模块（必选：弹窗添加 + 列表展示，单个可设置） -->
      <section class="field">
        <div class="field-label">
          <span>套图模块 <i class="req">*</i></span>
          <span class="tip">已选 {{ selectedModules.length }}</span>
        </div>
        <div class="mod-list">
          <div v-for="m in selectedModules" :key="m.uid" class="mod-item">
            <div class="mod-info">
              <span class="mod-name">{{ m.name }}</span>
              <span v-if="m.desc" class="mod-summary">{{ m.desc }}</span>
              <span class="mod-desc">数量：{{ m.count }} · 比例：{{ m.ratio === "auto" ? "自动" : m.ratio }} · 分辨率：{{ m.resolution === "auto" ? "自动" : m.resolution ? sizeMeta(m.resolution).title : "-" }}</span>
            </div>
            <div class="mod-actions">
              <button class="mod-act danger" title="删除" @click="removeModule(m)"><el-icon><Delete /></el-icon></button>
              <el-popover v-model:visible="popoverVisible[m.uid]" trigger="click" :placement="popoverPlacement" :width="680" :show-arrow="true" popper-class="mod-cfg-pop">
                <template #reference>
                  <button class="mod-act" title="设置"><el-icon><Setting /></el-icon></button>
                </template>
                <div class="cfg-pop-header">
                  <div class="cfg-pop-head-text">
                    <span class="cfg-pop-title">{{ m.name }}</span>
                    <span v-if="m.desc" class="cfg-pop-sub">{{ m.desc }}</span>
                  </div>
                  <button class="cfg-close" @click="popoverVisible[m.uid] = false"><el-icon><Close /></el-icon></button>
                </div>
                <div class="cfg-pop-body">
                  <div class="cfg-cols">
                    <!-- 左列 -->
                    <div class="cfg-col">
                      <div class="cfg-group-title">基础</div>
                      <div class="cfg-field">
                        <label>生成数量</label>
                        <el-input-number v-model="m.count" :min="1" :max="20" />
                      </div>
                      <div class="cfg-field">
                        <label>画面比例</label>
                        <el-select :teleported="false" allow-create default-first-option filterable v-model="m.ratio" placeholder="请输入或选择">
                          <el-option label="自动" value="auto" />
                          <el-option v-for="r in modelRatios" :key="r.value" :label="r.value" :value="r.value" />
                        </el-select>
                      </div>
                      <div class="cfg-field">
                        <label>分辨率</label>
                        <el-select :teleported="false" allow-create default-first-option filterable v-model="m.resolution" placeholder="请输入或选择">
                          <el-option label="自动" value="auto" />
                          <el-option v-for="s in modelSizes" :key="s.value" :label="`${s.title} · ${s.sub}`" :value="s.value" />
                        </el-select>
                      </div>
                      <div class="cfg-group-title">个性化设置</div>
                      <div class="cfg-field">
                        <label>摆放状态</label>
                        <el-select :teleported="false" allow-create default-first-option filterable v-model="m.placement" clearable placeholder="请输入或选择">
                          <el-option v-for="p in placementOptions" :key="p" :label="p" :value="p" />
                        </el-select>
                      </div>
                      <div class="cfg-field">
                        <label>拍摄角度</label>
                        <el-select :teleported="false" allow-create default-first-option filterable v-model="m.shootAngle" clearable placeholder="请输入或选择">
                          <el-option v-for="a in shootAngleOptions" :key="a" :label="a" :value="a" />
                        </el-select>
                      </div>
                      <div class="cfg-field">
                        <label>有无模特</label>
                        <el-select :teleported="false" allow-create default-first-option filterable v-model="m.withModel" clearable placeholder="请输入或选择">
                          <el-option v-for="w in withModelOptions" :key="w" :label="w" :value="w" />
                        </el-select>
                      </div>
                      <div class="cfg-field">
                        <label>辅助信息</label>
                        <el-input v-model="m.auxInfo" placeholder="请输入，如：搭配木质底座" />
                      </div>
                      <div class="cfg-field">
                        <label>平台规范</label>
                        <el-select :teleported="false" allow-create default-first-option filterable v-model="m.platformSpec" clearable placeholder="请输入或选择">
                          <el-option v-for="p in platformSpecOptions" :key="p" :label="p" :value="p" />
                        </el-select>
                      </div>
                    </div>
                    <!-- 右列 -->
                    <div class="cfg-col">
                      <div class="cfg-group-title">通用设置 <span class="cfg-hint">留空沿用</span></div>
                      <div class="cfg-field">
                        <label>文案语种</label>
                        <el-select :teleported="false" allow-create default-first-option filterable v-model="m.copyLanguage" clearable placeholder="请输入或选择（空=沿用）">
                          <el-option v-for="l in copyLanguageOptions" :key="l" :label="l" :value="l" />
                        </el-select>
                      </div>
                      <div class="cfg-field">
                        <label>视觉风格</label>
                        <el-select :teleported="false" allow-create default-first-option filterable v-model="m.visualStyle" clearable placeholder="请输入或选择（空=沿用）">
                          <el-option v-for="v in visualStyleOptions" :key="v" :label="v" :value="v" />
                        </el-select>
                      </div>
                      <div class="cfg-field">
                        <label>文案需求</label>
                        <el-select :teleported="false" allow-create default-first-option filterable v-model="m.copyRequirement" clearable placeholder="请输入或选择">
                          <el-option v-for="c in copyRequirementOptions" :key="c" :label="c" :value="c" />
                        </el-select>
                      </div>
                      <div class="cfg-field">
                        <label>色调倾向</label>
                        <el-select :teleported="false" allow-create default-first-option filterable v-model="m.colorTone" clearable placeholder="请输入或选择">
                          <el-option v-for="c in colorToneOptions" :key="c" :label="c" :value="c" />
                        </el-select>
                      </div>
                      <div class="cfg-group-title">补充说明</div>
                      <div class="cfg-field">
                        <el-input v-model="m.supplement" type="textarea" :rows="3" placeholder="请输入，如：高光柔和、背景渐变等" />
                      </div>
                    </div>
                  </div>
                </div>
              </el-popover>
            </div>
          </div>
          <button class="mod-add" @click="openPicker">
            <el-icon><Plus /></el-icon>添加模块
          </button>
        </div>
      </section>
    </div>

    <!-- 底部生成 -->
    <div class="panel-foot">
      <div class="cost">预计消耗 <b><count-to :startVal="prevCostValue" :endVal="costDisplay.value" :duration="800" :decimals="costDisplay.decimals" /></b> 算力</div>
      <button class="gen-btn" @click="onGenerate">
        <f-svg-icon name="magic" color="#fff" size="20"/>生成套图
      </button>
    </div>

    <!-- 添加模块弹窗 -->
    <el-dialog v-model="pickerVisible" width="660px" append-to-body class="mod-picker">
      <template #header>
        <div class="dh">
          <span class="dh-title">选择套图模块</span>
          <span class="dh-sub">勾选需要的模块，支持多选</span>
        </div>
      </template>
      <div class="picker-grid">
        <div
          v-for="opt in moduleOptions"
          :key="opt.key"
          class="picker-card"
          :class="{ on: pickerSelected.includes(opt.key), added: addedKeys.includes(opt.key) }"
          @click="togglePick(opt.key)"
        >
          <div class="pc-top">
            <span class="pc-name">{{ opt.name }}</span>
            <span v-if="addedKeys.includes(opt.key)" class="pc-badge">已添加</span>
            <span v-else-if="pickerSelected.includes(opt.key)" class="pc-check"><el-icon><Check /></el-icon></span>
          </div>
          <p v-if="opt.desc" class="pc-desc">{{ opt.desc }}</p>
        </div>
      </div>
      <template #footer>
        <button class="dlg-btn ghost" @click="pickerVisible = false">取消</button>
        <button class="dlg-btn primary" @click="confirmPick">
          添加所选<span v-if="pickerSelected.length">（{{ pickerSelected.length }}）</span>
        </button>
      </template>
    </el-dialog>

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
        <div class="up-title">正在上传商品图</div>
        <div class="up-label">{{ uploadLabel }}</div>
        <el-progress :percentage="uploadPercent" color="#7c3aed" :stroke-width="8" :show-text="true" />
      </div>
    </el-dialog>
  </aside>
</template>

<script setup lang="ts" name="showcaseForm">
import { computed, reactive, ref } from "vue";
import { useWindowSize } from "@vueuse/core";
import { CountTo } from "vue3-count-to";
import { productCases } from "../../preview/fixtures";
import { useAuraPreviewGate } from "../../preview/useAuraPreviewGate";

interface DemoModule {
  uid: string;
  key: string;
  name: string;
  desc: string;
  count: number;
  ratio: string;
  resolution: string;
  placement: string;
  shootAngle: string;
  withModel: string;
  auxInfo: string;
  platformSpec: string;
  copyLanguage: string;
  visualStyle: string;
  copyRequirement: string;
  colorTone: string;
  supplement: string;
}

const { requireFullEdition } = useAuraPreviewGate();
const { width: viewportWidth } = useWindowSize();
const popoverPlacement = computed(() => viewportWidth.value <= 720 ? "bottom" : "right-start");
const demoSource = productCases[0]?.sourceUrls[0] || productCases[0]?.coverUrl || "";
const initialFile = { name: "正式案例商品原图", url: demoSource, status: "success" as const, uid: 1 };
const fileList = ref<any[]>([initialFile]);
const platforms = ["淘宝 / 天猫", "京东", "抖音电商", "小红书", "Amazon"];
const regions = ["中国大陆", "中国香港", "北美", "欧洲", "东南亚", "全球"];
const copyLanguageOptions = ["简体中文", "繁体中文", "英语", "日语", "韩语"];
const visualStyleOptions = ["高端极简", "自然生活", "轻奢商业", "未来科技", "东方美学"];
const targetMarketOptions = ["大众消费", "品质生活", "年轻潮流", "高端精品", "跨境电商"];
const placementOptions = ["居中摆放", "悬浮展示", "倾斜陈列", "组合陈列"];
const shootAngleOptions = ["正面平视", "45° 侧视", "俯拍", "微距特写"];
const withModelOptions = ["无需模特", "手部模特", "人物模特"];
const platformSpecOptions = ["平台主图", "详情页", "社交媒体", "广告投放"];
const copyRequirementOptions = ["突出核心卖点", "场景化表达", "简洁无文案", "品牌故事"];
const colorToneOptions = ["暖色柔光", "冷调高级", "自然明亮", "黑金质感", "品牌主色"];
const ASSISTANT_KEY_AI_WRITE = "magic";
const aiWriteAssistant = { name: "AI 帮写" };
const aiWritePriceText = "6 算力";
const aiBusy = ref(false);

const models = [
  { code: "aura-vision", name: "Aura Vision Pro", description: "商业级商品视觉与稳定文字表现", type: "quality", vendor: "Aura", price: 8 },
  { code: "aura-studio", name: "Aura Studio", description: "高一致性电商套图生成", type: "fast", vendor: "Aura", price: 6 },
  { code: "aura-render", name: "Aura Render X", description: "复杂光影与场景渲染", type: "quality", vendor: "Aura", price: 10 },
];
const selectedModelCode = ref(models[0].code);
const selectedModel = computed(() => models.find((item) => item.code === selectedModelCode.value) || models[0]);
const modelRatios = ["1:1", "4:5", "3:4", "16:9", "9:16"].map((value) => ({ value }));
const modelSizes = [
  { value: "1024", title: "1K", sub: "快速预览" },
  { value: "2048", title: "2K", sub: "电商高清" },
  { value: "4096", title: "4K", sub: "商业精修" },
];
const form = reactive({
  platform: platforms[0],
  region: regions[0],
  copyLanguage: copyLanguageOptions[0],
  visualStyle: visualStyleOptions[0],
  targetMarket: targetMarketOptions[1],
  ratio: "1:1",
  size: "2048",
  sellingPoints: "白松露精萃与三重植物油配方，轻盈补水、细腻焕亮，突出高端护肤质感与可信赖的品牌形象。",
});

const moduleOptions = [
  { key: "hero", name: "首屏视觉图", desc: "商品主视觉与品牌第一印象", count: 2 },
  { key: "white", name: "商品白底图", desc: "标准电商平台主图", count: 2 },
  { key: "scene", name: "场景氛围图", desc: "生活方式与使用场景", count: 2 },
  { key: "detail", name: "卖点细节图", desc: "材质、工艺与核心细节", count: 2 },
  { key: "poster", name: "营销海报图", desc: "活动推广与广告投放", count: 1 },
];

function createModule(option: (typeof moduleOptions)[number]): DemoModule {
  return {
    uid: `${option.key}-${Date.now()}`,
    key: option.key,
    name: option.name,
    desc: option.desc,
    count: option.count,
    ratio: form.ratio,
    resolution: form.size,
    placement: "居中摆放",
    shootAngle: "正面平视",
    withModel: "无需模特",
    auxInfo: "",
    platformSpec: "平台主图",
    copyLanguage: "",
    visualStyle: "",
    copyRequirement: "突出核心卖点",
    colorTone: "自然明亮",
    supplement: "",
  };
}

const selectedModules = ref<DemoModule[]>(moduleOptions.slice(0, 3).map(createModule));
const popoverVisible = reactive<Record<string, boolean>>({});
const pickerVisible = ref(false);
const pickerSelected = ref<string[]>([]);
const addedKeys = computed(() => selectedModules.value.map((item) => item.key));
const globalDirty = computed(() => selectedModules.value.some((item) => item.ratio !== form.ratio || item.resolution !== form.size));
const totalImages = computed(() => selectedModules.value.reduce((sum, item) => sum + item.count, 0));
const costValue = computed(() => totalImages.value * selectedModel.value.price);
const costDisplay = computed(() => ({ value: costValue.value, decimals: 0 }));
const prevCostValue = ref(costValue.value);
const uploadVisible = ref(false);
const uploadLabel = ref("");
const uploadPercent = ref(0);

function typeLabel(type: string) { return type === "fast" ? "快速" : "高品质"; }
function ratioShape(item: { value: string }) {
  const [width, height] = item.value.split(":").map(Number);
  const max = 24;
  return width >= height
    ? { width: `${max}px`, height: `${Math.max(9, max * height / width)}px` }
    : { width: `${Math.max(9, max * width / height)}px`, height: `${max}px` };
}
function sizeMeta(value: string) { return modelSizes.find((item) => item.value === value) || { title: value, sub: "" }; }
function applyGlobalToAll() { selectedModules.value.forEach((item) => { item.ratio = form.ratio; item.resolution = form.size; }); }
function removeModule(module: DemoModule) { selectedModules.value = selectedModules.value.filter((item) => item.uid !== module.uid); }
function openPicker() { pickerSelected.value = []; pickerVisible.value = true; }
function togglePick(key: string) {
  if (addedKeys.value.includes(key)) return;
  pickerSelected.value = pickerSelected.value.includes(key)
    ? pickerSelected.value.filter((item) => item !== key)
    : [...pickerSelected.value, key];
}
function confirmPick() {
  moduleOptions.filter((item) => pickerSelected.value.includes(item.key) && !addedKeys.value.includes(item.key)).forEach((item) => selectedModules.value.push(createModule(item)));
  pickerVisible.value = false;
}
function onUploadClick(event: Event) { event.preventDefault(); event.stopPropagation(); requireFullEdition("上传商品素材", "upload"); }
function onFileChange() { fileList.value = [initialFile]; requireFullEdition("上传商品素材", "upload"); }
function onExceed() { requireFullEdition("上传更多商品素材", "upload"); }
function aiWrite() { requireFullEdition("AI 帮写商品卖点", "generate"); }
function onGenerate() { requireFullEdition("生成商品套图", "generate"); }
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

      /* 扫光束：斜向白色光带周期性掠过 */
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
    .apply-all-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .apply-dirty-hint {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 600;
      color: var(--ai-coral);
      .dirty-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--ai-coral);
        animation: global-dirty-pulse 1.2s ease-in-out infinite;
      }
    }
    .apply-all-btn {
      position: relative;
      z-index: 0;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      height: 26px;
      padding: 0 11px;
      border: none;
      border-radius: 8px;
      background: var(--ai-tint-strong);
      color: var(--ai-violet-deep);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: color 0.22s ease;
      /* hover/dirty 渐变层：淡入，避免渐变突变 */
      &::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 8px;
        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        opacity: 0;
        transition: opacity 0.25s ease;
        z-index: -1;
        pointer-events: none;
      }
      &:hover {
        color: #fff;
        &::before {
          opacity: 1;
        }
      }
      /* 有未应用变更时：换强色 + 跳动箭头，提醒点击「应用到所有模块」 */
      &.dirty {
        color: #fff;
        box-shadow: 0 4px 12px rgba(124, 58, 237, 0.28);
        &::before {
          opacity: 1;
        }
        .dirty-arrow {
          font-size: 13px;
          animation: global-dirty-bounce 1s ease-in-out infinite;
        }
      }
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

/* 全局默认配置「未应用变更」提示动画 */
@keyframes global-dirty-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.35; transform: scale(0.65); }
}
@keyframes global-dirty-bounce {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(3px); }
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

.sel {
  width: 100%;

  :deep(.el-select__wrapper) {
    min-height: 38px;
    border-radius: 10px;
    box-shadow: 0 0 0 2px var(--ai-border) inset;
    &:hover {
      box-shadow: 0 0 0 2px var(--ai-border-strong) inset;
    }
    &.is-focused {
      box-shadow: 0 0 0 2px var(--ai-violet) inset;
    }
  }
}
.ta {
  :deep(.el-textarea__inner) {
    border-radius: 10px;
    border-width: 2px;
    border-color: var(--ai-border);
    color: var(--ai-ink);
    &:focus {
      border-color: var(--ai-violet);
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
    }
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

.ai-write {
  position: relative;
  z-index: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 11px;
  border: none;
  border-radius: 8px;
  background: var(--ai-tint-pink);
  color: var(--ai-pink);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.22s ease, transform 0.22s ease;

  /* hover 渐变层：淡入，避免渐变突变 */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 8px;
    background: linear-gradient(135deg, #ec4899, #be185d);
    opacity: 0;
    transition: opacity 0.25s ease;
    z-index: -1;
    pointer-events: none;
  }
  .el-icon {
    font-size: 13px;
  }
  .f-svg-icon {
    transition: transform 0.25s ease;
  }
  .ai-write-price {
    font-size: 11px;
    font-weight: 500;
    opacity: 0.75;
  }
  &:not(:disabled):hover {
    color: #fff;
    transform: translateY(-1px);
    &::before {
      opacity: 1;
    }
    .f-svg-icon {
      transform: scale(1.18);
    }
  }
  &:disabled {
    cursor: progress;
    opacity: 0.7;
  }
}

.mod-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mod-item {
  display: flex;
  align-items: center;
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
  .mod-info {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }
  .mod-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--ai-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* 模块描述小字（标题下方独立一行，仅有描述时展示） */
  .mod-summary {
    font-size: 11px;
    color: var(--ai-muted);
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .mod-desc {
    font-size: 11px;
    color: var(--ai-muted);
  }
  .mod-actions {
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
.mod-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 38px;
  border: 1.5px dashed var(--ai-border-strong);
  border-radius: 11px;
  background: var(--ai-tint);
  color: var(--ai-violet-deep);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;

  .el-icon {
    font-size: 15px;
  }
  &:hover {
    border-color: var(--ai-violet);
    background: var(--ai-tint-strong);
  }
}
</style>

<style lang="scss">
/* 模块设置 popover（teleport 到 body，非 scoped） */
.mod-cfg-pop.el-popover.el-popper {
  padding: 0 !important;
  border-radius: 14px !important;
  border: 1px solid #e8e6f0 !important;
  box-shadow: 0 12px 36px rgba(31, 34, 51, 0.14) !important;

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
  .el-textarea__inner {
    border-radius: 9px;
    border: 2px solid rgba(124, 58, 237, 0.08);
    box-shadow: none;
    &:focus {
      border-color: #8b5cf6;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
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
  padding: 14px 20px 20px;
  max-height: 460px;
  overflow-y: auto;
  scrollbar-width: thin;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.2); border-radius: 5px; }
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
/* 模块描述小字（标题下方，仅有描述时展示） */
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
.cfg-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 18px;
}
.cfg-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
}
.cfg-field .el-select,
.cfg-field .el-input-number,
.cfg-field .el-input {
  width: 100%;
}
.cfg-group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 16px 0 4px;
  padding-bottom: 6px;
  border-bottom: 1px dashed #ece9f5;
  font-size: 12px;
  font-weight: 700;
  color: #7c3aed;
  letter-spacing: 0.5px;
  &:first-child {
    margin-top: 0;
  }
  &::before {
    content: "";
    display: inline-block;
    width: 3px;
    height: 12px;
    border-radius: 2px;
    background: linear-gradient(180deg, #8b5cf6, #7c3aed);
  }
  .cfg-hint {
    font-weight: 400;
    font-size: 11px;
    color: #a0a4b4;
    letter-spacing: 0;
  }
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

/* 套图模块弹窗（teleport 到 body，非 scoped） */
.mod-picker.el-dialog {
  border-radius: 18px !important;
  overflow: hidden;
}
.mod-picker .el-dialog__header {
  padding: 0;
  margin-right: 0;
}
.mod-picker .el-dialog__body {
  padding: 0 22px 20px;
}
.mod-picker .el-dialog__footer {
  padding: 14px 22px 20px;
}
.dh {
  padding: 20px 56px 14px 24px;
  border-bottom: 1px solid #eceaf5;

  .dh-title {
    display: block;
    font-size: 16px;
    font-weight: 700;
    color: #1f2233;
  }
  .dh-sub {
    display: block;
    margin-top: 3px;
    font-size: 12px;
    color: #8a8fa3;
  }
}
.picker-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding-top: 16px;
}
.picker-card {
  padding: 12px 13px;
  border: 1.5px solid #eceaf5;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    border-color: #c4b5fd;
    background: #faf8ff;
  }
  &.on {
    border-color: #7c3aed;
    background: #f3eeff;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.16);
  }
  &.added {
    opacity: 0.45;
    cursor: not-allowed;
    &:hover {
      border-color: #eceaf5;
      background: #fff;
    }
  }
  .pc-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .pc-name {
    font-size: 13px;
    font-weight: 600;
    color: #1f2233;
  }
  .pc-badge {
    flex-shrink: 0;
    padding: 1px 7px;
    border-radius: 6px;
    background: #efe9ff;
    color: #7c3aed;
    font-size: 10px;
    font-weight: 600;
  }
  .pc-check {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #7c3aed;
    color: #fff;
    font-size: 11px;
  }
  .pc-desc {
    margin: 5px 0 0;
    min-height: 16px;
    font-size: 11px;
    line-height: 1.45;
    color: #8a8fa3;
  }
}
.dlg-btn {
  height: 36px;
  padding: 0 18px;
  margin-left: 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;

  &.ghost {
    border: 1px solid #e2e0ec;
    background: #fff;
    color: #525666;

    &:hover {
      border-color: #c4b5fd;
      color: #7c3aed;
    }
  }
  &.primary {
    border: none;
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    color: #fff;
    box-shadow: 0 6px 14px rgba(124, 58, 237, 0.28);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 9px 18px rgba(124, 58, 237, 0.36);
    }
  }
}

/* 模型选择下拉（teleport 到 body，非 scoped，硬编码色值） */
.model-select-popper.el-select__popper {
  .el-select-dropdown__item {
    height: auto;
    line-height: 1.45;
    padding: 8px 12px;
  }
  .model-opt {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
  }
  /* 左：模型名 + 描述小字（标题下方只放小字，不放标签） */
  .model-opt-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .model-opt-name {
    font-size: 14px;
    font-weight: 600;
    color: #1f2233;
  }
  .model-opt-desc {
    font-size: 12px;
    color: #8a8fa3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* 右：其他信息统一靠右（类型徽章 + 厂商小字） */
  .model-opt-side {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 3px;
  }
  /* 类型：实心彩色徽章（视觉=紫渐变 / 文本=灰） */
  .model-opt-type {
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
  .model-opt-vendor {
    font-size: 11px;
    color: #8a8fa3;
  }
  .el-select-dropdown__item.selected .model-opt-name {
    color: #7c3aed;
  }
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
  .mod-cfg-pop,
  .mod-picker.el-dialog,
  .upload-progress-dialog.el-dialog {
    max-width: calc(100vw - 24px);
  }
}
</style>
