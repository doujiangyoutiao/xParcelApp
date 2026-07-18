<template>
  <div class="table-box">
    <!-- 顶部操作栏 -->
    <div class="table-search">
      <div class="search-buttons">
        <el-button type="primary" :icon="Plus" @click="openDialog(dialogTitles.ADD)">{{ t("company.add_company") }}</el-button>
      </div>
    </div>

    <!-- 表格 -->
    <el-table :data="tableData" border stripe height="calc(100vh - 250px)">
      <el-table-column prop="companyName" :label="t('company.company_name')" min-width="150" />
      <el-table-column prop="address" :label="t('company.address')" min-width="180" show-overflow-tooltip />
      <el-table-column prop="phoneNumber" :label="t('company.phone')" width="130" />
      <el-table-column prop="email" :label="t('company.email')" width="180" />
      <el-table-column prop="countryId" :label="t('company.country')" width="120">
        <template #default="scope">
          {{ countryList.find(c => c.code === scope.row.countryId)?.name || scope.row.countryId }}
        </template>
      </el-table-column>
      <el-table-column prop="remark" :label="t('company.remark')" min-width="150" show-overflow-tooltip />
      <el-table-column :label="t('company.operation')" align="center" fixed="right" width="150">
        <template #default="scope">
          <el-button type="primary" link :icon="EditPen" @click="openDialog(dialogTitles.EDIT, scope.row)" />
          <el-button type="primary" link :icon="Delete" @click="handleDelete(scope.row)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑公司弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="650px" destroy-on-close align-center>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" label-position="right">
        <el-form-item :label="t('company.company_name')" prop="companyName">
          <el-input v-model="formData.companyName" :placeholder="t('company.please_enter_company_name')" maxlength="100" />
        </el-form-item>
        <el-form-item :label="t('company.address')" prop="address">
          <el-input v-model="formData.address" :placeholder="t('company.please_enter_address')" maxlength="200" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('company.phone')" prop="phoneNumber">
              <el-input v-model="formData.phoneNumber" :placeholder="t('company.please_enter_phone')" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('company.email')" prop="email">
              <el-input v-model="formData.email" :placeholder="t('company.please_enter_email')" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('company.country')" prop="countryId">
              <el-select v-model="formData.countryId" :placeholder="t('company.please_select_country')" clearable filterable>
                <el-option v-for="item in countryList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="t('company.remark')" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            :placeholder="t('company.please_enter_remark')"
            maxlength="500"
          />
        </el-form-item>

        <!-- 新增时显示用户账号信息 -->
        <template v-if="!isEdit">
          <el-divider content-position="left">{{ t("company.initial_login_user") }}</el-divider>
          <el-form-item :label="t('company.username')" prop="username">
            <el-input v-model="formData.username" :placeholder="t('company.please_enter_username')" />
          </el-form-item>
          <el-form-item :label="t('company.password')" prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              show-password
              :placeholder="t('company.please_enter_password')"
            />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t("company.cancel") }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ t("company.confirm") }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="CompanyList">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";
import { Plus, Delete, EditPen } from "@element-plus/icons-vue";
import { getCompanyList, addCompany, updateCompany, deleteCompany, getCountries } from "@/api/modules/company";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// 表格数据
const tableData = ref<any[]>([]);
const countryList = ref<any[]>([]);

// 弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref("");
const isEdit = ref(false);
const submitLoading = ref(false);
const formRef = ref<FormInstance>();

const dialogTitles = {
  ADD: t("company.add_company"),
  EDIT: t("company.edit_company")
};

// 表单数据
const formData = reactive({
  id: undefined as number | undefined,
  companyName: "",
  address: "",
  phoneNumber: "",
  email: "",
  countryId: "",
  remark: "",
  username: "",
  password: ""
});

// 表单校验
const formRules: FormRules = {
  companyName: [{ required: true, message: () => t("company.please_enter_company_name"), trigger: "blur" }],
  username: [{ required: true, message: () => t("company.please_enter_username"), trigger: "blur" }],
  password: [{ required: true, message: () => t("company.please_enter_password"), trigger: "blur" }]
};

// 加载国家列表
const loadCountries = async () => {
  try {
    const res: any = await getCountries();
    if (res.Data) {
      countryList.value = res.Data || [];
    }
  } catch (error) {
    console.error(error);
  }
};

// 加载数据
const loadData = async () => {
  try {
    const res: any = await getCompanyList();
    if (res.Data) {
      tableData.value = res.Data || [];
    }
  } catch (error) {
    console.error(error);
  }
};

// 重置表单
const resetForm = () => {
  formData.id = undefined;
  formData.companyName = "";
  formData.address = "";
  formData.phoneNumber = "";
  formData.email = "";
  formData.countryId = "";
  formData.remark = "";
  formData.username = "";
  formData.password = "";
  formRef.value?.clearValidate();
};

// 打开弹窗
const openDialog = (title: string, row: any = {}) => {
  dialogTitle.value = title;
  isEdit.value = title === t("company.edit_company");
  resetForm();
  if (isEdit.value) {
    formData.id = row.id;
    formData.companyName = row.companyName || "";
    formData.address = row.address || "";
    formData.phoneNumber = row.phoneNumber || "";
    formData.email = row.email || "";
    formData.countryId = row.countryId || "";
    formData.remark = row.remark || "";
  }
  dialogVisible.value = true;
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async valid => {
    if (!valid) return;
    submitLoading.value = true;
    try {
      if (isEdit.value && formData.id) {
        const params = {
          companyName: formData.companyName,
          address: formData.address || null,
          phoneNumber: formData.phoneNumber || null,
          email: formData.email || null,
          countryId: formData.countryId.toString() || null,
          remark: formData.remark || null
        };
        await updateCompany(formData.id, params);
        ElMessage.success(t("company.update_success"));
      } else {
        const params = {
          companyName: formData.companyName,
          address: formData.address || null,
          phoneNumber: formData.phoneNumber || null,
          email: formData.email || null,
          countryId: formData.countryId.toString() || null,
          remark: formData.remark || null,
          username: formData.username,
          password: formData.password
        };
        await addCompany(params);
        ElMessage.success(t("company.add_success"));
      }
      dialogVisible.value = false;
      loadData();
    } catch (error) {
      console.error(error);
    } finally {
      submitLoading.value = false;
    }
  });
};

// 删除公司
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(t("company.confirm_delete_company"), t("company.tip"), {
      confirmButtonText: t("company.confirm"),
      cancelButtonText: t("company.cancel"),
      type: "warning"
    });
    await deleteCompany(row.id);
    ElMessage.success(t("company.delete_success"));
    loadData();
  } catch (error) {
    if (error !== "cancel") {
      console.error(error);
    }
  }
};

// 初始化
onMounted(() => {
  loadCountries();
  loadData();
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
    padding: 18px;
    margin-bottom: 16px;
    background: #ffffff;
    .el-form {
      .el-form-item__content > * {
        width: 100%;
      }
    }
    .search-buttons {
      display: flex;
    }
  }
  .el-table {
    flex: 1;
    width: 100%;
    table {
      width: 100%;
    }
    .el-table__header th {
      height: 45px;
      font-size: 15px;
      font-weight: bold;
      color: var(--el-text-color-primary);
      background: var(--el-fill-color-light);
    }
    .el-table__row {
      height: 45px;
      font-size: 14px;
    }
  }
}
</style>
