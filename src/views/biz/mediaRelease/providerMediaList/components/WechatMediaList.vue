<template>
  <section class="wechat-media-list-panel">
    <div v-loading="loading" class="wechat-media-list">
      <article v-for="row in rows" :key="row.provider_media_id ?? row.id" class="wechat-media-card">
        <div class="wechat-media-card-head">
          <div class="wechat-media-card-main">
            <div class="wechat-media-card-logo">
              <img v-if="row.logo_url" :src="row.logo_url" :alt="row.name || '公众号 Logo'" />
              <span v-else>{{ getMediaInitial(row.name) }}</span>
            </div>
            <div class="wechat-media-card-info">
              <div class="wechat-media-card-heading">
                <span v-if="isOfficial(row)" class="wechat-media-card-official">官媒</span>
                <svg
                  v-if="isOfficial(row)"
                  class="wechat-media-card-certification"
                  viewBox="0 0 1024 1024"
                  aria-label="官方认证"
                  role="img"
                >
                  <path d="M956.672 459.776 862.72 397.568c-16.64-11.008-24.832-30.976-20.992-50.688l22.272-110.592c4.096-20.736-2.304-42.24-17.152-57.344-15.104-15.104-36.352-21.504-57.344-17.152l-110.592 22.272c-19.712 4.096-39.424-4.352-50.688-20.992L565.76 69.12c-11.776-17.664-31.488-28.16-52.736-28.16s-40.96 10.496-52.736 28.16l-62.464 93.952c-11.008 16.64-30.976 24.832-50.688 20.992l-110.592-22.272c-20.736-4.096-42.24 2.304-57.344 17.152-15.104 15.104-21.504 36.352-17.152 57.344l22.272 110.592c3.84 19.712-4.352 39.424-20.992 50.688l-93.952 62.464c-17.664 11.776-28.16 31.488-28.16 52.736s10.496 40.96 28.16 52.736l93.952 62.464c16.64 11.008 24.832 30.976 20.992 50.688l-22.272 110.592c-4.096 20.736 2.304 42.24 17.152 57.344 15.104 15.104 36.352 21.504 57.344 17.152l110.592-22.272c19.712-4.096 39.424 4.352 50.688 20.992l62.464 93.952c11.776 17.664 31.488 28.16 52.736 28.16s40.96-10.496 52.736-28.16l62.464-93.952c11.008-16.64 30.976-24.832 50.688-20.992l110.592 22.272c20.736 4.096 42.24-2.304 57.344-17.152 15.104-15.104 21.504-36.352 17.152-57.344l-22.272-110.592c-3.84-19.712 4.352-39.424 20.992-50.688l93.952-62.464c17.664-11.776 28.16-31.488 28.16-52.736s-10.496-41.216-28.16-52.992z m-249.344-22.016-211.456 215.04c-5.888 6.144-13.824 9.216-22.016 9.216-7.168 0-14.592-2.56-20.224-7.68l-138.24-122.112c-12.8-11.264-13.824-30.72-2.816-43.264 11.264-12.8 30.72-13.824 43.264-2.816l116.48 102.912 190.976-194.304c11.776-12.032 31.232-12.288 43.52-0.256 12.288 11.52 12.288 30.976 0.512 43.264z" fill="#5396FF" />
                </svg>
                <a v-if="row.case_url" :href="row.case_url" target="_blank" rel="noopener noreferrer"
                  class="wechat-media-card-name is-link">
                  {{ row.name || "未命名公众号" }}
                </a>
                <strong v-else class="wechat-media-card-name">{{ row.name || "未命名公众号" }}</strong>
              </div>
              <div class="wechat-media-card-tags">
                <span v-for="tag in getTags(row)" :key="tag.text" class="wechat-media-card-tag" :class="tag.type">
                  {{ tag.text }}
                </span>
              </div>
            </div>
          </div>
          <div class="wechat-media-card-actions">
            <div class="wechat-media-card-price-list">
              <div class="wechat-media-card-price-item">
                <span>头条价格</span>
                <strong>{{ formatPrice(row.price0) }}<em>元</em></strong>
                <small v-if="formatPower(row.price0) !== '-'">约 {{ formatPower(row.price0) }} 算力</small>
              </div>
              <div class="wechat-media-card-price-item">
                <span>次条价格</span>
                <strong>{{ formatPrice(row.price02) }}<em>元</em></strong>
                <small v-if="formatPower(row.price02) !== '-'">约 {{ formatPower(row.price02) }} 算力</small>
              </div>
            </div>
            <button type="button" class="wechat-media-card-action-button" @click="emit('submit', row)">
              <el-icon><Promotion /></el-icon>
              投稿
            </button>
            <button
              type="button"
              class="wechat-media-card-fav-button"
              :class="{ 'is-favorited': isFavorited(row) }"
              :title="isFavorited(row) ? '取消收藏' : '收藏'"
              :disabled="isFavoritePending(row)"
              @click="emit('favorite', row)"
            >
              <el-icon><StarFilled v-if="isFavorited(row)" /><Star v-else /></el-icon>
            </button>
          </div>
        </div>

        <div class="wechat-media-card-detail">
          <div class="wechat-media-card-metrics">
            <div class="wechat-media-card-metric is-audience">
              <span>参考粉丝量</span>
              <strong>{{ formatCount(row.fans) }}</strong>
            </div>
            <div class="wechat-media-card-metric is-audience">
              <span>参考阅读量</span>
              <strong>{{ formatCount(row.reading) }}</strong>
            </div>
          </div>
          <div v-if="row.remarks" class="wechat-media-card-remark" :title="row.remarks">
            <span>备注[只供参考]：</span>
            <strong>{{ row.remarks }}</strong>
          </div>
          <div v-if="formatReleaseDuration(row.release_rate)" class="wechat-media-card-release-rate"
            :class="{ 'is-empty': formatReleaseDuration(row.release_rate) === '暂无' }">
            <svg class="wechat-media-card-release-icon" viewBox="0 0 1024 1024" aria-hidden="true">
              <path d="M510.293333 119.466667C750.933333 119.466667 945.493333 314.026667 945.493333 554.666667S750.933333 989.866667 510.293333 989.866667 75.093333 795.306667 75.093333 554.666667 269.653333 119.466667 510.293333 119.466667z m0 95.573333c-187.733333 0-337.92 151.893333-337.92 337.92 0 187.733333 151.893333 337.92 337.92 337.92 187.733333 0 337.92-151.893333 337.92-337.92s-150.186667-337.92-337.92-337.92z m40.96 114.346667c5.12 3.413333 6.826667 8.533333 6.826667 15.36v160.426666h105.813333c6.826667 0 13.653333 3.413333 17.066667 10.24 3.413333 6.826667 1.706667 15.36-1.706667 20.48l-182.613333 238.933334c-5.12 6.826667-13.653333 8.533333-22.186667 6.826666-8.533333-3.413333-13.653333-10.24-13.653333-18.773333v-160.426667h-105.813333c-6.826667 0-13.653333-3.413333-17.066667-10.24-3.413333-6.826667-1.706667-15.36 1.706667-20.48l182.613333-238.933333c8.533333-8.533333 20.48-10.24 29.013333-3.413333zM740.693333 52.906667c17.066667-20.48 47.786667-23.893333 68.266667-5.12l148.48 124.586666c10.24 8.533333 15.36 20.48 17.066667 32.426667 1.706667 11.946667-3.413333 25.6-11.946667 35.84-17.066667 20.48-47.786667 23.893333-68.266667 5.12l-148.48-124.586667c-10.24-8.533333-15.36-20.48-17.066666-32.426666 0-13.653333 3.413333-27.306667 11.946666-35.84z m-523.946666-10.24c22.186667-15.36 51.2-10.24 66.56 11.946666 15.36 20.48 11.946667 51.2-8.533334 66.56l-148.48 124.586667c-10.24 6.826667-23.893333 10.24-35.84 10.24-13.653333-1.706667-23.893333-6.826667-32.426666-17.066667-17.066667-20.48-13.653333-51.2 6.826666-68.266666l148.48-124.586667 3.413334-3.413333z" fill="currentColor"></path>
            </svg>
            <span>平均出稿速度：</span>
            <strong>{{ formatReleaseDuration(row.release_rate) }}</strong>
          </div>
        </div>
      </article>

      <el-empty v-if="!loading && !rows.length" description="没有找到符合条件的公众号" :image-size="72" />
    </div>

    <div v-if="loadingMore || loadError || (!loading && rows.length && !hasMore)" class="wechat-media-load-state">
      <template v-if="loadingMore">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>正在加载更多公众号</span>
      </template>
      <el-button v-else-if="loadError" link type="primary" @click="emit('retry-load-more')">加载失败，点击重试</el-button>
      <span v-else>没有更多公众号了</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { computed, type PropType } from "vue";

