<template>
  <div class="login-container">
    <!-- 左侧品牌展示区 -->
    <div class="login-left">
      <div class="brand-content">
        <div class="brand-title">
          <h1>X Parcel</h1>
          <p class="brand-subtitle">Global Logistics Solutions</p>
        </div>

        <div class="features">
          <div class="feature-item">
            <el-icon class="feature-icon"><Box /></el-icon>
            <div class="feature-text">
              <h3>Smart Shipping</h3>
              <p>Efficient parcel management worldwide</p>
            </div>
          </div>

          <div class="feature-item">
            <el-icon class="feature-icon"><Location /></el-icon>
            <div class="feature-text">
              <h3>Real-time Tracking</h3>
              <p>Track your shipments anytime, anywhere</p>
            </div>
          </div>

          <div class="feature-item">
            <el-icon class="feature-icon"><Timer /></el-icon>
            <div class="feature-text">
              <h3>Fast Delivery</h3>
              <p>Express delivery to 200+ countries</p>
            </div>
          </div>
        </div>

        <div class="stats">
          <div class="stat-item">
            <span class="stat-number">200+</span>
            <span class="stat-label">Countries</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">1M+</span>
            <span class="stat-label">Parcels/Year</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">99.9%</span>
            <span class="stat-label">Success Rate</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录区 -->
    <div class="login-right">
      <div class="login-form-container">
        <div class="form-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account to continue</p>
        </div>

        <LoginForm />
      </div>

      <div class="login-footer">
        <p>© 2024 X Parcel. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="login">
import LoginForm from "./components/LoginForm.vue";

import { Box, Location, Timer } from "@element-plus/icons-vue";
</script>

<style scoped lang="scss">
@import "./index";
</style>
