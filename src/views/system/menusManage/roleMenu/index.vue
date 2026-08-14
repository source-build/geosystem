<template>
  <div class="roleMenu">
    <div class="nav">
      <h5 class="container-label title">角色列表</h5>
      <div class="role-list" v-loading="roleLoading">
        <el-tree
          ref="roleTreeRef"
          :data="rolesList"
          node-key="id"
          :props="{ label: 'label', children: 'children' }"
          highlight-current
          default-expand-all
          @node-click="handleRoleNodeClick"
        >
          <template #default="{ data }">
            <div class="role-tree-node">
              <span class="role-tree-node__label">{{ data.label }}</span>
              <span class="role-tree-node__alias">{{ data.alias }}</span>
            </div>
          </template>
        </el-tree>
      </div>
    </div>
    <div class="content" v-loading="menuLoading" v-if="menuList.length > 0">
      <h5 class="container-label title">菜单授权</h5>
      <div class="main-tree">
        <el-tree-v2
          v-if="treeHeight > 0"
          :key="treeStringKey"
          ref="menuTreeRef"
          :data="menuList"
          :props="menuTreeProps"
          :default-expanded-keys="defaultExpandedKeys"
          show-checkbox
          check-strictly
          @check-change="menuTreeCheckChangeHandler"
          :height="treeHeight"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts" name="roleMenu">
import { roleList } from "@/api/system/role";
import { listToTreeOptimized } from "@/utils/array";
import {
  addMenuRoleAuth,
  delMenuRoleAuth,
  queryRoleMenu,
} from "@/api/system/menuRole";
import { allMenu } from "@/api/system/menu";

/** 菜单树高度 */
const treeHeight = ref<number>(0);
/** 角色树形列表 */
const rolesList: Ref<Array<any>> = ref([]);
/** 角色列表loading */
const roleLoading: Ref<boolean> = ref(false);
/** 角色树引用 */
const roleTreeRef: Ref = ref(null);
/** 当前选中角色ID */
const rolesActive: Ref = ref(0);
/** 菜单默认展开的key */
const defaultExpandedKeys: Ref<Array<string>> = ref([]);
/** 菜单树引用 */
const menuTreeRef: Ref = ref(null);
/** 菜单源数据（扁平列表） */
const menuSourceList: Ref<Array<any>> = ref([]);
/** 菜单树形数据 */
const menuList: Ref<Array<any>> = ref([]);
/** 菜单loading */
const menuLoading: Ref<boolean> = ref(false);
/** 菜单树刷新key */
const treeStringKey = ref("myTree");
/** 菜单树字段映射 */
const menuTreeProps = {
  value: "id",
  label: "label",
  children: "children",
};

/** 按钮名称快捷选项 */
const quickActions = [
  { label: "列表", value: "list" },
  { label: "新增", value: "add" },
  { label: "修改", value: "edit" },
  { label: "删除", value: "delete" },
  { label: "导入", value: "import" },
  { label: "导出", value: "export" },
  { label: "详情", value: "detail" },
  { label: "审核", value: "approval" },
];

/** 根据权限字符显示中文名称 */
const permissionName = (name: string) => {
  const action = quickActions.find((a) => a.value === name);
  return action ? action.label : name;
};

/** 获取角色列表并构建树 */
const queryRoleListData = async () => {
  roleLoading.value = true;
  try {
    const { data: response }: any = await roleList({});
    const flatList = response.result || [];
    rolesList.value = listToTreeOptimized(flatList);
    // 默认选中第一个叶子节点
    if (rolesActive.value == 0 && rolesList.value.length > 0) {
      const firstLeaf = findFirstLeaf(rolesList.value);
      if (firstLeaf) {
        rolesActive.value = firstLeaf.id;
        nextTick(() => {
          roleTreeRef.value?.setCurrentKey(firstLeaf.id);
        });
        queryRoleMenuRequest();
      }
    }
  } catch (error: any) {
    showToastFail(error.err_msg);
  } finally {
    roleLoading.value = false;
  }
};

/** 找到树中第一个叶子节点 */
const findFirstLeaf = (list: any[]): any => {
  for (const item of list) {
    if (item.children?.length) {
      const leaf = findFirstLeaf(item.children);
      if (leaf) return leaf;
    } else {
      return item;
    }
  }
  return null;
};

