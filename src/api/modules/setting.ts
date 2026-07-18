//import { BasePort } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 个人信息模块
 */

/* 国家 */
export const getCountryList = () => {
  return http.get("/api/Countries/GetCountries");
};
