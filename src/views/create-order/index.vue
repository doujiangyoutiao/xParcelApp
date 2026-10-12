<template>
  <div ref="container" style="padding: 16px">
    <div class="alert">
      <el-alert type="error" v-if="resultInfo.isShow && !resultInfo.isSuccess" :closable="false" show-icon>
        <template #title>
          <span style="font-size: 14px; color: #f56c6c">{{ resultInfo.errTitle }}</span>
        </template>
        <template #default>
          {{ resultInfo.errorDes }}
        </template>
      </el-alert>
    </div>
    <!-- 折叠面板，包含多个表单部分 -->
    <el-collapse class="collapse-single" @change="handleCollapseChange" v-model="activeCollapseList">
      <!-- 发件人信息折叠项 -->
      <el-row :gutter="10">
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <el-collapse-item name="senderParams">
            <template #title>
              <div class="collapse-header">
                <div class="collapse-title">
                  {{ $t("orderentry.shipper_info") }}
                </div>
              </div>
            </template>
            <el-row>
              <SenderInfoForm ref="SenderInfoFormRef"></SenderInfoForm>
            </el-row>
          </el-collapse-item>
        </el-col>
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <!-- 收件人信息折叠项 -->
          <el-collapse-item name="receiverParams">
            <template #title>
              <div class="collapse-header">
                <div class="collapse-title">
                  {{ $t("orderentry.consignee_info") }}
                </div>
              </div>
            </template>
            <el-row>
              <ReceiverInfoForm ref="ReceiverInfoFormRef"></ReceiverInfoForm>
            </el-row>
          </el-collapse-item>
        </el-col>
      </el-row>

      <el-row :gutter="10">
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <!-- 包裹信息折叠项 -->
          <el-collapse-item name="bagParams">
            <template #title>
              <div class="collapse-header">
                <div class="collapse-title">
                  {{ $t("orderentry.package_info") }}
                </div>
              </div>
            </template>
            <el-row>
              <BagInfoForm ref="BagInfoFormRef"></BagInfoForm>
            </el-row>
          </el-collapse-item>
        </el-col>
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <!-- 其他信息折叠项 -->
          <el-collapse-item name="otherParams">
            <template #title>
              <div class="collapse-header">
                <div class="collapse-title">
                  {{ $t("orderentry.other_info") }}
                </div>
              </div>
            </template>
            <el-row>
              <OtherInfoItem ref="OtherInfoItemRef"></OtherInfoItem>
            </el-row>
          </el-collapse-item>
        </el-col>
      </el-row>
      <!-- 物品信息折叠项 -->
      <el-collapse-item name="itemParams">
        <template #title>
          <div class="collapse-header">
            <div class="collapse-title">
              {{ $t("orderentry.item_info") }}
            </div>
          </div>
        </template>
        <el-row>
          <ItemInfoForm ref="ItemInfoFormRef"></ItemInfoForm>
        </el-row>
      </el-collapse-item>
    </el-collapse>
    <el-dialog align-center class="success-order-dialog" width="520px" v-model="successDialogVisible">
      <div class="success-tips">
        <div class="icon-container">
          <img src="https://internal.hub-ez.com/hubez_ui/img/success.svg" alt="" srcset="" />
        </div>
        <span class="title">
          {{ $t("orderentry.order_uploaded_successfully") }}
        </span>
        <div class="success-subtitle">
          {{ $t("orderentry.thetracking_number") }}
        </div>
        <div class="order-no-card">
          <el-link
            @click="handleToOrderDetail(resultInfo.shipmentNo)"
            class="order-no-link"
            type="primary"
            aria-label="Copy HAWB Number"
          >
            #{{ resultInfo.shipmentNo }}
          </el-link>
          <el-button text class="copy-order-no-btn" @click="copyToClipboard(resultInfo.shipmentNo)">
            <el-icon><CopyDocument /></el-icon>
          </el-button>
        </div>
        <div class="print-container">
          <button type="button" class="print-action" @click="handlePrintTag">
            <span class="print-action__icon">
              <el-icon><Printer /></el-icon>
            </span>
            <span class="print-action__text">{{ $t("orderentry.print_label") }}</span>
          </button>
          <button type="button" class="print-action" @click="handlePrintInvice">
            <span class="print-action__icon">
              <el-icon><Printer /></el-icon>
            </span>
            <span class="print-action__text">{{ $t("orderentry.print_invoice") }}</span>
          </button>
        </div>
        <div class="btn-container">
          <el-button @click="successDialogVisible = false" class="btn-button">
            {{ $t("orderentry.copy_new_order") }}
          </el-button>
          <el-button @click="handleGoOnOrder" type="primary" class="btn-button-pr">
            {{ $t("orderentry.place_next_order") }}
          </el-button>
        </div>
      </div>
    </el-dialog>
    <!-- 固定在页面底部的按钮区域 -->
    <OrderDetails ref="detailsList" />
    <div class="submit-order">
      <el-button style="color: #4e5969; background: #f2f3f5; border: 0 none" type="info" size="default" @click="resetOrder">
        {{ $t("orderentry.reset_order") }}
      </el-button>
      <el-button type="primary" size="default" @click="submitOrder"> {{ $t("orderentry.submit_order") }} </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"; // 引入 Vue 的 ref 方法，用于创建响应式引用
