<template>
  <el-dialog v-model="dialogVisible" title="Change Password" width="460px" draggable destroy-on-close @closed="resetForm">
    <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
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
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">Save</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { LOGIN_URL } from "@/config";
import { changePasswordApi } from "@/api/modules/login";
import { useUserStore } from "@/stores/modules/user";
import { useAuthStore } from "@/stores/modules/auth";

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const dialogVisible = ref(false);
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

const resetForm = () => {
  formRef.value?.resetFields();
  formData.oldPassword = "";
  formData.newPassword = "";
  formData.confirmPassword = "";
};

const openDialog = () => {
  resetForm();
  dialogVisible.value = true;
};

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
      dialogVisible.value = false;
      userStore.clearUserInfo();
      userStore.clearToken();
      authStore.setAuthMenuList();
      router.replace(LOGIN_URL);
    } finally {
      submitLoading.value = false;
    }
  });
};

defineExpose({ openDialog });
</script>
