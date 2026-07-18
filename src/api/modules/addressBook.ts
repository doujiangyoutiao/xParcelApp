import http from "@/api";

/**
 * @name 地址簿管理
 */

// 查询地址簿列表（支持分页、筛选、排序）
export const getAddressBooks = (params?: any) => {
  return http.get("/api/AddressBook", { ...params });
};

// 新增地址簿
export const addAddressBook = (params: any) => {
  return http.post("/api/AddressBook", params);
};

// 以下为需要新增的占位接口，请根据实际情况实现
export const deleteAddressBook = (params: any) => {
  console.log(params);
  // TODO: 真实删除接口
  return Promise.reject("接口未实现");
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