import { ElMessage } from "element-plus";
//import SvgIcon from "@/components/SvgIcon/index.vue"; // 引入自定义的图标组件
import SenderInfoForm from "./components/SenderInfoForm/index.vue"; // 引入发件人信息表单组件
import BagInfoForm from "./components/BagInfoForm/index.vue"; // 引入包裹信息表单组件
import ItemInfoForm from "./components/ItemInfoForm/index.vue"; // 引入物品信息表单组件
import OtherInfoItem from "./components/OtherInfoItem/index.vue"; // 引入其他信息表单组件
import ReceiverInfoForm from "./components/ReceiverInfoForm/index.vue"; // 引入收件人信息表单组件
import OrderDetails from "@/components/OrderDetails/index.vue";
import { createOrder, printInvoice } from "@/api/modules/createOrder";
import { addAddressBook, getAddressBooks } from "@/api/modules/addressBook";
import { getOrderDetailById } from "@/api/modules/orderList";
//import { localGet } from "@/utils/index";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const route = useRoute();
const getQueryParams = () => {
  return route.query.id;
};
const handleGetHawbDetails = (id: any) => {
  if (!id) {
    return;
  }
  getOrderDetailById(id).then((r: any) => {
    const inputData = r.result;
    SenderInfoFormRef.value.changeRuleForm({
      senderName: inputData.senderName,
      senderCompany: inputData.senderCompany,
      senderPhone: inputData.senderPhone,
      senderAddress: inputData.senderAddress
    });
    ReceiverInfoFormRef.value.changeRuleForm({
      receiverName: inputData.receiverName,
      receiverContactPerson: inputData.receiverContactPerson,
      receiverTel: inputData.receiverTel,
      receiverEmail: inputData.receiverEmail,
      receiverCountryId: inputData.receiverCountryId.toString(),
      receiverProvice: inputData.receiverProvice,
      receiverCity: inputData.receiverCity,
      receiverZip: inputData.receiverZip,
      receiverAddress1: inputData.receiverAddress1
    });
    ItemInfoFormRef.value.changeRuleForm({
      declareValue: inputData.declareValue,
      content: inputData.content,
      declareCurrency: inputData.declareCurrency,
      hawbItems: inputData.hawbItems
    });
    OtherInfoItemRef.value.changeRuleForm({
      dutyType: inputData.dutyType,
      shipmentType: parseInt(inputData.shipmentType, 10),
      paymentType: inputData.paymentType,
      insuranceValue: inputData.insuranceValue,
      hawbRecipient: {
        eORINumber: inputData.receiverEoriNumber,
        vATNumber: inputData.receiverVATNumber
      },
      hawbSender: {
        eORINumber: inputData.shipperEoriNumber,
        vATNumber: inputData.shipperVATNumber
      },
      exportTaxId: inputData.exportTaxId,
      cIFCost: inputData.cifCost,
      cIFCostCurrency: inputData.cifCostCurrency
    });
    BagInfoFormRef.value.changeRuleForm({
      serviceCode: inputData.serviceCode,
      length: inputData.length,
      width: inputData.width,
      height: inputData.height,
      weight: inputData.weight,
      customerHawb: inputData.customerHawb,
      pieces: inputData.pieces,
      remark: inputData.remark,
      hawbChildren: inputData.childHawbs.map(i => {
        return {
          childCustomerHawb: i.childCustomerHawb,
          weight: i.weight,
          length: i.length,
          width: i.width,
          height: i.height
        };
      })
    });
  });
};
onMounted(() => {
  handleGetHawbDetails(getQueryParams());
});
const handlePrintTag = () => {
  window.open(resultInfo.value.labelUrl);
  //   printTag({
  //     shipmentNo: [resultInfo.value.shipmentNo],
  //     serviceCode: resultInfo.value.serviceCode
  //   }).then((r: any) => {
  //     window.open("https://" + r.result[0].url);
  //   });
};
const handlePrintInvice = () => {
  printInvoice({
    shipmentNo: [resultInfo.value.shipmentNo]
  }).then((r: any) => {
    if (r.Data?.labelUrl) {
      window.open(r.Data.labelUrl, "_blank");
    } else {
      ElMessage.error(r.Data?.message || "Failed to get invoice URL");
    }
  });
};
//const userInfo: any = localGet("userInfo");
const activeCollapseList = ref<any>(["senderParams", "receiverParams", "bagParams", "itemParams", "otherParams", "pickupParams"]);
// 表单组件的引用
const SenderInfoFormRef = ref<any>(null);
const ReceiverInfoFormRef = ref<any>(null);
const BagInfoFormRef = ref<any>(null);
const ItemInfoFormRef = ref<any>(null);
const OtherInfoItemRef = ref<any>(null);
const ApptsPickupInfoFormRef = ref<any>(null);

