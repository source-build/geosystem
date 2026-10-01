<template>
  <div class="site-projects page-table-layout">
    <main class="projects-workspace">
      <header class="projects-bar">
        <div class="bar-title">
          <h2>站点项目</h2>
          <span class="bar-count"><i>{{ total }}</i> 个项目</span>
        </div>

        <div class="bar-ops">
          <el-input
            v-model="keyword"
            class="project-search"
            clearable
            placeholder="搜索项目名称"
            aria-label="搜索项目名称"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-tooltip content="刷新项目列表">
            <el-button aria-label="刷新项目列表" icon="Refresh" circle @click="refreshProjects" />
          </el-tooltip>
          <el-button type="primary" icon="Plus" @click="createDialogShow = true">新建站点</el-button>
        </div>
      </header>

      <section class="projects-content" :aria-busy="loading || loadingMore">
        <div v-if="loading" class="project-grid" aria-label="正在加载站点项目">
          <article v-for="item in pageSize" :key="item" class="project-skeleton">
            <el-skeleton animated>
              <template #template>
                <el-skeleton-item variant="image" class="skeleton-banner" />
                <el-skeleton-item variant="h3" class="skeleton-title" />
                <el-skeleton-item variant="text" class="skeleton-description" />
                <el-skeleton-item variant="text" class="skeleton-stats" />
                <el-skeleton-item variant="text" class="skeleton-footer" />
              </template>
            </el-skeleton>
          </article>
        </div>

        <template v-else-if="projectList.length">
          <div class="project-grid" aria-label="站点项目列表">
            <ProjectCard
              v-for="project in projectList"
              :key="project.id"
              :project="project"
              @edit="goEditor"
            />
          </div>

          <div class="projects-load-state" role="status" aria-live="polite">
            <div v-if="loadingMore" class="load-state-message">
              <el-icon class="is-loading"><Loading /></el-icon>
              正在加载更多项目
            </div>
            <div v-else-if="loadMoreError" class="load-state-message is-error">
              <span>{{ loadMoreError }}</span>
              <el-button link type="primary" @click="loadMoreProjects">重新加载</el-button>
            </div>
            <div v-if="hasMore && !loadMoreError" ref="loadMoreTarget" class="load-more-sentinel" aria-hidden="true"></div>
          </div>
        </template>

        <div v-else class="projects-empty">
          <el-empty
            :description="keyword ? '没有找到匹配的站点项目' : '还没有站点项目'"
            :image-size="80"
          >
            <el-button v-if="keyword" @click="clearSearch">清空搜索</el-button>
            <el-button v-else type="primary" icon="Plus" @click="createDialogShow = true">新建站点</el-button>
          </el-empty>
        </div>
      </section>
    </main>

    <CreateProjectDialog v-model="createDialogShow" @created="handleProjectCreated" />
  </div>
</template>

<script setup lang="ts" name="sitebuilderProjects">
import { useIntersectionObserver } from "@vueuse/core";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import CreateProjectDialog from "./components/CreateProjectDialog.vue";
import ProjectCard from "./components/ProjectCard.vue";
import { useSiteProjects } from "./composables/useSiteProjects";

const router = useRouter();
/** 触底加载哨兵 */
const loadMoreTarget = ref<HTMLElement | null>(null);
/** 创建项目弹窗显示状态 */
const createDialogShow = ref(false);
/** 项目列表模块 */
const {
  loading,
  loadingMore,
  projectList,
  total,
  keyword,
  pageSize,
  hasMore,
  loadMoreError,
  resetProjects,
  loadMoreProjects,
  refreshProjects,
  handleSearch,
} = useSiteProjects();

useIntersectionObserver(
  loadMoreTarget,
  ([entry]) => {
    if (entry?.isIntersecting) loadMoreProjects();
  },
  { rootMargin: "0px 0px 160px" },
);

/** 跳转站点编辑器 */
const goEditor = (id: number) => {
  router.push(`/admin/biz/sitebuilder/editor/${id}`);
};

/** 清空搜索并重新加载 */
const clearSearch = () => {
  keyword.value = "";
  handleSearch();
};

/** 创建项目后进入编辑器 */
const handleProjectCreated = (id: number) => {
  goEditor(id);
};

onMounted(() => {
  resetProjects();
});
</script>

<style lang="scss" scoped>
.site-projects {
  padding: 14px 16px 20px;

  .projects-workspace {
    display: flex;
    width: 100%;
    min-height: calc(100vh - 110px);
    flex-direction: column;
  }

  .projects-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 9px 14px;
    border-radius: 14px;
    background: var(--el-bg-color);
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);

    .bar-title {
      display: flex;
      flex: 0 0 auto;
      align-items: baseline;
      gap: 9px;
      min-width: 0;

      h2 {
        margin: 0;
        color: var(--el-text-color-primary);
        font-size: 16px;
        font-weight: 700;
        white-space: nowrap;
      }

      .bar-count {
        color: var(--el-text-color-secondary);
        font-size: 12px;
        white-space: nowrap;

        i {
          margin-right: 1px;
          color: var(--el-color-primary);
          font-size: 15px;
          font-style: normal;
          font-weight: 750;
          font-variant-numeric: tabular-nums;
        }
      }
    }

    .bar-ops {
      display: flex;
      min-width: 0;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;

      .project-search {
        width: 220px;
      }

      :deep(.el-input__wrapper) {
        border-radius: 10px;
        background: var(--el-fill-color-light);
        box-shadow: none;

        &:hover {
          background: var(--el-fill-color);
        }

        &.is-focus {
          background: var(--el-bg-color);
          box-shadow: 0 0 0 1px var(--el-color-primary) inset;
        }
      }
    }
  }

  .projects-content {
    min-height: 0;
    flex: 1;
    margin-top: 14px;
    padding: 16px;
    border-radius: 16px;
    background: var(--el-bg-color);
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  }

  .project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(268px, 1fr));
    gap: 14px;
  }

  .project-skeleton {
    overflow: hidden;
    border-radius: 16px;
    background: var(--el-bg-color);
    box-shadow: var(--el-box-shadow-lighter);

    :deep(.el-skeleton) {
      display: flex;
      flex-direction: column;
    }

    .skeleton-banner {
      height: 104px;
      border-radius: 0;
    }

    .skeleton-title {
      margin: 15px 15px 0;
      width: 52%;
    }

    .skeleton-description {
      margin: 8px 15px 0;
      width: 78%;
    }

    .skeleton-stats {
      margin: 15px 15px 0;
      width: calc(100% - 30px);
    }

    .skeleton-footer {
      margin: 12px 15px 14px;
      width: 62%;
    }
  }

  .projects-load-state {
    min-height: 44px;
    padding-top: 12px;

    .load-state-message {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-height: 32px;
      color: var(--el-text-color-secondary);
      font-size: 12px;

      &.is-error {
        color: var(--el-color-danger);
      }

    }

    .load-more-sentinel {
      height: 1px;
    }
  }

  .projects-empty {
    display: flex;
    min-height: 300px;
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 1080px) {
  .site-projects {
    .projects-bar {
      align-items: stretch;
      flex-direction: column;
      gap: 10px;

      .bar-ops {
        width: 100%;
        flex-wrap: wrap;

        .project-search {
          flex: 1 1 160px;
          width: auto;
        }
      }
    }
  }
}

@media (max-width: 680px) {
  .site-projects {
    padding: 10px 12px 16px;

    .projects-content {
      margin-top: 12px;
      padding: 12px;
    }

    .project-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-projects * {
    transition-duration: 0.01ms !important;
  }
}
</style>
