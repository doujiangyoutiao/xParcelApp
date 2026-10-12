<template>
  <div class="table-box quotes-page">
    <div class="table-search">
      <el-form :model="searchForm" inline>
        <el-form-item label="Keyword">
          <el-input v-model="searchForm.keyword" placeholder="Quote no, title, customer" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="Customer">
          <el-select v-model="searchForm.customerId" placeholder="All" clearable filterable>
            <el-option v-for="item in customers" :key="item.id" :label="customerLabel(item)" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="searchForm.status" placeholder="All" clearable>
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="search-buttons">
        <div>
          <el-button type="primary" @click="handleSearch">Search</el-button>
          <el-button @click="resetSearch">Reset</el-button>
        </div>
        <el-button type="primary" :icon="Plus" @click="openQuoteDialog()">New Quote</el-button>
      </div>
    </div>

    <el-table :data="tableData" border stripe height="calc(100vh - 280px)">
      <el-table-column prop="status" label="Status" width="105">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">{{ row.status || "Draft" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="quoteNo" label="Quote No" width="140" show-overflow-tooltip />
      <el-table-column prop="title" label="Title" min-width="180" show-overflow-tooltip />
      <el-table-column prop="customerName" label="Customer" min-width="170" show-overflow-tooltip>
        <template #default="{ row }">{{ row.customerName || "Public quote" }}</template>
      </el-table-column>
      <el-table-column prop="currency" label="Currency" width="95" />
      <el-table-column prop="validTo" label="Valid To" width="130">
        <template #default="{ row }">{{ formatDate(row.validTo) }}</template>
      </el-table-column>
      <el-table-column prop="contactEmail" label="Email" min-width="180" show-overflow-tooltip />
      <el-table-column label="Link" width="95" align="center">
        <template #default="{ row }">
          <el-button type="primary" link :icon="Link" @click="copyPublicLink(row)" />
        </template>
      </el-table-column>
      <el-table-column label="Operation" align="center" fixed="right" width="190">
        <template #default="{ row }">
          <el-button type="primary" link :icon="View" @click="openPreview(row)" />
          <el-button type="primary" link :icon="Message" @click="openEmailDialog(row)" />
          <el-button type="primary" link :icon="EditPen" @click="openQuoteDialog(row)" />
          <el-button type="danger" link :icon="Delete" @click="handleDelete(row)" />
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <span></span>
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
      v-model="quoteDialogVisible"
      :title="isEdit ? 'Edit Quote' : 'New Quote'"
      width="1080px"
      destroy-on-close
      align-center
    >
      <el-form ref="quoteFormRef" :model="quoteForm" :rules="quoteRules" label-width="105px">
        <el-row :gutter="18">
          <el-col :span="8">
            <el-form-item label="Title" prop="title">
              <el-input v-model="quoteForm.title" maxlength="200" placeholder="e.g. UK parcel delivery quote" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Customer">
              <el-select
                v-model="quoteForm.customerId"
                placeholder="Public quote or select customer"
                clearable
                filterable
                @change="syncCustomerEmail"
              >
                <el-option v-for="item in customers" :key="item.id" :label="customerLabel(item)" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Company">
              <el-select v-model="quoteForm.companyId" placeholder="Select company" clearable filterable>
                <el-option v-for="item in companies" :key="item.id" :label="companyLabel(item)" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="18">
          <el-col :span="6">
            <el-form-item label="Currency" prop="currency">
              <el-select v-model="quoteForm.currency">
                <el-option label="USD" value="USD" />
                <el-option label="GBP" value="GBP" />
                <el-option label="EUR" value="EUR" />
                <el-option label="CNY" value="CNY" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Status">
              <el-select v-model="quoteForm.status">
                <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Valid From">
              <el-date-picker v-model="quoteForm.validFrom" type="date" value-format="YYYY-MM-DD" placeholder="Start date" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Valid To">
              <el-date-picker v-model="quoteForm.validTo" type="date" value-format="YYYY-MM-DD" placeholder="End date" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="18">
          <el-col :span="12">
            <el-form-item label="Contact Email">
              <el-input v-model="quoteForm.contactEmail" maxlength="200" placeholder="Customer email" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Public Link">
              <el-switch v-model="quoteForm.isPublic" active-text="Enabled" inactive-text="Private" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Remark">
          <el-input v-model="quoteForm.remark" type="textarea" :rows="2" maxlength="1000" show-word-limit />
        </el-form-item>

        <div class="line-toolbar">
          <strong>Quote Lines</strong>
          <el-button type="primary" :icon="Plus" @click="addLine">Add Line</el-button>
        </div>
        <el-table :data="quoteForm.lines" border class="quote-line-table">
          <el-table-column label="Service" min-width="140">
            <template #default="{ row }"><el-input v-model="row.serviceCode" placeholder="Service" /></template>
          </el-table-column>
          <el-table-column label="Origin" width="100">
            <template #default="{ row }"><el-input v-model="row.originCountry" maxlength="2" placeholder="CN" /></template>
          </el-table-column>
          <el-table-column label="Dest" width="100">
            <template #default="{ row }"><el-input v-model="row.destinationCountry" maxlength="2" placeholder="GB" /></template>
          </el-table-column>
          <el-table-column label="Weight From" width="130">
            <template #default="{ row }">
              <el-input-number v-model="row.weightFrom" :min="0" :precision="3" controls-position="right" />
            </template>
          </el-table-column>
          <el-table-column label="Weight To" width="130">
            <template #default="{ row }">
              <el-input-number v-model="row.weightTo" :min="0" :precision="3" controls-position="right" />
            </template>
          </el-table-column>
          <el-table-column label="Price" width="130">
            <template #default="{ row }">
              <el-input-number v-model="row.price" :min="0" :precision="2" controls-position="right" />
            </template>
          </el-table-column>
          <el-table-column label="Fuel" width="120">
            <template #default="{ row }">
              <el-input-number v-model="row.fuelSurcharge" :min="0" :precision="2" controls-position="right" />
            </template>
          </el-table-column>
          <el-table-column label="Remote" width="120">
            <template #default="{ row }">
              <el-input-number v-model="row.remoteFee" :min="0" :precision="2" controls-position="right" />
            </template>
          </el-table-column>
          <el-table-column label="" width="55" align="center">
            <template #default="{ $index }">
              <el-button type="danger" link :icon="Delete" @click="removeLine($index)" />
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <el-button @click="quoteDialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">Save</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="previewVisible" title="Quote Preview" width="900px" destroy-on-close align-center>
      <div v-if="previewQuote" class="quote-preview">
        <div class="preview-head">
          <div>
            <p>{{ previewQuote.quoteNo }}</p>
            <h2>{{ previewQuote.title }}</h2>
            <span>{{ previewQuote.customerName || "Public quote" }}</span>
          </div>
          <img v-if="previewQuote.publicUrl" class="qr-code" :src="qrCodeUrl(previewQuote.publicUrl)" alt="Quote QR code" />
        </div>
        <div class="preview-summary">
          <span>Currency: {{ previewQuote.currency }}</span>
          <span>Valid to: {{ formatDate(previewQuote.validTo) }}</span>
          <span>Status: {{ previewQuote.status }}</span>
        </div>
        <el-table :data="previewQuote.lines || []" border>
          <el-table-column prop="serviceCode" label="Service" min-width="150" />
          <el-table-column label="Route" min-width="120">
            <template #default="{ row }">{{
              [row.originCountry, row.destinationCountry].filter(Boolean).join(" -> ") || "-"
            }}</template>
          </el-table-column>
          <el-table-column label="Weight" width="130">
            <template #default="{ row }">{{ formatWeight(row) }}</template>
          </el-table-column>
          <el-table-column prop="price" label="Price" width="110" />
          <el-table-column prop="fuelSurcharge" label="Fuel" width="100" />
          <el-table-column prop="remoteFee" label="Remote" width="100" />
        </el-table>
        <p v-if="previewQuote.remark" class="preview-remark">{{ previewQuote.remark }}</p>
      </div>
    </el-dialog>

    <el-dialog v-model="emailDialogVisible" title="Send Quote Email" width="620px" destroy-on-close align-center>
      <el-form :model="emailForm" label-width="90px">
        <el-form-item label="To">
          <el-input v-model="emailForm.toEmail" placeholder="customer@example.com" />
        </el-form-item>
        <el-form-item label="Subject">
          <el-input v-model="emailForm.subject" placeholder="Your XParcel quote" />
        </el-form-item>
        <el-form-item label="Message">
          <el-input v-model="emailForm.message" type="textarea" :rows="4" placeholder="Optional message" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="emailDialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="emailLoading" @click="handleSendEmail">Send</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="Quotes">
