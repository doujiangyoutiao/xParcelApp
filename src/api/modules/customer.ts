import http from "@/api";

/**
 * @name 客户管理模块
 */

/** 获取客户列表（分页） */
export const getCustomerList = (params?: any) => {
  return http.get("/api/Customers", { ...params });
};

/** 获取客户详情（包含服务选中状态） */
export const getCustomerById = (id: number) => {
  return http.get(`/api/Customers/${id}`);
};

/** 获取新增客户时可选择的服务列表 */
export const getCustomerCreateOptions = (companyId: number) => {
  return http.get("/api/Customers/CreateOptions", { companyId });
};

/** 新增客户（同时创建登录账号和选中服务） */
export const addCustomer = (params: any) => {
  return http.post("/api/Customers/AddCustomer", params);
};

/** 修改客户资料和服务选择 */
export const updateCustomer = (id: number, params: any) => {
  return http.post(`/api/Customers/UpdateCustomer/${id}`, params);
};

/** 重置客户登录账号密码 */
export const resetCustomerPassword = (id: number, newPassword: string) => {
  return http.post(`/api/Customers/${id}/ResetPassword`, { newPassword });
};

/** 删除客户 */
export const deleteCustomer = (id: number) => {
  return http.post(`/api/Customers/DeleteCustomer/${id}`);
};

/** 获取客户 H5 下单链接 */
export const getCustomerMobileOrderLink = (id: number) => {
  return http.get(`/api/Customers/${id}/MobileOrderLink`);
};
