// import { BasePort } from "@/api/config/servicePort";
// import { PropType } from "vue";
import http from "@/api";
import { localGet } from "@/utils";
const stationValue = localGet("selectedStation");
/**
 * @name 客户select
 */
export const getCustomerList = (AgentId: any) => {
  return http.get(`/api/services/app/customer/VueCustomerGetCustomerAndSubCustomersNew`, { AgentId });
};

/* 根据客户id或者登录人获取服务和产品 */
export const getServiceForSpanner = () => {
  return http.get("/api/Service/GetServicesByCustomer");
};
/* 国家 */
export const getCountry = () => {
  return http.get("/api/Countries/GetCountries");
};

export const getCountryList = () => {
  return http.get("/api/services/app/location/VueCurrencyList");
};

/* 获取order列表 */
export const getOrderList = params => {
  return http.post("/api/Shipment/GetShipment", { agentPermissionId: stationValue, ...params });
};

/* 打印订单Label */
export const printLabel = params => {
  return http.post("/api/shipment/GetShipmentLabel", params);
};

/* 批量打印发票 */
export const getPrintInvoice = params => {
  return http.post("/api/shipment/GetShipmentInvoice", params);
};

/* 取消订单 */
export const orderCancel = (id: number) => {
  return http.post(`/api/Shipment/CancelShipment/${id}`, {});
};

/* 导出订单报表 */
export const exportOrderExcel = params => {
  return http.post("/api/Shipment/ExportShipment", { ...params });
};

/* 获取导出字段列表 */
export const getExportFieldsList = () => {
  return http.get("api/services/app/exportfields/VueGetExportfieldsList");
};

/* 保存导出字段列表 */
export const saveConfigurationExportfields = params => {
  return http.post("/api/services/app/exportfields/VueConfigurationExportfields", params);
};

/* 导出订单报表 */
export const printOrderExcelPro = params => {
  return http.post("/api/services/app/hawb/VueHawbGetExportPro", { agentPermissionId: stationValue, ...params });
};

/* 获取自定义导出字段列表 */
export const getCreateExportList = params => {
  return http.post("/api/services/app/exportfields/VueGetExportformatDownloadList", params, { loading: false });
};
/* 订单详情 */
export const getOrderDetailById = (id: any) => {
  return http.get(`/api/Shipment/GetShipmentDetail`, { id });
};

export const getHawbhawbNumber = (id: any) => {
  return http.get(`/api/services/app/exceptionCase/VueGetCaseHawbDetail`, { id });
};
/* 批量booking */
export const saveBookings = params => {
  return http.post(`/api/services/app/hawb/VueHawbInsertBookingToSam`, params, { noShowErrorTooltips: false });
};

export const createPickupAddress = params => {
  return http.post("/api/services/app/customerPickupService/VueCustomerPickupAddOrUpdate", params, { loading: false });
};

export const batchDownloadPod = params => {
  return http.post("/api/services/app/hawb/BatchDownloadPod", params);
};

export const getCaseHawbDetailList = (id: any) => {
  return http.get(`/api/services/app/exceptionCase/VueGetCaseHawbDetailList`, { id });
};
