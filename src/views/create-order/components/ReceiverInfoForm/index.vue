<template>
  <el-form
    ref="ruleFormRef"
    class="form-padding"
    label-position="top"
    style="width: 100%"
    :model="ruleForm"
    :rules="rules"
    :size="'small'"
    label-width="auto"
    status-icon
  >
    <el-row :gutter="10">
      <!-- 姓名 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6" :xxl="6">
        <el-form-item :label="$t('orderentry.consignee_name')" prop="hawbRecipient.contact">
          <div class="recipient-contact-input">
            <el-autocomplete
              v-model="ruleForm.hawbRecipient.contact"
              class="address-book-autocomplete"
              :fetch-suggestions="queryAddressBook"
              :placeholder="$t('orderentry.Company_enter')"
              :debounce="350"
              :trigger-on-focus="false"
              clearable
              value-key="contact"
              @select="handleSelectAddress"
            >
              <template #default="{ item }">
                <div class="address-book-suggestion">
                  <span class="address-book-contact">{{ item.contact }}</span>
                  <span class="address-book-company">{{ item.company }}</span>
                </div>
              </template>
            </el-autocomplete>
            <el-button text type="primary" class="address-book-icon-btn" :icon="Notebook" @click.stop="openAddressBookPicker" />
          </div>
        </el-form-item>
      </el-col>

      <!-- 公司名称 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6" :xxl="6">
        <el-form-item :label="$t('orderentry.contact_person')" prop="hawbRecipient.company">
          <el-input v-model="ruleForm.hawbRecipient.company" :placeholder="$t('orderentry.contact_placeholder')" />
        </el-form-item>
      </el-col>

      <!-- 电话 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6" :xxl="6">
        <el-form-item :label="$t('orderentry.phone')" prop="hawbRecipient.phone">
          <el-input v-model="ruleForm.hawbRecipient.phone" :placeholder="$t('orderentry.please_enter')" />
        </el-form-item>
      </el-col>

      <!-- 邮箱 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6" :xxl="6">
        <el-form-item :label="$t('orderentry.email')" prop="hawbRecipient.email">
          <el-input v-model="ruleForm.hawbRecipient.email" :placeholder="$t('orderentry.please_enter')" />
        </el-form-item>
      </el-col>

      <!-- 国家 -->
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" :xxl="24">
        <el-row>
          <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
            <el-form-item :label="$t('orderentry.country')" prop="hawbRecipient.country">
              <el-select
                v-model="ruleForm.hawbRecipient.country"
                :placeholder="$t('orderentry.please_select')"
                filterable
                @change="handleCountryChange"
              >
                <el-option v-for="item in countryList" :key="item.code" :label="item.code" :value="item.code" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
            <el-form-item :label="$t('orderentry.province_state')" prop="hawbRecipient.state">
              <el-input v-model="ruleForm.hawbRecipient.state" :placeholder="$t('orderentry.please_enter')" />
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
            <el-form-item :label="$t('orderentry.city')" prop="hawbRecipient.city">
              <el-input v-model="ruleForm.hawbRecipient.city" :placeholder="$t('orderentry.please_enter')" />
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
            <el-form-item :label="$t('orderentry.zip_code')" prop="hawbRecipient.postalCode">
              <el-input v-model="ruleForm.hawbRecipient.postalCode" :placeholder="$t('orderentry.please_enter')" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-col>

      <!-- 地址 -->
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" :xxl="24">
        <el-form-item :label="$t('orderentry.street')" prop="hawbRecipient.street">
          <el-input v-model="ruleForm.hawbRecipient.street" :placeholder="$t('orderentry.please_enter')" />
        </el-form-item>
      </el-col>

      <el-col :span="24">
        <el-checkbox v-model="ruleForm.saveToAddressBook">
          {{ $t("orderentry.save_address_book") }}
        </el-checkbox>
      </el-col>
    </el-row>
  </el-form>

  <el-dialog v-model="addressBookDialogVisible" :title="$t('orderentry.address_book')" width="860px" destroy-on-close>
    <div class="address-book-toolbar">
      <el-input
        v-model="addressBookKeyword"
        :placeholder="$t('orderentry.address_book_search_placeholder')"
        clearable
        @keyup.enter="loadAddressBook"
      />
      <el-button type="primary" :loading="addressBookLoading" @click="loadAddressBook">
        {{ $t("orderentry.search") }}
      </el-button>
    </div>
    <el-table :data="addressBookRows" v-loading="addressBookLoading" height="420" stripe @row-dblclick="selectAddressBookRow">
      <el-table-column prop="contact" :label="$t('orderentry.consignee_name')" min-width="140" />
      <el-table-column prop="company" :label="$t('orderentry.contact_person')" min-width="150" />
      <el-table-column prop="phone" :label="$t('orderentry.phone')" width="130" />
      <el-table-column prop="country" :label="$t('orderentry.country')" width="100" />
      <el-table-column prop="street" :label="$t('orderentry.street')" min-width="220" show-overflow-tooltip />
      <el-table-column :label="$t('orderentry.operation')" width="110" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="selectAddressBookRow(row)">
            {{ $t("orderentry.confirm") }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="addressBookDialogVisible = false">{{ $t("orderentry.cancel") }}</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from "vue";
import { FormInstance } from "element-plus";
import { Notebook } from "@element-plus/icons-vue";

import { getCountryList } from "@/api/modules/setting";
import { getAddressBooks } from "@/api/modules/addressBook";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
// const iconStyle = ref({
//   width: "18px",
//   height: "18px",
//   position: "relative",
//   top: "0px",
//   paddingRight: "8px"
// });
// 表单数据模型
const ruleForm = reactive({
  saveToAddressBook: true,
  hawbRecipient: {
    company: undefined,
    contact: undefined,
    phone: undefined,
    email: undefined,
    country: undefined,
    state: undefined,
    city: undefined,
    postalCode: undefined,
    street: undefined,
    eORINumber: undefined,
    vATNumber: undefined
  }
} as any);

const ruleFormRef = ref<FormInstance>();

//const dialogVisible = ref(false); // 控制对话框显示与隐藏
const countryList = ref<any>([]);
const addressBookCache = new Map<string, any[]>();
let addressBookRequestId = 0;
const addressBookDialogVisible = ref(false);
const addressBookLoading = ref(false);
const addressBookKeyword = ref("");
const addressBookRows = ref<any[]>([]);
const handleGetCountryList = () => {
  getCountryList().then(r => {
    countryList.value = (r as any).Data;
  });
};

const getAddressBookItems = (res: any) => {
  const payload = res?.Data || res?.data || res || {};
  const items = payload.Items || payload.items || payload.Data || payload.data || [];
  return Array.isArray(items) ? items : [];
};

const queryAddressBook = (queryString: string, cb: (results: any[]) => void) => {
  const keyword = queryString.trim().toLowerCase();
  if (!keyword) {
    cb([]);
    return;
  }

  const cachedItems = addressBookCache.get(keyword);
  if (cachedItems) {
    cb(cachedItems);
    return;
  }

  const currentRequestId = ++addressBookRequestId;
  void (async () => {
    try {
      const res = await getAddressBooks(
        {
          pageNumber: 1,
          pageSize: 8,
          filterOn: "contact",
          filterQuery: keyword
        },
        {
          loading: false,
          noShowErrorTooltips: true
        }
      );
      const items = getAddressBookItems(res).map(item => ({
        ...item,
        value: item.contact
      }));
      addressBookCache.set(keyword, items);

      if (currentRequestId === addressBookRequestId) {
        cb(items);
      }
    } catch (error) {
      console.error(error);
      if (currentRequestId === addressBookRequestId) {
        cb([]);
      }
    }
  })();
};

const loadAddressBook = async () => {
  const keyword = addressBookKeyword.value.trim().toLowerCase();
  addressBookLoading.value = true;
  try {
    const res = await getAddressBooks(
      {
        pageNumber: 1,
        pageSize: 20,
        filterOn: "contact",
        filterQuery: keyword
      },
      {
        loading: false,
        noShowErrorTooltips: true
      }
    );
    addressBookRows.value = getAddressBookItems(res);
  } catch (error) {
    console.error(error);
    addressBookRows.value = [];
  } finally {
    addressBookLoading.value = false;
  }
};

const openAddressBookPicker = () => {
  addressBookDialogVisible.value = true;
  addressBookKeyword.value = ruleForm.hawbRecipient.contact || "";
  loadAddressBook();
};

const handleSelectAddress = (item: any) => {
  ruleForm.hawbRecipient.contact = item.contact || "";
  ruleForm.hawbRecipient.company = item.company || "";
  ruleForm.hawbRecipient.phone = item.phone || "";
  ruleForm.hawbRecipient.email = item.email || "";
  ruleForm.hawbRecipient.country = item.country || "";
  delete ruleForm.hawbRecipient.Country;
  ruleForm.hawbRecipient.state = item.state || "";
  ruleForm.hawbRecipient.city = item.city || "";
  ruleForm.hawbRecipient.postalCode = item.postalCode || "";
  ruleForm.hawbRecipient.street = item.street || "";
};

const selectAddressBookRow = (row: any) => {
  handleSelectAddress(row);
  addressBookDialogVisible.value = false;
};

const handleCountryChange = () => {
  delete ruleForm.hawbRecipient.Country;
};

onMounted(() => {
  handleGetCountryList();
});

// 表单验证规则
// const rules = reactive({
//   hawbRecipient: {
//     'hawbRecipient.contact': [{ required: true, message: t("orderentry.please_enter"), trigger: "change" }],
//     company: [{ required: true, message: t("orderentry.please_enter"), trigger: "change" }],
//     phone: [{ required: true, message: t("orderentry.please_enter"), trigger: "change" }],
//     email: [{ required: false, message: t("orderentry.please_enter"), trigger: "change" }],
//     country: [{ required: true, message: t("orderentry.please_enter"), trigger: "change" }],
//     city: [{ required: false, message: t("orderentry.please_enter"), trigger: "change" }],
//     postalCode: [{ required: false, message: t("orderentry.please_enter"), trigger: "change" }],
//     street: [{ required: true, message: t("orderentry.please_enter"), trigger: "change" }]
//   }
// });
const rules = reactive({
  "hawbRecipient.contact": [{ required: true, message: t("orderentry.please_enter"), trigger: "change" }],
  "hawbRecipient.company": [{ required: true, message: t("orderentry.please_enter"), trigger: "change" }],
  "hawbRecipient.phone": [{ required: true, message: t("orderentry.please_enter"), trigger: "change" }],
  "hawbRecipient.email": [{ required: false, message: t("orderentry.please_enter"), trigger: "change" }],
  "hawbRecipient.country": [{ required: true, message: t("orderentry.please_enter"), trigger: "change" }],
  "hawbRecipient.city": [{ required: false, message: t("orderentry.please_enter"), trigger: "change" }],
  "hawbRecipient.postalCode": [{ required: false, message: t("orderentry.please_enter"), trigger: "change" }],
  "hawbRecipient.street": [{ required: true, message: t("orderentry.please_enter"), trigger: "change" }]
});

// 获取表单数据
const getParams = async (v: boolean = false) => {
  delete ruleForm.hawbRecipient.Country;
  if (v) {
    let paramsValue = {};
    await ruleFormRef.value?.validate(valid => {
      if (valid) {
        paramsValue = ruleForm;
      } else {
        paramsValue = "Fail";
      }
    });
    return paramsValue;
  } else {
    return ruleForm;
  }
};

const resetForm = () => {
  ruleFormRef.value?.resetFields();
  ruleForm.saveToAddressBook = true;
};
const changeRuleForm = (formData: any) => {
  Object.assign(ruleForm, formData);
};
defineExpose({ getParams, resetForm, changeRuleForm });
</script>

<style lang="scss" scoped>
@import "../index";
.address-book-autocomplete {
  width: 100%;
}
.address-book-suggestion {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  min-width: 260px;
  line-height: 28px;
}
.address-book-contact {
  overflow: hidden;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.address-book-company {
  flex: 0 0 auto;
  max-width: 150px;
  overflow: hidden;
  color: #909399;
  text-overflow: ellipsis;
  white-space: nowrap;
}
:deep(.el-table__row) {
  cursor: pointer;
}
</style>
