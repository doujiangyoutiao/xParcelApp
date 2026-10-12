<template>
  <div class="table-box">
    <!-- 顶部操作栏 -->
    <div class="table-search">
      <el-form :model="searchForm" inline>
        <el-form-item :label="t('customer.customer_name')">
          <el-input
            v-model="searchForm.filterQuery"
            :placeholder="t('customer.please_enter_customer_name')"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
      </el-form>
      <div class="search-buttons">
        <div>
          <el-button type="primary" @click="handleSearch">{{ t("customer.search") }}</el-button>
          <el-button @click="resetSearch">{{ t("customer.reset") }}</el-button>
        </div>
        <el-button type="primary" :icon="Plus" @click="openDialog(dialogTitles.ADD)">{{ t("customer.add_customer") }}</el-button>
      </div>
    </div>

    <!-- 表格 -->
    <el-table :data="tableData" border stripe height="calc(100vh - 280px)">
      <el-table-column prop="name" :label="t('customer.customer_name')" min-width="120" />
      <el-table-column prop="contact" :label="t('customer.contact')" width="100" />
      <el-table-column prop="phone" :label="t('customer.phone')" width="120" />
      <el-table-column prop="email" :label="t('customer.email')" min-width="160" show-overflow-tooltip />
      <el-table-column prop="companyName" :label="t('customer.company')" min-width="120" />
      <el-table-column :label="t('customer.country')" width="100">
        <template #default="{ row }">
          {{ formatCountryDisplayName(row.countryName) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="t('customer.status')" width="80" />
      <el-table-column :label="t('customer.operation')" align="center" fixed="right" width="190">
        <template #default="scope">
          <el-button type="primary" link :icon="Link" @click="openMobileOrderLink(scope.row)" />
          <el-button type="primary" link :icon="EditPen" @click="openDialog(dialogTitles.EDIT, scope.row)" />
          <el-button type="primary" link :icon="Delete" @click="handleDelete(scope.row)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.pageNumber"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑客户弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" destroy-on-close align-center>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="right">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('customer.customer_name')" prop="name">
              <el-input v-model="formData.name" :placeholder="t('customer.please_enter_customer_name')" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('customer.contact')" prop="contact">
              <el-input v-model="formData.contact" :placeholder="t('customer.please_enter_contact')" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('customer.phone')" prop="phone">
              <el-input v-model="formData.phone" :placeholder="t('customer.please_enter_phone')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('customer.email')" prop="email">
              <el-input v-model="formData.email" :placeholder="t('customer.please_enter_email')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col v-if="!isCompanyAccount" :span="12">
            <el-form-item :label="t('customer.company')" prop="companyId">
              <el-select
                v-model="formData.companyId"
                :placeholder="t('customer.please_select_company')"
                clearable
                filterable
                @change="handleCompanyChange"
              >
                <el-option v-for="item in companyList" :key="item.id" :label="item.companyName" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('customer.country')" prop="countriesId">
              <el-select v-model="formData.countriesId" :placeholder="t('customer.please_select_country')" clearable filterable>
                <el-option v-for="item in countryList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="t('customer.address')" prop="address">
          <el-input v-model="formData.address" :placeholder="t('customer.please_enter_address')" maxlength="200" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="t('customer.province')" prop="province">
              <el-input v-model="formData.province" :placeholder="t('customer.please_enter_province')" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="t('customer.city')" prop="city">
              <el-input v-model="formData.city" :placeholder="t('customer.please_enter_city')" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="t('customer.postal_code')" prop="postalCode">
              <el-input v-model="formData.postalCode" :placeholder="t('customer.please_enter_postal_code')" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 服务选择 -->
        <el-form-item v-if="serviceOptions.length > 0" :label="t('customer.service')" prop="serviceIds">
          <el-checkbox-group v-model="formData.serviceIds">
            <el-checkbox v-for="item in serviceOptions" :key="item.serviceId" :label="item.serviceId">
              {{ item.serviceCode }} - {{ item.description }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <!-- 新增时显示用户账号信息 -->
        <template v-if="!isEdit">
          <el-divider content-position="left">{{ t("customer.login_account") }}</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="t('customer.username')" prop="username">
                <el-input v-model="formData.username" :placeholder="t('customer.please_enter_username')" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('customer.password')" prop="password">
                <el-input
                  v-model="formData.password"
                  type="password"
                  show-password
                  :placeholder="t('customer.please_enter_password')"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t("customer.cancel") }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ t("customer.confirm") }}</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="mobileOrderDialogVisible" title="Mobile Order QR" width="520px" destroy-on-close align-center>
      <div class="mobile-order-link-dialog" v-if="mobileOrderLink.url">
        <img class="mobile-order-qr" :src="qrCodeUrl(mobileOrderLink.url)" alt="Mobile order QR code" />
        <el-input v-model="mobileOrderLink.url" readonly>
          <template #append>
            <el-button @click="copyMobileOrderLink">Copy</el-button>
          </template>
        </el-input>
        <el-button type="primary" @click="openMobileOrderPage">Open Page</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="CustomerList">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";
