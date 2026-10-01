<template>
  <section class="editor-panel block-editor-panel">
    <template v-if="block">
      <div class="panel-head">
        <h3>编辑模块</h3>
        <div class="panel-actions">
          <span class="type-chip" :style="{ '--type-color': typeMeta.color }">
            <el-icon><component :is="typeMeta.icon" /></el-icon>
            {{ typeMeta.label }}
          </span>
          <label class="visibility-switch">
            <span>显示</span>
            <el-switch v-model="block.visible" />
          </label>
        </div>
      </div>

      <el-form label-position="top" class="block-form">
        <div class="title-row">
          <el-form-item label="模块标题" class="grow-item">
            <el-input v-model="block.title" maxlength="80" />
          </el-form-item>
          <el-form-item label="模块主题色">
            <el-color-picker
              v-model="block.theme_color"
              :predefine="presetColors"
              :show-alpha="false"
              clearable
            />
          </el-form-item>
        </div>

        <template v-if="block.type === 'hero'">
          <el-form-item label="主标题">
            <el-input v-model="block.content.headline" maxlength="120" />
          </el-form-item>
          <el-form-item label="副标题">
            <el-input v-model="block.content.subheadline" type="textarea" :rows="3" maxlength="300" show-word-limit />
          </el-form-item>
          <el-form-item label="按钮文案">
            <el-input v-model="block.content.button_text" maxlength="30" />
          </el-form-item>
        </template>

        <template v-if="block.type === 'cta'">
          <el-form-item label="号召标题">
            <el-input v-model="block.content.headline" maxlength="120" />
          </el-form-item>
          <el-form-item label="补充说明">
            <el-input v-model="block.content.description" type="textarea" :rows="3" maxlength="300" show-word-limit />
          </el-form-item>
          <el-form-item label="按钮文案">
            <el-input v-model="block.content.button_text" maxlength="30" />
          </el-form-item>
        </template>

        <template v-if="block.type === 'richText'">
          <el-form-item label="段落小标题">
            <el-input v-model="block.content.title" maxlength="60" />
          </el-form-item>
          <el-form-item label="段落内容（每行一段）">
            <el-input :model-value="linesValue('paragraphs')" type="textarea" :rows="6" @update:model-value="(value: string) => updateLines('paragraphs', value)" />
          </el-form-item>
          <el-form-item label="图片">
            <div class="rich-images">
              <div v-for="(key, index) in block.content.image_keys || []" :key="key" class="qr-thumb">
                <el-image :src="mediaPreviewUrls[key]" fit="cover" />
                <span class="rich-image-order">{{ index + 1 }}</span>
                <button type="button" class="media-thumb-remove" aria-label="移除图片" @click.stop="removeRichImage(index)">
                  <el-icon><Close /></el-icon>
                </button>
              </div>
              <div
                v-if="(block.content.image_keys?.length || 0) < 15"
                class="qr-thumb is-empty"
                role="button"
                tabindex="0"
                @click="openRichImagePicker()"
                @keydown.enter="openRichImagePicker()"
              >
                <el-icon><Plus /></el-icon>
                <span>添加图片</span>
              </div>
            </div>
            <span class="field-hint">选填。最多 15 张，按排列顺序随段落展示。</span>
          </el-form-item>
        </template>

        <template v-if="block.type === 'video'">
          <el-form-item label="视频">
            <div v-if="mediaPreviewUrls[block.content.video_key]" class="media-preview-box">
              <video :src="mediaPreviewUrls[block.content.video_key]" controls preload="metadata" />
              <button type="button" class="media-thumb-remove" aria-label="移除视频" @click.stop="block.content.video_key = ''">
                <el-icon><Close /></el-icon>
              </button>
              <button type="button" class="media-change-button" @click.stop="openMediaPicker(block.content, 'video_key', 'video')">更换视频</button>
            </div>
            <div
              v-else
              class="media-preview-box is-empty"
              role="button"
              tabindex="0"
              @click="openMediaPicker(block.content, 'video_key', 'video')"
              @keydown.enter="openMediaPicker(block.content, 'video_key', 'video')"
            >
              <el-icon><VideoCameraFilled /></el-icon>
              <span>从云空间选择视频</span>
            </div>
          </el-form-item>
          <el-form-item label="封面图片">
            <div
              v-if="mediaPreviewUrls[block.content.cover_image_key] || block.content.cover_url"
              class="media-preview-box is-image"
              role="button"
              tabindex="0"
              title="点击重新选择"
              @click="openMediaPicker(block.content, 'cover_image_key', 'image')"
              @keydown.enter="openMediaPicker(block.content, 'cover_image_key', 'image')"
            >
              <el-image :src="mediaPreviewUrls[block.content.cover_image_key] || block.content.cover_url" fit="cover" />
              <button
                type="button"
                class="media-thumb-remove"
                aria-label="移除封面"
                @click.stop="block.content.cover_image_key = ''; block.content.cover_url = ''"
              >
                <el-icon><Close /></el-icon>
              </button>
            </div>
            <div
              v-else
              class="media-preview-box is-empty"
              role="button"
              tabindex="0"
              @click="openMediaPicker(block.content, 'cover_image_key', 'image')"
              @keydown.enter="openMediaPicker(block.content, 'cover_image_key', 'image')"
            >
              <el-icon><Picture /></el-icon>
              <span>从云空间选择封面图片</span>
            </div>
          </el-form-item>
        </template>

        <el-form-item v-if="block.type === 'features'" label="优势内容（每行一项）">
          <el-input :model-value="linesValue('items')" type="textarea" :rows="5" @update:model-value="(value: string) => updateLines('items', value)" />
        </el-form-item>

        <el-form-item v-if="block.type === 'logoWall'" label="合作伙伴名称（每行一个）">
          <el-input :model-value="linesValue('items')" type="textarea" :rows="5" @update:model-value="(value: string) => updateLines('items', value)" />
        </el-form-item>

        <template v-if="block.type === 'contact'">
          <el-row :gutter="12">
            <el-col :span="12">
              <el-form-item label="联系电话">
                <el-input v-model="block.content.phone" maxlength="50" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系邮箱">
                <el-input v-model="block.content.email" maxlength="100" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="联系地址">
            <el-input v-model="block.content.address" maxlength="200" />
          </el-form-item>
          <el-form-item label="二维码">
            <div
              v-if="block.content.qr_image_key"
              class="qr-thumb"
              role="button"
              tabindex="0"
              @click="openMediaPicker(block.content, 'qr_image_key', 'image')"
              @keydown.enter="openMediaPicker(block.content, 'qr_image_key', 'image')"
            >
              <el-image :src="mediaPreviewUrls[block.content.qr_image_key]" fit="contain" />
              <button type="button" class="media-thumb-remove" aria-label="移除二维码" @click.stop="block.content.qr_image_key = ''">
                <el-icon><Close /></el-icon>
              </button>
            </div>
            <div
              v-else
              class="qr-thumb is-empty"
              role="button"
              tabindex="0"
              @click="openMediaPicker(block.content, 'qr_image_key', 'image')"
              @keydown.enter="openMediaPicker(block.content, 'qr_image_key', 'image')"
            >
              <el-icon><Plus /></el-icon>
              <span>选择二维码</span>
            </div>
            <span class="field-hint">选填。如企业微信、公众号等联系二维码。</span>
          </el-form-item>
        </template>

        <div v-if="block.type === 'gallery'" class="gallery-grid">
          <div v-for="(item, index) in block.content.images || []" :key="index" class="gallery-card">
            <div
              class="gallery-cover"
              :class="{ 'is-empty': !item.image_key && !item.cover_url }"
              @click="!item.image_key && !item.cover_url && openMediaPicker(item, 'image_key', 'image')"
            >
              <el-image
                v-if="item.image_key || item.cover_url"
                :src="mediaPreviewUrls[item.image_key] || item.cover_url"
                :preview-src-list="[mediaPreviewUrls[item.image_key] || item.cover_url]"
                preview-teleported
                fit="cover"
              />
              <el-icon v-else><Plus /></el-icon>
              <span class="gallery-order">{{ index + 1 }}</span>
              <button type="button" class="media-change-button" @click.stop="openMediaPicker(item, 'image_key', 'image')">更换</button>
              <button type="button" class="media-thumb-remove" aria-label="删除图片" @click.stop="removeListItem(index)">
                <el-icon><Close /></el-icon>
              </button>
            </div>
            <el-input v-model="item.alt" size="small" placeholder="图片说明（选填）" maxlength="120" />
          </div>
          <div
            v-if="(block.content.images?.length || 0) < 20"
            class="gallery-card is-add"
            role="button"
            tabindex="0"
            @click="addGalleryImages()"
            @keydown.enter="addGalleryImages()"
          >
            <div class="gallery-cover is-empty is-add-cover">
              <el-icon><Plus /></el-icon>
              <span>添加图片</span>
            </div>
          </div>
        </div>

        <div v-else-if="listConfig" class="repeat-list">
          <div v-for="(item, index) in block.content[listConfig.field] || []" :key="index" class="repeat-item">
            <div class="repeat-head">
              <span>{{ listConfig.label }} {{ index + 1 }}</span>
              <el-button size="small" text type="danger" aria-label="删除条目" @click="removeListItem(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-row :gutter="12">
              <el-col v-for="field in normalListFields" :key="field.key" :span="normalFieldSpan">
                <el-form-item :label="field.label">
                  <el-input v-model="item[field.key]" maxlength="120" />
                </el-form-item>
              </el-col>
              <el-col v-for="field in mediaListFields" :key="field.key" :span="6">
                <el-form-item :label="field.label">
                  <div
                    v-if="item[field.key] || item.cover_url"
                    class="media-thumb"
                    role="button"
                    tabindex="0"
                    @click="openMediaPicker(item, field.key, field.mediaType!)"
                    @keydown.enter="openMediaPicker(item, field.key, field.mediaType!)"
                  >
                    <el-image :src="mediaPreviewUrls[item[field.key]] || item.cover_url" fit="cover" />
                    <button type="button" class="media-thumb-remove" aria-label="移除图片" @click.stop="item[field.key] = ''; item.cover_url = ''">
                      <el-icon><Close /></el-icon>
                    </button>
                  </div>
                  <div
                    v-else
                    class="media-thumb is-empty"
                    role="button"
                    tabindex="0"
                    @click="openMediaPicker(item, field.key, field.mediaType!)"
                    @keydown.enter="openMediaPicker(item, field.key, field.mediaType!)"
                  >
                    <el-icon><Plus /></el-icon>
                    <span>选择{{ field.mediaType === 'image' ? '图片' : '视频' }}</span>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item v-for="field in textareaListFields" :key="field.key" :label="field.label">
              <el-input v-model="item[field.key]" type="textarea" :rows="3" maxlength="500" show-word-limit />
            </el-form-item>
          </div>
          <el-button class="repeat-add" size="small" text type="primary" @click="addListItem">
            <el-icon><Plus /></el-icon>
            添加{{ listConfig.label }}
          </el-button>
        </div>

        <el-form-item label="模块补充提示词">
          <el-input
            v-model="block.prompt"
            type="textarea"
            :rows="3"
            :placeholder="typeMeta.promptPlaceholder"
            maxlength="500"
            show-word-limit
          />
          <span class="field-hint">选填。生成该模块内容时追加给 AI 的额外要求。</span>
        </el-form-item>
      </el-form>
    </template>

    <el-empty v-else class="block-empty" description="从左侧选择一个模块进行编辑" :image-size="88" />
  </section>

