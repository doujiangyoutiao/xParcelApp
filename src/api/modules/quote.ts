import http from "@/api";

export interface QuoteLinePayload {
  serviceCode?: string | null;
  originCountry?: string | null;
  destinationCountry?: string | null;
  weightFrom?: number | null;
  weightTo?: number | null;
  price: number;
  fuelSurcharge?: number | null;
  remoteFee?: number | null;
  remark?: string | null;
}

export interface QuotePayload {
  companyId?: number | null;
  customerId?: number | null;
  title: string;
  currency: string;
  validFrom?: string | null;
  validTo?: string | null;
  isPublic: boolean;
  status: string;
  remark?: string | null;
  contactEmail?: string | null;
  lines: QuoteLinePayload[];
}

export interface QuoteListParams {
  pageNumber?: number;
  pageSize?: number;
  keyword?: string;
  customerId?: number;
  status?: string;
}

export const getQuoteList = (params?: QuoteListParams) => {
  return http.get("/api/Quotes", { ...params });
};

export const getQuoteById = (id: number) => {
  return http.get(`/api/Quotes/${id}`);
};

export const addQuote = (params: QuotePayload) => {
  return http.post("/api/Quotes", params);
};

export const updateQuote = (id: number, params: QuotePayload) => {
  return http.post(`/api/Quotes/Update/${id}`, params);
};

export const deleteQuote = (id: number) => {
  return http.post(`/api/Quotes/Delete/${id}`, {});
};

export const sendQuoteEmail = (id: number, params: { toEmail: string; subject?: string | null; message?: string | null }) => {
  return http.post(`/api/Quotes/${id}/SendEmail`, params);
};
