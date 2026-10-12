export const getProviderLogoUrl = (logo?: string) => {
  if (!logo) return "";
  if (/^https?:\/\//i.test(logo)) return logo;

  const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/^["']|["']$/g, "").replace(/\/+$/, "");
  const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const currentPath = window.location.pathname;
  const basePath = currentPath.endsWith("/") ? currentPath : currentPath.replace(/[^/]+$/, "");
  const assetBaseUrl = apiUrl
    ? apiUrl.replace(/\/api$/i, "")
    : isLocal
      ? "http://127.0.0.1:5249"
      : new URL(".", `${window.location.origin}${basePath}`).toString().replace(/\/$/, "");
  const normalizedLogo = logo.replace(/^\/+/, "").replace(/^Images\//i, "");

  return `${assetBaseUrl}/Images/${normalizedLogo}`;
};

export const getProviderInitial = (name?: string) => (name || "?").trim().slice(0, 1).toUpperCase();
