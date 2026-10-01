<template>
  <section class="normal-media-list-panel">
    <div v-loading="loading" class="normal-media-list">
      <article v-for="row in rows" :key="row.provider_media_id ?? row.id" class="normal-media-card"
        :class="{ 'is-self-media': isSelfMedia }">
        <div class="normal-media-card-head">
          <div class="normal-media-card-main">
            <div class="normal-media-card-logo">
              <img v-if="row.logo_url" :src="row.logo_url" :alt="row.name || '媒体 Logo'" />
              <span v-else>{{ getMediaInitial(row.name) }}</span>
            </div>
            <div class="normal-media-card-info">
              <div class="normal-media-card-heading">
                <span v-if="Number(row.gfrz) === 1" class="normal-media-card-official-tag">官媒</span>
                <a v-if="row.case_url" :href="row.case_url" target="_blank" rel="noopener noreferrer"
                  class="normal-media-card-name is-link">
                  {{ row.name || "未命名媒体" }}
                </a>
                <strong v-else class="normal-media-card-name">{{ row.name || "未命名媒体" }}</strong>
                <span v-if="isSelfMedia" class="normal-media-card-verification"
                  :class="`is-level-${getSelfVerificationLevel(row)}`"
                  :title="getSelfVerificationLabel(row)" :aria-label="getSelfVerificationLabel(row)">
                  <svg viewBox="0 0 1024 1024" aria-hidden="true">
                    <path d="M512.002133 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z" fill="#FFFFFF"></path>
                    <path d="M820.994133 325.461333c0 4.650667 0 4.650667-4.650666 9.301334l-306.133334 463.786666h-153.045333l-51.029333-431.36c0-18.517333-4.650667-27.818667-13.909334-37.12-4.650667-4.608-13.909333-13.866667-27.861333-13.866666l4.693333-18.56h143.786667c13.866667 0 27.776 4.650667 32.426667 9.258666 9.301333 9.301333 13.909333 23.210667 18.56 37.12l27.818666 296.832 157.696-282.88v-18.602666c0-4.608-4.608-13.909333-9.258666-13.909334-4.650667-4.650667-13.909333-4.650667-23.210667-9.258666l4.693333-18.56h166.954667c9.258667 0 18.56 0 23.168 4.650666 4.650667 4.608 9.301333 9.258667 9.301333 13.909334 4.608 4.608 4.608 9.258667 0 9.258666z m-310.784-324.693333C231.938133 0.768 0.002133 228.053333 0.002133 511.018667a508.757333 508.757333 0 0 0 510.208 510.208 508.757333 508.757333 0 0 0 510.208-510.208A508.757333 508.757333 0 0 0 510.210133 0.768z" fill="currentColor"></path>
                  </svg>
                </span>
              </div>
              <div v-if="getTags(row).length" class="normal-media-card-tags">
                <span v-for="tag in getTags(row)" :key="tag.text" class="normal-media-card-tag" :class="tag.type">
                  {{ tag.text }}
                </span>
              </div>
            </div>
          </div>

          <div class="normal-media-card-offer">
            <div class="normal-media-card-offer-value">
              <div class="normal-media-card-price">
                <strong>{{ formatPrice(row.price0) }}</strong>
                <span>元</span>
              </div>
              <small v-if="formatPower(row.price0) !== '-'">约 {{ formatPower(row.price0) }} 算力</small>
            </div>
            <button type="button" class="normal-media-card-action-button" @click="emit('submit', row)">
              <el-icon>
                <Promotion />
              </el-icon>
              投稿
            </button>
            <button
              type="button"
              class="normal-media-card-fav-button"
              :class="{ 'is-favorited': isFavorited(row) }"
              :title="isFavorited(row) ? '取消收藏' : '收藏'"
              :disabled="isFavoritePending(row)"
              @click="emit('favorite', row)"
            >
              <el-icon>
                <StarFilled v-if="isFavorited(row)" />
                <Star v-else />
              </el-icon>
            </button>
          </div>
        </div>

        <div class="normal-media-card-detail">
          <div v-if="isSelfMedia" class="normal-media-card-weights">
            <div class="normal-media-card-weight is-self-metric">
              <span>粉丝量</span>
              <strong>{{ getSelfMetric(row, ["fans", "Fans", "fans_count", "fansCount", "fan_count", "fanCount"]) }}</strong>
            </div>
            <div class="normal-media-card-weight is-self-metric">
              <span>阅读量</span>
              <strong>{{ getSelfMetric(row, ["reading", "Reading", "reading_count", "readingCount", "read_count", "readCount"]) }}</strong>
            </div>
          </div>
          <div v-else class="normal-media-card-weights">
            <div class="normal-media-card-weight">
              <span><f-svg-icon name="baidu" size="13" />PC权重</span>
              <strong>{{ getDisplay(row.pcbr) }}</strong>
            </div>
            <div class="normal-media-card-weight">
              <span><f-svg-icon name="baidu" size="13" />移动权重</span>
              <strong>{{ getDisplay(row.mbr) }}</strong>
            </div>
          </div>
          <div v-if="row.remarks" class="normal-media-card-remark" :title="row.remarks">
            <span>备注[只供参考]：</span>
            <strong>{{ row.remarks }}</strong>
          </div>
          <div v-if="formatReleaseDuration(row.release_rate)" class="normal-media-card-release-rate"
            :class="{ 'is-empty': formatReleaseDuration(row.release_rate) === '暂无' }">
            <svg class="normal-media-card-release-icon" viewBox="0 0 1024 1024" aria-hidden="true">
              <path d="M510.293333 119.466667C750.933333 119.466667 945.493333 314.026667 945.493333 554.666667S750.933333 989.866667 510.293333 989.866667 75.093333 795.306667 75.093333 554.666667 269.653333 119.466667 510.293333 119.466667z m0 95.573333c-187.733333 0-337.92 151.893333-337.92 337.92 0 187.733333 151.893333 337.92 337.92 337.92 187.733333 0 337.92-151.893333 337.92-337.92s-150.186667-337.92-337.92-337.92z m40.96 114.346667c5.12 3.413333 6.826667 8.533333 6.826667 15.36v160.426666h105.813333c6.826667 0 13.653333 3.413333 17.066667 10.24 3.413333 6.826667 1.706667 15.36-1.706667 20.48l-182.613333 238.933334c-5.12 6.826667-13.653333 8.533333-22.186667 6.826666-8.533333-3.413333-13.653333-10.24-13.653333-18.773333v-160.426667h-105.813333c-6.826667 0-13.653333-3.413333-17.066667-10.24-3.413333-6.826667-1.706667-15.36 1.706667-20.48l182.613333-238.933333c8.533333-8.533333 20.48-10.24 29.013333-3.413333zM740.693333 52.906667c17.066667-20.48 47.786667-23.893333 68.266667-5.12l148.48 124.586666c10.24 8.533333 15.36 20.48 17.066667 32.426667 1.706667 11.946667-3.413333 25.6-11.946667 35.84-17.066667 20.48-47.786667 23.893333-68.266667 5.12l-148.48-124.586667c-10.24-8.533333-15.36-20.48-17.066666-32.426666 0-13.653333 3.413333-27.306667 11.946666-35.84z m-523.946666-10.24c22.186667-15.36 51.2-10.24 66.56 11.946666 15.36 20.48 11.946667 51.2-8.533334 66.56l-148.48 124.586667c-10.24 6.826667-23.893333 10.24-35.84 10.24-13.653333-1.706667-23.893333-6.826667-32.426666-17.066667-17.066667-20.48-13.653333-51.2 6.826666-68.266666l148.48-124.586667 3.413334-3.413333z m0 0" fill="currentColor"></path>
            </svg>
            <span>平均出稿速度：</span>
            <strong>{{ formatReleaseDuration(row.release_rate) }}</strong>
          </div>
        </div>
      </article>

      <el-empty v-if="!loading && !rows.length" description="没有找到符合条件的媒体" :image-size="72" />
    </div>

    <div v-if="loadingMore || loadError || (!loading && rows.length && !hasMore)" class="normal-media-load-state">
      <template v-if="loadingMore">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <span>正在加载更多媒体</span>
      </template>
      <el-button v-else-if="loadError" link type="primary" @click="emit('retry-load-more')">加载失败，点击重试</el-button>
      <span v-else>没有更多媒体了</span>
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
  categoryId: { type: Number, default: 1 },
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
const isSelfMedia = computed(() => props.categoryId === 2);

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

