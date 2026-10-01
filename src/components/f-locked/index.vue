<template>
  <div class="f-locked">
    <div class="card">
      <div class="preview-label"><el-icon><Lock /></el-icon>完整版能力预览</div>
      <div class="lock-icon">
        <el-icon :size="36"><component :is="moduleIcon" /></el-icon>
      </div>
      <p class="category">{{ moduleConfig.category }}</p>
      <h2 class="title">{{ pageTitle }}</h2>
      <p class="desc">{{ moduleConfig.description }}</p>
      <p class="edition-note">{{ DEMO_CONFIG.fullEdition.description }}</p>

      <div class="features">
        <div v-for="feature in displayFeatures" :key="feature" class="feature">
          <el-icon class="dot"><CircleCheckFilled /></el-icon>
          <span>{{ feature }}</span>
        </div>
      </div>

      <div class="experience-actions">
        <el-button type="primary" @click="goDiagnosis">
          <el-icon><Aim /></el-icon>{{ DEMO_CONFIG.cta.continueExperience }}
        </el-button>
        <el-button @click="goReports">{{ DEMO_CONFIG.cta.viewReports }}</el-button>
      </div>

      <div class="contact">
        <div v-if="hasQrcode" class="qrcode">
          <el-image :src="DEMO_CONFIG.contact.qrcodeUrl" fit="cover" class="qr-img">
            <template #error><div class="qr-fallback">二维码待配置</div></template>
          </el-image>
          <span class="qr-label">扫码联系获取完整版</span>
        </div>
        <div class="right">
          <div v-if="DEMO_CONFIG.contact.wechat" class="wechat">
            <span class="label">微信号</span>
            <code class="value">{{ DEMO_CONFIG.contact.wechat }}</code>
            <el-button size="small" type="primary" plain @click="copyWechat">复制</el-button>
          </div>
          <p class="tip">{{ DEMO_CONFIG.contact.tip }}</p>
          <el-button type="primary" size="large" class="btn" @click="copyWechat">
            {{ DEMO_CONFIG.cta.getFullEdition }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="f-locked">
import { DEMO_CONFIG, copyText, getLockedModuleConfig } from "@/config/demo";
import { showToastOk, showToastFail } from "../f-toast";

const props = defineProps<{ features?: string[] }>();
const route = useRoute();
const router = useRouter();

const pageTitle = computed(() => String(route.meta.title || "当前功能"));
const moduleConfig = computed(() => getLockedModuleConfig(pageTitle.value));
const displayFeatures = computed(() => props.features || moduleConfig.value.features);
const moduleIcon = computed(() => {
  const category = moduleConfig.value.category;
  if (category.includes("内容")) return "EditPen";
  if (category.includes("知识")) return "Collection";
  if (category.includes("发布")) return "Promotion";
  if (category.includes("商业")) return "DataLine";
  if (category.includes("系统")) return "Setting";
  return "Connection";
});
const hasQrcode = DEMO_CONFIG.contact.qrcodeUrl !== "";

const goDiagnosis = () => router.push("/biz/diagnosis/aiDiagnosis");
const goReports = () => router.push("/biz/diagnosis/aiDiagnosisReport");
const copyWechat = async () => {
  const ok = await copyText(DEMO_CONFIG.contact.wechat);
  if (ok) showToastOk(`已复制微信号：${DEMO_CONFIG.contact.wechat}`);
  else showToastFail("复制失败，请手动复制");
};
</script>

<style lang="scss" scoped>
.f-locked {
  display: flex;
  width: 100%;
  min-height: 100%;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 50% 10%, var(--el-color-primary-light-9), transparent 36%),
    var(--el-fill-color-extra-light);
}

.card {
  position: relative;
  width: 100%;
  max-width: 720px;
  padding: 34px 42px 38px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 20px;
  background: var(--el-bg-color);
  box-shadow: 0 20px 50px rgba(27, 36, 44, 0.08);
  text-align: center;
}

.preview-label {
  position: absolute;
  top: 18px;
  right: 20px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border-radius: 20px;
  color: var(--el-color-warning-dark-2);
  background: var(--el-color-warning-light-9);
  font-size: 10px;
  font-weight: 600;
}

.lock-icon {
  display: flex;
  width: 74px;
  height: 74px;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
  border-radius: 22px;
  color: #fff;
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
  box-shadow: 0 10px 24px rgba(64, 128, 255, 0.24);
}

.category { margin: 0 0 5px; color: var(--el-color-primary); font-size: 11px; font-weight: 700; letter-spacing: 1px; }
.title { margin: 0 0 9px; color: var(--el-text-color-primary); font-size: 24px; font-weight: 650; }
.desc { max-width: 560px; margin: 0 auto; color: var(--el-text-color-regular); font-size: 14px; line-height: 1.8; }
.edition-note { max-width: 590px; margin: 8px auto 20px; color: var(--el-text-color-placeholder); font-size: 11px; line-height: 1.7; }

.features {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 20px;
  text-align: left;
}

.feature {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 9px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-extra-light);
  font-size: 12px;

  .dot { flex-shrink: 0; color: var(--el-color-primary); }
}

.experience-actions { display: flex; justify-content: center; gap: 10px; margin-bottom: 24px; }

.contact {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  padding-top: 22px;
  border-top: 1px dashed var(--el-border-color);
}

.qrcode {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 7px;

  .qr-img,
  .qr-fallback { width: 128px; height: 128px; border: 1px solid var(--el-border-color-lighter); border-radius: 10px; }
  .qr-fallback { display: flex; align-items: center; justify-content: center; color: var(--el-text-color-placeholder); background: var(--el-fill-color-light); font-size: 11px; }
  .qr-label { color: var(--el-text-color-placeholder); font-size: 10px; }
}

.right { display: flex; min-width: 240px; align-items: flex-start; flex-direction: column; gap: 11px; }
.wechat { display: flex; align-items: center; gap: 9px; }
.label { color: var(--el-text-color-placeholder); font-size: 12px; }
.value { padding: 3px 9px; border-radius: 6px; color: var(--el-color-primary); background: var(--el-color-primary-light-9); font-size: 14px; font-weight: 700; }
.tip { margin: 0; color: var(--el-text-color-placeholder); font-size: 11px; text-align: left; }
.btn { width: 100%; }

@media (max-width: 640px) {
  .f-locked { align-items: flex-start; padding: 12px; }
  .card { padding: 64px 18px 24px; }
  .features { grid-template-columns: 1fr; }
  .experience-actions { flex-direction: column; }
  .experience-actions :deep(.el-button) { width: 100%; margin-left: 0; }
  .contact { flex-direction: column; gap: 18px; }
  .right { width: 100%; min-width: 0; align-items: center; }
  .tip { text-align: center; }
}
</style>
