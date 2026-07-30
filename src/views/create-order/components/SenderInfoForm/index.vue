<template>
  <el-form
    ref="ruleFormRef"
    class="form-padding"
    label-position="top"
    style="width: 100%"
    :model="ruleForm"
    :size="'small'"
    label-width="auto"
    status-icon
  >
    <el-row :gutter="10">
      <!-- 姓名 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
        <el-form-item
          :label="$t('orderentry.shipper_name')"
          prop="hawbSender.contact"
          :rules="[{ required: true, message: t('orderentry.please_enter'), trigger: 'change' }]"
        >
          <el-input v-model="ruleForm.hawbSender.contact" />
        </el-form-item>
      </el-col>

      <!-- 公司名称 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
        <el-form-item
          :label="$t('orderentry.company_name')"
          prop="hawbSender.company"
          :rules="[{ required: true, message: t('orderentry.please_enter'), trigger: 'change' }]"
        >
          <el-input v-model="ruleForm.hawbSender.company" />
        </el-form-item>
      </el-col>

      <!-- 电话 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
        <el-form-item
          :label="$t('orderentry.phone')"
          prop="hawbSender.phone"
          :rules="[{ required: true, message: t('orderentry.please_enter'), trigger: 'change' }]"
        >
          <el-input v-model="ruleForm.hawbSender.phone" />
        </el-form-item>
      </el-col>

      <!-- 邮编 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
        <el-form-item :label="$t('orderentry.zip_code')">
          <el-input :placeholder="$t('orderentry.please_enter')" v-model="ruleForm.hawbSender.postalCode" />
        </el-form-item>
      </el-col>

      <!-- 城市 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
        <el-form-item :label="$t('orderentry.city')">
          <el-input :placeholder="$t('orderentry.please_enter')" v-model="ruleForm.hawbSender.city" />
        </el-form-item>
      </el-col>

      <!-- 地址 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
        <el-form-item
          :label="$t('orderentry.address')"
          prop="hawbSender.street"
          :rules="[{ required: true, message: t('orderentry.please_enter'), trigger: 'change' }]"
        >
          <el-input v-model="ruleForm.hawbSender.street" />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";

import type { FormInstance } from "element-plus";

import { localGet } from "@/utils/index";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
// 图标样式
// const iconStyle = ref({
//   width: "18px",
//   height: "18px",
//   position: "relative",
//   top: "0px",
//   paddingRight: "8px"
// });
const ruleForm = reactive({
  hawbSender: {
    contact: undefined,
    company: undefined,
    phone: undefined,
    street: undefined,
    city: undefined,
    postalCode: undefined,
    eORINumber: undefined,
    vATNumber: undefined
  }
} as any);
const userInfo: any = localGet("userInfo");
// 表单数据模型
const senderInfo = userInfo.customer;
ruleForm.hawbSender.contact = senderInfo.contact;
ruleForm.hawbSender.company = senderInfo.name;
ruleForm.hawbSender.phone = senderInfo.phone;
ruleForm.hawbSender.street = senderInfo.address;
ruleForm.hawbSender.city = senderInfo.city;
ruleForm.hawbSender.postalCode = senderInfo.postalCode;
const ruleFormRef = ref<FormInstance>();

//const dialogVisible = ref(false); // 控制对话框显示与隐藏

// 表单验证规则
// const rules = reactive({
//   contact: [{ required: true, message: t("orderentry.please_enter"), trigger: "change" }],
//   company: [{ required: true, message: t("orderentry.please_enter"), trigger: "change" }],
//   phone: [{ required: true, message: t("orderentry.please_enter"), trigger: "change" }],
//   street: [{ required: true, message: t("orderentry.please_enter"), trigger: "change" }]
// });

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
