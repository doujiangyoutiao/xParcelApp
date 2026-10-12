<template>
  <div class="tracking-page">
    <section class="tracking-header">
      <div>
        <h2>Tracking</h2>
        <p>Search shipment tracking and sync provider updates.</p>
      </div>
      <div class="search-box">
        <el-input v-model.trim="trackingNumber" clearable placeholder="Tracking number" @keyup.enter="loadTracking" />
        <el-button type="primary" :icon="Search" :loading="loading" @click="loadTracking">Search</el-button>
        <el-button :icon="Refresh" :loading="syncing" :disabled="!trackingData?.shipmentNumber" @click="handleSync">
          Sync
        </el-button>
      </div>
    </section>

    <section v-if="trackingData" class="summary-panel">
      <div class="summary-main">
        <div>
          <span class="summary-label">Tracking No.</span>
          <strong>{{ trackingData.shipmentNumber }}</strong>
        </div>
        <el-tag :type="statusTagType" effect="plain">{{ trackingData.unifiedStatus }}</el-tag>
      </div>
      <div class="summary-grid">
        <div>
          <span>Service</span>
          <strong>{{ trackingData.serviceCode || "--" }}</strong>
        </div>
        <div>
          <span>Last Event</span>
          <strong>{{ formatTime(trackingData.lastEventTime) }}</strong>
        </div>
        <div>
          <span>Last Sync</span>
          <strong>{{ formatTime(trackingData.lastSyncTime) }}</strong>
        </div>
        <div>
          <span>Packages</span>
          <strong>{{ trackingData.packages?.length || 0 }}</strong>
        </div>
      </div>
    </section>

    <section v-if="trackingData" class="tracking-content">
      <el-tabs v-model="activePackage" class="package-tabs">
        <el-tab-pane
          v-for="pkg in trackingData.packages"
          :key="pkg.packageNumber"
          :label="pkg.packageNumber"
          :name="pkg.packageNumber"
        >
          <div v-if="pkg.events?.length" class="timeline">
            <div v-for="(event, index) in pkg.events" :key="`${event.eventTime}-${index}`" class="timeline-item">
              <div class="rail">
                <span :class="['dot', { current: index === 0 }]"></span>
                <span v-if="index < pkg.events.length - 1" class="line"></span>
              </div>
              <div class="event-card">
                <div class="event-title">
                  <strong>{{ event.trackingDesc }}</strong>
                  <el-tag size="small" effect="plain">{{ event.unifiedStatus }}</el-tag>
                </div>
                <div class="event-meta">
                  <span>{{ formatTime(event.eventTime) }}</span>
                  <span v-if="event.locationName"> · {{ event.locationName }}</span>
                </div>
                <p v-if="event.remark">{{ event.remark }}</p>
              </div>
            </div>
          </div>
          <el-empty v-else description="No tracking events" />
        </el-tab-pane>
      </el-tabs>
    </section>

    <el-empty v-else class="empty-state" description="Enter a tracking number to search" />
  </div>
</template>

<script setup lang="ts" name="Tracking">
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import { Refresh, Search } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import { getTrackingByNumber, syncTracking } from "@/api/modules/tracking";

const trackingNumber = ref("");
const loading = ref(false);
const syncing = ref(false);
const trackingData = ref<any>(null);
const activePackage = ref("");

const statusTagType = computed<"success" | "warning" | "danger" | "info" | "primary">(() => {
  const status = String(trackingData.value?.unifiedStatus || "");
  if (status === "Delivered") return "success";
  if (status === "Exception" || status === "Returned") return "danger";
  if (status === "InTransit") return "warning";
  return "primary";
});

const normalizeResponseData = (response: any) => response?.Data || response?.data || response;

const applyTrackingData = (data: any) => {
  trackingData.value = data;
  activePackage.value = data?.packages?.[0]?.packageNumber || "";
};

const loadTracking = async () => {
  if (!trackingNumber.value) {
    ElMessage.warning("Please enter tracking number.");
    return;
  }

  loading.value = true;
  try {
    const response = await getTrackingByNumber(trackingNumber.value);
    applyTrackingData(normalizeResponseData(response));
  } finally {
    loading.value = false;
  }
};

const handleSync = async () => {
  const number = trackingData.value?.shipmentNumber || trackingNumber.value;
  if (!number) return;

  syncing.value = true;
  try {
    const response = await syncTracking(number);
    const result = normalizeResponseData(response);
    applyTrackingData(result.tracking);
    ElMessage.success(result.message || "Tracking synced.");
  } finally {
    syncing.value = false;
  }
};

const formatTime = (value?: string) => {
  if (!value) return "--";
  return dayjs(value).format("YYYY-MM-DD HH:mm");
};
</script>

<style scoped lang="scss">
.tracking-page {
  min-height: 100%;
  padding: 18px;
  background: #f5f7fb;
}
.tracking-header,
.summary-panel,
.tracking-content {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto 16px;
  background: #ffffff;
  border: 1px solid #edf0f5;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgb(15 23 42 / 4%);
}
.tracking-header {
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  h2 {
    margin: 0;
    font-size: 22px;
    color: #1f2937;
  }
  p {
    margin: 4px 0 0;
    font-size: 13px;
    color: #667085;
  }
}
.search-box {
  display: grid;
  grid-template-columns: minmax(220px, 340px) auto auto;
  gap: 10px;
  align-items: center;
}
.summary-panel {
  padding: 18px 20px;
}
.summary-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid #edf0f5;
  strong {
    display: block;
    margin-top: 4px;
    font-family: DIN, monospace;
    font-size: 24px;
    color: #111827;
  }
}
.summary-label,
.summary-grid span {
  font-size: 12px;
  color: #667085;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  padding-top: 16px;
  strong {
    display: block;
    margin-top: 6px;
    font-size: 14px;
    color: #1f2937;
  }
}
.tracking-content {
  padding: 6px 20px 22px;
}
.timeline {
  padding-top: 10px;
}
.timeline-item {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 12px;
}
.rail {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.dot {
  width: 10px;
  height: 10px;
  margin-top: 18px;
  background: #a8b0bd;
  border-radius: 50%;
}
.dot.current {
  width: 14px;
  height: 14px;
  background: #009094;
  box-shadow: 0 0 0 4px rgb(0 144 148 / 12%);
}
.line {
  flex: 1;
  width: 2px;
  min-height: 58px;
  margin-top: 6px;
  background: #e5e7eb;
}
.event-card {
  padding: 14px 0 18px;
  border-bottom: 1px solid #edf0f5;
  p {
    margin: 8px 0 0;
    font-size: 13px;
    color: #667085;
  }
}
.event-title {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  strong {
    font-size: 15px;
    color: #1f2937;
  }
}
.event-meta {
  margin-top: 6px;
  font-size: 13px;
  color: #667085;
}
.empty-state {
  margin-top: 70px;
}

@media (width <= 760px) {
  .tracking-header {
    align-items: stretch;
  }
  .tracking-header,
  .search-box {
    flex-direction: column;
    grid-template-columns: 1fr;
  }
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
