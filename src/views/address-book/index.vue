<template>
  <div class="table-box">
    <!-- 表格工具栏 -->
    <div class="table-header">
      <div class="header-button-lf">
        <slot name="tableHeader" />
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="table-search">
      <el-form :model="searchForm" inline>
        <el-form-item :label="t('addressBook.recipient')">
          <el-input
            v-model="searchForm.keyword"
            :placeholder="t('addressBook.search_placeholder')"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
      </el-form>
      <div class="search-buttons">
        <div>
          <el-button type="primary" @click="handleSearch">{{ t("addressBook.search") }}</el-button>
          <el-button @click="resetSearch">{{ t("addressBook.reset") }}</el-button>
        </div>
        <div>
          <el-button :icon="Download" @click="handleExport">{{ t("addressBook.export_excel") }}</el-button>
          <el-button type="primary" :icon="Plus" @click="openDialog(dialogTitles.ADD)">{{
            t("addressBook.add_address")
          }}</el-button>
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="tableData" border stripe height="calc(100vh - 250px)">
      <el-table-column prop="contact" :label="t('orderentry.consignee_name')" min-width="130" show-overflow-tooltip />
      <el-table-column prop="company" :label="t('orderentry.contact_person')" min-width="130" show-overflow-tooltip />
      <el-table-column prop="phone" :label="t('orderentry.phone')" width="130" />
      <el-table-column prop="email" :label="t('orderentry.email')" min-width="170" show-overflow-tooltip />
      <el-table-column prop="country" :label="t('orderentry.country')" width="100" />
      <el-table-column prop="state" :label="t('orderentry.province_state')" width="120" show-overflow-tooltip />
      <el-table-column prop="city" :label="t('orderentry.city')" width="110" />
      <el-table-column prop="postalCode" :label="t('orderentry.zip_code')" width="120" />
      <el-table-column prop="houseNo" :label="t('orderentry.houseNo')" width="120" show-overflow-tooltip />
      <el-table-column prop="street" :label="t('orderentry.street')" min-width="220" show-overflow-tooltip />
      <el-table-column prop="creationTime" :label="t('addressBook.creation_time')" width="180">
        <template #default="scope">
          {{ scope.row.creationTime ? moment(scope.row.creationTime).format("YYYY-MM-DD HH:mm:ss") : "--" }}
        </template>
      </el-table-column>
      <el-table-column :label="t('addressBook.operation')" align="center" fixed="right" width="180">
        <template #default="scope">
          <el-button type="primary" link @click="openDialog(dialogTitles.EDIT, scope.row)" :icon="EditPen" />
          <el-button type="primary" link :icon="Delete" @click="handleDelAddressBook(scope.row)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="el-pagination">
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

    <!-- 新增/编辑地址簿弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="820px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" size="small">
        <el-row :gutter="10">
          <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
            <el-form-item :label="t('orderentry.consignee_name')" prop="contact">
              <el-input v-model="formData.contact" :placeholder="t('orderentry.Company_enter')" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
            <el-form-item :label="t('orderentry.contact_person')" prop="company">
              <el-input v-model="formData.company" :placeholder="t('orderentry.contact_placeholder')" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
            <el-form-item :label="t('orderentry.phone')" prop="phone">
              <el-input v-model="formData.phone" :placeholder="t('orderentry.please_enter')" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
            <el-form-item :label="t('orderentry.email')">
              <el-input v-model="formData.email" :placeholder="t('orderentry.please_enter')" />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-row :gutter="10">
              <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
                <el-form-item :label="t('orderentry.country')" prop="country">
                  <el-select v-model="formData.country" :placeholder="t('orderentry.please_select')" filterable>
                    <el-option v-for="item in countryList" :key="item.code" :label="item.code" :value="item.code" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
                <el-form-item :label="t('orderentry.province_state')" prop="state">
                  <el-input v-model="formData.state" :placeholder="t('orderentry.please_enter')" />
                </el-form-item>
              </el-col>
              <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
                <el-form-item :label="t('orderentry.city')" prop="city">
                  <el-input v-model="formData.city" :placeholder="t('orderentry.please_enter')" />
                </el-form-item>
              </el-col>
              <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
                <el-form-item :label="t('orderentry.zip_code')" prop="postalCode">
                  <el-input v-model="formData.postalCode" :placeholder="t('orderentry.please_enter')" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>

          <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
            <el-form-item :label="t('orderentry.houseNo')" prop="houseNo">
              <el-input v-model="formData.houseNo" :placeholder="t('orderentry.please_enter')" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24" :lg="16" :xl="16">
            <el-form-item :label="t('orderentry.street')" prop="street">
              <el-input v-model="formData.street" :placeholder="t('orderentry.please_enter')" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t("addressBook.cancel") }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ t("addressBook.confirm") }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="AddressBookList">
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";
import { Plus, Delete, EditPen, Download } from "@element-plus/icons-vue";
import { getAddressBooks, addAddressBook, updateAddressBook, deleteAddressBook } from "@/api/modules/addressBook";
import { getCountryList } from "@/api/modules/setting";
import { useI18n } from "vue-i18n";
import moment from "moment";

