<template>
  <div class="login-page">
    <video
      class="login-video"
      src="/login-video.mp4"
      autoplay
      muted
      loop
      playsinline
      aria-hidden="true"
    ></video>
    <div class="login-container">
      <div class="content">
        <div class="main">
          <div class="header">
            <img src="/logo-text-dark.png" class="logo" />
            <div class="desc-box">
              <span>全域覆盖能力，让品牌内容穿透 AI 检索壁垒 🌿</span>
            </div>
          </div>
          <form class="form">
            <el-carousel
              ref="carouselEl"
              :autoplay="false"
              :loop="false"
              indicator-position="none"
              arrow="never"
              height="280px"
              :initial-index="carouselIndex"
            >
              <el-carousel-item>
                <div class="form-item">
                  <div class="flex-column">
                    <label>账号 </label>
                  </div>
                  <div class="inputForm">
                    <svg
                      height="18"
                      viewBox="0 0 32 32"
                      width="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="Layer_3" data-name="Layer 3">
                        <path
                          d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"
                        ></path>
                      </g>
                    </svg>
                    <input
                      type="text"
                      class="input"
                      v-model.trim="ruleForm.identifier"
                      placeholder="请输入账号"
                      maxlength="20"
                    />
                  </div>
                  <div class="flex-column">
                    <label>密码 </label>
                  </div>
                  <div class="inputForm">
                    <svg
                      height="18"
                      viewBox="-64 0 512 512"
                      width="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"
                      ></path>
                      <path
                        d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"
                      ></path>
                    </svg>
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      class="input"
                      placeholder="请输入密码"
                      v-model.trim="ruleForm.pwd"
                      maxlength="255"
                    />
                    <svg
                      viewBox="0 0 576 512"
                      height="1em"
                      xmlns="http://www.w3.org/2000/svg"
                      style="user-select: none"
                      class="cursor-pointer"
                      @click="showPassword = !showPassword"
                    >
                      <path
                        d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"
                      ></path>
                    </svg>
                  </div>
                  <div class="flex-row">
                    <div class="flex items-center"></div>
                    <span
                      class="span"
                      @click="showToast('请联系技术人员协助处理')"
                      >忘记密码?</span
                    >
                  </div>
                  <button
                    class="animation-show button-submit"
                    :disabled="loading"
                    @click="submitForm"
                    type="button"
                  >
                    <f-loading size="18px" color="white" v-if="loading" />
                    <template v-else>
                      <img src="/logo.png" class="h-[18px] cover" />
                      <span>登录</span>
                    </template>
                  </button>
                </div>
              </el-carousel-item>
              <el-carousel-item>
                <div class="wx-login-container">
                  <div class="qrcode-container" v-if="!qrCodeExpired">
                    <div v-if="qrCodeLoading" class="qr-loading">
                      <f-loading size="30px" />
                      <p>正在获取二维码...</p>
                    </div>
                    <div v-else-if="qrCodeUrl" class="qr-code">
                      <img :src="qrCodeUrl" alt="微信扫码登录" />
                      <p v-if="scanStatus === '0'">请使用微信扫描二维码登录</p>
                      <p
                        v-else-if="scanStatus === 'scanned'"
                        class="scanned-text"
                      >
                        已扫码，请在手机上确认登录
                      </p>
                      <p v-else>请使用微信扫描二维码登录</p>
                    </div>
                    <div v-else-if="hasInitialized" class="qr-error">
                      <p>获取二维码失败</p>
                      <el-button type="primary" @click="getQrCode"
                        >重新获取</el-button
                      >
                    </div>
                  </div>
                  <div class="qrcode-container" v-else>
                    <div class="qr-expired">
                      <p>二维码已过期</p>
                      <el-button type="primary" @click="refreshQrCode"
                        >刷新二维码</el-button
                      >
                    </div>
                  </div>
                </div>
              </el-carousel-item>
            </el-carousel>

            <p class="p line" style="font-size: 13px">其他登录方式</p>
            <div class="flex-row">
              <button
                class="btn google animation-show"
                v-if="carouselIndex === 0"
                type="button"
                @click="switchLoginMethod(1)"
              >
                <f-svg-icon name="wx" size="22" />扫码登录
              </button>
              <button
                v-if="carouselIndex === 1"
                class="btn google animation-show"
                type="button"
                @click="switchLoginMethod(0)"
              >
                <img src="/logo.png" class="h-[18px] cover" />账号登录
              </button>
              <button
                class="btn apple"
                type="button"
                @click="showToast('暂不支持')"
              >
                <f-svg-icon name="phone" size="25" />

                手机号登录
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { FormInstance } from "element-plus";
import {
  adminLogin,
  getRootAdminWxAuthLoginQrCode,
  checkRootLoginWxQrCodeStatus,
  rootWxQrCodeLogin,
} from "@/api/login";
import { setTokenToLocalStore, setUserInfoToLocalStore } from "@/utils/auth";
import { useMenuStore } from "@/store/menu";
import {
  getBrowserInfo,
  getOperatingSystem,
  generateBrowserFingerprint,
} from "@/utils/deviceInfo";
import { initSSE } from "@/sse/sse";

