import http from "@/api";

/**
 * @name 服务管理模块
 */

/** 根据客户id或者登录人获取服务列表 */
export const getServicesByCustomer = () => {
  return http.get("/api/Service/GetServicesByCustomer");
};

/** 获取新增页面的服务列表 */
export const getServicesByAdd = () => {
  return http.get("/api/Service/GetServicesByAdd");
};

/** 新增或编辑服务 */
export const addOrUpdateService = (params: any) => {
  return http.post("/api/Service/AddOrUpdateService", params);
};

/** 获取新增/编辑页面的Coloader信息 */
export const getServiceColoaderInfoForAddOrUpdate = (params: any) => {
  return http.post("/api/Service/GetServiceColoaderInfoForAddOrUpdate", params);
};
