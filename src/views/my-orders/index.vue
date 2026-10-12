<template>
  <div class="Margins">
    <el-row class="button-group" :span="24">
      <el-card style="width: 100%">
        <span style="display: flex; border-bottom: 1px solid #ebeef5">
          <button
            v-for="(item, index) in orderData"
            :key="index"
            @click="handleButtonClick(item.id)"
            :class="['custom-button', { active: state.activeButton === item.id }]"
          >
            <div class="text">
              <div class="count">{{ item.count }}</div>
              <div class="label">{{ $t(`orderlist.${item.name}`) }}</div>
            </div>
          </button>
        </span>
      </el-card>
    </el-row>
    <el-row :span="24">
      <el-card style="width: 100%">
        <el-row :span="24">
          <el-form ref="queryFormRef" style="width: 100%" :model="queryParams" :inline="true">
            <el-row>
              <el-col :span="10">
                <el-col>
                  <el-form-item>
                    <el-select v-model="query.hawbNumberType" placeholder="Select">
                      <el-option :label="$t('orderlist.logistics_tracking_number')" value="shipmentNumber" />
                      <el-option :label="$t('orderlist.customer_reference_number')" value="referenceNumber" />
                      <el-option :label="$t('orderlist.recipient')" value="ConsigneeName" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col style="margin-top: -20px">
                  <el-form-item>
                    <el-input
                      v-model="query.shipmentNumber"
                      :autosize="{ minRows: 2, maxRows: 20 }"
                      type="textarea"
                      :placeholder="searchTextareaPlaceholder[query.hawbNumberType]"
                  /></el-form-item>
                </el-col>
              </el-col>
              <el-col style="margin-left: 20px" :xs="24" :sm="10" :md="10" :lg="10" :xl="10">
                <el-row :gutter="20">
                  <el-col>
                    <el-form-item class="custom-form-item">
                      <el-date-picker
                        v-model="searchDate"
                        type="daterange"
                        unlink-panels
                        range-separator="To"
                        start-placeholder="Start date"
                        end-placeholder="End date"
                        :shortcuts="shortcuts"
                        @change="handleButtonClick('')"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item>
                      <el-select
                        clearable
                        collapse-tags
                        collapse-tags-tooltip
                        filterable
                        v-model="query.selectServe"
                        :placeholder="$t('orderlist.service')"
                        multiple
                      >
                        <!-- 自定义分组内容 -->
                        <template v-for="(item, index) in formattedServices" :key="index">
                          <!-- 自定义分组标题 -->
                          <el-option :value="item.serviceCode">
                            <div class="provider-option">
                              <span class="provider-logo-wrap">
                                <img
                                  v-if="getProviderLogoUrl(item.companyLogo)"
                                  class="provider-logo"
                                  :src="getProviderLogoUrl(item.companyLogo)"
                                  :alt="item.coloaderCode || item.serviceCode"
                                />
                                <span v-else class="provider-logo-fallback">{{
                                  getProviderInitial(item.coloaderCode || item.serviceCode)
                                }}</span>
                              </span>
                              <span>{{ item.serviceCode }}</span>
                            </div>
                          </el-option>
                        </template>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item>
                      <el-select
                        collapse-tags
                        collapse-tags-tooltip
                        clearable
                        filterable
                        v-model="query.selectCountry"
                        multiple
                        :placeholder="$t('orderlist.country')"
                      >
                        <el-option v-for="item in select.dataCountry" :key="item.code" :label="item.name" :value="item.code" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-col>

              <el-col :span="1.5">
                <el-col>
                  <el-form-item>
                    <el-button type="primary" :icon="Search" @click="handleButtonClick('')">{{
                      $t("orderlist.track")
                    }}</el-button>
                  </el-form-item>
                </el-col>
              </el-col>
            </el-row>
            <!-- 客户服务国家 -->
            <el-row v-show="state.isExpanded">
              <el-col :xs="7" :sm="7" :md="7" :lg="7" :xl="9"> </el-col>
            </el-row>
          </el-form>
        </el-row>
        <el-row style="display: flex; justify-content: flex-end">
          <el-button :icon="Printer" @click="handleSelectOrderPrintLabel()">{{ $t("orderlist.print_labels") }}</el-button>
          <el-button :icon="Printer" @click="handleSelectOrderPrintInvoice()">{{ $t("orderlist.print_invoice") }}</el-button>
          <el-button @click="handleExportShipment()">{{ $t("orderlist.export_orders") }}</el-button>
        </el-row>
        <div>
          <order-table
            :on-query="handleQuery"
            :ted-row-keys="state.tedRowKeys"
            :query-params="state.excelParams"
            :hawb-number="query.shipmentNumber"
          />
        </div>
        <el-table
          :header-cell-style="{ background: '#fbfbfb', color: '#606266' }"
          :data="state.tableList"
          @selection-change="handleSelectionChange"
          style="width: 100%; min-height: 430px"
        >
          <el-table-column type="selection" width="32" />
          <el-table-column width="164" fixed="left" :label="$t('orderlist.logistics_tracking_number')">
            <template #default="scope">
              <div class="hawb-container">
                <div class="hawb-number-cell" @click="details(scope.row.id)">
                  <el-tooltip :content="scope.row.shipmentNumber || '--'" placement="top-start">
                    <span class="hawb-number">{{ scope.row.shipmentNumber || "--" }}</span>
                  </el-tooltip>
                  <span class="hawb-text">
                    <el-tooltip
                      v-if="scope.row.childHawbCount > 1"
                      :content="`${scope.row.childHawbCount} Child Packages`"
                      placement="top"
                    >
                      <el-tag color="#009094">
                        <span style="color: #ffffff">{{ scope.row.childHawbCount }}</span>
                      </el-tag>
                    </el-tooltip>
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column v-if="showCustomerColumn" prop="customerName" label="Customer" min-width="180" show-overflow-tooltip />
          <el-table-column :label="$t('orderlist.state')" width="96">
            <template #default="scope">
              <el-tooltip class="box-item" effect="dark" placement="top-start">
                <template #content>
                  <div>{{ formatDate(scope.row.lastTrackEventtime) }}[{{ scope.row.lastTrackLocationName }}]</div>
                  <div>{{ scope.row.lastTrackDesc }}</div>
                  <!-- 这里是插槽内容 -->
                </template>
                <el-tag
                  effect="plain"
                  :style="{
                    borderRadius: '4px',
                    padding: '2px 10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    border: 'none',
                    borderColor: getTagColor(scope.row.shipmentStatus),
                    background: backgroundColor(scope.row.shipmentStatus),
                    color: getTagSizeColor(scope.row.shipmentStatus)
                  }"
                >
                  {{ scope.row.shipmentStatus }}
                </el-tag>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column min-width="124" :label="$t('orderlist.customer_reference_number')" show-overflow-tooltip>
            <template #default="scope">
              <span class="single-line-cell">{{ scope.row.referenceNumber || "--" }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="144" :label="$t('orderlist.recipient')">
            <template #default="scope">
              <el-tooltip :content="formatRecipientTooltip(scope.row)" placement="top-start">
                <div class="recipient-cell">
                  <span class="single-line-cell">{{ scope.row.receiverName || "--" }}</span>
                  <span v-if="scope.row.receiverCountry" class="country-code">{{ scope.row.receiverCountry }}</span>
                </div>
              </el-tooltip>
            </template>
          </el-table-column>

          <el-table-column min-width="132" :label="$t('orderlist.service')">
            <template #default="scope">
              <div class="provider-cell">
                <span class="provider-logo-wrap table-logo">
                  <img
                    v-if="getServiceLogoUrl(scope.row.serviceCode)"
                    class="provider-logo"
                    :src="getServiceLogoUrl(scope.row.serviceCode)"
                    :alt="scope.row.serviceCode"
                  />
                  <span v-else class="provider-logo-fallback">{{ getProviderInitial(scope.row.serviceCode) }}</span>
                </span>
                <el-tooltip :content="scope.row.serviceCode || '--'" placement="top-start">
                  <span class="single-line-cell">{{ scope.row.serviceCode || "--" }}</span>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>

          <el-table-column :label="$t('orderlist.order_date')" width="112">
            <template #default="scope">
              {{ formatDate(scope.row.shipmentDate) }}
            </template>
          </el-table-column>

          <el-table-column fixed="right" :label="$t('orderlist.action')" width="72" align="center">
            <template #default="scope">
              <div class="image-container">
                <span class="action-icon">
                  <el-tooltip class="item" effect="dark" content="label" placement="top">
                    <el-icon @click="handleOrderPrintLabel(scope)"><Printer /></el-icon>
                  </el-tooltip>
                </span>
                <span class="action-icon">
                  <el-tooltip class="item" effect="dark" content="invoice" placement="top">
                    <el-icon @click="handleOrderPrintInvoice(scope)"><Printer /></el-icon>
                  </el-tooltip>
                </span>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-col style="display: flex; justify-content: flex-end; padding-top: 20px">
          <el-pagination
            v-if="state.pageConfig.pageTotal > 0"
            v-model:current-page="state.pageConfig.pageNumber"
            v-model:page-size="state.pageConfig.pageSize"
            :page-sizes="[10, 20, 50, 100, 500]"
            background
            layout="total, prev, pager, next, sizes, jumper"
            :total="state.pageConfig.pageTotal"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </el-col>
      </el-card>
    </el-row>
    <OrderDetails ref="detailsList" />
    <!-- <ticketDetails ref="TicketList" /> -->
  </div>
</template>

<script lang="ts" setup>
import { ElTableColumn, ElTag, ElMessage } from "element-plus";
// import SvgIcon from "@/components/SvgIcon/index.vue";
import { Search, Printer } from "@element-plus/icons-vue";
import { reactive, ref, toRefs, onMounted, computed, onBeforeUnmount } from "vue";
// import { ArrowDown } from "@element-plus/icons-vue";
import { ADCOrderQueryParam, ADCOrderItem, titleQuery } from "./orders";
import OrderDetails from "@/components/OrderDetails/index.vue";
// import TicketDetails from "@/views/order/list/components/ticketDetails.vue";
import OrderTable from "./components/OrderTable.vue";
import {
  //getCustomerList,
  getServiceForSpanner,
  getCountry,
  getOrderList,
  printLabel,
  getPrintInvoice,
  exportOrderExcel
  //getCaseHawbDetailList
} from "@/api/modules/orderList";
import moment from "moment";
import { PageConfig } from "./interface/common.d";

import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/modules/user";
//import router from "@/routers";
import { useI18n } from "vue-i18n";
import { getProviderInitial, getProviderLogoUrl } from "@/utils/providerLogo";
const { t } = useI18n();
//import { useI18n } from "vue-i18n";
//const { t } = useI18n();
const route = useRoute();
const userStore = useUserStore();
const currentUser = computed(() => userStore.getUserInfo as any);
const currentUserLevel = computed(() => String(currentUser.value?.userLevel || "").toUpperCase());
const currentUsername = computed(() => String(currentUser.value?.username || "").toLowerCase());
const isCustomerAccount = computed(() => currentUserLevel.value === "C" || !!currentUser.value?.customer);
const isSuperAdminAccount = computed(() => {
  const companyId = Number(currentUser.value?.companyId || 0);
  return (
    currentUsername.value === "yuan" ||
    ["S", "SA", "SUPER", "SUPERADMIN"].includes(currentUserLevel.value) ||
    (currentUserLevel.value === "A" && !isCustomerAccount.value && companyId <= 0)
  );
});
const showCustomerColumn = computed(() => {
  const companyId = Number(currentUser.value?.companyId || 0);
  return isSuperAdminAccount.value || (currentUserLevel.value === "A" && companyId > 0 && !isCustomerAccount.value);
});

// useRouter
// const dropdownItems = ref(["return", "cancelled"]);
const CACHE_KEY = "ADCOrderState"; //缓存用的
// 定义 emit
// const emit = defineEmits(["updateTable"]);
const shortcuts = [
  {
    text: "Last week",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    }
  },
  {
    text: "Last month",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    }
  },
  {
    text: "Last 3 months",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    }
  }
];
// const handleToCreateOrder = (id: any) => {
//   router.push("/createorder?id=" + id);
// };
const lastWeekDay = new Date(new Date().getTime() - 3600 * 1000 * 24 * 30); //默认一个月
// const yesterday = new Date(new Date().getTime() - 3600 * 1000 * 24);

