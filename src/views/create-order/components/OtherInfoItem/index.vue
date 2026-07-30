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
      <!-- 纳税方式 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" :xxl="8">
        <el-form-item :label="$t('orderentry.duty_type')" prop="dutyType">
          <el-select v-model="ruleForm.dutyType" :placeholder="$t('orderentry.please_select')">
            <el-option label="Consignee(DDU)" value="DDU"></el-option>
            <el-option label="Shipper(DDP)" value="DDP"></el-option>
          </el-select>
        </el-form-item>
      </el-col>

      <!-- 货物类型 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" :xxl="8">
        <el-form-item :label="$t('orderentry.shipment_type')" prop="shipmentType">
          <el-select v-model="ruleForm.shipmentType" :placeholder="$t('orderentry.please_select')">
            <el-option label="DOCUMENT" :value="10"></el-option>
            <el-option label="PACKAGE" :value="20"></el-option>
          </el-select>
        </el-form-item>
      </el-col>

      <!-- 付款方式 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" :xxl="8">
        <el-form-item :label="$t('orderentry.payment_type')" prop="paymentType">
          <el-select v-model="ruleForm.paymentType" :placeholder="$t('orderentry.please_select')">
            <el-option label="Acc/Prepaid" value="Acc/Prepaid"></el-option>
            <el-option label="Cash" value="Cash"></el-option>
            <el-option label="COD" value="COD"></el-option>
          </el-select>
        </el-form-item>
      </el-col>

      <!-- 收件人EORI -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
        <el-form-item :label="$t('orderentry.consigneeEORINumber')" prop="hawbRecipient.eORINumber">
          <el-input v-model="ruleForm.hawbRecipient.eORINumber" :placeholder="$t('orderentry.please_enter')" />
        </el-form-item>
      </el-col>

      <!-- 收件人VAT -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
        <el-form-item :label="$t('orderentry.consigneeVATNumber')" prop="hawbRecipient.vATNumber">
          <el-input v-model="ruleForm.hawbRecipient.vATNumber" :placeholder="$t('orderentry.please_enter')" />
        </el-form-item>
      </el-col>

      <!-- 发件人EORI -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
        <el-form-item :label="$t('orderentry.shipperEoriNumber')" prop="hawbSender.eORINumber">
          <el-input v-model="ruleForm.hawbSender.eORINumber" :placeholder="$t('orderentry.please_enter')" />
        </el-form-item>
      </el-col>

      <!-- 发件人VAT -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
        <el-form-item :label="$t('orderentry.shipperVATNumber_IOSS')" prop="hawbSender.vATNumber">
          <el-input v-model="ruleForm.hawbSender.vATNumber" :placeholder="$t('orderentry.please_enter')" />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import type { FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const ruleForm = reactive({
  dutyType: "DDU",
  shipmentType: 20,
  paymentType: "Acc/Prepaid",
  hawbRecipient: {
    eORINumber: undefined,
    vATNumber: undefined
  },
  hawbSender: {
    eORINumber: undefined,
    vATNumber: undefined
  }
}) as any;

const ruleFormRef = ref<FormInstance>();

const rules = reactive({
  dutyType: [{ required: true, message: t("orderentry.please_choose_dutytype"), trigger: "change" }],
  shipmentType: [{ required: true, message: t("orderentry.please_choose_shipmenttype"), trigger: "change" }],
  paymentType: [{ required: true, message: t("orderentry.please_choose_paymenttype"), trigger: "change" }]
});

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
  if (formData.receiverEoriNumber !== undefined) ruleForm.hawbRecipient.eORINumber = formData.receiverEoriNumber;
  if (formData.receiverVATNumber !== undefined) ruleForm.hawbRecipient.vATNumber = formData.receiverVATNumber;
  if (formData.shipperEoriNumber !== undefined) ruleForm.hawbSender.eORINumber = formData.shipperEoriNumber;
  if (formData.shipperVATNumber !== undefined) ruleForm.hawbSender.vATNumber = formData.shipperVATNumber;
};
defineExpose({ getParams, resetForm, changeRuleForm });
</script>

<style lang="scss" scoped>
@import "../index";
</style>
