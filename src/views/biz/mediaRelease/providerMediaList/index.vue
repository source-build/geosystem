<template>
  <div class="provider-media-list vertical-layout" ref="scrollRef" @scroll.passive="handlePageScroll">
    <section class="media-filter-panel">
      <div class="media-type-tabs">
        <span class="media-type-tabs-label">媒体类型</span>
        <div class="media-type-tab-list">
          <button v-for="item in mediaTypeOptions" :key="item.key" type="button" class="media-type-tab"
            :class="{ 'is-active': selectedMediaType === item.key }" @click="handleMediaTypeChange(item.key)">
            <span class="media-type-dot" :class="`is-${item.key}`"></span>
            {{ item.label }}
          </button>
        </div>
      </div>

      <div class="media-filter-header">
        <div class="media-filter-heading">
          <span class="media-filter-icon">
            <el-icon>
              <HelpFilled />
            </el-icon>
          </span>
          <h3 class="media-filter-title">媒体筛选</h3>
        </div>
        <form class="media-search" @submit.prevent="handleMediaSearch">
          <span class="media-search-label">{{ mediaSearchLabel }}</span>
          <el-input v-model="mediaSearchInput" size="small" :placeholder="mediaSearchPlaceholder"
            :aria-label="mediaSearchLabel" clearable @clear="handleMediaSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </form>
        <form v-if="isLocalMedia || isXiaohongshu || isShortVideo" class="media-search media-remarks-search" @submit.prevent="handleMediaSearch">
          <span class="media-search-label">备注</span>
          <el-input v-model="remarksSearchInput" size="small" placeholder="输入备注关键词后按 Enter 搜索" aria-label="备注" clearable
            @clear="handleMediaSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </form>
        <div class="media-filter-spacer"></div>
        <div class="media-filter-actions">
          <span class="media-list-total">
            <template v-if="mediaLoading">正在查询媒体</template>
            <template v-else>共 <strong>{{ mediaTotal }}</strong> 个媒体</template>
          </span>
          <el-button icon="RefreshRight" link @click="handleMediaRefresh" style="font-size: 12px;">刷新列表</el-button>
          <el-button icon="Refresh" link @click="handleMediaReset" style="font-size: 12px;">清空筛选</el-button>
        </div>
      </div>

      <div v-loading="filterLoading" class="media-options">
          <template v-if="selectedMediaType === 'news'">
            <template v-for="row in normalFilterRows" :key="row.key">
              <div v-if="row.key !== 'contactShow'" class="media-option-row">
                <span class="media-option-label">{{ row.label }}</span>
                <div class="media-option-values">
                  <button type="button" class="media-option-chip"
                    :class="{ 'is-active': row.key === 'price' ? !hasNormalFilterSelection(row.key) && !hasCustomPrice : !hasNormalFilterSelection(row.key) }"
                    @click="handleNormalFilterSelect(row.key, undefined)">
                    不限
                  </button>
                  <button v-for="option in row.options" :key="getOptionId(option)" type="button"
                    class="media-option-chip" :class="{ 'is-active': normalFilterSelection[row.key] === getOptionId(option) }"
                    @click="handleNormalFilterSelect(row.key, getOptionId(option))">
                    {{ getOptionName(option) }}
                  </button>
                  <template v-if="row.key === 'nLink'">
                    <span class="media-option-sub-label">联系方式</span>
                    <button type="button" class="media-option-chip" :class="{ 'is-active': !hasNormalFilterSelection('contactShow') }"
                      @click="handleNormalFilterSelect('contactShow', undefined)">
                      不限
                    </button>
                    <button v-for="option in getNormalFilterOptions('contactShow')" :key="getOptionId(option)" type="button"
                      class="media-option-chip" :class="{ 'is-active': normalFilterSelection.contactShow === getOptionId(option) }"
                      @click="handleNormalFilterSelect('contactShow', getOptionId(option))">
                      {{ getOptionName(option) }}
                    </button>
                  </template>
                  <div v-if="row.key === 'price'" class="media-custom-price">
                    <el-input-number v-model="customPriceMin" :min="0" :precision="2" :controls="false" size="small"
                      placeholder="最低价" aria-label="自定义最低价" />
                    <span class="media-custom-price-separator">-</span>
                    <el-input-number v-model="customPriceMax" :min="0" :precision="2" :controls="false" size="small"
                      placeholder="最高价" aria-label="自定义最高价" />
                    <span class="media-custom-price-unit">元</span>
                    <button type="button" class="media-custom-price-confirm" :class="{ 'is-active': hasCustomPrice }"
                      :disabled="!hasCustomPriceDraft" @click="handleCustomPriceChange">确认</button>
                  </div>
                </div>
              </div>

              <div v-if="row.key === 'price' && showPropertyOptions" class="media-option-row">
                <span class="media-option-label">特殊类目</span>
                <div class="media-option-values">
                  <button type="button" class="media-option-chip" :class="{ 'is-active': !selectedPropertyId }"
                    @click="handleNormalPropertySelect(undefined)">
                    不限
                  </button>
                  <button v-for="option in visiblePropertyOptions" :key="getOptionId(option)" type="button"
                    class="media-option-chip" :class="{ 'is-active': selectedPropertyId === getOptionId(option) }"
                    @click="handleNormalPropertySelect(getOptionId(option))">
                    {{ getOptionName(option) }}
                  </button>
                </div>
              </div>
            </template>
            <div class="media-option-row">
              <span class="media-option-label">排序</span>
              <div class="media-option-values media-sort-options">
                <button type="button" class="media-option-chip" :class="{ 'is-active': !hasNormalSortSelection }"
                  @click="handleNormalSortReset">
                  默认
                </button>
                <button v-for="option in normalSortOptions" :key="option.key" type="button" class="media-sort-option"
                  :class="{ 'is-active': normalSortSelection[option.key] }"
                  :title="getNormalSortTitle(option.key, option.label)"
                  :aria-pressed="Boolean(normalSortSelection[option.key])"
                  @click="handleNormalSortLabelClick(option.key)">
                  <span>{{ option.label }}</span>
                  <span class="media-sort-triangles" aria-hidden="true">
                    <el-icon :class="{ 'is-active': normalSortSelection[option.key] === 'asc' }"><CaretTop /></el-icon>
                    <el-icon :class="{ 'is-active': normalSortSelection[option.key] === 'desc' }"><CaretBottom /></el-icon>
                  </span>
                </button>
              </div>
            </div>

            <div class="media-option-row favorite-group-filter-row">
              <span class="media-option-label">收藏分组</span>
              <div v-loading="favoriteGroupsLoading" class="media-option-values">
                <button type="button" class="media-option-chip" :class="{ 'is-active': favoriteGroupFilter === undefined }"
                  @click="handleFavoriteGroupFilterSelect(undefined)">
                  不限
                </button>
                <button type="button" class="media-option-chip" :class="{ 'is-active': favoriteGroupFilter === 'all' }"
                  @click="handleFavoriteGroupFilterSelect('all')">
                  全部收藏
                </button>
                <button v-for="group in favoriteGroups" :key="group.id" type="button" class="media-option-chip"
                  :class="{ 'is-active': String(favoriteGroupFilter) === String(group.id) }"
                  @click="handleFavoriteGroupFilterSelect(group.id)">
                  {{ group.name }}
                </button>
              </div>
            </div>
          </template>

          <template v-if="selectedMediaType === 'self'">
            <template v-for="row in selfMediaFilterRows" :key="row.key">
              <div v-if="row.key !== 'contactShow'" class="media-option-row">
                <span class="media-option-label">{{ row.label }}</span>
                <div class="media-option-values">
                  <button type="button" class="media-option-chip"
                    :class="{ 'is-active': row.key === 'price' ? !hasSelfFilterSelection(row.key) && !hasSelfCustomPrice : !hasSelfFilterSelection(row.key) }"
                    @click="handleSelfMediaFilterSelect(row.key, undefined)">
                    不限
                  </button>
                  <button v-for="option in row.options" :key="getOptionId(option)" type="button"
                    class="media-option-chip" :class="{ 'is-active': selfMediaFilterSelection[row.key] === getOptionId(option) }"
                    @click="handleSelfMediaFilterSelect(row.key, getOptionId(option))">
                    <svg v-if="row.key === 'certification'" class="media-verification-option-icon"
                      :class="`is-${getOptionId(option)}`" viewBox="0 0 1024 1024" aria-hidden="true">
                      <path d="M512.002133 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z" fill="#FFFFFF"></path>
                      <path d="M820.994133 325.461333c0 4.650667 0 4.650667-4.650666 9.301334l-306.133334 463.786666h-153.045333l-51.029333-431.36c0-18.517333-4.650667-27.818667-13.909334-37.12-4.650667-4.608-13.909333-13.866667-27.861333-13.866666l4.693333-18.56h143.786667c13.866667 0 27.776 4.650667 32.426667 9.258666 9.301333 9.301333 13.909333 23.210667 18.56 37.12l27.818666 296.832 157.696-282.88v-18.602666c0-4.608-4.608-13.909333-9.258666-13.909334-4.650667-4.650667-13.909333-4.650667-23.210667-9.258666l4.693333-18.56h166.954667c9.258667 0 18.56 0 23.168 4.650666 4.650667 4.608 9.301333 9.258667 9.301333 13.909334 4.608 4.608 4.608 9.258667 0 9.258666z m-310.784-324.693333C231.938133 0.768 0.002133 228.053333 0.002133 511.018667a508.757333 508.757333 0 0 0 510.208 510.208 508.757333 508.757333 0 0 0 510.208-510.208A508.757333 508.757333 0 0 0 510.210133 0.768z" fill="currentColor"></path>
                    </svg>
                    {{ getOptionName(option) }}
                  </button>
                  <template v-if="row.key === 'nLink'">
                    <span class="media-option-sub-label">联系方式</span>
                    <button type="button" class="media-option-chip" :class="{ 'is-active': !hasSelfFilterSelection('contactShow') }"
                      @click="handleSelfMediaFilterSelect('contactShow', undefined)">
                      不限
                    </button>
                    <button v-for="option in getSelfFilterOptions('contactShow')" :key="getOptionId(option)" type="button"
                      class="media-option-chip" :class="{ 'is-active': selfMediaFilterSelection.contactShow === getOptionId(option) }"
                      @click="handleSelfMediaFilterSelect('contactShow', getOptionId(option))">
                      {{ getOptionName(option) }}
                    </button>
                  </template>
                  <div v-if="row.key === 'price'" class="media-custom-price">
                    <el-input-number v-model="selfCustomPriceMin" :min="0" :precision="2" :controls="false" size="small"
                      placeholder="最低价" aria-label="自定义最低价" />
                    <span class="media-custom-price-separator">-</span>
                    <el-input-number v-model="selfCustomPriceMax" :min="0" :precision="2" :controls="false" size="small"
                      placeholder="最高价" aria-label="自定义最高价" />
                    <span class="media-custom-price-unit">元</span>
                    <button type="button" class="media-custom-price-confirm" :class="{ 'is-active': hasSelfCustomPrice }"
                      :disabled="!hasSelfCustomPriceDraft" @click="handleSelfCustomPriceChange">确认</button>
                  </div>
                </div>
              </div>
            </template>
            <div v-if="showPropertyOptions" class="media-option-row">
              <span class="media-option-label">特殊类目</span>
              <div class="media-option-values">
                <button type="button" class="media-option-chip" :class="{ 'is-active': !selectedPropertyId }"
                  @click="handleSelfPropertySelect(undefined)">
                  不限
                </button>
                <button v-for="option in visiblePropertyOptions" :key="getOptionId(option)" type="button"
                  class="media-option-chip" :class="{ 'is-active': selectedPropertyId === getOptionId(option) }"
                  @click="handleSelfPropertySelect(getOptionId(option))">
                  {{ getOptionName(option) }}
                </button>
              </div>
            </div>
            <div class="media-option-row">
              <span class="media-option-label">排序</span>
              <div class="media-option-values media-sort-options">
                <button type="button" class="media-option-chip" :class="{ 'is-active': !selfPriceSortOrder }"
                  @click="handleSelfPriceSortReset">
                  默认
                </button>
                <button type="button" class="media-sort-option" :class="{ 'is-active': selfPriceSortOrder }"
                  :title="getSelfPriceSortTitle" :aria-pressed="Boolean(selfPriceSortOrder)" @click="handleSelfPriceSortClick">
                  <span>价格</span>
                  <span class="media-sort-triangles" aria-hidden="true">
                    <el-icon :class="{ 'is-active': selfPriceSortOrder === 'asc' }"><CaretTop /></el-icon>
                    <el-icon :class="{ 'is-active': selfPriceSortOrder === 'desc' }"><CaretBottom /></el-icon>
                  </span>
                </button>
              </div>
            </div>
            <div class="media-option-row favorite-group-filter-row">
              <span class="media-option-label">收藏分组</span>
              <div v-loading="favoriteGroupsLoading" class="media-option-values">
                <button type="button" class="media-option-chip" :class="{ 'is-active': favoriteGroupFilter === undefined }"
                  @click="handleFavoriteGroupFilterSelect(undefined)">
                  不限
                </button>
                <button type="button" class="media-option-chip" :class="{ 'is-active': favoriteGroupFilter === 'all' }"
                  @click="handleFavoriteGroupFilterSelect('all')">
                  全部收藏
                </button>
                <button v-for="group in favoriteGroups" :key="group.id" type="button" class="media-option-chip"
                  :class="{ 'is-active': String(favoriteGroupFilter) === String(group.id) }"
                  @click="handleFavoriteGroupFilterSelect(group.id)">
                  {{ group.name }}
                </button>
              </div>
            </div>
          </template>

          <template v-if="selectedMediaType === 'wechat'">
            <template v-for="row in wechatMediaFilterRows" :key="row.key">
              <div v-if="row.key !== 'contactShow'" class="media-option-row">
                <el-select
                  v-if="row.key === 'headlinePrice'"
                  :model-value="wechatPriceField"
                  class="media-price-field-select"
                  size="small"
                  @change="handleWechatPriceFieldSelect"
                >
                  <el-option
                    v-for="option in wechatPriceFieldOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
                <span v-else class="media-option-label">{{ row.label }}</span>
                <div class="media-option-values">
                  <button type="button" class="media-option-chip" :class="{ 'is-active': !hasWechatMediaFilterSelection(row.key) }"
                    @click="handleWechatMediaFilterSelect(row.key, undefined)">
                    不限
                  </button>
                  <button v-for="option in row.options" :key="getOptionId(option)" type="button"
                    class="media-option-chip" :class="{ 'is-active': wechatMediaFilterSelection[row.key] === getOptionId(option) }"
                    @click="handleWechatMediaFilterSelect(row.key, getOptionId(option))">
                    {{ getOptionName(option) }}
                  </button>
                  <template v-if="row.key === 'nLink'">
                    <span class="media-option-sub-label">联系方式</span>
                    <button type="button" class="media-option-chip" :class="{ 'is-active': !hasWechatMediaFilterSelection('contactShow') }"
                      @click="handleWechatMediaFilterSelect('contactShow', undefined)">
                      不限
                    </button>
                    <button v-for="option in getWechatMediaFilterOptions('contactShow')" :key="getOptionId(option)" type="button"
                      class="media-option-chip" :class="{ 'is-active': wechatMediaFilterSelection.contactShow === getOptionId(option) }"
                      @click="handleWechatMediaFilterSelect('contactShow', getOptionId(option))">
                      {{ getOptionName(option) }}
                    </button>
                  </template>
                </div>
              </div>

              <div v-if="row.key === 'headlinePrice' && showPropertyOptions" class="media-option-row">
                <span class="media-option-label">特殊类目</span>
                <div class="media-option-values">
                  <button type="button" class="media-option-chip" :class="{ 'is-active': !selectedPropertyId }"
                    @click="handleWechatPropertySelect(undefined)">
                    不限
                  </button>
                  <button v-for="option in visiblePropertyOptions" :key="getOptionId(option)" type="button"
                    class="media-option-chip" :class="{ 'is-active': selectedPropertyId === getOptionId(option) }"
                    @click="handleWechatPropertySelect(getOptionId(option))">
                    {{ getOptionName(option) }}
                  </button>
                </div>
              </div>
            </template>
            <div class="media-option-row">
              <span class="media-option-label">排序</span>
              <div class="media-option-values media-sort-options">
                <button type="button" class="media-option-chip" :class="{ 'is-active': !wechatPriceSortOrder }"
                  @click="handleWechatPriceSortReset">
                  默认
                </button>
                <button type="button" class="media-sort-option" :class="{ 'is-active': wechatPriceSortOrder }"
                  :title="getWechatPriceSortTitle" :aria-pressed="Boolean(wechatPriceSortOrder)" @click="handleWechatPriceSortClick">
                  <span>价格</span>
                  <span class="media-sort-triangles" aria-hidden="true">
                    <el-icon :class="{ 'is-active': wechatPriceSortOrder === 'asc' }"><CaretTop /></el-icon>
                    <el-icon :class="{ 'is-active': wechatPriceSortOrder === 'desc' }"><CaretBottom /></el-icon>
                  </span>
                </button>
              </div>
            </div>
            <div class="media-option-row favorite-group-filter-row">
              <span class="media-option-label">收藏分组</span>
              <div v-loading="favoriteGroupsLoading" class="media-option-values">
                <button type="button" class="media-option-chip" :class="{ 'is-active': favoriteGroupFilter === undefined }"
                  @click="handleFavoriteGroupFilterSelect(undefined)">
                  不限
                </button>
                <button type="button" class="media-option-chip" :class="{ 'is-active': favoriteGroupFilter === 'all' }"
                  @click="handleFavoriteGroupFilterSelect('all')">
                  全部收藏
                </button>
                <button v-for="group in favoriteGroups" :key="group.id" type="button" class="media-option-chip"
                  :class="{ 'is-active': String(favoriteGroupFilter) === String(group.id) }"
                  @click="handleFavoriteGroupFilterSelect(group.id)">
                  {{ group.name }}
                </button>
              </div>
            </div>
          </template>

          <template v-if="selectedMediaType === 'weibo'">
            <template v-for="row in weiboMediaFilterRows" :key="row.key">
              <div v-if="row.key !== 'contactShow'" class="media-option-row">
                <el-select
                  v-if="row.key === 'price'"
                  :model-value="weiboPriceField"
                  class="media-price-field-select"
                  size="small"
                  @change="handleWeiboPriceFieldSelect"
                >
                  <el-option
                    v-for="option in weiboPriceFieldOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
                <span v-else class="media-option-label">{{ row.label }}</span>
                <div class="media-option-values">
                  <button type="button" class="media-option-chip" :class="{ 'is-active': !hasWeiboMediaFilterSelection(row.key) }"
                    @click="handleWeiboMediaFilterSelect(row.key, undefined)">
                    不限
                  </button>
                  <button v-for="option in row.options" :key="getOptionId(option)" type="button"
                    class="media-option-chip" :class="{ 'is-active': weiboMediaFilterSelection[row.key] === getOptionId(option) }"
                    @click="handleWeiboMediaFilterSelect(row.key, getOptionId(option))">
                    <svg v-if="row.key === 'certification'" class="media-verification-option-icon"
                      :class="`is-${getOptionId(option)}`" viewBox="0 0 1024 1024" aria-hidden="true">
                      <path d="M512.002133 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z" fill="#FFFFFF"></path>
                      <path d="M820.994133 325.461333c0 4.650667 0 4.650667-4.650666 9.301334l-306.133334 463.786666h-153.045333l-51.029333-431.36c0-18.517333-4.650667-27.818667-13.909334-37.12-4.650667-4.608-13.909333-13.866667-27.861333-13.866666l4.693333-18.56h143.786667c13.866667 0 27.776 4.650667 32.426667 9.258666 9.301333 9.301333 13.909333 23.210667 18.56 37.12l27.818666 296.832 157.696-282.88v-18.602666c0-4.608-4.608-13.909333-9.258666-13.909334-4.650667-4.650667-13.909333-4.650667-23.210667-9.258666l4.693333-18.56h166.954667c9.258667 0 18.56 0 23.168 4.650666 4.650667 4.608 9.301333 9.258667 9.301333 13.909334 4.608 4.608 4.608 9.258667 0 9.258666z m-310.784-324.693333C231.938133 0.768 0.002133 228.053333 0.002133 511.018667a508.757333 508.757333 0 0 0 510.208 510.208 508.757333 508.757333 0 0 0 510.208-510.208A508.757333 508.757333 0 0 0 510.210133 0.768z" fill="currentColor"></path>
                    </svg>
                    {{ getOptionName(option) }}
                  </button>
                  <template v-if="row.key === 'nLink'">
                    <span class="media-option-sub-label">联系方式</span>
                    <button type="button" class="media-option-chip" :class="{ 'is-active': !hasWeiboMediaFilterSelection('contactShow') }"
                      @click="handleWeiboMediaFilterSelect('contactShow', undefined)">
                      不限
                    </button>
                    <button v-for="option in getWeiboMediaFilterOptions('contactShow')" :key="getOptionId(option)" type="button"
                      class="media-option-chip" :class="{ 'is-active': weiboMediaFilterSelection.contactShow === getOptionId(option) }"
                      @click="handleWeiboMediaFilterSelect('contactShow', getOptionId(option))">
                      {{ getOptionName(option) }}
                    </button>
                  </template>
                </div>
              </div>

              <div v-if="row.key === 'price' && showPropertyOptions" class="media-option-row">
                <span class="media-option-label">特殊类目</span>
                <div class="media-option-values">
                  <button type="button" class="media-option-chip" :class="{ 'is-active': !selectedPropertyId }"
                    @click="handleWeiboPropertySelect(undefined)">
                    不限
                  </button>
                  <button v-for="option in visiblePropertyOptions" :key="getOptionId(option)" type="button"
                    class="media-option-chip" :class="{ 'is-active': selectedPropertyId === getOptionId(option) }"
                    @click="handleWeiboPropertySelect(getOptionId(option))">
                    {{ getOptionName(option) }}
                  </button>
                </div>
              </div>
            </template>
            <div class="media-option-row">
              <span class="media-option-label">排序</span>
              <div class="media-option-values media-sort-options">
                <button type="button" class="media-option-chip" :class="{ 'is-active': !weiboPriceSortOrder }"
                  @click="handleWeiboPriceSortReset">
                  默认
                </button>
                <button type="button" class="media-sort-option" :class="{ 'is-active': weiboPriceSortOrder }"
                  :title="getWeiboPriceSortTitle" :aria-pressed="Boolean(weiboPriceSortOrder)" @click="handleWeiboPriceSortClick">
                  <span>价格</span>
                  <span class="media-sort-triangles" aria-hidden="true">
                    <el-icon :class="{ 'is-active': weiboPriceSortOrder === 'asc' }"><CaretTop /></el-icon>
                    <el-icon :class="{ 'is-active': weiboPriceSortOrder === 'desc' }"><CaretBottom /></el-icon>
                  </span>
                </button>
              </div>
            </div>
            <div class="media-option-row favorite-group-filter-row">
              <span class="media-option-label">收藏分组</span>
              <div v-loading="favoriteGroupsLoading" class="media-option-values">
                <button type="button" class="media-option-chip" :class="{ 'is-active': favoriteGroupFilter === undefined }"
                  @click="handleFavoriteGroupFilterSelect(undefined)">
                  不限
                </button>
                <button type="button" class="media-option-chip" :class="{ 'is-active': favoriteGroupFilter === 'all' }"
                  @click="handleFavoriteGroupFilterSelect('all')">
                  全部收藏
                </button>
                <button v-for="group in favoriteGroups" :key="group.id" type="button" class="media-option-chip"
                  :class="{ 'is-active': String(favoriteGroupFilter) === String(group.id) }"
                  @click="handleFavoriteGroupFilterSelect(group.id)">
                  {{ group.name }}
                </button>
              </div>
            </div>
          </template>

          <template v-if="selectedMediaType === 'xiaohongshu'">
            <div class="media-option-row">
              <span class="media-option-label">行业分类</span>
              <div class="media-option-values">
                <button type="button" class="media-option-chip" :class="{ 'is-active': !xiaohongshuIndustryType }"
                  @click="handleXiaohongshuIndustrySelect(undefined)">
                  不限
                </button>
                <button v-for="option in xiaohongshuIndustryOptions" :key="getOptionId(option)" type="button"
                  class="media-option-chip" :class="{ 'is-active': xiaohongshuIndustryType === getOptionId(option) }"
                  @click="handleXiaohongshuIndustrySelect(getOptionId(option))">
                  {{ getOptionName(option) }}
                </button>
              </div>
            </div>

            <template v-for="row in xiaohongshuFilterRows" :key="row.key">
              <div class="media-option-row">
                <el-select v-if="row.key === 'price'" :model-value="xiaohongshuPriceType"
                  class="media-price-field-select xiaohongshu-price-field-select" size="small"
                  @change="handleXiaohongshuPriceTypeSelect">
                  <el-option v-for="option in xiaohongshuPriceTypeOptions" :key="option.value" :label="option.label"
                    :value="option.value" />
                </el-select>
                <span v-else class="media-option-label">{{ row.label }}</span>
                <div class="media-option-values">
                  <button type="button" class="media-option-chip"
                    :class="{ 'is-active': row.key === 'fans' ? !hasXiaohongshuFilterSelection(row.key) && !hasXiaohongshuCustomFans : row.key === 'price' ? !hasXiaohongshuFilterSelection(row.key) && !hasXiaohongshuCustomPrice : !hasXiaohongshuFilterSelection(row.key) }"
                    @click="handleXiaohongshuFilterSelect(row.key, undefined)">
                    不限
                  </button>
                  <button v-for="option in row.options" :key="getOptionId(option)" type="button" class="media-option-chip"
                    :class="{ 'is-active': xiaohongshuFilterSelection[row.key] === getOptionId(option) }"
                    @click="handleXiaohongshuFilterSelect(row.key, getOptionId(option))">
                    {{ getOptionName(option) }}
                  </button>
                  <div v-if="row.key === 'fans'" class="media-custom-price">
                    <el-input-number v-model="xiaohongshuCustomFansMin" :min="0" :precision="0" :controls="false" size="small"
                      placeholder="最低粉丝数" aria-label="最低粉丝数" />
                    <span class="media-custom-price-separator">-</span>
                    <el-input-number v-model="xiaohongshuCustomFansMax" :min="0" :precision="0" :controls="false" size="small"
                      placeholder="最高粉丝数" aria-label="最高粉丝数" />
                    <span class="media-custom-price-unit">粉丝</span>
                    <button type="button" class="media-custom-price-confirm" :class="{ 'is-active': hasXiaohongshuCustomFans }"
                      :disabled="!hasXiaohongshuCustomFansDraft" @click="handleXiaohongshuCustomFansChange">确认</button>
                  </div>
                  <div v-else-if="row.key === 'price'" class="media-custom-price">
                    <el-input-number v-model="xiaohongshuCustomPriceMin" :min="0" :precision="2" :controls="false" size="small"
                      placeholder="最低价" aria-label="小红书自定义最低价" />
                    <span class="media-custom-price-separator">-</span>
                    <el-input-number v-model="xiaohongshuCustomPriceMax" :min="0" :precision="2" :controls="false" size="small"
                      placeholder="最高价" aria-label="小红书自定义最高价" />
                    <span class="media-custom-price-unit">元</span>
                    <button type="button" class="media-custom-price-confirm" :class="{ 'is-active': hasXiaohongshuCustomPrice }"
                      :disabled="!hasXiaohongshuCustomPriceDraft" @click="handleXiaohongshuCustomPriceChange">确认</button>
                  </div>
                </div>
              </div>
            </template>

            <div class="media-option-row">
              <span class="media-option-label">排序</span>
              <div class="media-option-values media-sort-options">
                <button type="button" class="media-option-chip" :class="{ 'is-active': !xiaohongshuPriceSortOrder }"
                  @click="handleXiaohongshuPriceSortReset">
                  默认
                </button>
                <button type="button" class="media-sort-option" :class="{ 'is-active': xiaohongshuPriceSortOrder }"
                  :title="getXiaohongshuPriceSortTitle" :aria-pressed="Boolean(xiaohongshuPriceSortOrder)"
                  @click="handleXiaohongshuPriceSortClick">
                  <span>价格</span>
                  <span class="media-sort-triangles" aria-hidden="true">
                    <el-icon :class="{ 'is-active': xiaohongshuPriceSortOrder === 'asc' }"><CaretTop /></el-icon>
                    <el-icon :class="{ 'is-active': xiaohongshuPriceSortOrder === 'desc' }"><CaretBottom /></el-icon>
                  </span>
                </button>
              </div>
            </div>

            <div class="media-option-row favorite-group-filter-row">
              <span class="media-option-label">收藏分组</span>
              <div v-loading="favoriteGroupsLoading" class="media-option-values">
                <button type="button" class="media-option-chip" :class="{ 'is-active': favoriteGroupFilter === undefined }"
                  @click="handleFavoriteGroupFilterSelect(undefined)">
                  不限
                </button>
                <button type="button" class="media-option-chip" :class="{ 'is-active': favoriteGroupFilter === 'all' }"
                  @click="handleFavoriteGroupFilterSelect('all')">
                  全部收藏
                </button>
                <button v-for="group in favoriteGroups" :key="group.id" type="button" class="media-option-chip"
                  :class="{ 'is-active': String(favoriteGroupFilter) === String(group.id) }"
                  @click="handleFavoriteGroupFilterSelect(group.id)">
                  {{ group.name }}
                </button>
              </div>
            </div>
          </template>

          <template v-if="isShortVideo">
            <template v-for="row in shortVideoFilterRows" :key="row.key">
              <div class="media-option-row">
                <span class="media-option-label">{{ row.label }}</span>
                <div class="media-option-values">
                  <button type="button" class="media-option-chip"
                    :class="{ 'is-active': row.key === 'fans' ? !hasShortVideoFilterSelection(row.key) && !hasShortVideoCustomFans : row.key === 'price' ? !hasShortVideoFilterSelection(row.key) && !hasShortVideoCustomPrice : !hasShortVideoFilterSelection(row.key) }"
                    @click="handleShortVideoFilterSelect(row.key, undefined)">
                    不限
                  </button>
                  <template v-if="row.key === 'gender'">
                    <span class="media-option-sub-label">性别</span>
                  </template>
                  <button v-for="option in row.options" :key="getOptionId(option)" type="button" class="media-option-chip"
                    :class="{ 'is-active': shortVideoFilterSelection[row.key] === getOptionId(option) }"
                    @click="handleShortVideoFilterSelect(row.key, getOptionId(option))">
                    {{ getOptionName(option) }}
                  </button>
                  <div v-if="row.key === 'fans'" class="media-custom-price">
                    <el-input-number v-model="shortVideoCustomFansMin" :min="0" :precision="0" :controls="false" size="small"
                      placeholder="最低粉丝数" aria-label="短视频最低粉丝数" />
                    <span class="media-custom-price-separator">-</span>
                    <el-input-number v-model="shortVideoCustomFansMax" :min="0" :precision="0" :controls="false" size="small"
                      placeholder="最高粉丝数" aria-label="短视频最高粉丝数" />
                    <span class="media-custom-price-unit">粉丝</span>
                    <button type="button" class="media-custom-price-confirm" :class="{ 'is-active': hasShortVideoCustomFans }"
                      :disabled="!hasShortVideoCustomFansDraft" @click="handleShortVideoCustomFansChange">确认</button>
                  </div>
                  <div v-else-if="row.key === 'price'" class="media-custom-price">
                    <el-input-number v-model="shortVideoCustomPriceMin" :min="0" :precision="2" :controls="false" size="small"
                      placeholder="最低价" aria-label="短视频自定义最低价" />
                    <span class="media-custom-price-separator">-</span>
                    <el-input-number v-model="shortVideoCustomPriceMax" :min="0" :precision="2" :controls="false" size="small"
                      placeholder="最高价" aria-label="短视频自定义最高价" />
                    <span class="media-custom-price-unit">元</span>
                    <button type="button" class="media-custom-price-confirm" :class="{ 'is-active': hasShortVideoCustomPrice }"
                      :disabled="!hasShortVideoCustomPriceDraft" @click="handleShortVideoCustomPriceChange">确认</button>
                  </div>
                </div>
              </div>
            </template>

            <div class="media-option-row">
              <span class="media-option-label">排序</span>
              <div class="media-option-values media-sort-options">
                <button type="button" class="media-option-chip" :class="{ 'is-active': !shortVideoPriceSortOrder }"
                  @click="handleShortVideoPriceSortReset">
                  默认
                </button>
                <button type="button" class="media-sort-option" :class="{ 'is-active': shortVideoPriceSortOrder }"
                  :title="getShortVideoPriceSortTitle" :aria-pressed="Boolean(shortVideoPriceSortOrder)"
                  @click="handleShortVideoPriceSortClick">
                  <span>价格</span>
                  <span class="media-sort-triangles" aria-hidden="true">
                    <el-icon :class="{ 'is-active': shortVideoPriceSortOrder === 'asc' }"><CaretTop /></el-icon>
                    <el-icon :class="{ 'is-active': shortVideoPriceSortOrder === 'desc' }"><CaretBottom /></el-icon>
                  </span>
                </button>
              </div>
            </div>

            <div class="media-option-row favorite-group-filter-row">
              <span class="media-option-label">收藏分组</span>
              <div v-loading="favoriteGroupsLoading" class="media-option-values">
                <button type="button" class="media-option-chip" :class="{ 'is-active': favoriteGroupFilter === undefined }"
                  @click="handleFavoriteGroupFilterSelect(undefined)">
                  不限
                </button>
                <button type="button" class="media-option-chip" :class="{ 'is-active': favoriteGroupFilter === 'all' }"
                  @click="handleFavoriteGroupFilterSelect('all')">
                  全部收藏
                </button>
                <button v-for="group in favoriteGroups" :key="group.id" type="button" class="media-option-chip"
                  :class="{ 'is-active': String(favoriteGroupFilter) === String(group.id) }"
                  @click="handleFavoriteGroupFilterSelect(group.id)">
                  {{ group.name }}
                </button>
              </div>
            </div>
          </template>

        <el-empty v-if="!filterLoading && !hasFilterOptions" description="暂无该媒体类型的筛选项" :image-size="56" />
      </div>
    </section>

    <WechatMediaList v-if="isWechatMedia" :rows="normalMediaList" :tag-names="normalMediaTagNames"
      :loading="mediaLoading" :loading-more="normalMediaLoadingMore" :load-error="normalMediaLoadError"
      :has-more="normalMediaHasMore" :favorite-provider-media-ids="favoriteProviderMediaIds"
      :favorite-pending-provider-media-ids="favoritePendingProviderMediaIds" @submit="handleOpenSubmissionDialog"
      @favorite="handleToggleFavorite" @retry-load-more="loadNextNormalMediaPage" />

    <WeiboMediaList v-else-if="selectedMediaType === 'weibo'" :rows="normalMediaList" :tag-names="normalMediaTagNames"
      :loading="mediaLoading" :loading-more="normalMediaLoadingMore" :load-error="normalMediaLoadError"
      :has-more="normalMediaHasMore" :favorite-provider-media-ids="favoriteProviderMediaIds"
      :favorite-pending-provider-media-ids="favoritePendingProviderMediaIds" @submit="handleOpenSubmissionDialog"
      @favorite="handleToggleFavorite" @retry-load-more="loadNextNormalMediaPage" />

    <XiaohongshuMediaList v-else-if="isXiaohongshu" :rows="normalMediaList" :industry-names="xiaohongshuIndustryNames"
      :loading="mediaLoading" :loading-more="normalMediaLoadingMore" :load-error="normalMediaLoadError" :has-more="normalMediaHasMore"
      :favorite-provider-media-ids="favoriteProviderMediaIds"
      :favorite-pending-provider-media-ids="favoritePendingProviderMediaIds" @submit="handleOpenSubmissionDialog"
      @favorite="handleToggleFavorite" @retry-load-more="loadNextNormalMediaPage" />

    <ShortVideoMediaList v-else-if="isShortVideo" :rows="normalMediaList" :platform-names="shortVideoPlatformNames"
      :selected-industry="shortVideoSelectedIndustry" :loading="mediaLoading" :loading-more="normalMediaLoadingMore"
      :load-error="normalMediaLoadError"
      :has-more="normalMediaHasMore" :favorite-provider-media-ids="favoriteProviderMediaIds"
      :favorite-pending-provider-media-ids="favoritePendingProviderMediaIds" @submit="handleOpenSubmissionDialog"
      @favorite="handleToggleFavorite" @retry-load-more="loadNextNormalMediaPage" />

    <NormalMediaList v-else-if="isLocalMedia" :rows="normalMediaList" :tag-names="normalMediaTagNames"
      :category-id="selectedMediaType === 'self' ? 2 : 1" :loading="mediaLoading" :loading-more="normalMediaLoadingMore" :load-error="normalMediaLoadError"
      :has-more="normalMediaHasMore" :favorite-provider-media-ids="favoriteProviderMediaIds"
      :favorite-pending-provider-media-ids="favoritePendingProviderMediaIds" @submit="handleOpenSubmissionDialog"
      @favorite="handleToggleFavorite" @retry-load-more="loadNextNormalMediaPage" />

  </div>