const state = reactive({
  customeShow: false,
  iconStyle: {
    width: "25px",
    height: "25px"
  },
  isExpanded: false,
  tableList: [] as any, //table 数据
  tedRowKeys: [] as any, //table复选框的数据
  queryData: {
    allNum: 0,
    createdNum: 0,
    printedNum: 0,
    inTransitNum: 0,
    returnNum: 0,
    cancel: 0,
    deliveredNum: 0,
    cancelled: 0,
    exceptionNum: 0 //新加的状态
  } as any,
  activeButton: "1", //当前选中的title 例如 all
  // searchTextareaPlaceholder: {
  //   shipmentNumber: t("orderlist.supports_different_numbers"),
  //   ConsigneeName: t("orderlist.supports_querying_recipient"),
  //   referenceNumber: t("orderlist.supports_querying_customerreferencenumbers")
  // },
  select: {
    dataCustome: [],
    dataService: [],
    dataCountry: []
  } as any,
  query: {
    selectCustome: [], //客户select选中的
    selectServe: [], //服务
    selectCountry: [], //国家
    hawbNumberType: "shipmentNumber", //默认值
    shipmentNumber: ""
  } as titleQuery,
  queryParams: {
    origin: "",
    orderStatus: undefined,
    destination: "",
    startDate: "",
    endDate: "",
    skipCount: 0,
    maxResultCount: 10
  } as ADCOrderQueryParam,
  excelParams: {} as any,
  searchDate: [lastWeekDay, new Date()] as [Date, Date],
  pageConfig: {
    pageSize: 10,
    pageTotal: 0,
    pageNumber: 1
  } as PageConfig,
  ADCOrderList: [] as ADCOrderItem[]
});

