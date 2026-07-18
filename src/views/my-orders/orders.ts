import { PageQueryParam } from "././interface/base";
/**
 * 查询参数类型
 */
export interface ADCOrderQueryParam extends PageQueryParam {
  orderNumber?: string;
  origin?: string;
  orderStatus?: string | undefined;
  destination?: string;
  startDate?: string;
  endDate?: string;
  agentId?: number;
}

/**
 * 列表项
 */
export interface ADCOrderItem {
  orderId: number;
  orderNumber: string;
  mawb: string;
  createDate: string;
  origin: string;
  destination: string;
  status: number;
}

/**
 * 列表项
 */
export interface titleQuery {
  selectCustome: any;
  selectServe: any;
  selectCountry: any;
  hawbNumberType: any;
  shipmentNumber: any;
}