dayjs.extend(duration);

const props = defineProps({
  rows: { type: Array as PropType<any[]>, default: () => [] },
  tagNames: { type: Object as PropType<Record<string, Record<string, string>>>, default: () => ({}) },
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
  return hasValue(value) && Number.isFinite(count)
    ? new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 }).format(count)
    : "-";
}

function getMediaInitial(name: any) {
  return hasValue(name) ? String(name).trim().slice(0, 1).toUpperCase() : "公";
}

function isOfficial(row: any) {
  return row?.gfrz === true || Number(row?.gfrz) === 1;
}

function getCategoryName(key: string, value: any) {
  const name = props.tagNames?.[key]?.[String(value)] || "";
  return key === "portal_type" && name === "以上都不是" ? "其他" : name;
}

function getTags(row: any) {
  return [
    { label: "行业", value: getCategoryName("industry", row.industry_type) },
    { label: "门户", value: getCategoryName("portal_type", row.portal_type) },
    { label: "地区", value: getCategoryName("area", row.area), type: "is-region" },
    { text: row.n_link ? "可带链接" : "不可带链接", type: row.n_link ? "is-available" : "is-unavailable" },
    { text: row.contact_show ? "可发联系方式" : "不可发联系方式", type: row.contact_show ? "is-available" : "is-unavailable" },
    { text: isOfficial(row) ? "官方认证" : "非官方认证", type: isOfficial(row) ? "is-official" : "is-unavailable" },
  ].filter((tag) => tag.text || (hasValue(tag.label) && hasValue(tag.value)))
    .map((tag) => ({ text: tag.text || `${tag.label}：${tag.value}`, type: tag.type || "" }));
}

