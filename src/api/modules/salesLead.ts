import http from "@/api";

export interface SalesLeadListParams {
  pageNumber?: number;
  pageSize?: number;
  filterOn?: string;
  filterQuery?: string;
  status?: string;
  country?: string;
  industry?: string;
}

export interface SalesLeadPayload {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  country?: string | null;
  industry?: string | null;
  source?: string | null;
  status?: string | null;
  score?: number | null;
  notes?: string | null;
}

export interface SalesLeadEmailTemplatePayload {
  name: string;
  subject: string;
  htmlBody: string;
  textBody?: string | null;
  isActive: boolean;
}

export const getSalesLeadList = (params?: SalesLeadListParams) => {
  const requestParams = {
    pageNumber: params?.pageNumber,
    pageSize: params?.pageSize,
    search: params?.filterQuery,
    status: params?.status,
    country: params?.country,
    industry: params?.industry
  };
  return http.get("/api/SalesLeads", requestParams);
};

export const getSalesLeadById = (id: number) => {
  return http.get(`/api/SalesLeads/${id}`);
};

export const getSalesLeadOptions = () => {
  return http.get("/api/SalesLeads/Options", {}, { loading: false, noShowErrorTooltips: true });
};

export const addSalesLead = (params: SalesLeadPayload) => {
  return http.post("/api/SalesLeads", params);
};

export const updateSalesLead = (id: number, params: SalesLeadPayload) => {
  return http.post(`/api/SalesLeads/Update/${id}`, params);
};

export const deleteSalesLead = (id: number) => {
  return http.post(`/api/SalesLeads/Delete/${id}`, {});
};

export const getSalesLeadEmailTemplates = () => {
  return http.get("/api/SalesLeadEmails/Templates");
};

export const addSalesLeadEmailTemplate = (params: SalesLeadEmailTemplatePayload) => {
  return http.post("/api/SalesLeadEmails/Templates", params);
};

export const updateSalesLeadEmailTemplate = (id: number, params: SalesLeadEmailTemplatePayload) => {
  return http.post(`/api/SalesLeadEmails/Templates/Update/${id}`, params);
};

export const deleteSalesLeadEmailTemplate = (id: number) => {
  return http.post(`/api/SalesLeadEmails/Templates/Delete/${id}`, {});
};

export const previewSalesLeadEmail = (leadId: number, templateId: number) => {
  return http.post("/api/SalesLeadEmails/Preview", { leadId, templateId });
};

export const sendSalesLeadEmail = (leadIds: number[], templateId: number) => {
  return http.post("/api/SalesLeadEmails/Send", { leadIds, templateId });
};

export const getSalesLeadEmailLogs = (params?: any) => {
  return http.get("/api/SalesLeadEmails/Logs", { ...params });
};
