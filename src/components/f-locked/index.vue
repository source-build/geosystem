<template>
  <div class="f-locked">
    <div class="card">
      <div class="lock-icon">
        <el-icon :size="42"><Lock /></el-icon>
      </div>
      <h2 class="title">{{ DEMO_CONFIG.fullEdition.title }}</h2>
      <p class="desc">{{ DEMO_CONFIG.fullEdition.description }}</p>

      <div class="features">
        <div class="feature" v-for="f in features" :key="f">
          <el-icon class="dot"><CircleCheckFilled /></el-icon>
          <span>{{ f }}</span>
        </div>
      </div>

      <div class="contact">
        <div class="qrcode" v-if="hasQrcode">
          <el-image
            :src="DEMO_CONFIG.contact.qrcodeUrl"
            fit="cover"
            class="qr-img"
          >
            <template #error>
              <div class="qr-fallback">二维码待配置</div>
            </template>
          </el-image>
          <span class="qr-label">扫码联系</span>
        </div>
        <div class="right">
          <div class="wechat" v-if="DEMO_CONFIG.contact.wechat">
            <span class="label">微信号</span>
            <code class="value">{{ DEMO_CONFIG.contact.wechat }}</code>
            <el-button
              size="small"
              type="primary"
              plain
              @click="copyWechat"
              >复制</el-button
            >
          </div>
          <p class="tip">{{ DEMO_CONFIG.contact.tip }}</p>
          <el-button
            type="primary"
            size="large"
            class="btn"
            @click="copyWechat"
            >获取完整版源码</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts" name="f-locked">
import { DEMO_CONFIG, copyText } from "@/config/demo";
import { showToastOk, showToastFail } from "../f-toast";

withDefaults(defineProps<{ features?: string[] }>(), {
  features: () => [
    "GEO 全网 AI 诊断与报告",
    "AI 文章批量创作流水线",
    "多渠道一键发布引擎",
    "知识库与素材中心",
    "多租户与计费系统",
  ],
});

const hasQrcode = DEMO_CONFIG.contact.qrcodeUrl !== "";

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
.f-locked {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;

  .card {
    width: 100%;
    max-width: 620px;
    background: #fff;
    border-radius: 16px;
    padding: 40px 44px;
    box-shadow:
      0 16px 32px rgba(27, 36, 44, 0.06),
      0 0 0 1px rgba(27, 36, 44, 0.04);
    text-align: center;

    .lock-icon {
      width: 84px;
      height: 84px;
      margin: 0 auto 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      background: linear-gradient(
        135deg,
        var(--el-color-primary),
        var(--el-color-primary-light-3)
      );
      box-shadow: 0 8px 20px rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.35);
    }

    .title {
      margin: 0 0 10px;
      font-size: 22px;
      font-weight: 600;
      color: #1d2432;
    }

    .desc {
      margin: 0 auto 22px;
      max-width: 480px;
      font-size: 14px;
      line-height: 1.8;
      color: #606266;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 10px 18px;
      margin-bottom: 26px;
      text-align: left;

      .feature {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #272e35;
        background: var(--el-color-primary-light-9, #f5f7fa);
        border-radius: 8px;
        padding: 9px 12px;

        .dot {
          color: var(--el-color-primary);
          flex-shrink: 0;
        }
      }
    }

    .contact {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 32px;
      padding-top: 22px;
      border-top: 1px dashed #e5e7eb;

      .qrcode {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;

        .qr-img {
          width: 148px;
          height: 148px;
          border-radius: 10px;
          border: 1px solid #eceef5;
        }

        .qr-fallback {
          width: 148px;
          height: 148px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #909399;
          background: #f5f7fa;
          border-radius: 10px;
        }

        .qr-label {
          font-size: 12px;
          color: #909399;
        }
      }

      .right {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;

        .wechat {
          display: flex;
          align-items: center;
          gap: 10px;

          .label {
            font-size: 13px;
            color: #909399;
          }

          .value {
            font-size: 15px;
            font-weight: 600;
            color: var(--el-color-primary);
            background: var(--el-color-primary-light-9, #f5f7fa);
            padding: 3px 10px;
            border-radius: 6px;
          }
        }

        .tip {
          margin: 0;
          font-size: 12px;
          color: #909399;
        }

        .btn {
          width: 100%;
        }
      }
    }
  }
}
</style>