</template>

<script setup lang="ts" name="providerMediaList">
import { computed, ref } from "vue";
import { useDemoGate } from "@/composables/useDemoGate";
import {
  demoFavorites,
  demoFavoriteGroups,
  demoMediaList,
  mediaTypeLabels,
  type DemoMedia,
  type DemoMediaType,
} from "../demoData";
import NormalMediaList from "./components/NormalMediaList.vue";
import WechatMediaList from "./components/WechatMediaList.vue";
import WeiboMediaList from "./components/WeiboMediaList.vue";
import XiaohongshuMediaList from "./components/XiaohongshuMediaList.vue";
import ShortVideoMediaList from "./components/ShortVideoMediaList.vue";

const { requireFullEdition } = useDemoGate("mediaRelease");

type FilterValue = number | string | boolean | undefined;
type SortOrder = "asc" | "desc";
type WechatPriceField = "price0" | "price02";
type WeiboPriceField = "price0" | "price02" | "price03";
type XiaohongshuPriceType = 1 | 2;
type FilterOption = { id: FilterValue; name: string };
type FilterRow = { key: string; label: string; options: FilterOption[] };

const mediaTypeOptions = (Object.entries(mediaTypeLabels) as Array<[DemoMediaType, string]>).map(([key, label]) => ({
  key,
  label,
  listType: key === "shortVideo" ? "shortVideo" : key === "xiaohongshu" ? "xiaohongshu" : "normal",
}));
const normalSortOptions = [
  { key: "price", label: "价格" },
  { key: "pc_weight", label: "电脑权重" },
  { key: "mobile_weight", label: "移动权重" },
] as const;
type NormalSortBy = typeof normalSortOptions[number]["key"];