const { t, locale } = useI18n();

// 表格数据
const loading = ref(false);
const tableData = ref<any[]>([]);
const countryList = ref<any[]>([]);
const searchForm = reactive({
  keyword: ""
});

// 分页
const pagination = reactive({
  pageNumber: 1,
  pageSize: 10,
  total: 0
});

// 弹窗相关状态
const dialogVisible = ref(false);
const dialogTitle = ref("");
const submitLoading = ref(false);
const formRef = ref<FormInstance>();

// 表单数据
const formData = reactive({
  id: undefined as number | undefined,
  contact: "",
  company: "",
  phone: "",
  email: "",
  country: "",
  state: "",
  city: "",
  postalCode: "",
  houseNo: "",
  street: ""
});

// 表单校验规则
const formRules: FormRules = {
  contact: [{ required: true, message: () => t("orderentry.please_enter"), trigger: "change" }],
  company: [{ required: true, message: () => t("orderentry.please_enter"), trigger: "change" }],
  phone: [{ required: true, message: () => t("orderentry.please_enter"), trigger: "change" }],
  country: [{ required: true, message: () => t("orderentry.please_select"), trigger: "change" }],
  street: [{ required: true, message: () => t("orderentry.please_enter"), trigger: "change" }]
};

// 对话框标题常量
const dialogTitles = {
  ADD: t("addressBook.add_address"),
  EDIT: t("addressBook.edit_address")
};

// 监听语言变化刷新表格
watch(
  () => locale.value,
  () => {
    loadData();
  }
);

// 获取表格列表数据
const loadData = async () => {
  try {
    loading.value = true;
    const keyword = searchForm.keyword.trim();
    const params: any = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize
    };

    if (keyword) {
      params.filterOn = "contact";
      params.filterQuery = keyword;
    }

    const res: any = await getAddressBooks(params);
    const payload = res?.Data || res?.data || res || {};
    const items = payload.Items || payload.items || payload.Data || payload.data || [];
    tableData.value = Array.isArray(items) ? items : [];
    pagination.total = payload.Total || payload.total || tableData.value.length;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.pageNumber = 1;
  loadData();
};

// 重置搜索
const resetSearch = () => {
  searchForm.keyword = "";
  pagination.pageNumber = 1;
  loadData();
};

// 分页大小改变
const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
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
  formData.contact = "";
  formData.company = "";
  formData.phone = "";
  formData.email = "";
  formData.country = "";
  formData.state = "";
  formData.city = "";
  formData.postalCode = "";
  formData.houseNo = "";
  formData.street = "";
  formRef.value?.clearValidate();
};

