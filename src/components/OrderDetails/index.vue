<template>
  <div>
    <el-drawer v-model="drawer" size="78%" :show-close="true" class="order-details-drawer">
      <template #header>
        <div class="drawer-header">
          <div class="header-main">
            <div class="header-icon">
              <el-icon :size="24"><Box /></el-icon>
            </div>
            <div class="header-info">
              <div class="header-title">{{ state.trackData.shipmentNumber }}</div>
              <div class="header-sub">{{ state.trackData.serviceCode }} · {{ formattedShipmentDate }}</div>
            </div>
          </div>
          <el-tag :type="statusTagType" effect="dark" round size="large" class="header-status">
            {{ statusText }}
          </el-tag>
        </div>
      </template>

      <div class="order-body">
        <!-- Steps -->
        <div class="steps-bar">
          <div
            v-for="(step, idx) in steps"
            :key="idx"
            :class="['step-item', { passed: state.active > idx + 1, active: state.active === idx + 1 }]"
          >
            <div class="step-indicator">
              <div class="step-num">
                <el-icon v-if="state.active > idx + 1" :size="16"><Check /></el-icon>
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <div v-if="idx < 3" :class="['step-line', { filled: state.active > idx + 1 }]"></div>
            </div>
            <div class="step-label">{{ step.label }}</div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="quick-stats">
          <div class="stat-item">
            <div class="stat-icon" style="background: rgb(0 144 148 / 8%)">
              <el-icon :size="20" color="#009094"><Box /></el-icon>
            </div>
            <div class="stat-text">
              <div class="stat-val">{{ state.trackData.pieces || "--" }}</div>
              <div class="stat-lbl">{{ $t("orderlist.qty") }}</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon" style="background: rgb(230 162 60 / 8%)">
              <el-icon :size="20" color="#e6a23c"><Odometer /></el-icon>
            </div>
            <div class="stat-text">
              <div class="stat-val">{{ state.trackData.weight || "--" }} kg</div>
              <div class="stat-lbl">{{ $t("orderlist.weight") }}</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon" style="background: rgb(124 58 237 / 8%)">
              <el-icon :size="20" color="#7c3aed"><Grid /></el-icon>
            </div>
            <div class="stat-text">
              <div class="stat-val">
                {{ state.trackData.packageShipments?.[0]?.length || "--" }} ×
                {{ state.trackData.packageShipments?.[0]?.width || "--" }} ×
                {{ state.trackData.packageShipments?.[0]?.height || "--" }}
              </div>
              <div class="stat-lbl">L×W×H</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon" style="background: rgb(0 180 42 / 8%)">
              <el-icon :size="20" color="#00b42a"><Money /></el-icon>
            </div>
            <div class="stat-text">
              <div class="stat-val">{{ state.trackData.declareValue || "--" }} {{ state.trackData.declareCurrency || "" }}</div>
              <div class="stat-lbl">{{ $t("orderlist.total_declared_value") }}</div>
            </div>
          </div>
        </div>

        <!-- Route Card -->
        <div class="route-card">
          <div class="route-from">
            <div class="route-country">{{ state.trackData.senderCountryName || "--" }}</div>
            <div class="route-detail">{{ state.trackData.senderCity || "" }} {{ state.trackData.senderPostalCode || "" }}</div>
          </div>
          <div class="route-arrow">
            <div class="route-dash"></div>
            <img class="route-plane" src="./img/feiji77.png" alt="" />
            <div class="route-dash"></div>
          </div>
          <div class="route-to">
            <div class="route-country">{{ state.trackData.recipientCountryName || "--" }}</div>
            <div class="route-detail">{{ recipientCityInfo }}</div>
          </div>
        </div>

        <!-- Main Content: Two Columns -->
        <div class="main-layout">
          <!-- Left -->
          <div class="col-left">
            <!-- Tracking Timeline -->
            <div class="card">
              <div class="card-head">
                <h3>{{ $t("orderlist.logistics_track") }}</h3>
              </div>
              <div class="card-body">
                <div class="timeline" v-if="state.hawbTrackList.length">
                  <div v-for="(item, index) in state.hawbTrackList" :key="index" :class="['tl-item', { first: index === 0 }]">
                    <div class="tl-rail">
                      <div :class="['tl-dot', { live: index === 0 }]"></div>
                      <div v-if="index < state.hawbTrackList.length - 1" class="tl-line"></div>
                    </div>
                    <div class="tl-body">
                      <div class="tl-desc">{{ item.trackingDesc }}</div>
                      <div class="tl-info">
                        <span>{{ formatEventTime(item.eventTime) }}</span>
                        <span v-if="item.locationName"> · {{ item.locationName }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <el-empty v-else :image-size="60" description="No tracking data" />
              </div>
            </div>
          </div>

          <!-- Right -->
          <div class="col-right">
            <!-- Order Info -->
            <div class="card">
              <div class="card-head">
                <h3>{{ $t("orderlist.order_information") }}</h3>
                <el-button text type="primary" size="small" @click="toggleTable">
                  {{ state.table ? $t("orderlist.collapse") : $t("orderlist.expand") }}
                </el-button>
              </div>
              <div class="card-body">
                <div class="field-list">
                  <div class="field-row">
                    <span class="field-k">{{ $t("orderlist.logistics_tracking_number") }}</span>
                    <span class="field-v">
                      <template v-if="state.trackData.pieces > 1">
                        <a @click="state.packagesDialog = true" class="link">{{ state.trackData.shipmentNumber }}</a>
                        <el-tag size="small" color="#009094" style="margin-left: 4px; border: none; border-radius: 10px">
                          <span style="font-size: 11px; color: #ffffff">{{ state.trackData.pieces }}</span>
                        </el-tag>
                      </template>
                      <template v-else>{{ state.trackData.shipmentNumber || "--" }}</template>
                    </span>
                  </div>
                  <div class="field-row">
                    <span class="field-k">{{ $t("orderlist.customer_reference_number") }}</span>
                    <span class="field-v">{{ state.trackData.referenceNumber || "--" }}</span>
                  </div>
                  <div class="field-row">
                    <span class="field-k">{{ $t("orderlist.tax_payment_method") }}</span>
                    <span class="field-v">{{ state.trackData.dutyType || "--" }}</span>
                  </div>
                  <div class="field-row">
                    <span class="field-k">{{ $t("orderlist.payment_type") }}</span>
                    <span class="field-v">{{ state.trackData.paymentType || "--" }}</span>
                  </div>
                  <div class="field-row">
                    <span class="field-k">Shipment Type</span>
                    <span class="field-v">{{ displayShipmentType || "--" }}</span>
                  </div>
                </div>
                <transition name="fade">
                  <div v-show="state.table" class="field-list field-list--more">
                    <div class="field-row">
                      <span class="field-k">Consignee VAT</span>
                      <span class="field-v">{{ state.trackData.recipientVATNumber || "--" }}</span>
                    </div>
                    <div class="field-row">
                      <span class="field-k">Consignee EORI</span>
                      <span class="field-v">{{ state.trackData.recipientEORINumber || "--" }}</span>
                    </div>
                    <div class="field-row">
                      <span class="field-k">ShipperVAT/IOSS</span>
                      <span class="field-v">{{ state.trackData.SenderVATNumber || "--" }}</span>
                    </div>
                    <div class="field-row">
                      <span class="field-k">Shipper EORI</span>
                      <span class="field-v">{{ state.trackData.SenderEORINumber || "--" }}</span>
                    </div>
                    <div class="field-row">
                      <span class="field-k">{{ $t("orderlist.export_tax_id") }}</span>
                      <span class="field-v">{{ state.trackData.exportTaxld || "--" }}</span>
                    </div>
                    <div class="field-row">
                      <span class="field-k">{{ $t("orderlist.shipping_cost") }}</span>
                      <span class="field-v">{{ shippingCostInfo }}</span>
                    </div>
                    <div class="field-row">
                      <span class="field-k">Insurance Value</span>
                      <span class="field-v">{{ state.trackData.insuranceValue || "--" }}</span>
                    </div>
                    <div class="field-row">
                      <span class="field-k">{{ $t("orderlist.order_method") }}</span>
                      <span class="field-v">{{ state.trackData.dataFrom || "--" }}</span>
                    </div>
                    <div class="field-row">
                      <span class="field-k">{{ $t("orderlist.remark") }}</span>
                      <span class="field-v">{{ state.trackData.remark || "--" }}</span>
                    </div>
                    <div class="field-row">
                      <span class="field-k">{{ $t("orderlist.item_name") }}</span>
                      <span class="field-v">{{ state.trackData.content || "--" }}</span>
                    </div>
                  </div>
                </transition>
              </div>
            </div>

            <!-- Sender / Receiver -->
            <div class="card">
              <div class="card-head">
                <h3>{{ $t("orderlist.senderreceiver_information") }}</h3>
              </div>
              <div class="card-body">
                <div class="people-grid">
                  <div class="person sender">
                    <div class="person-badge">From</div>
                    <div class="person-name">{{ state.trackData.SenderContact || "--" }}</div>
                    <div class="person-row">
                      <el-icon :size="13"><Phone /></el-icon>
                      <span>{{ state.trackData.senderPhone || "--" }}</span>
                    </div>
                    <div class="person-row">
                      <el-icon :size="13"><OfficeBuilding /></el-icon>
                      <span>{{ state.trackData.senderCompany || "--" }}</span>
                    </div>
                    <div class="person-row">
                      <el-icon :size="13"><Location /></el-icon>
                      <span>{{ state.trackData.senderStreet || "--" }}</span>
                    </div>
                  </div>
                  <div class="person receiver">
                    <div class="person-badge">To</div>
                    <div class="person-name">{{ state.trackData.recipientContact || "--" }}</div>
                    <div class="person-row">
                      <el-icon :size="13"><Phone /></el-icon>
                      <span>{{ state.trackData.recipientPhone || "--" }}</span>
                    </div>
                    <div class="person-row">
                      <el-icon :size="13"><OfficeBuilding /></el-icon>
                      <span>{{ state.trackData.recipientCompany || "--" }}</span>
                    </div>
                    <div class="person-row">
                      <el-icon :size="13"><Location /></el-icon>
                      <span>{{ state.trackData.recipientStreet || "--" }}</span>
                    </div>
                    <div class="person-row">
                      <el-icon :size="13"><Message /></el-icon>
                      <span>{{ state.trackData.recipientEmail || "--" }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Items -->
            <div class="card" v-if="state.trackData.shipmentItems?.length">
              <div class="card-head">
                <h3>{{ $t("orderlist.item_info") }}</h3>
              </div>
              <div class="card-body no-pad">
                <el-table :data="state.trackData.shipmentItems" stripe size="small" style="width: 100%">
                  <el-table-column prop="content" :label="$t('orderlist.item_name')" min-width="120" />
                  <el-table-column prop="webSite" label="WebSite" min-width="100" />
                  <el-table-column prop="weight" :label="$t('orderlist.weight')" width="80" />
                  <el-table-column prop="pieces" :label="$t('orderlist.qty')" width="60" />
                  <el-table-column prop="price" :label="$t('orderlist.unit_price')" width="80" />
                  <el-table-column prop="hsCode" :label="$t('orderlist.customs_code')" width="100" />
                </el-table>
              </div>
            </div>

            <!-- Pickup -->
            <div class="card pickup-card" v-if="state.trackData.pickupInfo">
              <div class="card-head">
                <h3>{{ $t("orderlist.scheduled_pickup_information") }}</h3>
              </div>
              <div class="card-body">
                <div class="field-list">
                  <div class="field-row">
                    <span class="field-k">{{ $t("orderlist.shipper_name") }}</span>
                    <span class="field-v">{{ state.trackData.pickupInfo.pickupName }}</span>
                  </div>
                  <div class="field-row">
                    <span class="field-k">{{ $t("orderlist.phone") }}</span>
                    <span class="field-v">{{ state.trackData.pickupInfo.pickupTel }}</span>
                  </div>
                  <div class="field-row">
                    <span class="field-k">{{ $t("orderlist.address") }}</span>
                    <span class="field-v">{{ state.trackData.pickupInfo.pickupAddress }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Packages Dialog -->
      <el-dialog v-model="state.packagesDialog" align-center width="760" title="Child Packages">
        <el-table :data="state.trackData.packageShipments" stripe size="small">
          <el-table-column label="Status" min-width="90">
            <template #default="{ row }">
              <el-tag v-if="row.status === 10" type="primary" size="small">Created</el-tag>
              <el-tag v-else-if="row.status === 20" type="warning" size="small">Printed</el-tag>
              <el-tag v-else-if="row.status === 30" type="info" size="small">InTransit</el-tag>
              <el-tag v-else-if="row.status === 60" type="danger" size="small">Return</el-tag>
              <el-tag v-else-if="row.status === 100" type="success" size="small">Delivered</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Child#" min-width="130">
            <template #default="{ row }">
              <a style="color: #009094; cursor: pointer">{{ row.shipmentNumber }}</a>
            </template>
          </el-table-column>
          <el-table-column property="referenceNo" label="Ref#" min-width="110" />
          <el-table-column property="weight" label="Weight" width="90" />
          <el-table-column property="height" label="H" width="70" />
          <el-table-column property="width" label="W" width="70" />
          <el-table-column property="length" label="L" width="70" />
        </el-table>
      </el-dialog>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { Check, Box, Phone, Location, OfficeBuilding, Message, Odometer, Grid, Money } from "@element-plus/icons-vue";
import { getOrderDetailById, getHawbhawbNumber } from "../../api/modules/orderList";
import { reactive, toRefs } from "vue";

const state = reactive({
  batchDownloadPodList: {} as any,
  TrackingNumber: { childNum: "" } as any,
  dialogPOD: false,
  batchdialogPOD: false,
  trackData: {} as any,
  unfoldimg: true,
  formCollapseimg: false,
  table: false,
  form: false,
  formUnfoldimg: true,
  formCollapse: false,
  active: 1,
  hawbTrackList: [] as Array<any>,
  hawbStatusDtos: [] as any,
  packagesDialog: false,
  rules: {
    childNum: [{ required: true, message: "please enter childNum", trigger: "blur" }]
  }
});

const {} = toRefs(state);
const drawer = ref(false);

const steps = [{ label: "Created" }, { label: "Printed" }, { label: "InTransit" }, { label: "Delivered" }];

const statusText = computed(() => {
  const m: Record<number, string> = { 1: "Created", 2: "Printed", 3: "InTransit", 4: "Delivered" };
  return m[state.active] || "Created";
});

const statusTagType = computed<"primary" | "success" | "warning" | "danger">(() => {
  const m: Record<number, "primary" | "success" | "warning" | "danger"> = {
    1: "primary",
    2: "warning",
    3: "success",
    4: "danger"
  };
  return m[state.active] || "primary";
});

const displayShipmentType = computed(() => (state.trackData.shipmentType === 10 ? "DOCUMENT" : "PACKAGE"));

const recipientCityInfo = computed(() => `${state.trackData.recipientCity || ""} ${state.trackData.recipientPostalCode || ""}`);

const shippingCostInfo = computed(() => `${state.trackData.cifCost || "--"} ${state.trackData.cifCostCurrency || ""}`);

const formattedShipmentDate = computed(() => {
  const d = state.trackData.shipmentDate;
  return d ? d.split("T")[0] : "--";
});

const formatEventTime = (t: string): string => {
  if (!t.includes("T")) return t;
  const [date, time] = t.split("T");
  return `${date} ${time.slice(0, 5)}`;
};

function toggleTable() {
  state.table = !state.table;
}

function details(row: any, trackingNumber: any = undefined) {
  if (trackingNumber) {
    getHawbhawbNumber(row).then((data: any) => {
      state.trackData = data.result;
      state.hawbTrackList = data.result.hawbTrackList;
      state.hawbStatusDtos = data.result.hawbStatusDtos;
      state.active = state.hawbStatusDtos.filter((item: any) => item.isPass).length;
      drawer.value = true;
    });
  } else {
    getOrderDetailById(row).then((data: any) => {
      state.trackData = data.Data;
      state.hawbTrackList = data.Data.packageShipments[0].packageTrackList;
      state.active =
        state.trackData.shipmentStatus == 10
          ? 1
          : state.trackData.shipmentStatus == 20
            ? 2
            : state.trackData.shipmentStatus == 100
              ? 4
              : 3;
      drawer.value = true;
    });
  }
}

defineExpose({ details });
</script>

<style lang="scss" scoped>
$c: #009094;
$c-light: #f0fafa;
$c-dark: #006d70;
$g1: #1a1a2e;
$g2: #16213e;
$bg: #f4f6f9;
$card: #ffffff;
$text: #2d3436;
$sub: #636e72;
$border: #eef0f3;
$radius: 14px;

/* ── Drawer ── */
:deep(.order-details-drawer) {
  .el-drawer__header {
    padding: 0;
    margin-bottom: 0;
    color: #ffffff;
    background: linear-gradient(135deg, $g1, $g2);
    border: none;
  }
  .el-drawer__close-btn {
    color: rgb(255 255 255 / 70%);
    &:hover {
      color: #ffffff;
    }
  }
  .el-drawer__body {
    padding: 0;
    background: $bg;
  }
}
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 22px 28px;
  .header-main {
    display: flex;
    gap: 14px;
    align-items: center;
  }
  .header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    color: #ffffff;
    background: rgb(255 255 255 / 10%);
    border-radius: 12px;
  }
  .header-title {
    font-family: DIN, monospace;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.3px;
  }
  .header-sub {
    margin-top: 2px;
    font-size: 13px;
    color: rgb(255 255 255 / 55%);
  }
  .header-status {
    height: auto;
    padding: 6px 18px;
    font-size: 13px;
    font-weight: 700;
    color: #ffffff !important;
  }
}

/* ── Body ── */
.order-body {
  height: calc(100vh - 88px);
  padding: 22px 28px;
  overflow-y: auto;
}

/* ── Steps ── */
.steps-bar {
  display: flex;
  align-items: flex-start;
  padding: 22px 36px;
  margin-bottom: 18px;
  background: $card;
  border-radius: $radius;
  box-shadow: 0 1px 4px rgb(0 0 0 / 3%);
}
.step-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  .step-indicator {
    display: flex;
    align-items: center;
    width: 100%;
  }
  .step-num {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    font-size: 14px;
    font-weight: 700;
    color: #adb5bd;
    background: #e9ecef;
    border-radius: 50%;
    transition: all 0.3s;
  }
  &.passed .step-num {
    color: #ffffff;
    background: $c;
  }
  &.active .step-num {
    color: $c;
    background: #ffffff;
    border: 2.5px solid $c;
    box-shadow: 0 0 0 4px $c-light;
  }
  .step-line {
    flex: 1;
    height: 3px;
    margin: 0 6px;
    background: #e9ecef;
    border-radius: 2px;
    transition: background 0.3s;
  }
  .step-label {
    margin-top: 10px;
    font-size: 12px;
    font-weight: 600;
    color: #adb5bd;
    letter-spacing: 0.3px;
  }
  &.passed .step-label,
  &.active .step-label {
    font-weight: 700;
    color: $c-dark;
  }
}