const priceOptions: FilterOption[] = [
  { id: "0-50", name: "50元以内" },
  { id: "50-100", name: "50-100元" },
  { id: "100-200", name: "100-200元" },
  { id: "200+", name: "200元以上" },
];
const audienceOptions: FilterOption[] = [
  { id: "0-100000", name: "10万以下" },
  { id: "100000-200000", name: "10万-20万" },
  { id: "200000+", name: "20万以上" },
];
const readingOptions: FilterOption[] = [
  { id: "0-10000", name: "1万以下" },
  { id: "10000-20000", name: "1万-2万" },
  { id: "20000+", name: "2万以上" },
];
const booleanOptions = (yes: string, no: string): FilterOption[] => [
  { id: true, name: yes },
  { id: false, name: no },
];
const uniqueOptions = (type: DemoMediaType, getter: (row: DemoMedia) => unknown): FilterOption[] => [...new Set(
  demoMediaList.filter((row) => row.type === type).map(getter).filter((value) => value !== undefined && value !== null && value !== "").map(String),
)].map((value) => ({ id: value, name: value }));

const normalFilterRows = computed<FilterRow[]>(() => [
  { key: "portal", label: "门户类型", options: uniqueOptions("news", (row) => row.portal_type) },
  { key: "channel", label: "频道类型", options: uniqueOptions("news", (row) => row.channel || row.industry) },
  { key: "region", label: "所属区域", options: uniqueOptions("news", (row) => row.area) },
  { key: "inclusion", label: "收录效果", options: uniqueOptions("news", (row) => row.collection_type) },
  { key: "price", label: "价格区间", options: priceOptions },
  { key: "geo", label: "AI收录", options: booleanOptions("支持AI收录", "暂不支持") },
  { key: "nLink", label: "内链能力", options: booleanOptions("可发内链", "不可发内链") },
  { key: "contactShow", label: "联系方式", options: booleanOptions("可发联系方式", "不可发联系方式") },
]);
const selfMediaFilterRows = computed<FilterRow[]>(() => [
  { key: "platform", label: "所属平台", options: uniqueOptions("self", (row) => row.channel) },
  { key: "industry", label: "行业类型", options: uniqueOptions("self", (row) => row.industry_type) },
  { key: "region", label: "所属区域", options: uniqueOptions("self", (row) => row.area) },
  { key: "fans", label: "粉丝数", options: audienceOptions },
  { key: "reading", label: "平均阅读数", options: readingOptions },
  { key: "price", label: "价格区间", options: priceOptions },
  { key: "nLink", label: "内链能力", options: booleanOptions("可发内链", "不可发内链") },
  { key: "contactShow", label: "联系方式", options: booleanOptions("可发联系方式", "不可发联系方式") },
  { key: "official", label: "官方媒体", options: [{ id: "official", name: "官方自媒体" }, { id: "nonOfficial", name: "非官方自媒体" }] },
  { key: "certification", label: "账号认证", options: [{ id: "yellowV", name: "黄V认证" }, { id: "blueV", name: "蓝V认证" }, { id: "redV", name: "红V认证" }] },
]);
const wechatMediaFilterRows = computed<FilterRow[]>(() => [
  { key: "industry", label: "行业类型", options: uniqueOptions("wechat", (row) => row.industry_type) },
  { key: "region", label: "所属区域", options: uniqueOptions("wechat", (row) => row.area) },
  { key: "referenceFans", label: "参考粉丝数", options: audienceOptions },
  { key: "referenceReading", label: "参考阅读数", options: readingOptions },
  { key: "official", label: "官方媒体", options: [{ id: "official", name: "官方自媒体" }, { id: "nonOfficial", name: "非官方自媒体" }] },
  { key: "headlinePrice", label: "头条价格", options: priceOptions },
  { key: "nLink", label: "内链能力", options: booleanOptions("可发内链", "不可发内链") },
  { key: "contactShow", label: "联系方式", options: booleanOptions("可发联系方式", "不可发联系方式") },
]);
const weiboMediaFilterRows = computed<FilterRow[]>(() => [
  { key: "industry", label: "行业类型", options: uniqueOptions("weibo", (row) => row.industry_type) },
  { key: "region", label: "所属区域", options: uniqueOptions("weibo", (row) => row.area) },
  { key: "certification", label: "V认证", options: [{ id: "unverified", name: "未认证" }, { id: "blueV", name: "蓝V认证" }, { id: "yellowV", name: "黄V认证" }, { id: "orangeV", name: "橙V认证" }] },
  { key: "fans", label: "参考粉丝数", options: audienceOptions },
  { key: "price", label: "价格区间", options: priceOptions },
  { key: "official", label: "官方媒体", options: [{ id: "official", name: "官方媒体" }, { id: "nonOfficial", name: "非官方媒体" }] },
  { key: "nLink", label: "内链能力", options: booleanOptions("可发内链", "不可发内链") },
  { key: "contactShow", label: "联系方式", options: booleanOptions("可发联系方式", "不可发联系方式") },
]);
const xiaohongshuIndustryOptions = computed(() => uniqueOptions("xiaohongshu", (row) => row.industry));
const xiaohongshuFilterRows = computed<FilterRow[]>(() => [
  { key: "fans", label: "粉丝数", options: audienceOptions },
  { key: "price", label: "合作价格", options: priceOptions },
  { key: "province", label: "所在省份", options: uniqueOptions("xiaohongshu", (row) => row.city || row.province) },
]);
const shortVideoFilterRows = computed<FilterRow[]>(() => [
  { key: "platform", label: "平台类型", options: uniqueOptions("shortVideo", (row) => row.platform_name || row.platform) },
  { key: "industry", label: "行业分类", options: uniqueOptions("shortVideo", (row) => row.industry) },
  { key: "fans", label: "粉丝数", options: audienceOptions },
  { key: "price", label: "合作价格", options: priceOptions },
  { key: "gender", label: "基础信息", options: [{ id: "男", name: "男" }, { id: "女", name: "女" }] },
  { key: "province", label: "所在省份", options: uniqueOptions("shortVideo", (row) => row.province || row.city) },
]);