function hasValue(value: any) {
  return value !== undefined && value !== null && value !== "";
}

function getDisplay(value: any) {
  return hasValue(value) ? String(value) : "-";
}

function getSelfMetric(row: any, keys: string[]) {
  const value = keys.map((key) => row?.[key]).find(hasValue);
  if (!hasValue(value)) return "-";

  const numericValue = Number(value);
  return Number.isFinite(numericValue)
    ? new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 }).format(numericValue)
    : String(value);
}

function getSelfVerificationLevel(row: any) {
  const level = Number(row?.self_vrz ?? row?.selfVrz);
  return Number.isInteger(level) && level >= 0 && level <= 3 ? level : 0;
}

function getSelfVerificationLabel(row: any) {
  const labels = ["V认证：未认证", "V认证：黄V", "V认证：蓝V", "V认证：红V"];
  return labels[getSelfVerificationLevel(row)];
}

function formatPrice(value: any) {
  const price = Number(value);
  if (!hasValue(value) || Number.isNaN(price)) {
    return "-";
  }
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(price);
}

function formatPower(value: any) {
  const price = Number(value);
  if (!hasValue(value) || Number.isNaN(price)) {
    return "-";
  }
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(price * 100);
}

function getCategoryName(key: string, value: any) {
  const name = props.tagNames?.[key]?.[String(value)] || "";
  return key === "portal_type" && name === "以上都不是" ? "其他" : name;
}