/* ── Quick Stats ── */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 18px;
}
.stat-item {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 18px 16px;
  background: $card;
  border-radius: $radius;
  box-shadow: 0 1px 4px rgb(0 0 0 / 3%);
  transition: transform 0.2s;
  &:hover {
    box-shadow: 0 3px 12px rgb(0 0 0 / 6%);
    transform: translateY(-1px);
  }
}
.stat-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
}
.stat-val {
  font-family: DIN, monospace;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.3;
  color: $text;
}
.stat-lbl {
  margin-top: 2px;
  font-size: 11px;
  color: $sub;
}

/* ── Route Card ── */
.route-card {
  display: flex;
  align-items: center;
  padding: 22px 32px;
  margin-bottom: 18px;
  background: $card;
  border-radius: $radius;
  box-shadow: 0 1px 4px rgb(0 0 0 / 3%);
}
.route-from,
.route-to {
  flex: 0 0 auto;
  min-width: 100px;
  text-align: center;
  .route-country {
    font-size: 20px;
    font-weight: 800;
    color: $text;
  }
  .route-detail {
    margin-top: 2px;
    font-size: 12px;
    color: $sub;
  }
}
.route-arrow {
  display: flex;
  flex: 1;
  align-items: center;
  padding: 0 20px;
  .route-dash {
    flex: 1;
    height: 2px;
    background: repeating-linear-gradient(90deg, $c 0, $c 8px, transparent 8px, transparent 14px);
    opacity: 0.35;
  }
  .route-plane {
    flex-shrink: 0;
    width: 28px;
    margin: 0 10px;
  }
}

