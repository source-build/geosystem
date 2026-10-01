<template>
  <div class="cema-media-favorite-page vertical-layout">
    <div class="favorite-layout">
      <aside class="favorite-aside">
        <div class="aside-head">
          <h5 class="aside-title">收藏分组</h5>
          <el-button type="primary" size="small" icon="Plus" @click="openGroupDialog()">新增分组</el-button>
        </div>
        <div v-loading="groupLoading" class="aside-list">
          <div class="group-item" :class="{ 'is-active': selectedGroupId === 'all' }" @click="selectGroup('all')">
            <el-icon class="group-item-icon"><Collection /></el-icon>
            <span class="group-item-name">全部收藏</span>
            <span class="group-item-count">{{ totalAllCount }}</span>
          </div>
          <div
            v-for="group in groupList"
            :key="group.id"
            class="group-item"
            :class="{ 'is-active': String(selectedGroupId) === String(group.id) }"
            @click="selectGroup(group.id)"
          >
            <el-icon class="group-item-icon"><FolderOpened /></el-icon>
            <span class="group-item-name" :title="group.name">{{ group.name }}</span>
            <span class="group-item-count">{{ group.favorite_count ?? 0 }}</span>
            <span class="group-item-actions" @click.stop>
              <el-icon class="group-action" title="编辑" @click="openGroupDialog(group)"><Edit /></el-icon>
              <el-icon class="group-action danger" title="删除分组" @click="handleDeleteGroup(group)"><Delete /></el-icon>
            </span>
          </div>
          <el-empty v-if="!groupLoading && !groupList.length" description="暂无分组，点击右上角新增" :image-size="56" />
        </div>
      </aside>

      <section class="favorite-main">
        <div class="main-head">
          <div class="main-head-left">
            <h5 class="main-title">{{ currentGroupName }}</h5>
            <span class="main-subtitle">共 <strong>{{ favoriteTotal }}</strong> 个收藏</span>
          </div>
          <div class="main-head-right">
            <el-select v-model="favoriteQuery.media_type" clearable size="small" placeholder="全部媒体" style="width: 116px"
              @change="handleMediaTypeChange">
              <el-option v-for="option in mediaTypeOptions" :key="option.value || 'all'" :label="option.label" :value="option.value" />
            </el-select>
            <el-input v-model="favoriteQuery.name" size="small" placeholder="搜索媒体名称" clearable style="width: 200px"
              @clear="handleFavoriteSearch" @keyup.enter="handleFavoriteSearch">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-button icon="RefreshRight" circle size="small" @click="loadFavorites" />
          </div>
        </div>

        <div v-loading="favoriteLoading" class="favorite-grid">
          <article v-for="favorite in favoriteList" :key="favorite.id" class="fav-card">
            <div class="fav-card-head">
              <div class="fav-card-logo">
                <img v-if="favorite.media_logo_url" :src="favorite.media_logo_url" :alt="favorite.media_name || '媒体 Logo'" />
                <span v-else>{{ getMediaInitial(favorite.media_name) }}</span>
              </div>
              <div class="fav-card-info">
                <strong class="fav-card-name">{{ favorite.media_name || `媒体#${favorite.provider_media_id}` }}</strong>
                <div class="fav-card-meta">
                  <span class="fav-card-type" :class="`is-${favorite.media_type}`">{{ getMediaTypeLabel(favorite.media_type) }}</span>
                  <span>参考价格 <em>{{ formatPrice(favorite.media_price) }}</em> 元</span>
                </div>
              </div>
              <el-tag v-if="Number(favorite.media_status) !== 1" size="small" type="info" effect="light" class="fav-card-status">
                已下架
              </el-tag>
            </div>
            <div class="fav-card-footer">
              <span class="fav-card-time">收藏于 {{ formatDateTime(favorite.created_at) }}</span>
              <el-button link type="danger" class="link-sm" @click="handleUnfavorite(favorite)">取消收藏</el-button>
            </div>
          </article>
          <el-empty v-if="!favoriteLoading && !favoriteList.length" description="暂无收藏媒体" :image-size="72" />
        </div>

        <div class="footer-pagination-container">
          <el-pagination
            v-model:current-page="favoriteQuery.page"
            v-model:page-size="favoriteQuery.page_size"
            size="small"
            :page-sizes="[12, 24, 48]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="favoriteTotal"
            @size-change="loadFavorites"
            @current-change="loadFavorites"
          />
        </div>
      </section>
    </div>

    <el-dialog v-model="groupDialogShow" :title="groupForm.id ? '编辑分组' : '新增分组'" destroy-on-close append-to-body align-center
      width="420px">
      <el-form :model="groupForm" label-position="top">
        <el-form-item label="分组名称" required>
          <el-input v-model="groupForm.name" placeholder="请输入分组名称" maxlength="50" show-word-limit @keyup.enter="submitGroup" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="groupDialogShow = false">取消</el-button>
        <el-button type="primary" :loading="groupSubmitting" @click="submitGroup">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="cemaMediaFavorite">