</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useDemoGate } from "@/composables/useDemoGate";
import type { SiteBlock } from "@/views/biz/sitebuilder/types";
import { blockTypeMeta } from "../blockCatalog";

const { block, initialMediaPreviewUrls } = defineProps<{
  block?: SiteBlock;
  initialMediaPreviewUrls?: Record<string, string>;
}>();

/** 当前模块类型元信息 */
const typeMeta = computed(() => blockTypeMeta[block?.type || ""] || { label: block?.type || "-", icon: "Document", color: "#64748b" });

/** 主题色快捷预设 */
const presetColors = ["#2563eb", "#7c3aed", "#0d9488", "#dc2626", "#d97706", "#0f172a"];

type CloudMediaType = "image" | "video";
type ListField = { key: string; label: string; textarea?: boolean; mediaType?: CloudMediaType };
type ListBlockConfig = { field: string; label: string; fields: ListField[]; create: () => Record<string, string> };

/** 列表型模块配置 */
const listBlockConfigs: Record<string, ListBlockConfig> = {
  gallery: { field: "images", label: "图片", fields: [{ key: "image_key", label: "图片", mediaType: "image" }, { key: "alt", label: "图片说明" }], create: () => ({ image_key: "", alt: "" }) },
  cases: { field: "items", label: "案例", fields: [{ key: "title", label: "案例名称" }, { key: "client", label: "客户名称" }, { key: "image_key", label: "图片", mediaType: "image" }, { key: "description", label: "案例说明", textarea: true }], create: () => ({ title: "", client: "", image_key: "", description: "" }) },
  stats: { field: "items", label: "数据", fields: [{ key: "value", label: "数值" }, { key: "label", label: "说明" }], create: () => ({ value: "", label: "" }) },
  quote: { field: "items", label: "评价", fields: [{ key: "quote", label: "评价内容", textarea: true }, { key: "author", label: "评价人" }, { key: "company", label: "所在公司" }], create: () => ({ quote: "", author: "", company: "" }) },
  team: { field: "items", label: "成员", fields: [{ key: "name", label: "姓名" }, { key: "role", label: "职位" }, { key: "description", label: "简介", textarea: true }], create: () => ({ name: "", role: "", description: "" }) },
  timeline: { field: "items", label: "节点", fields: [{ key: "time", label: "时间" }, { key: "title", label: "标题" }, { key: "description", label: "描述", textarea: true }], create: () => ({ time: "", title: "", description: "" }) },
  faq: { field: "items", label: "问答", fields: [{ key: "question", label: "问题" }, { key: "answer", label: "回答", textarea: true }], create: () => ({ question: "", answer: "" }) },
};

