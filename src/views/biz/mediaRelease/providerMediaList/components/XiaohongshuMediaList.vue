<template>
  <section class="xiaohongshu-media-list-panel">
    <div v-loading="loading" class="xiaohongshu-media-list">
      <article v-for="row in rows" :key="row.provider_media_id ?? row.id" class="xiaohongshu-media-card">
        <div class="xiaohongshu-media-card-head">
          <div class="xiaohongshu-media-card-main">
            <div class="xiaohongshu-media-card-logo">
              <span>{{ getMediaInitial(getAccountName(row)) }}</span>
            </div>
            <div class="xiaohongshu-media-card-info">
              <a v-if="row.avatar_url" :href="row.avatar_url" target="_blank" rel="noopener noreferrer"
                class="xiaohongshu-media-card-name is-link">
                {{ getAccountName(row) }}
              </a>
              <strong v-else class="xiaohongshu-media-card-name">{{ getAccountName(row) }}</strong>
              <div class="xiaohongshu-media-card-tags">
                <span v-if="getValue(row, ['city', 'province', 'area'])" class="xiaohongshu-media-card-tag is-region">
                  地区：{{ getValue(row, ["city", "province", "area"]) }}
                </span>
                <span v-if="getIndustryName(row)" class="xiaohongshu-media-card-tag">
                  行业：{{ getIndustryName(row) }}
                </span>
                <span v-for="type in getPublishTypes(row)" :key="type" class="xiaohongshu-media-card-tag is-publish-type">
                  {{ type }}
                </span>
              </div>
            </div>
          </div>

          <div class="xiaohongshu-media-card-actions">
            <div class="xiaohongshu-media-card-price-list">
              <div class="xiaohongshu-media-card-price-item is-article">
                <span>图文价格</span>
                <strong>{{ formatPrice(row.note_art_price) }}<em>元</em></strong>
                <small v-if="formatPower(row.note_art_price) !== '-'">约 {{ formatPower(row.note_art_price) }} 算力</small>
              </div>
              <div class="xiaohongshu-media-card-price-item">
                <span>视频价格</span>
                <strong>{{ formatPrice(row.note_video_price) }}<em>元</em></strong>
                <small v-if="formatPower(row.note_video_price) !== '-'">约 {{ formatPower(row.note_video_price) }} 算力</small>
              </div>
            </div>
            <button type="button" class="xiaohongshu-media-card-action-button" @click="emit('submit', row)">
              <el-icon><Promotion /></el-icon>
              投稿
            </button>
            <button
              type="button"
              class="xiaohongshu-media-card-fav-button"
              :class="{ 'is-favorited': isFavorited(row) }"
              :title="isFavorited(row) ? '取消收藏' : '收藏'"
              :disabled="isFavoritePending(row)"
              @click="emit('favorite', row)"
            >
              <el-icon><StarFilled v-if="isFavorited(row)" /><Star v-else /></el-icon>
            </button>
          </div>
        </div>

        <div class="xiaohongshu-media-card-detail">
          <div class="xiaohongshu-media-card-metrics">
            <div class="xiaohongshu-media-card-metric is-fans">
              <span>粉丝数量</span>
              <strong>{{ formatCount(row.followers_count) }}</strong>
            </div>
            <div class="xiaohongshu-media-card-metric is-reading">
              <span>图文平均阅读</span>
              <strong>{{ formatCount(row.note_art_avg_read) }}</strong>
            </div>
            <div class="xiaohongshu-media-card-metric is-reading">
              <span>视频平均阅读</span>
              <strong>{{ formatCount(row.note_video_avg_read) }}</strong>
            </div>
            <div class="xiaohongshu-media-card-metric is-audience">
              <span>受众性别</span>
              <strong>{{ formatAudienceValue(getValue(row, ["audience_gender", "audienceGender", "gender", "sex"])) }}</strong>
            </div>
            <div class="xiaohongshu-media-card-metric is-audience">
              <span>受众年龄</span>
              <strong>{{ formatAudienceValue(getValue(row, ["audience_age", "audienceAge", "age"])) }}</strong>
            </div>
            <div class="xiaohongshu-media-card-metric is-audience">
              <span>受众地域</span>
              <strong>{{ formatAudienceValue(getValue(row, ["audience_region", "audienceRegion", "audience_area", "audienceArea"])) }}</strong>
            </div>
          </div>
          <div v-if="row.remarks" class="xiaohongshu-media-card-remark">
            <span>备注：</span>
            <strong>{{ row.remarks }}</strong>
          </div>
        </div>
      </article>

      <el-empty v-if="!loading && !rows.length" description="没有找到符合条件的小红书账号" :image-size="72" />
    </div>

    <div v-if="loadingMore || loadError || (!loading && rows.length && !hasMore)" class="xiaohongshu-media-load-state">
      <template v-if="loadingMore">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>正在加载更多小红书账号</span>
      </template>
      <el-button v-else-if="loadError" link type="primary" @click="emit('retry-load-more')">加载失败，点击重试</el-button>
      <span v-else>没有更多小红书账号了</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, type PropType } from "vue";