import { computed, reactive, ref } from "vue";
import { useDemoGate } from "@/composables/useDemoGate";
import { demoFavoriteGroups, demoFavorites, type DemoFavorite } from "../demoData";

type FavoriteView = DemoFavorite & { media_logo_url?: string };
type FavoriteGroup = (typeof demoFavoriteGroups)[number];

const { requireFullEdition } = useDemoGate("mediaRelease");

const mediaTypeOptions = [
  { label: "全部媒体", value: undefined },
  { label: "网媒", value: "normal" },
  { label: "短视频", value: "short_video" },
  { label: "小红书", value: "xiaohongshu" },
] as const;

const mediaTypeNameMap: Record<DemoFavorite["media_type"], string> = {
  normal: "网媒",
  short_video: "短视频",
  xiaohongshu: "小红书",
};

/** 收藏分组列表（公开体验版虚构数据） */
const groupList = demoFavoriteGroups;
/** 收藏分组加载状态 */
const groupLoading = ref(false);
/** 当前选中的收藏分组 */
const selectedGroupId = ref<string | "all">("all");
/** 收藏记录加载状态 */
const favoriteLoading = ref(false);
/** 收藏查询参数 */
const favoriteQuery = reactive<{
  name: string;
  media_type?: DemoFavorite["media_type"];
  page: number;
  page_size: number;
}>({ name: "", media_type: undefined, page: 1, page_size: 12 });

/** 分组新增或编辑弹窗（保留完整版页面结构，入口由体验版能力门禁拦截） */
const groupDialogShow = ref(false);
/** 分组提交状态 */
const groupSubmitting = ref(false);
/** 分组表单 */
const groupForm = reactive<{ id: string | null; name: string }>({ id: null, name: "" });

const favoriteSource: FavoriteView[] = demoFavorites.map((favorite) => ({ ...favorite }));
const totalAllCount = computed(() => favoriteSource.length);
const currentGroupName = computed(() => {
  if (selectedGroupId.value === "all") return "全部收藏";
  return groupList.find((group) => String(group.id) === String(selectedGroupId.value))?.name || "收藏列表";
});
const filteredFavorites = computed(() => {
  const keyword = favoriteQuery.name.trim().toLowerCase();
  return favoriteSource.filter((favorite) => {
    const groupMatches = selectedGroupId.value === "all" || String(favorite.group_id) === String(selectedGroupId.value);
    const typeMatches = !favoriteQuery.media_type || favorite.media_type === favoriteQuery.media_type;
    const nameMatches = !keyword || favorite.media_name.toLowerCase().includes(keyword);
    return groupMatches && typeMatches && nameMatches;
  });
});
const favoriteTotal = computed(() => filteredFavorites.value.length);
const favoriteList = computed(() => {
  const start = (favoriteQuery.page - 1) * favoriteQuery.page_size;
  return filteredFavorites.value.slice(start, start + favoriteQuery.page_size);
});

