import http from "@/api";

/**
 * @name 订单导入
 */

// 下载模板
export const downloadMuTemp = () => {
  window.open(import.meta.env.VITE_API_URL + `/Files/UploadTemplates/UploadTemplate.xlsx`);
};

// 验证和提交的请求参数类型
export interface ImportShipmentParams {
  fileName: string | null;
}

// 验证和提交的响应类型
export interface ImportShipmentResponse {
  hasError: boolean;
  errorFileUrl: string | null;
  importDataInfo: string | null;
}

// 上传成功之后验证
export const uploadTempFileToInvalid = (params: ImportShipmentParams) => {
  return http.post<ImportShipmentResponse>(`/api/Shipment/InvalidImportShipment`, params);
};

// 提交订单
export const submitOrderByTemp = (params: ImportShipmentParams) => {
  return http.post<ImportShipmentResponse>(`/api/Shipment/ImportShipment`, params);
};

// 单票下单

/* 创建订单 */
export const createOrder = (params: any) => {
  return http.post(`/api/Shipment/CreateShipment`, params, { noShowErrorTooltips: true });
};

// 服务列表下拉框

/* 根据客户id或者登录人获取服务和产品 */
export const getServiceForSpanner = () => {
  return http.get("/api/Service/GetServicesByCustomer");
};

// 打印标签

export const printTag = (params: any) => {
  return http.post(`/api/Shipment/GetShipmentLabel`, params);
};

// 打印发票

export const printInvoice = (params: any) => {
  return http.post(`/api/Shipment/GetShipmentInvoice`, params);
};