/* ── Main Layout ── */
.main-layout {
  display: flex;
  gap: 18px;
}
.col-left {
  flex-shrink: 0;
  width: 340px;
}
.col-right {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

/* ── Card ── */
.card {
  overflow: hidden;
  background: $card;
  border-radius: $radius;
  box-shadow: 0 1px 4px rgb(0 0 0 / 3%);
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: $text;
  }
}
.card-body {
  padding: 4px 20px 20px;
  &.no-pad {
    padding: 0;
  }
}

/* ── Timeline ── */
.timeline {
  max-height: calc(100vh - 380px);
  padding-right: 8px;
  overflow-y: auto;
}
.tl-item {
  display: flex;
  gap: 14px;
  padding-bottom: 4px;
  &.first .tl-desc {
    font-weight: 700;
    color: $c-dark;
  }
}
.tl-rail {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  width: 16px;
}
.tl-dot {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  margin-top: 5px;
  background: #dfe6e9;
  border-radius: 50%;
  &.live {
    background: $c;
    box-shadow: 0 0 0 3px $c-light;
  }
}
.tl-line {
  flex: 1;
  width: 2px;
  margin: 4px 0;
  background: $border;
}
.tl-body {
  flex: 1;
  padding-bottom: 18px;
}
.tl-desc {
  font-size: 13px;
  line-height: 1.5;
  color: $text;
}
.tl-info {
  margin-top: 3px;
  font-size: 12px;
  color: $sub;
}

