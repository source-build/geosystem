<template>
  <div class="vertical-layout page-table-layout">
    <div class="inline-form mb-10" style="padding-bottom: 0">
      <el-form class="head-filter-container" :inline="true">
        <el-form-item label="标签名称">
          <el-input
            placeholder="请输入标签名称"
            v-model="queryParams.label"
            :clearable="true"
            style="width: 180px"
            @clear="queryListData"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="queryListData"
            >搜索</el-button
          >
          <el-button icon="Refresh" @click="restart">重置</el-button>
          <el-button type="success" @click="openNewDialog">新增标签</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="main">
      <div class="content">
        <el-table v-loading="loading" :data="dataList" class="mt-10">
          <el-table-column show-overflow-tooltip width="200" label="创建时间">
            <template #default="scope">
              <span>{{ formatDateYMDhms(scope.row.created_at) }}</span>
            </template>
          </el-table-column>
          <el-table-column width="120" label="标签颜色" align="center">
            <template #default="{ row }">
              <div class="flex justify-center">
                <div
                  class="w-20 h-20"
                  :style="{ 'background-color': row.color }"
                ></div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            width="120"
            label="标签值"
            prop="value"
          />
          <el-table-column
            show-overflow-tooltip
            min-width="140"
            label="标签名称"
            prop="label"
          />

          <el-table-column
            show-overflow-tooltip
            label="标签描述"
            prop="desc"
            min-width="140"
          />
          <el-table-column
            label="操作"
            align="center"
            width="150"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button link type="primary" @click="openEditDialog(row)"
                >编辑
              </el-button>
              <el-button link type="danger" @click="handlerDelete(row.id)"
                >删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="footer-pagination-container">
          <el-pagination
            v-model:current-page="queryParams.page"
            v-model:page-size="queryParams.page_size"
            :page-sizes="[5, 10, 25, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="dataListTotal"
            @size-change="queryListData"
            @current-change="queryListData"
          />
        </div>
      </div>
    </div>

    <el-dialog
      v-model="dialogShow"
      title="标签"
      destroy-on-close
      append-to-body
      width="450px"
    >
      <el-form
        ref="ruleFormRef"
        :model="data.form"
        :rules="data.rules"
        label-width="auto"
      >
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="标签名称" prop="label">
              <el-input
                v-model="data.form.label"
                placeholder="请输入标签名称"
                maxlength="16"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="标签值" prop="value">
              <el-input
                v-model="data.form.value"
                placeholder="任意值(可用于区分标签)"
                maxlength="16"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="标签颜色" prop="color">
              <el-color-picker v-model="data.form.color" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="标签描述" prop="desc">
              <el-input
                v-model="data.form.desc"
                placeholder="请输入标签名称"
                maxlength="128"
                type="textarea"
                resize="none"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogShow = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { formatDateYMDhms } from "@/utils/timeUtil";
import { queryDict } from "@/utils/dict";
import { ElMessageBox, FormInstance } from "element-plus";
import { addTags, delTags, editTags, queryTags } from "@/api/userManage/tags";

const router = useRouter();
const dataListTotal: Ref<number> = ref(0);
const dataList: Ref<Array<any>> = ref([]);
const loading: Ref<boolean> = ref(false);
const queryParams: Ref = ref({
  page: 1,
  page_size: 10,
});
const dialogShow: Ref<boolean> = ref(false);
const ruleFormRef: Ref = ref<FormInstance>();
const initFormData = {};
const data = reactive({
  form: <any>{ ...initFormData },
  itemId: 0,
  rules: {
    label: [{ required: true, message: "请填写标签名称", trigger: "blur" }],
    color: [{ required: true, message: "请选择标签颜色", trigger: "blur" }],
  },
});
/** 字典列表 */
const dicts = reactive({
  careBuddyType: <Array<any>>[],
});

const restart = () => {
  dataListTotal.value = 0;
  dataList.value = [];
  queryParams.value = {
    page: 1,
    page_size: 10,
  };
  queryListData();
};

/** 打开 */
const openNewDialog = async () => {
  data.form = { ...initFormData };
  data.itemId = 0;
  dialogShow.value = true;
};
/** 编辑 */
const openEditDialog = async (item: any) => {
  data.form.label = item.label;
  data.form.color = item.color;
  data.form.desc = item.desc;
  data.form.value = item.value;
  data.itemId = item.id;
  dialogShow.value = true;
};
/** 提交表单 */
const submitForm = async () => {
  const validate = await ruleFormRef.value.validate((valid: any) => {
    return valid;
  });
  if (!validate) {
    return;
  }

  showLoading();
  let form: any = { ...data.form };
  try {
    if (data.itemId) {
      await editTags(data.itemId, form);
    } else {
      await addTags(form);
    }
    showToastOk("操作成功");
    dialogShow.value = false;
    restart();
  } catch (error: any) {
    showToastFail(error.err_msg);
  }
};
/** 删除模版 */
async function handlerDelete(id: any) {
  try {
    await ElMessageBox.confirm("确认删除该数据?", "确认消息", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch (error) {
    return;
  }

  showLoading();
  try {
    await delTags(id);
    hideLoading();
    queryListData();
  } catch (error: any) {
    showToastFail(error.err_msg);
  }
}

onMounted(async () => {
  dicts.careBuddyType = await queryDict("care-buddy-type", "number");
});

// 获取列表数据
async function queryListData() {
  loading.value = true;
  const form = { ...queryParams.value };
  try {
    const { data: response } = await queryTags(form);
    dataList.value = response.result.rows || [];
    dataListTotal.value = response.result.total;
  } catch (error: any) {
    showToastFail(error.err_msg);
  } finally {
    loading.value = false;
  }
}

queryListData();
</script>
<style lang="scss" scoped></style>
