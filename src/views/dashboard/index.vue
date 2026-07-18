<template>
  <div class="dashboard-placeholder">
    <div class="scene">
      <!-- 星空背景粒子 -->
      <div class="stars">
        <span v-for="n in 50" :key="n" class="star" :style="starStyle()"></span>
      </div>

      <!-- 主体插画：火箭 -->
      <div class="rocket-container">
        <div class="rocket">
          <svg width="120" height="160" viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- 火箭主体 -->
            <path
              d="M60 10 C60 10, 30 50, 30 90 L30 110 L90 110 L90 90 C90 50, 60 10, 60 10Z"
              fill="url(#rocketGrad)"
              stroke="rgba(255,255,255,0.2)"
              stroke-width="1"
            />
            <!-- 火箭头 -->
            <path d="M60 10 C60 10, 48 30, 45 50 L75 50 C72 30, 60 10, 60 10Z" fill="#009688" opacity="0.9" />
            <!-- 火箭窗户 -->
            <circle cx="60" cy="70" r="12" fill="#1a1f2e" stroke="#009688" stroke-width="2" />
            <circle cx="60" cy="70" r="8" fill="url(#windowGrad)" />
            <circle cx="57" cy="67" r="3" fill="rgba(255,255,255,0.4)" />
            <!-- 左翼 -->
            <path d="M30 90 L10 115 L30 110Z" fill="#009688" opacity="0.8" />
            <!-- 右翼 -->
            <path d="M90 90 L110 115 L90 110Z" fill="#009688" opacity="0.8" />
            <!-- 火箭底部 -->
            <rect x="40" y="110" width="40" height="10" rx="2" fill="#2a3149" />
            <!-- 火焰 -->
            <g class="flame">
              <path d="M45 120 L60 155 L75 120Z" fill="url(#flameGrad1)" opacity="0.9" />
              <path d="M50 120 L60 145 L70 120Z" fill="url(#flameGrad2)" opacity="0.95" />
              <path d="M55 120 L60 135 L65 120Z" fill="#ffe082" />
            </g>
            <defs>
              <linearGradient id="rocketGrad" x1="30" y1="10" x2="90" y2="110">
                <stop offset="0%" stop-color="#3a4565" />
                <stop offset="100%" stop-color="#252b3d" />
              </linearGradient>
              <radialGradient id="windowGrad" cx="0.4" cy="0.35">
                <stop offset="0%" stop-color="#4dd0e1" />
                <stop offset="100%" stop-color="#00838f" />
              </radialGradient>
              <linearGradient id="flameGrad1" x1="60" y1="120" x2="60" y2="155">
                <stop offset="0%" stop-color="#ff6d00" />
                <stop offset="100%" stop-color="rgba(255,109,0,0)" />
              </linearGradient>
              <linearGradient id="flameGrad2" x1="60" y1="120" x2="60" y2="145">
                <stop offset="0%" stop-color="#ffab00" />
                <stop offset="100%" stop-color="rgba(255,171,0,0)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <!-- 火箭尾焰粒子 -->
        <div class="exhaust-particles">
          <span v-for="p in 8" :key="p" class="particle" :style="particleStyle()"></span>
        </div>
      </div>

      <!-- 环绕行星 -->
      <div class="planet planet-1">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="#2a3149" stroke="#009688" stroke-width="1" opacity="0.6" />
          <ellipse cx="20" cy="20" rx="20" ry="6" fill="none" stroke="rgba(0,150,136,0.3)" stroke-width="1.5" />
        </svg>
      </div>
      <div class="planet planet-2">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="#1a1f2e" stroke="#4dd0e1" stroke-width="1" opacity="0.5" />
        </svg>
      </div>

      <!-- 文字区域 -->
      <div class="text-area">
        <h1 class="title">
          <span class="title-icon">🚀</span>
          {{ t("dashboard.feature_in_development") }}
        </h1>
        <p class="subtitle">{{ t("dashboard.dashboard_coming_soon") }}</p>
        <div class="progress-hint">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <span class="progress-text">Coming Soon...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const starStyle = () => {
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  const size = Math.random() * 2 + 1;
  const delay = Math.random() * 3;
  const duration = Math.random() * 2 + 2;
  return {
    left: `${x}%`,
    top: `${y}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  };
};

const particleStyle = () => {
  const x = (Math.random() - 0.5) * 40;
  const delay = Math.random() * 1.5;
  const duration = Math.random() * 0.8 + 0.5;
  const size = Math.random() * 4 + 2;
  return {
    "--px": `${x}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    width: `${size}px`,
    height: `${size}px`
  };
};
</script>

