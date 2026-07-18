<template>
  <el-dropdown trigger="click">
    <div class="avatar">
      <img src="@/assets/images/avatar.gif" alt="avatar" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="openDialog('infoRef')">
          <el-icon><User /></el-icon>{{ $t("header.personalData") }}
        </el-dropdown-item>
        <el-dropdown-item @click="openDialog('passwordRef')">
          <el-icon><Edit /></el-icon>{{ $t("header.changePassword") }}
        </el-dropdown-item>
        <el-dropdown-item divided @click="logout">
          <el-icon><SwitchButton /></el-icon>{{ $t("header.logout") }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <!-- infoDialog -->
  <InfoDialog ref="infoRef"></InfoDialog>
  <!-- passwordDialog -->
  <PasswordDialog ref="passwordRef"></PasswordDialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { LOGIN_URL } from "@/config";
import { useRouter } from "vue-router";
//import { logoutApi } from "@/api/modules/login";
import { useUserStore } from "@/stores/modules/user";
import { ElMessageBox, ElMessage } from "element-plus";
import InfoDialog from "./InfoDialog.vue";
import PasswordDialog from "./PasswordDialog.vue";
import { useAuthStore } from "@/stores/modules/auth";
const authStore = useAuthStore();
const router = useRouter();
const userStore = useUserStore();

// 退出登录
const logout = () => {
  ElMessageBox.confirm("您是否确认退出登录?", "温馨提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    // 1.执行退出登录接口
    //await logoutApi();
    userStore.clearUserInfo();
    //userStore.clearToken();
    authStore.setAuthMenuList();
    // 2.清除 Token
    userStore.clearToken();

    // 3.重定向到登陆页
    router.replace(LOGIN_URL);
    ElMessage.success("退出登录成功！");
  });
};

// 打开修改密码和个人信息弹窗
const infoRef = ref<InstanceType<typeof InfoDialog> | null>(null);
const passwordRef = ref<InstanceType<typeof PasswordDialog> | null>(null);
const openDialog = (ref: string) => {
  if (ref == "infoRef") infoRef.value?.openDialog();
  if (ref == "passwordRef") passwordRef.value?.openDialog();
};
</script>

<style scoped lang="scss">
.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  overflow: hidden;
  cursor: pointer;
  background: rgb(255 255 255 / 25%);
  border: 2px solid rgb(255 255 255 / 50%);
  border-radius: 50%;
  transition: all 0.3s ease;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  &:hover {
    background: rgb(255 255 255 / 35%);
    border-color: #ffffff;
    box-shadow: 0 4px 12px rgb(0 0 0 / 25%);
    transform: scale(1.08);
  }
}
:deep(.el-dropdown-menu__item) {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 20px;
  font-size: 14px;
  transition: all 0.2s ease;
  .el-icon {
    font-size: 16px;
    color: var(--el-color-primary);
  }
  &:hover {
    padding-left: 24px;
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
  }
}
</style>
