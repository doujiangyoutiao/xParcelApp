<template>
  <el-form
    ref="ruleFormRef"
    class="form-padding"
    label-position="top"
    style="width: 100%"
    :size="'small'"
    :model="ruleForm"
    :rules="rules"
    label-width="auto"
    status-icon
  >
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" :xxl="24">
        <el-table :data="ruleForm.shipmentItemList" style="width: 98%; margin-bottom: 12px" size="small">
          <!-- 物品品名 -->
          <el-table-column prop="content" width="200">
            <template #header>{{ $t("orderentry.content") }}</template>
            <template #default="{ row, $index }">
              <el-form-item style="margin-bottom: 0" :prop="`shipmentItemList[${$index}].content`">
                <div style="display: flex; width: 100%">
                  <el-input v-model="row.content" size="small" />
                </div>
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column prop="content" width="200">
            <template #header>{{ $t("orderentry.contentCN") }}</template>
            <template #default="{ row, $index }">
              <el-form-item style="margin-bottom: 0" :prop="`shipmentItemList[${$index}].contentCN`">
                <div style="display: flex; width: 100%">
                  <el-input v-model="row.contentCN" size="small" />
                </div>
              </el-form-item>
            </template>
          </el-table-column>

          <!-- 单价 -->
          <el-table-column prop="price" width="130">
            <template #header>{{ $t("orderentry.unit_price") }}</template>
            <template #default="{ row, $index }">
              <el-form-item
                style="margin-bottom: 0"
                :prop="`shipmentItemList[${$index}].price`"
                :rules="[{ required: false, message: t('orderentry.please_enter'), trigger: 'change' }]"
              >
                <el-input v-model="row.price" :min="0" type="number" size="small" @input="calculateTotal(row)" />
              </el-form-item>
            </template>
          </el-table-column>

          <!-- 数量 -->
          <el-table-column prop="pieces" width="130">
            <template #header>{{ $t("orderentry.qty") }}</template>
            <template #default="{ row, $index }">
              <el-form-item
                style="margin-bottom: 0"
                :prop="`shipmentItemList[${$index}].pieces`"
                :rules="[{ required: false, message: t('orderentry.please_enter'), trigger: 'change' }]"
              >
                <el-input v-model="row.pieces" :min="0" type="number" size="small" @input="calculateTotal(row)" />
              </el-form-item>
            </template>
          </el-table-column>

          <!-- 重量 -->
          <el-table-column prop="weight" width="130">
            <template #header>{{ $t("orderentry.weightL") }}</template>
            <template #default="{ row, $index }">
              <el-form-item
                style="margin-bottom: 0"
                :prop="`shipmentItemList[${$index}].weight`"
                :rules="[{ required: false, message: t('orderentry.please_enter'), trigger: 'change' }]"
              >
                <el-input v-model="row.weight" :min="0" type="number" size="small" />
              </el-form-item>
            </template>
          </el-table-column>

          <!-- 海关编码 -->
          <el-table-column prop="hsCode" width="150">
            <template #header> {{ $t("orderentry.hs_code") }} </template>
            <template #default="{ row }">
              <el-input v-model="row.hsCode" size="small" />
            </template>
          </el-table-column>

          <!-- 总价（固定到最右边）-->
          <el-table-column prop="totalPrice" fixed="right" :width="220">
            <template #header> {{ $t("orderentry.total_price") }}</template>
            <template #default="{ row, $index }">
              <div class="total-price">
                <el-input
                  v-model="row.totalPrice"
                  :disabled="true"
                  :value="row.price * row.pieces"
                  readonly
                  style="width: 120px; margin-right: 24px"
                  size="small"
                />
                <el-button size="small" link type="primary" @click="addItem">
                  <el-icon><Plus /></el-icon>
                </el-button>
                <el-button
                  size="small"
                  :disabled="ruleForm.shipmentItemList.length === 1"
                  link
                  type="primary"
                  @click="deleteItem($index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
                <el-button size="small" link type="primary" @click="copyItem($index)">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" :xxl="12"></el-col>
      <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" :xxl="12">
        <el-row style="position: relative; left: 0; width: 98%">
          <el-col :xs="13" :sm="13" :md="13" :lg="13" :xl="13" style="margin-right: 10px">
            <el-form-item :label="$t('orderentry.declared_content')" prop="content">
              <el-input v-model="ruleForm.content" />
            </el-form-item>
          </el-col>

          <el-col :xs="5" :sm="5" :md="5" :lg="5" :xl="5">
            <el-form-item :label="$t('orderentry.total_declared_value')" prop="declareValue">
              <el-input v-model="ruleForm.declareValue" />
            </el-form-item>
          </el-col>
          <el-col :xs="5" :sm="5" :md="5" :lg="5" :xl="5">
            <el-form-item class="no_mark" :label="' '" prop="declareCurrency">
              <el-select
                @change="handleDeclareCurrencyChange"
                default-first-option
                allow-create
                filterable
                :placeholder="$t('orderentry.currency')"
                clearable
                v-model="ruleForm.declareCurrency"
              >
                <el-option value="AED" label="AED"></el-option>
                <el-option value="AUD" label="AUD"></el-option>
                <el-option value="BDT" label="BDT"></el-option>
                <el-option value="BHD" label="BHD"></el-option>
                <el-option value="BND" label="BND"></el-option>
                <el-option value="CAD" label="CAD"></el-option>
                <el-option value="CHF" label="CHF"></el-option>
                <el-option value="CNY" label="CNY"></el-option>
                <el-option value="CYP" label="CYP"></el-option>
                <el-option value="CZK" label="CZK"></el-option>
                <el-option value="DKK" label="DKK"></el-option>
                <el-option value="EUR" label="EUR"></el-option>
                <el-option value="GBP" label="GBP"></el-option>
                <el-option value="HKD" label="HKD"></el-option>
                <el-option value="IDR" label="IDR"></el-option>
                <el-option value="INR" label="INR"></el-option>
                <el-option value="JPY" label="JPY"></el-option>
                <el-option value="KRW" label="KRW"></el-option>
                <el-option value="KWD" label="KWD"></el-option>
                <el-option value="LKR" label="LKR"></el-option>
                <el-option value="MMK" label="MMK"></el-option>
                <el-option value="MUR" label="MUR"></el-option>
                <el-option value="MYR" label="MYR"></el-option>
                <el-option value="NOK" label="NOK"></el-option>
                <el-option value="NZD" label="NZD"></el-option>
                <el-option value="PGK" label="PGK"></el-option>
                <el-option value="PHP" label="PHP"></el-option>
                <el-option value="PKR" label="PKR"></el-option>
                <el-option value="RMB" label="RMB"></el-option>
                <el-option value="RUB" label="RUB"></el-option>
                <el-option value="SEK" label="SEK"></el-option>
                <el-option value="SGD" label="SGD"></el-option>
                <el-option value="THB" label="THB"></el-option>
                <el-option value="TWD" label="TWD"></el-option>
                <el-option value="USD" label="USD"></el-option>
                <el-option value="VND" label="VND"></el-option>
                <el-option value="ZAR" label="ZAR"></el-option>
                <el-option value="PLN" label="PLN"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import type { FormInstance } from "element-plus";
