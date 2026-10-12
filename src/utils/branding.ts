import { computed } from "vue";
import { useUserStore } from "@/stores/modules/user";
import { getProviderLogoUrl } from "@/utils/providerLogo";

export const useBranding = () => {
  const userStore = useUserStore();
  const title = computed(() => {
    const companyName = (userStore.getUserInfo as any)?.company?.companyName;
    return companyName || import.meta.env.VITE_GLOB_APP_TITLE;
  });
  const logoUrl = computed(() => {
    const companyLogo = (userStore.getUserInfo as any)?.company?.companyLogo;
    return getProviderLogoUrl(companyLogo);
  });

  return {
    title,
    logoUrl
  };
};
