<template>
  <div class="table-box sales-leads-page">
    <div class="table-search">
      <el-form :model="searchForm" inline>
        <el-form-item label="Keyword">
          <el-input
            v-model="searchForm.filterQuery"
            placeholder="Company, contact, email"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="searchForm.status" placeholder="All" clearable filterable>
            <el-option v-for="item in options.statuses" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="Country">
          <el-select v-model="searchForm.country" placeholder="All" clearable filterable>
            <el-option v-for="item in options.countries" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="Industry">
          <el-select v-model="searchForm.industry" placeholder="All" clearable filterable>
            <el-option v-for="item in options.industries" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="search-buttons">
        <div>
          <el-button type="primary" @click="handleSearch">Search</el-button>
          <el-button @click="resetSearch">Reset</el-button>
        </div>
        <div>
          <el-button :icon="Message" @click="openTemplateDialog()">Templates</el-button>
          <el-button type="primary" :icon="Plus" @click="openLeadDialog()">Add Lead</el-button>
        </div>
      </div>
    </div>

    <el-table :data="tableData" border stripe height="calc(100vh - 280px)" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="45" />
      <el-table-column prop="status" label="Status" width="110">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">{{ row.status || "New" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="companyName" label="Company" min-width="170" show-overflow-tooltip />
      <el-table-column prop="contactName" label="Contact" width="130" show-overflow-tooltip />
      <el-table-column prop="email" label="Email" min-width="190" show-overflow-tooltip />
      <el-table-column prop="phone" label="Phone" width="130" show-overflow-tooltip />
      <el-table-column prop="country" label="Country" width="120" show-overflow-tooltip />
      <el-table-column prop="industry" label="Industry" width="140" show-overflow-tooltip />
      <el-table-column prop="source" label="Source" width="120" show-overflow-tooltip />
      <el-table-column prop="score" label="Score" width="80" align="center" />
      <el-table-column prop="updatedAt" label="Updated" width="160">
        <template #default="{ row }">{{ formatDate(row.updatedAt || row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="Operation" align="center" fixed="right" width="210">
        <template #default="{ row }">
          <el-button type="primary" link :icon="EditPen" @click="openLeadDialog(row)" />
          <el-button type="primary" link :icon="Message" @click="openEmailDialog(row)" />
          <el-button type="danger" link :icon="Delete" @click="handleDelete(row)" />
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <div class="bulk-actions">
        <el-button :disabled="!selectedRows.length" :icon="Message" @click="openEmailDialog()">Email Selected</el-button>
      </div>
      <el-pagination
        v-model:current-page="pagination.pageNumber"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog
      v-model="leadDialogVisible"
      :title="isEditLead ? 'Edit Lead' : 'Add Lead'"
      width="760px"
      destroy-on-close
      align-center
    >
      <el-form ref="leadFormRef" :model="leadForm" :rules="leadRules" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Company" prop="companyName">
              <el-input v-model="leadForm.companyName" maxlength="120" placeholder="Company name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Contact" prop="contactName">
              <el-input v-model="leadForm.contactName" maxlength="100" placeholder="Contact name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Email" prop="email">
              <el-input v-model="leadForm.email" maxlength="160" placeholder="name@example.com" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Phone">
              <el-input v-model="leadForm.phone" maxlength="50" placeholder="Phone" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Website">
              <el-input v-model="leadForm.website" maxlength="200" placeholder="https://example.com" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Country">
              <el-input v-model="leadForm.country" maxlength="80" placeholder="Country" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Industry">
              <el-input v-model="leadForm.industry" maxlength="100" placeholder="Industry" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Source">
              <el-input v-model="leadForm.source" maxlength="100" placeholder="Source" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Status">
              <el-select v-model="leadForm.status" placeholder="Status" clearable filterable>
                <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Score">
              <el-input-number v-model="leadForm.score" :min="0" :max="100" :step="5" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Notes">
          <el-input v-model="leadForm.notes" type="textarea" :rows="4" maxlength="1000" show-word-limit placeholder="Notes" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="leadDialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleLeadSubmit">Confirm</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="emailDialogVisible" title="Send Sales Email" width="860px" destroy-on-close align-center>
      <el-form label-width="110px">
        <el-form-item label="Recipients">
          <el-tag v-for="item in emailTargets" :key="item.id" class="recipient-tag">
            {{ item.companyName }} / {{ item.email }}
          </el-tag>
        </el-form-item>
        <el-form-item label="Template">
          <el-select v-model="selectedTemplateId" placeholder="Select email template" filterable>
            <el-option v-for="item in templates" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="email-actions">
        <el-button :disabled="!canPreview" @click="handlePreview">Preview First</el-button>
        <el-button type="primary" :loading="sendLoading" :disabled="!canSend" @click="handleSendEmail">Send Email</el-button>
      </div>
      <div v-if="emailPreview.subject || emailPreview.htmlBody" class="email-preview">
        <div class="preview-subject">{{ emailPreview.subject }}</div>
        <div class="preview-body" v-html="emailPreview.htmlBody"></div>
      </div>
    </el-dialog>

    <el-dialog v-model="templateDialogVisible" title="Email Templates" width="940px" destroy-on-close align-center>
      <div class="template-layout">
        <el-table :data="templates" border stripe height="360px">
          <el-table-column prop="name" label="Name" min-width="150" show-overflow-tooltip />
          <el-table-column prop="subject" label="Subject" min-width="220" show-overflow-tooltip />
          <el-table-column prop="isActive" label="Active" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="row.isActive ? 'success' : 'info'">{{ row.isActive ? "Yes" : "No" }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Operation" width="120" align="center">
            <template #default="{ row }">
              <el-button type="primary" link :icon="EditPen" @click="editTemplate(row)" />
              <el-button type="danger" link :icon="Delete" @click="handleDeleteTemplate(row)" />
            </template>
          </el-table-column>
        </el-table>

        <el-form ref="templateFormRef" :model="templateForm" :rules="templateRules" label-width="90px" class="template-form">
          <el-form-item label="Name" prop="name">
            <el-input v-model="templateForm.name" maxlength="100" />
          </el-form-item>
          <el-form-item label="Subject" prop="subject">
            <el-input v-model="templateForm.subject" maxlength="200" />
          </el-form-item>
          <el-form-item label="Active">
            <el-switch v-model="templateForm.isActive" />
          </el-form-item>
          <el-form-item label="HTML Body" prop="htmlBody">
            <el-input v-model="templateForm.htmlBody" type="textarea" :rows="7" />
          </el-form-item>
          <el-form-item label="Text Body">
            <el-input v-model="templateForm.textBody" type="textarea" :rows="4" />
          </el-form-item>
          <div class="template-hint">Variables: {{ templateVariables }}</div>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="resetTemplateForm">New</el-button>
        <el-button type="primary" :loading="templateLoading" @click="handleTemplateSubmit">Save Template</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="SalesLeads">
import { computed, onMounted, reactive, ref } from "vue";
import { Delete, EditPen, Message, Plus } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";
import {
  addSalesLead,
  addSalesLeadEmailTemplate,
  deleteSalesLead,
  deleteSalesLeadEmailTemplate,
  getSalesLeadById,
  getSalesLeadEmailTemplates,
  getSalesLeadList,
  getSalesLeadOptions,
  sendSalesLeadEmail,
  updateSalesLead,
  updateSalesLeadEmailTemplate
} from "@/api/modules/salesLead";

const statusOptions = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"];
const templateVariables = "{{companyName}}, {{contactName}}, {{email}}, {{country}}, {{industry}}";

const searchForm = reactive({
  filterOn: "companyName",
  filterQuery: "",
  status: "",
  country: "",
  industry: ""
});

const options = reactive({
  statuses: [] as string[],
  countries: [] as string[],
  industries: [] as string[]
});

const tableData = ref<any[]>([]);
const selectedRows = ref<any[]>([]);
const templates = ref<any[]>([]);
const pagination = reactive({
  pageNumber: 1,
  pageSize: 10,
  total: 0
});

const leadDialogVisible = ref(false);
const isEditLead = ref(false);
const submitLoading = ref(false);
const leadFormRef = ref<FormInstance>();
const leadForm = reactive({
  id: undefined as number | undefined,
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  website: "",
  country: "",
  industry: "",
  source: "",
  status: "New",
  score: 50,
  notes: ""
});

const leadRules: FormRules = {
  companyName: [{ required: true, message: "Please enter company name", trigger: "blur" }],
  contactName: [{ required: true, message: "Please enter contact name", trigger: "blur" }],
  email: [
    { required: true, message: "Please enter email", trigger: "blur" },
    { type: "email", message: "Please enter a valid email", trigger: "blur" }
  ]
};

const emailDialogVisible = ref(false);
const selectedTemplateId = ref<number>();
const emailTargets = ref<any[]>([]);
const sendLoading = ref(false);
const emailPreview = reactive({
  subject: "",
  htmlBody: ""
});

const templateDialogVisible = ref(false);
const templateLoading = ref(false);
const templateFormRef = ref<FormInstance>();
const templateForm = reactive({
  id: undefined as number | undefined,
  name: "",
  subject: "",
  htmlBody: "",
  textBody: "",
  isActive: true
});

const templateRules: FormRules = {
  name: [{ required: true, message: "Please enter template name", trigger: "blur" }],
  subject: [{ required: true, message: "Please enter subject", trigger: "blur" }],
  htmlBody: [{ required: true, message: "Please enter HTML body", trigger: "blur" }]
};

const canPreview = computed(() => emailTargets.value.length > 0 && !!selectedTemplateId.value);
const canSend = computed(() => canPreview.value);

const unwrapData = (res: any) => res?.Data ?? res?.data ?? res;
const unwrapList = (data: any) => {
  if (Array.isArray(data)) return data;
  return data?.items ?? data?.Items ?? data?.data ?? data?.Data ?? [];
};
const unwrapTotal = (data: any) => data?.total ?? data?.Total ?? data?.totalCount ?? data?.TotalCount ?? unwrapList(data).length;

const loadData = async () => {
  const params = {
    pageNumber: pagination.pageNumber,
    pageSize: pagination.pageSize,
    filterOn: searchForm.filterQuery ? searchForm.filterOn : undefined,
    filterQuery: searchForm.filterQuery || undefined,
    status: searchForm.status || undefined,
    country: searchForm.country || undefined,
    industry: searchForm.industry || undefined
  };
  const res = await getSalesLeadList(params);
  const data = unwrapData(res);
  tableData.value = unwrapList(data);
  pagination.total = unwrapTotal(data);
};

const loadOptions = async () => {
  try {
    const res = await getSalesLeadOptions();
    const data = unwrapData(res) || {};
    options.statuses = data.statuses || data.Statuses || statusOptions;
    options.countries = data.countries || data.Countries || [];
    options.industries = data.industries || data.Industries || [];
  } catch (error) {
    options.statuses = statusOptions;
    options.countries = [];
    options.industries = [];
  }
};

const loadTemplates = async () => {
  const res = await getSalesLeadEmailTemplates();
  const data = unwrapData(res);
  templates.value = unwrapList(data).filter((item: any) => item.isActive !== false);
};

const handleSearch = () => {
  pagination.pageNumber = 1;
  loadData();
};

const resetSearch = () => {
  searchForm.filterQuery = "";
  searchForm.status = "";
  searchForm.country = "";
  searchForm.industry = "";
  pagination.pageNumber = 1;
  loadData();
};

const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  pagination.pageNumber = 1;
  loadData();
};