// 打开弹窗
const openDialog = (title: string, row: any = {}) => {
  dialogTitle.value = title;
  resetForm();
  if (title === dialogTitles.ADD) {
    dialogVisible.value = true;
  } else {
    // 编辑时直接填充行数据（因编辑详情接口缺失）
    formData.id = row.id;
    formData.contact = row.contact || row.name || "";
    formData.company = row.company || "";
    formData.phone = row.phone || "";
    formData.email = row.email || "";
    formData.country = row.country || "";
    formData.state = row.state || "";
    formData.city = row.city || "";
    formData.postalCode = row.postalCode || row.postCode || "";
    formData.houseNo = row.houseNo || row.address2 || "";
    formData.street = row.street || row.address || "";
    dialogVisible.value = true;
  }
};

const buildAddressPayload = () => ({
  addressType: "Consignee",
  company: formData.company,
  contact: formData.contact,
  phone: formData.phone,
  email: formData.email,
  country: formData.country,
  state: formData.state,
  city: formData.city,
  postalCode: formData.postalCode,
  houseNo: formData.houseNo,
  street: formData.street
});

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async valid => {
    if (!valid) return;
    submitLoading.value = true;
    try {
      const params = buildAddressPayload();
      if (formData.id) {
        await updateAddressBook(formData.id, params);
        ElMessage.success(t("addressBook.edit_address_success"));
      } else {
        await addAddressBook(params);
        ElMessage.success(t("addressBook.add_address_success"));
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

// 删除操作
const handleDelAddressBook = async (row: any) => {
  try {
    await ElMessageBox.confirm(t("addressBook.confirm_delete_address"), t("addressBook.tip"), {
      confirmButtonText: t("addressBook.confirm"),
      cancelButtonText: t("addressBook.cancel"),
      type: "warning"
    });

    await deleteAddressBook(row.id);
    ElMessage.success(t("addressBook.delete_success"));
    if (tableData.value.length === 1 && pagination.pageNumber > 1) {
      pagination.pageNumber -= 1;
    }
    loadData();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      console.error(error);
    }
  }
};

// 导出功能（暂未实现）
const handleExport = () => {
  // TODO: 调用导出接口，参数与表格查询类似
  ElMessage.warning(t("addressBook.export_not_available"));
};

// 初始化
onMounted(() => {
  getCountryList().then((r: any) => {
    countryList.value = r?.Data || [];
  });
  loadData();
});
</script>

<style scoped lang="scss">
.table-box {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  // table-search 表格搜索样式
  .table-search {
    display: flex;
    padding: 18px 18px 0;
    margin-bottom: 16px;
    background: #ffffff;
    .el-form {
      .el-form-item__content > * {
        width: 100%;
      }

      // 去除时间选择器上下 padding
      .el-range-editor.el-input__wrapper {
        padding: 0 10px;
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

  // 表格 header 样式
  .table-header {
    .header-button-lf,
    .header-button-ri {
      display: flex;
      flex-wrap: wrap;
      gap: 15px 12px;
      margin-bottom: 16px;
      .el-button:not(.el-input .el-button) {
        margin-left: 0;
      }
    }
    .header-button-lf {
      float: left;
    }
    .header-button-ri {
      float: right;
    }
  }

  // el-table 表格样式
  .el-table {
    flex: 1;
    width: 100%;

    // 修复 safari 浏览器表格错位 https://github.com/HalseySpicy/Geeker-Admin/issues/83
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
      .move {
        cursor: move;
        .el-icon {
          cursor: move;
        }
      }
    }

    // 设置 el-table 中 header 文字不换行，并省略
    .el-table__header .el-table__cell > .cell {
      white-space: wrap;
    }

    // 解决表格数据为空时样式不居中问题(仅在element-plus中)
    .el-table__empty-block {
      position: absolute;
      .table-empty {
        line-height: 30px;
        img {
          display: inline-flex;
        }
      }
    }

    // table 中 image 图片样式
    .table-image {
      width: 50px;
      height: 50px;
      border-radius: 50%;
    }
  }

  // 表格 pagination 样式
  .el-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    background: #ffffff;
  }
}
</style>