const selectedMediaType = ref<DemoMediaType>("news");
const mediaSearchInput = ref("");
const remarksSearchInput = ref("");
const appliedMediaSearch = ref("");
const appliedRemarksSearch = ref("");
const normalFilterSelection = ref<Record<string, FilterValue>>({});
const selfMediaFilterSelection = ref<Record<string, FilterValue>>({});
const wechatMediaFilterSelection = ref<Record<string, FilterValue>>({});
const weiboMediaFilterSelection = ref<Record<string, FilterValue>>({});
const shortVideoFilterSelection = ref<Record<string, FilterValue>>({});
const xiaohongshuFilterSelection = ref<Record<string, FilterValue>>({});
const normalSortSelection = ref<Partial<Record<NormalSortBy, SortOrder>>>({});
const selfPriceSortOrder = ref<SortOrder>();
const wechatPriceSortOrder = ref<SortOrder>();
const weiboPriceSortOrder = ref<SortOrder>();
const xiaohongshuPriceSortOrder = ref<SortOrder>();
const shortVideoPriceSortOrder = ref<SortOrder>();
const wechatPriceField = ref<WechatPriceField>("price0");
const weiboPriceField = ref<WeiboPriceField>("price0");
const xiaohongshuPriceType = ref<XiaohongshuPriceType>(1);
const xiaohongshuIndustryType = ref<FilterValue>();
const selectedPropertyId = ref<FilterValue>();
const favoriteGroupFilter = ref<FilterValue | "all">();
const customPriceMin = ref<number>();
const customPriceMax = ref<number>();
const appliedCustomPriceMin = ref<number>();
const appliedCustomPriceMax = ref<number>();
const selfCustomPriceMin = ref<number>();
const selfCustomPriceMax = ref<number>();
const appliedSelfCustomPriceMin = ref<number>();
const appliedSelfCustomPriceMax = ref<number>();
const xiaohongshuCustomFansMin = ref<number>();
const xiaohongshuCustomFansMax = ref<number>();
const appliedXiaohongshuCustomFansMin = ref<number>();
const appliedXiaohongshuCustomFansMax = ref<number>();
const xiaohongshuCustomPriceMin = ref<number>();
const xiaohongshuCustomPriceMax = ref<number>();
const appliedXiaohongshuCustomPriceMin = ref<number>();
const appliedXiaohongshuCustomPriceMax = ref<number>();
const shortVideoCustomFansMin = ref<number>();
const shortVideoCustomFansMax = ref<number>();
const appliedShortVideoCustomFansMin = ref<number>();
const appliedShortVideoCustomFansMax = ref<number>();
const shortVideoCustomPriceMin = ref<number>();
const shortVideoCustomPriceMax = ref<number>();
const appliedShortVideoCustomPriceMin = ref<number>();
const appliedShortVideoCustomPriceMax = ref<number>();

