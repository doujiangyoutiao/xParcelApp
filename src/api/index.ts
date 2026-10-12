import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { showFullScreenLoading, tryHideFullScreenLoading } from "@/components/Loading/fullScreen";
import { LOGIN_URL } from "@/config";
import { ElMessage } from "element-plus";
import { ResultData } from "@/api/interface";
import { ResultEnum } from "@/enums/httpEnum";
// import { checkStatus } from "./helper/checkStatus";
import { AxiosCanceler } from "./helper/axiosCancel";
import { useUserStore } from "@/stores/modules/user";
import router from "@/routers/index";

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  loading?: boolean;
  cancel?: boolean;
  noShowErrorTooltips?: boolean;
}

const apiBaseURL = ((import.meta.env.VITE_API_URL as string) || "").replace(/^["']|["']$/g, "");

const isAbsoluteUrl = (url: string) => /^(https?:)?\/\//i.test(url);

export const normalizeRequestUrl = (url: string) => {
  if (!url || isAbsoluteUrl(url)) return url;
  return url.replace(/^\/+/, "");
};

export const resolveAppUrl = (path: string) => {
  if (!path) return window.location.href;
  if (isAbsoluteUrl(path)) return path;

  const normalizedPath = path.replace(/^\/+/, "");
  const currentPath = window.location.pathname;
  const basePath = currentPath.endsWith("/") ? currentPath : currentPath.replace(/[^/]+$/, "");

  return new URL(normalizedPath, `${window.location.origin}${basePath}`).toString();
};

const config = {
  // 默认地址请求地址，可在 .env.** 文件中修改
  baseURL: apiBaseURL,
  // 设置超时时间
  timeout: ResultEnum.TIMEOUT as number,
  // 跨域时候允许携带凭证
  withCredentials: true
};

const axiosCanceler = new AxiosCanceler();
class RequestHttp {
  service: AxiosInstance;
  public constructor(config: AxiosRequestConfig) {
    // instantiation
    this.service = axios.create(config);

    /**
     * @description 请求拦截器
     * 客户端发送请求 -> [请求拦截器] -> 服务器
    
     */
    this.service.interceptors.request.use(
      (config: CustomAxiosRequestConfig) => {
        // 当前请求不需要显示 loading，在 api 服务中通过指定的第三个参数: { loading: false } 来控制
        config.loading ??= true;
        config.loading && showFullScreenLoading();
        const userStore = useUserStore();
        if (config.headers && typeof config.headers.set === "function") {
          config.headers.set("Authorization", "Bearer " + userStore.getToken);
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    /**
     * @description 响应拦截器
     *  服务器换返回信息 -> [拦截统一处理] -> 客户端JS获取到信息
     */
    this.service.interceptors.response.use(
      (response: AxiosResponse & { config: CustomAxiosRequestConfig }) => {
        const { data, config } = response;
        // const userStore = useUserStore();
        axiosCanceler.removePending(config);
        config.loading && tryHideFullScreenLoading();
        // HTTP 204 No Content 视为操作成功
        if (response.status === 204) {
          return { Success: true, Data: null, Message: "" };
        }
        // 操作失败
        if (!data.Success) {
          ElMessage.error(data.Message);
          return Promise.reject(data);
        }

        return data;
      },
      async (error: AxiosError) => {
        const { response } = error as any;
        const config = response?.config;

        tryHideFullScreenLoading();
        // 请求超时 && 网络错误单独判断，没有 response
        if (error.message.indexOf("timeout") !== -1) {
          ElMessage.error("Request timeout! Please try again later.");
          return Promise.reject(error);
        }
        if (error.message.indexOf("Network Error") !== -1) {
          ElMessage.error("Network error! Please try again later.");
          return Promise.reject(error);
        }
        // 统一提取错误信息：优先使用 Message，其次 Data（可能是字符串或数组），最后兜底
        const errorData = response?.data;
        let errorMessage = "Request failed!";
        if (errorData?.Message) {
          errorMessage = errorData.Message;
        } else if (Array.isArray(errorData?.Data) && errorData.Data.length > 0) {
          errorMessage = errorData.Data.join("; ");
        } else if (typeof errorData?.Data === "string" && errorData.Data) {
          errorMessage = errorData.Data;
        }

        // 根据服务器响应的错误状态码，做不同的处理
        if (response?.status === ResultEnum.FAIL) {
          if (config?.noShowErrorTooltips) {
            return Promise.reject(response.data);
          } else {
            ElMessage.error(errorMessage);
            return Promise.reject(response.data);
          }
        }
        if (response?.status === ResultEnum.LOGIN_EXPIRE) {
          const userStore = useUserStore();
          userStore.clearToken();
          userStore.clearUserInfo();
          ElMessage.error(errorMessage);
          router.replace(LOGIN_URL);
          return Promise.reject(response.data);
        }
        if (response?.status === ResultEnum.BAD_REQ) {
          if (config?.noShowErrorTooltips) {
            return Promise.reject(response.data);
          } else {
            ElMessage.error(errorMessage);
            return Promise.reject(response.data);
          }
        }
        // 服务器结果都没有返回(可能服务器错误可能客户端断网)，断网处理:可以跳转到断网页面
        if (!window.navigator.onLine) router.replace("/500");
        return Promise.reject(error);
      }
    );
  }

  /**
   * @description 常用请求方法封装
   */
  get<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.service.get(normalizeRequestUrl(url), { params, ..._object });
  }
  post<T>(url: string, params?: object | string, _object = {}): Promise<ResultData<T>> {
    return this.service.post(normalizeRequestUrl(url), params, _object);
  }
  put<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.service.put(normalizeRequestUrl(url), params, _object);
  }
  delete<T>(url: string, data?: any, _object = {}): Promise<ResultData<T>> {
    return this.service.delete(normalizeRequestUrl(url), { data, ..._object });
  }
  download(url: string, params?: object, _object = {}): Promise<BlobPart> {
    return this.service.post(normalizeRequestUrl(url), params, { ..._object, responseType: "blob" });
  }
}

export default new RequestHttp(config);