const props = defineProps({
  rows: { type: Array as PropType<any[]>, default: () => [] },
  industryNames: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  loading: Boolean,
  loadingMore: Boolean,
  loadError: Boolean,
  hasMore: Boolean,
  favoriteProviderMediaIds: { type: Array as PropType<Array<number | string>>, default: () => [] },
  favoritePendingProviderMediaIds: { type: Array as PropType<Array<number | string>>, default: () => [] },
});

const emit = defineEmits(["submit", "favorite", "retry-load-more"]);

const favoriteProviderMediaIdSet = computed(() => new Set(props.favoriteProviderMediaIds.map((id) => String(id))));
const favoritePendingProviderMediaIdSet = computed(() => new Set(props.favoritePendingProviderMediaIds.map((id) => String(id))));

function hasValue(value: any) {
  return value !== undefined && value !== null && value !== "";
}

function getValue(row: any, keys: string[]) {
  return keys.map((key) => row?.[key]).find((value) => hasValue(value));
}

function getAccountName(row: any) {
  return getValue(row, ["account_name", "name"]) || "未命名小红书账号";
}

function getIndustryName(row: any) {
  const industry = getValue(row, ["industry", "industry_type"]);
  if (!hasValue(industry)) return "";

  return String(industry)
    .split(/[\/,，|]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => props.industryNames[item] || item)
    .join("/");
}

function getProviderMediaId(row: any) {
  return row?.provider_media_id;
}

function isFavorited(row: any) {
  const providerMediaId = getProviderMediaId(row);
  return providerMediaId !== undefined && providerMediaId !== null
    && favoriteProviderMediaIdSet.value.has(String(providerMediaId));
}

function isFavoritePending(row: any) {
  const providerMediaId = getProviderMediaId(row);
  return providerMediaId !== undefined && providerMediaId !== null
    && favoritePendingProviderMediaIdSet.value.has(String(providerMediaId));
}

function getMediaInitial(name: any) {
  return hasValue(name) ? String(name).trim().slice(0, 1).toUpperCase() : "小";
}

function getPublishTypes(row: any) {
  const types: string[] = [];
  if (hasValue(row?.note_art_price) || hasValue(row?.note_art_avg_read)) types.push("图文笔记");
  if (hasValue(row?.note_video_price) || hasValue(row?.note_video_avg_read)) types.push("视频笔记");
  return types.length ? types : ["图文笔记", "视频笔记"];
}

function formatPrice(value: any) {
  const price = Number(value);
  return hasValue(value) && Number.isFinite(price)
    ? new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(price)
    : "-";
}

function formatPower(value: any) {
  const price = Number(value);
  return hasValue(value) && Number.isFinite(price)
    ? new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(price * 100)
    : "-";
}

