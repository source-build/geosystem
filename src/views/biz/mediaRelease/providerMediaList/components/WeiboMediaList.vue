<template>
  <section class="weibo-media-list-panel">
    <div v-loading="loading" class="weibo-media-list">
      <article v-for="row in rows" :key="row.provider_media_id ?? row.id" class="weibo-media-card">
        <div class="weibo-media-card-head">
          <div class="weibo-media-card-main">
            <div class="weibo-media-card-logo">
              <img v-if="row.logo_url" :src="row.logo_url" :alt="row.name || '微博 Logo'" />
              <span v-else>{{ getMediaInitial(row.name) }}</span>
            </div>
            <div class="weibo-media-card-info">
              <div class="weibo-media-card-heading">
                <span
                  class="weibo-media-card-verification"
                  :class="`is-level-${getVerificationLevel(row)}`"
                  :title="getVerificationLabel(row)"
                  :aria-label="getVerificationLabel(row)"
                >
                  <svg viewBox="0 0 1024 1024" aria-hidden="true">
                    <path d="M512.002133 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z" fill="#FFFFFF"></path>
                    <path d="M820.994133 325.461333c0 4.650667 0 4.650667-4.650666 9.301334l-306.133334 463.786666h-153.045333l-51.029333-431.36c0-18.517333-4.650667-27.818667-13.909334-37.12-4.650667-4.608-13.909333-13.866667-27.861333-13.866666l4.693333-18.56h143.786667c13.866667 0 27.776 4.650667 32.426667 9.258666 9.301333 9.301333 13.909333 23.210667 18.56 37.12l27.818666 296.832 157.696-282.88v-18.602666c0-4.608-4.608-13.909333-9.258666-13.909334-4.650667-4.650667-13.909333-4.650667-23.210667-9.258666l4.693333-18.56h166.954667c9.258667 0 18.56 0 23.168 4.650666 4.650667 4.608 9.301333 9.258667 9.301333 13.909334 4.608 4.608 4.608 9.258667 0 9.258666z m-310.784-324.693333C231.938133 0.768 0.002133 228.053333 0.002133 511.018667a508.757333 508.757333 0 0 0 510.208 510.208 508.757333 508.757333 0 0 0 510.208-510.208A508.757333 508.757333 0 0 0 510.210133 0.768z" fill="currentColor"></path>
                  </svg>
                </span>
                <a v-if="row.case_url" :href="row.case_url" target="_blank" rel="noopener noreferrer"
                  class="weibo-media-card-name is-link">
                  {{ row.name || "未命名微博" }}
                </a>
                <strong v-else class="weibo-media-card-name">{{ row.name || "未命名微博" }}</strong>
              </div>
              <div v-if="getTags(row).length" class="weibo-media-card-tags">
                <span v-for="tag in getTags(row)" :key="tag.text" class="weibo-media-card-tag" :class="tag.type">
                  {{ tag.text }}
                </span>
              </div>
            </div>
          </div>

          <div class="weibo-media-card-actions">
            <div class="weibo-media-card-price-list">
              <div class="weibo-media-card-price-item is-direct">
                <span>直发价格</span>
                <strong>{{ formatPrice(row.price0) }}<em>元</em></strong>
                <small v-if="formatPower(row.price0) !== '-'">约 {{ formatPower(row.price0) }} 算力</small>
              </div>
              <div class="weibo-media-card-price-item">
                <span>转发价格</span>
                <strong>{{ formatPrice(row.price02) }}<em>元</em></strong>
                <small v-if="formatPower(row.price02) !== '-'">约 {{ formatPower(row.price02) }} 算力</small>
              </div>
              <div class="weibo-media-card-price-item">
                <span>任务价格</span>
                <strong>{{ formatPrice(row.price03) }}<em>元</em></strong>
                <small v-if="formatPower(row.price03) !== '-'">约 {{ formatPower(row.price03) }} 算力</small>
              </div>
            </div>
            <button type="button" class="weibo-media-card-action-button" @click="emit('submit', row)">
              <el-icon><Promotion /></el-icon>
              投稿
            </button>
            <button
              type="button"
              class="weibo-media-card-fav-button"
              :class="{ 'is-favorited': isFavorited(row) }"
              :title="isFavorited(row) ? '取消收藏' : '收藏'"
              :disabled="isFavoritePending(row)"
              @click="emit('favorite', row)"
            >
              <el-icon><StarFilled v-if="isFavorited(row)" /><Star v-else /></el-icon>
            </button>
          </div>
        </div>

        <div class="weibo-media-card-detail">
          <div class="weibo-media-card-metric is-audience">
            <span>参考粉丝量</span>
            <strong>{{ formatCount(row.fans) }}</strong>
          </div>
          <div v-if="row.remarks" class="weibo-media-card-remark">
            <span>备注[只供参考]：</span>
            <strong>{{ row.remarks }}</strong>
          </div>
          <div v-if="formatReleaseDuration(row.release_rate)" class="weibo-media-card-release-rate"
            :class="{ 'is-empty': formatReleaseDuration(row.release_rate) === '暂无' }">
            <svg class="weibo-media-card-release-icon" viewBox="0 0 1024 1024" aria-hidden="true">
              <path d="M510.293333 119.466667C750.933333 119.466667 945.493333 314.026667 945.493333 554.666667S750.933333 989.866667 510.293333 989.866667 75.093333 795.306667 75.093333 554.666667 269.653333 119.466667 510.293333 119.466667z m0 95.573333c-187.733333 0-337.92 151.893333-337.92 337.92 0 187.733333 151.893333 337.92 337.92 337.92 187.733333 0 337.92-151.893333 337.92-337.92s-150.186667-337.92-337.92-337.92z m40.96 114.346667c5.12 3.413333 6.826667 8.533333 6.826667 15.36v160.426666h105.813333c6.826667 0 13.653333 3.413333 17.066667 10.24 3.413333 6.826667 1.706667 15.36-1.706667 20.48l-182.613333 238.933334c-5.12 6.826667-13.653333 8.533333-22.186667 6.826666-8.533333-3.413333-13.653333-10.24-13.653333-18.773333v-160.426667h-105.813333c-6.826667 0-13.653333-3.413333-17.066667-10.24-3.413333-6.826667 1.706667-15.36 1.706667-20.48l182.613333-238.933333c8.533333-8.533333 20.48-10.24 29.013333-3.413333z" fill="currentColor"></path>
            </svg>
            <span>平均出稿速度：</span>
            <strong>{{ formatReleaseDuration(row.release_rate) }}</strong>
          </div>
        </div>
      </article>

      <el-empty v-if="!loading && !rows.length" description="没有找到符合条件的微博" :image-size="72" />
    </div>

    <div v-if="loadingMore || loadError || (!loading && rows.length && !hasMore)" class="weibo-media-load-state">
      <template v-if="loadingMore">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>正在加载更多微博</span>
      </template>
      <el-button v-else-if="loadError" link type="primary" @click="emit('retry-load-more')">加载失败，点击重试</el-button>
      <span v-else>没有更多微博了</span>
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
  return hasValue(name) ? String(name).trim().slice(0, 1).toUpperCase() : "微";
}

