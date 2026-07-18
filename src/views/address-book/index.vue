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
      <el-table-column prop="name" :label="t('addressBook.recipient')" min-width="120" />
      <el-table-column prop="phone" :label="t('addressBook.phone')" width="120" />
      <el-table-column prop="email" :label="t('addressBook.email')" width="150" />
      <el-table-column prop="address" :label="t('addressBook.address')" show-overflow-tooltip />
      <el-table-column prop="city" :label="t('addressBook.city')" width="100" />
      <el-table-column prop="country" :label="t('addressBook.country_code')" width="100" />
      <el-table-column prop="isDefault" :label="t('addressBook.is_default')" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.isDefault ? 'success' : 'info'" size="small">
            {{ scope.row.isDefault ? t("addressBook.yes") : t("addressBook.no") }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="creationTime" :label="t('addressBook.creation_time')" width="180">
        <template #default="scope">
          {{ moment(scope.row.creationTime).format("YYYY-MM-DD HH:mm:ss") }}
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="650px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="right">
        <el-form-item :label="t('addressBook.recipient_name')" prop="name">
          <el-input v-model="formData.name" :placeholder="t('addressBook.please_enter_recipient_name')" />
        </el-form-item>
        <el-form-item :label="t('addressBook.phone')" prop="phone">
          <el-input v-model="formData.phone" :placeholder="t('addressBook.please_enter_phone')" />
        </el-form-item>
        <el-form-item :label="t('addressBook.email')">
          <el-input v-model="formData.email" :placeholder="t('addressBook.please_enter_email')" />
        </el-form-item>
        <el-form-item :label="t('addressBook.address')" prop="address">
          <el-input v-model="formData.address" :placeholder="t('addressBook.please_enter_address')" />
        </el-form-item>
        <el-form-item :label="t('addressBook.address2')">
          <el-input v-model="formData.address2" :placeholder="t('addressBook.address2_placeholder')" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('addressBook.city')" prop="city">
              <el-input v-model="formData.city" :placeholder="t('addressBook.please_enter_city')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('addressBook.state_province')">
              <el-input v-model="formData.state" :placeholder="t('addressBook.state_placeholder')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('addressBook.postal_code')" prop="postCode">
              <el-input v-model="formData.postCode" :placeholder="t('addressBook.please_enter_postal_code')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('addressBook.country_code_label')" prop="country">
              <el-input v-model="formData.country" :placeholder="t('addressBook.country_code_placeholder')" maxlength="2" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="t('addressBook.set_as_default')">
          <el-switch v-model="formData.isDefault" />
        </el-form-item>
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
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { Plus, Delete, EditPen, Download } from "@element-plus/icons-vue";
import { getAddressBooks, addAddressBook } from "@/api/modules/addressBook";
import { useI18n } from "vue-i18n";
import moment from "moment";

const { t, locale } = useI18n();

// 表格数据
const loading = ref(false);
const tableData = ref<any[]>([]);
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
  name: "",
  phone: "",
  email: "",
  address: "",
  address2: "",
  city: "",
  state: "",
  postCode: "",
  country: "",
  isDefault: false
});

// 表单校验规则
const formRules: FormRules = {
  name: [{ required: true, message: () => t("addressBook.please_enter_recipient_name"), trigger: "blur" }],
  phone: [{ required: true, message: () => t("addressBook.please_enter_phone"), trigger: "blur" }],
  address: [{ required: true, message: () => t("addressBook.please_enter_address"), trigger: "blur" }],
  city: [{ required: true, message: () => t("addressBook.please_enter_city"), trigger: "blur" }],
  postCode: [{ required: true, message: () => t("addressBook.please_enter_postal_code"), trigger: "blur" }],
  country: [
    { required: true, message: () => t("addressBook.please_enter_country_code"), trigger: "blur" },
    { min: 2, max: 2, message: () => t("addressBook.country_code_rule"), trigger: "blur" }
  ]
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
    const params = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword
    };
    const res: any = await getAddressBooks(params);
    if (res.data) {
      tableData.value = res.data.items || [];
      pagination.total = res.data.totalCount || 0;
    }
  } catch (error) {
    console.error(error);
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
  formData.name = "";
  formData.phone = "";
  formData.email = "";
  formData.address = "";
  formData.address2 = "";
  formData.city = "";
  formData.state = "";
  formData.postCode = "";
  formData.country = "";
  formData.isDefault = false;
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
    formData.name = row.name || "";
    formData.phone = row.phone || "";
    formData.email = row.email || "";
    formData.address = row.address || "";
    formData.address2 = row.address2 || "";
    formData.city = row.city || "";
    formData.state = row.state || "";
    formData.postCode = row.postCode || "";
    formData.country = row.country || "";
    formData.isDefault = !!row.isDefault;
    dialogVisible.value = true;
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async valid => {
    if (!valid) return;
    submitLoading.value = true;
    try {
      if (formData.id) {
        // 编辑功能暂未实现
        ElMessage.warning(t("addressBook.edit_not_available"));
        return;
      } else {
        // 新增地址簿
        const params = {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          address2: formData.address2,
          city: formData.city,
          state: formData.state,
          postCode: formData.postCode,
          country: formData.country,
          isDefault: formData.isDefault
        };
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

// 删除操作（暂未实现）
const handleDelAddressBook = async (row: any) => {
  console.log(row);
  // TODO: 调用删除接口 deleteAddressBook({ id: row.id })
  ElMessage.warning(t("addressBook.delete_not_available"));
};

// 导出功能（暂未实现）
const handleExport = () => {
  // TODO: 调用导出接口，参数与表格查询类似
  ElMessage.warning(t("addressBook.export_not_available"));
};

// 初始化
onMounted(() => {
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
