<template>
  <section class="short-video-media-list-panel">
    <div v-loading="loading" class="short-video-media-list">
      <article v-for="(row, index) in rows" :key="getRowKey(row, index)" class="short-video-media-card">
        <div class="short-video-media-card-head">
          <div class="short-video-media-card-main">
            <a v-if="getCaseUrl(row)" :href="getCaseUrl(row)" target="_blank" rel="noopener noreferrer"
              class="short-video-media-card-logo is-link" :title="`查看 ${getAccountName(row)} 案例`">
              <img v-if="getLogo(row)" :src="getLogo(row)" :alt="getAccountName(row)" />
              <span v-else>{{ getMediaInitial(getAccountName(row)) }}</span>
            </a>
            <div v-else class="short-video-media-card-logo">
              <img v-if="getLogo(row)" :src="getLogo(row)" :alt="getAccountName(row)" />
              <span v-else>{{ getMediaInitial(getAccountName(row)) }}</span>
            </div>
            <div class="short-video-media-card-info">
              <a v-if="getCaseUrl(row)" :href="getCaseUrl(row)" target="_blank" rel="noopener noreferrer"
                class="short-video-media-card-name is-link" :title="`查看 ${getAccountName(row)} 案例`">
                {{ getAccountName(row) }}
              </a>
              <strong v-else class="short-video-media-card-name" :title="getAccountName(row)">{{ getAccountName(row) }}</strong>
              <span class="short-video-media-card-region">地区：{{ formatDisplay(getRegion(row)) }}</span>
            </div>
          </div>

          <div class="short-video-media-card-actions">
            <div class="short-video-media-card-price">
              <span>报价</span>
              <strong>{{ formatPrice(getPrice(row)) }}<em v-if="hasValue(getPrice(row))">元</em></strong>
              <small v-if="formatPower(getPrice(row)) !== '-'">约 {{ formatPower(getPrice(row)) }} 算力</small>
            </div>
            <button type="button" class="short-video-media-card-action-button" @click="emit('submit', row)">
              <el-icon><Promotion /></el-icon>
              投稿
            </button>
            <button
              type="button"
              class="short-video-media-card-fav-button"
              :class="{ 'is-favorited': isFavorited(row) }"
              :title="getFavoriteTitle(row)"
              :disabled="!hasValue(getProviderMediaId(row)) || isFavoritePending(row)"
              @click="emit('favorite', row)"
            >
              <el-icon><StarFilled v-if="isFavorited(row)" /><Star v-else /></el-icon>
            </button>
          </div>
        </div>

        <div class="short-video-media-card-detail">
          <div class="short-video-media-card-detail-row">
            <div class="short-video-media-card-metrics">
              <div class="short-video-media-card-metric is-fans">
                <span>粉丝数</span>
                <strong>{{ formatCount(getFans(row)) }}</strong>
              </div>
              <div class="short-video-media-card-metric">
                <span>受众性别</span>
                <strong :title="formatDisplay(getAudienceGender(row))">{{ formatDisplay(getAudienceGender(row)) }}</strong>
              </div>
              <div class="short-video-media-card-metric">
                <span>受众地域</span>
                <strong :title="formatAudienceRegion(getAudienceRegion(row))">{{ formatAudienceRegion(getAudienceRegion(row)) }}</strong>
              </div>
              <div class="short-video-media-card-metric is-industry">
                <span>行业分类</span>
                <strong :title="formatIndustry(getIndustry(row))">{{ formatIndustry(getIndustry(row)) }}</strong>
              </div>
            </div>
            <div class="short-video-media-card-platform" :title="formatPlatform(getPlatform(row))">
              <img v-if="isPlatform(row, ['抖音'])" :src="`${publicAssetBaseUrl}images/douyin.svg`" alt="抖音" />
              <img v-else-if="isPlatform(row, ['视频号', '微信视频号'])" :src="`${publicAssetBaseUrl}images/shipinghao.svg`" alt="视频号" />
              <img v-else-if="isPlatform(row, ['快手'])" :src="`${publicAssetBaseUrl}images/kuaishou.svg`" alt="快手" />
              <img v-else-if="isPlatform(row, ['好看视频'])" :src="`${publicAssetBaseUrl}images/haokanship.svg`" alt="好看视频" />
              <img v-else-if="isPlatform(row, ['搜狐视频'])" :src="`${publicAssetBaseUrl}images/souhuship.svg`" alt="搜狐视频" />
              <img v-else-if="isPlatform(row, ['腾讯视频'])" :src="`${publicAssetBaseUrl}images/tenxunship.svg`" alt="腾讯视频" />
              <img v-else-if="isPlatform(row, ['西瓜视频'])" :src="`${publicAssetBaseUrl}images/xiguaship.svg`" alt="西瓜视频" />
              <img v-else-if="isPlatform(row, ['爱奇艺'])" :src="`${publicAssetBaseUrl}images/aqiyi.webp`" alt="爱奇艺" />
              <img v-else-if="isPlatform(row, ['优酷'])" :src="`${publicAssetBaseUrl}images/youku.svg`" alt="优酷" />
              <span>{{ formatPlatform(getPlatform(row)) }}</span>
            </div>
          </div>
          <div v-if="hasValue(getRemarks(row))" class="short-video-media-card-remark" :title="formatDisplay(getRemarks(row))">
            <span>备注：</span>
            <strong>{{ formatDisplay(getRemarks(row)) }}</strong>
          </div>
        </div>
      </article>

      <el-empty v-if="!loading && !rows.length" description="没有找到符合条件的短视频账号" :image-size="72" />
    </div>

    <div v-if="loadingMore || loadError || (!loading && rows.length && !hasMore)" class="short-video-media-load-state">
      <template v-if="loadingMore">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>正在加载更多短视频账号</span>
      </template>
      <el-button v-else-if="loadError" link type="primary" @click="emit('retry-load-more')">加载失败，点击重试</el-button>
      <span v-else>没有更多短视频账号了</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, type PropType } from "vue";