<style lang="scss" scoped>
.dashboard-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 600px;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1f2e 0%, #0d1117 50%, #1a1f2e 100%);
}
.scene {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 600px;
  padding: 40px 20px;
}

/* 星空 */
.stars {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.star {
  position: absolute;
  background: #ffffff;
  border-radius: 50%;
  opacity: 0.3;
  animation: twinkle ease-in-out infinite alternate;
}

@keyframes twinkle {
  0% {
    opacity: 0.2;
    transform: scale(1);
  }
  100% {
    opacity: 0.8;
    transform: scale(1.3);
  }
}

/* 火箭容器 */
.rocket-container {
  position: relative;
  margin-bottom: 40px;
  animation: rocket-float 3s ease-in-out infinite;
}

@keyframes rocket-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}
.rocket {
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 0 20px rgb(0 150 136 / 30%));
}
.flame {
  transform-origin: top center;
  animation: flame-flicker 0.15s ease-in-out infinite alternate;
}

@keyframes flame-flicker {
  0% {
    transform: scaleX(1) scaleY(1);
  }
  100% {
    transform: scaleX(0.9) scaleY(1.05);
  }
}

/* 尾焰粒子 */
.exhaust-particles {
  position: absolute;
  bottom: -10px;
  left: 50%;
  z-index: 1;
  transform: translateX(-50%);
}
.particle {
  position: absolute;
  background: radial-gradient(circle, #ffab00, rgb(255 109 0 / 0%));
  border-radius: 50%;
  opacity: 0;
  animation: particle-fall linear infinite;
}

@keyframes particle-fall {
  0% {
    opacity: 0.8;
    transform: translate(var(--px), 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--px), 60px) scale(0);
  }
}

/* 行星装饰 */
.planet {
  position: absolute;
  z-index: 0;
  opacity: 0.6;
}
.planet-1 {
  top: 8%;
  right: 5%;
  animation: planet-float 6s ease-in-out infinite;
}
.planet-2 {
  bottom: 25%;
  left: 8%;
  animation: planet-float 8s ease-in-out infinite 2s;
}

@keyframes planet-float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}

/* 文字区域 */
.text-area {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.title {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  font-size: 32px;
  font-weight: 700;
  color: #e5eaf3;
  letter-spacing: 2px;
  .title-icon {
    font-size: 36px;
    animation: icon-bounce 2s ease-in-out infinite;
  }
}

@keyframes icon-bounce {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-4px) rotate(-5deg);
  }
  75% {
    transform: translateY(-4px) rotate(5deg);
  }
}
.subtitle {
  max-width: 400px;
  margin-bottom: 32px;
  font-size: 15px;
  line-height: 1.8;
  color: #8b8fa3;
  letter-spacing: 1px;
}

/* 进度提示 */
.progress-hint {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}
.progress-bar {
  width: 240px;
  height: 6px;
  overflow: hidden;
  background: rgb(255 255 255 / 8%);
  border-radius: 3px;
}
.progress-fill {
  width: 30%;
  height: 100%;
  background: linear-gradient(90deg, #009688, #4dd0e1);
  border-radius: 3px;
  animation: progress-pulse 2s ease-in-out infinite;
}

@keyframes progress-pulse {
  0% {
    width: 20%;
    opacity: 0.6;
  }
  50% {
    width: 40%;
    opacity: 1;
  }
  100% {
    width: 20%;
    opacity: 0.6;
  }
}
.progress-text {
  font-size: 13px;
  font-weight: 500;
  color: #009688;
  text-transform: uppercase;
  letter-spacing: 3px;
  animation: text-fade 2s ease-in-out infinite;
}

@keyframes text-fade {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
