<template>
  <el-dialog
    :model-value="modelValue"
    title="构建站点"
    width="430px"
    align-center
    append-to-body
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="quote" class="build-dialog">
      <div class="summary-row">
        <span>网站名称</span>
        <strong :title="projectName">{{ projectName || "-" }}</strong>
      </div>
      <div class="summary-row">
        <span>当前版本</span>
        <strong>{{ version ? `v${version}` : "尚未构建" }}</strong>
      </div>
      <div class="summary-row">
        <span>页面数量</span>
        <strong>
          {{ quote.pages }} 页
          <em v-if="quote.extra_pages > 0">（含 {{ quote.free_pages }} 页 + 超 {{ quote.extra_pages }} 页）</em>
        </strong>
      </div>

      <div class="fee-block">
        <div class="fee-row">
          <span>构建基础价</span>
          <span>{{ quote.base_price }} 算力</span>
        </div>
        <div v-if="quote.extra_pages > 0" class="fee-row">
          <span>超页费用（{{ quote.extra_page_price }} × {{ quote.extra_pages }}）</span>
          <span>{{ quote.extra_page_price * quote.extra_pages }} 算力</span>
        </div>
        <div class="fee-row">
          <span>可用算力余额</span>
          <span :class="{ 'is-insufficient': insufficient }">{{ balance ?? "-" }} 算力</span>
        </div>
        <div class="fee-total">
          <span>本次消耗</span>
          <strong>{{ quote.amount > 0 ? `${quote.amount} 算力` : "免费" }}</strong>
        </div>
      </div>

      <p v-if="insufficient" class="fee-warning">算力余额不足，请先充值后再构建。</p>
      <p class="fee-hint">构建成功后生成新版本；构建失败或取消将全额退回算力。域名绑定与正式上线将在后续版本提供。</p>
    </div>

    <template #footer>
      <el-button :disabled="building" @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="building" :disabled="insufficient" @click="emit('confirm')">开始构建</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";

export interface SiteBuildQuote {
  pages: number;
  free_pages: number;
  extra_pages: number;
  base_price: number;
  extra_page_price: number;
  amount: number;
}

const props = defineProps<{ modelValue: boolean; quote?: SiteBuildQuote; projectName?: string; version?: number; balance?: number; building: boolean }>();
const emit = defineEmits<{ (event: "update:modelValue", value: boolean): void; (event: "confirm"): void }>();

/** 算力余额是否不足以支付本次发布 */
const insufficient = computed(() => props.balance !== undefined && props.quote !== undefined && props.balance < props.quote.amount);
</script>

<style lang="scss" scoped>
.build-dialog {
  .summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 7px 0;

    & + .summary-row {
      border-top: 1px dashed var(--el-border-color-lighter);
    }

    span {
      flex-shrink: 0;
      color: var(--el-text-color-secondary);
      font-size: 13px;
    }

    strong {
      overflow: hidden;
      color: var(--el-text-color-primary);
      font-size: 13px;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;

      em {
        color: var(--el-text-color-secondary);
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
      }
    }
  }

  .fee-block {
    margin-top: 12px;
    padding: 12px 14px;
    border-radius: 10px;
    background: var(--el-fill-color-lighter);

    .fee-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 3px 0;
      color: var(--el-text-color-secondary);
      font-size: 12px;

      .is-insufficient {
        color: var(--el-color-danger);
        font-weight: 600;
      }
    }

    .fee-total {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed var(--el-border-color);

      span {
        color: var(--el-text-color-primary);
        font-size: 13px;
      }

      strong {
        color: var(--el-color-primary);
        font-size: 16px;
        font-weight: 700;
      }
    }
  }

  .fee-warning {
    margin: 10px 0 0;
    color: var(--el-color-danger);
    font-size: 12px;
    line-height: 16px;
  }

  .fee-hint {
    margin: 10px 0 0;
    color: var(--el-text-color-secondary);
    font-size: 11px;
    line-height: 16px;
  }
}
</style>
