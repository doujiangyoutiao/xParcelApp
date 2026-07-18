import router from "@/routers/index";
import { LOGIN_URL } from "@/config";
// import { ElNotification } from "element-plus";
import { useUserStore } from "@/stores/modules/user";
import { useAuthStore } from "@/stores/modules/auth";

import { localGet } from "@/utils/index";
import { RouteRecordRaw } from "vue-router";
// 引入 views 文件夹下所有 vue 文件
const modules = import.meta.glob("@/views/**/*.vue");

/**
 * @description 初始化动态路由
 */
export const initDynamicRouter = async () => {
  const userStore = useUserStore();
  const authStore = useAuthStore();
  const menuTree = localGet("menuList");
  try {
    authStore.setAuthMenuList();
    authStore.setIsAddRoute(true);
    if (!menuTree?.length) {
      userStore.clearToken();
      router.replace(LOGIN_URL);
      return Promise.reject("No permission");
    }

    // 添加动态路由
    authStore.flatMenuListGet.forEach(item => {
      item.children && delete item.children;

      // 添加动态路由
      if (item.component && typeof item.component == "string" && item.component !== "layout") {
        item.component = modules["/src/views" + item.component + ".vue"];
      }
      if (item.meta.isFull) {
        router.addRoute(item as unknown as RouteRecordRaw);
      } else {
        router.addRoute("layout", item as unknown as RouteRecordRaw);
      }
    });
  } catch (error) {
    // 当按钮 || 菜单请求出错时，重定向到登陆页
    userStore.clearToken();
    router.replace(LOGIN_URL);
    return Promise.reject(error);
  }
};