const { queryParams, searchDate, select, query } = toRefs(state);

const orderData = ref([
  { name: "all", count: "0", label: "All Order", id: "" },
  { name: "created", count: "0", label: "Created", id: "10" },
  { name: "printed", count: "0", label: "Printed", id: "20" },
  { name: "inTransit", count: "0", label: "InTransit", id: "30" },
  { name: "exception", count: "0", label: "Exception", id: "50" },
  { name: "delivered", count: "0", label: "Delivered", id: "100" },
  { name: "return", count: "0", label: "Return", id: "60" },
  { name: "cancelled", count: "0", label: "Cancelled", id: "20" }
]);
const searchTextareaPlaceholder = computed(() => ({
  shipmentNumber: t("orderlist.supports_different_numbers"),
  ConsigneeName: t("orderlist.supports_querying_recipient"),
  referenceNumber: t("orderlist.supports_querying_customerreferencenumbers")
}));
// const getImageUrl = (code: string) => {
//   return new URL(`../img/${code}.png`, import.meta.url).href;
// };

const formatRecipientTooltip = (row: any) => {
  return [row?.receiverName, row?.receiverCountry].filter(Boolean).join(" · ") || "--";
};
// const orderSelect = ref([
//   { name: "return", icon: Return, count: "0", label: "Return", id: "50" },
//   { name: "cancelled", icon: Canceled, count: "0", label: "cancelled", id: "25" }
// ]);
function handleButtonClick(name: any) {
  state.activeButton = name; //title 当前选中的状态
  console.log(state.activeButton, "state.activeButton");
  handleQuery();
}
// async function customerData() {
//   let customerData = localStorage.getItem("customerData");
//   if (customerData) {
//     state.select.dataCustome = JSON.parse(customerData);
//   } else {
//     let AgentId = null;
//     const data: any = await getCustomerList(AgentId);
//     state.select.dataCustome = data.result.slice(0, 30);
//     localStorage.setItem("customerData", JSON.stringify(data.result));
//   }
//   //如果客户没值就不展示
//   if (state.select.dataCustome[0] && Object.keys(state.select.dataCustome[0].children).length === 0) {
//     state.customeShow = false;
//   } else {
//     state.customeShow = true;
//   }
// }

