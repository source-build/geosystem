<template>
  <article
    class="project-card"
    :style="{ '--site-color': siteColor, '--site-color-deep': typeMeta.color }"
    tabindex="0"
    role="button"
    :aria-label="`进入站点编辑器：${project.name}`"
    @click="emit('edit', project.id)"
    @keyup.enter="emit('edit', project.id)"
  >
    <div class="site-preview">
      <div class="preview-topbar">
        <div class="preview-brand">
          <span class="brand-dot" aria-hidden="true"></span>
          <span>{{ previewName }}</span>
        </div>
        <span class="preview-type">
          <el-icon><component :is="typeIcon" /></el-icon>
          {{ typeLabel }}
        </span>
      </div>

      <div class="preview-content" aria-hidden="true">
        <span class="preview-kicker">{{ templateStyle }}</span>
        <strong>{{ previewHeadline }}</strong>
      </div>

      <div class="preview-url">
        <el-icon><Link /></el-icon>
        <span>{{ projectPath }}</span>
      </div>
    </div>

    <div class="card-content">
      <div class="project-heading">
        <div class="heading-copy">
          <h3 :title="project.name">{{ project.name }}</h3>
          <p :title="templateDescription">{{ templateDescription }}</p>
        </div>
        <span class="project-mark" aria-hidden="true">{{ project.name.slice(0, 1) || "S" }}</span>
      </div>

      <div class="project-template">
        <span class="template-dot" aria-hidden="true"></span>
        <span>{{ templateName }}</span>
        <span class="template-style">{{ templateStyle }}</span>
      </div>

      <div class="project-stats" aria-label="项目概览">
        <span class="stat-item">
          <el-icon><DocumentCopy /></el-icon>
          {{ pageCount }} 个页面
        </span>
        <span class="stat-item">
          <el-icon><Menu /></el-icon>
          {{ blockCount }} 个模块
        </span>
        <span class="stat-item">
          <el-icon><Stamp /></el-icon>
          {{ revisionLabel }}
        </span>
      </div>

      <div class="card-footer">
        <span class="knowledge-status" :class="project.knowledge_base_id ? 'is-linked' : 'is-empty'">
          <el-icon><Connection /></el-icon>
          {{ knowledgeLabel }}
        </span>
        <time :datetime="project.updated_at">更新于 {{ updateTime }}</time>
        <span class="edit-action" aria-hidden="true">
          编辑
          <el-icon><ArrowRight /></el-icon>
        </span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { computed } from "vue";
import type { SiteProject } from "@/views/biz/sitebuilder/types";
import { getSiteTemplate } from "@/views/biz/sitebuilder/siteTemplates";

const props = defineProps<{ project: SiteProject }>();
const emit = defineEmits<{ (event: "edit", id: number): void }>();

/** 站点类型展示映射 */
const siteTypeMeta: Record<string, { label: string; icon: string; color: string; gradient: string }> = {
  company: {
    label: "企业官网",
    icon: "OfficeBuilding",
    color: "#2563eb",
    gradient: "linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%)",
  },
  product: {
    label: "产品落地页",
    icon: "Promotion",
    color: "#7c3aed",
    gradient: "linear-gradient(135deg, #f5f3ff 0%, #ddd6fe 100%)",
  },
  solution: {
    label: "解决方案",
    icon: "Connection",
    color: "#0d9488",
    gradient: "linear-gradient(135deg, #f0fdfa 0%, #99f6e4 100%)",
  },
};

/** 当前站点模板 */
const template = computed(() => getSiteTemplate(props.project.template_code));
/** 站点类型元信息 */
const typeMeta = computed(() => siteTypeMeta[props.project.site_type] || siteTypeMeta.company);
/** 站点类型展示名称 */
const typeLabel = computed(() => typeMeta.value.label);
/** 站点类型图标 */
const typeIcon = computed(() => typeMeta.value.icon);
/** 预览色彩 */
const siteColor = computed(() => {
  const color = template.value?.color || typeMeta.value.color;
  return `linear-gradient(135deg, ${color}12 0%, ${color}55 100%)`;
});
/** 预览品牌名 */
const previewName = computed(() => props.project.logo_text || props.project.name || "Site");
/** 预览标题 */
const previewHeadline = computed(() => props.project.seo_title || props.project.name || typeLabel.value);
/** 站点路径 */
const projectPath = computed(() => `/${props.project.slug || "site"}`);
/** 模板展示名称 */
const templateName = computed(() => template.value?.name || props.project.template_code || "自定义模板");
/** 模板描述 */
const templateDescription = computed(() => template.value?.description || props.project.seo_description || "持续完善站点内容与页面体验");
/** 模板风格 */
const templateStyle = computed(() => template.value?.style || props.project.visual_style || typeLabel.value);
/** 当前项目模块数量，缺失时回退模板默认值 */
const blockCount = computed(() => props.project.block_count ?? template.value?.blocks.length ?? 0);
/** 当前项目页面数量，缺失时回退模板默认值 */
const pageCount = computed(() => props.project.page_count ?? template.value?.siteSpec.pages.length ?? 0);
/** 当前版本 */
const revisionLabel = computed(() => {
  const version = props.project.version ?? props.project.current_revision_id;
  return version ? `版本 #${version}` : "未发布版本";
});
/** 知识库关联状态 */
const knowledgeLabel = computed(() => (props.project.knowledge_base_id ? `已关联知识库 #${props.project.knowledge_base_id}` : "未关联知识库"));
/** 最近更新时间文本 */
const updateTime = computed(() => (props.project.updated_at ? dayjs(props.project.updated_at).format("MM-DD HH:mm") : "-"));
</script>

