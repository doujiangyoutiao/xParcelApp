const menuIconMap: Record<string, string> = {
  dashboard: "HomeFilled",
  home: "HomeFilled",
  "my-orders": "Document",
  order: "Document",
  orders: "Document",
  "create-order": "EditPen",
  create: "EditPen",
  "address-book": "Notebook",
  address: "Notebook",
  book: "Notebook",
  "order-import": "UploadFilled",
  import: "UploadFilled",
  service: "Van",
  tracking: "Van",
  track: "Van",
  "user-management": "UserFilled",
  users: "UserFilled",
  user: "UserFilled",
  customer: "User",
  customers: "User",
  company: "OfficeBuilding",
  companies: "OfficeBuilding",
  "sales-leads": "TrendCharts",
  saleslead: "TrendCharts",
  "sales-lead": "TrendCharts",
  leads: "TrendCharts",
  quote: "Tickets",
  quotes: "Tickets",
  quotation: "Tickets",
  quotations: "Tickets",
  pricing: "Money",
  setting: "Setting",
  settings: "Setting"
};

const normalizeKey = (value?: string | null) =>
  String(value || "")
    .trim()
    .toLowerCase();

export const resolveMenuIcon = (item: any): string => {
  const rawIcon = item?.meta?.icon ?? item?.icon;
  const iconKey = normalizeKey(rawIcon);
  if (menuIconMap[iconKey]) return menuIconMap[iconKey];

  const pathKey = normalizeKey(item?.path).replace(/^\/+/, "").split("/")[0];
  if (menuIconMap[pathKey]) return menuIconMap[pathKey];

  const nameKey = normalizeKey(item?.meta?.name ?? item?.name).replace(/\s+/g, "-");
  if (menuIconMap[nameKey]) return menuIconMap[nameKey];

  const titleKey = normalizeKey(item?.meta?.title ?? item?.title).replace(/\s+/g, "-");
  if (menuIconMap[titleKey]) return menuIconMap[titleKey];

  return rawIcon || "Document";
};

export const normalizeMenuIcons = (menuTree: any[] = []): any[] => {
  menuTree.forEach(item => {
    if (item.meta) {
      item.meta.icon = resolveMenuIcon(item);
    } else {
      item.icon = resolveMenuIcon(item);
    }

    if (item.children?.length) {
      normalizeMenuIcons(item.children);
    }
  });
  return menuTree;
};