const allCollapseName = ["senderParams", "receiverParams", "bagParams", "itemParams", "otherParams", "pickupParams"];
// 处理折叠面板展开状态变化的函数
const handleCollapseChange = (arr: any) => {
  const arrayNoActive = allCollapseName.filter(i => {
    return !arr.includes(i);
  });

  arrayNoActive.forEach(i => {
    if (i === "senderParams") {
      SenderInfoFormRef.value?.getParams().then(r => {
        senderParams.value = r || {};
      });
    }
    if (i === "receiverParams") {
      ReceiverInfoFormRef.value?.getParams().then(r => {
        receiverParams.value = r || {};
      });
    }
    if (i === "bagParams") {
      BagInfoFormRef.value?.getParams().then(r => {
        bagParams.value = r || {};
      });
    }
    if (i === "itemParams") {
      ItemInfoFormRef.value?.getParams().then(r => {
        itemParams.value = r || {};
      });
    }
    if (i === "otherParams") {
      OtherInfoItemRef.value?.getParams().then(r => {
        otherParams.value = r || {};
      });
    }
    if (i === "pickupParams") {
      ApptsPickupInfoFormRef.value?.getParams().then(r => {
        pickupParams.value = r || {};
      });
    }
  });
};
const handleGoOnOrder = () => {
  successDialogVisible.value = false;
  resetOrder();
};

// 重置订单的函数
const resetOrder = () => {
  SenderInfoFormRef.value?.resetForm();
  ReceiverInfoFormRef.value?.resetForm();
  BagInfoFormRef.value?.resetForm();
  ItemInfoFormRef.value?.resetForm();
  OtherInfoItemRef.value?.resetForm();
  ApptsPickupInfoFormRef.value?.resetForm();
  activeCollapseList.value = allCollapseName;
};
const copyToClipboard = async text => {
  if (!text) {
    ElMessage.warning(t("orderentry.trackingnumber_empty_unablecopy"));
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success(t("orderentry.copied"));
  } catch (err) {
    ElMessage.error(t("orderentry.copyfailed_try_again"));
  }
};
const successDialogVisible = ref<any>(false);
// 提交订单的函数
const submitOrder = () => {
  setTimeout(() => {
    container.value.scrollIntoView({
      top: 0,
      behavior: "smooth"
    });
  });
  getAllFormParams();
};
const container = ref<any>(null);
// 定义表单字段数据
const senderParams = ref<any>({});
const receiverParams = ref<any>({});
const bagParams = ref<any>({});
const itemParams = ref<any>({});
const otherParams = ref<any>({});
const pickupParams = ref<any>({});
const resultInfo = ref<any>({});

const buildAddressBookPayload = (recipient: any = {}) => ({
  addressType: "Consignee",
  contact: recipient.contact || "",
  company: recipient.company || "",
  phone: recipient.phone || "",
  email: recipient.email || "",
  country: recipient.country || recipient.Country || "",
  state: recipient.state || "",
  city: recipient.city || "",
  postalCode: recipient.postalCode || "",
  street: recipient.street || ""
});