const appName = import.meta.env.VITE_APP_NAME;
// 浏览器信息
const browserInfo = getBrowserInfo();
const browserName = `${getOperatingSystem()} ${browserInfo.name}/${
  browserInfo.version
}`;

const carouselIndex = ref(0); // 0-账号密码登录 1-扫码登录
const carouselEl = ref<any>(null);
const router = useRouter();
// 是否显示密码
const showPassword = ref(false);
// 登录loading
const loading = ref(false);
// 菜单
const menuStore = useMenuStore();
const ruleFormRef: any = ref<FormInstance>();
const ruleForm = reactive({
  identifier: "",
  pwd: "",
});

// 微信扫码登录相关变量
const qrCodeUrl = ref(""); // 二维码URL
const qrCodeId = ref(""); // 二维码ID
const qrCodeLoading = ref(false); // 二维码加载状态
const qrCodeExpired = ref(false); // 二维码是否过期
const checkTimer = ref<any>(null); // 定时器
const checkCount = ref(0); // 查询次数计数器
const MAX_CHECK_COUNT = 10; // 最大查询次数 (30秒/3秒)
const scanStatus = ref(""); // 扫码状态: "0"-未扫码, "scanned"-已扫码确认中
const hasInitialized = ref(false); // 是否已经初始化完成

const showToast = (msg: string) => {
  showToastFail(msg);
};