const props = defineProps({
  rows: { type: Array as PropType<any[]>, default: () => [] },
  loading: Boolean,
  loadingMore: Boolean,
  loadError: Boolean,
  hasMore: Boolean,
  platformNames: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  selectedIndustry: { type: String, default: "" },
  favoriteProviderMediaIds: { type: Array as PropType<Array<number | string>>, default: () => [] },
  favoritePendingProviderMediaIds: { type: Array as PropType<Array<number | string>>, default: () => [] },
});

const emit = defineEmits(["submit", "favorite", "retry-load-more"]);

const publicAssetBaseUrl = import.meta.env.BASE_URL;

const favoriteProviderMediaIdSet = computed(() => new Set(props.favoriteProviderMediaIds.map((id) => String(id))));
const favoritePendingProviderMediaIdSet = computed(() => new Set(props.favoritePendingProviderMediaIds.map((id) => String(id))));

function hasValue(value: any) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function getValue(row: any, keys: string[]) {
  return keys.map((key) => row?.[key]).find((value) => hasValue(value));
}

function formatDisplay(value: any): string {
  if (!hasValue(value)) return "-";
  if (Array.isArray(value)) return value.map(formatDisplay).filter((item) => item !== "-").join("、") || "-";
  if (typeof value === "object") {
    const displayValue = getValue(value, ["name", "label", "title", "text", "value"]);
    return hasValue(displayValue) ? formatDisplay(displayValue) : "-";
  }
  return String(value).trim();
}

function getProviderMediaId(row: any) {
  return getValue(row, ["provider_media_id", "providerMediaId", "media_id", "mediaId", "id", "ID"]);
}

function getAccountName(row: any) {
  return formatDisplay(getValue(row, ["account_name", "accountName", "name", "media_name", "mediaName", "nickname", "nick_name", "nickName"]));
}

function getLogo(row: any) {
  return getValue(row, ["logo_url", "logoUrl"]);
}

function getCaseUrl(row: any) {
  return getValue(row, ["case_url", "caseUrl", "avatar_url", "avatarUrl"]);
}

function getRegion(row: any) {
  return getValue(row, ["area", "region", "region_name", "regionName", "province", "city", "location"]);
}

function getFans(row: any) {
  return getValue(row, ["fans", "followers", "followers_count", "followersCount", "fans_count", "fansCount", "fan_count", "fanCount"]);
}

function getPlatform(row: any) {
  return getValue(row, ["platform_name", "platformName", "channel_name", "channelName", "platform", "platform_type", "platformType", "channel"]);
}

function formatPlatform(value: any): string {
  if (!hasValue(value)) return "-";
  if (Array.isArray(value)) return value.map(formatPlatform).filter((item) => item !== "-").join("、") || "-";
  if (typeof value === "object") return formatDisplay(value);

  const platformValue = String(value).trim();
  return props.platformNames[platformValue] || platformValue;
}

