import http from "@/api";

/**
 * @name 公司管理模块
 */

/** 获取公司列表 */
export const getCompanyList = () => {
  return http.get("/api/Company");
};

/** 根据id获取公司详情 */
export const getCompanyById = (id: number) => {
  return http.get(`/api/Company/${id}`);
};

/** 创建公司（同时创建初始登录用户） */
export const addCompany = (params: any) => {
  return http.post("/api/Company/AddCompany", params);
};

/** 更新公司 */
export const updateCompany = (id: number, params: any) => {
  return http.post(`/api/Company/UpdateCompany/${id}`, params);
};

/** 删除公司 */
export const deleteCompany = (id: number) => {
  return http.post(`/api/Company/DeleteCompany/${id}`);
};

/** 获取当前公司的 white-label 资料 */
export const getMyCompanyProfile = () => {
  return http.get("/api/Company/MyProfile");
};

/** 更新当前公司的 white-label 资料 */
export const updateMyCompanyProfile = (params: any) => {
  return http.post("/api/Company/UpdateMyProfile", params);
};

/** 获取国家列表 */
export const getCountries = () => {
  return http.get("/api/Countries/GetCountries");
};
