import { ref } from "vue";
import { createDemoRevision, findDemoProject } from "@/views/biz/sitebuilder/fixtures";
import type {
  SiteProject,
  SiteRevision,
  SiteRevisionSummary,
  UpdateSiteProjectPayload,
} from "@/views/biz/sitebuilder/types";

/** 管理本地虚构项目与版本快照，不发起网络请求。 */
export function useSiteProject() {
  const loading = ref(false);
  const project = ref<SiteProject>();
  const revision = ref<SiteRevision>();
  const revisionList = ref<SiteRevisionSummary[]>([]);

  async function loadProject(projectId: number) {
    loading.value = true;
    try {
      project.value = findDemoProject(projectId);
      revision.value = project.value ? createDemoRevision(project.value) : undefined;
      revisionList.value = revision.value ? [revision.value] : [];
    } finally {
      loading.value = false;
    }
  }

  async function loadRevisionList(_projectId: number) {
    return revisionList.value;
  }

  async function loadRevision(revisionId: number) {
    return revision.value?.id === revisionId ? revision.value : undefined;
  }

  /** 仅更新当前页面内存；正式保存入口会在调用前被体验版闸门拦截。 */
  async function saveProject(_projectId: number, data: UpdateSiteProjectPayload) {
    if (project.value) project.value = { ...project.value, ...structuredClone(data) };
  }

  return { loading, project, revision, revisionList, loadProject, loadRevisionList, loadRevision, saveProject };
}