const favoriteGroups = demoFavoriteGroups;
const favoriteGroupsLoading = false;
const filterLoading = false;
const mediaLoading = false;
const normalMediaLoadingMore = false;
const normalMediaLoadError = false;
const normalMediaHasMore = false;
const favoritePendingProviderMediaIds: Array<number | string> = [];
const favoriteProviderMediaIds = demoFavorites.map((item) => item.provider_media_id);
const propertyOptions: FilterOption[] = [...new Set(
  demoMediaList.flatMap((row) => String(row.property || "").split(",")).map((value) => value.trim()).filter(Boolean),
)].map((value) => ({ id: value, name: value }));
const visiblePropertyOptions = computed(() => propertyOptions);
const showPropertyOptions = computed(() => ["news", "self", "wechat", "weibo"].includes(selectedMediaType.value));
const isWechatMedia = computed(() => selectedMediaType.value === "wechat");
const isXiaohongshu = computed(() => selectedMediaType.value === "xiaohongshu");
const isShortVideo = computed(() => selectedMediaType.value === "shortVideo");
const isLocalMedia = computed(() => ["news", "self", "wechat", "weibo"].includes(selectedMediaType.value));
const hasFilterOptions = computed(() => true);
const mediaSearchLabel = computed(() => isXiaohongshu.value || isShortVideo.value ? "账号名称" : "媒体名称");
const mediaSearchPlaceholder = computed(() => isXiaohongshu.value
  ? "输入小红书账号名称后按 Enter 搜索"
  : isShortVideo.value
    ? "输入短视频账号名称后按 Enter 搜索"
    : "输入媒体名称后按 Enter 搜索");
const hasNormalSortSelection = computed(() => Object.keys(normalSortSelection.value).length > 0);
const hasCustomPrice = computed(() => appliedCustomPriceMin.value != null || appliedCustomPriceMax.value != null);
const hasCustomPriceDraft = computed(() => customPriceMin.value != null || customPriceMax.value != null);
const hasSelfCustomPrice = computed(() => appliedSelfCustomPriceMin.value != null || appliedSelfCustomPriceMax.value != null);
const hasSelfCustomPriceDraft = computed(() => selfCustomPriceMin.value != null || selfCustomPriceMax.value != null);
const hasXiaohongshuCustomFans = computed(() => appliedXiaohongshuCustomFansMin.value != null || appliedXiaohongshuCustomFansMax.value != null);
const hasXiaohongshuCustomFansDraft = computed(() => xiaohongshuCustomFansMin.value != null || xiaohongshuCustomFansMax.value != null);
const hasXiaohongshuCustomPrice = computed(() => appliedXiaohongshuCustomPriceMin.value != null || appliedXiaohongshuCustomPriceMax.value != null);
const hasXiaohongshuCustomPriceDraft = computed(() => xiaohongshuCustomPriceMin.value != null || xiaohongshuCustomPriceMax.value != null);
const hasShortVideoCustomFans = computed(() => appliedShortVideoCustomFansMin.value != null || appliedShortVideoCustomFansMax.value != null);
const hasShortVideoCustomFansDraft = computed(() => shortVideoCustomFansMin.value != null || shortVideoCustomFansMax.value != null);
const hasShortVideoCustomPrice = computed(() => appliedShortVideoCustomPriceMin.value != null || appliedShortVideoCustomPriceMax.value != null);
const hasShortVideoCustomPriceDraft = computed(() => shortVideoCustomPriceMin.value != null || shortVideoCustomPriceMax.value != null);
const wechatPriceFieldOptions = [{ value: "price0", label: "头条价格" }, { value: "price02", label: "次条价格" }];
const weiboPriceFieldOptions = [{ value: "price0", label: "直发价格" }, { value: "price02", label: "转发价格" }, { value: "price03", label: "任务价格" }];
const xiaohongshuPriceTypeOptions = [{ value: 1, label: "图文价格" }, { value: 2, label: "视频价格" }];