const handleCurrentChange = (val: number) => {
  pagination.pageNumber = val;
  loadData();
};

const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows;
};

const resetLeadForm = () => {
  leadForm.id = undefined;
  leadForm.companyName = "";
  leadForm.contactName = "";
  leadForm.email = "";
  leadForm.phone = "";
  leadForm.website = "";
  leadForm.country = "";
  leadForm.industry = "";
  leadForm.source = "";
  leadForm.status = "New";
  leadForm.score = 50;
  leadForm.notes = "";
  leadFormRef.value?.clearValidate();
};

const openLeadDialog = async (row?: any) => {
  resetLeadForm();
  isEditLead.value = !!row?.id;
  if (row?.id) {
    const res = await getSalesLeadById(row.id);
    const d = unwrapData(res) || row;
    leadForm.id = d.id;
    leadForm.companyName = d.companyName || "";
    leadForm.contactName = d.contactName || "";
    leadForm.email = d.email || "";
    leadForm.phone = d.phone || "";
    leadForm.website = d.website || "";
    leadForm.country = d.country || "";
    leadForm.industry = d.industry || "";
    leadForm.source = d.source || "";
    leadForm.status = d.status || "New";
    leadForm.score = d.score ?? 50;
    leadForm.notes = d.notes || "";
  }
  leadDialogVisible.value = true;
};

