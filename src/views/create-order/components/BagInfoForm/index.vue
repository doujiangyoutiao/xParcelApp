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
      <!-- 参考编号 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
        <el-form-item :label="$t('orderentry.customer_ref')" prop="referenceNumber">
          <el-input :placeholder="$t('orderentry.please_enter')" v-model="ruleForm.referenceNumber" />
        </el-form-item>
      </el-col>
      <!-- 服务编码 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
        <el-form-item :label="$t('orderentry.shipping_service')" prop="receiverCountryId">
          <el-select v-model="ruleForm.serviceCode" :placeholder="$t('orderentry.please_select')" filterable>
            <el-option v-for="item in formattedServices" :key="item.id" :label="item.serviceCode" :value="item.serviceCode">
              <div class="service-option">
                <span class="provider-logo-wrap">
                  <img
                    v-if="getProviderLogoUrl(item.companyLogo)"
                    class="provider-logo"
                    :src="getProviderLogoUrl(item.companyLogo)"
                    :alt="item.coloaderCode || item.serviceCode"
                  />
                  <span v-else class="provider-logo-fallback">
                    {{ getProviderInitial(item.coloaderCode || item.serviceCode) }}
                  </span>
                </span>
                <span>{{ item.serviceCode }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <!-- 重量 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
        <el-form-item :label="$t('orderentry.weight')" prop="weight">
          <el-input v-model="ruleForm.weight" :min="0" :placeholder="$t('orderentry.please_enter')" type="number" />
        </el-form-item>
      </el-col>
      <!-- 总件数 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
        <el-form-item :label="$t('orderentry.total_pieces')" prop="pieces">
          <el-input-number style="width: 100%" :placeholder="$t('orderentry.please_enter')" v-model="ruleForm.pieces" :min="1" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <!-- 长 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8" :xxl="8">
        <el-form-item :label="$t('orderentry.length')" prop="length">
          <el-input v-model="ruleForm.length" :min="0" :placeholder="$t('orderentry.please_enter')" type="number" />
        </el-form-item>
      </el-col>
      <!-- 宽 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8" :xxl="8">
        <el-form-item :label="$t('orderentry.width')" prop="width">
          <el-input v-model="ruleForm.width" :min="0" :placeholder="$t('orderentry.please_enter')" type="number" />
        </el-form-item>
      </el-col>
      <!-- 高 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8" :xxl="8">
        <el-form-item :label="$t('orderentry.height')" prop="height">
          <el-input v-model="ruleForm.height" :min="0" :placeholder="$t('orderentry.please_enter')" type="number" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <!-- 备注 -->
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" :xxl="24">
        <el-form-item :label="$t('orderentry.remark')" prop="remark">
          <el-input v-model="ruleForm.remark" :placeholder="$t('orderentry.please_enter')" />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted, computed } from "vue";
import type { FormInstance } from "element-plus";
import { ElInput, ElForm, ElFormItem, ElRow, ElCol } from "element-plus";
import { getServiceForSpanner } from "@/api/modules/createOrder";
import { useI18n } from "vue-i18n";
import { getProviderInitial, getProviderLogoUrl } from "@/utils/providerLogo";
const { t } = useI18n();
const serviceList = ref<any>([]);
const loadingServiceListSelect = () => {
  getServiceForSpanner().then((r: any) => {
    serviceList.value = r.Data;
  });
};
onMounted(() => {
  loadingServiceListSelect();
});

const formattedServices = computed(() => serviceList.value);

// 表单数据模型
const ruleForm = reactive<any>({
  serviceCode: undefined,
  referenceNumber: undefined,
  pieces: 1,
  weight: undefined,
  length: undefined,
  width: undefined,
  height: undefined,
  remark: undefined,
  shipmentPackageList: [{ referenceNo: "", length: "", width: "", height: "" }]
} as any);

// 表单验证规则
const rules = reactive({
  serviceCode: [{ required: true, message: t("orderentry.please_select"), trigger: "change" }],
  referenceNumber: [{ required: false, message: t("orderentry.please_customer_referencenumber"), trigger: "change" }],
  weight: [
    { required: true, message: t("orderentry.please_enter"), trigger: "blur" },
    {
      validator: (_rule: any, value: any, callback: (error?: Error) => void) => {
        Number(value) > 0 ? callback() : callback(new Error(t("orderentry.package_weight_required")));
      },
      trigger: "blur"
    }
  ],
  pieces: [{ required: true, message: t("orderentry.please_enter"), trigger: "change" }],
  remark: [{ required: false, message: t("orderentry.please_enter_remarks"), trigger: "change" }]
});

// 表单实例引用
const ruleFormRef = ref<FormInstance>();
// 获取表单数据
const getParams = async (v: boolean = false) => {
  if (v) {
    let paramsValue = {};
    await ruleFormRef.value?.validate(valid => {
      if (valid) {
        const pieces = Math.max(1, Number(ruleForm.pieces) || 1);
        const totalWeight = Number(ruleForm.weight);
        const packageWeight = Number((totalWeight / pieces).toFixed(3));
        const shipmentPackageList = Array.from({ length: pieces }, (_, index) => ({
          referenceNo: ruleForm.referenceNumber ? `${ruleForm.referenceNumber}-${index + 1}` : "",
          length: ruleForm.length,
          width: ruleForm.width,
          height: ruleForm.height,
          weight: packageWeight
        }));
        paramsValue = {
          serviceCode: ruleForm.serviceCode,
          weight: ruleForm.weight,
          referenceNumber: ruleForm.referenceNumber,
          pieces,
          remark: ruleForm.remark,
          shipmentPackageList
        };
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
.service-option {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
}
.provider-logo-wrap {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 24px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}
.provider-logo {
  max-width: 32px;
  max-height: 18px;
  object-fit: contain;
}
.provider-logo-fallback {
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  color: var(--el-text-color-secondary);
}
</style>