/** 获取微信登录二维码 */
const getQrCode = async () => {
  qrCodeLoading.value = true;
  qrCodeExpired.value = false;
  checkCount.value = 0;
  scanStatus.value = "0"; // 重置扫码状态为未扫码
  hasInitialized.value = true; // 标记为已初始化

  try {
    const { data: response } = await getRootAdminWxAuthLoginQrCode();
    if (response.result) {
      qrCodeUrl.value = `data:image/png;base64,${response.result.qrcode}`;
      qrCodeId.value = response.result.id;

      // 开始轮询检查扫码状态
      startCheckQrCodeStatus();
    } else {
      showToastFail("获取二维码失败");
    }
  } catch (error: any) {
    showToastFail(error.err_msg || "获取二维码失败");
  } finally {
    qrCodeLoading.value = false;
  }
};
/** 开始检查二维码状态 */
const startCheckQrCodeStatus = () => {
  // 清除之前的定时器
  clearCheckTimer();
  // 立即检查一次
  checkQrCodeStatus();
  // 设置定时器，每3秒检查一次
  checkTimer.value = setInterval(() => {
    checkCount.value++;
    if (checkCount.value >= MAX_CHECK_COUNT) {
      // 超过最大检查次数，二维码过期
      qrCodeExpired.value = true;
      clearCheckTimer();
      return;
    }
    checkQrCodeStatus();
  }, 3000);
};
/** 检查二维码状态 */
const checkQrCodeStatus = async () => {
  if (!qrCodeId.value) return;

  try {
    const { data: response } = await checkRootLoginWxQrCodeStatus(
      qrCodeId.value,
    );
    const status = response.result;

    if (status === 1) {
      // 扫码成功，可以进行登录
      clearCheckTimer();
      await handleWxLogin();
    } else if (status === 2) {
      // 租户未绑定微信
      clearCheckTimer();
      showToastFail("无法登录，未绑定微信");
    } else if (status === 3) {
      // 二维码不存在
      clearCheckTimer();
      qrCodeExpired.value = true;
    } else if (status === 0) {
      // 用户还未扫码，继续轮询
      scanStatus.value = "0";
    }
    // 状态为其他值或空值时，继续轮询
  } catch (error: any) {
    console.error("检查二维码状态失败:", error);
    // 不清除定时器，继续尝试
  }
};
/** 处理微信登录 */
const handleWxLogin = async () => {
  loading.value = true;
  const fingerprint = (await generateBrowserFingerprint()).fingerprint;

  try {
    const loginData = {
      env_type: "WEB",
      device_id: fingerprint,
      device_name: browserName,
    };

    const { data: response } = await rootWxQrCodeLogin(
      qrCodeId.value,
      loginData,
    );
    setTokenToLocalStore(response.result.token);
    setUserInfoToLocalStore(response.result.user);
    initSSE();
    showToastOk("登录成功");
    // 刷新页面到首页，确保清除旧状态
    setTimeout(() => {
      window.location.href = import.meta.env.BASE_URL + "admin/dashboard";
    }, 500);
  } catch (error: any) {
    showToastFail(error.err_msg || "登录失败");
    // 登录失败，重新获取二维码
    getQrCode();
  } finally {
    loading.value = false;
  }
};
/** 清除定时器 */
const clearCheckTimer = () => {
  if (checkTimer.value) {
    clearInterval(checkTimer.value);
    checkTimer.value = null;
  }
};
/** 刷新二维码 */
const refreshQrCode = () => {
  clearCheckTimer();
  getQrCode();
};

const submitForm = async () => {
  if (!ruleForm.identifier) {
    showToastFail("请输入用户名");
    return;
  }

  ruleForm.identifier = ruleForm.identifier.trim();
  ruleForm.pwd = ruleForm.pwd.trim();

  if (!/^[a-zA-Z0-9_]+$/.test(ruleForm.identifier)) {
    showToastFail("用户名只能包含字母、数字和下划线");
    return;
  }
  if (ruleForm.identifier.length < 5 || ruleForm.identifier.length > 20) {
    showToastFail("用户名长度必须在5-20位之间");
    return;
  }

  if (!ruleForm.pwd) {
    showToastFail("请输入密码");
    return;
  }

  if (!/^[a-zA-Z0-9_]+$/.test(ruleForm.pwd)) {
    showToastFail("密码只能包含字母、数字和下划线");
    return;
  }

  if (ruleForm.pwd.length < 6 || ruleForm.pwd.length > 255) {
    showToastFail("密码长度必须在6-255位之间");
    return;
  }

  loading.value = true;
  const fingerprint = (await generateBrowserFingerprint()).fingerprint;
  try {
    const { data: response } = await adminLogin({
      identifier: ruleForm.identifier,
      pwd: ruleForm.pwd,
      env_type: "WEB",
      device_id: fingerprint,
      device_name: browserName,
    });
    setTokenToLocalStore(response.result.token);
    setUserInfoToLocalStore(response.result.user);
    showToastOk("登录成功");
    // 刷新页面到首页，确保清除旧状态
    setTimeout(() => {
      window.location.href = import.meta.env.BASE_URL + "admin/dashboard";
    }, 500);
  } catch (error: any) {
    showToastFail(error.err_msg);
  } finally {
    loading.value = false;
  }
};
const resetForm = () => {
  if (!ruleFormRef.value) return;
  ruleFormRef.value.resetFields();
};
const onEnter = (e: any) => {
  if (e.keyCode == 13) {
    submitForm();
  }
};
/** 切换登录方式 */
const switchLoginMethod = (index: number) => {
  carouselIndex.value = index;
  carouselEl.value.setActiveItem(index);

  // 如果切换到扫码登录，获取二维码
  if (index === 1) {
    nextTick(() => {
      getQrCode();
    });
  } else {
    // 如果切换到账号登录，清除定时器
    clearCheckTimer();
  }
};

