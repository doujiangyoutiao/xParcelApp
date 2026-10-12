import http from "@/api";

export interface UserManagementPayload {
  userName: string;
  email: string;
  userLevel: string;
  companyId?: number | null;
  customerId?: number | null;
  password?: string;
  permissionMenuIds: number[];
}

export const getManagedUsers = (params?: { search?: string; userLevel?: string }) => {
  return http.get("/api/UserManagement/Users", { ...params });
};

export const getManagedUser = (id: string) => {
  return http.get(`/api/UserManagement/Users/${id}`);
};

export const createManagedUser = (params: UserManagementPayload) => {
  return http.post("/api/UserManagement/Users", params);
};

export const updateManagedUser = (id: string, params: UserManagementPayload) => {
  return http.post(`/api/UserManagement/Users/${id}/Update`, params);
};

export const resetManagedUserPassword = (id: string, newPassword: string) => {
  return http.post(`/api/UserManagement/Users/${id}/ResetPassword`, { newPassword });
};

export const setManagedUserPermissions = (id: string, menuIds: number[]) => {
  return http.post(`/api/UserManagement/Users/${id}/Permissions`, { menuIds });
};

export const getManagedMenus = () => {
  return http.get("/api/UserManagement/Menus");
};