const buildLeadPayload = () => ({
  companyName: leadForm.companyName,
  contactName: leadForm.contactName,
  email: leadForm.email,
  phone: leadForm.phone || null,
  website: leadForm.website || null,
  country: leadForm.country || null,
  industry: leadForm.industry || null,
  source: leadForm.source || null,
  status: leadForm.status || "New",
  score: leadForm.score,
  notes: leadForm.notes || null
});

const handleLeadSubmit = async () => {
  if (!leadFormRef.value) return;
  await leadFormRef.value.validate(async valid => {
    if (!valid) return;
    submitLoading.value = true;
    try {
      if (isEditLead.value && leadForm.id) {
        await updateSalesLead(leadForm.id, buildLeadPayload());
        ElMessage.success("Lead updated");
      } else {
        await addSalesLead(buildLeadPayload());
        ElMessage.success("Lead added");
      }
      leadDialogVisible.value = false;
      await Promise.all([loadData(), loadOptions()]);
    } finally {
      submitLoading.value = false;
    }
  });
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`Delete lead "${row.companyName}"?`, "Tip", {
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    type: "warning"
  });
  await deleteSalesLead(row.id);
  ElMessage.success("Lead deleted");
  loadData();
};

const openEmailDialog = async (row?: any) => {
  emailTargets.value = row?.id ? [row] : selectedRows.value;
  emailPreview.subject = "";
  emailPreview.htmlBody = "";
  selectedTemplateId.value = templates.value[0]?.id;
  if (!templates.value.length) await loadTemplates();
  selectedTemplateId.value ||= templates.value[0]?.id;
  emailDialogVisible.value = true;
};