import { Plus, Delete, EditPen, Link } from "@element-plus/icons-vue";
import {
  getCustomerList,
  getCustomerById,
  getCustomerCreateOptions,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerMobileOrderLink
} from "@/api/modules/customer";
import { getCompanyList, getCountries } from "@/api/modules/company";
import { useUserStore } from "@/stores/modules/user";
import { useI18n } from "vue-i18n";
import { formatCountryDisplayName } from "@/utils";

const { t } = useI18n();

// 搜索
const searchForm = reactive({
  filterOn: "name",
  filterQuery: ""
});

// 表格

const tableData = ref<any[]>([]);
const pagination = reactive({
  pageNumber: 1,
  pageSize: 10,
  total: 0
});

// 下拉数据
const companyList = ref<any[]>([]);
const countryList = ref<any[]>([]);
const serviceOptions = ref<any[]>([]);
const userStore = useUserStore();
const isCompanyAccount = computed(() => {
  const userInfo = userStore.getUserInfo;
  return !!userInfo?.companyId && !userInfo?.customerId;
});

// 弹窗
const dialogVisible = ref(false);
const dialogTitle = ref("");
const isEdit = ref(false);
const submitLoading = ref(false);
const formRef = ref<FormInstance>();
const mobileOrderDialogVisible = ref(false);
const mobileOrderLink = reactive({
  url: "",
  token: ""
});

const dialogTitles = {
  ADD: t("customer.add_customer"),
  EDIT: t("customer.edit_customer")
};

// 表单
const formData = reactive({
  id: undefined as number | undefined,
  name: "",
  contact: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  status: "",
  companyId: undefined as number | undefined,
  countriesId: undefined as number | undefined,
  serviceIds: [] as number[],
  username: "",
  password: ""
});

const formRules: FormRules = {
  name: [{ required: true, message: () => t("customer.please_enter_customer_name"), trigger: "blur" }],
  contact: [{ required: true, message: () => t("customer.please_enter_contact"), trigger: "blur" }],
  countriesId: [{ required: true, message: () => t("customer.please_select_country"), trigger: "change" }],
  email: [
    { required: true, message: () => t("customer.please_enter_email"), trigger: "blur" },
    { type: "email", message: () => t("customer.please_enter_correct_email"), trigger: "blur" }
  ],
  username: [{ required: true, message: () => t("customer.please_enter_username"), trigger: "blur" }],
  password: [{ required: true, message: () => t("customer.please_enter_password"), trigger: "blur" }]
};

// 加载数据
const loadData = async () => {
  try {
    const params = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      filterOn: searchForm.filterQuery ? searchForm.filterOn : undefined,
      filterQuery: searchForm.filterQuery || undefined
    };
    let res: any = await getCustomerList(params);
    res = res.Data;
    if (res.data) {
      tableData.value = res.data || [];
      pagination.total = res.totalCount || 0;
    }
  } catch (error) {
    console.error(error);
  }
};

// 加载下拉数据
const loadDropdownData = async () => {
  try {
    const [companyRes, countryRes]: any[] = await Promise.all([getCompanyList(), getCountries()]);
    if (companyRes.Data) companyList.value = companyRes.Data || [];
    if (countryRes.Data) countryList.value = countryRes.Data || [];
  } catch (error) {
    console.error(error);
  }
};

// 搜索
const handleSearch = () => {
  pagination.pageNumber = 1;
  loadData();
};

const resetSearch = () => {
  searchForm.filterQuery = "";
  pagination.pageNumber = 1;
  loadData();
};

// 分页大小改变
const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  pagination.pageNumber = 1;
  loadData();
};

// 当前页改变
const handleCurrentChange = (val: number) => {
  pagination.pageNumber = val;
  loadData();
};

// 重置表单
const resetForm = () => {
  formData.id = undefined;
  formData.name = "";
  formData.contact = "";
  formData.phone = "";
  formData.email = "";
  formData.address = "";
  formData.city = "";
  formData.province = "";
  formData.postalCode = "";
  formData.status = "";
  formData.companyId = undefined;
  formData.countriesId = undefined;
  formData.serviceIds = [];
  formData.username = "";
  formData.password = "";
  serviceOptions.value = [];
  formRef.value?.clearValidate();
};

