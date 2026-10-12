<template>
  <div class="change-password-page">
    <section class="password-panel">
      <div class="panel-header">
        <div class="header-icon">
          <el-icon><Lock /></el-icon>
        </div>
        <div>
          <h2>Change Password</h2>
          <p>Update your account password. You will need to sign in again after saving.</p>
        </div>
      </div>

      <el-form ref="formRef" :model="formData" :rules="rules" label-position="top" class="password-form">
        <el-form-item label="Current Password" prop="oldPassword">
          <el-input v-model="formData.oldPassword" type="password" show-password autocomplete="current-password" />
        </el-form-item>
        <el-form-item label="New Password" prop="newPassword">
          <el-input v-model="formData.newPassword" type="password" show-password autocomplete="new-password" />
        </el-form-item>
        <el-form-item label="Confirm New Password" prop="confirmPassword">
          <el-input v-model="formData.confirmPassword" type="password" show-password autocomplete="new-password" />
        </el-form-item>
      </el-form>

      <div class="form-actions">
        <el-button @click="router.back()">Cancel</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">Save Password</el-button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts" name="ChangePassword">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { Lock } from "@element-plus/icons-vue";
import { LOGIN_URL } from "@/config";
import { changePasswordApi } from "@/api/modules/login";
import { useUserStore } from "@/stores/modules/user";
import { useAuthStore } from "@/stores/modules/auth";

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const submitLoading = ref(false);
const formRef = ref<FormInstance>();

const formData = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});

const validateConfirmPassword = (_rule: any, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error("Please confirm your new password."));
    return;
  }
  if (value !== formData.newPassword) {
    callback(new Error("The two new passwords do not match."));
    return;
  }
  callback();
};

const rules = reactive<FormRules>({
  oldPassword: [{ required: true, message: "Please enter your current password.", trigger: "blur" }],
  newPassword: [
    { required: true, message: "Please enter a new password.", trigger: "blur" },
    { min: 6, message: "Password must be at least 6 characters.", trigger: "blur" }
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: "blur" }]
});

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async valid => {
    if (!valid) return;
    submitLoading.value = true;
    try {
      await changePasswordApi({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });
      ElMessage.success("Password changed successfully. Please sign in again.");
      userStore.clearUserInfo();
      userStore.clearToken();
      authStore.setAuthMenuList();
      router.replace(LOGIN_URL);
    } finally {
      submitLoading.value = false;
    }
  });
};
</script>

<style scoped lang="scss">
.change-password-page {
  min-height: 100%;
  padding: 24px;
  background: #f5f7fa;
}
.password-panel {
  max-width: 560px;
  padding: 24px;
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgb(31 45 61 / 4%);
}
.panel-header {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-bottom: 24px;
  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #1f2d3d;
  }
  p {
    margin: 6px 0 0;
    font-size: 13px;
    color: #7a8599;
  }
}
.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  font-size: 22px;
  color: #1d4ed8;
  background: #eff6ff;
  border-radius: 6px;
}
.password-form {
  max-width: 440px;
}
.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  max-width: 440px;
  margin-top: 24px;
}
</style>