function getOptionId(option: any) { return option?.id; }
function getOptionName(option: any) { return option?.name ?? String(option?.id ?? ""); }
function hasSelection(selection: Record<string, FilterValue>, key: string) {
  const value = selection[key];
  return value !== undefined && value !== null && value !== "";
}
function getRowOptions(rows: FilterRow[], key: string) { return rows.find((row) => row.key === key)?.options || []; }
function hasNormalFilterSelection(key: string) { return hasSelection(normalFilterSelection.value, key); }
function hasSelfFilterSelection(key: string) { return hasSelection(selfMediaFilterSelection.value, key); }
function hasWechatMediaFilterSelection(key: string) { return hasSelection(wechatMediaFilterSelection.value, key); }
function hasWeiboMediaFilterSelection(key: string) { return hasSelection(weiboMediaFilterSelection.value, key); }
function hasXiaohongshuFilterSelection(key: string) { return hasSelection(xiaohongshuFilterSelection.value, key); }
function hasShortVideoFilterSelection(key: string) { return hasSelection(shortVideoFilterSelection.value, key); }
function getNormalFilterOptions(key: string) { return getRowOptions(normalFilterRows.value, key); }
function getSelfFilterOptions(key: string) { return getRowOptions(selfMediaFilterRows.value, key); }
function getWechatMediaFilterOptions(key: string) { return getRowOptions(wechatMediaFilterRows.value, key); }
function getWeiboMediaFilterOptions(key: string) { return getRowOptions(weiboMediaFilterRows.value, key); }