//import ProductSelectList from "@/views/components/product-select-list/index.vue";
import { localGet, localSet } from "@/utils";
//import { getCommodityList } from "@/api/modules/setting";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
// 表单和数据模型定义
const ruleForm = reactive({
  declareValue: "",
  content: "",
  declareCurrency: localGet("singleCreateOrderDeclareCurrency") || "USD",
  shipmentItemList: [
    {
      content: "",
      contentCN: "",
      price: "",
      pieces: "",
      weight: "",
      totalPrice: 0,
      hsCode: ""
    }
  ]
} as any);

const handleDeclareCurrencyChange = (value: any) => {
  console.log(value);
  localSet("singleCreateOrderDeclareCurrency", value);
};

// 计算单个物品的总价并更新申报品名内容
const calculateTotal = (item: any) => {
  item.totalPrice = item.pieces * item.price;
  updateDeclaredContent(); // 每次更新后重新计算申报品名
  updateDeclareValue();
};

// 更新申报品名字段
const updateDeclaredContent = () => {
  const contentArray = ruleForm.shipmentItemList.map(item => `${item.content}*${item.pieces}`);
  ruleForm.content = contentArray.join(", ");
};
// 更新总申报价值
const updateDeclareValue = () => {
  // 计算所有物品的总价之和
  const totalValue = ruleForm.shipmentItemList.reduce((sum, item) => sum + item.totalPrice, 0);
  ruleForm.declareValue = totalValue; // 更新到表单的总申报价值字段
};
// 添加新物品行
const addItem = () => {
  ruleForm.shipmentItemList.push({
    content: "",
    contentCN: "",
    price: "",
    pieces: "",
    weight: "",
    totalPrice: 0,
    hsCode: ""
  });
};

// 删除当前行
const deleteItem = (index: number) => {
  if (ruleForm.shipmentItemList.length === 1) {
    return;
  }
  ruleForm.shipmentItemList.splice(index, 1);
  updateDeclaredContent(); // 每次更新后重新计算申报品名
  updateDeclareValue();
};

// 复制当前行
const copyItem = (index: number) => {
  const newItem = { ...ruleForm.shipmentItemList[index] }; // 复制当前行的数据
  ruleForm.shipmentItemList.push(newItem); // 添加新的行
  updateDeclaredContent(); // 每次更新后重新计算申报品名
  updateDeclareValue();
};

// 保存到地址簿逻辑
// const handleSaveToAddressBook = () => {
//   if (isAddAddressBook.value) {
//     Promise.all(ruleForm.shipmentItemList.map(i => updateCommodity({ id: 0, ...i }))).then(() => {
//       console.log("add success");
//     });
//   }
// };
// 表单验证规则
const rules = reactive({
  declareValue: [{ required: true, message: t("orderentry.please_enter"), trigger: "change" }],
  content: [{ required: true, message: t("orderentry.please_thedeclared_content"), trigger: "change" }],
  declareCurrency: [{ required: true, message: t("orderentry.please_select"), trigger: "change" }]
});

// 表单引用
const ruleFormRef = ref<FormInstance>();

const getParams = async (v: boolean = false) => {
  if (v) {
    let paramsValue = {};
    await ruleFormRef.value?.validate(valid => {
      if (valid) {
        let shipmentItemListList = ruleForm.shipmentItemList.filter(i => {
          return i.content;
        });
        shipmentItemListList = shipmentItemListList.map(i => {
          return {
            content: i.content,
            contentCN: i.content,
            price: i.price,
            pieces: i.pieces,
            weight: i.weight,
            totalPrice: i.totalPrice,
            hsCode: i.hsCode
          };
        });

        paramsValue = { ...ruleForm, shipmentItemList: shipmentItemListList };
      } else {
        paramsValue = "Fail";
      }
    });
    return paramsValue;
  } else {
    return { ...ruleForm };
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
<style>
.no_mark .el-form-item__label {
  opacity: 0;
}
</style>
<style lang="scss" scoped>
@import "../index";

// 自定义必填项星号样式
.required {
  font-weight: bold;
  color: red;
}
.total-price {
  display: flex;
  align-items: center;
}
.table-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}
</style>