async function serveData() {
  // 检查sessionStorage中是否有保存的数据
  let cachedData = sessionStorage.getItem("dataService");
  console.log(cachedData);
  const cachedServiceList = cachedData && cachedData != "undefined" ? JSON.parse(cachedData) : null;
  const hasLogoCache = Array.isArray(cachedServiceList) && cachedServiceList.some(item => item.companyLogo);
  if (hasLogoCache) {
    // 如果有保存的数据，直接使用
    state.select.dataService = cachedServiceList;
  } else {
    // 如果没有保存的数据，执行请求
    const data: any = await getServiceForSpanner();
    state.select.dataService = data.Data;
    // 将请求到的数据保存在sessionStorage中
    sessionStorage.setItem("dataService", JSON.stringify(data.Data));
  }
}

// async function serveData() {
//   const data: any = await getServiceForSpanner();
//   state.select.dataService = data.result;
// }
// 格式化数据结构
const formattedServices = computed(() => state.select.dataService);
const getServiceLogoUrl = (serviceCode?: string) => {
  const service = formattedServices.value.find((item: any) => item.serviceCode === serviceCode);
  return getProviderLogoUrl(service?.companyLogo);
};
//使用计算属性生成服务图标路径
// const countryIcons = computed(() => {
//   const icons: Record<string, string> = {};
//   formattedServices.value.forEach(service => {
//     const icon = service.parent.countryIcon;
//     icons[icon] = new URL(`../img/${icon}.png`, import.meta.url).href;
//   });
//   return icons;
// });
// 国家list
// function countryData() {
//   getCountry().then((data: any) => {
//     state.select.dataCountry = data.result;
//   });
// }
async function countryData() {
  // 检查sessionStorage中是否有保存的国家数据
  let cachedCountryData = sessionStorage.getItem("dataCountry");

  if (cachedCountryData && cachedCountryData != "undefined") {
    // 如果有保存的数据，直接使用
    state.select.dataCountry = JSON.parse(cachedCountryData);
  } else {
    // 如果没有保存的数据，执行请求
    const data: any = await getCountry();
    console.log(data.Data);
    state.select.dataCountry = data.Data;

    // 将请求到的数据保存在sessionStorage中
    sessionStorage.setItem("dataCountry", JSON.stringify(data.result));
  }
}

function formatDate(date: any) {
  return date.split("T")[0];
}