function inRange(value: number, preset: FilterValue, min?: number, max?: number) {
  if (min != null || max != null) return (min == null || value >= min) && (max == null || value <= max);
  if (!preset) return true;
  const text = String(preset);
  if (text.endsWith("+")) return value >= Number(text.slice(0, -1));
  const [rangeMin, rangeMax] = text.split("-").map(Number);
  return Number.isFinite(rangeMin) && Number.isFinite(rangeMax) ? value >= rangeMin && value <= rangeMax : true;
}
function getPrice(row: DemoMedia) {
  if (selectedMediaType.value === "wechat") return Number(row[wechatPriceField.value] ?? 0);
  if (selectedMediaType.value === "weibo") return Number(row[weiboPriceField.value] ?? 0);
  if (selectedMediaType.value === "xiaohongshu") return Number(xiaohongshuPriceType.value === 2 ? row.note_video_price : row.note_art_price) || 0;
  return Number(row.price ?? row.price0 ?? row.note_art_price ?? 0);
}
function getName(row: DemoMedia) { return String(row.account_name || row.name || ""); }
function matchesText(row: DemoMedia) {
  const keyword = appliedMediaSearch.value.trim().toLowerCase();
  const remarks = appliedRemarksSearch.value.trim().toLowerCase();
  return (!keyword || getName(row).toLowerCase().includes(keyword))
    && (!remarks || String(row.remarks || "").toLowerCase().includes(remarks));
}
function matchesFavorite(row: DemoMedia) {
  if (favoriteGroupFilter.value === undefined) return true;
  const favorites = favoriteGroupFilter.value === "all"
    ? demoFavorites
    : demoFavorites.filter((item) => String(item.group_id) === String(favoriteGroupFilter.value));
  return favorites.some((item) => item.provider_media_id === row.provider_media_id);
}
function equals(value: unknown, selected: FilterValue) { return selected === undefined || String(value ?? "") === String(selected); }
function matchesCommon(row: DemoMedia, selection: Record<string, FilterValue>) {
  return (!hasSelection(selection, "nLink") || row.n_link === selection.nLink)
    && (!hasSelection(selection, "contactShow") || row.contact_show === selection.contactShow)
    && (!hasSelection(selection, "official") || (selection.official === "official" ? Number(row.gfrz) === 1 : Number(row.gfrz) !== 1));
}
function matchesNews(row: DemoMedia) {
  const s = normalFilterSelection.value;
  return equals(row.portal_type, s.portal)
    && equals(row.channel || row.industry, s.channel)
    && equals(row.area, s.region)
    && equals(row.collection_type, s.inclusion)
    && (!hasSelection(s, "geo") || (Number(row.gfrz) === 1) === s.geo)
    && inRange(getPrice(row), s.price, appliedCustomPriceMin.value, appliedCustomPriceMax.value)
    && (!selectedPropertyId.value || String(row.property || "").split(",").includes(String(selectedPropertyId.value)))
    && matchesCommon(row, s);
}
function matchesSelf(row: DemoMedia) {
  const s = selfMediaFilterSelection.value;
  const certifications: Record<string, number> = { yellowV: 1, blueV: 2, redV: 3 };
  return equals(row.channel, s.platform) && equals(row.industry_type, s.industry) && equals(row.area, s.region)
    && inRange(Number(row.fans || 0), s.fans) && inRange(Number(row.reading || 0), s.reading)
    && inRange(getPrice(row), s.price, appliedSelfCustomPriceMin.value, appliedSelfCustomPriceMax.value)
    && (!hasSelection(s, "certification") || Number(row.self_vrz) === certifications[String(s.certification)])
    && matchesCommon(row, s);
}
function matchesWechat(row: DemoMedia) {
  const s = wechatMediaFilterSelection.value;
  return equals(row.industry_type, s.industry) && equals(row.area, s.region)
    && inRange(Number(row.fans || 0), s.referenceFans) && inRange(Number(row.reading || 0), s.referenceReading)
    && inRange(getPrice(row), s.headlinePrice) && matchesCommon(row, s);
}
function matchesWeibo(row: DemoMedia) {
  const s = weiboMediaFilterSelection.value;
  const certifications: Record<string, number> = { unverified: 0, yellowV: 1, blueV: 2, orangeV: 3 };
  return equals(row.industry_type, s.industry) && equals(row.area, s.region)
    && inRange(Number(row.fans || 0), s.fans) && inRange(getPrice(row), s.price)
    && (!hasSelection(s, "certification") || Number(row.self_vrz || 0) === certifications[String(s.certification)])
    && matchesCommon(row, s);
}
function matchesXiaohongshu(row: DemoMedia) {
  const s = xiaohongshuFilterSelection.value;
  return equals(row.industry, xiaohongshuIndustryType.value) && equals(row.city || row.province, s.province)
    && inRange(Number(row.followers_count || 0), s.fans, appliedXiaohongshuCustomFansMin.value, appliedXiaohongshuCustomFansMax.value)
    && inRange(getPrice(row), s.price, appliedXiaohongshuCustomPriceMin.value, appliedXiaohongshuCustomPriceMax.value);
}
function matchesShortVideo(row: DemoMedia) {
  const s = shortVideoFilterSelection.value;
  return equals(row.platform_name || row.platform, s.platform) && equals(row.industry, s.industry)
    && equals(row.province || row.city, s.province)
    && (!hasSelection(s, "gender") || String(row.audience_gender || row.gender || "").startsWith(String(s.gender)))
    && inRange(Number(row.fans || 0), s.fans, appliedShortVideoCustomFansMin.value, appliedShortVideoCustomFansMax.value)
    && inRange(getPrice(row), s.price, appliedShortVideoCustomPriceMin.value, appliedShortVideoCustomPriceMax.value);
}
function getActiveSort(): SortOrder | undefined {
  if (selectedMediaType.value === "self") return selfPriceSortOrder.value;
  if (selectedMediaType.value === "wechat") return wechatPriceSortOrder.value;
  if (selectedMediaType.value === "weibo") return weiboPriceSortOrder.value;
  if (selectedMediaType.value === "xiaohongshu") return xiaohongshuPriceSortOrder.value;
  if (selectedMediaType.value === "shortVideo") return shortVideoPriceSortOrder.value;
  return undefined;
}
const normalMediaList = computed(() => {
  let rows = demoMediaList.filter((row) => row.type === selectedMediaType.value && matchesText(row) && matchesFavorite(row));
  rows = rows.filter((row) => selectedMediaType.value === "news" ? matchesNews(row)
    : selectedMediaType.value === "self" ? matchesSelf(row)
      : selectedMediaType.value === "wechat" ? matchesWechat(row)
        : selectedMediaType.value === "weibo" ? matchesWeibo(row)
          : selectedMediaType.value === "xiaohongshu" ? matchesXiaohongshu(row) : matchesShortVideo(row));
  if (selectedMediaType.value === "news" && hasNormalSortSelection.value) {
    rows = [...rows].sort((a, b) => {
      for (const option of normalSortOptions) {
        const order = normalSortSelection.value[option.key];
        if (!order) continue;
        const aValue = option.key === "price" ? getPrice(a) : option.key === "pc_weight" ? Number(a.pcbr || 0) : Number(a.mbr || 0);
        const bValue = option.key === "price" ? getPrice(b) : option.key === "pc_weight" ? Number(b.pcbr || 0) : Number(b.mbr || 0);
        if (aValue !== bValue) return order === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  } else if (getActiveSort()) {
    const order = getActiveSort();
    rows = [...rows].sort((a, b) => order === "asc" ? getPrice(a) - getPrice(b) : getPrice(b) - getPrice(a));
  }
  return rows;
});
const mediaTotal = computed(() => normalMediaList.value.length);
const normalMediaTagNames = computed(() => {
  const values = [...new Set(demoMediaList.flatMap((row) => [row.channel, row.portal_type, row.area, row.collection_type, row.industry_type, row.property]).filter(Boolean).map(String))];
  const names = Object.fromEntries(values.map((value) => [value, value]));
  return { channel: names, portal_type: names, area: names, collection_type: names, platform: names, industry: names, property: names };
});
const xiaohongshuIndustryNames = computed(() => Object.fromEntries(xiaohongshuIndustryOptions.value.map((option) => [String(option.id), option.name])));
const shortVideoPlatformNames = computed(() => Object.fromEntries(getRowOptions(shortVideoFilterRows.value, "platform").map((option) => [String(option.id), option.name])));
const shortVideoSelectedIndustry = computed(() => String(shortVideoFilterSelection.value.industry || ""));

function clearAllFilters(resetType = false) {
  if (resetType) selectedMediaType.value = "news";
  mediaSearchInput.value = ""; remarksSearchInput.value = ""; appliedMediaSearch.value = ""; appliedRemarksSearch.value = "";
  normalFilterSelection.value = {}; selfMediaFilterSelection.value = {}; wechatMediaFilterSelection.value = {};
  weiboMediaFilterSelection.value = {}; shortVideoFilterSelection.value = {}; xiaohongshuFilterSelection.value = {};
  normalSortSelection.value = {}; selfPriceSortOrder.value = undefined; wechatPriceSortOrder.value = undefined;
  weiboPriceSortOrder.value = undefined; xiaohongshuPriceSortOrder.value = undefined; shortVideoPriceSortOrder.value = undefined;
  wechatPriceField.value = "price0"; weiboPriceField.value = "price0"; xiaohongshuPriceType.value = 1;
  xiaohongshuIndustryType.value = undefined; selectedPropertyId.value = undefined; favoriteGroupFilter.value = undefined;
  customPriceMin.value = undefined; customPriceMax.value = undefined; appliedCustomPriceMin.value = undefined; appliedCustomPriceMax.value = undefined;
  selfCustomPriceMin.value = undefined; selfCustomPriceMax.value = undefined; appliedSelfCustomPriceMin.value = undefined; appliedSelfCustomPriceMax.value = undefined;
  xiaohongshuCustomFansMin.value = undefined; xiaohongshuCustomFansMax.value = undefined; appliedXiaohongshuCustomFansMin.value = undefined; appliedXiaohongshuCustomFansMax.value = undefined;
  xiaohongshuCustomPriceMin.value = undefined; xiaohongshuCustomPriceMax.value = undefined; appliedXiaohongshuCustomPriceMin.value = undefined; appliedXiaohongshuCustomPriceMax.value = undefined;
  shortVideoCustomFansMin.value = undefined; shortVideoCustomFansMax.value = undefined; appliedShortVideoCustomFansMin.value = undefined; appliedShortVideoCustomFansMax.value = undefined;
  shortVideoCustomPriceMin.value = undefined; shortVideoCustomPriceMax.value = undefined; appliedShortVideoCustomPriceMin.value = undefined; appliedShortVideoCustomPriceMax.value = undefined;
}
function applyRange(min: number | undefined, max: number | undefined, applyMin: { value: number | undefined }, applyMax: { value: number | undefined }, selection: Record<string, FilterValue>, key: string, error: string) {
  if (min != null && max != null && min > max) { showToastFail(error); return; }
  selection[key] = undefined; applyMin.value = min; applyMax.value = max;
}
function handleMediaTypeChange(type: DemoMediaType) { if (type !== selectedMediaType.value) { selectedMediaType.value = type; clearAllFilters(); } }
function handleMediaSearch() { appliedMediaSearch.value = mediaSearchInput.value; appliedRemarksSearch.value = remarksSearchInput.value; }
function handleMediaRefresh() { showToastOk("已刷新本地媒体快照"); }
function handleMediaReset() { clearAllFilters(true); }
function handleNormalFilterSelect(key: string, value: FilterValue) { normalFilterSelection.value[key] = value; if (key === "price") { customPriceMin.value = undefined; customPriceMax.value = undefined; appliedCustomPriceMin.value = undefined; appliedCustomPriceMax.value = undefined; } }
function handleSelfMediaFilterSelect(key: string, value: FilterValue) { selfMediaFilterSelection.value[key] = value; if (key === "price") { selfCustomPriceMin.value = undefined; selfCustomPriceMax.value = undefined; appliedSelfCustomPriceMin.value = undefined; appliedSelfCustomPriceMax.value = undefined; } }
function handleWechatMediaFilterSelect(key: string, value: FilterValue) { wechatMediaFilterSelection.value[key] = value; }
function handleWeiboMediaFilterSelect(key: string, value: FilterValue) { weiboMediaFilterSelection.value[key] = value; }
function handleXiaohongshuFilterSelect(key: string, value: FilterValue) { xiaohongshuFilterSelection.value[key] = value; if (key === "fans") { appliedXiaohongshuCustomFansMin.value = undefined; appliedXiaohongshuCustomFansMax.value = undefined; } if (key === "price") { appliedXiaohongshuCustomPriceMin.value = undefined; appliedXiaohongshuCustomPriceMax.value = undefined; } }
function handleShortVideoFilterSelect(key: string, value: FilterValue) { shortVideoFilterSelection.value[key] = value; if (key === "fans") { appliedShortVideoCustomFansMin.value = undefined; appliedShortVideoCustomFansMax.value = undefined; } if (key === "price") { appliedShortVideoCustomPriceMin.value = undefined; appliedShortVideoCustomPriceMax.value = undefined; } }
function handleCustomPriceChange() { applyRange(customPriceMin.value, customPriceMax.value, appliedCustomPriceMin, appliedCustomPriceMax, normalFilterSelection.value, "price", "最低价不能大于最高价"); }
function handleSelfCustomPriceChange() { applyRange(selfCustomPriceMin.value, selfCustomPriceMax.value, appliedSelfCustomPriceMin, appliedSelfCustomPriceMax, selfMediaFilterSelection.value, "price", "最低价不能大于最高价"); }
function handleXiaohongshuCustomFansChange() { applyRange(xiaohongshuCustomFansMin.value, xiaohongshuCustomFansMax.value, appliedXiaohongshuCustomFansMin, appliedXiaohongshuCustomFansMax, xiaohongshuFilterSelection.value, "fans", "最低粉丝数不能大于最高粉丝数"); }
function handleXiaohongshuCustomPriceChange() { applyRange(xiaohongshuCustomPriceMin.value, xiaohongshuCustomPriceMax.value, appliedXiaohongshuCustomPriceMin, appliedXiaohongshuCustomPriceMax, xiaohongshuFilterSelection.value, "price", "最低价不能大于最高价"); }
function handleShortVideoCustomFansChange() { applyRange(shortVideoCustomFansMin.value, shortVideoCustomFansMax.value, appliedShortVideoCustomFansMin, appliedShortVideoCustomFansMax, shortVideoFilterSelection.value, "fans", "最低粉丝数不能大于最高粉丝数"); }
function handleShortVideoCustomPriceChange() { applyRange(shortVideoCustomPriceMin.value, shortVideoCustomPriceMax.value, appliedShortVideoCustomPriceMin, appliedShortVideoCustomPriceMax, shortVideoFilterSelection.value, "price", "最低价不能大于最高价"); }
function handleNormalPropertySelect(value: FilterValue) { selectedPropertyId.value = value; }
function handleSelfPropertySelect(value: FilterValue) { selectedPropertyId.value = value; }
function handleWechatPropertySelect(value: FilterValue) { selectedPropertyId.value = value; }
function handleWeiboPropertySelect(value: FilterValue) { selectedPropertyId.value = value; }
function handleFavoriteGroupFilterSelect(value: FilterValue | "all") { favoriteGroupFilter.value = value; }
function handleXiaohongshuIndustrySelect(value: FilterValue) { xiaohongshuIndustryType.value = value; }
function handleWechatPriceFieldSelect(value: WechatPriceField) { wechatPriceField.value = value; }
function handleWeiboPriceFieldSelect(value: WeiboPriceField) { weiboPriceField.value = value; }
function handleXiaohongshuPriceTypeSelect(value: XiaohongshuPriceType) { xiaohongshuPriceType.value = value; }
function handleNormalSortReset() { normalSortSelection.value = {}; }
function handleNormalSortLabelClick(key: NormalSortBy) { normalSortSelection.value = { ...normalSortSelection.value, [key]: normalSortSelection.value[key] === "asc" ? "desc" : "asc" }; }
function getNormalSortTitle(key: NormalSortBy, label: string) { return normalSortSelection.value[key] === "asc" ? `当前按${label}升序排序，再次点击切换为降序` : normalSortSelection.value[key] === "desc" ? `当前按${label}降序排序，再次点击切换为升序` : `按${label}升序排序`; }
function toggleSort(sort: { value: SortOrder | undefined }) { sort.value = sort.value === "asc" ? "desc" : "asc"; }
function handleSelfPriceSortReset() { selfPriceSortOrder.value = undefined; }
function handleSelfPriceSortClick() { toggleSort(selfPriceSortOrder); }
function handleWechatPriceSortReset() { wechatPriceSortOrder.value = undefined; }
function handleWechatPriceSortClick() { toggleSort(wechatPriceSortOrder); }
function handleWeiboPriceSortReset() { weiboPriceSortOrder.value = undefined; }
function handleWeiboPriceSortClick() { toggleSort(weiboPriceSortOrder); }
function handleXiaohongshuPriceSortReset() { xiaohongshuPriceSortOrder.value = undefined; }
function handleXiaohongshuPriceSortClick() { toggleSort(xiaohongshuPriceSortOrder); }
function handleShortVideoPriceSortReset() { shortVideoPriceSortOrder.value = undefined; }
function handleShortVideoPriceSortClick() { toggleSort(shortVideoPriceSortOrder); }
const sortTitle = (sort: { value: SortOrder | undefined }) => computed(() => sort.value === "asc" ? "当前按价格升序排序，再次点击切换为降序" : sort.value === "desc" ? "当前按价格降序排序，再次点击切换为升序" : "按价格升序排序");
const getSelfPriceSortTitle = sortTitle(selfPriceSortOrder);
const getWechatPriceSortTitle = sortTitle(wechatPriceSortOrder);
const getWeiboPriceSortTitle = sortTitle(weiboPriceSortOrder);
const getXiaohongshuPriceSortTitle = sortTitle(xiaohongshuPriceSortOrder);
const getShortVideoPriceSortTitle = sortTitle(shortVideoPriceSortOrder);
function handlePageScroll() { /* 本地演示数据一次性展示，无需请求下一页。 */ }
function loadNextNormalMediaPage() { /* 本地演示数据一次性展示，无需请求下一页。 */ }
async function handleOpenSubmissionDialog(row: DemoMedia) {
  await requireFullEdition("媒体投稿", "submit", `向「${getName(row)}」提交稿件属于完整版能力。体验版不会打开投稿弹窗或发起请求。`);
}
async function handleToggleFavorite(row: DemoMedia) {
  await requireFullEdition("媒体收藏", "favorite", `收藏「${getName(row)}」及管理收藏分组属于完整版能力。体验版不会修改任何数据。`);
}
</script>

<style lang="scss" scoped>
.provider-media-list {
  gap: 10px;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  .media-filter-panel {
    position: relative;
    flex-shrink: 0;
    overflow: hidden;
    border: 0;
    border-top: 1.5px solid #fff;
    border-left: 1.5px solid #fff;
    border-radius: var(--el-border-radius-base);
    background: linear-gradient(135deg, #fffaf3 0%, #fffdf9 28%, #fff 58%);

    &::after {
      position: absolute;
      top: 0;
      left: 0;
      width: 240px;
      height: 100%;
      background-image: radial-gradient(rgb(230 162 82 / 20%) 1px, transparent 1.5px);
      background-position: 9px 9px;
      background-size: 15px 15px;
      content: "";
      pointer-events: none;
      opacity: 0.55;
      mask-image: linear-gradient(135deg, rgb(0 0 0 / 85%), transparent 62%);
      -webkit-mask-image: linear-gradient(135deg, rgb(0 0 0 / 85%), transparent 62%);
    }

    .media-type-tabs {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: stretch;
      min-height: 46px;
      padding: 0 14px;
      border-bottom: 1px solid rgb(230 162 82 / 10%);
      background-color: rgb(255 255 255 / 35%);

      .media-type-tabs-label {
        display: flex;
        align-items: center;
        width: 88px;
        flex-shrink: 0;
        padding: 0 12px;
        color: var(--el-text-color-secondary);
        font-size: 12px;
        font-weight: 500;
      }

      .media-type-tab-list {
        display: flex;
        align-items: stretch;
        min-width: 0;
        flex: 1;
        gap: 4px;
        overflow-x: auto;
      }

      .media-type-tab {
        position: relative;
        display: inline-flex;
        align-items: center;
        min-width: 72px;
        padding: 0 12px;
        border: 0;
        background: transparent;
        color: var(--el-text-color-regular);
        cursor: pointer;
        font-size: 12px;
        white-space: nowrap;
        transition: color 0.18s ease, background-color 0.18s ease;

        &:hover {
          background-color: rgb(255 157 61 / 7%);
          color: #d97706;
        }

        &.is-active {
          background-color: rgb(255 157 61 / 7%);
          color: #d97706;
          font-weight: 600;

          &::after {
            position: absolute;
            right: 12px;
            bottom: 0;
            left: 12px;
            height: 3px;
            border-radius: 3px 3px 0 0;
            background: linear-gradient(90deg, #ffb84d, #d97706);
            content: "";
          }
        }
      }

      .media-type-dot {
        width: 6px;
        height: 6px;
        margin-right: 5px;
        border-radius: 50%;
        background: #ff9d3d;

        &.is-self {
          background: #67c23a;
        }

        &.is-wechat {
          background: #36cfc9;
        }

        &.is-weibo {
          background: #f56c6c;
        }

        &.is-xiaohongshu {
          background: #ff2442;
        }

        &.is-shortVideo {
          background: #8b5cf6;
        }
      }
    }

    .media-filter-header {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 12px;
      min-height: 48px;
      padding: 8px 14px;

      .media-filter-heading {
        display: flex;
        align-items: center;
        gap: 8px;

        .media-filter-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          border-radius: 8px;
          background: linear-gradient(135deg, #ffb84d, #ff9d3d);
          box-shadow: 0 2px 6px rgb(255 157 61 / 22%);
          color: #fff;
          font-size: 15px;
        }

        .media-filter-title {
          margin: 0;
          color: #f0820a;
          font-size: 15px;
          font-weight: 600;
          line-height: 20px;
          white-space: nowrap;
        }
      }

      .media-search {
        display: flex;
        min-width: 0;
        align-items: center;
        gap: 6px;

        .media-search-label {
          flex-shrink: 0;
          color: var(--el-text-color-secondary);
          font-size: 12px;
          white-space: nowrap;
        }

        :deep(.el-input) {
          width: 260px;
        }

        :deep(.el-input__wrapper) {
          background-color: rgb(255 255 255 / 50%);
          box-shadow: 0 0 0 1px rgb(245 158 11 / 18%) inset;
        }

        :deep(.el-input__wrapper.is-focus) {
          box-shadow: 0 0 0 1px #ffb84d inset;
        }
      }

      .media-filter-spacer {
        flex: 1;
      }

      .media-filter-actions {
        display: flex;
        align-items: center;
        gap: 6px;

        .media-list-total {
          margin-right: 10px;
          color: var(--el-text-color-secondary);
          font-size: 12px;
          white-space: nowrap;

          strong {
            padding: 0 2px;
            color: #f0820a;
            font-size: 14px;
          }
        }
      }
    }

    .media-options {
      position: relative;
      z-index: 1;
      min-height: 40px;
      padding: 2px 0 8px;

      .media-option-row {
        display: flex;
        align-items: stretch;
        min-height: 40px;

        & + .media-option-row {
          border-top: 1px solid rgb(230 162 82 / 7%);
        }

        .media-option-label {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          width: 88px;
          flex-shrink: 0;
          padding: 0 12px;
          margin-top: 10px;
          color: var(--el-text-color-secondary);
          font-size: 12px;
          font-weight: 500;
        }

        .media-price-field-select {
          width: 80px;
          flex-shrink: 0;
          margin: 6px 0 6px 6px;

          &.xiaohongshu-price-field-select {
            width: 90px;

            :deep(.el-select__wrapper) {
              position: relative;
              justify-content: center;
              padding: 0 24px 0 8px;
            }

            :deep(.el-select__selection) {
              flex: 1;
              justify-content: center;
            }

            :deep(.el-select__selected-item) {
              text-align: center;
            }

            :deep(.el-select__caret) {
              position: absolute;
              right: 7px;
            }
          }

          :deep(.el-select__wrapper) {
            min-height: 28px;
            padding: 0 6px;
            border-radius: 14px;
            background: linear-gradient(135deg, #fff4e5, #fffaf3);
            box-shadow: 0 0 0 1px rgb(240 130 10 / 16%);
            transition: background-color 0.18s ease, box-shadow 0.18s ease;
          }

          :deep(.el-select__selected-item) {
            color: #d97706;
            font-size: 12px;
            font-weight: 600;
          }

          :deep(.el-select__caret) {
            color: #d97706;
          }

          &:hover {
            :deep(.el-select__wrapper) {
              background: #ffeed8;
              box-shadow: 0 0 0 1px rgb(240 130 10 / 30%);
            }
          }
        }

        .media-option-values {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px 5px;
          padding: 6px 10px;

          .media-option-chip {
            display: inline-flex;
            align-items: center;
            min-height: 24px;
            padding: 2px 10px;
            border: 0;
            border-radius: 13px;
            background: transparent;
            color: var(--el-text-color-regular);
            cursor: pointer;
            font-size: 12px;
            line-height: 16px;
            transition: color 0.18s ease, background-color 0.18s ease;

            .media-verification-option-icon {
              width: 14px;
              height: 14px;
              flex-shrink: 0;
              margin-right: 3px;
              color: var(--el-text-color-placeholder);

              &.is-yellowV {
                color: var(--el-color-warning);
              }

              &.is-blueV {
                color: var(--el-color-primary);
              }

              &.is-redV {
                color: var(--el-color-danger);
              }

              &.is-orangeV {
                color: #f97316;
              }
            }

            &:hover {
              background-color: rgb(255 157 61 / 10%);
              color: #d97706;
            }

            &.is-active {
              background-color: rgb(255 157 61 / 12%);
              color: #d97706;
              font-weight: 600;
            }
          }

          .media-option-sub-label {
            margin-left: 20px;
            color: var(--el-text-color-secondary);
            font-size: 12px;
            font-weight: 500;
            white-space: nowrap;
          }

          &.media-sort-options {
            gap: 4px 8px;

            .media-sort-option {
              display: inline-flex;
              min-height: 24px;
              align-items: center;
              gap: 3px;
              padding: 2px 8px 2px 10px;
              border: 0;
              border-radius: 13px;
              background: transparent;
              color: var(--el-text-color-regular);
              cursor: pointer;
              font-size: 12px;
              line-height: 16px;
              white-space: nowrap;
              transition: color 0.18s ease, background-color 0.18s ease;

              &:hover {
                background-color: rgb(255 157 61 / 10%);
                color: #d97706;
              }

              &.is-active {
                background-color: rgb(255 157 61 / 12%);
                color: #d97706;
                font-weight: 600;
              }

              .media-sort-triangles {
                display: inline-flex;
                flex-direction: column;
                justify-content: center;
                gap: 0;
                color: var(--el-text-color-placeholder);
                font-size: 10px;
                line-height: 7px;

                .el-icon {
                  height: 7px;

                  &.is-active {
                    color: #d97706;
                  }
                }
              }
            }
          }

          .media-custom-price {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin-left: 4px;

            :deep(.el-input-number) {
              width: 82px;
            }

            :deep(.el-input__wrapper) {
              padding: 0 8px;
              background-color: rgb(255 255 255 / 55%);
              box-shadow: 0 0 0 1px rgb(245 158 11 / 18%) inset;
            }

            :deep(.el-input__wrapper.is-focus) {
              box-shadow: 0 0 0 1px #ffb84d inset;
            }

            .media-custom-price-separator,
            .media-custom-price-unit {
              color: var(--el-text-color-secondary);
              font-size: 12px;
            }

            .media-custom-price-confirm {
              min-height: 24px;
              padding: 2px 9px;
              border: 0;
              border-radius: 13px;
              background-color: transparent;
              color: var(--el-text-color-regular);
              cursor: pointer;
              font-size: 12px;
              line-height: 16px;
              transition: color 0.18s ease, background-color 0.18s ease;

              &:hover:not(:disabled) {
                background-color: rgb(255 157 61 / 10%);
                color: #d97706;
              }

              &:disabled {
                color: var(--el-text-color-placeholder);
                cursor: not-allowed;
              }

              &.is-active {
                background-color: rgb(255 157 61 / 12%);
                color: #d97706;
                font-weight: 600;
              }
            }
          }
        }
      }

    }
  }
}

.favorite-media-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);

  .favorite-media-logo {
    display: flex;
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 12px;
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

  .favorite-media-meta {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 4px;

    .favorite-media-name {
      overflow: hidden;
      color: var(--el-text-color-primary);
      font-size: 14px;
      line-height: 20px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .favorite-media-price {
      color: var(--el-text-color-secondary);
      font-size: 12px;

      em {
        margin: 0 2px;
        color: #f0820a;
        font-style: normal;
        font-weight: 600;
      }
    }
  }
}

.favorite-form {
  margin-top: 14px;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }

  .favorite-form-tip {
    margin-top: 5px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 18px;
  }
}

@media (max-width: 820px) {
  .provider-media-list {
    .media-filter-panel {
      .media-filter-header {
        flex-wrap: wrap;

        .media-filter-spacer {
          display: none;
        }

        .media-search {
          order: 3;
          width: 100%;
          max-width: none;

          :deep(.el-input) {
            width: 100%;
          }
        }

        .media-filter-actions {
          width: 100%;
        }
      }
    }
  }
}
</style>
