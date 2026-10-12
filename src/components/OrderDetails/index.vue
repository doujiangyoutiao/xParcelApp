<template>
  <div>
    <el-drawer v-model="drawer" size="82%" :show-close="true" class="order-details-drawer">
      <template #header>
        <div class="drawer-header">
          <div class="header-main">
            <div class="header-icon">XP</div>
            <div class="header-info">
              <div class="header-eyebrow">{{ $t("orderlist.order_detail") }}</div>
              <div class="header-title">{{ state.trackData.shipmentNumber }}</div>
              <div class="header-sub">{{ state.trackData.referenceNumber || "--" }}</div>
            </div>
          </div>
          <div class="header-actions">
            <el-tag :type="statusTagType" effect="dark" round size="large" class="header-status">
              {{ statusText }}
            </el-tag>
          </div>
        </div>
      </template>

      <div class="order-body">
        <section class="status-strip">
          <div class="status-cell">
            <strong>{{ $t("orderlist.customer_ref") }}</strong>
            <div class="status-value">{{ state.trackData.referenceNumber || "--" }}</div>
          </div>
          <div class="status-cell">
            <strong>{{ $t("orderlist.package") }}</strong>
            <div class="status-value">
              {{ state.trackData.pieces || "--" }} {{ $t("orderlist.pieces_short") }} · {{ state.trackData.weight || "--" }} kg
            </div>
            <small>{{ dimensionInfo }}</small>
          </div>
          <div class="status-cell">
            <strong>{{ $t("orderlist.service") }}</strong>
            <div class="service-value">
              <span class="service-logo-wrap">
                <img v-if="serviceLogoUrl" class="service-logo" :src="serviceLogoUrl" :alt="state.trackData.serviceCode" />
                <span v-else class="service-logo-fallback">{{ serviceInitial }}</span>
              </span>
              <span class="service-code">{{ state.trackData.serviceCode || "--" }}</span>
            </div>
            <small>{{ state.trackData.carrierName || state.trackData.shippingServiceName || "--" }}</small>
          </div>
        </section>

        <section class="route-card">
          <div class="route-place route-place--from">
            <div class="route-label">{{ $t("orderlist.from") }}</div>
            <div class="route-country">{{ formatCountryDisplayName(state.trackData.senderCountryName) || "--" }}</div>
            <div class="route-detail">{{ senderRouteInfo }}</div>
          </div>
          <div class="route-line">
            <div class="route-plane">A</div>
          </div>
          <div class="route-place route-place--to">
            <div class="route-label">{{ $t("orderlist.to") }}</div>
            <div class="route-country">{{ formatCountryDisplayName(state.trackData.recipientCountryName) || "--" }}</div>
            <div class="route-detail">{{ recipientCityInfo }}</div>
          </div>
        </section>

        <div class="main-layout">
          <div class="col-left">
            <div class="card">
              <div class="card-head">
                <h3>{{ $t("orderlist.logistics_track") }}</h3>
                <span class="card-count">{{ state.hawbTrackList.length }} {{ $t("orderlist.events") }}</span>
              </div>
              <div class="card-body">
                <div class="timeline" v-if="state.hawbTrackList.length">
                  <div v-for="(item, index) in state.hawbTrackList" :key="index" :class="['tl-item', { first: index === 0 }]">
                    <div class="tl-dot"></div>
                    <div class="tl-body">
                      <div class="tl-desc">{{ item.trackingDesc }}</div>
                      <div class="tl-info">{{ item.locationName || "--" }}</div>
                    </div>
                    <div class="tl-time">{{ formatEventTime(item.eventTime) }}</div>
                  </div>
                </div>
                <el-empty v-else :image-size="60" :description="$t('orderlist.no_tracking_data')" />
              </div>
            </div>
          </div>

          <div class="col-right">
            <div class="card people-card">
              <div class="card-head">
                <div>
                  <h3>{{ $t("orderlist.senderreceiver_information") }}</h3>
                  <div class="head-sub">{{ $t("orderlist.primary_contact_delivery_address") }}</div>
                </div>
              </div>
              <div class="card-body people-list">
                <div class="person sender">
                  <div class="person-avatar">S</div>
                  <div class="person-content">
                    <div class="person-head">
                      <span class="person-badge">{{ $t("orderlist.shipper") }}</span>
                      <strong>{{ state.trackData.SenderContact || "--" }}</strong>
                    </div>
                    <div class="contact-row">
                      <span>{{ state.trackData.senderPhone || "--" }}</span>
                      <span>{{ state.trackData.senderCompany || "--" }}</span>
                    </div>
                    <div class="person-address">{{ senderAddress }}</div>
                  </div>
                </div>
                <div class="person receiver">
                  <div class="person-avatar">R</div>
                  <div class="person-content">
                    <div class="person-head">
                      <span class="person-badge">{{ $t("orderlist.consignee") }}</span>
                      <strong>{{ state.trackData.recipientContact || "--" }}</strong>
                    </div>
                    <div class="contact-row">
                      <span>{{ state.trackData.recipientPhone || "--" }}</span>
                      <span>{{ state.trackData.recipientEmail || state.trackData.recipientCompany || "--" }}</span>
                    </div>
                    <div class="person-address">{{ recipientAddress }}</div>
                  </div>
                </div>
              </div>
            </div>

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
                        <el-tag size="small" color="#009094" class="pieces-tag">
                          <span>{{ state.trackData.pieces }}</span>
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
                    <span class="field-k">{{ $t("orderlist.order_method") }}</span>
                    <span class="field-v">{{ state.trackData.dataFrom || "--" }}</span>
                  </div>
                </div>
                <transition name="fade">
                  <div v-show="state.table" class="field-list field-list--more">
                    <div class="field-row">
                      <span class="field-k">{{ $t("orderlist.shipment_type") }}</span>
                      <span class="field-v">{{ displayShipmentType || "--" }}</span>
                    </div>
                    <div class="field-row">
                      <span class="field-k">{{ $t("orderlist.consignee_vat") }}</span>
                      <span class="field-v">{{ state.trackData.recipientVATNumber || "--" }}</span>
                    </div>
                    <div class="field-row">
                      <span class="field-k">{{ $t("orderlist.consignee_eori") }}</span>
                      <span class="field-v">{{ state.trackData.recipientEORINumber || "--" }}</span>
                    </div>
                    <div class="field-row">
                      <span class="field-k">{{ $t("orderlist.shipper_vat_ioss") }}</span>
                      <span class="field-v">{{ state.trackData.SenderVATNumber || "--" }}</span>
                    </div>
                    <div class="field-row">
                      <span class="field-k">{{ $t("orderlist.shipper_eori") }}</span>
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
                      <span class="field-k">{{ $t("orderlist.insurance_value") }}</span>
                      <span class="field-v">{{ state.trackData.insuranceValue || "--" }}</span>
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

            <div class="card" v-if="state.trackData.shipmentItems?.length">
              <div class="card-head">
                <h3>{{ $t("orderlist.item_info") }}</h3>
              </div>
              <div class="card-body no-pad">
                <el-table :data="state.trackData.shipmentItems" stripe size="small" style="width: 100%">
                  <el-table-column :label="$t('orderlist.item_name')" min-width="180">
                    <template #default="{ row }">
                      <div class="item-main">
                        <div class="item-name">{{ row.content || "--" }}</div>
                        <div class="item-sub">{{ row.webSite || "--" }}</div>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="weight" :label="$t('orderlist.weight')" width="80" />
                  <el-table-column prop="pieces" :label="$t('orderlist.qty')" width="60" />
                  <el-table-column prop="price" :label="$t('orderlist.unit_price')" width="90" />
                  <el-table-column prop="hsCode" :label="$t('orderlist.customs_code')" width="100" />
                </el-table>
              </div>
            </div>

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

      <el-dialog v-model="state.packagesDialog" align-center width="760" :title="$t('orderlist.child_packages')">
        <el-table :data="state.trackData.packageShipments" stripe size="small">
          <el-table-column :label="$t('orderlist.state')" min-width="90">
            <template #default="{ row }">
              <el-tag v-if="row.status === 10" type="primary" size="small">{{ $t("orderlist.created") }}</el-tag>
              <el-tag v-else-if="row.status === 20" type="warning" size="small">{{ $t("orderlist.printed") }}</el-tag>
              <el-tag v-else-if="row.status === 30" type="info" size="small">{{ $t("orderlist.inTransit") }}</el-tag>
              <el-tag v-else-if="row.status === 60" type="danger" size="small">{{ $t("orderlist.return") }}</el-tag>
              <el-tag v-else-if="row.status === 100" type="success" size="small">{{ $t("orderlist.delivered") }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('orderlist.child_no')" min-width="130">
            <template #default="{ row }">
              <a style="color: #009094; cursor: pointer">{{ row.shipmentNumber }}</a>
            </template>
          </el-table-column>
          <el-table-column property="referenceNo" :label="$t('orderlist.customer_reference_number')" min-width="110" />
          <el-table-column property="weight" :label="$t('orderlist.weight')" width="90" />
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
import { useI18n } from "vue-i18n";
import { getOrderDetailById, getHawbhawbNumber } from "../../api/modules/orderList";
import { reactive, toRefs } from "vue";
import { formatCountryDisplayName } from "@/utils";
import { getProviderInitial, getProviderLogoUrl } from "@/utils/providerLogo";

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
const { t } = useI18n();

const statusText = computed(() => {
  const m: Record<number, string> = {
    1: t("orderlist.created"),
    2: t("orderlist.printed"),
    3: t("orderlist.inTransit"),
    4: t("orderlist.delivered")
  };
  return m[state.active] || t("orderlist.created");
});

const statusTagType = computed<"primary" | "success" | "warning" | "danger">(() => {
  const m: Record<number, "primary" | "success" | "warning" | "danger"> = {
    1: "primary",
    2: "warning",
    3: "warning",
    4: "success"
  };
  return m[state.active] || "primary";
});

const displayShipmentType = computed(() =>
  state.trackData.shipmentType === 10 ? t("orderlist.document") : t("orderlist.package")
);

const joinText = (parts: Array<string | number | undefined | null>, separator = " · ") => {
  const text = parts.filter(item => item !== undefined && item !== null && `${item}`.trim() !== "").join(separator);
  return text || "--";
};

const recipientCityInfo = computed(() => joinText([state.trackData.recipientCity, state.trackData.recipientPostalCode], " "));

const senderRouteInfo = computed(() =>
  joinText([state.trackData.senderCompany, state.trackData.senderCity, state.trackData.senderPostalCode])
);

const dimensionInfo = computed(() => {
  const firstPackage = state.trackData.packageShipments?.[0] || {};
  return joinText([firstPackage.length, firstPackage.width, firstPackage.height], " x ");
});

const matchedService = computed(() => {
  try {
    const services = JSON.parse(sessionStorage.getItem("dataService") || "[]");
    return services.find((item: any) => item.serviceCode === state.trackData.serviceCode);
  } catch {
    return undefined;
  }
});

const serviceLogoUrl = computed(() => getProviderLogoUrl(matchedService.value?.companyLogo || state.trackData.companyLogo));

const serviceInitial = computed(() =>
  getProviderInitial(matchedService.value?.coloaderCode || state.trackData.coloaderCode || state.trackData.serviceCode)
);

const senderAddress = computed(() =>
  joinText([
    state.trackData.senderHouseNo,
    state.trackData.senderStreet,
    state.trackData.senderCity,
    state.trackData.senderState,
    state.trackData.senderPostalCode,
    formatCountryDisplayName(state.trackData.senderCountryName)
  ])
);

const recipientAddress = computed(() =>
  joinText([
    state.trackData.recipientHouseNo,
    state.trackData.recipientStreet,
    state.trackData.recipientCity,
    state.trackData.recipientState,
    state.trackData.recipientPostalCode,
    formatCountryDisplayName(state.trackData.recipientCountryName)
  ])
);

const shippingCostInfo = computed(() => `${state.trackData.cifCost || "--"} ${state.trackData.cifCostCurrency || ""}`);

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
$teal: #009094;
$teal-soft: #e8f7f6;
$blue: #2c66d3;
$green: #168a4a;
$ink: #18262f;
$muted: #65737f;
$line: #dfe6ea;
$bg: #eef2f5;
$panel: #ffffff;
:deep(.order-details-drawer) {
  .el-drawer__header {
    padding: 0;
    margin-bottom: 0;
    color: #ffffff;
    background: #16262f;
    border: none;
  }
  .el-drawer__close-btn {
    color: rgb(255 255 255 / 72%);
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
  min-height: 76px;
  padding: 12px 24px;
}
.header-main,
.header-actions {
  display: flex;
  align-items: center;
}
.header-main {
  gap: 12px;
  min-width: 0;
}
.header-actions {
  gap: 8px;
  margin-left: 20px;
}
.header-icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 34px;
  height: 34px;
  font-size: 14px;
  font-weight: 900;
  color: #16444a;
  background: #9ee8e1;
  border-radius: 8px;
}
.header-info {
  min-width: 0;
}
.header-eyebrow {
  margin-bottom: 3px;
  font-size: 12px;
  font-weight: 800;
  color: rgb(255 255 255 / 68%);
  letter-spacing: 1.6px;
}
.header-title {
  overflow: hidden;
  font-family: DIN, monospace;
  font-size: 22px;
  font-weight: 900;
  line-height: 1.1;
  color: #ffffff;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.header-sub {
  margin-top: 4px;
  overflow: hidden;
  font-size: 13px;
  color: rgb(255 255 255 / 72%);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.header-status {
  height: 34px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 800;
  color: #ffffff !important;
  border: none;
}
.order-body {
  height: calc(100vh - 76px);
  padding: 0;
  overflow-y: auto;
  background: $bg;
}
.status-strip {
  display: grid;
  grid-template-columns: 1fr 1.35fr 1.2fr;
  background: $panel;
  border-bottom: 1px solid $line;
}
.status-cell {
  min-width: 0;
  padding: 8px 18px;
  border-right: 1px solid $line;
  &:last-child {
    border-right: none;
  }
  strong {
    display: block;
    font-size: 12px;
    font-weight: 800;
    color: $muted;
  }
  small {
    display: block;
    margin-top: 3px;
    overflow: hidden;
    font-size: 12px;
    color: $muted;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.status-value {
  margin-top: 4px;
  overflow: hidden;
  font-size: 17px;
  font-weight: 900;
  line-height: 1.1;
  color: $ink;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.service-value {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
  margin-top: 4px;
}
.service-logo-wrap {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 22px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #dbe5ea;
  border-radius: 5px;
}
.service-logo {
  max-width: 28px;
  max-height: 16px;
  object-fit: contain;
}
.service-logo-fallback {
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
  color: $teal;
}
.service-code {
  min-width: 0;
  overflow: hidden;
  font-size: 17px;
  font-weight: 900;
  line-height: 1.1;
  color: $ink;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.route-card,
.card {
  overflow: hidden;
  background: $panel;
  border: 1px solid $line;
  border-radius: 8px;
}
.route-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
  padding: 12px 20px;
  margin: 12px 18px;
}
.route-place {
  min-width: 0;
  padding-top: 1px;
}
.route-place--to {
  text-align: right;
}
.route-label {
  margin-bottom: 5px;
  font-size: 12px;
  font-weight: 800;
  color: $muted;
}
.route-country {
  overflow: hidden;
  font-size: 18px;
  font-weight: 900;
  color: $ink;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.route-detail {
  margin-top: 4px;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.35;
  color: $muted;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.route-line {
  position: relative;
  height: 32px;
  margin-top: 27px;
  &::before {
    position: absolute;
    top: 15px;
    right: 0;
    left: 0;
    height: 2px;
    content: "";
    background: repeating-linear-gradient(90deg, #aab7be 0 8px, transparent 8px 14px);
  }
}
.route-plane {
  position: absolute;
  top: 0;
  left: calc(50% - 16px);
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  font-size: 15px;
  font-weight: 900;
  color: #ffffff;
  background: $teal;
  border: 3px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 8px 20px rgb(0 144 148 / 24%);
}
.main-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 430px;
  gap: 18px;
  padding: 0 18px 18px;
}
.col-left,
.col-right {
  min-width: 0;
}
.col-right {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 58px;
  padding: 0 18px;
  border-bottom: 1px solid $line;
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 900;
    color: $ink;
  }
}
.head-sub {
  margin-top: 3px;
  font-size: 12px;
  font-weight: 650;
  color: $muted;
}
.card-count {
  font-size: 12px;
  font-weight: 850;
  color: $teal;
}
.card-body {
  padding: 16px 18px;
  &.no-pad {
    padding: 0;
  }
}
.timeline {
  min-height: calc(100vh - 320px);
  max-height: calc(100vh - 250px);
  overflow-y: auto;
}
.tl-item {
  position: relative;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 88px;
  gap: 12px;
  padding-bottom: 26px;
  &::before {
    position: absolute;
    top: 24px;
    bottom: 0;
    left: 13px;
    width: 2px;
    content: "";
    background: #d5e0e6;
  }
  &:last-child::before {
    display: none;
  }
  &.first {
    .tl-dot {
      background: $green;
      border-color: #d9f0e2;
    }
    .tl-desc {
      color: $green;
    }
  }
}
.tl-dot {
  z-index: 1;
  width: 24px;
  height: 24px;
  margin-top: 1px;
  background: #ffffff;
  border: 3px solid #adbbc4;
  border-radius: 50%;
}
.tl-desc {
  font-size: 14px;
  font-weight: 850;
  line-height: 1.35;
  color: $ink;
}
.tl-info {
  margin-top: 5px;
  overflow: hidden;
  font-size: 12px;
  color: $muted;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tl-time {
  font-size: 12px;
  line-height: 1.35;
  color: $muted;
  text-align: right;
  white-space: pre-line;
}
.people-card {
  border-color: #c8ece9;
  box-shadow: 0 14px 30px rgb(0 144 148 / 8%);
  .card-head {
    background: linear-gradient(180deg, #f7fffe 0%, #ffffff 100%);
  }
}
.people-list {
  display: grid;
  gap: 12px;
}
.person {
  position: relative;
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr);
  gap: 12px;
  padding: 14px;
  border-radius: 8px;
  &.sender {
    background: linear-gradient(180deg, #f7fbff 0%, #ffffff 100%);
    border: 1px solid #cfe1ff;
    .person-avatar {
      background: $blue;
    }
    .person-badge {
      color: $blue;
      background: #edf4ff;
    }
  }
  &.receiver {
    background: linear-gradient(180deg, #f4fffd 0%, #ffffff 100%);
    border: 1px solid #bfe9e5;
    .person-avatar {
      background: $teal;
    }
    .person-badge {
      color: $teal;
      background: $teal-soft;
    }
  }
}
.person-avatar {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  font-size: 12px;
  font-weight: 900;
  color: #ffffff;
  border-radius: 50%;
}
.person-content {
  min-width: 0;
}
.person-head {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  strong {
    overflow: hidden;
    font-size: 16px;
    font-weight: 900;
    color: $ink;
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.person-badge {
  flex: 0 0 auto;
  padding: 3px 7px;
  font-size: 11px;
  font-weight: 900;
  border-radius: 999px;
}
.contact-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 8px;
  margin: 10px 0 8px;
  span {
    min-width: 0;
    padding: 7px 8px;
    overflow: hidden;
    font-size: 12px;
    font-weight: 750;
    color: #31424f;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: #ffffff;
    border: 1px solid #e4ebef;
    border-radius: 7px;
  }
}
.person-address {
  padding-top: 8px;
  font-size: 12px;
  line-height: 1.45;
  color: $muted;
  border-top: 1px dashed #d9e4ea;
}
.field-list {
  display: grid;
  gap: 10px;
  & + .field-list--more {
    padding-top: 10px;
    margin-top: 10px;
    border-top: 1px dashed $line;
  }
}
.field-row {
  display: flex;
  gap: 14px;
  justify-content: space-between;
  min-width: 0;
  font-size: 13px;
}
.field-k {
  flex: 0 0 auto;
  color: $muted;
}
.field-v {
  min-width: 0;
  max-width: 240px;
  overflow: hidden;
  font-weight: 800;
  color: $ink;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.link {
  color: $teal;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
  }
}
.pieces-tag {
  margin-left: 4px;
  border: none;
  border-radius: 10px;
  span {
    font-size: 11px;
    color: #ffffff;
  }
}
.pickup-card {
  border-left: 4px solid $teal;
}
.item-main {
  min-width: 0;
}
.item-name {
  overflow: hidden;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.3;
  color: $ink;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-sub {
  margin-top: 2px;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.2;
  color: $muted;
  text-overflow: ellipsis;
  white-space: nowrap;
}
:deep(.el-table) {
  --el-table-header-bg-color: #f3f7f9;
  --el-table-border-color: #e1e9ee;

  font-size: 12px;
}
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

@media (width <= 1280px) {
  .main-layout {
    grid-template-columns: minmax(0, 1fr) 400px;
  }
}

@media (width <= 1100px) {
  .status-strip,
  .route-card,
  .main-layout {
    grid-template-columns: 1fr;
  }
  .route-line {
    display: none;
  }
  .timeline {
    min-height: auto;
    max-height: 360px;
  }
}

@media (width <= 800px) {
  .drawer-header {
    align-items: flex-start;
    min-height: auto;
    padding: 18px;
  }
  .header-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .status-strip {
    grid-template-columns: 1fr;
  }
  .status-cell {
    border-right: none;
    border-bottom: 1px solid $line;
  }
  .route-card,
  .main-layout {
    margin-right: 12px;
    margin-left: 12px;
  }
  .main-layout {
    padding-right: 12px;
    padding-left: 12px;
  }
  .contact-row {
    grid-template-columns: 1fr;
  }
}
</style>