/** 当前模块的列表配置 */
const listConfig = computed(() => (block ? listBlockConfigs[block.type] : undefined));
/** 当前列表中的普通字段 */
const normalListFields = computed(() => listConfig.value?.fields.filter((field) => !field.textarea && !field.mediaType) || []);
/** 当前列表中的媒体字段 */
const mediaListFields = computed(() => listConfig.value?.fields.filter((field) => field.mediaType) || []);
/** 当前列表中的多行字段 */
const textareaListFields = computed(() => listConfig.value?.fields.filter((field) => field.textarea) || []);
/** 普通字段列宽（媒体列固定 6，剩余均分） */
const normalFieldSpan = computed(() => {
  const count = normalListFields.value.length;
  if (!count) return 24;
  return Math.floor((24 - 6 * mediaListFields.value.length) / count);
});

/** 云空间素材预览地址（仅编辑器展示，不入草稿） */
const mediaPreviewUrls = ref<Record<string, string>>({});

watch(
  () => initialMediaPreviewUrls,
  (urls) => {
    if (urls) Object.assign(mediaPreviewUrls.value, urls);
  },
  { immediate: true },
);

const { requireFullEdition } = useDemoGate("sitebuilder");

/** 多行文本字段当前值 */
const linesValue = (field: string) => {
  const value = block?.content?.[field];
  return Array.isArray(value) ? value.join("\n") : "";
};