/** 点击角色树节点 */
const handleRoleNodeClick = (data: any) => {
  if (data.children?.length) return;
  rolesActive.value = data.id;
  queryRoleMenuRequest();
};
/** 查询角色下的权限菜单 */
const queryRoleMenuRequest = async (showLoadingState = true) => {
  if (showLoadingState) menuLoading.value = true;
  try {
    const { data: response } = await queryRoleMenu(rolesActive.value);
    const checkedMenus: any[] = response.result || [];
    if (!menuTreeRef.value) return;

    nextTick(() => {
      const keys = checkedMenus.map((m: any) => m.id);
      menuTreeRef.value.setCheckedKeys(keys);
    });
  } catch (error: any) {
    showToastFail(error.err_msg);
  } finally {
    if (showLoadingState) menuLoading.value = false;
  }
};

/** 获取菜单列表数据 */
async function queryMenuListData() {
  menuLoading.value = true;
  try {
    const { data: response } = await allMenu();
    await queryRoleListData();
    response.result = response.result || [];
    let ids = [];
    for (let i = 0; i < response.result.length; i++) {
      const item = response.result[i];
      ids.push(item.id);
    }
    defaultExpandedKeys.value.push(...ids);
    menuSourceList.value = response.result;
    const tree = menuTreeHandler(response.result, 0);
    menuList.value = tree;
    nextTick(getTreeHeight);
  } catch (error: any) {
    showToastFail(error.err_msg);
  } finally {
    menuLoading.value = false;
  }
}
/** 处理菜单树结构 */
function menuTreeHandler(arr: Array<any>, parseId: any) {
  let list: Array<any> = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (item.parent_id == parseId) {
      list.push({
        ...item,
        label:
          item.type === 3 ? `权限: ${item.describe || permissionName(item.name)}` : item.name,
        value: item.id,
        children: menuTreeHandler(arr, item.id),
      });
    }
  }

  return list;
}
/** 选择树节点 */
async function menuTreeCheckChangeHandler(node: any, is: boolean) {
  let requestMethod: any = null;
  if (is) {
    requestMethod = addMenuRoleAuth;
  } else {
    requestMethod = delMenuRoleAuth;
  }

  showLoading("正在处理");
  try {
    const { data: response } = await requestMethod({
      menu_id: node.id,
      role_id: rolesActive.value,
    });
    showToastOk(response.msg);
    // 以后端返回为准，重新刷新选中状态（不显示loading遮罩）
    await queryRoleMenuRequest(false);
  } catch (error: any) {
    showToastFail(error.err_msg);
    // 失败也刷新，恢复一致性
    await queryRoleMenuRequest(false);
  }
}

let timer: any = null;
const getTreeHeight = () => {
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    const treeContainer = document.querySelector(".main-tree");
    if (treeContainer) {
      nextTick(() => {
        treeHeight.value = treeContainer.clientHeight;
        // 树渲染完成后，如果已有选中角色则重新加载勾选状态
        if (rolesActive.value) {
          nextTick(() => queryRoleMenuRequest());
        }
      });
    }
  }, 300);
};

onMounted(() => {
  addEventListener("resize", getTreeHeight);
});

onUnmounted(() => {
  removeEventListener("resize", getTreeHeight);
});

queryMenuListData();
</script>
<style lang="scss" scoped>
.roleMenu {
  position: absolute;
  inset: 0;
  margin: 15px;
  box-sizing: border-box;
  display: flex;
  .nav {
    height: 100%;
    overflow-y: auto;
    background-color: white;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    .title {
      margin: 10px 0;
      margin-left: 20px;
    }
    .role-list {
      flex: 1;
      overflow-y: auto;

      :deep(.el-tree) {
        background: transparent;
        padding: 0 8px;

        .el-tree-node__content {
          height: auto;
          padding: 5px 0;
          border-radius: 8px;
          padding-right: 70px;

          &:hover {
            background-color: var(--el-color-primary-light-9);
            .role-tree-node__label,
            .role-tree-node__alias {
              color: var(--el-color-primary);
            }
          }
        }

        .el-tree-node.is-current > .el-tree-node__content {
          background-color: var(--el-color-primary-light-9);

          .role-tree-node__label,
          .role-tree-node__alias {
            color: var(--el-color-primary);
          }
        }
      }
    }
  }
  .content {
    flex: 1;
    margin-left: 20px;
    background-color: white;
    border-radius: 8px;
    padding: 10px;
    display: flex;
    flex-direction: column;

    .main-tree {
      flex: 1;
    }
  }
}

.role-tree-node {
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__label {
    font-weight: 500;
    font-size: 13px;
  }

  &__alias {
    font-size: 11px;
    color: #9b9b9b;
    margin-top: 1px;
  }
}
</style>
