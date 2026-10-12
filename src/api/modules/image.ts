import http from "@/api";

export const uploadImage = (params: FormData) => {
  return http.post("/api/Images/Upload", params, { headers: { "Content-Type": "multipart/form-data" } });
};