function getMediaInitial(name: unknown) {
  return name ? String(name).trim().slice(0, 1).toUpperCase() : "媒";
}

function getMediaTypeLabel(mediaType: DemoFavorite["media_type"]) {
  return mediaTypeNameMap[mediaType] || "未知媒体";
}

function formatPrice(value: unknown) {
  const price = Number(value);
  if (value === undefined || value === null || value === "" || Number.isNaN(price)) return "-";
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(price);
}

function formatDateTime(value: unknown) {
  return value ? String(value) : "-";
}

function loadFavorites() {
  const maxPage = Math.max(1, Math.ceil(favoriteTotal.value / favoriteQuery.page_size));
  if (favoriteQuery.page > maxPage) favoriteQuery.page = maxPage;
}

function selectGroup(groupId: string | "all") {
  if (String(selectedGroupId.value) === String(groupId)) return;
  selectedGroupId.value = groupId;
  favoriteQuery.page = 1;
  loadFavorites();
}

function handleFavoriteSearch() {
  favoriteQuery.page = 1;
  loadFavorites();
}

function handleMediaTypeChange() {
  favoriteQuery.page = 1;
  loadFavorites();
}

function openGroupDialog(group?: FavoriteGroup) {
  const action = group ? `编辑收藏分组「${group.name}」` : "新增收藏分组";
  return requireFullEdition("收藏分组", "favoriteGroup", `${action}属于完整版能力。体验版仅展示虚构分组，不会修改数据。`);
}

function submitGroup() {
  return requireFullEdition("收藏分组", "favoriteGroup", "提交收藏分组属于完整版能力。体验版不会新增或编辑分组，也不会提交任何数据。");
}

function handleDeleteGroup(group: FavoriteGroup) {
  return requireFullEdition("收藏分组", "favoriteGroup", `删除收藏分组「${group.name}」属于完整版能力。体验版不会修改虚构分组或收藏数据。`);
}

function handleUnfavorite(favorite: FavoriteView) {
  return requireFullEdition("媒体收藏", "favorite", `取消收藏「${favorite.media_name}」属于完整版能力。体验版不会修改任何数据。`);
}
</script>

