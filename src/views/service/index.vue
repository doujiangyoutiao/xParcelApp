<template>
  <div class="table-box service-table">
    <!-- 搜索区域 -->
    <div class="table-search">
      <span class="coloader-title">{{ t("service.connected_providers") }}</span>
      <div class="coloader-items">
        <div v-for="item in coloaderList" :key="item.coloaderId" class="coloader-item" @click="handleAddService(item)">
          <span class="coloader-name">{{ item.coloaderCode }}</span>
          <el-icon class="coloader-add-icon"><Plus /></el-icon>
        </div>
      </div>
    </div>

    <!-- 服务列表 -->
    <div class="table-header">
      <span class="table-title">{{ t("service.service_list") }}</span>
    </div>
    <el-table :data="serviceList" stripe height="calc(100vh - 300px)">
      <el-table-column prop="coloaderCode" :label="t('service.provider')" min-width="150" />
      <el-table-column prop="serviceCode" :label="t('service.service_code')" min-width="150" />
      <el-table-column prop="remark" :label="t('service.remark')" min-width="150" />
      <el-table-column prop="creationTime" :label="t('service.creation_time')" width="180">
        <template #default="scope">
          {{ scope.row.creationTime ? moment(scope.row.creationTime).format("YYYY-MM-DD HH:mm:ss") : "" }}
        </template>
      </el-table-column>
      <el-table-column :label="t('service.operation')" align="center" fixed="right" width="110">
        <template #default="scope">
          <el-button type="primary" link :icon="EditPen" @click="handleEditService(scope.row)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? t('service.edit_service') : t('service.add_service')"
      width="50vw"
      destroy-on-close
      align-center
    >
      <el-form ref="formRef" :model="formData" label-width="140px" label-position="left">
        <!-- 服务商 -->
        <el-form-item :label="t('service.provider')">
          <span>{{ formData.coloaderCode }}</span>
        </el-form-item>

        <!-- 相关参数 -->
        <el-divider content-position="left">{{ t("service.related_parameters") }}</el-divider>
        <el-form-item v-for="item in formData.coloaerParaList" :key="item.paraId" :label="item.paraName">
          <el-input v-model="item.paraValue" :placeholder="t('service.please_enter')" clearable />
        </el-form-item>

        <!-- 服务信息 -->
        <el-divider content-position="left">{{ t("service.service_list") }}</el-divider>
        <el-form-item :label="t('service.your_logistics_service_name')" prop="name">
          <el-input v-model="formData.name" :placeholder="t('service.please_enter_service_name')" clearable />
        </el-form-item>
        <el-form-item :label="t('service.remark_label')" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" :placeholder="t('service.please_enter_remark')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t("service.cancel") }}</el-button>
        <el-button type="primary" :loading="saveLoading" @click="handleSave">{{ t("service.save") }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="ServiceList">
import { ref, onMounted } from "vue";
import { Plus, EditPen } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import {
  getServicesByAdd,
  getServicesByCustomer,
  getServiceColoaderInfoForAddOrUpdate,
  addOrUpdateService
} from "@/api/modules/service";
import { useI18n } from "vue-i18n";
import moment from "moment";

const { t } = useI18n();

// coloader列表
const coloaderList = ref<any[]>([]);
// 服务列表
const serviceList = ref<any[]>([]);

// 弹框相关
const dialogVisible = ref(false);
const isEdit = ref(false);
const saveLoading = ref(false);
const formRef = ref();

interface FormData {
  id: number | null;
  companyId: number;
  coloaderId: number | null;
  coloaderCode: string;
  name: string;
  description: string;
  coloaerParaList: { paraId: number; paraName: string; paraValue: string | null }[];
}

const initFormData = (): FormData => ({
  id: null,
  companyId: 0,
  coloaderId: null,
  coloaderCode: "",
  name: "",
  description: "",
  coloaerParaList: []
});

const formData = ref<FormData>(initFormData());

// 获取coloader列表
const loadColoaders = async () => {
  try {
    const res: any = await getServicesByAdd();
    if (res.Data) {
      coloaderList.value = res.Data || [];
    }
  } catch (error) {
    console.error(error);
  }
};

// 获取服务列表
const loadServiceList = async () => {
  try {
    const res: any = await getServicesByCustomer();
    if (res.Data) {
      serviceList.value = (res.Data || []).reverse();
    }
  } catch (error) {
    console.error(error);
  }
};

// 点击添加服务
const handleAddService = async (coloader: any) => {
  isEdit.value = false;
  try {
    const res: any = await getServiceColoaderInfoForAddOrUpdate({ coloaderId: coloader.coloaderId });
    if (res.Data) {
      const data = res.Data;
      formData.value = {
        id: null,
        companyId: 0,
        coloaderId: data.coloaderId,
        coloaderCode: data.coloaderCode,
        name: data.name || "",
        description: data.description || "",
        coloaerParaList: (data.coloaerParaList || []).map((item: any) => ({
          paraId: item.paraId,
          paraName: item.paraName,
          paraValue: item.paraValue || ""
        }))
      };
      dialogVisible.value = true;
    }
  } catch (error) {
    console.error(error);
  }
};

// 点击修改服务
const handleEditService = async (row: any) => {
  isEdit.value = true;
  try {
    const res: any = await getServiceColoaderInfoForAddOrUpdate({ id: row.id });
    if (res.Data) {
      const data = res.Data;
      formData.value = {
        id: data.id,
        companyId: 0,
        coloaderId: data.coloaderId,
        coloaderCode: data.coloaderCode,
        name: data.name || "",
        description: data.description || "",
        coloaerParaList: (data.coloaerParaList || []).map((item: any) => ({
          paraId: item.paraId,
          paraName: item.paraName,
          paraValue: item.paraValue || ""
        }))
      };
      dialogVisible.value = true;
    }
  } catch (error) {
    console.error(error);
  }
};

// 保存
const handleSave = async () => {
  saveLoading.value = true;
  try {
    const params: any = {
      companyId: 0,
      coloaderId: formData.value.coloaderId,
      name: formData.value.name,
      description: formData.value.description,
      coloaerParaList: formData.value.coloaerParaList.map(item => ({
        paraId: item.paraId,
        paraName: item.paraName,
        paraValue: item.paraValue
      }))
    };
    // 修改时带上Id
    if (isEdit.value && formData.value.id) {
      params.Id = formData.value.id;
    }
    await addOrUpdateService(params);
    ElMessage.success(isEdit.value ? t("service.update_success") : t("service.add_success"));
    dialogVisible.value = false;
    loadServiceList();
  } catch (error) {
    console.error(error);
  } finally {
    saveLoading.value = false;
  }
};

// 初始化
onMounted(() => {
  loadColoaders();
  loadServiceList();
});
</script>

<style scoped lang="scss">
.table-box {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .table-search {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    padding: 16px 18px;
    margin-bottom: 16px;
    background: #ffffff;
    .coloader-title {
      font-size: 14px;
      font-weight: bold;
      color: var(--el-text-color-primary);
      white-space: nowrap;
    }
    .coloader-items {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      .coloader-item {
        display: inline-flex;
        gap: 4px;
        align-items: center;
        padding: 4px 10px;
        cursor: pointer;
        background: #ffffff;
        border: 1px solid var(--el-border-color);
        border-radius: 16px;
        transition: all 0.2s;
        .coloader-name {
          font-size: 13px;
          color: var(--el-text-color-primary);
        }
        .coloader-add-icon {
          font-size: 12px;
          color: var(--el-color-primary);
          transition: transform 0.2s;
        }
        &:hover {
          background: var(--el-color-primary-light-9);
          border-color: var(--el-color-primary);
          .coloader-add-icon {
            transform: scale(1.2);
          }
        }
      }
    }
  }
  .table-header {
    display: flex;
    align-items: center;
    padding: 14px 20px;
    margin-bottom: 8px;
    background: #ffffff;
    border-radius: 4px;
    .table-title {
      font-size: 15px;
      font-weight: normal;
      color: var(--el-text-color-primary);
    }
  }
  :deep(.el-table) {
    margin: 0 4px;
  }
  :deep(.el-dialog__body) {
    padding-top: 10px;
  }
}
</style>

<style lang="scss">
.service-table .el-table th.el-table__cell {
  font-weight: normal !important;
}
</style>