function getVerificationLevel(row: any) {
  const level = Number(row?.self_vrz ?? row?.selfVrz);
  return Number.isInteger(level) && level >= 0 && level <= 3 ? level : 0;
}

function getVerificationLabel(row: any) {
  const labels = ["V认证：未认证", "V认证：黄V认证", "V认证：蓝V认证", "V认证：橙V认证"];
  return labels[getVerificationLevel(row)];
}

function getCategoryName(key: string, value: any) {
  const name = props.tagNames?.[key]?.[String(value)] || "";
  return name || (hasValue(value) ? String(value) : "");
}

function getTags(row: any) {
  return [
    { label: "行业", value: getCategoryName("industry", row?.industry_type) },
    { label: "地区", value: getCategoryName("area", row?.area), type: "is-region" },
    { text: getVerificationLabel(row), type: `is-verification is-level-${getVerificationLevel(row)}` },
    { text: row?.n_link ? "可带链接" : "不可带链接", type: row?.n_link ? "is-available" : "is-unavailable" },
    { text: row?.contact_show ? "可发联系方式" : "不可发联系方式", type: row?.contact_show ? "is-available" : "is-unavailable" },
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
.weibo-media-list-panel {
  flex: 1 0 auto;
  padding: 0 12px;
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-bg-color);

  .weibo-media-list {
    display: flex;
    min-height: 180px;
    flex-direction: column;
    padding: 8px 0;

    .weibo-media-card {
      width: 100%;
      border: 0;
      background: transparent;
      color: inherit;
      text-align: left;

      & + .weibo-media-card {
        border-top: 1px solid rgb(0 0 0 / 3%);
      }

      &:hover {
        .weibo-media-card-logo {
          box-shadow: 0 5px 12px rgb(245 108 108 / 25%);
        }

        .weibo-media-card-action-button {
          background: linear-gradient(135deg, #f98484, #e34c4c);
          transform: scale(1.06);
        }
      }

      .weibo-media-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 14px 20px 10px;

        .weibo-media-card-main {
          display: flex;
          min-width: 0;
          flex: 1;
          align-items: center;
          gap: 12px;

          .weibo-media-card-logo {
            display: flex;
            width: 45px;
            height: 45px;
            flex-shrink: 0;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border-radius: 14px;
            background: linear-gradient(135deg, #f98d8d, #f56c6c);
            color: #8d2626;
            font-size: 18px;
            font-weight: 700;
            transition: box-shadow 0.18s ease;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          .weibo-media-card-info {
            display: flex;
            min-width: 0;
            flex-direction: column;
            gap: 6px;

            .weibo-media-card-heading {
              display: flex;
              min-width: 0;
              align-items: center;

              .weibo-media-card-verification {
                display: inline-flex;
                width: 17px;
                height: 17px;
                flex-shrink: 0;
                align-items: center;
                justify-content: center;
                margin-right: 5px;
                color: var(--el-text-color-placeholder);

                &.is-level-1 {
                  color: var(--el-color-warning);
                }

                &.is-level-2 {
                  color: var(--el-color-primary);
                }

                &.is-level-3 {
                  color: #f97316;
                }

                svg {
                  width: 100%;
                  height: 100%;
                }
              }

              .weibo-media-card-name {
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
                    color: #df4848;
                  }
                }
              }
            }

            .weibo-media-card-tags {
              display: flex;
              flex-wrap: wrap;
              gap: 4px;

              .weibo-media-card-tag {
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

                &.is-verification {
                  &.is-level-1 {
                    background: var(--el-color-warning-light-9);
                    color: var(--el-color-warning-dark-2);
                  }

                  &.is-level-2 {
                    background: var(--el-color-primary-light-9);
                    color: var(--el-color-primary);
                  }

                  &.is-level-3 {
                    background: #fff0e8;
                    color: #ea580c;
                  }
                }
              }
            }
          }
        }

        .weibo-media-card-actions {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          gap: 8px;

          .weibo-media-card-price-list {
            display: flex;
            align-items: center;
            gap: 14px;

            .weibo-media-card-price-item {
              display: flex;
              min-width: 74px;
              flex-direction: column;
              align-items: flex-end;
              color: var(--el-text-color-secondary);
              font-size: 11px;
              line-height: 16px;
              white-space: nowrap;

              strong {
                color: #df4848;
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

              &.is-direct strong {
                color: #f44336;
              }
            }
          }

          .weibo-media-card-action-button,
          .weibo-media-card-fav-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 0;
            cursor: pointer;
            transition: background-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
          }

          .weibo-media-card-action-button {
            gap: 5px;
            min-width: 70px;
            height: 32px;
            border-radius: 8px;
            background: linear-gradient(135deg, #f98484, #f56c6c);
            color: #fff;
            font-size: 12px;
          }

          .weibo-media-card-fav-button {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: var(--el-fill-color-light);
            color: var(--el-text-color-secondary);

            &:hover,
            &.is-favorited {
              background: rgb(245 108 108 / 13%);
              color: #df4848;
            }

            &:disabled {
              cursor: wait;
              opacity: 0.65;
            }
          }
        }
      }

      .weibo-media-card-detail {
        display: flex;
        align-items: center;
        gap: 14px;
        margin: 0 20px;
        padding-bottom: 12px;

        .weibo-media-card-metric {
          display: inline-flex;
          min-width: 122px;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 6px 11px;
          border-radius: 8px;
          background: #fff1f1;

          span {
            color: #9f4a4a;
            font-size: 11px;
            white-space: nowrap;
          }

          strong {
            color: #df4848;
            font-size: 16px;
            line-height: 20px;
            white-space: nowrap;
          }
        }

        .weibo-media-card-remark {
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

        .weibo-media-card-release-rate {
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

          .weibo-media-card-release-icon {
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

  .weibo-media-load-state {
    display: flex;
    min-height: 34px;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}

@media screen and (max-width: 1050px) {
  .weibo-media-list-panel {
    .weibo-media-list {
      .weibo-media-card {
        .weibo-media-card-head {
          align-items: flex-start;

          .weibo-media-card-actions {
            .weibo-media-card-price-list {
              gap: 8px;

              .weibo-media-card-price-item {
                min-width: 62px;
              }
            }
          }
        }

        .weibo-media-card-detail {
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 7px 14px;

          .weibo-media-card-remark {
            min-width: min(100%, 360px);
          }
        }
      }
    }
  }
}

@media screen and (max-width: 760px) {
  .weibo-media-list-panel {
    padding: 0 8px;

    .weibo-media-list {
      .weibo-media-card {
        .weibo-media-card-head {
          padding: 12px 8px 10px;

          .weibo-media-card-actions {
            width: 116px;
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 4px;

            .weibo-media-card-price-list {
              width: 100%;
              flex-direction: column;
              align-items: flex-end;
              gap: 1px;

              .weibo-media-card-price-item {
                align-items: flex-end;
              }
            }
          }
        }

        .weibo-media-card-detail {
          flex-direction: column;
          margin: 0 8px;

          .weibo-media-card-metric,
          .weibo-media-card-remark {
            width: 100%;
          }

          .weibo-media-card-release-rate {
            align-self: flex-end;
          }
        }
      }
    }
  }
}
</style>
