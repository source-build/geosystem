<template>
  <!-- 加载中弹窗 -->
  <div class="f-loading-container" v-if="props.type == 'loading'">
    <div class="loading-box">
      <span class="loader"></span>
      <span class="message">{{ props.msg }}</span>
    </div>
  </div> 

  <!-- 成功弹窗 -->
  <div v-if="props.type == 'success'" class="f-success-toast" ref="toastDOM">
    <div class="success__icon">
      <svg
        fill="none"
        height="20"
        width="20"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clip-rule="evenodd"
          d="m12 1c-6.075 0-11 4.925-11 11s4.925 11 11 11 11-4.925 11-11-4.925-11-11-11zm4.768 9.14c.0878-.1004.1546-.21726.1966-.34383.0419-.12657.0581-.26026.0477-.39319-.0105-.13293-.0475-.26242-.1087-.38085-.0613-.11844-.1456-.22342-.2481-.30879-.1024-.08536-.2209-.14938-.3484-.18828s-.2616-.0519-.3942-.03823c-.1327.01366-.2612.05372-.3782.1178-.1169.06409-.2198.15091-.3027.25537l-4.3 5.159-2.225-2.226c-.1886-.1822-.4412-.283-.7034-.2807s-.51301.1075-.69842.2929-.29058.4362-.29285.6984c-.00228.2622.09851.5148.28067.7034l3 3c.0983.0982.2159.1748.3454.2251.1295.0502.2681.0729.4069.0665.1387-.0063.2747-.0414.3991-.1032.1244-.0617.2347-.1487.3236-.2554z"
          fill-rule="evenodd"
        ></path>
      </svg>
    </div>
    <span class="message">{{ props.msg }}</span>
  </div>

  <!-- 失败弹窗 -->
  <div v-if="props.type == 'fail'" class="f-fail-toast" ref="toastDOM">
    <div class="fail__icon">
      <svg viewBox="0 0 20 20" width="22" height="22">
        <path
          clip-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          fill-rule="evenodd"
        ></path>
      </svg>
    </div>

    <span class="message">{{ props.msg }}</span>
  </div>
</template>
<script setup lang="ts" name="f-toast">
const props = defineProps({
  msg: {
    type: String,
    default: "这是一条提示消息",
  },
  type: {
    type: String,
    default: "success",
  },
});
</script>
<style lang="scss" scoped>
.f-loading-container,
.f-success-toast,
.f-fail-toast {
  pointer-events: auto;
  user-select: text;
  -webkit-user-select: text;
}

.f-loading-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.04);
  z-index: 5000;
  animation: f-animation-show 0.5s;
  animation-fill-mode: forwards;
  opacity: 0;

  .loading-box {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    background-color: #ffffff;
    border-radius: 50px;
    box-shadow: 0px 0px 5px -3px #11111148;
    animation: loadingBoxSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
      forwards;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    padding: 12px 20px;
    max-width: 500px;
    justify-content: center;

    .loader {
      border: 2px dotted #ff3d00;
      border-style: solid solid dotted;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      animation: rotationBack 1s linear infinite;
      transform-origin: center center;
    }

    @keyframes rotationBack {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(-360deg);
      }
    }

    .message {
      font-size: 15px;
      margin-left: 10px;
      color: #4a4b57;
      display: inline-block;
      word-break: break-all;
      line-height: 1.4;
    }

    .close_btn {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 20px;
      height: 20px;
      cursor: pointer;
      background-color: white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .close_btn:hover {
      transform: scale(1.1);
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2);
    }
  }
}

.f-success-toast {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  border-radius: 50px;
  padding: 10px 20px;
  max-width: 500px;
  animation: toastSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transition: top 0.3s ease, opacity 0.3s ease;
  background-color: var(--el-color-success);
  box-shadow: 0px 0px 5px 3px #21ba4532;
  z-index: 5000;
  border: 1px solid #ffffff1e;

  .success__icon path {
    fill: #fff;
  }

  .message {
    margin-left: 8px;
    font-weight: 500;
    font-size: 14px;
    color: #fff;
    word-break: break-all;
    line-height: 1.4;
  }
}

.f-fail-toast {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  border-radius: 50px;
  padding: 10px 15px;
  max-width: 500px;
  animation: toastSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transition: top 0.3s ease, opacity 0.3s ease;
  background-color: var(--el-color-danger);
  box-shadow: 0px 0px 5px 3px #db282832;
  z-index: 5000;
  border: 1px solid #ffffff1e;

  .fail__icon path {
    fill: #fff;
  }

  .message {
    margin-left: 5px;
    font-weight: 500;
    font-size: 14px;
    color: #fff;
    word-break: break-all;
    line-height: 1.4;
  }
}

@keyframes loadingBoxSlideIn {
  from {
    top: -20px;
    opacity: 0;
    transform: translateX(-50%) scale(0.9);
  }
  to {
    top: 50px;
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

@keyframes f-animation-show {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