// 定义状态边框
const getTagColor = (status: string) => {
  switch (status) {
    case "Created":
      return "#B8E0E2";
    case "InTransit":
      return "#9FCEFF";
    case "Printed":
      return "#F2D09D";
    case "Delivered":
      return "#B3E09C";
    case "Exception":
      return "#EDB5D3";
    case "Return":
      return "#FAB5B5";
    case "Cancelled":
      return "#DADADA";
    default:
      return "#f76560";
  }
};

// 定义状态对应的颜色 文字
const getTagSizeColor = (status: string) => {
  switch (status) {
    case "Created":
      return "#009094";
    case "InTransit":
      return "#337ecc";
    case "Printed":
      return "#ff7d00";
    case "Delivered":
      return "#009a29";
    case "Exception":
      return "#EB2F96";
    case "Return":
      return "#F53F3F";
    case "Cancelled":
      return "#606266";
    default:
      return "#f76560";
  }
};

// 定义状态对应的背景颜色映射
const backgroundColor = (status: string) => {
  switch (status) {
    case "Created":
      return "#ebf7f7";
    case "InTransit":
      return "#e8f3ff";
    case "Printed":
      return "#fdf2e0";
    case "Delivered":
      return "#E7F6E0";
    case "Exception":
      return "#ffe9f5";
    case "Return":
      return "#FFECE8";
    case "Cancelled":
      return "#f1f2f2";
    default:
      return "#909399";
  }
};

// 进度条
// const percenTage = (status: any) => {
//   switch (status) {
//     case "Created":
//       return 20;
//     case "InTransit":
//       return 60;
//     case "Printed":
//       return 50;
//     case "Delivered":
//       return 100;
//     case "Exception":
//       return 100;
//     case "Return":
//     case "Cancelled":
//       return 70;
//     default:
//       return 20;
//   }
// };

// 当前分页显示的数据

const handleSizeChange = (newSize: number) => {
  state.queryParams.maxResultCount = newSize;
  handleQuery();
};

const handleCurrentChange = (newPage: number) => {
  state.pageConfig.pageNumber = newPage;
  handleQuery();
};
// function toggle() {
//   state.isExpanded = !state.isExpanded; // 切换状态
//   // console.log(formattedServices.value, "服务");
// }

/* table 被选中的值 */
function handleSelectionChange(
  val: Array<{ id?: string; serviceCode?: string; shipmentNumber?: string; shipmentStatus?: string }>
) {
  state.tedRowKeys = val.map(item => `${item.id}|${item.shipmentNumber}|${item.serviceCode}|${item.shipmentStatus}`);
}

/* 订单列表导出 */
function handleExportShipment() {
  if (state.activeButton == "") {
    state.queryData = {
      createdNum: 0,
      printedNum: 0,
      inTransitNum: 0,
      exceptionNum: 0,
      returnNum: 0,
      deliveredNum: 0,
      cancel: 0,
      allNum: 0,
      cancelled: 0
    };
  }
  // const childCustomerValues: string[] = Object.values(state.query.selectCustome as Record<string, string>).map(
  //   value => value.split("|")[1]
  // ); //清除选择客户多余数据
  state.queryParams.startDate = moment(state.searchDate[0]).format("YYYY-MM-DDTHH:mm:ss");
  state.queryParams.endDate = moment(state.searchDate[1]).format("YYYY-MM-DDTHH:mm:ss");
  console.log(state.query.selectServe, "123");
  const country = state.query.selectCountry.map(item => item.slice(-2));
  const params: any = {
    //Start: state.queryParams.skipCount,
    //Length: state.queryParams.maxResultCount,
    startDate: state.queryParams.startDate,
    endDate: state.queryParams.endDate,
    //childCustomerId: childCustomerValues,
    serviceCode: state.query.selectServe,
    country: country,
    shipmentNumber: state.query.shipmentNumber,
    hawbNumberType: state.query.hawbNumberType,
    shipmentStatus: state.activeButton == "" ? null : parseInt(state.activeButton)
  };
  state.excelParams = params;
  console.log("---------------");
  console.log(params);

  exportOrderExcel(params).then((data: any) => {
    window.open(data.Data.ExportExcelUrl, "_blank");
  });
}

/* 打印label */
function handleOrderPrintLabel(order) {
  if (order.row.shipmentStatus === "Cancelled") {
    ElMessage.error(order.row.shipmentNumber + " Cancelled order is not supported !");
    return;
  }
  const hawbNumberList: string[] = [];
  hawbNumberList.push(order.row.shipmentNumber);
  printLabel({
    shipmentNo: hawbNumberList
  }).then((res: any) => {
    if (res.Data?.labelUrl) {
      window.open(res.Data.labelUrl, "_blank");
    } else {
      ElMessage.error(res.Data?.message || "Failed to get label URL");
      return;
    }
  });
}

