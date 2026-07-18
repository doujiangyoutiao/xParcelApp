<template>
  <div class="order-import-container">
    <div class="steps-container">
      <!-- Step 1: Download Template -->
      <div class="step-card" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
        <div class="step-header">
          <div class="step-number">1</div>
          <div class="step-title">{{ t("orderImport.download_template") }}</div>
        </div>
        <div class="step-content">
          <p class="step-description">{{ t("orderImport.download_template_desc") }}</p>
          <div style="display: flex; justify-content: center">
            <el-button type="primary" @click="downloadMuTemp" :icon="Download">
              {{ t("orderImport.download_template") }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- Step 2: Upload File -->
      <div class="step-card" :class="{ active: currentStep === 2 }">
        <div class="step-header">
          <div class="step-number">2</div>
          <div class="step-title">{{ t("orderImport.upload_validate") }}</div>
        </div>
        <div class="step-content">
          <p class="step-description">{{ t("orderImport.upload_validate_desc") }}</p>
          <el-upload
            ref="upload"
            drag
            :action="uploadURL"
            :headers="uploadHeaders"
            :limit="1"
            :show-file-list="false"
            :on-success="uploadSuccess"
            :on-error="uploadError"
            :on-exceed="handleExceed"
            :before-upload="handleUploadBefore"
          >
            <div class="upload-area" v-loading="uploadLoading">
              <el-icon class="upload-icon"><Upload /></el-icon>
              <div class="upload-text">
                <span>{{ t("orderImport.drag_file_here") }}</span>
                <el-button type="primary" link>{{ t("orderImport.click_to_upload") }}</el-button>
              </div>
              <div class="upload-hint">{{ t("orderImport.support_xlsx") }}</div>
            </div>
          </el-upload>

          <!-- Uploaded file name -->
          <div v-if="filesName" class="uploaded-file">
            <el-icon><Document /></el-icon>
            <span>{{ originalFileName }}</span>
          </div>

          <!-- Validation Results -->
          <div v-if="validationResult" class="validation-result">
            <el-alert v-if="validationResult.hasError" type="error" :closable="false" show-icon>
              <template #title>
                <span class="result-title">{{ t("orderImport.validation_failed") }}</span>
              </template>
              <template #default>
                <div class="result-detail">
                  <span>{{ t("orderImport.validation_failed_desc") }}</span>
                  <el-link type="primary" :underline="false" @click="downloadErrorFile" v-if="validationResult.errorFileUrl">
                    <el-icon><Download /></el-icon>
                    {{ t("orderImport.download_error_file") }}
                  </el-link>
                </div>
              </template>
            </el-alert>

            <el-alert v-else type="success" :closable="false" show-icon>
              <template #title>
                <span class="result-title">{{
                  isSubmit ? t("orderImport.submitted_successfully") : t("orderImport.validation_passed")
                }}</span>
              </template>
              <template #default>
                <div class="result-detail">
                  <span>{{ isSubmit ? t("orderImport.submitted_success_desc") : t("orderImport.validation_success_desc") }}</span>
                  <el-button type="primary" link @click="handleToOrder" v-if="isSubmit">{{
                    t("orderImport.view_orders")
                  }}</el-button>
                </div>
              </template>
            </el-alert>
          </div>

          <!-- Import Data Table -->
          <div v-if="importDataList.length > 0 && validationResult && !validationResult.hasError" class="import-data-table">
            <el-table :data="importDataList" style="width: 100%" border size="small" max-height="400">
              <el-table-column type="index" label="#" width="50" />
              <el-table-column prop="ReferenceNumber" :label="t('orderImport.reference')" min-width="120" show-overflow-tooltip />
              <el-table-column prop="ServiceCode" :label="t('orderImport.service')" width="100" show-overflow-tooltip />
              <el-table-column prop="Weight" :label="t('orderImport.weight')" width="90" />
              <el-table-column prop="Pieces" :label="t('orderImport.pieces')" width="80" />
              <el-table-column prop="DutyType" :label="t('orderImport.duty_type')" width="100" />
              <el-table-column prop="DeclareValue" :label="t('orderImport.declare_value')" width="110" />
              <el-table-column prop="DeclareCurrency" :label="t('orderImport.currency')" width="90" />
              <el-table-column prop="Content" :label="t('orderImport.content')" min-width="120" show-overflow-tooltip />
              <el-table-column prop="SenderContact" :label="t('orderImport.sender')" width="110" show-overflow-tooltip />
              <el-table-column prop="SenderCountry" :label="t('orderImport.from')" width="80" />
              <el-table-column prop="RecipientContact" :label="t('orderImport.recipient')" width="110" show-overflow-tooltip />
              <el-table-column prop="RecipientCountry" :label="t('orderImport.to')" width="80" />
            </el-table>
          </div>
        </div>
      </div>

      <!-- Step 3: Submit Order -->
      <div class="step-card" :class="{ active: currentStep === 3 }">
        <div class="step-header">
          <div class="step-number">3</div>
          <div class="step-title">{{ t("orderImport.submit_order") }}</div>
        </div>
        <div class="step-content">
          <p class="step-description">{{ t("orderImport.submit_order_desc") }}</p>
          <div style="display: flex; justify-content: center">
            <el-button type="primary" size="large" @click="submitOrder" :disabled="!canSubmit" :loading="isSubmitting">
              {{ t("orderImport.submit_order") }}
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Indicator -->
    <div class="progress-bar">
      <div class="progress-step" :class="{ active: currentStep >= 1 }">
        <div class="progress-dot"></div>
        <span>{{ t("orderImport.download") }}</span>
      </div>
      <div class="progress-line" :class="{ active: currentStep >= 2 }"></div>
      <div class="progress-step" :class="{ active: currentStep >= 2 }">
        <div class="progress-dot"></div>
        <span>{{ t("orderImport.upload") }}</span>
      </div>
      <div class="progress-line" :class="{ active: currentStep >= 3 }"></div>
      <div class="progress-step" :class="{ active: currentStep >= 3 }">
        <div class="progress-dot"></div>
        <span>{{ t("orderImport.submit") }}</span>
      </div>
    </div>

    <!-- Submit Success Dialog -->
    <el-dialog
      v-model="submitDialogVisible"
      :title="t('orderImport.submit_successfully')"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="submit-success-content">
        <div class="success-icon">
          <el-icon :size="48" color="#67c23a"><Document /></el-icon>
        </div>
        <p class="success-text">{{ t("orderImport.submit_success_desc") }}</p>
        <div class="shipment-list">
          <div class="shipment-item" v-for="(item, index) in submitResultList" :key="index">
            <span class="shipment-label">{{ t("orderImport.shipment") }} {{ index + 1 }}:</span>
            <el-link type="primary" :underline="true" @click="goToOrderList">{{ item.ShipmentNumber }}</el-link>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="submitDialogVisible = false">{{ t("orderImport.close") }}</el-button>
        <el-button type="primary" @click="goToOrderList">{{ t("orderImport.view_orders") }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage, genFileId } from "element-plus";
import { useI18n } from "vue-i18n";
import { Download, Upload, Document } from "@element-plus/icons-vue";
import { ElTable, ElTableColumn } from "element-plus";
import router from "@/routers";
import type { UploadInstance, UploadProps, UploadRawFile } from "element-plus";
import {
  uploadTempFileToInvalid,
  submitOrderByTemp,
  downloadMuTemp,
  type ImportShipmentResponse
} from "@/api/modules/createOrder";
import { useUserStore } from "@/stores/modules/user";

const { t } = useI18n();
const userStore = useUserStore();
const upload = ref<UploadInstance>();
const uploadLoading = ref(false);
const isSubmitting = ref(false);

const uploadURL = (import.meta.env.VITE_API_URL as string) + "/api/Common/UploadFile?BizType=1";
const uploadHeaders = computed(() => ({
  Authorization: "Bearer " + userStore.getToken
}));

const filesName = ref("");
const originalFileName = ref("");
const isSubmit = ref(false);
const validationResult = ref<ImportShipmentResponse | null>(null);
const importDataList = ref<any[]>([]);
const submitResultList = ref<any[]>([]);
const submitDialogVisible = ref(false);

// Calculate current step based on state
const currentStep = computed(() => {
  if (validationResult.value && !validationResult.value.hasError) return 3;
  if (filesName.value) return 2;
  return 1;
});

// Check if submit button should be enabled
const canSubmit = computed(() => {
  return validationResult.value && !validationResult.value.hasError && !isSubmit.value;
});

const handleExceed: UploadProps["onExceed"] = files => {
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  upload.value!.handleStart(file);
};

const downloadErrorFile = () => {
  if (validationResult.value?.errorFileUrl) {
    window.open(validationResult.value.errorFileUrl);
  }
};

const handleUploadBefore = (file: any) => {
  isSubmit.value = false;
  validationResult.value = null;
  importDataList.value = [];
  uploadLoading.value = true;
  originalFileName.value = file.name;
};

const uploadSuccess = (res: any) => {
  if (res.Success && res.Data) {
    filesName.value = res.Data.newFileName;
    originalFileName.value = originalFileName.value || res.Data.originalFileName || res.Data.newFileName;
    uploadLoading.value = false;
    upload.value!.clearFiles();
    validateFile(filesName.value);
  } else {
    uploadLoading.value = false;
    ElMessage.error(res.Message || t("orderImport.upload_failed"));
  }
};

const validateFile = (fileName: string) => {
  uploadTempFileToInvalid({
    fileName: fileName
  })
    .then((res: any) => {
      if (res.Success) {
        validationResult.value = res.Data;
        if (res.Data.importDataInfo) {
          try {
            importDataList.value = JSON.parse(res.Data.importDataInfo);
          } catch (e) {
            importDataList.value = [];
          }
        }
      }
    })
    .catch(() => {
      ElMessage.error(t("orderImport.validation_failed_error"));
    });
};

const uploadError = (err: any) => {
  uploadLoading.value = false;
  ElMessage.error(err.error?.msg || t("orderImport.upload_failed"));
  upload.value!.clearFiles();
};

const handleToOrder = () => {
  router.push("/my-orders");
};

const submitOrder = () => {
  if (!canSubmit.value) return;

  isSubmitting.value = true;
  submitOrderByTemp({
    fileName: filesName.value
  })
    .then((res: any) => {
      if (res.Success) {
        validationResult.value = res.Data;
        isSubmit.value = true;
        if (res.Data.importDataInfo) {
          try {
            submitResultList.value = JSON.parse(res.Data.importDataInfo);
          } catch (e) {
            submitResultList.value = [];
          }
        }
        submitDialogVisible.value = true;
      }
    })
    .catch(() => {
      ElMessage.error(t("orderImport.submit_failed"));
    })
    .finally(() => {
      isSubmitting.value = false;
    });
};

const goToOrderList = () => {
  submitDialogVisible.value = false;
  router.push("/my-orders");
};
</script>

<style lang="scss" scoped>
.order-import-container {
  max-width: 1200px;
  padding: 16px;
  padding-bottom: 100px;
  margin: 0 auto;
}
.steps-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.step-card {
  overflow: hidden;
  background: #ffffff;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s ease;
  &.active {
    border-color: var(--el-color-primary);
    box-shadow: 0 4px 12px rgb(64 158 255 / 15%);
  }
  &.completed {
    background: #f0f9ff;
    border-color: #67c23a;
  }
}
.step-header {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
}
.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
  background: var(--el-color-primary);
  border-radius: 50%;
  .completed & {
    background: #67c23a;
  }
}
.step-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}
.step-content {
  padding: 16px;
}
.step-description {
  margin-bottom: 16px;
  font-size: 14px;
  color: #86909c;
}
.upload-area {
  padding: 32px 16px;
  text-align: center;
  cursor: pointer;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  transition: all 0.3s ease;
  &:hover {
    background: #f0f9ff;
    border-color: var(--el-color-primary);
  }
}
.upload-icon {
  margin-bottom: 16px;
  font-size: 48px;
  color: #c0c4cc;
}
.upload-text {
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}
.upload-hint {
  font-size: 12px;
  color: #909399;
}
.uploaded-file {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 12px 16px;
  margin-top: 16px;
  color: var(--el-color-primary);
  background: #f0f9ff;
  border-radius: 8px;
  .el-icon {
    font-size: 16px;
  }
}
.validation-result {
  margin-top: 16px;
}
.result-title {
  font-size: 14px;
  font-weight: 500;
}
.result-detail {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-top: 8px;
  font-size: 13px;
}
.import-data-table {
  margin-top: 16px;
}
.submit-success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  .success-icon {
    margin-bottom: 16px;
  }
  .success-text {
    margin-bottom: 20px;
    font-size: 16px;
    font-weight: 500;
    color: #67c23a;
  }
  .shipment-list {
    width: 100%;
    max-height: 300px;
    overflow-y: auto;
    .shipment-item {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 8px 16px;
      border-bottom: 1px solid #f0f0f0;
      .shipment-label {
        font-size: 14px;
        color: #86909c;
        white-space: nowrap;
      }
    }
  }
}
.progress-bar {
  position: fixed;
  bottom: 16px;
  left: 50%;
  z-index: 100;
  display: flex;
  gap: 0;
  align-items: center;
  padding: 16px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
  transform: translateX(-50%);
}
.progress-step {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  opacity: 0.4;
  transition: all 0.3s ease;
  &.active {
    opacity: 1;
    .progress-dot {
      background: var(--el-color-primary);
      border-color: var(--el-color-primary);
    }
    span {
      font-weight: 500;
      color: var(--el-color-primary);
    }
  }
  span {
    font-size: 12px;
    color: #86909c;
    white-space: nowrap;
  }
}
.progress-dot {
  width: 12px;
  height: 12px;
  background: #ffffff;
  border: 2px solid #d9d9d9;
  border-radius: 50%;
  transition: all 0.3s ease;
}
.progress-line {
  width: 48px;
  height: 2px;
  margin: 0 16px;
  margin-bottom: 16px;
  background: #e4e7ed;
  transition: all 0.3s ease;
  &.active {
    background: var(--el-color-primary);
  }
}
</style>
