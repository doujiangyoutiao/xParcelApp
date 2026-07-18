<template>
  <template v-for="subItem in menuList" :key="subItem.path">
    <el-sub-menu v-if="subItem.children?.length" :index="subItem.path">
      <template #title>
        <el-icon v-if="subItem.meta.icon">
          <component :is="subItem.meta.icon"></component>
        </el-icon>
        <span class="sle">{{ subItem.meta.title }}</span>
      </template>
      <SubMenu :menu-list="subItem.children" />
    </el-sub-menu>
    <el-menu-item v-else :index="subItem.path" @click="handleClickMenu(subItem)">
      <el-icon v-if="subItem.meta.icon">
        <component :is="subItem.meta.icon"></component>
      </el-icon>
      <template #title>
        <span class="sle">{{ subItem.meta.title }}</span>
      </template>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

defineProps<{ menuList: Menu.MenuOptions[] }>();

const router = useRouter();
const handleClickMenu = (subItem: Menu.MenuOptions) => {
  console.log(router.getRoutes());
  if (subItem.meta.isLink) return window.open(subItem.meta.isLink, "_blank");
  router.push(subItem.path);
};
</script>

<style lang="scss">
// 侧边栏菜单样式 - 深蓝灰色背景主题
.el-sub-menu .el-sub-menu__title {
  height: 48px;
  margin: 4px 12px;
  color: #b4b8c5 !important;
  border-radius: 8px;
  &:hover {
    color: #ffffff !important;
    background-color: rgb(255 255 255 / 8%) !important;
  }
  .el-sub-menu__icon-arrow {
    color: #b4b8c5;
  }
  .el-icon {
    color: #b4b8c5;
    transition: all 0.3s;
  }
  &:hover .el-icon {
    color: #ffffff;
  }
}
.el-menu--collapse {
  .is-active {
    .el-sub-menu__title {
      color: #ffffff !important;
      background: linear-gradient(90deg, var(--el-color-primary) 0%, rgb(64 158 255 / 60%) 100%) !important;
      border-radius: 0 24px 24px 0;
    }
  }
}
.el-menu-item {
  position: relative;
  height: 48px;
  margin: 4px 12px;
  color: #b4b8c5 !important;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover {
    color: #ffffff !important;
    background-color: rgb(255 255 255 / 8%);
  }
  &.is-active {
    font-weight: 500;
    color: #ffffff !important;
    background: linear-gradient(90deg, var(--el-color-primary) 0%, rgb(64 158 255 / 40%) 100%) !important;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgb(64 158 255 / 30%);
    &::before {
      position: absolute;
      top: 50%;
      left: 0;
      width: 4px;
      height: 24px;
      content: "";
      background: #ffffff;
      border-radius: 0 4px 4px 0;
      box-shadow: 0 2px 8px rgb(255 255 255 / 50%);
      transform: translateY(-50%);
    }
    .el-icon {
      color: #ffffff;
    }
  }
  .el-icon {
    color: #b4b8c5;
    transition: all 0.3s;
  }
  &:hover .el-icon {
    color: #ffffff;
    transform: scale(1.1);
  }
}

// 子菜单展开后的背景
.el-sub-menu.is-opened {
  > .el-sub-menu__title {
    color: #ffffff !important;
    background-color: rgb(255 255 255 / 5%) !important;
    .el-icon {
      color: #ffffff;
    }
  }
  .el-menu {
    background-color: rgb(0 0 0 / 15%) !important;
  }
  .el-menu-item {
    height: 44px;
    padding-left: 24px !important;
    margin: 2px 12px 2px 24px;
    &.is-active {
      background: linear-gradient(90deg, var(--el-color-primary) 0%, rgb(64 158 255 / 30%) 100%) !important;
    }
  }
}
.vertical,
.classic,
.transverse {
  .el-menu-item {
    &.is-active {
      &::before {
        left: 0;
      }
    }
  }
}
.columns {
  .el-menu-item {
    &.is-active {
      &::before {
        right: 0;
      }
    }
  }
}
</style>
