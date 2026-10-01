<template>
  <div v-loading="loading" class="site-editor">
    <EditorHeader
      :project-name="project?.name"
      :version="revision?.version"
      :saving="saving"
      :building="building"
      @back="goBack"
      @save-project="handleSaveProject"
      @build="handleBuild"
    />

    <PageTabsBar
      v-if="project"
      :pages="pageList"
      :active-page-id="activePageId"
      @select-page="selectPage"
      @add-page="handleAddPage"
      @remove-page="removePage"
      @update-page="updatePage"
    />

    <main v-if="project" class="editor-layout">
      <aside class="editor-left">
        <ProjectSettingsPanel
          :project="project"
          :settings="settings"
          :site-spec="siteSpec"
          :disabled="!isHomePage"
        />
        <SiteStructurePanel
          ref="structurePanelRef"
          :blocks="blockList"
          :selected-id="selectedBlockId"
          @select="selectBlock"
          @move="moveBlock"
          @reorder="reorderBlocks"
          @toggle="toggleBlock"
          @remove="removeBlock"
          @add="addBlock"
        />
      </aside>

      <section class="editor-main">
        <BlockEditorPanel :block="selectedBlock" :initial-media-preview-urls="project?.media_preview_urls" />
      </section>

      <aside class="editor-right">
        <BuildStatusPanel :build="build" :events="events" @clear="handleClearBuild" />
        <BuildHistoryPanel :builds="buildHistory" :loading="historyLoading" @refresh="loadBuildHistory" />
      </aside>
    </main>

    <div v-else-if="!loading" class="editor-missing">
      <el-empty description="站点项目不存在或无权访问">
        <el-button type="primary" @click="goProjects">
          返回项目列表
        </el-button>
      </el-empty>
    </div>

    <BuildDialog
      v-model="buildDialog.visible"
      :quote="buildDialog.quote"
      :balance="buildDialog.balance"
      :project-name="project?.name"
      :version="revision?.version"
      :building="building"
      @confirm="confirmBuild"
    />
  </div>
</template>

<script setup lang="ts" name="sitebuilderEditor">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDemoGate } from "@/composables/useDemoGate";
import { getDemoBuildHistory } from "@/views/biz/sitebuilder/fixtures";
import type { SiteBuildHistoryItem, SiteSpec } from "@/views/biz/sitebuilder/types";
import { goBack } from "@/utils/route";
import BlockEditorPanel from "./components/BlockEditorPanel.vue";
import BuildHistoryPanel from "./components/BuildHistoryPanel.vue";
import BuildStatusPanel from "./components/BuildStatusPanel.vue";
import EditorHeader from "./components/EditorHeader.vue";
import PageTabsBar from "./components/PageTabsBar.vue";
import ProjectSettingsPanel from "./components/ProjectSettingsPanel.vue";
import BuildDialog, { type SiteBuildQuote } from "./components/BuildDialog.vue";
import SiteStructurePanel from "./components/SiteStructurePanel.vue";
import { useSiteBuildPolling } from "./composables/useSiteBuildPolling";
import { useSiteDraft } from "./composables/useSiteDraft";
import { useSiteProject } from "./composables/useSiteProject";
import { createEmptySiteSpec, type EditorSettings } from "./types";

const router = useRouter();
const route = useRoute();
const { requireFullEdition } = useDemoGate("sitebuilder");
const saving = ref(false);
const building = ref(false);
const buildHistory = ref<SiteBuildHistoryItem[]>([]);
const historyLoading = ref(false);
const settings = reactive<EditorSettings>({
  logo_text: "",
  logo_image_key: "",
  favicon_key: "",
  seo_title: "",
  seo_description: "",
  contact_button_text: "联系我们",
});
const projectId = computed(() => Number(route.params.id));
const { loading, project, revision, loadProject } = useSiteProject();
const {
  siteSpec, activePageId, selectedBlockId, pageList, blockList, selectedBlock,
  setSiteSpec, selectPage, addPage, removePage, updatePage, selectBlock, moveBlock,
  reorderBlocks, toggleBlock, removeBlock, addBlock, validateSiteSpec,
} = useSiteDraft();
const { build, events, clear } = useSiteBuildPolling(projectId, loadBuildHistory);
const isHomePage = computed(() => pageList.value[0]?.id === activePageId.value);
const structurePanelRef = ref<InstanceType<typeof SiteStructurePanel>>();