/* ── Field List ── */
.field-list {
  & + .field-list--more {
    padding-top: 8px;
    margin-top: 8px;
    border-top: 1px dashed $border;
  }
}
.field-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 7px 0;
  border-bottom: 1px solid #f8f9fa;
  &:last-child {
    border-bottom: none;
  }
}
.field-k {
  flex-shrink: 0;
  margin-right: 16px;
  font-size: 12px;
  color: $sub;
}
.field-v {
  font-size: 13px;
  font-weight: 600;
  color: $text;
  text-align: right;
  word-break: break-word;
}
.link {
  color: $c;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  &:hover {
    color: $c-dark;
  }
}

/* ── People Grid ── */
.people-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.person {
  padding: 16px;
  border-radius: 10px;
  &.sender {
    background: linear-gradient(145deg, #f0fff4 0%, #f8fffe 100%);
    border: 1px solid #d3f9d8;
  }
  &.receiver {
    background: linear-gradient(145deg, $c-light 0%, #f8fffe 100%);
    border: 1px solid #b2dfdb;
  }
}
.person-badge {
  display: inline-block;
  padding: 2px 10px;
  margin-bottom: 8px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  border-radius: 4px;
  .sender & {
    color: #00b42a;
    background: rgb(0 180 42 / 12%);
  }
  .receiver & {
    color: $c;
    background: rgba($c, 0.1);
  }
}
.person-name {
  margin-bottom: 8px;
  font-size: 15px;
  font-weight: 700;
  color: $text;
}
.person-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 4px;
  font-size: 12px;
  color: $sub;
  span {
    min-width: 0;
    word-break: break-word;
  }
}

/* ── Pickup ── */
.pickup-card {
  border-left: 4px solid $c;
}

/* ── Transitions ── */
.fade-enter-active,
.fade-leave-active {
  max-height: 600px;
  transition: all 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
}

/* ── Responsive ── */
@media (width <= 1100px) {
  .main-layout {
    flex-direction: column;
  }
  .col-left {
    width: 100%;
  }
  .timeline {
    max-height: 300px;
  }
}

@media (width <= 800px) {
  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .people-grid {
    grid-template-columns: 1fr;
  }
  .steps-bar {
    padding: 18px 20px;
    overflow-x: auto;
  }
  .order-body {
    padding: 14px;
  }
}
</style>
