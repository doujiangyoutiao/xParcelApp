import { RouteRecordRaw } from "vue-router";
import { HOME_URL, LOGIN_URL } from "@/config";

/**
 * staticRouter (静态路由)
 */
export const staticRouter: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: LOGIN_URL
  },
  {
    path: LOGIN_URL,
    name: "login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "登录"
    }
  },
  {
    path: "/layout",
    name: "layout",
    component: () => import("@/layouts/index.vue"),
    // component: () => import("@/layouts/indexAsync.vue"),
    redirect: HOME_URL,
    children: [
      {
        path: "/change-password",
        name: "change-password",
        component: () => import("@/views/change-password/index.vue"),
        meta: {
          title: "Change Password",
          icon: "Lock",
          isHide: true,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      },
      {
        path: "/company-profile",
        name: "company-profile",
        component: () => import("@/views/company-profile/index.vue"),
        meta: {
          title: "Company Profile",
          icon: "OfficeBuilding",
          isHide: true,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      },
      {
        path: "/tracking/index",
        name: "tracking",
        component: () => import("@/views/tracking/index.vue"),
        meta: {
          title: "Tracking",
          icon: "Van",
          isHide: true,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      },
      {
        path: "/user-management/index",
        name: "user-management",
        component: () => import("@/views/user-management/index.vue"),
        meta: {
          title: "User Management",
          icon: "UserFilled",
          isHide: true,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      },
      {
        path: "/quotes/index",
        name: "quotes",
        component: () => import("@/views/quotes/index.vue"),
        meta: {
          title: "Quotes",
          icon: "Tickets",
          isHide: true,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      }
    ]
  }
];

/**
 * errorRouter (错误页面路由)
 */
export const errorRouter = [
  {
    path: "/403",
    name: "403",
    component: () => import("@/components/ErrorMessage/403.vue"),
    meta: {
      title: "403页面"
    }
  },
  {
    path: "/404",
    name: "404",
    component: () => import("@/components/ErrorMessage/404.vue"),
    meta: {
      title: "404页面"
    }
  },
  {
    path: "/500",
    name: "500",
    component: () => import("@/components/ErrorMessage/500.vue"),
    meta: {
      title: "500页面"
    }
  },
  // Resolve refresh page, route warnings
  {
    path: "/:pathMatch(.*)*",
    component: () => import("@/components/ErrorMessage/404.vue")
  }
];