const handleAddPage = () => {
  if (!addPage()) return;
  setTimeout(() => structurePanelRef.value?.openDialog(), 200);
};
const goProjects = () => router.push("/biz/sitebuilder/projects");

const parseSettings = (value: unknown): Record<string, any> => {
  if (typeof value === "object" && value) return value as Record<string, any>;
  try { return typeof value === "string" ? JSON.parse(value) : {}; } catch { return {}; }
};

async function loadEditor() {
  if (!projectId.value) return;
  await loadProject(projectId.value);
  if (!project.value) return;
  settings.logo_text = project.value.logo_text || project.value.name;
  settings.logo_image_key = project.value.logo_image_key || "";
  settings.favicon_key = project.value.favicon_key || "";
  settings.seo_title = project.value.seo_title || "";
  settings.seo_description = project.value.seo_description || "";
  settings.contact_button_text = project.value.contact_button_text || "联系我们";
  const draftData = parseSettings(project.value.draft_data);
  const spec: SiteSpec = draftData.pages?.length ? (draftData as SiteSpec) : createEmptySiteSpec();
  spec.theme = {
    primary_color: project.value.primary_color || spec.theme?.primary_color || "#2563eb",
    style: project.value.visual_style || spec.theme?.style || "商务简约",
  };
  setSiteSpec(spec);
  await loadBuildHistory();
}

async function loadBuildHistory() {
  historyLoading.value = true;
  try { buildHistory.value = getDemoBuildHistory(projectId.value); }
  finally { historyLoading.value = false; }
}

const handleClearBuild = () => clear();

/** 保存属于正式写入能力；闸门结束后不继续执行任何保存逻辑。 */
const handleSaveProject = async () => {
  if (!project.value || saving.value) return;
  await requireFullEdition("保存站点草稿", "save");
};

const buildDialog = reactive({
  visible: false,
  quote: undefined as SiteBuildQuote | undefined,
  balance: undefined as number | undefined,
});

/** 构建会调用模型并消耗资源；校验后、任何提交前进行拦截。 */
const handleBuild = async () => {
  if (!project.value || building.value) return;
  const validationMessage = validateSiteSpec();
  if (validationMessage) { showToastFail(validationMessage); return; }
  await requireFullEdition("AI 构建站点", "build");
};

/** 防止未来重新启用确认框时绕过统一闸门。 */
const confirmBuild = async () => {
  buildDialog.visible = false;
  await requireFullEdition("AI 构建站点", "build");
};

onMounted(loadEditor);
</script>

<style lang="scss" scoped>
.site-editor {
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: 12px;
  padding: 12px 14px 14px;
  overflow: hidden;

  .editor-layout {
    display: grid;
    flex: 1;
    min-height: 0;
    grid-template-columns: minmax(240px, 0.8fr) minmax(420px, 1.6fr) minmax(280px, 0.9fr);
    gap: 12px;
    overflow: hidden;
  }

  .editor-left,
  .editor-right {
    display: grid;
    min-height: 0;
    align-content: start;
    gap: 12px;
    overflow-y: auto;
    padding-right: 2px;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .editor-main {
    display: flex;
    min-width: 0;
    min-height: 0;
  }

  .editor-missing {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 1250px) {
  .site-editor {
    height: auto;
    min-height: 100%;
    overflow: visible;

    .editor-layout {
      grid-template-columns: minmax(240px, 0.8fr) minmax(420px, 1.4fr);
      overflow: visible;
    }

    .editor-left,
    .editor-right {
      overflow: visible;
    }

    .editor-right {
      grid-column: 1 / -1;
      grid-template-columns: 1fr 1fr;
    }
  }
}

@media (max-width: 860px) {
  .site-editor {
    .editor-layout,
    .editor-right {
      grid-template-columns: 1fr;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-editor * {
    transition-duration: 0.01ms !important;
  }
}
</style>
