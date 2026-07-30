import http from "@/api";

/**
 * @name 地址簿管理
 */

// 查询地址簿列表（支持分页、筛选、排序）
export const getAddressBooks = (params?: any, options: any = {}) => {
  return http.get("/api/AddressBook", { ...params }, options);
};

// 新增地址簿
export const addAddressBook = (params: any, options: any = {}) => {
  return http.post("/api/AddressBook", params, options);
};

export const updateAddressBook = (id: number, params: any) => {
  return http.post(`/api/AddressBook/Update/${id}`, params);
};

export const deleteAddressBook = (id: number) => {
  return http.post(`/api/AddressBook/Delete/${id}`, {});
};

export const getAddressBookForEdit = (params: any) => {
  console.log(params);
  // TODO: 获取编辑详情
  return Promise.reject("接口未实现");
};

export const exportAddressBook = (params: any) => {
  console.log(params);
  // TODO: 导出接口
  return Promise.reject("接口未实现");
};
