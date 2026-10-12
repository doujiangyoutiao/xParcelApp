<template>
  <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large">
    <el-form-item prop="username">
      <el-input v-model="loginForm.username" placeholder="Username: admin / user">
        <template #prefix>
          <el-icon class="el-input__icon">
            <user />
          </el-icon>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input
        v-model="loginForm.password"
        type="password"
        placeholder="Password: 123456"
        show-password
        autocomplete="new-password"
      >
        <template #prefix>
          <el-icon class="el-input__icon">
            <lock />
          </el-icon>
        </template>
      </el-input>
    </el-form-item>
  </el-form>
  <div class="login-btn">
    <el-button :icon="CircleClose" round size="large" @click="resetForm(loginFormRef)"> Reset </el-button>
    <el-button :icon="UserFilled" round size="large" type="primary" :loading="loading" @click="login(loginFormRef)">
      Sign In
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { HOME_URL } from "@/config";
import { Login } from "@/api/interface";

import { loginApi, getCurrentUserInfoApi } from "@/api/modules/login";
import { useUserStore } from "@/stores/modules/user";
import { useTabsStore } from "@/stores/modules/tabs";
import { useKeepAliveStore } from "@/stores/modules/keepAlive";
import { initDynamicRouter } from "@/routers/modules/dynamicRouter";
import { CircleClose, UserFilled } from "@element-plus/icons-vue";
import type { ElForm } from "element-plus";
import { localSet } from "@/utils";
import { resolveMenuIcon } from "@/utils/menuIcon";

const router = useRouter();
const userStore = useUserStore();
const tabsStore = useTabsStore();
const keepAliveStore = useKeepAliveStore();

type FormInstance = InstanceType<typeof ElForm>;
const loginFormRef = ref<FormInstance>();
const loginRules = reactive({
  username: [{ required: true, message: "Please enter username", trigger: "blur" }],
  password: [{ required: true, message: "Please enter password", trigger: "blur" }]
});

const loading = ref(false);
const loginForm = reactive<Login.ReqLoginForm>({
  username: "test",
  password: "123456"
});

// 将请求来的权限列表转成路由所需格式
const handleFormatForMenuList = (menuTree: any[]): void => {
  menuTree.forEach(item => {
    console.log(item);
    const { name, title, activeMenu, ishide, isfull, isAffix, isKeepAlive } = item;
    item.meta = {
      name,
      icon: resolveMenuIcon(item),
      title,
      activeMenu,
      isHide: ishide,
      isFull: isfull,
      isAffix: isAffix,
      isKeepAlive: isKeepAlive
    };
    delete item.name;
    delete item.icon;
    delete item.title;
    delete item.activeMenu;
    delete item.islink;
    delete item.ishide;
    delete item.isfull;
    delete item.isAffix;
    delete item.isKeepAlive;

    if (item.children && item.children.length > 0) {
      handleFormatForMenuList(item.children);
    }
  });
};

// login
const login = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (!valid) return;
    loading.value = true;
    try {
      // 1.执行登录接口
      const loginData: any = await loginApi({ ...loginForm, password: loginForm.password });
      localSet("token", loginData.Data.jwtToken);
      userStore.setToken();

      //获取当前用户基础信息和菜单
      const userInfoData: any = await getCurrentUserInfoApi();
      console.log(userInfoData);
      localSet("userInfo", userInfoData.Data);
      userStore.setUserInfo();

      // 2.添加动态路由
      const menuTree: any[] = userStore.userInfo ? userStore.userInfo.permissions : [];
      handleFormatForMenuList(menuTree);
      localSet("menuList", menuTree);
      initDynamicRouter();

      // 3.清空 tabs、keepAlive 数据
      tabsStore.setTabs([]);
      keepAliveStore.setKeepAliveName([]);

      // 4.跳转到首页
      router.push(HOME_URL);
    } finally {
      loading.value = false;
    }
  });
};

// resetForm
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

onMounted(() => {
  // 监听 enter 事件（调用登录）
  document.onkeydown = (e: KeyboardEvent) => {
    if (e.code === "Enter" || e.code === "enter" || e.code === "NumpadEnter") {
      if (loading.value) return;
      login(loginFormRef.value);
    }
  };
});

onBeforeUnmount(() => {
  document.onkeydown = null;
});
</script>

<style scoped lang="scss">
@import "../index";
</style>