import { onMounted, reactive, ref } from "vue";
import { Delete, EditPen, Link, Message, Plus, View } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";
import { getCustomerList } from "@/api/modules/customer";
import { getCompanyList } from "@/api/modules/company";
import { addQuote, deleteQuote, getQuoteById, getQuoteList, sendQuoteEmail, updateQuote } from "@/api/modules/quote";

const statusOptions = ["Draft", "Sent", "Accepted", "Expired", "Cancelled"];

const searchForm = reactive({
  keyword: "",
  customerId: undefined as number | undefined,
  status: ""
});

const pagination = reactive({
  pageNumber: 1,
  pageSize: 10,
  total: 0
});

const customers = ref<any[]>([]);
const companies = ref<any[]>([]);
const tableData = ref<any[]>([]);
const quoteDialogVisible = ref(false);
const previewVisible = ref(false);
const emailDialogVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const emailLoading = ref(false);
const quoteFormRef = ref<FormInstance>();
const previewQuote = ref<any>(null);
const selectedQuote = ref<any>(null);

const quoteForm = reactive({
  id: undefined as number | undefined,
  companyId: undefined as number | undefined,
  customerId: undefined as number | undefined,
  title: "",
  currency: "USD",
  validFrom: "",
  validTo: "",
  isPublic: true,
  status: "Draft",
  remark: "",
  contactEmail: "",
  lines: [] as any[]
});