function isPlatform(row: any, platformNames: string[]) {
  return platformNames.includes(formatPlatform(getPlatform(row)));
}

function getPrice(row: any) {
  return getValue(row, ["price", "price0", "cooperation_price", "cooperationPrice", "quote", "quotation", "video_price", "videoPrice"]);
}

function getAudienceGender(row: any) {
  return getValue(row, ["audience_gender", "audienceGender", "fans_gender", "fansGender", "gender", "sex"]);
}

function getAudienceRegion(row: any) {
  return getValue(row, ["audience_region", "audienceRegion", "audience_area", "audienceArea", "audience_location", "audienceLocation", "user_region", "userRegion"]);
}

function getIndustry(row: any) {
  return getValue(row, [
    "account_class",
    "accountClass",
    "industry",
    "Industry",
    "industry_name",
    "industryName",
    "industry_type",
    "industryType",
    "industry_type_name",
    "industryTypeName",
    "industry_category",
    "industryCategory",
    "category",
    "Category",
    "category_name",
    "categoryName",
    "classify",
    "Classify",
    "classify_name",
    "classifyName",
    "tags",
    "标签",
    "行业",
    "行业分类",
    "分类",
  ]);
}

function getRemarks(row: any) {
  return getValue(row, ["remarks", "remark", "note", "memo", "comment", "description"]);
}

function formatIndustry(value: any) {
  const industry = formatDisplay(value);
  if (industry === "-") return "无";

  const selectedIndustry = props.selectedIndustry.trim();
  if (!selectedIndustry) return industry;

  const currentIndustry = industry
    .split(/[\/,，|、]/)
    .map((item) => item.trim())
    .find((item) => item === selectedIndustry);
  return currentIndustry || "无";
}

function formatAudienceRegion(value: any) {
  const audienceRegion = formatDisplay(value);
  return audienceRegion === "-" ? "无" : audienceRegion;
}

function getMediaInitial(name: string) {
  return name !== "-" ? name.slice(0, 1).toUpperCase() : "短";
}

function getRowKey(row: any, index: number) {
  return getProviderMediaId(row) ?? `short-video-${index}`;
}

function formatCount(value: any) {
  const count = Number(value);
  if (!hasValue(value) || !Number.isFinite(count)) return formatDisplay(value);
  if (Math.abs(count) >= 100000) {
    return `${new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(count / 10000)}万`;
  }
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 }).format(count);
}

function formatPrice(value: any) {
  const price = Number(value);
  return hasValue(value) && Number.isFinite(price)
    ? new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(price)
    : formatDisplay(value);
}

function formatPower(value: any) {
  const price = Number(value);
  return hasValue(value) && Number.isFinite(price)
    ? new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(price * 100)
    : "-";
}

function isFavorited(row: any) {
  const providerMediaId = getProviderMediaId(row);
  return hasValue(providerMediaId) && favoriteProviderMediaIdSet.value.has(String(providerMediaId));
}

function isFavoritePending(row: any) {
  const providerMediaId = getProviderMediaId(row);
  return hasValue(providerMediaId) && favoritePendingProviderMediaIdSet.value.has(String(providerMediaId));
}

function getFavoriteTitle(row: any) {
  if (!hasValue(getProviderMediaId(row))) return "媒体 ID 缺失，无法收藏";
  return isFavorited(row) ? "取消收藏" : "收藏";
}
</script>