/** 更新多行文本字段 */
const updateLines = (field: string, value: string) => {
  if (!block) return;
  block.content[field] = value.split("\n").map((item) => item.trim()).filter(Boolean);
};

/** 所有云素材入口都在打开正式选择器前统一拦截。 */
const requestMediaCapability = async () => {
  await requireFullEdition("选择云素材", "media");
};

const openMediaPicker = async (_target: Record<string, any>, _field: string, _mediaType: CloudMediaType) => {
  await requestMediaCapability();
};

const openRichImagePicker = async () => {
  await requestMediaCapability();
};

/** 移除当前草稿中的本地图片引用仍可体验。 */
const removeRichImage = (index: number) => {
  if (!block || !Array.isArray(block.content.image_keys)) return;
  block.content.image_keys.splice(index, 1);
};

const addGalleryImages = async () => {
  await requestMediaCapability();
};

/** 新增列表条目 */
const addListItem = () => {
  if (!block || !listConfig.value) return;
  const list = block.content[listConfig.value.field];
  if (Array.isArray(list)) list.push(listConfig.value.create());
};

/** 删除列表条目 */
const removeListItem = (index: number) => {
  if (!block || !listConfig.value) return;
  const list = block.content[listConfig.value.field];
  if (Array.isArray(list)) list.splice(index, 1);
};
</script>

