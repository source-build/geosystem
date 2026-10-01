<template>
  <div class="f-contact" v-if="DEMO_CONFIG.enabled">
    <transition name="f-contact-fade">
      <div
        class="panel"
        v-show="panelVisible"
        @mouseleave="panelVisible = false"
      >
        <div class="panel-title">{{ DEMO_CONFIG.cta.getFullEdition }}</div>
        <el-image
          v-if="DEMO_CONFIG.contact.qrcodeUrl"
          :src="DEMO_CONFIG.contact.qrcodeUrl"
          fit="cover"
          class="panel-qr"
        >
          <template #error>
            <div class="panel-qr-fallback">二维码待配置</div>
          </template>
        </el-image>
        <div class="panel-wechat" v-if="DEMO_CONFIG.contact.wechat">
          <code>{{ DEMO_CONFIG.contact.wechat }}</code>
          <el-button link type="primary" size="small" @click="copyWechat"
            >复制</el-button
          >
        </div>
        <div class="panel-tip">{{ DEMO_CONFIG.contact.tip }}</div>
      </div>
    </transition>

    <button
      class="fab"
      @mouseenter="panelVisible = true"
      @click="panelVisible = !panelVisible"
      aria-label="获取完整版源码"
    >
      <el-icon :size="20"><Service /></el-icon>
      <span class="fab-label">完整版</span>
    </button>
  </div>
</template>
<script setup lang="ts" name="f-contact">
import { DEMO_CONFIG, copyText } from "@/config/demo";

const panelVisible = ref(false);

const copyWechat = async () => {
  const ok = await copyText(DEMO_CONFIG.contact.wechat);
  if (ok) {
    showToastOk(`已复制微信号：${DEMO_CONFIG.contact.wechat}`);
  } else {
    showToastFail("复制失败，请手动复制");
  }
};
</script>
<style lang="scss" scoped>
.f-contact {
  position: fixed;
  right: 24px;
  bottom: 32px;
  z-index: 2000;

  .fab {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    width: 60px;
    height: 60px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    color: #fff;
    background: linear-gradient(
      135deg,
      var(--el-color-primary),
      var(--el-color-primary-light-3)
    );
    box-shadow: 0 8px 24px rgba(27, 36, 44, 0.18);
    transition:
      transform 0.2s,
      box-shadow 0.2s;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 28px rgba(27, 36, 44, 0.24);
    }

    .fab-label {
      font-size: 11px;
      line-height: 1;
    }
  }

  .panel {
    position: absolute;
    right: 0;
    bottom: 72px;
    width: 232px;
    background: #fff;
    border-radius: 14px;
    padding: 18px;
    text-align: center;
    box-shadow:
      0 16px 32px rgba(27, 36, 44, 0.1),
      0 0 0 1px rgba(27, 36, 44, 0.04);

    .panel-title {
      font-size: 15px;
      font-weight: 600;
      color: #1d2432;
      margin-bottom: 12px;
    }

    .panel-qr {
      width: 150px;
      height: 150px;
      border-radius: 10px;
      border: 1px solid #eceef5;
    }

    .panel-qr-fallback {
      width: 150px;
      height: 150px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #909399;
      background: #f5f7fa;
      border-radius: 10px;
    }

    .panel-wechat {
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;

      code {
        font-size: 13px;
        font-weight: 600;
        color: var(--el-color-primary);
      }
    }

    .panel-tip {
      margin-top: 8px;
      font-size: 11px;
      line-height: 1.6;
      color: #909399;
    }
  }

  .f-contact-fade-enter-active,
  .f-contact-fade-leave-active {
    transition:
      opacity 0.2s,
      transform 0.2s;
  }

  .f-contact-fade-enter-from,
  .f-contact-fade-leave-to {
    opacity: 0;
    transform: translateY(8px);
  }
}
</style>