/* 批量打印label */
function handleSelectOrderPrintLabel() {
  console.log(state.tedRowKeys);

  const hawbNumberList: string[] = [];
  state.tedRowKeys.forEach(element => {
    const arr = element.split("|");
    if (arr[3] === "Cancelled") {
      ElMessage.error(arr[1] + " Cancelled order is not supported !");
      return;
    }
    hawbNumberList.push(arr[1]);
  });
  printLabel({
    shipmentNo: hawbNumberList
  }).then((res: any) => {
    if (res.Data?.labelUrl) {
      window.open(res.Data.labelUrl, "_blank");
    } else {
      ElMessage.error(res.Data?.message || "Failed to get label URL");
      return;
    }
  });
}

/* 打印发票 */
function handleOrderPrintInvoice(order) {
  if (order.row.shipmentStatus === "Cancelled") {
    ElMessage.error(order.row.shipmentNumber + " Cancelled order is not supported !");
    return;
  }
  const hawbNumberList: string[] = [];
  hawbNumberList.push(order.row.shipmentNumber);
  const params = {
    ShipmentNo: hawbNumberList
  };
  getPrintInvoice(params).then((res: any) => {
    if (res.Data?.labelUrl) {
      let encodedUrl = encodeURI(res.Data.labelUrl);
      window.open(encodedUrl, "_blank", "noreferrer");
    } else {
      ElMessage.error(res.Data?.message || "Failed to get invoice URL");
      return;
    }
  });
}

/* 批量打印发票 */
function handleSelectOrderPrintInvoice() {
  const hawbNumberList: string[] = [];
  state.tedRowKeys.forEach(element => {
    const arr = element.split("|");
    if (arr[3] === "Cancelled") {
      ElMessage.error(arr[1] + " Cancelled order is not supported !");
      return;
    }
    hawbNumberList.push(arr[1]);
  });
  getPrintInvoice({
    shipmentNo: hawbNumberList
  }).then((res: any) => {
    if (res.Data?.labelUrl) {
      window.open(res.Data.labelUrl, "_blank");
    } else {
      ElMessage.error(res.Data?.message || "Failed to get invoice URL");
      return;
    }
  });
}

/**
 * 查询
 */