<style lang="scss" scoped>
.editor-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  border-radius: 16px;
  background: var(--el-bg-color);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.block-editor-panel {
  padding: 18px 20px 22px;

  .panel-head {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    h3 {
      display: flex;
      align-items: center;
      gap: 7px;
      margin: 0;
      color: var(--el-text-color-primary);
      font-size: 16px;
      font-weight: 650;

      &::before {
        width: 8px;
        height: 8px;
        border-radius: 3px;
        background: var(--type-color, var(--el-color-primary));
        content: "";
      }
    }

    .panel-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .type-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 99px;
      background: color-mix(in srgb, var(--type-color) 10%, transparent);
      color: var(--type-color);
      font-size: 11px;
      font-weight: 600;

      .el-icon {
        font-size: 11px;
      }
    }

    .visibility-switch {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--el-text-color-secondary);
      font-size: 12px;
      white-space: nowrap;
    }
  }

  .block-form {
    width: 100%;

    .title-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;

      .grow-item { flex: 1; }
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  :deep(.el-form-item__label) {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  .media-select-control {
    display: flex;
    width: 100%;
    min-width: 0;
    align-items: center;
    gap: 8px;

    .selected-media-key {
      min-width: 0;
      overflow: hidden;
      color: var(--el-text-color-secondary);
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .media-thumb {
    position: relative;
    width: 100%;
    height: 32px;
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;

    .el-image {
      display: block;
      width: 100%;
      height: 100%;
    }

    &.is-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      border: 1px dashed var(--el-border-color);
      color: var(--el-text-color-secondary);
      font-size: 10px;
      line-height: 1;

      .el-icon {
        font-size: 13px;
        line-height: 1;
      }

      span {
        line-height: 1;
      }
    }
  }

  .media-preview-box {
    position: relative;
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;

    video {
      display: block;
      width: 100%;
      max-height: 200px;
      background: #000;
    }

    .media-change-button {
      position: absolute;
      bottom: 8px;
      left: 8px;
      z-index: 2;
      padding: 3px 10px;
      border: 0;
      border-radius: 99px;
      background: rgb(15 23 42 / 72%);
      color: #fff;
      font-size: 11px;
      cursor: pointer;

      &:hover {
        background: rgb(15 23 42 / 88%);
      }
    }

    &.is-image {
      height: 110px;

      .el-image {
        display: block;
        width: 100%;
        height: 100%;
      }
    }

    &.is-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      height: 96px;
      border: 1px dashed var(--el-border-color);
      color: var(--el-text-color-secondary);
      font-size: 12px;
      line-height: 1;

      .el-icon {
        font-size: 18px;
        line-height: 1;
      }

      span {
        line-height: 1;
      }
    }
  }

  .media-thumb-remove {
    position: absolute;
    top: 1px;
    right: 1px;
    z-index: 2;
    display: grid;
    width: 15px;
    height: 15px;
    place-items: center;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: rgb(15 23 42 / 72%);
    color: #fff;
    font-size: 10px;
    cursor: pointer;
  }

  .rich-images {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .rich-image-order {
      position: absolute;
      bottom: 1px;
      left: 1px;
      z-index: 2;
      padding: 1px 4px;
      border-radius: 4px;
      background: rgb(15 23 42 / 72%);
      color: #fff;
      font-size: 10px;
      line-height: 1;
    }
  }

  .qr-thumb {
    position: relative;
    width: 72px;
    height: 72px;
    border-radius: 8px;
    background: var(--el-bg-color);
    box-shadow: 0 0 0 1px var(--el-border-color-lighter) inset;
    overflow: hidden;
    cursor: pointer;

    .el-image {
      display: block;
      width: 100%;
      height: 100%;
    }

    &.is-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      border-radius: 8px;
      box-shadow: none;
      border: 1px dashed var(--el-border-color);
      color: var(--el-text-color-secondary);
      font-size: 10px;
      line-height: 1;

      .el-icon {
        font-size: 14px;
        line-height: 1;
      }

      span {
        line-height: 1;
      }
    }
  }

  .field-hint {
    display: block;
    margin-top: 4px;
    color: var(--el-text-color-secondary);
    font-size: 11px;
    line-height: 16px;
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 4px;
  }

  .gallery-card {
    min-width: 0;

    .el-input {
      margin-top: 6px;
    }
  }

  .gallery-cover {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 8px;
    background: var(--el-fill-color-lighter);
    overflow: hidden;
    cursor: pointer;

    .el-image {
      display: block;
      width: 100%;
      height: 100%;
    }

    &.is-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      border: 1px dashed var(--el-border-color);
      color: var(--el-text-color-secondary);
      font-size: 11px;
      line-height: 1;

      > .el-icon {
        font-size: 16px;
        line-height: 1;
      }
    }

    &.is-add-cover:hover {
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }

    .gallery-order {
      position: absolute;
      top: 4px;
      left: 4px;
      z-index: 2;
      padding: 1px 5px;
      border-radius: 4px;
      background: rgb(15 23 42 / 72%);
      color: #fff;
      font-size: 10px;
      line-height: 14px;
    }
  }

  .repeat-list {
    display: grid;
    gap: 10px;
  }

  .repeat-item {
    padding: 10px 12px 0;
    border-radius: 10px;
    background: var(--el-fill-color-lighter);

    :deep(.el-form-item) {
      margin-bottom: 10px;
    }
  }

  .repeat-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    span {
      color: var(--el-text-color-secondary);
      font-size: 12px;
      font-weight: 600;
    }
  }

  .repeat-add {
    justify-self: start;
  }

  .block-empty {
    flex: 1;
  }
}
</style>