function getTags(row: any) {
  const propertyNames = String(row.property || "")
    .split(",")
    .map((id) => getCategoryName("property", id.trim()))
    .filter(Boolean)
    .join("、");
  const portalName = getCategoryName("portal_type", row.portal_type);

  return [
    ...(isSelfMedia.value ? [
      { label: "平台", value: getCategoryName("platform", row.channel) },
      { label: "行业", value: getCategoryName("industry", row.industry_type) },
    ] : []),
    { label: "频道类型", value: getCategoryName("channel", row.channel) },
    { label: "收录类型", value: getCategoryName("collection_type", row.collection_type) },
    { label: "地区", value: getCategoryName("area", row.area), type: "is-region" },
    { label: "门户", value: portalName === "其他" ? "" : portalName },
    { text: row.n_link ? "可带链接" : "不可带链接", type: row.n_link ? "is-available" : "is-unavailable" },
    { text: row.contact_show ? "可发联系方式" : "不可发联系方式", type: row.contact_show ? "is-available" : "is-unavailable" },
    { label: "特殊类目", value: propertyNames, type: "is-special" },
  ].filter((tag) => tag.text || (hasValue(tag.label) && hasValue(tag.value)))
    .map((tag) => ({
      text: tag.text || `${tag.label}：${tag.value}`,
      type: tag.type || "",
    }));
}

function formatReleaseDuration(value: any) {
  if (!hasValue(value)) {
    return "";
  }

  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes < 0) {
    return "";
  }
  if (minutes === 0) {
    return "暂无";
  }

  let seconds = Math.round(dayjs.duration(minutes, "minute").asSeconds());
  if (seconds <= 0) {
    return "暂无";
  }
  if (seconds < 60) {
    return `${seconds}秒`;
  }
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

function getMediaInitial(name: any) {
  return hasValue(name) ? String(name).trim().slice(0, 1).toUpperCase() : "媒";
}
</script>