const emailForm = reactive({
  toEmail: "",
  subject: "",
  message: ""
});

const quoteRules: FormRules = {
  title: [{ required: true, message: "Please enter quote title", trigger: "blur" }],
  currency: [{ required: true, message: "Please select currency", trigger: "change" }]
};

const unwrapData = (res: any) => res?.Data ?? res?.data ?? res;
const unwrapList = (data: any) => {
  if (Array.isArray(data)) return data;
  return data?.items ?? data?.Items ?? data?.data ?? data?.Data ?? [];
};
const unwrapTotal = (data: any) => data?.total ?? data?.Total ?? data?.totalCount ?? data?.TotalCount ?? unwrapList(data).length;

const customerLabel = (item: any) =>
  item.customerName ||
  item.CustomerName ||
  item.name ||
  item.Name ||
  item.customerCode ||
  item.CustomerCode ||
  `Customer #${item.id}`;

const customerEmail = (item: any) => item.email || item.Email || item.contactEmail || item.ContactEmail || "";
const companyLabel = (item: any) => item.companyName || item.CompanyName || item.name || item.Name || `Company #${item.id}`;

const formatDate = (value: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const formatWeight = (row: any) => {
  const from = row.weightFrom ?? row.WeightFrom;
  const to = row.weightTo ?? row.WeightTo;
  if (from == null && to == null) return "-";
  return `${from ?? 0}-${to ?? ""} kg`;
};

const qrCodeUrl = (url: string) => `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`;

const statusTagType = (status: string) => {
  if (status === "Accepted") return "success";
  if (status === "Sent") return "warning";
  if (status === "Expired" || status === "Cancelled") return "info";
  return undefined;
};

const loadCustomers = async () => {
  const res = await getCustomerList({ pageNumber: 1, pageSize: 500 });
  const data = unwrapData(res);
  customers.value = unwrapList(data);
};

const loadCompanies = async () => {
  const res = await getCompanyList();
  const data = unwrapData(res);
  companies.value = unwrapList(data);
  if (!quoteForm.companyId && companies.value.length === 1) {
    quoteForm.companyId = companies.value[0].id;
  }
};

const loadData = async () => {
  const res: any = await getQuoteList({
    pageNumber: pagination.pageNumber,
    pageSize: pagination.pageSize,
    keyword: searchForm.keyword || undefined,
    customerId: searchForm.customerId,
    status: searchForm.status || undefined
  });
  const data = unwrapData(res);
  tableData.value = unwrapList(data);
  pagination.total = res?.Total ?? res?.total ?? unwrapTotal(data);
};

const handleSearch = () => {
  pagination.pageNumber = 1;
  loadData();
};

const resetSearch = () => {
  searchForm.keyword = "";
  searchForm.customerId = undefined;
  searchForm.status = "";
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

const emptyLine = () => ({
  serviceCode: "",
  originCountry: "",
  destinationCountry: "",
  weightFrom: 0,
  weightTo: 1,
  price: 0,
  fuelSurcharge: 0,
  remoteFee: 0,
  remark: ""
});

const resetQuoteForm = () => {
  quoteForm.id = undefined;
  quoteForm.companyId = companies.value.length === 1 ? companies.value[0].id : undefined;
  quoteForm.customerId = undefined;
  quoteForm.title = "";
  quoteForm.currency = "USD";
  quoteForm.validFrom = "";
  quoteForm.validTo = "";
  quoteForm.isPublic = true;
  quoteForm.status = "Draft";
  quoteForm.remark = "";
  quoteForm.contactEmail = "";
  quoteForm.lines = [emptyLine()];
  quoteFormRef.value?.clearValidate();
};

const normalizeQuote = (data: any) => ({
  ...data,
  id: data.id ?? data.Id,
  companyId: data.companyId ?? data.CompanyId,
  customerId: data.customerId ?? data.CustomerId,
  title: data.title ?? data.Title ?? "",
  currency: data.currency ?? data.Currency ?? "USD",
  validFrom: (data.validFrom ?? data.ValidFrom ?? "").slice(0, 10),
  validTo: (data.validTo ?? data.ValidTo ?? "").slice(0, 10),
  isPublic: data.isPublic ?? data.IsPublic ?? true,
  status: data.status ?? data.Status ?? "Draft",
  remark: data.remark ?? data.Remark ?? "",
  contactEmail: data.contactEmail ?? data.ContactEmail ?? "",
  publicUrl: data.publicUrl ?? data.PublicUrl ?? "",
  lines: (data.lines ?? data.Lines ?? []).map((line: any) => ({
    serviceCode: line.serviceCode ?? line.ServiceCode ?? "",
    originCountry: line.originCountry ?? line.OriginCountry ?? "",
    destinationCountry: line.destinationCountry ?? line.DestinationCountry ?? "",
    weightFrom: line.weightFrom ?? line.WeightFrom ?? 0,
    weightTo: line.weightTo ?? line.WeightTo ?? 0,
    price: line.price ?? line.Price ?? 0,
    fuelSurcharge: line.fuelSurcharge ?? line.FuelSurcharge ?? 0,
    remoteFee: line.remoteFee ?? line.RemoteFee ?? 0,
    remark: line.remark ?? line.Remark ?? ""
  }))
});

const openQuoteDialog = async (row?: any) => {
  resetQuoteForm();
  isEdit.value = !!row?.id;
  if (row?.id) {
    const res = await getQuoteById(row.id);
    const data = normalizeQuote(unwrapData(res) || row);
    Object.assign(quoteForm, data);
    if (!quoteForm.lines.length) quoteForm.lines = [emptyLine()];
  }
  quoteDialogVisible.value = true;
};

const addLine = () => {
  quoteForm.lines.push(emptyLine());
};

const removeLine = (index: number) => {
  if (quoteForm.lines.length === 1) {
    ElMessage.warning("At least one quote line is required");
    return;
  }
  quoteForm.lines.splice(index, 1);
};

const syncCustomerEmail = () => {
  const selected = customers.value.find(item => item.id === quoteForm.customerId);
  if (!selected) return;
  quoteForm.companyId = selected.companyId ?? selected.CompanyId ?? quoteForm.companyId;
  if (!quoteForm.contactEmail) quoteForm.contactEmail = customerEmail(selected);
};

const buildPayload = () => ({
  companyId: quoteForm.companyId || null,
  customerId: quoteForm.customerId || null,
  title: quoteForm.title,
  currency: quoteForm.currency,
  validFrom: quoteForm.validFrom || null,
  validTo: quoteForm.validTo || null,
  isPublic: quoteForm.isPublic,
  status: quoteForm.status,
  remark: quoteForm.remark || null,
  contactEmail: quoteForm.contactEmail || null,
  lines: quoteForm.lines.map(line => ({
    serviceCode: line.serviceCode || null,
    originCountry: line.originCountry || null,
    destinationCountry: line.destinationCountry || null,
    weightFrom: line.weightFrom ?? null,
    weightTo: line.weightTo ?? null,
    price: line.price || 0,
    fuelSurcharge: line.fuelSurcharge ?? null,
    remoteFee: line.remoteFee ?? null,
    remark: line.remark || null
  }))
});

const handleSubmit = async () => {
  if (!quoteFormRef.value) return;
  await quoteFormRef.value.validate(async valid => {
    if (!valid) return;
    if (!quoteForm.lines.length) {
      ElMessage.warning("Please add at least one quote line");
      return;
    }
    if (!quoteForm.customerId && !quoteForm.companyId) {
      ElMessage.warning("Please select a company or customer");
      return;
    }
    submitLoading.value = true;
    try {
      if (isEdit.value && quoteForm.id) {
        await updateQuote(quoteForm.id, buildPayload());
        ElMessage.success("Quote updated");
      } else {
        await addQuote(buildPayload());
        ElMessage.success("Quote created");
      }
      quoteDialogVisible.value = false;
      await loadData();
    } catch (error: any) {
      ElMessage.error(error?.Data?.Message || error?.Data || error?.Message || error?.message || "Quote save failed");
    } finally {
      submitLoading.value = false;
    }
  });
};

const openPreview = async (row: any) => {
  const res = await getQuoteById(row.id);
  previewQuote.value = normalizeQuote(unwrapData(res) || row);
  previewVisible.value = true;
};

const copyPublicLink = async (row: any) => {
  const url = row.publicUrl || row.PublicUrl;
  if (!url) {
    ElMessage.warning("No public link");
    return;
  }
  await navigator.clipboard.writeText(url);
  ElMessage.success("Link copied");
};

const openEmailDialog = (row: any) => {
  selectedQuote.value = row;
  emailForm.toEmail = row.contactEmail || row.ContactEmail || "";
  emailForm.subject = `Your XParcel quote ${row.quoteNo || row.QuoteNo || ""}`.trim();
  emailForm.message = "Please review the quote using the link below. We are happy to adjust it based on your shipping volume.";
  emailDialogVisible.value = true;
};

const handleSendEmail = async () => {
  if (!selectedQuote.value?.id) return;
  if (!emailForm.toEmail) {
    ElMessage.warning("Please enter recipient email");
    return;
  }
  emailLoading.value = true;
  try {
    const res = await sendQuoteEmail(selectedQuote.value.id, {
      toEmail: emailForm.toEmail,
      subject: emailForm.subject || null,
      message: emailForm.message || null
    });
    const data: any = unwrapData(res);
    if (data?.success === false || data?.Success === false) {
      ElMessage.error(data.message || data.Message || "Quote email failed");
      return;
    }
    ElMessage.success("Quote email sent");
    emailDialogVisible.value = false;
    await loadData();
  } finally {
    emailLoading.value = false;
  }
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`Delete quote "${row.quoteNo || row.title}"?`, "Tip", {
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    type: "warning"
  });
  await deleteQuote(row.id);
  ElMessage.success("Quote deleted");
  loadData();
};

onMounted(async () => {
  await Promise.all([loadCompanies(), loadCustomers(), loadData()]);
});
</script>

<style scoped lang="scss">
.quotes-page {
  .table-search {
    display: flex;
    gap: 16px;
    justify-content: space-between;
    padding: 18px 20px;
    margin-bottom: 12px;
    background: #ffffff;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    .el-form {
      flex: 1;
    }
  }
  .search-buttons,
  .pagination-wrapper,
  .line-toolbar,
  .preview-head,
  .preview-summary {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }
  .pagination-wrapper {
    padding-top: 14px;
  }
  .line-toolbar {
    margin: 6px 0 12px;
  }
  .quote-line-table {
    :deep(.el-input-number) {
      width: 100%;
    }
  }
  .quote-preview {
    padding: 4px 2px;
  }
  .preview-head {
    align-items: flex-start;
    padding-bottom: 18px;
    border-bottom: 1px solid #ebeef5;
    p {
      margin: 0 0 6px;
      font-size: 13px;
      color: #697586;
    }
    h2 {
      margin: 0 0 8px;
      font-size: 24px;
      font-weight: 650;
      color: #1f2937;
    }
    span {
      color: #475467;
    }
  }
  .qr-code {
    width: 126px;
    height: 126px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
  }
  .preview-summary {
    justify-content: flex-start;
    margin: 16px 0;
    color: #475467;
  }
  .preview-remark {
    margin: 16px 0 0;
    line-height: 1.7;
    color: #475467;
  }
}
</style>
