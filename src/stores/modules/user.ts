import { defineStore } from "pinia";
import { UserState } from "@/stores/interface";
import piniaPersistConfig from "@/stores/helper/persist";
import { localGet } from "@/utils";

export const useUserStore = defineStore({
  id: "geeker-user",
  state: (): UserState => ({
    token: localGet("token"),
    userInfo: localGet("userInfo")
  }),
  getters: {
    getToken: state => state.token,
    getUserInfo: state => state.userInfo
  },
  actions: {
    setToken() {
      this.token = localGet("token");
    },
    clearToken() {
      this.token = "";
    },
    // Set setUserInfo
    setUserInfo() {
      this.userInfo = localGet("userInfo");
    },
    clearUserInfo() {
      this.userInfo = undefined;
    }
  },
  persist: piniaPersistConfig("geeker-user")
});