// 公司变更时加载服务选项
const handleCompanyChange = async (companyId: number) => {
  formData.serviceIds = [];
  serviceOptions.value = [];
  if (!companyId) return;
  try {
    const res: any = await getCustomerCreateOptions(companyId);
    if (res.Data) {
      serviceOptions.value = res.Data || [];
    }
  } catch (error) {
    console.error(error);
  }
};

// 打开弹窗
const openDialog = async (title: string, row: any = {}) => {
  dialogTitle.value = title;
  isEdit.value = title === t("customer.edit_customer");
  resetForm();
  // 公司账号默认设置companyId并加载服务选项
  if (!isEdit.value && isCompanyAccount.value) {
    formData.companyId = userStore.getUserInfo!.companyId as number;
    handleCompanyChange(formData.companyId);
  }
  if (isEdit.value && row.id) {
    try {
      const res: any = await getCustomerById(row.id);
      if (res.Data) {
        const d = res.Data;
        formData.id = d.id;
        formData.name = d.name || "";
        formData.contact = d.contact || "";
        formData.phone = d.phone || "";
        formData.email = d.email || "";
        formData.address = d.address || "";
        formData.city = d.city || "";
        formData.province = d.province || "";
        formData.postalCode = d.postalCode || "";
        formData.status = d.status || "";
        formData.companyId = d.companyId;
        formData.countriesId = d.countriesId;
        // 加载服务选项并设置已选中
        if (d.companyId) {
          const sRes: any = await getCustomerCreateOptions(d.companyId);
          if (sRes.Data) {
            serviceOptions.value = sRes.Data || [];
            formData.serviceIds = (d.services || []).filter((s: any) => s.isSelected).map((s: any) => s.serviceId);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  dialogVisible.value = true;
};

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async valid => {
    if (!valid) return;
    submitLoading.value = true;
    try {
      if (isEdit.value && formData.id) {
        const params = {
          name: formData.name,
          contact: formData.contact,
          phone: formData.phone || null,
          email: formData.email,
          address: formData.address || null,
          city: formData.city || null,
          province: formData.province || null,
          postalCode: formData.postalCode || null,
          status: formData.status || null,
          companyId: formData.companyId,
          countriesId: formData.countriesId,
          serviceIds: formData.serviceIds.length > 0 ? formData.serviceIds : null
        };
        await updateCustomer(formData.id, params);
        ElMessage.success(t("customer.update_success"));
      } else {
        const params = {
          name: formData.name,
          contact: formData.contact,
          phone: formData.phone || null,
          email: formData.email,
          address: formData.address || null,
          city: formData.city || null,
          province: formData.province || null,
          postalCode: formData.postalCode || null,
          status: formData.status || null,
          companyId: formData.companyId,
          countriesId: formData.countriesId,
          username: formData.username,
          password: formData.password,
          serviceIds: formData.serviceIds.length > 0 ? formData.serviceIds : null
        };
        await addCustomer(params);
        ElMessage.success(t("customer.add_success"));
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

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(t("customer.confirm_delete_customer"), t("customer.tip"), {
      confirmButtonText: t("customer.confirm"),
      cancelButtonText: t("customer.cancel"),
      type: "warning"
    });
    await deleteCustomer(row.id);
    ElMessage.success(t("customer.delete_success"));
    loadData();
  } catch (error) {
    if (error !== "cancel") {
      console.error(error);
    }
  }
};

const qrCodeUrl = (url: string) => `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;

const openMobileOrderLink = async (row: any) => {
  try {
    const res: any = await getCustomerMobileOrderLink(row.id);
    const data = res?.Data || res?.data || res;
    mobileOrderLink.url = data.url || data.Url || "";
    mobileOrderLink.token = data.token || data.Token || "";
    mobileOrderDialogVisible.value = true;
  } catch (error: any) {
    ElMessage.error(error?.Data || error?.Message || error?.message || "Failed to generate mobile order link");
  }
};

const copyMobileOrderLink = async () => {
  if (!mobileOrderLink.url) return;
  await navigator.clipboard.writeText(mobileOrderLink.url);
  ElMessage.success("Copied");
};

const openMobileOrderPage = () => {
  if (mobileOrderLink.url) {
    window.open(mobileOrderLink.url, "_blank");
  }
};

onMounted(() => {
  loadDropdownData();
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
      flex: 1;
      justify-content: space-between;
      > div {
        display: flex;
        gap: 15px;
      }
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
  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding: 16px 0 0;
  }
}
.mobile-order-link-dialog {
  display: grid;
  gap: 16px;
  justify-items: center;
}
.mobile-order-qr {
  width: 220px;
  height: 220px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}
</style>