function handleQuery(): void {
  if (state.activeButton == "") {
    state.queryData = {
      createdNum: 0,
      printedNum: 0,
      inTransitNum: 0,
      exceptionNum: 0,
      returnNum: 0,
      deliveredNum: 0,
      cancel: 0,
      allNum: 0,
      cancelled: 0
    };
  }
  const childCustomerValues: string[] = Object.values(state.query.selectCustome as Record<string, string>).map(
    value => value.split("|")[1]
  ); //清除选择客户多余数据
  state.queryParams.startDate = moment(state.searchDate[0]).format("YYYY-MM-DDTHH:mm:ss");
  state.queryParams.endDate = moment(state.searchDate[1]).format("YYYY-MM-DDTHH:mm:ss");
  state.queryParams.skipCount = (state.pageConfig.pageNumber - 1) * state.pageConfig.pageSize;
  state.queryParams.maxResultCount = state.pageConfig.pageSize;
  console.log(state.query.selectServe, "123");
  const country = state.query.selectCountry.map(item => item.slice(-2));
  const params: any = {
    Start: state.queryParams.skipCount,
    Length: state.queryParams.maxResultCount,
    startDate: state.queryParams.startDate,
    endDate: state.queryParams.endDate,
    childCustomerId: childCustomerValues,
    serviceCode: state.query.selectServe,
    country: country,
    shipmentNumber: state.query.shipmentNumber,
    hawbNumberType: state.query.hawbNumberType,
    shipmentStatus: state.activeButton == "" ? null : parseInt(state.activeButton)
  };
  state.excelParams = params;
  console.log("---------------");
  console.log(params);
  getOrderList(params).then((data: any) => {
    console.log(data.Data.data);
    state.tableList = data.Data.data.data;
    state.pageConfig.pageTotal = data.Data.data.recordsFiltered;
    const dataa = JSON.parse(data.Data.data.sumData);
    console.log(dataa);
    dataa.forEach(item => {
      if (item.Name === "Created") {
        state.queryData.createdNum = item.Count;
      }
      if (item.Name === "Printed") {
        state.queryData.printedNum = item.Count;
      }
      if (item.Name === "InTransit") {
        state.queryData.inTransitNum = item.Count;
      }
      if (item.Name === "Exception") {
        state.queryData.exceptionNum = item.Count;
      }
      if (item.Name === "Return") {
        state.queryData.returnNum = item.Count;
      }
      if (item.Name === "Delivered") {
        state.queryData.deliveredNum = item.Count;
      }
      if (item.Name === "Cancel") {
        state.queryData.cancel = item.Count;
      }
      if (item.Name === "cancelled") {
        state.queryData.cancelled = item.Count;
      }
      allNum();
    });
    if (state.activeButton == "") {
      //拿到数量后去修改title上的数量
      orderData.value = orderData.value.map(order => {
        if (order.name === "all") {
          return { ...order, count: state.queryData.allNum.toLocaleString() };
        }
        if (order.name === "created") {
          return { ...order, count: state.queryData.createdNum.toLocaleString() };
        }
        if (order.name === "printed") {
          return { ...order, count: state.queryData.printedNum.toLocaleString() };
        }
        if (order.name === "inTransit") {
          return { ...order, count: state.queryData.inTransitNum.toLocaleString() };
        }
        if (order.name === "exception") {
          return { ...order, count: state.queryData.exceptionNum?.toLocaleString() || "0" };
        }
        if (order.name === "delivered") {
          return { ...order, count: state.queryData.deliveredNum.toLocaleString() };
        }
        if (order.name === "return") {
          return { ...order, count: state.queryData.returnNum.toLocaleString() };
        }
        if (order.name === "cancelled") {
          return { ...order, count: state.queryData.cancel?.toLocaleString() || "0" };
        }
        return order;
      });
    } else if (state.activeButton == "10") {
      orderData.value = orderData.value.map(order => {
        if (order.name === "created") {
          return { ...order, count: state.queryData.createdNum.toLocaleString() };
        }
        return order;
      });
      // allNum();
    } else if (state.activeButton == "20") {
      orderData.value = orderData.value.map(order => {
        if (order.name === "printed") {
          return { ...order, count: state.queryData.printedNum.toLocaleString() };
        }
        return order;
      });
      // allNum();
    } else if (state.activeButton == "30") {
      orderData.value = orderData.value.map(order => {
        if (order.name === "inTransit") {
          return { ...order, count: state.queryData.inTransitNum.toLocaleString() };
        }
        return order;
      });
      // allNum();
    } else if (state.activeButton == "50") {
      orderData.value = orderData.value.map(order => {
        if (order.name === "exception") {
          return { ...order, count: state.queryData.exceptionNum?.toLocaleString() || "0" };
        }
        return order;
      });
      // allNum();
    } else if (state.activeButton == "100") {
      orderData.value = orderData.value.map(order => {
        if (order.name === "delivered") {
          return { ...order, count: state.queryData.deliveredNum.toLocaleString() };
        }
        return order;
      });
      // allNum();
    } else if (state.activeButton == "60") {
      orderData.value = orderData.value.map(order => {
        if (order.name === "return") {
          return { ...order, count: state.queryData.returnNum.toLocaleString() };
        }
        return order;
      });
      // allNum();
    } else if (state.activeButton == "40") {
      orderData.value = orderData.value.map(order => {
        if (order.name === "cancelled") {
          return { ...order, count: state.queryData.cancel?.toLocaleString() || "0" };
        }
        return order;
      });
      // allNum();
    }
  });
}
//这个是全部ALL数量
function allNum(): void {
  state.queryData.allNum = Object.keys(state.queryData).reduce((total, key) => {
    if (key !== "allNum") {
      // 排除 allNum
      total += state.queryData[key]; // 累加其他数字
    }
    return total; // 返回累计结果
  }, 0);
  orderData.value[0].count = state.queryData.allNum; // 最种全部的数量
}

const detailsList = ref();
function details(row: any): void {
  console.log(row);
  detailsList.value.details(row);
}

