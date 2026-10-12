<template>
  <div class="company-profile-page">
    <section class="profile-preview">
      <div class="brand-card">
        <div class="brand-logo">
          <img v-if="logoPreview" :src="logoPreview" alt="company logo" />
          <span v-else>{{ companyInitial }}</span>
        </div>
        <div>
          <h2>{{ formData.companyName || "Company Name" }}</h2>
          <p>{{ formData.email || "company@email.com" }}</p>
        </div>
      </div>
      <div class="white-label-note">
        <h3>White-label Preview</h3>
        <p>Your company name and logo will appear in the application header for your team and customers.</p>
      </div>
    </section>

    <section class="profile-form-panel">
      <div class="panel-header">
        <div>
          <h2>Company Profile</h2>
          <p>Maintain the brand identity shown in your portal.</p>
        </div>
        <el-button type="primary" :loading="saving" @click="handleSave">Save</el-button>
      </div>

      <el-form ref="formRef" :model="formData" :rules="rules" label-width="130px" label-position="right">
        <el-form-item label="Company Logo">
          <div class="logo-upload-row">
            <el-upload
              class="logo-uploader"
              :show-file-list="false"
              accept=".jpg,.jpeg,.png"
              :http-request="handleLogoUpload"
              :before-upload="beforeLogoUpload"
            >
              <div class="upload-box">
                <img v-if="logoPreview" :src="logoPreview" alt="logo preview" />
                <el-icon v-else><Plus /></el-icon>
              </div>
            </el-upload>
            <div class="upload-help">
              <strong>PNG or JPG</strong>
              <span>Recommended square logo, under 2MB.</span>
              <el-button v-if="formData.companyLogo" link type="primary" @click="clearLogo">Remove logo</el-button>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="Company Name" prop="companyName">
          <el-input v-model="formData.companyName" maxlength="100" placeholder="Company name" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="formData.email" maxlength="100" placeholder="Company email" />
        </el-form-item>
        <el-form-item label="Phone" prop="phoneNumber">
          <el-input v-model="formData.phoneNumber" maxlength="50" placeholder="Phone number" />
        </el-form-item>
        <el-form-item label="Address" prop="address">
          <el-input v-model="formData.address" maxlength="200" placeholder="Company address" />
        </el-form-item>
      </el-form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, FormInstance, FormRules, UploadRequestOptions } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import { getMyCompanyProfile, updateMyCompanyProfile } from "@/api/modules/company";
import { uploadImage } from "@/api/modules/image";
import { getProviderLogoUrl } from "@/utils/providerLogo";
import { localSet } from "@/utils";
import { useUserStore } from "@/stores/modules/user";
import { getCurrentUserInfoApi } from "@/api/modules/login";

const formRef = ref<FormInstance>();
const loading = ref(false);
const saving = ref(false);
const userStore = useUserStore();

const formData = reactive({
  companyName: "",
  email: "",
  phoneNumber: "",
  address: "",
  companyLogo: ""
});

const rules: FormRules = {
  companyName: [{ required: true, message: "Please enter company name", trigger: "blur" }],
  email: [{ type: "email", message: "Please enter a valid email", trigger: "blur" }]
};

const logoPreview = computed(() => getProviderLogoUrl(formData.companyLogo));
const companyInitial = computed(() => (formData.companyName || "C").slice(0, 1).toUpperCase());

const unwrapData = (res: any) => res?.Data ?? res?.data ?? res;

const applyProfile = (profile: any) => {
  formData.companyName = profile?.companyName || "";
  formData.email = profile?.email || "";
  formData.phoneNumber = profile?.phoneNumber || "";
  formData.address = profile?.address || "";
  formData.companyLogo = profile?.companyLogo || "";
};

const loadProfile = async () => {
  loading.value = true;
  try {
    const response: any = await getMyCompanyProfile();
    applyProfile(unwrapData(response));
  } finally {
    loading.value = false;
  }
};

const beforeLogoUpload = (file: File) => {
  const isImage = ["image/jpeg", "image/png"].includes(file.type);
  const isSmallEnough = file.size / 1024 / 1024 < 2;
  if (!isImage) ElMessage.error("Please upload a PNG or JPG logo.");
  if (!isSmallEnough) ElMessage.error("Logo must be smaller than 2MB.");
  return isImage && isSmallEnough;
};

const handleLogoUpload = async (options: UploadRequestOptions) => {
  const file = options.file as File;
  const form = new FormData();
  const fileBaseName = `company-logo-${Date.now()}`;
  form.append("File", file);
  form.append("FileName", fileBaseName);
  form.append("FileDescription", "Company white-label logo");

  const response: any = await uploadImage(form);
  const data = unwrapData(response);
  formData.companyLogo = data?.filePath || data?.FilePath || "";
  ElMessage.success("Logo uploaded.");
};

const clearLogo = () => {
  formData.companyLogo = "";
};

const refreshCurrentUser = async () => {
  const userInfoData: any = await getCurrentUserInfoApi();
  if (userInfoData?.Data) {
    localSet("userInfo", userInfoData.Data);
    userStore.setUserInfo();
  }
};

const handleSave = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async valid => {
    if (!valid) return;
    saving.value = true;
    try {
      const response: any = await updateMyCompanyProfile({ ...formData });
      applyProfile(unwrapData(response));
      await refreshCurrentUser();
      ElMessage.success("Company profile updated.");
    } finally {
      saving.value = false;
    }
  });
};

onMounted(loadProfile);
</script>

<style scoped lang="scss">
.company-profile-page {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 16px;
  min-height: 100%;
  padding: 16px;
  background: #f5f7fa;
}
.profile-preview,
.profile-form-panel {
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}
.profile-preview {
  align-self: start;
  padding: 18px;
}
.brand-card {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 18px;
  color: #ffffff;
  background: #1a1f2e;
  border-radius: 8px;
  h2 {
    max-width: 230px;
    margin: 0 0 6px;
    overflow: hidden;
    font-size: 22px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  p {
    max-width: 230px;
    margin: 0;
    overflow: hidden;
    font-size: 13px;
    color: #b4b8c5;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.brand-logo {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  background: #ffffff;
  border-radius: 8px;
  img {
    max-width: 46px;
    max-height: 46px;
    object-fit: contain;
  }
  span {
    font-size: 24px;
    font-weight: 800;
    color: #1a1f2e;
  }
}
.white-label-note {
  padding: 16px;
  margin-top: 18px;
  background: #f8fafc;
  border-radius: 8px;
  h3 {
    margin: 0 0 8px;
    font-size: 16px;
    color: #1f2d3d;
  }
  p {
    margin: 0;
    line-height: 1.6;
    color: #606266;
  }
}
.profile-form-panel {
  padding: 18px;
}
.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  h2 {
    margin: 0 0 6px;
    font-size: 22px;
    color: #1f2d3d;
  }
  p {
    margin: 0;
    color: #909399;
  }
}
.logo-upload-row {
  display: flex;
  gap: 16px;
  align-items: center;
}
.upload-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 104px;
  height: 104px;
  cursor: pointer;
  background: #f8fafc;
  border: 1px dashed #c0c4cc;
  border-radius: 8px;
  img {
    max-width: 86px;
    max-height: 86px;
    object-fit: contain;
  }
}
.upload-help {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #909399;
  strong {
    color: #303133;
  }
}

@media (width <= 900px) {
  .company-profile-page {
    grid-template-columns: 1fr;
  }
}
</style>