function formatReleaseDuration(value: any) {
  if (!hasValue(value)) return "";

  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes < 0) return "";
  if (minutes === 0) return "暂无";

  let seconds = Math.round(dayjs.duration(minutes, "minute").asSeconds());
  if (seconds <= 0) return "暂无";
  if (seconds < 60) return `${seconds}秒`;
  if (seconds < 60 * 60) {
    const minuteValue = Math.floor(seconds / 60);
    const secondValue = seconds % 60;
    return secondValue ? `${minuteValue}分钟${secondValue}秒` : `${minuteValue}分钟`;
  }
  if (seconds < 24 * 60 * 60) {
    const hourValue = Math.floor(seconds / (60 * 60));
    const minuteValue = Math.floor((seconds % (60 * 60)) / 60);
    return minuteValue ? `${hourValue}小时${minuteValue}分钟` : `${hourValue}小时`;
  }
  if (seconds < 7 * 24 * 60 * 60) {
    const dayValue = Math.floor(seconds / (24 * 60 * 60));
    const hourValue = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    return hourValue ? `${dayValue}天${hourValue}小时` : `${dayValue}天`;
  }

  const weekValue = Math.floor(seconds / (7 * 24 * 60 * 60));
  seconds %= 7 * 24 * 60 * 60;
  const dayValue = Math.floor(seconds / (24 * 60 * 60));
  return dayValue ? `${weekValue}周${dayValue}天` : `${weekValue}周`;
}
</script>

