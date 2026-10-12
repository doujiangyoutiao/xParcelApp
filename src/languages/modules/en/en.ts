import orderlist from "./orderlist";
import orderentry from "./orderentry";
import login from "./login";
import company from "./company";
import customer from "./customer";
import service from "./service";
import addressBook from "./addressBook";
import dashboard from "./dashboard";
import orderImport from "./orderImport";

export default {
  home: {
    welcome: "Welcome"
  },
  tabs: {
    refresh: "Refresh",
    maximize: "Maximize",
    closeCurrent: "Close current",
    closeLeft: "Close Left",
    closeRight: "Close Right",
    closeOther: "Close other",
    closeAll: "Close All"
  },
  header: {
    componentSize: "Component size",
    language: "Language",
    theme: "theme",
    layoutConfig: "Layout config",
    primary: "primary",
    darkMode: "Dark Mode",
    greyMode: "Grey mode",
    weakMode: "Weak mode",
    fullScreen: "Full Screen",
    exitFullScreen: "Exit Full Screen",
    personalData: "Personal Data",
    changePassword: "Change Password",
    companyProfile: "Company Profile",
    logout: "Logout"
  },
  orderlist,
  orderentry,
  login,
  company,
  customer,
  service,
  addressBook,
  dashboard,
  orderImport
};
