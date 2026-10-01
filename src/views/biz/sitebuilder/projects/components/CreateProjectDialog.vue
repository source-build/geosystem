<template>
  <el-dialog v-model="dialogVisible" title="创建 AI 建站项目" width="620px" destroy-on-close append-to-body @closed="resetForm">
    <div v-if="selectedTemplate" class="template-summary" :style="{ '--template-color': selectedTemplate.color }">
      <span class="summary-mark">{{ selectedTemplate.name.slice(0, 1) }}</span>
      <div><strong>已从「{{ selectedTemplate.name }}」创建</strong><p>{{ selectedTemplate.style }} · {{ siteTypeLabel }}</p></div>
    </div>
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <h3>站点信息</h3>
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="form.name" maxlength="100" show-word-limit placeholder="例如：云启科技企业官网" @input="handleNameInput" />
      </el-form-item>
      <el-form-item label="站点标识" prop="slug">
        <el-input v-model="form.slug" maxlength="100" placeholder="仅小写字母、数字和短横线，例如 yunqi-tech" />
        <div class="form-help">同一租户内唯一，用于后续网站地址标识。</div>
      </el-form-item>
      <el-form-item label="站点类型">
        <el-radio-group v-model="form.site_type">
          <el-radio-button value="company">企业官网</el-radio-button>
          <el-radio-button value="product">产品落地页</el-radio-button>
          <el-radio-button value="solution">解决方案</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <h3>内容来源</h3>
      <el-form-item label="企业知识库" prop="knowledge_base_id">
        <el-select v-model="form.knowledge_base_id" class="w-full" filterable :loading="knowledgeBaseLoading" placeholder="请选择用于生成站点内容的企业知识库">
          <el-option v-for="item in knowledgeBaseOptions" :key="item.id" :label="item.label" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-alert title="创建后可编辑受控模块和主题；提交构建只会创建排队任务，产物由构建服务返回。" type="info" :closable="false" show-icon />
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="submitForm">创建并编辑</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import { computed, reactive, ref, watch } from "vue";
import { useDemoGate } from "@/composables/useDemoGate";
import { demoKnowledgeBases } from "@/views/biz/sitebuilder/fixtures";
import { getSiteTemplate } from "@/views/biz/sitebuilder/siteTemplates";
import type { SiteType } from "@/views/biz/sitebuilder/types";

interface ProjectForm {
  name: string;
  slug: string;
  template_code?: string;
  site_type: SiteType;
  knowledge_base_id?: number;
}

const props = defineProps<{ modelValue: boolean; templateCode?: string }>();
const emit = defineEmits<{ (event: "update:modelValue", value: boolean): void; (event: "created", projectId: number): void }>();
const { requireFullEdition } = useDemoGate("sitebuilder");

const dialogVisible = computed({ get: () => props.modelValue, set: (value) => emit("update:modelValue", value) });
const selectedTemplate = computed(() => getSiteTemplate(form.template_code || ""));
const siteTypeLabel = computed(() => ({ company: "企业官网", product: "产品落地页", solution: "解决方案" }[form.site_type] || "AI 建站"));
const formRef = ref<FormInstance>();
const knowledgeBaseLoading = ref(false);
const submitLoading = ref(false);
const knowledgeBaseOptions = ref(structuredClone(demoKnowledgeBases));
const formInit: ProjectForm = { name: "", slug: "", site_type: "company", knowledge_base_id: undefined };
const form = reactive<ProjectForm>({ ...formInit });
const rules = reactive<FormRules>({
  name: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
  slug: [{ required: true, message: "请输入站点标识", trigger: "blur" }, { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "仅支持小写字母、数字和短横线", trigger: "blur" }],
  knowledge_base_id: [{ required: true, message: "请选择企业知识库", trigger: "change" }],
});

watch(dialogVisible, (visible) => {
  if (!visible) return;
  form.template_code = props.templateCode;
  if (form.template_code) handleTemplateChange(form.template_code);
}, { immediate: true });

const handleNameInput = () => {
  if (form.slug) return;
  form.slug = form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
};

const handleTemplateChange = (code: string) => {
  const template = getSiteTemplate(code);
  if (template) form.site_type = template.siteType;
};

/** 创建会写入正式数据，体验版在任何写操作前统一拦截。 */
const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  await requireFullEdition("创建站点", "create");
};

function resetForm() {
  Object.assign(form, formInit);
  formRef.value?.clearValidate();
}
</script>

<style lang="scss" scoped>
.template-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  background: var(--el-fill-color-lighter);

  .summary-mark {
    display: inline-flex;
    width: 34px;
    height: 34px;
    align-items: center;
    justify-content: center;
    border-radius: 9px;
    background: var(--template-color, var(--el-color-primary));
    color: #fff;
    font-weight: 700;
  }

  div {
    strong { color: var(--el-text-color-primary); font-size: 14px; }
    p { margin: 3px 0 0; color: var(--el-text-color-secondary); font-size: 12px; }
  }
}

h3 { margin: 20px 0 12px; color: var(--el-text-color-primary); font-size: 14px; }
.form-help { margin-top: 6px; color: var(--el-text-color-secondary); font-size: 12px; line-height: 1.5; }
</style>