function formatCount(value: any) {
  const count = Number(value);
  if (!hasValue(value) || !Number.isFinite(count)) return "-";
  if (Math.abs(count) >= 100000) {
    return `${new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(count / 10000)}万`;
  }
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 }).format(count);
}

function formatAudienceValue(value: any) {
  if (!hasValue(value)) return "-";
  if (Array.isArray(value)) return value.filter((item) => hasValue(item)).join("、") || "-";
  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([, item]) => hasValue(item))
      .map(([key, item]) => `${key} ${item}`)
      .join("、") || "-";
  }
  return String(value);
}
</script>

<style lang="scss" scoped>
.xiaohongshu-media-list-panel {
  flex: 1 0 auto;
  padding: 0 12px;
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-bg-color);

  .xiaohongshu-media-list {
    display: flex;
    min-height: 180px;
    flex-direction: column;
    padding: 8px 0;

    .xiaohongshu-media-card {
      width: 100%;
      border: 0;
      background: transparent;
      color: inherit;
      text-align: left;

      & + .xiaohongshu-media-card {
        border-top: 1px solid rgb(255 36 66 / 8%);
      }

      &:hover {
        .xiaohongshu-media-card-logo {
          box-shadow: 0 5px 12px rgb(255 36 66 / 25%);
        }

        .xiaohongshu-media-card-action-button {
          background: linear-gradient(135deg, #ff5b75, #ff2442);
          transform: scale(1.06);
        }
      }

      .xiaohongshu-media-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 14px 20px 10px;

        .xiaohongshu-media-card-main {
          display: flex;
          min-width: 0;
          flex: 1;
          align-items: center;
          gap: 12px;

          .xiaohongshu-media-card-logo {
            display: flex;
            width: 45px;
            height: 45px;
            flex-shrink: 0;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border-radius: 14px;
            background: linear-gradient(135deg, #ff879b, #ff2442);
            color: #941024;
            font-size: 18px;
            font-weight: 700;
            transition: box-shadow 0.18s ease;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          .xiaohongshu-media-card-info {
            display: flex;
            min-width: 0;
            flex-direction: column;
            gap: 6px;

            .xiaohongshu-media-card-name {
              display: block;
              overflow: hidden;
              color: var(--el-text-color-primary);
              font-size: 15px;
              font-weight: 700;
              letter-spacing: 0.1px;
              line-height: 22px;
              text-overflow: ellipsis;
              white-space: nowrap;

              &.is-link {
                cursor: pointer;
                text-decoration: none;
                transition: color 0.18s ease;

                &:hover {
                  color: #ff2442;
                }
              }
            }

            .xiaohongshu-media-card-tags {
              display: flex;
              flex-wrap: wrap;
              gap: 4px;

              .xiaohongshu-media-card-tag {
                padding: 2px 7px;
                border-radius: 4px;
                background: #fff0f2;
                color: #d91636;
                font-size: 11px;
                line-height: 16px;

                &.is-region {
                  background: var(--el-color-warning-light-9);
                  color: var(--el-color-warning-dark-2);
                }

                &.is-publish-type {
                  background: #fff7e6;
                  color: #c77600;
                }
              }
            }
          }
        }

        .xiaohongshu-media-card-actions {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          gap: 8px;

          .xiaohongshu-media-card-price-list {
            display: flex;
            align-items: center;
            gap: 14px;

            .xiaohongshu-media-card-price-item {
              display: flex;
              min-width: 74px;
              flex-direction: column;
              align-items: flex-end;
              color: var(--el-text-color-secondary);
              font-size: 11px;
              line-height: 16px;
              white-space: nowrap;

              strong {
                color: #d91636;
                font-size: 18px;
                line-height: 21px;

                em {
                  margin-left: 2px;
                  color: var(--el-text-color-secondary);
                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                }
              }

              small {
                color: var(--el-text-color-secondary);
                font-size: 10px;
                line-height: 14px;
              }

              &.is-article strong {
                color: #ff2442;
              }
            }
          }

          .xiaohongshu-media-card-action-button,
          .xiaohongshu-media-card-fav-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 0;
            cursor: pointer;
            transition: background-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
          }

          .xiaohongshu-media-card-action-button {
            gap: 5px;
            min-width: 70px;
            height: 32px;
            border-radius: 8px;
            background: linear-gradient(135deg, #ff7087, #ff3d59);
            color: #fff;
            font-size: 12px;
          }

          .xiaohongshu-media-card-fav-button {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: var(--el-fill-color-light);
            color: var(--el-text-color-secondary);

            &:hover,
            &.is-favorited {
              background: rgb(255 36 66 / 12%);
              color: #ff2442;
            }

            &:disabled {
              cursor: wait;
              opacity: 0.65;
            }
          }
        }
      }

      .xiaohongshu-media-card-detail {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
        margin: 0 20px;
        padding-bottom: 12px;

        .xiaohongshu-media-card-metrics {
          display: flex;
          width: 100%;
          min-width: 0;
          flex: 0 1 auto;
          flex-wrap: wrap;
          gap: 6px;

          .xiaohongshu-media-card-metric {
            display: flex;
            width: 156px;
            min-width: 0;
            flex: 0 0 156px;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 6px 11px;
            border-radius: 8px;
            background: #fff6f7;

            span {
              flex-shrink: 0;
              color: #a74959;
              font-size: 11px;
              white-space: nowrap;
            }

            strong {
              overflow: hidden;
              color: #d91636;
              font-size: 14px;
              line-height: 20px;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            &.is-fans {
              background: #fff0f2;

              strong {
                color: #ff2442;
                font-size: 16px;
              }
            }

            &.is-reading {
              background: #fff7e9;

              span {
                color: #a96800;
              }

              strong {
                color: #c77600;
              }
            }

            &.is-audience {
              background: var(--el-fill-color-lighter);

              span {
                color: var(--el-text-color-secondary);
              }

              strong {
                color: var(--el-text-color-primary);
              }
            }
          }
        }

        .xiaohongshu-media-card-remark {
          display: flex;
          width: 100%;
          min-width: 0;
          align-items: center;
          color: var(--el-text-color-secondary);
          font-size: 13px;
          line-height: 20px;

          span {
            flex-shrink: 0;
          }

          strong {
            min-width: 0;
            color: var(--el-text-color-primary);
            font-weight: 400;
            overflow-wrap: anywhere;
          }
        }
      }
    }
  }

  .xiaohongshu-media-load-state {
    display: flex;
    min-height: 34px;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}

@media screen and (max-width: 1120px) {
  .xiaohongshu-media-list-panel {
    .xiaohongshu-media-list {
      .xiaohongshu-media-card {
        .xiaohongshu-media-card-detail {
          flex-direction: column;

          .xiaohongshu-media-card-metrics,
          .xiaohongshu-media-card-remark {
            width: 100%;
            max-width: none;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 760px) {
  .xiaohongshu-media-list-panel {
    padding: 0 8px;

    .xiaohongshu-media-list {
      .xiaohongshu-media-card {
        .xiaohongshu-media-card-head {
          align-items: flex-start;
          padding: 12px 8px 10px;

          .xiaohongshu-media-card-actions {
            width: 110px;
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 4px;

            .xiaohongshu-media-card-price-list {
              width: 100%;
              flex-direction: column;
              align-items: flex-end;
              gap: 1px;

              .xiaohongshu-media-card-price-item {
                align-items: flex-end;
              }
            }
          }
        }

        .xiaohongshu-media-card-detail {
          margin: 0 8px;

          .xiaohongshu-media-card-remark {
            min-width: 0;
          }
        }
      }
    }
  }
}

</style>