<style lang="scss" scoped>
.wechat-media-list-panel {
  flex: 1 0 auto;
  padding: 0 12px;
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-bg-color);

  .wechat-media-list {
    display: flex;
    min-height: 180px;
    flex-direction: column;
    padding: 8px 0;

    .wechat-media-card {
      width: 100%;
      border: 0;
      background: transparent;
      color: inherit;
      text-align: left;

      & + .wechat-media-card {
        border-top: 1px solid rgb(0 0 0 / 3%);
      }

      &:hover {
        .wechat-media-card-logo {
          box-shadow: 0 5px 12px rgb(54 207 201 / 25%);
        }

        .wechat-media-card-action-button {
          background: linear-gradient(135deg, #36cfc9, #13a8a8);
          transform: scale(1.06);
        }
      }

      .wechat-media-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 14px 20px 10px;

        .wechat-media-card-main {
          display: flex;
          min-width: 0;
          flex: 1;
          align-items: center;
          gap: 12px;

          .wechat-media-card-logo {
            display: flex;
            width: 45px;
            height: 45px;
            flex-shrink: 0;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border-radius: 14px;
            background: linear-gradient(135deg, #74ded8, #36cfc9);
            color: #075c5a;
            font-size: 18px;
            font-weight: 700;
            transition: box-shadow 0.18s ease;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          .wechat-media-card-info {
            display: flex;
            min-width: 0;
            flex-direction: column;
            gap: 6px;

            .wechat-media-card-heading {
              display: flex;
              min-width: 0;
              align-items: center;

              .wechat-media-card-official {
                flex-shrink: 0;
                margin-right: 6px;
                padding: 1px 5px;
                border-radius: 4px;
                background: var(--el-color-danger-light-9);
                color: var(--el-color-danger);
                font-size: 11px;
                font-weight: 600;
                line-height: 16px;
              }

              .wechat-media-card-certification {
                width: 17px;
                height: 17px;
                flex-shrink: 0;
                margin-right: 5px;
              }

              .wechat-media-card-name {
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
                    color: #0f9f8e;
                  }
                }
              }
            }

            .wechat-media-card-tags {
              display: flex;
              flex-wrap: wrap;
              gap: 4px;

              .wechat-media-card-tag {
                padding: 2px 7px;
                border-radius: 4px;
                background: var(--el-fill-color-light);
                color: var(--el-text-color-secondary);
                font-size: 11px;
                line-height: 16px;

                &.is-available {
                  background: var(--el-color-success-light-9);
                  color: var(--el-color-success);
                }

                &.is-unavailable {
                  background: var(--el-color-danger-light-9);
                  color: var(--el-color-danger);
                }

                &.is-region {
                  background: var(--el-color-warning-light-9);
                  color: var(--el-color-warning-dark-2);
                }

                &.is-official {
                  background: var(--el-color-primary-light-9);
                  color: var(--el-color-primary);
                }
              }
            }
          }
        }

        .wechat-media-card-actions {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          gap: 8px;

          .wechat-media-card-price-list {
            display: flex;
            align-items: center;
            gap: 14px;

            .wechat-media-card-price-item {
              display: flex;
              min-width: 74px;
              flex-direction: column;
              align-items: flex-end;
              color: var(--el-text-color-secondary);
              font-size: 11px;
              line-height: 16px;
              white-space: nowrap;

              strong {
                color: #0f9f8e;
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

              &:first-child strong {
                color: #f44336;
              }
            }
          }

          .wechat-media-card-action-button,
          .wechat-media-card-fav-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 0;
            cursor: pointer;
            transition: background-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
          }

          .wechat-media-card-action-button {
            gap: 5px;
            min-width: 70px;
            height: 32px;
            border-radius: 8px;
            background: linear-gradient(135deg, #57d7d0, #28bdb8);
            color: #fff;
            font-size: 12px;
          }

          .wechat-media-card-fav-button {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: var(--el-fill-color-light);
            color: var(--el-text-color-secondary);

            &:hover,
            &.is-favorited {
              background: rgb(54 207 201 / 13%);
              color: #0f9f8e;
            }

            &:disabled {
              cursor: wait;
              opacity: 0.65;
            }
          }
        }
      }

      .wechat-media-card-detail {
        display: flex;
        align-items: center;
        gap: 14px;
        margin: 0 20px;
        padding-bottom: 12px;

        .wechat-media-card-metrics {
          display: flex;
          min-width: 0;
          gap: 8px;

          .wechat-media-card-metric {
            display: inline-flex;
            min-width: 102px;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 6px 11px;
            border-radius: 8px;
            background: var(--el-fill-color-lighter);

            span {
              color: var(--el-text-color-secondary);
              font-size: 11px;
              white-space: nowrap;
            }

            strong {
              color: #0f9f8e;
              font-size: 16px;
              line-height: 20px;
              white-space: nowrap;

              em {
                margin-left: 2px;
                color: var(--el-text-color-secondary);
                font-size: 11px;
                font-style: normal;
                font-weight: 400;
              }
            }

            &.is-audience {
              background: #eef8fd;

              strong {
                color: #2789b8;
              }
            }
          }
        }

        .wechat-media-card-remark {
          display: flex;
          min-width: 0;
          flex: 1;
          align-items: flex-start;
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

        .wechat-media-card-release-rate {
          display: inline-flex;
          flex-shrink: 0;
          align-items: center;
          gap: 4px;
          margin-left: auto;
          color: var(--el-color-success);
          font-size: 13px;
          white-space: nowrap;

          &.is-empty {
            color: var(--el-text-color-placeholder);
          }

          .wechat-media-card-release-icon {
            width: 14px;
            height: 14px;
            fill: currentColor;
          }

          strong {
            color: inherit;
            font-size: 13px;
            font-weight: 400;
          }
        }
      }
    }
  }

  .wechat-media-load-state {
    display: flex;
    min-height: 34px;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}

@media screen and (max-width: 900px) {
  .wechat-media-list-panel {
    .wechat-media-list {
      .wechat-media-card {
        .wechat-media-card-detail {
          align-items: flex-start;
          flex-direction: column;
          gap: 5px;

          .wechat-media-card-metrics {
            width: 100%;
            flex-wrap: wrap;
          }

          .wechat-media-card-remark {
            width: 100%;
            padding: 2px 0 0;
          }

          .wechat-media-card-release-rate {
            align-self: flex-end;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 700px) {
  .wechat-media-list-panel {
    padding: 0 8px;

    .wechat-media-list {
      .wechat-media-card {
        .wechat-media-card-head {
          align-items: flex-start;
          padding: 12px 8px 10px;

          .wechat-media-card-actions {
            width: 110px;
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 4px;

            .wechat-media-card-price-list {
              width: 100%;
              flex-direction: column;
              align-items: flex-end;
              gap: 1px;

              .wechat-media-card-price-item {
                align-items: flex-end;
              }
            }
          }
        }

        .wechat-media-card-detail {
          margin: 0 8px;

          .wechat-media-card-metrics {
            .wechat-media-card-metric {
              min-width: calc(50% - 4px);
              flex: 1;
            }
          }
        }
      }
    }
  }
}
</style>