const handlePreview = async () => {
  if (!canPreview.value || !selectedTemplateId.value) return;
  const lead = emailTargets.value[0];
  const template = templates.value.find(item => item.id === selectedTemplateId.value);
  if (!template) return;
  emailPreview.subject = renderTemplate(template.subject || "", lead);
  emailPreview.htmlBody = renderTemplate(template.htmlBody || template.textBody || "", lead);
};

const handleSendEmail = async () => {
  if (!canSend.value || !selectedTemplateId.value) return;
  sendLoading.value = true;
  try {
    const res = await sendSalesLeadEmail(
      emailTargets.value.map(item => item.id),
      selectedTemplateId.value
    );
    const data = unwrapData(res) || {};
    const sent = data.sent ?? data.Sent ?? 0;
    const failed = data.failed ?? data.Failed ?? 0;
    const skipped = data.skipped ?? data.Skipped ?? 0;
    ElMessage.success(`Sent: ${sent}, Failed: ${failed}, Skipped: ${skipped}`);
    emailDialogVisible.value = false;
    loadData();
  } finally {
    sendLoading.value = false;
  }
};

const resetTemplateForm = () => {
  templateForm.id = undefined;
  templateForm.name = "";
  templateForm.subject = "";
  templateForm.htmlBody = "";
  templateForm.textBody = "";
  templateForm.isActive = true;
  templateFormRef.value?.clearValidate();
};

const openTemplateDialog = async () => {
  await loadTemplates();
  resetTemplateForm();
  templateDialogVisible.value = true;
};