<style lang="scss" scoped>
.project-card {
  overflow: hidden;
  border-radius: 18px;
  background: var(--el-bg-color);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover,
  &:focus-visible {
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);
    outline: none;
    transform: translateY(-2px);

    .edit-action {
      color: var(--site-color-deep);

      .el-icon {
        transform: translateX(2px);
      }
    }
  }
}

.site-preview {
  position: relative;
  min-height: 104px;
  overflow: hidden;
  padding: 10px 12px;
  background: var(--site-color);
  color: var(--site-color-deep);

  &::before,
  &::after {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.52);
    content: "";
    filter: blur(1px);
  }

  &::before {
    top: -38px;
    right: -24px;
    width: 108px;
    height: 108px;
  }

  &::after {
    right: 46px;
    bottom: -44px;
    width: 78px;
    height: 78px;
    opacity: 0.55;
  }

  .preview-topbar,
  .preview-content,
  .preview-url {
    position: relative;
    z-index: 1;
  }

  .preview-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    .preview-brand,
    .preview-type,
    .preview-url {
      display: inline-flex;
      min-width: 0;
      align-items: center;
    }

    .preview-brand {
      gap: 6px;
      overflow: hidden;
      color: var(--site-color-deep);
      font-size: 11px;
      font-weight: 700;

      > span:last-child {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .brand-dot {
      width: 7px;
      height: 7px;
      flex: 0 0 7px;
      border-radius: 50%;
      background: var(--site-color-deep);
    }

    .preview-type {
      flex: 0 0 auto;
      gap: 3px;
      padding: 4px 8px;
      border-radius: 99px;
      background: rgba(255, 255, 255, 0.64);
      color: var(--site-color-deep);
      font-size: 11px;
      font-weight: 650;

      .el-icon {
        font-size: 12px;
      }
    }
  }

  .preview-content {
    display: flex;
    width: 72%;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    margin-top: 11px;

    .preview-kicker {
      font-size: 10px;
      font-weight: 650;
      letter-spacing: 0.08em;
      opacity: 0.72;
    }

    strong {
      display: -webkit-box;
      overflow: hidden;
      color: var(--site-color-deep);
      font-size: 14px;
      font-weight: 750;
      line-height: 1.35;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
    }
  }

  .preview-url {
    position: absolute;
    right: 12px;
    bottom: 9px;
    max-width: calc(100% - 24px);
    gap: 4px;
    color: color-mix(in srgb, var(--site-color-deep) 70%, transparent);
    font-size: 10px;

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.card-content {
  padding: 14px 15px 13px;

  .project-heading {
    display: flex;
    align-items: flex-start;
    gap: 10px;

    .heading-copy {
      min-width: 0;
      flex: 1;

      h3 {
        overflow: hidden;
        margin: 0;
        color: var(--el-text-color-primary);
        font-size: 15px;
        font-weight: 700;
        line-height: 1.45;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      p {
        display: -webkit-box;
        overflow: hidden;
        min-height: 34px;
        margin: 4px 0 0;
        color: var(--el-text-color-secondary);
        font-size: 12px;
        line-height: 1.45;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
    }

    .project-mark {
      display: inline-flex;
      width: 32px;
      height: 32px;
      flex: 0 0 32px;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: color-mix(in srgb, var(--site-color-deep) 12%, transparent);
      color: var(--site-color-deep);
      font-size: 14px;
      font-weight: 750;
    }
  }

  .project-template {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    margin-top: 11px;
    color: var(--el-text-color-regular);
    font-size: 11px;

    > span:not(.template-dot) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .template-dot {
      width: 6px;
      height: 6px;
      flex: 0 0 6px;
      border-radius: 50%;
      background: var(--site-color-deep);
    }

    .template-style {
      margin-left: auto;
      color: var(--site-color-deep);
      font-weight: 650;
    }
  }

  .project-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: 12px;
    padding: 9px 0;
    border-top: 1px solid var(--el-fill-color-light);
    border-bottom: 1px solid var(--el-fill-color-light);

    .stat-item {
      display: flex;
      min-width: 0;
      align-items: center;
      justify-content: center;
      gap: 4px;
      color: var(--el-text-color-secondary);
      font-size: 11px;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;

      + .stat-item {
        border-left: 1px solid var(--el-fill-color);
      }

      .el-icon {
        flex: 0 0 auto;
        color: var(--site-color-deep);
        font-size: 13px;
      }
    }
  }

  .card-footer {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 7px;
    margin-top: 11px;
    font-size: 11px;

    .knowledge-status {
      display: inline-flex;
      min-width: 0;
      align-items: center;
      gap: 3px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &.is-linked {
        color: var(--el-color-success);
      }

      &.is-empty {
        color: var(--el-text-color-placeholder);
      }
    }

    time {
      flex: 0 0 auto;
      margin-left: auto;
      color: var(--el-text-color-placeholder);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .edit-action {
      display: inline-flex;
      flex: 0 0 auto;
      align-items: center;
      gap: 2px;
      color: var(--el-text-color-secondary);
      font-weight: 650;
      transition: color 0.2s ease;

      .el-icon {
        transition: transform 0.2s ease;
      }
    }
  }
}

@media (max-width: 680px) {
  .card-content {
    .card-footer {
      flex-wrap: wrap;

      .edit-action {
        margin-left: auto;
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-card,
  .edit-action,
  .edit-action .el-icon {
    transition: none;
  }
}
</style>