onMounted(() => {
  menuStore.logoutTagHandler();
  window.addEventListener("keydown", onEnter);
});
onUnmounted(() => {
  window.removeEventListener("keydown", onEnter);
  // 组件卸载时清除定时器
  clearCheckTimer();
});
</script>
<style lang="scss" scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  background: #05070d;
}

.login-video {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  object-fit: cover;
  object-position: 70% center;
}

.login-container {
  position: fixed;
  z-index: 2;
  top: 50%;
  right: 8%;
  transform: translateY(-50%) scale(0.98);
  opacity: 0;
  transition: all 0.5s;
  animation: container-show 0.5s ease-in;
  animation-fill-mode: forwards;

  .content {
    box-shadow: 0 24px 70px rgb(0 0 0 / 38%);
    border: 1px solid rgb(255 255 255 / 24%);
    border-radius: 24px;
    display: flex;
    overflow: hidden;
    transition: all 0.5s;
    background: rgb(255 255 255 / 10%);
    backdrop-filter: blur(18px);

    .main {
      position: relative;
      padding: 10px 30px;
      background: #fff;

      .header {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px 0;
        padding-bottom: 10px;

        .logo {
          height: 65px;
        }

        .desc-box {
          font-size: 13px;
          color: #44525fc7;
          margin-top: 10px;
        }
      }
    }
  }
}

@keyframes container-show {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
  margin-bottom: 20px;
  width: 400px;

  .form-item {
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
      Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

.wx-login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 250px;
  height: 250px;
}

.qr-loading,
.qr-error,
.qr-expired {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;

  p {
    margin: 10px 0;
    color: #666;
  }
}

.qr-code {
  display: flex;
  flex-direction: column;
  align-items: center;

  img {
    width: 250px;
    height: 250px;
    border: 1px solid #eee;
    border-radius: 8px;
  }

  p {
    margin-top: 10px;
    color: #666;
    font-size: 14px;
  }

  .scanned-text {
    color: #409eff;
    font-weight: 500;
  }
}

::placeholder {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
    Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}

.form button {
  align-self: flex-end;
}

.flex-column > label {
  color: #151717;
  font-weight: 600;
}

.inputForm {
  position: relative;
  border: 1.5px solid #ecedec;
  border-radius: 10px;
  height: 47px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  transition: 0.2s ease-in-out;

  .loading {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 50px;
    background-color: #fff;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.input {
  margin-left: 10px;
  border-radius: 10px;
  border: none;
  width: 85%;
  height: 100%;
}

.input:focus {
  outline: none;
}

.inputForm:focus-within {
  border: 1.5px solid var(--el-color-primary);
}

.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
}

.flex-row > div > label {
  font-size: 14px;
  color: black;
  font-weight: 400;
}

.span {
  font-size: 14px;
  margin-left: 5px;
  color: var(--el-color-primary);
  font-weight: 500;
  cursor: pointer;
}

.button-submit {
  margin: 20px 0 10px 0;
  background-color: #151717;
  border: none;
  color: white;
  font-size: 15px;
  font-weight: 500;
  border-radius: 10px;
  height: 50px;
  width: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 10px;
  transition: all 0.3s ease-in-out;

  &:active {
    transform: scale(0.98);
  }
}

.button-submit:hover {
  background-color: #252727;
}

.p {
  text-align: center;
  color: black;
  font-size: 14px;
  margin: 5px 0;
}

.btn {
  margin-top: 10px;
  width: 100%;
  height: 50px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  gap: 10px;
  border: 1px solid #ededef;
  background-color: white;
  cursor: pointer;
  transition: 0.2s ease-in-out;
}

.btn:hover {
  border: 1px solid var(--el-color-primary);
}

@media screen and (max-width: 600px) {
  .login-container {
    right: 12px;
    left: 12px;
    width: auto;

    .content {
      width: 100%;
      border-radius: 20px;

      .main {
        width: 100%;
        padding: 8px 18px;
      }
    }
  }

  .form {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-video {
    display: none;
  }

  .login-page {
    background: #111827;
  }

  .login-container {
    animation: none;
    opacity: 1;
    transform: translateY(-50%);
  }
}
</style>