<style lang="scss" scoped>
.normal-media-list-panel {
  flex: 1 0 auto;
  padding: 0 12px;
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-bg-color);

  .normal-media-list {
    display: flex;
    min-height: 180px;
    flex-direction: column;
    gap: 0;
    padding: 8px 0;

    .normal-media-card {
      width: 100%;
      border: 0;
      background-color: transparent;
      color: inherit;
      cursor: default;
      text-align: left;
      transition: background-color 0.18s ease;

      & + .normal-media-card {
        border-top: 1px solid rgb(0 0 0 / 3%);
      }

      &:hover {
        .normal-media-card-action-button {
          transform: scale(1.06);
          background: linear-gradient(135deg, #ffad35, #eb7c00);
        }

        .normal-media-card-logo {
          box-shadow: 0 5px 12px rgb(255 157 61 / 24%);
        }
      }

      &.is-self-media {
        &:hover {
          .normal-media-card-head {
            .normal-media-card-main {
              .normal-media-card-logo {
                box-shadow: 0 5px 12px rgb(103 194 58 / 25%);
              }
            }

            .normal-media-card-offer {
              .normal-media-card-action-button {
                background: linear-gradient(135deg, #85cf5a, #4cad2e);
              }
            }
          }
        }

        .normal-media-card-head {
          .normal-media-card-main {
            .normal-media-card-logo {
              background: linear-gradient(135deg, #9cdc78, #67c23a);
              color: #286311;
            }

            .normal-media-card-info {
              .normal-media-card-heading {
                .normal-media-card-name.is-link:hover {
                  color: #4cad2e;
                }
              }
            }
          }

          .normal-media-card-offer {
            .normal-media-card-offer-value {
              .normal-media-card-price {
                strong {
                  color: #4cad2e;
                }
              }
            }

            .normal-media-card-action-button {
              background: linear-gradient(135deg, #85cf5a, #5cbf37);
              box-shadow: 0 3px 8px rgb(103 194 58 / 22%);
            }

            .normal-media-card-fav-button {
              &:hover,
              &.is-favorited {
                background: rgb(103 194 58 / 13%);
                color: #4cad2e;
              }
            }
          }
        }
      }

      .normal-media-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 14px 20px 10px;

        .normal-media-card-main {
          display: flex;
          min-width: 0;
          flex: 1;
          align-items: center;
          gap: 12px;

          .normal-media-card-logo {
            display: flex;
            width: 45px;
            height: 45px;
            flex-shrink: 0;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border-radius: 14px;
            background: linear-gradient(135deg, #ffc774, #fe962e);
            color: #000000e3;
            font-size: 18px;
            font-weight: 700;
            transition: box-shadow 0.18s ease;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          .normal-media-card-info {
            display: flex;
            min-width: 0;
            flex-direction: column;
            gap: 6px;

            .normal-media-card-heading {
              display: flex;
              min-width: 0;
              align-items: center;

              .normal-media-card-official-tag {
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

              .normal-media-card-name {
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
                    color: #d97706;
                  }
                }
              }

              .normal-media-card-verification {
                display: inline-flex;
                width: 17px;
                height: 17px;
                flex-shrink: 0;
                align-items: center;
                justify-content: center;
                margin-left: 5px;
                color: var(--el-text-color-placeholder);

                &.is-level-1 {
                  color: var(--el-color-warning);
                }

                &.is-level-2 {
                  color: var(--el-color-primary);
                }

                &.is-level-3 {
                  color: var(--el-color-danger);
                }

                svg {
                  width: 100%;
                  height: 100%;
                }
              }
            }

            .normal-media-card-tags {
              display: flex;
              flex-wrap: wrap;
              gap: 4px;

              .normal-media-card-tag {
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

                &.is-special {
                  background: var(--el-color-primary-light-9);
                  color: var(--el-color-primary);
                }

                &.is-region {
                  background: var(--el-color-warning-light-9);
                  color: var(--el-color-warning-dark-2);
                }

                &.is-verification {
                  background: var(--el-color-warning-light-9);
                  color: var(--el-color-warning-dark-2);
                }
              }
            }
          }
        }

        .normal-media-card-offer {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          gap: 8px;

          .normal-media-card-offer-value {
            display: flex;
            min-width: 92px;
            flex-direction: column;
            align-items: flex-end;

            .normal-media-card-price {
              display: inline-flex;
              align-items: baseline;
              gap: 3px;

              strong {
                color: #f0820a;
                font-size: 20px;
                line-height: 24px;
              }

              span {
                color: var(--el-text-color-secondary);
                font-size: 12px;
              }
            }

            small {
              margin-top: 1px;
              color: var(--el-text-color-secondary);
              font-size: 10px;
              line-height: 14px;
              white-space: nowrap;
            }
          }

          .normal-media-card-action-button,
          .normal-media-card-fav-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 0;
            cursor: pointer;
            transition: background-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
          }

          .normal-media-card-action-button {
            gap: 5px;
            min-width: 70px;
            height: 32px;
            border-radius: 8px;
            background: linear-gradient(135deg, #ffb84d, #ff9418);
            box-shadow: 0 3px 8px rgb(255 157 61 / 22%);
            color: #fff;
            font-size: 12px;
          }

          .normal-media-card-fav-button {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: var(--el-fill-color-light);
            color: var(--el-text-color-secondary);

            &:hover,
            &.is-favorited {
              background: rgb(255 157 61 / 13%);
              color: #f0820a;
            }

            &:disabled {
              cursor: wait;
              opacity: 0.65;
            }
          }
        }
      }

      .normal-media-card-detail {
        display: flex;
        align-items: center;
        gap: 14px;
        margin: 0 20px;
        padding-bottom: 12px;

        .normal-media-card-weights {
          display: flex;
          min-width: 0;
          gap: 8px;

          .normal-media-card-weight {
            display: inline-flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 6px 11px;
            padding-right: 15px;
            border-radius: 8px;
            background: var(--el-fill-color-lighter);

            span {
              display: inline-flex;
              align-items: center;
              gap: 4px;
              color: var(--el-text-color-secondary);
              font-size: 11px;
              white-space: nowrap;
            }

            strong {
              color: #f0820a;
              font-size: 17px;
              line-height: 20px;
            }

            &.is-self-metric {
              background: #eef9ec;

              span {
                color: #4f8c31;
              }

              strong {
                color: #4cad2e;
              }
            }
          }
        }

        .normal-media-card-remark {
          display: flex;
          min-width: 0;
          flex: 1;
          align-items: center;
          color: var(--el-text-color-secondary);
          font-size: 13px;
          white-space: nowrap;

          span {
            flex-shrink: 0;
          }

          strong {
            min-width: 0;
            overflow: hidden;
            color: var(--el-text-color-primary);
            font-weight: 400;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .normal-media-card-release-rate {
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

          .normal-media-card-release-icon {
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

  .normal-media-load-state {
    display: flex;
    min-height: 34px;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}

@media screen and (max-width: 700px) {
  .normal-media-list-panel {
    padding: 0 8px;

    .normal-media-list {
      .normal-media-card {
        .normal-media-card-head {
          align-items: flex-start;
          padding: 12px 8px 10px;

          .normal-media-card-offer {
            flex-wrap: wrap;
            justify-content: flex-end;

            .normal-media-card-offer-value {
              min-width: auto;
            }
          }
        }

        .normal-media-card-detail {
          flex-direction: column;
          gap: 4px;
          margin: 0 8px;

          .normal-media-card-weights {
            width: 100%;
          }

          .normal-media-card-remark {
            width: 100%;
            padding: 2px 12px 0;
          }

          .normal-media-card-release-rate {
            align-self: flex-end;
            padding: 0 12px;
          }
        }
      }
    }
  }
}
</style>