const normalizeAddressValue = (value: any) => `${value || ""}`.trim().toLowerCase();
const isSameAddress = (address: any, payload: any) => {
  return ["contact", "company", "phone", "email", "country", "state", "city", "postalCode", "street"].every(
    key => normalizeAddressValue(address?.[key]) === normalizeAddressValue(payload?.[key])
  );
};

const saveRecipientToAddressBook = async (recipient: any, enabled: boolean) => {
  const payload = buildAddressBookPayload(recipient);
  if (!enabled || !payload.contact || !payload.company || !payload.phone || !payload.country || !payload.street) {
    return;
  }

  try {
    const res: any = await getAddressBooks(
      {
        pageNumber: 1,
        pageSize: 20,
        filterOn: "contact",
        filterQuery: payload.contact
      },
      { loading: false, noShowErrorTooltips: true }
    );
    const data = res?.Data || res?.data || res || {};
    const items = data.Items || data.items || data.Data || data.data || [];
    if (Array.isArray(items) && items.some(item => isSameAddress(item, payload))) {
      return;
    }

    await addAddressBook(payload, { loading: false, noShowErrorTooltips: true });
  } catch (error) {
    console.error(error);
  }
};

// 合并所有表单的字段数据
const getAllFormParams = () => {
  Promise.all([
    SenderInfoFormRef.value?.getParams(true),
    ReceiverInfoFormRef.value?.getParams(true),
    BagInfoFormRef.value?.getParams(true),
    ItemInfoFormRef.value?.getParams(true),
    OtherInfoItemRef.value?.getParams(true)
    //ApptsPickupInfoFormRef.value?.getParams(true)
  ]).then((r: any[]) => {
    if (r.includes("Fail")) {
      activeCollapseList.value = allCollapseName;
      return;
    }

    const otherInfo = r[4] || {};
    const shouldSaveRecipientAddress = !!r[1]?.saveToAddressBook;
    const params = {
      ...r[0],
      ...r[1],
      ...r[2],
      ...r[3],
      ...otherInfo,
      hawbSender: { ...(r[0]?.hawbSender || {}), ...(otherInfo.hawbSender || {}) },
      hawbRecipient: { ...(r[1]?.hawbRecipient || {}), ...(otherInfo.hawbRecipient || {}) },
      dataFrom: "OrderEntry"
    };
    delete params.saveToAddressBook;
    // delete params.customerPickupDto.booking;
    createOrder(params)
      .then((r: any) => {
        if (r.Data.result) {
          saveRecipientToAddressBook(params.hawbRecipient, shouldSaveRecipientAddress);
          resultInfo.value = r.Data;
          successDialogVisible.value = true;
        } else {
          resultInfo.value = {
            isShow: true,
            isSuccess: false,
            errorDes: r.Data.resultMsg
          };
        }
      })
      .catch((r: any) => {
        resultInfo.value = {
          isShow: true,
          isSuccess: false,
          errorDes: r?.Message || r?.message || r?.error?.details || "",
          errTitle: r?.Message || r?.message || ""
        };
      })
      .finally(() => {
        setTimeout(() => {
          container.value.scrollIntoView({
            top: 0,
            behavior: "smooth"
          });
        });
      });
  });
};
const detailsList = ref<any>(null);
const handleToOrderDetail = (shipmentNo: any) => {
  detailsList.value.details(shipmentNo, 1);
};
// 图标样式
// const iconStyle = ref({
//   width: "18px",
//   height: "18px",
//   position: "relative",
//   top: "0px",
//   paddingRight: "8px"
// });
</script>

