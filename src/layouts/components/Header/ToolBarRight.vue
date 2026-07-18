<template>
  <div class="tool-bar-ri">
    <div class="header-icon">
      <!-- <AssemblySize id="assemblySize" /> -->
      <Language id="language" />
      <!-- <SearchMenu id="searchMenu" /> -->
      <!-- <ThemeSetting id="themeSetting" /> -->
      <!-- <Message id="message" /> -->
      <Fullscreen id="fullscreen" />
    </div>
    <div class="user-info">
      <div class="user-detail">
        <span class="username">{{ username }}</span>
        <span class="user-role">Admin</span>
      </div>
      <Avatar />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUserStore } from "@/stores/modules/user";
//import AssemblySize from "./components/AssemblySize.vue";
import Language from "./components/Language.vue";
//import SearchMenu from "./components/SearchMenu.vue";
//import ThemeSetting from "./components/ThemeSetting.vue";
//import Message from "./components/Message.vue";
import Fullscreen from "./components/Fullscreen.vue";
import Avatar from "./components/Avatar.vue";

const userStore = useUserStore();
// console.log("111111111111");
// console.log(userStore);
// console.log(userStore.getUserInfo?.username);
// console.log("22222222222222");
const username = computed(() => userStore.getUserInfo?.username);
</script>

<style scoped lang="scss">
.tool-bar-ri {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 20px;
  .header-icon {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 4px 8px;
    margin-right: 12px;
    background: rgb(255 255 255 / 15%);
    backdrop-filter: blur(4px);
    border-radius: 20px;
    & > * {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      color: rgb(255 255 255 / 90%);
      cursor: pointer;
      border-radius: 50%;
      transition: all 0.3s ease;
      &:hover {
        color: #ffffff;
        background-color: rgb(255 255 255 / 25%);
        transform: scale(1.1);
      }
    }
  }
  .user-info {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 6px 12px 6px 16px;
    cursor: pointer;
    background: rgb(255 255 255 / 15%);
    backdrop-filter: blur(4px);
    border-radius: 25px;
    transition: all 0.3s ease;
    &:hover {
      background: rgb(255 255 255 / 25%);
      box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
    }
    .user-detail {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      .username {
        font-size: 14px;
        font-weight: 600;
        line-height: 1.2;
        color: #ffffff;
      }
      .user-role {
        font-size: 11px;
        color: rgb(255 255 255 / 85%);
      }
    }
  }
}
</style>