<style lang="scss" scoped>
.cema-media-favorite-page {
  .favorite-layout {
    display: flex;
    min-height: 0;
    flex: 1;
    gap: 10px;
  }

  .favorite-aside {
    display: flex;
    width: 240px;
    flex-shrink: 0;
    flex-direction: column;
    padding: 12px;
    border-radius: 8px;
    background-color: var(--el-bg-color);

    .aside-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;

      .aside-title {
        position: relative;
        margin: 0 0 0 10px;
        color: var(--el-text-color-primary);
        font-size: 15px;
        font-weight: 600;

        &::before {
          position: absolute;
          top: 50%;
          left: -10px;
          width: 4px;
          height: 14px;
          border-radius: 10px;
          background-color: var(--el-color-primary);
          content: "";
          transform: translateY(-50%);
        }
      }
    }

    .aside-list {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;

      .group-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 9px 10px;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.18s ease;

        &:hover {
          background-color: var(--el-fill-color-light);
        }

        &.is-active {
          background-color: var(--el-color-primary-light-9);

          .group-item-icon,
          .group-item-name {
            color: var(--el-color-primary);
          }

          .group-item-count {
            background-color: var(--el-color-primary);
            color: #fff;
          }
        }

        .group-item-icon {
          color: var(--el-text-color-secondary);
          font-size: 15px;
        }

        .group-item-name {
          flex: 1;
          overflow: hidden;
          color: var(--el-text-color-regular);
          font-size: 13px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .group-item-count {
          min-width: 20px;
          height: 18px;
          padding: 0 6px;
          border-radius: 9px;
          background-color: var(--el-fill-color-dark);
          color: var(--el-text-color-secondary);
          font-size: 11px;
          font-variant-numeric: tabular-nums;
          line-height: 18px;
          text-align: center;
        }

        .group-item-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          opacity: 0;
          transition: opacity 0.18s ease;
        }

        &:hover .group-item-actions {
          opacity: 1;
        }

        .group-action {
          color: var(--el-text-color-secondary);
          cursor: pointer;
          font-size: 14px;

          &:hover {
            color: var(--el-color-primary);
          }

          &.danger:hover {
            color: var(--el-color-danger);
          }
        }
      }
    }
  }

  .favorite-main {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    padding: 12px 14px;
    border-radius: 8px;
    background-color: var(--el-bg-color);

    .main-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;

      .main-head-left {
        display: flex;
        align-items: baseline;
        gap: 10px;

        .main-title {
          margin: 0;
          color: var(--el-text-color-primary);
          font-size: 15px;
          font-weight: 600;
        }

        .main-subtitle {
          color: var(--el-text-color-secondary);
          font-size: 12px;

          strong {
            color: var(--el-color-primary);
            font-weight: 600;
          }
        }
      }

      .main-head-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .favorite-grid {
      display: grid;
      flex: 1;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      align-content: start;
      gap: 10px;
      overflow-y: auto;

      .fav-card {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        border-radius: 10px;
        background-color: var(--el-fill-color-light);
        transition: background-color 0.18s ease, box-shadow 0.18s ease;

        &:hover {
          background-color: var(--el-fill-color);
          box-shadow: 0 2px 10px rgb(0 0 0 / 5%);
        }

        .fav-card-head {
          display: flex;
          align-items: flex-start;
          gap: 10px;

          .fav-card-logo {
            display: flex;
            width: 40px;
            height: 40px;
            flex-shrink: 0;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border-radius: 10px;
            background: linear-gradient(135deg, #ffc774, #fe962e);
            color: #000000e3;
            font-size: 16px;
            font-weight: 700;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          .fav-card-info {
            display: flex;
            min-width: 0;
            flex: 1;
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;

            .fav-card-name {
              overflow: hidden;
              color: var(--el-text-color-primary);
              font-size: 13px;
              font-weight: 600;
              line-height: 18px;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .fav-card-meta {
              display: flex;
              flex-wrap: wrap;
              gap: 6px 10px;
              color: var(--el-text-color-secondary);
              font-size: 12px;

              em {
                color: #f0820a;
                font-style: normal;
                font-weight: 600;
              }

              .fav-card-type {
                padding: 1px 6px;
                border-radius: 4px;
                background: var(--el-color-primary-light-9);
                color: var(--el-color-primary);
                font-size: 11px;
                line-height: 16px;

                &.is-short_video {
                  background: var(--el-color-success-light-9);
                  color: var(--el-color-success);
                }

                &.is-xiaohongshu {
                  background: var(--el-color-danger-light-9);
                  color: var(--el-color-danger);
                }
              }
            }
          }

          .fav-card-status {
            flex-shrink: 0;
          }
        }

        .fav-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 8px;
          border-top: 1px solid var(--el-border-color-lighter);

          .fav-card-time {
            color: var(--el-text-color-placeholder);
            font-size: 12px;
          }
        }
      }
    }
  }
}

@media (max-width: 820px) {
  .cema-media-favorite-page {
    .favorite-layout {
      flex-direction: column;
    }

    .favorite-aside {
      width: 100%;

      .aside-list {
        max-height: 160px;
        flex-direction: row;
        flex-wrap: wrap;
      }
    }

    .favorite-main {
      .main-head {
        flex-wrap: wrap;

        .main-head-right {
          width: 100%;
          flex-wrap: wrap;
        }
      }
    }
  }
}
</style>
