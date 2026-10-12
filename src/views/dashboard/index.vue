<template>
  <div class="dashboard-page">
    <div class="dashboard-header">
      <div>
        <h2>Dashboard</h2>
        <p>{{ dashboardSubtitle }}</p>
      </div>
      <div class="header-actions">
        <el-button :icon="Refresh" :loading="loading" @click="loadDashboard">Refresh</el-button>
      </div>
    </div>

    <el-row :gutter="16" class="metric-row" :class="{ 'metric-row--customer': showMobileOrderCard }">
      <el-col
        v-for="item in metrics"
        :key="item.label"
        class="metric-col"
        :class="{ 'metric-col--customer': showMobileOrderCard }"
        :xs="24"
        :sm="12"
        :lg="metricColSpan"
      >
        <div class="metric-card" :class="{ 'metric-card--qr': item.kind === 'qr' }">
          <div v-if="item.kind !== 'qr'" class="metric-icon" :class="item.type">
            <el-icon><component :is="item.icon" /></el-icon>
          </div>
          <div v-if="item.kind !== 'qr'" class="metric-content">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <small>{{ item.hint }}</small>
          </div>
          <div v-else class="metric-qr">
            <template v-if="mobileOrderLink">
              <img :src="qrCodeUrl(mobileOrderLink)" alt="Mobile order QR code" />
            </template>
            <template v-else>
              <div class="metric-qr__placeholder">
                <span v-if="mobileOrderLoading" class="metric-qr__loading"></span>
                <span v-else class="metric-qr__placeholder-text">QR</span>
              </div>
            </template>
            <p class="metric-qr__text">
              {{
                mobileOrderLink
                  ? "Scan to place orders on mobile"
                  : mobileOrderLoading
                    ? "Generating mobile order QR..."
                    : "No mobile order link is available for this account"
              }}
            </p>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row v-if="!isCustomerAccount" :gutter="16" class="content-row">
      <el-col :xs="24" :lg="isCustomerAccount ? 24 : 15">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h3>Shipment Overview</h3>
              <p>Current order status distribution</p>
            </div>
            <el-button link type="primary" @click="goTo('/my-orders/index')">View Orders</el-button>
          </div>
          <div class="status-grid">
            <div v-for="item in orderStatuses" :key="item.name" class="status-item">
              <div class="status-top">
                <span>{{ item.label }}</span>
                <strong>{{ item.count }}</strong>
              </div>
              <el-progress :percentage="item.percent" :show-text="false" :stroke-width="8" :color="item.color" />
            </div>
          </div>
        </section>
      </el-col>

      <el-col v-if="isSuperAdminAccount" :xs="24" :lg="9">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h3>Sales Pipeline</h3>
              <p>Lead status summary</p>
            </div>
            <el-button link type="primary" @click="goTo('/sales-leads/index')">View Leads</el-button>
          </div>
          <div class="lead-summary">
            <div v-for="item in leadStatuses" :key="item.name" class="lead-status">
              <span class="lead-dot" :style="{ backgroundColor: item.color }"></span>
              <span>{{ item.name }}</span>
              <strong>{{ item.count }}</strong>
            </div>
          </div>
        </section>
      </el-col>

      <el-col v-else-if="isCompanyAccount" :xs="24" :lg="9">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h3>Company Scope</h3>
              <p>Your customer and shipment overview</p>
            </div>
            <el-button link type="primary" @click="goTo('/customer/index')">View Customers</el-button>
          </div>
          <div class="scope-list">
            <div class="scope-item">
              <span>Customers</span>
              <strong>{{ formatNumber(customerTotal) }}</strong>
            </div>
            <div class="scope-item">
              <span>Orders</span>
              <strong>{{ formatNumber(orderTotal) }}</strong>
            </div>
          </div>
        </section>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="content-row">
      <el-col :xs="24" :lg="15">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h3>Recent Orders</h3>
              <p>{{ recentOrdersSubtitle }}</p>
            </div>
          </div>
          <el-table :data="recentOrders" height="310" stripe>
            <el-table-column prop="shipmentNumber" label="Tracking No." min-width="150" show-overflow-tooltip />
            <el-table-column prop="receiverName" label="Receiver" min-width="140" show-overflow-tooltip />
            <el-table-column prop="receiverCountry" label="Country" width="90" />
            <el-table-column prop="shipmentStatus" label="Status" width="110">
              <template #default="{ row }">
                <el-tag effect="plain">{{ row.shipmentStatus || "Created" }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Date" width="130">
              <template #default="{ row }">{{ formatDate(row.shipmentDate) }}</template>
            </el-table-column>
          </el-table>
        </section>
      </el-col>

      <el-col :xs="24" :lg="9">
        <div class="side-stack">
          <section class="panel quick-panel">
            <div class="panel-header">
              <div>
                <h3>Quick Actions</h3>
                <p>Common daily operations</p>
              </div>
            </div>
            <div class="quick-actions">
              <button v-for="item in visibleQuickActions" :key="item.path" class="quick-action" @click="goTo(item.path)">
                <el-icon><component :is="item.icon" /></el-icon>
                <span>{{ item.label }}</span>
              </button>
            </div>
          </section>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="Dashboard">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { ChatLineRound, Document, OfficeBuilding, Plus, Refresh, TrendCharts, User, Van } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import { getOrderList } from "@/api/modules/orderList";
import { getCurrentUserInfoApi } from "@/api/modules/login";
import { getCustomerList, getCustomerMobileOrderLink } from "@/api/modules/customer";
import { getSalesLeadList } from "@/api/modules/salesLead";
import { useUserStore } from "@/stores/modules/user";
import { getCompanyList } from "@/api/modules/company";
import { localSet } from "@/utils";

interface DashboardMetricItem {
  label: string;
  hint: string;
  icon: any;
  type: string;
  value?: string;
  kind?: "qr";
}

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const orderTotal = ref(0);
const companyTotal = ref(0);
const customerTotal = ref(0);
const leadTotal = ref(0);
const recentOrders = ref<any[]>([]);
const leadRows = ref<any[]>([]);
const orderStatusMap = ref<Record<string, number>>({});
const mobileOrderLoading = ref(false);
const mobileOrderLink = ref("");

const todayLabel = computed(() => dayjs().format("YYYY-MM-DD dddd"));
const currentUser = computed(() => userStore.getUserInfo as any);
const currentUserLevel = computed(() => String(currentUser.value?.userLevel || "").toUpperCase());
const currentUsername = computed(() => String(currentUser.value?.username || "").toLowerCase());
const currentCustomerId = computed(() =>
  Number(
    currentUser.value?.customerId ||
      currentUser.value?.CustomerId ||
      currentUser.value?.customer?.id ||
      currentUser.value?.Customer?.Id ||
      currentUser.value?.customer?.customerId ||
      currentUser.value?.Customer?.CustomerId ||
      0
  )
);
const showMobileOrderCard = computed(() => isCustomerAccount.value || currentUsername.value === "test");
const isCustomerAccount = computed(() => currentUserLevel.value === "C" || !!currentUser.value?.customer);
const isSuperAdminAccount = computed(() => {
  const companyId = Number(currentUser.value?.companyId || 0);
  return (
    currentUsername.value === "yuan" ||
    ["S", "SA", "SUPER", "SUPERADMIN"].includes(currentUserLevel.value) ||
    (currentUserLevel.value === "A" && !isCustomerAccount.value && companyId <= 0)
  );
});
const isCompanyAccount = computed(() => !!currentUser.value?.companyId && !isCustomerAccount.value && !isSuperAdminAccount.value);
const metricColSpan = computed(() => (showMobileOrderCard.value ? 5 : 6));
const dashboardSubtitle = computed(() => {
  const accountLabel = isSuperAdminAccount.value
    ? "Super administrator dashboard"
    : isCustomerAccount.value
      ? "Customer dashboard"
      : "Company dashboard";
  return `${accountLabel} · ${todayLabel.value}`;
});
const recentOrdersSubtitle = computed(() => {
  if (isSuperAdminAccount.value) return "Latest shipments across the platform";
  if (isCompanyAccount.value) return "Latest shipments from the order list";
  return "Latest shipments from your account";
});

const statusConfig = [
  { name: "Created", label: "Created", color: "#409eff" },
  { name: "Printed", label: "Printed", color: "#626aef" },
  { name: "InTransit", label: "In Transit", color: "#e6a23c" },
  { name: "Delivered", label: "Delivered", color: "#67c23a" },
  { name: "Exception", label: "Exception", color: "#f56c6c" },
  { name: "Return", label: "Return", color: "#909399" },
  { name: "Cancel", label: "Cancelled", color: "#b1b3b8" }
];

const leadStatusConfig = [
  { name: "New", color: "#409eff" },
  { name: "Contacted", color: "#626aef" },
  { name: "Qualified", color: "#67c23a" },
  { name: "Proposal", color: "#e6a23c" },
  { name: "Won", color: "#13ce66" },
  { name: "Lost", color: "#909399" }
];

const metrics = computed<DashboardMetricItem[]>(() => {
  const baseMetrics: DashboardMetricItem[] = isSuperAdminAccount.value
    ? [
        {
          label: "Total Orders",
          value: formatNumber(orderTotal.value),
          hint: "Platform shipments",
          icon: Van,
          type: "orders"
        },
        {
          label: "Companies",
          value: formatNumber(companyTotal.value),
          hint: "Managed companies",
          icon: OfficeBuilding,
          type: "companies"
        },
        {
          label: "Customers",
          value: formatNumber(customerTotal.value),
          hint: "Customer accounts",
          icon: User,
          type: "customers"
        },
        {
          label: "Sales Leads",
          value: formatNumber(leadTotal.value),
          hint: "Potential customers",
          icon: TrendCharts,
          type: "leads"
        }
      ]
    : isCompanyAccount.value
      ? [
          {
            label: "Total Orders",
            value: formatNumber(orderTotal.value),
            hint: "All matched shipments",
            icon: Van,
            type: "orders"
          },
          {
            label: "Customers",
            value: formatNumber(customerTotal.value),
            hint: "Active customer accounts",
            icon: User,
            type: "customers"
          },
          {
            label: "In Transit",
            value: formatNumber(orderStatusMap.value.InTransit || 0),
            hint: "Currently moving",
            icon: Document,
            type: "transit"
          },
          {
            label: "Exceptions",
            value: formatNumber(orderStatusMap.value.Exception || 0),
            hint: "Needs attention",
            icon: ChatLineRound,
            type: "exceptions"
          }
        ]
      : [
          {
            label: "My Orders",
            value: formatNumber(orderTotal.value),
            hint: "Your matched shipments",
            icon: Van,
            type: "orders"
          },
          {
            label: "In Transit",
            value: formatNumber(orderStatusMap.value.InTransit || 0),
            hint: "Currently moving",
            icon: Document,
            type: "transit"
          },
          {
            label: "Delivered",
            value: formatNumber(orderStatusMap.value.Delivered || 0),
            hint: "Completed shipments",
            icon: Document,
            type: "delivered"
          },
          {
            label: "Exceptions",
            value: formatNumber(orderStatusMap.value.Exception || 0),
            hint: "Needs attention",
            icon: ChatLineRound,
            type: "exceptions"
          }
        ];

  if (!showMobileOrderCard.value) {
    return baseMetrics;
  }

  return [
    ...baseMetrics,
    {
      label: "Mobile QR",
      hint: "Scan to create orders on mobile",
      icon: Plus,
      type: "orders",
      kind: "qr"
    }
  ];
});

const orderStatuses = computed(() => {
  const total = statusConfig.reduce((sum, item) => sum + (orderStatusMap.value[item.name] || 0), 0) || 1;
  return statusConfig.map(item => {
    const count = orderStatusMap.value[item.name] || 0;
    return {
      ...item,
      count: formatNumber(count),
      percent: Math.round((count / total) * 100)
    };
  });
});

const leadStatuses = computed(() => {
  const counts = leadRows.value.reduce(
    (acc, row) => {
      const status = row.status || row.Status || "New";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  return leadStatusConfig.map(item => ({
    ...item,
    count: counts[item.name] || 0
  }));
});

const quickActions = [
  { label: "Create Order", path: "/create-order", icon: Plus, account: "customer" },
  { label: "Order List", path: "/my-orders", icon: Document, account: "all" },
  { label: "Address Book", path: "/address-book", icon: User, account: "customer" },
  { label: "Company List", path: "/company", icon: OfficeBuilding, account: "super" },
  { label: "Customer List", path: "/customer", icon: User, account: "company" },
  { label: "Sales Leads", path: "/sales-leads", icon: TrendCharts, account: "super" }
];

const visibleQuickActions = computed(() =>
  quickActions.filter(
    item =>
      item.account === "all" ||
      (item.account === "customer" && isCustomerAccount.value) ||
      (item.account === "super" && isSuperAdminAccount.value) ||
      (item.account === "company" && (isCompanyAccount.value || isSuperAdminAccount.value))
  )
);

const unwrapData = (res: any) => res?.Data ?? res?.data ?? res;
const unwrapList = (data: any) => {
  if (Array.isArray(data)) return data;
  return data?.items ?? data?.Items ?? data?.data ?? data?.Data ?? [];
};
const unwrapTotal = (data: any) =>
  data?.recordsFiltered ?? data?.totalCount ?? data?.TotalCount ?? data?.total ?? unwrapList(data).length;

const formatNumber = (value: number) => Number(value || 0).toLocaleString();
const formatDate = (value?: string) => (value ? dayjs(value).format("YYYY-MM-DD") : "-");
const qrCodeUrl = (url: string) => `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;

const getDateRange = () => ({
  startDate: dayjs().subtract(90, "day").startOf("day").format("YYYY-MM-DDTHH:mm:ss"),
  endDate: dayjs().endOf("day").format("YYYY-MM-DDTHH:mm:ss")
});

const parseOrderSummary = (summary?: string) => {
  if (!summary) return {};
  try {
    const rows = JSON.parse(summary);
    return rows.reduce(
      (acc, item) => {
        acc[item.Name] = Number(item.Count || 0);
        return acc;
      },
      {} as Record<string, number>
    );
  } catch {
    return {};
  }
};

const loadOrders = async () => {
  const range = getDateRange();
  const res: any = await getOrderList({
    Start: 0,
    Length: 8,
    startDate: range.startDate,
    endDate: range.endDate,
    childCustomerId: [],
    serviceCode: [],
    country: [],
    shipmentNumber: "",
    hawbNumberType: "shipmentNumber",
    shipmentStatus: null
  });
  const responseData = unwrapData(res);
  const pageData = responseData?.data ?? responseData?.Data ?? responseData;
  recentOrders.value = unwrapList(pageData).slice(0, 8);
  orderTotal.value = unwrapTotal(pageData);
  orderStatusMap.value = parseOrderSummary(pageData?.sumData);
};

const loadCustomers = async () => {
  const res: any = await getCustomerList({ pageNumber: 1, pageSize: 1 });
  const data = unwrapData(res);
  customerTotal.value = unwrapTotal(data);
};

const loadCompanies = async () => {
  const res: any = await getCompanyList();
  const data = unwrapData(res);
  companyTotal.value = unwrapTotal(data);
};

const loadLeads = async () => {
  const res: any = await getSalesLeadList({ pageNumber: 1, pageSize: 30 });
  const data = unwrapData(res);
  leadRows.value = unwrapList(data);
  leadTotal.value = unwrapTotal(data);
};

const resolveMobileOrderCustomerId = async () => {
  if (currentCustomerId.value) return currentCustomerId.value;
  if (currentUsername.value !== "test") return 0;
  const res: any = await getCustomerList({ pageNumber: 1, pageSize: 1 });
  const data = unwrapData(res);
  const firstCustomer = unwrapList(data)[0];
  return Number(firstCustomer?.id || firstCustomer?.Id || 0);
};

const loadMobileOrderLink = async () => {
  const customerId = await resolveMobileOrderCustomerId();
  if (!customerId) return;
  mobileOrderLoading.value = true;
  mobileOrderLink.value = "";
  try {
    const res: any = await getCustomerMobileOrderLink(customerId);
    const data = unwrapData(res);
    mobileOrderLink.value = data.url || data.Url || "";
  } catch (error: any) {
    ElMessage.error(error?.Data || error?.Message || error?.message || "Failed to generate mobile order link");
  } finally {
    mobileOrderLoading.value = false;
  }
};

const loadDashboard = async () => {
  loading.value = true;
  try {
    await refreshCurrentUser();
    const tasks = [loadOrders()];
    if (showMobileOrderCard.value) {
      tasks.push(loadMobileOrderLink());
    }
    if (isCompanyAccount.value) {
      tasks.push(loadCustomers());
    }
    if (isSuperAdminAccount.value) {
      tasks.push(loadCompanies(), loadCustomers(), loadLeads());
    }
    await Promise.allSettled(tasks);
  } finally {
    loading.value = false;
  }
};

const refreshCurrentUser = async () => {
  const userInfoData: any = await getCurrentUserInfoApi();
  if (userInfoData?.Data) {
    localSet("userInfo", userInfoData.Data);
    userStore.setUserInfo();
  }
};

const goTo = (path: string) => {
  router.push(path);
};

onMounted(() => {
  loadDashboard();
});
</script>

<style lang="scss" scoped>
.dashboard-page {
  min-height: 100%;
  padding: 16px;
  background: #f5f7fa;
}
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: #1f2d3d;
  }
  p {
    margin: 6px 0 0;
    font-size: 13px;
    color: #7a8599;
  }
}
.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.metric-row,
.content-row {
  margin-bottom: 16px;
}
.metric-row--customer {
  justify-content: space-between;
}
.metric-col--customer {
  @media (width >= 1200px) {
    flex: 0 0 20%;
    max-width: 20%;
  }
}
.side-stack {
  display: grid;
  gap: 16px;
}
.metric-card,
.panel {
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgb(31 45 61 / 4%);
}
.metric-card {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  height: 112px;
  padding: 20px;
}
.metric-card--qr {
  justify-content: center;
  padding: 10px 12px;
}
.metric-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-right: 16px;
  font-size: 24px;
  border-radius: 6px;
  &.orders {
    color: #1d4ed8;
    background: #eff6ff;
  }
  &.companies {
    color: #6d28d9;
    background: #f5f3ff;
  }
  &.transit {
    color: #b45309;
    background: #fffbeb;
  }
  &.delivered {
    color: #047857;
    background: #ecfdf5;
  }
  &.customers {
    color: #047857;
    background: #ecfdf5;
  }
  &.leads {
    color: #b45309;
    background: #fffbeb;
  }
  &.exceptions {
    color: #b91c1c;
    background: #fef2f2;
  }
}
.metric-qr {
  display: grid;
  gap: 4px;
  justify-items: center;
  width: 100%;
  text-align: center;
  img {
    width: 68px;
    height: 68px;
    padding: 2px;
    background: #ffffff;
    border: 1px solid #e2eaee;
    border-radius: 6px;
  }
}
.metric-qr__text {
  max-width: 116px;
  margin: 0;
  font-size: 10px;
  line-height: 1.2;
  color: #61707d;
}
.metric-qr__placeholder {
  display: grid;
  place-items: center;
  width: 68px;
  height: 68px;
  color: #009094;
  background: linear-gradient(180deg, #f2fbfb 0%, #ffffff 100%);
  border: 1px dashed #b9dedd;
  border-radius: 6px;
  .el-icon {
    font-size: 18px;
  }
}
.metric-qr__placeholder-text {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0;
}
.metric-qr__loading {
  display: block;
  width: 18px;
  height: 18px;
  border: 2px solid #c7d6db;
  border-top-color: #009094;
  border-radius: 50%;
  animation: dashboard-qr-spin 0.8s linear infinite;
}
.metric-content {
  display: flex;
  flex-direction: column;
  span,
  small {
    font-size: 12px;
    color: #7a8599;
  }
  strong {
    margin: 6px 0 4px;
    font-size: 26px;
    line-height: 1;
    color: #1f2d3d;
  }
}
.panel {
  height: 100%;
  padding: 16px;
}
.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 48px;
  margin-bottom: 14px;
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #1f2d3d;
  }
  p {
    margin: 5px 0 0;
    font-size: 12px;
    color: #8a94a6;
  }
}
.status-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 18px;
}
.status-item {
  padding: 12px;
  background: #fafbfc;
  border: 1px solid #edf0f5;
  border-radius: 6px;
}
.status-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 13px;
  color: #5b667a;
  strong {
    color: #1f2d3d;
  }
}
.lead-summary {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.lead-status {
  display: grid;
  grid-template-columns: 12px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  font-size: 13px;
  color: #4b5565;
  background: #fafbfc;
  border: 1px solid #edf0f5;
  border-radius: 6px;
  strong {
    color: #1f2d3d;
  }
}
.lead-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.scope-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.scope-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 12px;
  font-size: 13px;
  color: #4b5565;
  background: #fafbfc;
  border: 1px solid #edf0f5;
  border-radius: 6px;
  strong {
    font-size: 18px;
    color: #1f2d3d;
  }
}
.quick-panel {
  min-height: 240px;
}
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.quick-action {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  min-height: 112px;
  color: #344054;
  cursor: pointer;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  .el-icon {
    font-size: 26px;
    color: #409eff;
  }
  &:hover {
    color: #409eff;
    border-color: #a0cfff;
  }
}

@media (width <= 768px) {
  .dashboard-header,
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .header-actions {
    margin-top: 12px;
  }
  .status-grid,
  .quick-actions {
    grid-template-columns: 1fr;
  }
}

@keyframes dashboard-qr-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
