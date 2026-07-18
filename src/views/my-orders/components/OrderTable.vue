<template>
  <div>
    <el-affix :offset="95" style="width: 100%">
      <div style="width: 100%">
        <el-row :span="24" style="padding-bottom: 16px; background: #ffffff">
          <el-row align="middle" style="width: 100%"> </el-row>
        </el-row>
      </div>
    </el-affix>
    <ExcelPro ref="excelPro" :row-keys="state.excelParams" />
    <BookingPickup ref="bookingPickup" />
  </div>
</template>
<script lang="ts" setup>
import { reactive, toRefs } from "vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

const state = reactive({
  print: t("orderlist.export_orders"),
  excelParams: {} as any
});
const {} = toRefs(state);
</script>
<style scoped>
::v-deep .el-button [class*="el-icon"] + span {
  margin-left: 8px;
}
</style>
