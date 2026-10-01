import { ref } from "vue";
import { demoSiteProjects } from "@/views/biz/sitebuilder/fixtures";
import type { SiteArtifact, SiteProject } from "@/views/biz/sitebuilder/types";

/** 管理仅驻留浏览器内存的站点项目列表。 */
export function useSiteProjects() {
  const loading = ref(false);
  const loadingMore = ref(false);
  const projectList = ref<SiteProject[]>([]);
  const total = ref(0);
  const keyword = ref("");
  const page = ref(1);
  const pageSize = ref(4);
  const hasMore = ref(true);
  const loadMoreError = ref("");

  const filteredProjects = () => {
    const query = keyword.value.trim().toLowerCase();
    if (!query) return demoSiteProjects;
    return demoSiteProjects.filter((project) =>
      [project.name, project.slug].some((value) => value.toLowerCase().includes(query)),
    );
  };

  const applyPage = (targetPage: number, append: boolean) => {
    const rows = filteredProjects();
    const end = targetPage * pageSize.value;
    projectList.value = structuredClone(append ? rows.slice(0, end) : rows.slice(0, pageSize.value));
    total.value = rows.length;
    page.value = targetPage + 1;
    hasMore.value = projectList.value.length < rows.length;
    loadMoreError.value = "";
  };

  async function resetProjects() {
    loading.value = true;
    try {
      page.value = 1;
      applyPage(1, false);
    } finally {
      loading.value = false;
    }
  }

  const loadMoreProjects = async () => {
    if (loading.value || loadingMore.value || !hasMore.value) return;
    loadingMore.value = true;
    try {
      applyPage(page.value, true);
    } finally {
      loadingMore.value = false;
    }
  };

  const handleSearch = () => resetProjects();
  const refreshProjects = () => resetProjects();

  /** 体验版不读取任何正式构建产物。 */
  async function loadArtifacts(_projectId: number): Promise<SiteArtifact[]> {
    return [];
  }

  return {
    loading,
    loadingMore,
    projectList,
    total,
    keyword,
    page,
    pageSize,
    hasMore,
    loadMoreError,
    resetProjects,
    loadMoreProjects,
    refreshProjects,
    handleSearch,
    loadArtifacts,
  };
}