const editTemplate = (row: any) => {
  templateForm.id = row.id;
  templateForm.name = row.name || "";
  templateForm.subject = row.subject || "";
  templateForm.htmlBody = row.htmlBody || "";
  templateForm.textBody = row.textBody || "";
  templateForm.isActive = row.isActive !== false;
};

const handleTemplateSubmit = async () => {
  if (!templateFormRef.value) return;
  await templateFormRef.value.validate(async valid => {
    if (!valid) return;
    templateLoading.value = true;
    try {
      const payload = {
        name: templateForm.name,
        subject: templateForm.subject,
        htmlBody: templateForm.htmlBody,
        textBody: templateForm.textBody || null,
        isActive: templateForm.isActive
      };
      if (templateForm.id) {
        await updateSalesLeadEmailTemplate(templateForm.id, payload);
        ElMessage.success("Template updated");
      } else {
        await addSalesLeadEmailTemplate(payload);
        ElMessage.success("Template added");
      }
      await loadTemplates();
      resetTemplateForm();
    } finally {
      templateLoading.value = false;
    }
  });
};

const handleDeleteTemplate = async (row: any) => {
  await ElMessageBox.confirm(`Delete template "${row.name}"?`, "Tip", {
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    type: "warning"
  });
  await deleteSalesLeadEmailTemplate(row.id);
  ElMessage.success("Template deleted");
  await loadTemplates();
};

const statusTagType = (status: string) => {
  const value = (status || "").toLowerCase();
  if (value === "won" || value === "qualified") return "success";
  if (value === "lost") return "info";
  if (value === "proposal") return "warning";
  if (value === "contacted") return "primary";
  return undefined;
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const renderTemplate = (content: string, lead: any) => {
  const values: Record<string, string> = {
    companyName: lead.companyName || "",
    contactName: lead.contactName || "",
    email: lead.email || "",
    phone: lead.phone || "",
    website: lead.website || "",
    country: lead.country || "",
    industry: lead.industry || "",
    source: lead.source || "",
    status: lead.status || ""
  };
  return content.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => values[key] ?? "");
};

onMounted(async () => {
  await Promise.all([loadOptions(), loadTemplates()]);
  await loadData();
});
</script>

<style scoped lang="scss">
.sales-leads-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .table-search {
    display: flex;
    padding: 18px;
    margin-bottom: 16px;
    background: #ffffff;
    .el-form {
      display: flex;
      flex-wrap: wrap;
      gap: 0 8px;
      .el-input,
      .el-select {
        width: 210px;
      }
    }
    .search-buttons {
      display: flex;
      flex: 1;
      gap: 12px;
      justify-content: space-between;
      > div {
        display: flex;
        gap: 12px;
      }
    }
  }
  .el-table {
    flex: 1;
    width: 100%;
    :deep(.el-table__header th) {
      height: 45px;
      font-size: 15px;
      font-weight: bold;
      color: var(--el-text-color-primary);
      background: var(--el-fill-color-light);
    }
    :deep(.el-table__row) {
      height: 45px;
      font-size: 14px;
    }
  }
  .pagination-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0 0;
  }
  .bulk-actions {
    min-width: 180px;
  }
  .recipient-tag {
    margin: 0 8px 8px 0;
  }
  .email-actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 14px;
  }
  .email-preview {
    max-height: 360px;
    overflow: auto;
    border: 1px solid var(--el-border-color);
  }
  .preview-subject {
    padding: 10px 12px;
    font-weight: 600;
    background: var(--el-fill-color-light);
    border-bottom: 1px solid var(--el-border-color);
  }
  .preview-body {
    padding: 14px;
    background: #ffffff;
  }
  .template-layout {
    display: grid;
    grid-template-columns: minmax(360px, 1fr) 360px;
    gap: 18px;
  }
  .template-form {
    min-width: 0;
  }
  .template-hint {
    padding-left: 90px;
    font-size: 12px;
    line-height: 20px;
    color: var(--el-text-color-secondary);
  }
}
</style>