<style lang="scss" scoped>
:deep(.success-order-dialog.el-dialog) {
  overflow: hidden;
  border-radius: 18px;
  box-shadow: 0 24px 60px rgb(20 38 52 / 18%);
  .el-dialog__header {
    margin-right: 0;
    background: linear-gradient(180deg, #f5fbfb 0%, #ffffff 100%);
    border-bottom: none;
    .el-dialog__headerbtn .el-dialog__close {
      top: 14px;
      left: -2px;
      width: 20px;
      height: 20px;
      color: rgb(132 145 156 / 100%);
      svg {
        width: 100%;
        height: 100%;
      }
    }
  }
  .el-dialog__body {
    padding: 8px 24px 24px !important;
  }
}
.success-tips {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 78px;
    height: 78px;
    margin-top: 4px;
    background: radial-gradient(circle at center, rgb(0 144 148 / 10%) 0%, rgb(0 144 148 / 4%) 58%, transparent 60%);
    border-radius: 50%;
    img {
      width: 42px;
    }
  }
  .title {
    padding-top: 8px;
    font-size: 24px;
    font-weight: 800;
    line-height: 1.2;
    color: #12313a;
    text-align: center;
  }
  .success-subtitle {
    margin-top: 10px;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.4;
    color: #6b7a88;
  }
  .order-no-card {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
    max-width: 360px;
    padding: 12px 14px;
    margin-top: 12px;
    background: #f7fafb;
    border: 1px solid #e0eaee;
    border-radius: 12px;
  }
  .order-no-link {
    flex: 1;
    justify-content: flex-start;
    overflow: hidden;
    font-family: DIN, monospace;
    font-size: 19px;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .copy-order-no-btn {
    width: 28px;
    height: 28px;
    padding: 0;
    color: #7a8794;
  }
  .print-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    width: 100%;
    margin-top: 16px;
  }
  .print-action {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    padding: 12px 14px;
    color: #1d2f36;
    cursor: pointer;
    background: #ffffff;
    border: 1px solid #dde8eb;
    border-radius: 12px;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      transform 0.2s ease;
    &:hover {
      border-color: #97d9d5;
      box-shadow: 0 10px 24px rgb(0 144 148 / 10%);
      transform: translateY(-1px);
    }
  }
  .print-action__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    font-size: 14px;
    color: #ffffff;
    background: #009094;
    border-radius: 50%;
  }
  .print-action__text {
    font-size: 14px;
    font-weight: 700;
  }
  .btn-container {
    display: flex;
    gap: 12px;
    width: 100%;
    margin-top: 20px;
    .btn-button {
      flex: 1;
      min-height: 42px;
      font-size: 14px;
      font-weight: 700;
      color: #1b1c1e;
      background: #f4f7f8;
      border-color: #dbe6ea;
      border-radius: 10px;
    }
    .btn-button-pr {
      flex: 1;
      min-height: 42px;
      font-size: 14px;
      font-weight: 700;
      background: linear-gradient(135deg, #009094 0%, #00ab9c 100%);
      border: none;
      border-radius: 10px;
    }
  }
}
.collapse-header {
  display: flex;
  .collapse-title {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 250px;
    height: 72px;
    font-size: 14px;

    // line-height: 72px;
    color: #1d2129;
  }
  .field-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 320px;
    line-height: 18px;
    color: #000000;

    // opacity: 0.7;
  }
  .gary {
    color: #969696;
  }
  .column {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
  }
}

/* 为每个折叠面板项添加间距 */
:deep(.el-collapse-item) {
  margin-bottom: 10px;
  overflow: hidden;
  border-radius: 6px;
  box-shadow: 0 0 20px rgb(0 0 0 / 4%);
}

/* 定义折叠面板标题的样式 */
.collapse-single :deep(.el-collapse-item__header) {
  height: 48px;
  padding: 0 24px;
  border: 1px solid rgb(220 223 230 / 100%);
  border-bottom: 1px dashed rgb(220 223 230 / 100%);
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

/* 定义折叠面板整体样式 */
:deep(.el-collapse) {
  --el-collapse-border-color: transparent;
}

/* 控制折叠面板内容区域的底部填充 */
.collapse-single :deep(.el-collapse-item__content) {
  padding-bottom: 0;
  background: transparent;
  border: 1px solid rgb(220 223 230 / 100%);
  border-top: 0 none;
  border-bottom-right-radius: 6px;
  border-bottom-left-radius: 6px;
}

/* 激活状态下，折叠面板标题的背景色 */
:deep(.el-collapse-item.is-active > .el-collapse-item__header) {
  background: #fbfbfb;
}

/* 固定在页面底部的提交按钮区域样式 */
.submit-order {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40px;
  line-height: 40px;
  background: #ffffff;
  box-shadow: 0 -7.1px 15.88px 0 #00000009;
  button {
    width: 188px; /* 设置按钮宽度 */
  }
}
</style>
