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
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" :xxl="8">
        <el-form-item :label="$t('orderentry.consignee_name')" prop="hawbRecipient.contact">
          <el-input v-model="ruleForm.hawbRecipient.contact" :placeholder="$t('orderentry.Company_enter')" />
        </el-form-item>
      </el-col>

      <!-- 公司名称 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" :xxl="8">
        <el-form-item :label="$t('orderentry.contact_person')" prop="hawbRecipient.company">
          <el-input v-model="ruleForm.hawbRecipient.company" :placeholder="$t('orderentry.contact_placeholder')" />
        </el-form-item>
      </el-col>

      <!-- 电话 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" :xxl="8">
        <el-form-item :label="$t('orderentry.phone')" prop="hawbRecipient.phone">
          <el-input v-model="ruleForm.hawbRecipient.phone" :placeholder="$t('orderentry.please_enter')" />
        </el-form-item>
      </el-col>

      <!-- 邮箱 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" :xxl="8">
        <el-form-item :label="$t('orderentry.email')" prop="hawbRecipient.email">
          <el-input v-model="ruleForm.hawbRecipient.email" :placeholder="$t('orderentry.please_enter')" />
        </el-form-item>
      </el-col>
      <!-- 收件人EORI -->
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" :xxl="8">
        <el-form-item :label="$t('orderentry.consigneeEORINumber')" prop="hawbRecipient.eORINumber">
          <el-input v-model="ruleForm.hawbRecipient.eORINumber" :placeholder="$t('orderentry.please_enter')" />
        </el-form-item>
      </el-col>

      <!-- 收件人VAT -->
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" :xxl="8">
        <el-form-item :label="$t('orderentry.consigneeVATNumber')" prop="hawbRecipient.vATNumber">
          <el-input v-model="ruleForm.hawbRecipient.vATNumber" :placeholder="$t('orderentry.please_enter')" />
        </el-form-item>
      </el-col>

      <!-- 国家 -->
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" :xxl="24">
        <el-row>
          <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
            <el-form-item :label="$t('orderentry.country')" prop="hawbRecipient.Country">
              <el-select v-model="ruleForm.hawbRecipient.Country" :placeholder="$t('orderentry.please_select')" filterable>
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

      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" :xxl="8">
        <el-form-item :label="$t('orderentry.houseNo')" prop="hawbRecipient.houseNo">
          <el-input v-model="ruleForm.hawbRecipient.houseNo" :placeholder="$t('orderentry.please_enter')" />
        </el-form-item>
      </el-col>

      <!-- 地址 -->
      <el-col :xs="24" :sm="24" :md="24" :lg="16" :xl="16" :xxl="16">
        <el-form-item :label="$t('orderentry.street')" prop="hawbRecipient.street">
          <el-input v-model="ruleForm.hawbRecipient.street" :placeholder="$t('orderentry.please_enter')" />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from "vue";
import { FormInstance } from "element-plus";

import { getCountryList } from "@/api/modules/setting";
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
    houseNo: undefined,
    eORINumber: undefined,
    vATNumber: undefined
  }
} as any);

const ruleFormRef = ref<FormInstance>();

//const dialogVisible = ref(false); // 控制对话框显示与隐藏
const countryList = ref<any>([]);
const handleGetCountryList = () => {
  getCountryList().then(r => {
    countryList.value = (r as any).Data;
  });
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
};
const changeRuleForm = (formData: any) => {
  Object.assign(ruleForm, formData);
};
defineExpose({ getParams, resetForm, changeRuleForm });
</script>

<style lang="scss" scoped>
@import "../index";
</style>
