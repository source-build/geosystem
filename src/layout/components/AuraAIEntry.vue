<template>
  <button type="button" class="aura-btn" title="预览 GEO AI 内容创作能力" @click="goAura">
    <span class="aura-icon">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path class="spark-main"
          d="M12 2.2c.3 3.5 1.9 5.1 5.4 5.4-3.5.3-5.1 1.9-5.4 5.4-.3-3.5-1.9-5.1-5.4-5.4 3.5-.3 5.1-1.9 5.4-5.4z" />
        <path class="spark-sub"
          d="M18.6 13.4c.2 1.9 1 2.7 2.9 2.9-1.9.2-2.7 1-2.9 2.9-.2-1.9-1-2.7-2.9-2.9 1.9-.2 2.7-1 2.9-2.9z" />
      </svg>
    </span>
    <span class="aura-text">
      <span class="t1">GEO内容创作</span>
      <span class="t2">完整版预览</span>
    </span>
    <span class="aura-arrow" aria-hidden="true">→</span>
    <div class="container-stars">
      <div class="stars"></div>
    </div>
    <div class="glow">
      <div class="circle"></div>
      <div class="circle"></div>
    </div>
  </button>
</template>

<script setup lang="ts" name="AuraAIEntry">
import { useRouter } from "vue-router";

const router = useRouter();

/** 进入可浏览、不可提交的意境 AI 公开预览区 */
const goAura = () => router.push("/aura/workspace");
</script>

<style lang="scss" scoped>
/* 基于 Uiverse.io by StealthWorm 的 SPACE 按钮，适配顶栏入口（缩小 + SCSS 嵌套） */
.aura-btn {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: auto;
  height: 32px;
  padding: 0 15px;
  overflow: hidden;
  cursor: pointer;
  border-radius: 5rem;
  border: double 3px transparent;
  background-image: linear-gradient(#212121, #212121),
    linear-gradient(137.48deg, #ffdb3b 10%, #fe53bb 45%, #8f51ea 67%, #0044ff 87%);
  background-size: 300% 300%;
  background-origin: border-box;
  background-clip: content-box, border-box;
  backdrop-filter: blur(1rem);
  transition: 0.5s;
  animation: gradient_301 5s ease infinite;

  .aura-icon {
    position: relative;
    z-index: 2;
    display: grid;
    place-items: center;
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8));
    animation: aura-twinkle 2.4s ease-in-out infinite;

    svg {
      width: 100%;
      height: 100%;
    }

    .spark-main {
      fill: #fff;
    }
    .spark-sub {
      fill: #fff;
      opacity: 0.85;
    }
  }

  .aura-arrow {
    position: relative;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 13px;
    line-height: 1;
    color: #fff;
    filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.7));
    animation: aura-arrow 1.6s ease-in-out infinite;
  }

  .aura-text {
    position: relative;
    z-index: 2;
    display: inline-block;
    width: 104px;
    height: 16px;
    flex-shrink: 0;
    overflow: hidden;
    white-space: nowrap;

    .t1,
    .t2 {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 2px;
      color: #fff;
      text-shadow: 0 0 4px rgba(255, 255, 255, 0.9);
      transition: opacity 0.28s ease, transform 0.28s ease;
    }

    .t1 {
      opacity: 1;
      transform: translateY(0);
    }

    .t2 {
      opacity: 0;
      transform: translateY(115%);
    }
  }

  .container-stars {
    position: absolute;
    z-index: -1;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 5rem;
    backdrop-filter: blur(1rem);
    transition: 0.5s;

    .stars {
      position: relative;
      width: 200rem;
      height: 200rem;
      background: transparent;

      &::after {
        content: "";
        position: absolute;
        top: -10rem;
        left: -100rem;
        width: 100%;
        height: 100%;
        background-image: radial-gradient(#fff 1px, transparent 1%);
        background-size: 50px 50px;
        animation: animStarRotate 90s linear infinite;
      }

      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: -50%;
        width: 170%;
        height: 500%;
        background-image: radial-gradient(#fff 1px, transparent 1%);
        background-size: 50px 50px;
        opacity: 0.5;
        animation: animStar 60s linear infinite;
      }
    }
  }

  .glow {
    position: absolute;
    display: flex;
    width: 100%;
    z-index: -1;

    .circle {
      width: 100%;
      height: 30px;
      filter: blur(2rem);
      animation: pulse_3011 4s infinite;
      z-index: -1;

      &:nth-of-type(1) {
        background: rgba(254, 83, 186, 0.636);
      }
      &:nth-of-type(2) {
        background: rgba(142, 81, 234, 0.704);
      }
    }
  }

  &:hover {
    transform: scale(1.03);

    .container-stars {
      z-index: 1;
      background-color: #212121;
    }

    .aura-text {
      .t1 {
        opacity: 0;
        transform: translateY(-115%);
      }

      .t2 {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }

  &:active {
    border: double 3px #fe53bb;
    background-origin: border-box;
    background-clip: content-box, border-box;
    animation: none;

    .circle {
      background: #fe53bb;
    }
  }
}

@keyframes animStar {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-135rem);
  }
}

@keyframes animStarRotate {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0);
  }
}

@keyframes gradient_301 {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes pulse_3011 {
  0% {
    transform: scale(0.75);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
  }
  100% {
    transform: scale(0.75);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}

@keyframes aura-twinkle {
  0%,
  100% {
    transform: scale(1) rotate(0);
    opacity: 0.95;
  }
  50% {
    transform: scale(1.15) rotate(12deg);
    opacity: 1;
  }
}

@keyframes aura-arrow {
  0%,
  100% {
    transform: translateX(0);
    opacity: 0.65;
  }
  50% {
    transform: translateX(3px);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .aura-btn,
  .stars::before,
  .stars::after,
  .circle,
  .aura-icon,
  .aura-arrow {
    animation: none;
  }
}
</style>