function loadStateFromCache() {
  const cachedData = sessionStorage.getItem(CACHE_KEY);
  if (cachedData) {
    const parsedData = JSON.parse(cachedData);
    Object.assign(state, parsedData); // 将缓存数据合并到 state
  }
  handleButtonClick("");
}
onBeforeUnmount(() => {
  const dataToCache = JSON.stringify(state);
  sessionStorage.setItem(CACHE_KEY, dataToCache);
});
onMounted(() => {
  if (route.query.activeButton) {
    state.searchDate = [lastWeekDay, new Date()] as [Date, Date];
    handleButtonClick(route.query.activeButton);
  } else if (route.query.datePicker) {
    state.searchDate = [new Date(), new Date()] as [Date, Date];
    handleButtonClick("");
  } else {
    //读取缓存在调用handleButtonClick
    loadStateFromCache();
  }

  setTimeout(() => {
    //customerData();
    serveData();
    countryData();
  }, 1000);
});
</script>
<!-- 1px solid #ebeef5 -->
<style lang="scss" scoped>
:deep(.el-table__body tr:hover > td) {
  background-color: #f2f9fa !important;
}
::v-deep .button-group {
  display: flex;
  justify-content: space-between;
  width: 100%;

  // margin-bottom: 15px;
  background-color: #ffffff;
  .el-card__body {
    padding: 0 !important;
  }
}
.custom-button {
  position: relative; /* 为了定位下拉框 */
  display: flex;
  flex: 1;

  // flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 15px;
  text-align: left; /* 改变为左对齐 */
  cursor: pointer;
  background-color: transparent;
  border: none;
  transition:
    background-color 0.3s,
    border-bottom-color 0.3s; /* 平滑过渡效果 */
}
.custom-button:hover {
  background-color: #fbfbfb; /* 背景色变化 */
}
.custom-button.active:hover {
  border-bottom: 2px solid #92ccce; /* 鼠标悬停时的底部边框颜色 */
}
.text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.count {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}
.label {
  padding-top: 1px;
  font-size: 14px;
  color: #909399;
}
.custom-button.active {
  background-color: #f2f9fa;
  border-bottom: 1px solid #009094;
  .count {
    color: #009094;
    text-align: center;
  }
  .label {
    color: #79c5c7;
    text-align: center;
  }
}
.el-dropdown-menu {
  width: 150px; /* 自定义下拉菜单的宽度 */
}
.el-dropdown-item {
  display: flex;
  align-items: center;
}
.el-dropdown-item .icon {
  margin-right: 8px; /* 调整图标与文字的间距 */
}
.el-dropdown-link:focus {
  outline: none;
}
.option-group-header,
.provider-option,
.provider-cell {
  display: flex;
  gap: 8px;
  align-items: center;
}
.option-group-header {
  font-weight: bold;
}
.provider-cell {
  min-width: 0;
}
.single-line-cell,
.hawb-number {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hawb-number {
  flex: 1;
  color: #009094;
}
.recipient-cell {
  display: flex;
  gap: 6px;
  align-items: center;
  min-width: 0;
}
.recipient-cell .single-line-cell {
  flex: 1;
}
.country-code {
  flex: 0 0 auto;
  padding: 1px 5px;
  font-size: 11px;
  line-height: 18px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  border-radius: 3px;
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
.provider-logo-wrap.table-logo {
  width: 34px;
  height: 22px;
}
.provider-logo {
  max-width: 32px;
  max-height: 18px;
  object-fit: contain;
}
.table-logo .provider-logo {
  max-width: 28px;
  max-height: 16px;
}
.provider-logo-fallback {
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  color: var(--el-text-color-secondary);
}
.country-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}
.el-option.is-disabled {
  font-weight: normal;
}
.custom-form-item {
  width: 100%; /* 让子元素填满父元素的宽度 */
}
.el-form--inline .el-form-item {
  width: 100%;
}
.image-container {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}
.action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #409eff;
  cursor: pointer;
}
.operation-image {
  width: 16px;
  height: 16px;
  cursor: pointer;
  object-fit: cover;
}
.hide {
  .el-icon svg {
    color: #009094;
  }
}
::v-deep .el-table__inner-wrapper {
  border-top: 1px solid #ebeef5;
}
::v-deep .el-progress__text {
  display: none;
}
::v-deep .el-card.is-always-shadow,
.el-card.is-hover-shadow:focus,
.el-card.is-hover-shadow:hover {
  border: none;
  box-shadow: none;
}
::v-deep .el-input__wrapper {
  border-radius: 2px;
}
::v-deep .el-select__wrapper {
  border-radius: 2px;
}
::v-deep .el-textarea__inner {
  border-radius: 2px;
}
::v-deep .el-form-item__content {
  display: flex;
  justify-content: flex-end;
}
.Margins {
  background-color: #f8f8f8;
}
.hawb-text {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  color: #009094;
  word-break: break-word;
  white-space: normal;
}
</style>

<!-- copy -->
<style scoped>
.hawb-container {
  display: flex;
  flex-wrap: wrap;
  gap: 5px; /* 间距 */
  align-items: center;
  cursor: pointer;
}

/* .hawb-number-cell {
  display: flex;
  align-items: center;
} */
.hawb-number-cell {
  display: flex;
  gap: 5px;
  align-items: center;
  width: 100%;
  min-width: 0;
  line-height: 1.4;
}
.icon-wrapper {
  display: none; /* 默认隐藏图标 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  padding-left: 2px;
}
.hawb-number-cell:hover .icon-wrapper {
  display: flex; /* 悬停时显示图标 */
}
.icon-hover {
  width: 20px;
  height: 20px;
  color: #009094;
  cursor: pointer;
}
.icon-hover:hover {
  color: #ffffff;
  cursor: pointer;
  background-color: #009094;
  border-radius: 2px; /* 设置圆角 */
}
</style>
