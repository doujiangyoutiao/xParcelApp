<template>
  <div class="user-page">
    <section class="toolbar">
      <el-form :model="searchForm" inline>
        <el-form-item label="Search">
          <el-input v-model.trim="searchForm.search" clearable placeholder="Username or email" @keyup.enter="loadUsers" />
        </el-form-item>
        <el-form-item label="Level">
          <el-select v-model="searchForm.userLevel" clearable placeholder="All" style="width: 150px">
            <el-option label="Super Admin" value="S" />
            <el-option label="Company Admin" value="A" />
            <el-option label="Customer" value="C" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="toolbar-actions">
        <el-button :icon="Search" @click="loadUsers">Search</el-button>
        <el-button :icon="Refresh" @click="resetSearch">Reset</el-button>
        <el-button type="primary" :icon="Plus" @click="openUserDialog()">Create User</el-button>
      </div>
    </section>

    <el-table :data="users" border stripe height="calc(100vh - 270px)">
      <el-table-column prop="userName" label="Username" min-width="150" show-overflow-tooltip />
      <el-table-column prop="email" label="Email" min-width="190" show-overflow-tooltip />
      <el-table-column label="Level" width="130">
        <template #default="{ row }">
          <el-tag effect="plain" :type="levelTagType(row.userLevel)">{{ levelLabel(row.userLevel) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="companyName" label="Company" min-width="150" show-overflow-tooltip />
      <el-table-column prop="customerName" label="Customer" min-width="150" show-overflow-tooltip />
      <el-table-column label="Menus" width="90">
        <template #default="{ row }">{{ row.permissionMenuIds?.length || 0 }}</template>
      </el-table-column>
      <el-table-column label="Operation" fixed="right" align="center" width="230">
        <template #default="{ row }">
          <el-button type="primary" link :icon="EditPen" @click="openUserDialog(row)">Edit</el-button>
          <el-button type="primary" link :icon="Key" @click="openPasswordDialog(row)">Reset</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="userDialogVisible" :title="isEdit ? 'Edit User' : 'Create User'" width="760px" destroy-on-close>
      <el-form ref="userFormRef" :model="userForm" :rules="userRules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Username" prop="userName">
              <el-input v-model.trim="userForm.userName" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Email" prop="email">
              <el-input v-model.trim="userForm.email" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="User Level" prop="userLevel">
              <el-select v-model="userForm.userLevel" @change="applyDefaultPermissions">
                <el-option label="Super Admin" value="S" />
                <el-option label="Company Admin" value="A" />
                <el-option label="Customer" value="C" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="!isEdit" :span="12">
            <el-form-item label="Password" prop="password">
              <el-input v-model="userForm.password" type="password" show-password maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Company">
              <el-select v-model="userForm.companyId" clearable filterable placeholder="Select company">
                <el-option v-for="item in companies" :key="item.id" :label="item.companyName" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Customer">
              <el-select v-model="userForm.customerId" clearable filterable placeholder="Select customer">
                <el-option v-for="item in customers" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Menus">
          <div class="permission-box">
            <div class="permission-actions">
              <el-button size="small" @click="checkAllMenus">All</el-button>
              <el-button size="small" @click="clearMenus">Clear</el-button>
            </div>
            <el-tree
              ref="menuTreeRef"
              :data="menus"
              node-key="id"
              show-checkbox
              default-expand-all
              :props="{ label: 'title', children: 'children' }"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="saveUser">Save</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="passwordDialogVisible" title="Reset Password" width="420px" destroy-on-close>
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="120px">
        <el-form-item label="New Password" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password maxlength="50" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="savingPassword" @click="savePassword">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="UserManagement">
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { EditPen, Key, Plus, Refresh, Search } from "@element-plus/icons-vue";
import {
  createManagedUser,
  getManagedMenus,
  getManagedUsers,
  resetManagedUserPassword,
  updateManagedUser
} from "@/api/modules/userManagement";
import { getCompanyList } from "@/api/modules/company";
import { getCustomerList } from "@/api/modules/customer";

const users = ref<any[]>([]);
const menus = ref<any[]>([]);
const companies = ref<any[]>([]);
const customers = ref<any[]>([]);
const saving = ref(false);
const savingPassword = ref(false);
const userDialogVisible = ref(false);
const passwordDialogVisible = ref(false);
const userFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();
const menuTreeRef = ref<any>();
const editingUserId = ref("");
const passwordUserId = ref("");
const searchForm = reactive({
  search: "",
  userLevel: ""
});
const userForm = reactive({
  userName: "",
  email: "",
  userLevel: "C",
  companyId: undefined as number | undefined,
  customerId: undefined as number | undefined,
  password: ""
});
const passwordForm = reactive({
  newPassword: ""
});
const isEdit = computed(() => !!editingUserId.value);
const userRules: FormRules = {
  userName: [{ required: true, message: "Please enter username", trigger: "blur" }],
  email: [
    { required: true, message: "Please enter email", trigger: "blur" },
    { type: "email", message: "Please enter a valid email", trigger: "blur" }
  ],
  userLevel: [{ required: true, message: "Please select user level", trigger: "change" }],
  password: [{ required: true, message: "Please enter password", trigger: "blur" }]
};
const passwordRules: FormRules = {
  newPassword: [{ required: true, min: 6, message: "Password must be at least 6 characters", trigger: "blur" }]
};

const levelLabel = (level: string) => {
  const labels: Record<string, string> = { S: "Super Admin", A: "Company Admin", C: "Customer" };
  return labels[level] || level || "--";
};

const levelTagType = (level: string) => {
  if (level === "S") return "danger";
  if (level === "A") return "warning";
  return "success";
};

const flattenMenuIds = (items: any[]): number[] => {
  return items.flatMap(item => [item.id, ...(item.children?.length ? flattenMenuIds(item.children) : [])]);
};

const defaultMenuIdsByLevel = (level: string) => {
  const allIds = flattenMenuIds(menus.value);
  if (level === "S") return allIds;
  const titlesForCompany = ["Dashboard", "Company", "Customer", "Service", "My Orders", "Tracking"];
  const titlesForCustomer = ["Dashboard", "Create Order", "My Orders", "Address Book", "Tracking"];
  const allowedTitles = level === "A" ? titlesForCompany : titlesForCustomer;
  return allIds.filter(id => {
    const menu = findMenuById(menus.value, id);
    return allowedTitles.some(title =>
      String(menu?.title || "")
        .toLowerCase()
        .includes(title.toLowerCase())
    );
  });
};

const findMenuById = (items: any[], id: number): any => {
  for (const item of items) {
    if (item.id === id) return item;
    const found = item.children?.length ? findMenuById(item.children, id) : null;
    if (found) return found;
  }
  return null;
};

const applyDefaultPermissions = () => {
  nextTick(() => {
    menuTreeRef.value?.setCheckedKeys(defaultMenuIdsByLevel(userForm.userLevel));
  });
};

const loadUsers = async () => {
  const response: any = await getManagedUsers({
    search: searchForm.search || undefined,
    userLevel: searchForm.userLevel || undefined
  });
  users.value = response.Data || [];
};

const loadOptions = async () => {
  const [menusRes, companyRes, customerRes]: any[] = await Promise.all([
    getManagedMenus(),
    getCompanyList(),
    getCustomerList({ pageNumber: 1, pageSize: 1000 })
  ]);
  menus.value = menusRes.Data || [];
  companies.value = companyRes.Data || [];
  customers.value = customerRes.Data?.items || customerRes.Data?.Items || customerRes.Data || [];
};

const resetSearch = () => {
  searchForm.search = "";
  searchForm.userLevel = "";
  loadUsers();
};

const openUserDialog = async (row?: any) => {
  editingUserId.value = row?.id || "";
  userForm.userName = row?.userName || "";
  userForm.email = row?.email || "";
  userForm.userLevel = row?.userLevel || "C";
  userForm.companyId = row?.companyId || undefined;
  userForm.customerId = row?.customerId || undefined;
  userForm.password = "";
  userDialogVisible.value = true;
  await nextTick();
  menuTreeRef.value?.setCheckedKeys(row?.permissionMenuIds || defaultMenuIdsByLevel(userForm.userLevel));
};

const checkAllMenus = () => {
  menuTreeRef.value?.setCheckedKeys(flattenMenuIds(menus.value));
};

const clearMenus = () => {
  menuTreeRef.value?.setCheckedKeys([]);
};

const getCheckedMenuIds = () => {
  return [...menuTreeRef.value.getCheckedKeys(), ...menuTreeRef.value.getHalfCheckedKeys()].map((id: number | string) =>
    Number(id)
  );
};

const saveUser = async () => {
  await userFormRef.value?.validate();
  saving.value = true;
  try {
    const payload = {
      userName: userForm.userName,
      email: userForm.email,
      userLevel: userForm.userLevel,
      companyId: userForm.companyId || null,
      customerId: userForm.customerId || null,
      password: userForm.password,
      permissionMenuIds: getCheckedMenuIds()
    };
    if (isEdit.value) {
      await updateManagedUser(editingUserId.value, payload);
    } else {
      await createManagedUser(payload);
    }
    ElMessage.success("Saved successfully.");
    userDialogVisible.value = false;
    await loadUsers();
  } finally {
    saving.value = false;
  }
};

const openPasswordDialog = (row: any) => {
  passwordUserId.value = row.id;
  passwordForm.newPassword = "";
  passwordDialogVisible.value = true;
};

const savePassword = async () => {
  await passwordFormRef.value?.validate();
  savingPassword.value = true;
  try {
    await resetManagedUserPassword(passwordUserId.value, passwordForm.newPassword);
    ElMessage.success("Password reset successfully.");
    passwordDialogVisible.value = false;
  } finally {
    savingPassword.value = false;
  }
};

onMounted(async () => {
  await loadOptions();
  await loadUsers();
});
</script>

<style scoped lang="scss">
.user-page {
  padding: 16px;
}
.toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px;
  margin-bottom: 12px;
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}
.toolbar-actions {
  display: flex;
  gap: 8px;
}
.permission-box {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}
.permission-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
</style>
