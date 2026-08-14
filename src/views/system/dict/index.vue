<template>
  <div class="dict">
    <many-col-container class="flex-1" :count="2" cent>
      <template #0>
        <div class="left_box">
          <el-row align="middle" :gutter="15" style="padding-left: 5px">
            <el-col :span="24">
              <el-input
                prefix-icon="Search"
                clearable
                placeholder="关键字"
                v-model="dictListRequestParams.keyword"
                @clear="getDictList"
                style="width: 200px"
                class="mr-10"
              />
              <el-button @click="getDictList">查询</el-button>
              <el-button
                v-permission="'add'"
                type="primary"
                @click="openDictDialogVisible"
                >新增</el-button
              >
            </el-col>
          </el-row>
          <div>
            <el-table
              :data="leftDicts"
              style="width: 100%"
              row-key="id"
              v-loading="leftLoading"
              :row-class-name="selectTableRowHandle"
              @row-click="rowDictClickHandle"
              class="mt-10"
            >
              <el-table-column
                label="名称"
                min-width="150"
                prop="label"
                align="center"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                label="数据值"
                min-width="150"
                prop="value"
                align="center"
                show-overflow-tooltip
              >
                <template #default="scope">
                  <span @click="copyValue(scope.row)" style="cursor: pointer">{{
                    scope.row.value
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column
                label="备注"
                prop="remarks"
                min-width="200"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                label="操作"
                width="130"
                align="center"
                fixed="right"
                v-if="checkPermission(['edit', 'delete'])"
              >
                <template #default="scope">
                  <el-button
                    v-permission="'edit'"
                    size="small"
                    link
                    type="primary"
                    icon="Edit"
                    @click="editMenuHanlder(scope.row)"
                    >修改</el-button
                  >
                  <el-button
                    v-permission="'delete'"
                    size="small"
                    link
                    type="danger"
                    icon="Delete"
                    @click="deleteRowHandle(1, scope.row.id)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="footer-pagination-container">
            <el-pagination
              v-model:current-page="dictListRequestParams.page"
              v-model:page-size="dictListRequestParams.page_size"
              :page-sizes="[5, 10, 25, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="dictListTotal"
              @size-change="getDictList"
              @current-change="getDictList"
            />
          </div>
        </div>
      </template>
      <template #1>
        <div class="right_box">
          <el-row align="middle" :gutter="15">
            <el-col :span="24">
              <el-input
                prefix-icon="Search"
                clearable
                placeholder="关键字"
                v-model="getDictValueRequestParams.keyword"
                @clear="getDictValue"
                style="width: 200px"
                class="mr-10"
              />
              <el-button @click="getDictValue">查询</el-button>
              <el-button
                v-permission="'add'"
                type="primary"
                @click="openNewDictValue"
                v-if="getDictValueRequestParams.parent_id"
                >新增</el-button
              >
            </el-col>
          </el-row>
          <div style="flex: 1" class="mt-10 relative"> 
            <el-table
              :data="rightDicts"
              row-key="id"
              v-loading="rightLoading"
              width="100%"
              height="100%"
              style="position: absolute;inset: 0;"
            >
              <el-table-column
                label="名称"
                min-width="160"
                prop="label"
                align="center"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                label="数据值"
                min-width="180"
                prop="value"
                align="center"
              >
              </el-table-column>
              <el-table-column label="备注" prop="remarks" min-width="200" show-overflow-tooltip></el-table-column>
              <el-table-column label="操作" width="190" align="center" fixed="right" v-if="checkPermission(['edit', 'delete'])">
                <template #default="scope">
                  <el-button
                    size="small"
                    link
                    type="info"
                    icon="CopyDocument"
                    @click="copyMenuItemHandle(scope.row)"
                    >复制</el-button
                  >
                  <el-button
                    v-permission="'edit'"
                    size="small"
                    link
                    type="primary"
                    icon="Edit"
                    @click="editMenuHanlder(scope.row)"
                    >修改</el-button
                  >
                  <el-button
                    v-permission="'delete'"
                    size="small"
                    link
                    type="danger"
                    icon="Delete"
                    @click="deleteRowHandle(2, scope.row.id)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </template>
    </many-col-container>

    <el-dialog
      v-model="dictDialogVisible"
      title="新增字典数据"
      destroy-on-close
      append-to-body
      width="560px"
    >
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="rules"
        status-icon
        label-width="80px"
      >
        <el-row :gutter="20">
          <el-col :span="24" v-if="dictDialogVisibleMode == 2">
            <el-form-item label="上级字典" prop="remarks">
              <el-select
                v-model="ruleForm.parent_id"
                placeholder="选择"
                disabled
              >
                <el-option
                  v-for="item in leftDicts"
                  :label="item.label"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="字典名称" prop="label">
              <el-input v-model="ruleForm.label" placeholder="请输入字典名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="字典数据" prop="value">
              <el-input v-model="ruleForm.value" placeholder="请输入字典数据" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="字典备注" prop="remarks">
              <el-input
                v-model="ruleForm.remarks"
                :rows="2"
                type="textarea"
                resize="none"
                placeholder="选填"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dictDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts" name="dict">
import { ElMessageBox, FormInstance, FormRules } from "element-plus";
import {
  createDict,
  deleteDict,
  queryDictList,
  queryDictValueList,
  updateDict,
} from "@/api/system/dict";
import { checkPermission } from "@/directives/permission";

const dictDialogVisibleType = ref("new");
const dictDialogVisibleMode = ref(0);
const dictDialogVisible = ref(false);
const leftLoading = ref(false);
const rightLoading = ref(false);
const leftDicts: Ref = ref([]);
const rightDicts: Ref = ref([]);
const leftSelectIndex = ref(-1);
const dictListTotal = ref(0);
const dictListRequestParams = reactive({
  keyword: "",
  parent_id: 0,
  page: 1,
  page_size: 50,
});
const getDictValueRequestParams = reactive({
  keyword: "",
  parent_id: 0,
});
const ruleFormRef: any = ref<FormInstance>();
const ruleForm = reactive({
  id: 0,
  label: "",
  value: "",
  remarks: "",
  parent_id: 0,
});
const rules = reactive<FormRules>({
  label: [{ required: true, message: "请填写完整", trigger: "blur" }],
  value: [{ required: true, message: "请填写完整", trigger: "blur" }],
});

/** 判断一个value是否为数字（包括数字字符串） */
const isNumeric = (value: string | number) => {
   // 处理 number 类型
  if (typeof value === 'number') {
    // 排除 NaN（NaN 是 number 类型，但不是有效数字）
    // 排除非有限数（Infinity/-Infinity 通常不视为有效数字）
    return !isNaN(value) && isFinite(value);
  }

  // 处理字符串类型
  if (typeof value === 'string') {
    const trimmed = value.trim(); // 去除前后空格（如 " 123 " 变为 "123"）
    if (trimmed === '') return false; // 空字符串或全空格无效

    const num = Number(trimmed); // 转换为数字
    // 转换后需满足：不是 NaN，且是有限数
    return !isNaN(num) && isFinite(num);
  }

  // 其他类型（如对象、布尔值等）直接返回 false
  return false;
}
const resetForm = () => {
  ruleFormRef.value.resetFields();
};
const copyMenuItemHandle = (row: any) => {
  let newObj: any = {};
  Object.assign(newObj, row);
  delete newObj.created_at;
  delete newObj.deleted_at;
  delete newObj.updated_at;
  delete newObj.id;
  Object.assign(ruleForm, newObj);
  if (row.parent_id == 0) {
    ruleForm.parent_id = 0;
  } else {
    ruleForm.parent_id = leftDicts.value[leftSelectIndex.value].id;
  }
  dictDialogVisibleType.value = "new";
  dictDialogVisible.value = true;
  dictDialogVisibleMode.value = 2;
};
const editMenuHanlder = (row: any) => {
  let newObj: any = {};
  Object.assign(newObj, row);
  delete newObj.created_at;
  delete newObj.deleted_at;
  delete newObj.updated_at;
  delete newObj.id;
  Object.assign(ruleForm, newObj);
  dictDialogVisibleType.value = "edit";
  dictDialogVisible.value = true;
  if (row.parent_id == 0) {
    dictDialogVisibleMode.value = 1;
    ruleForm.parent_id = 0;
  } else {
    dictDialogVisibleMode.value = 2;
    ruleForm.parent_id = leftDicts.value[leftSelectIndex.value].id;
  }
  ruleForm.id = row.id;
};
const selectTableRowHandle = ({ row, rowIndex }: any) => {
  if (rowIndex == leftSelectIndex.value) {
    return "success-row";
  }
  return "";
};
const rowDictClickHandle = (row: any) => {
  const indx = leftDicts.value.findIndex((e: any) => e == row);
  if (indx == leftSelectIndex.value) return;

  if (indx != -1) {
    leftSelectIndex.value = indx;
  }

  getDictValueRequestParams.parent_id = leftDicts.value[indx].id;
  ruleForm.parent_id = leftDicts.value[indx].id;
  getDictValue();
};
const deleteRowHandle = async (place: number, id: any) => {
  await ElMessageBox.confirm("字典将被永久删除?", "确认消息", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  });
  deleteDictHandler(place, id);
};
const openNewDictValue = () => {
  ruleForm.label = "";
  ruleForm.value = "";
  if (rightDicts.value.length > 0) {
    try {
      let lastVal = rightDicts.value[rightDicts.value.length - 1].value;
      if (isNumeric(lastVal)) {
        ruleForm.value = (parseInt(lastVal) + 1).toString();
      }
    } catch (error) {}
  }
  ruleForm.remarks = "";
  dictDialogVisibleType.value = "new";
  dictDialogVisible.value = true;
  dictDialogVisibleMode.value = 2;
};
const openDictDialogVisible = () => {
  dictDialogVisibleType.value = "new";
  dictDialogVisible.value = true;
  ruleForm.id = 0;
  ruleForm.label = "";
  ruleForm.value = "";
  ruleForm.remarks = "";
  ruleForm.parent_id = 0;
  dictDialogVisibleMode.value = 1;
};
const copyValue = async (row: any) => {
  await navigator.clipboard.writeText(row.value);
  showToastOk("已复制");
};
const deleteDictHandler = async (place: number, id: any) => {
  showLoading("正在处理");
  try {
    const { data: response } = await deleteDict(id);
    showToastOk(response.msg);
    if (place == 1) {
      if (leftDicts.value.length > 0) {
        getDictValueRequestParams.parent_id = leftDicts.value[0].id;
        ruleForm.parent_id = leftDicts.value[0].id;
      }
      getDictList();
      getDictValue();
    } else {
      getDictValue();
    }
  } catch (error: any) {
    showToastFail(error.err_msg);
  }
};

async function submitForm() {
  if (!ruleFormRef) return;
  const calRes = await ruleFormRef.value.validate((valid: any) => {
    return valid;
  });
  if (!calRes) {
    return;
  }

  showLoading("正在处理");
  try {
    let requestMethod: any = null;
    if (dictDialogVisibleType.value == "new") {
      requestMethod = createDict(ruleForm);
    } else {
      requestMethod = updateDict(ruleForm.id, ruleForm);
    }
    if (dictDialogVisibleMode.value == 1) {
      ruleForm.parent_id = 0;
    }
    const { data: result } = await requestMethod;
    dictDialogVisible.value = false;
    showToastOk(result.msg);
    resetForm();
    if (dictDialogVisibleMode.value == 1) {
      getDictList(true);
    }
    if (dictDialogVisibleMode.value == 2) {
      getDictValue();
    }
  } catch (error: any) {
    showToastFail(error.err_msg);
  }
}
async function getDictList(isDefaultSeleteNew: boolean = false) {
  try {
    leftLoading.value = true;
    const { data: response } = await queryDictList(dictListRequestParams);
    leftDicts.value = response.result.rows || [];
    if (leftDicts.value.length == 0) return;

    dictListTotal.value = response.result.total;

    // 默认选中当前新建的字典
    if (isDefaultSeleteNew) {
      leftSelectIndex.value = leftDicts.value.length - 1;
      getDictValueRequestParams.parent_id =
        leftDicts.value[leftSelectIndex.value].id;
      ruleForm.parent_id = leftDicts.value[leftSelectIndex.value].id;
      getDictValue();
      return;
    }

    if (leftSelectIndex.value == -1) {
      leftSelectIndex.value = 0;
      getDictValueRequestParams.parent_id = leftDicts.value[0].id;
      ruleForm.parent_id = leftDicts.value[0].id;
      getDictValue();
    }
  } catch (error: any) {
    showToastFail(error.err_msg);
  } finally {
    leftLoading.value = false;
  }
}
async function getDictValue() {
  if (getDictValueRequestParams.parent_id < 1) {
    return;
  }
  try {
    rightLoading.value = true;
    const { data: response } = await queryDictValueList(
      getDictValueRequestParams,
    );
    rightDicts.value = response.result.rows || [];
  } catch (error: any) {
    showToastFail(error.err_msg);
  } finally {
    rightLoading.value = false;
  }
}

getDictList();
</script>
<style lang="scss" scoped>
.dict {
  margin: 10px 0;
  height: calc(100% - 20px);
  display: flex;
  flex-direction: column;

  & .left_box {
    width: 100%;
    height: 100%;
    padding: 10px;
    overflow: hidden;
    background-color: white;
    border-radius: 8px;
  }
  & .right_box {
    width: 100%;
    height: 100%;
    padding: 10px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    background-color: white;
  }
}
:deep(.el-table) {
  .warning-row {
    --el-table-tr-bg-color: var(--el-color-warning-light-9);
  }
  .success-row {
    --el-table-tr-bg-color: var(--el-table-current-row-bg-color);
  }
}
</style>