<style lang="scss" scoped>
.short-video-media-list-panel {
  flex: 1 0 auto;
  padding: 0 12px;
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-bg-color);

  .short-video-media-list {
    display: flex;
    min-height: 180px;
    flex-direction: column;
    padding: 8px 0;

    .short-video-media-card {
      width: 100%;
      border: 0;
      background: transparent;
      color: inherit;
      text-align: left;

      & + .short-video-media-card {
        border-top: 1px solid rgb(254 44 85 / 12%);
      }

      &:hover {
        .short-video-media-card-logo {
          box-shadow: 0 5px 12px rgb(254 44 85 / 24%);
        }

        .short-video-media-card-action-button {
          background: #e61e45;
          transform: scale(1.06);
        }
      }

      .short-video-media-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 14px 20px 10px;

        .short-video-media-card-main {
          display: flex;
          min-width: 0;
          flex: 1;
          align-items: center;
          gap: 12px;

          .short-video-media-card-logo {
            display: flex;
            width: 45px;
            height: 45px;
            flex-shrink: 0;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border-radius: 14px;
            background: #fe2c55;
            color: #fff;
            font-size: 18px;
            font-weight: 700;
            transition: box-shadow 0.18s ease;

            &.is-link {
              cursor: pointer;
              text-decoration: none;
            }

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          .short-video-media-card-info {
            display: flex;
            min-width: 0;
            flex-direction: column;
            gap: 5px;

            .short-video-media-card-name {
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
                  color: #fe2c55;
                }
              }
            }

            .short-video-media-card-region {
              overflow: hidden;
              color: var(--el-text-color-secondary);
              font-size: 12px;
              line-height: 18px;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }

        .short-video-media-card-actions {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          gap: 8px;

          .short-video-media-card-price {
            display: flex;
            min-width: 78px;
            flex-direction: column;
            align-items: flex-end;
            color: var(--el-text-color-secondary);
            font-size: 11px;
            line-height: 16px;
            white-space: nowrap;

            strong {
              color: #fe2c55;
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
          }

          .short-video-media-card-action-button,
          .short-video-media-card-fav-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 0;
            cursor: pointer;
            transition: background-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
          }

          .short-video-media-card-action-button {
            gap: 5px;
            min-width: 70px;
            height: 32px;
            border-radius: 8px;
            background: #fe2c55;
            color: #fff;
            font-size: 12px;
          }

          .short-video-media-card-fav-button {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: var(--el-fill-color-light);
            color: var(--el-text-color-secondary);

            &:hover,
            &.is-favorited {
              background: rgb(254 44 85 / 12%);
              color: #fe2c55;
            }

            &:disabled {
              cursor: not-allowed;
              opacity: 0.55;
            }
          }
        }
      }

      .short-video-media-card-detail {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 0 20px;
        padding-bottom: 12px;

        .short-video-media-card-detail-row {
          display: flex;
          min-width: 0;
          align-items: center;
          justify-content: space-between;
          gap: 16px;

          .short-video-media-card-metrics {
            display: flex;
            min-width: 0;
            flex: 1;
            flex-wrap: wrap;
            align-items: center;
            gap: 6px;

          .short-video-media-card-metric {
            display: flex;
            width: 156px;
            min-width: 0;
            flex: 0 0 156px;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 6px 10px;
            border-radius: 8px;
            background: var(--el-fill-color-lighter);

            span {
              flex-shrink: 0;
              color: var(--el-text-color-secondary);
              font-size: 11px;
              white-space: nowrap;
            }

            strong {
              overflow: hidden;
              color: var(--el-text-color-primary);
              font-size: 13px;
              font-weight: 600;
              line-height: 20px;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            &.is-fans {
              background: #fff0f2;

              strong {
                color: #fe2c55;
                font-size: 15px;
              }
            }

            &.is-industry {
              background: #fff6f7;

              span {
                color: #a74959;
              }

              strong {
                color: #d91636;
              }
            }
            }
          }

          .short-video-media-card-platform {
            display: flex;
            width: 156px;
            min-width: 0;
            flex: 0 0 156px;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
            color: var(--el-text-color-primary);
            font-size: 13px;
            font-weight: 600;
            line-height: 28px;

            img {
              width: 28px;
              height: 28px;
              flex: 0 0 28px;
              object-fit: contain;
            }

            span {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }

        .short-video-media-card-remark {
          display: flex;
          min-width: 0;
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
      }
    }
  }

  .short-video-media-load-state {
    display: flex;
    min-height: 34px;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}

@media screen and (max-width: 760px) {
  .short-video-media-list-panel {
    padding: 0 8px;

    .short-video-media-list {
      .short-video-media-card {
        .short-video-media-card-head {
          align-items: flex-start;
          padding: 12px 8px 10px;

          .short-video-media-card-actions {
            width: 110px;
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 4px;

            .short-video-media-card-price {
              width: 100%;
              align-items: flex-end;
            }
          }
        }

        .short-video-media-card-detail {
          margin: 0 8px;

          .short-video-media-card-detail-row {
            flex-direction: column;
            align-items: stretch;
            gap: 6px;

            .short-video-media-card-metrics {
              flex: none;
            }

            .short-video-media-card-platform {
              align-self: flex-end;
            }
          }
        }
      }
    }
  }
}
</style>
