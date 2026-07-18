import { createI18n } from "vue-i18n";
// import { getBrowserLang } from "@/utils";

import zh from "./modules/zh/zh";
import en from "./modules/en/en";

const i18n = createI18n({
  allowComposition: true,
  legacy: false,
  locale: "en",
  messages: {
    zh,
    en
  }
});

export default i18n;
