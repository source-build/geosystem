<template>
  <div class="site-templates page-table-layout">
    <header class="templates-masthead">
      <div class="masthead-copy"><span>STARTING POINT</span><h2>选择一个网站起点</h2><p>模板定义了可编辑的内容模块与视觉基调。创建后，可在编辑器中继续调整内容和主题。</p></div>
      <el-button @click="goProjects"><el-icon><ArrowLeft /></el-icon>返回项目列表</el-button>
    </header>
    <section class="template-toolbar">
      <div><strong>受控模板</strong><span>当前 {{ templateList.length }} 个可选起点</span></div>
      <el-radio-group v-model="activeType" class="type-filter" aria-label="站点类型筛选"><el-radio-button value="all">全部</el-radio-button><el-radio-button value="company">企业官网</el-radio-button><el-radio-button value="product">产品落地页</el-radio-button><el-radio-button value="solution">解决方案</el-radio-button></el-radio-group>
    </section>
    <main><section v-if="templateList.length" class="template-grid"><TemplateCard v-for="item in templateList" :key="item.code" :template="item" @use="handleUseTemplate" /></section><el-empty v-else class="template-empty" description="当前筛选下没有可用模板"><el-button @click="activeType = 'all'">查看全部模板</el-button></el-empty></main>
    <CreateProjectDialog v-model="createDialogShow" :template-code="selectedTemplateCode" @created="handleProjectCreated" />
  </div>
</template>

<script setup lang="ts" name="sitebuilderTemplates">
import { ref } from "vue";
import { useRouter } from "vue-router";
import CreateProjectDialog from "../projects/components/CreateProjectDialog.vue";
import TemplateCard from "./components/TemplateCard.vue";
import { useSiteTemplates } from "./composables/useSiteTemplates";
import type { SiteTemplate } from "@/views/biz/sitebuilder/siteTemplates";

const router = useRouter();

/** 创建项目弹窗显示状态 */
const createDialogShow = ref(false);
/** 当前选择的模板编码 */
const selectedTemplateCode = ref("company-standard");

/** 模板筛选模块 */
const { activeType, templateList } = useSiteTemplates();

/** 返回项目列表 */
const goProjects = () => { router.push("/biz/sitebuilder/projects"); };
/** 使用模板创建站点 */
const handleUseTemplate = (template: SiteTemplate) => { selectedTemplateCode.value = template.code; createDialogShow.value = true; };
/** 创建项目后进入编辑器 */
const handleProjectCreated = (id: number) => { router.push(`/admin/biz/sitebuilder/editor/${id}`); };
</script>

<style lang="scss" scoped>
.site-templates {
  min-height: 100%; padding: 8px 4px 28px;
  .templates-masthead { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; padding: 24px 0 28px; }
  .masthead-copy { max-width: 660px; }
  .masthead-copy span { color: var(--el-color-primary); font-size: 12px; font-weight: 700; letter-spacing: 0.12em; }
  .masthead-copy h2 { margin: 10px 0 0; color: var(--el-text-color-primary); font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.25; }
  .masthead-copy p { margin: 10px 0 0; color: var(--el-text-color-secondary); font-size: 14px; line-height: 1.7; }
  .template-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 14px 16px; border: 1px solid var(--el-border-color-lighter); border-radius: 12px; background: var(--el-bg-color); box-shadow: var(--el-box-shadow-lighter); }
  .template-toolbar div { display: grid; gap: 4px; }
  .template-toolbar strong { color: var(--el-text-color-primary); font-size: 15px; }
  .template-toolbar span { color: var(--el-text-color-secondary); font-size: 12px; }
  main { padding-top: 24px; }
  .template-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
  .template-empty { min-height: 360px; border: 1px dashed var(--el-border-color); border-radius: 12px; background: var(--el-fill-color-lighter); }
}
@media (max-width: 768px) { .site-templates { padding: 0 0 24px; .templates-masthead, .template-toolbar { align-items: stretch; flex-direction: column; gap: 20px; } .templates-masthead { padding: 20px 0 24px; } .type-filter { display: flex; overflow-x: auto; max-width: 100%; } .template-grid { grid-template-columns: 1fr; gap: 16px; } } }
@media (prefers-reduced-motion: reduce) { .site-templates * { transition-duration: 0.01ms !important; } }
</style>
