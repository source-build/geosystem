<template>
  <el-image :src="src" v-if="src" @click="previewHandler" :fit="fit" :lazy="lazy" :preview-src-list="previewSrcList"
    show-progress preview-teleported :style="style" @load="(e: any) => emits('load', e)" />
</template>
<script setup lang="ts" name="f-image">
import emptyAvatar from "@/assets/imgs/r/empty-avatar.jpg";
import adminEmptyAvatar from "@/assets/svg/empty-avatar.svg";
import { storeConfig } from "@/hooks/config";

const emits = defineEmits(["load"]);
const props = defineProps({
  // 资源URL
  // 可传入：uuid(已废弃)、http、https、COS对象存储Key
  src: {
    type: String,
  },
  // 是否是头像模式
  // 当处于头像模式时，如果资源URL为空，则展示默认头像
  avatar: {
    type: Boolean,
    default: false,
  },
  // 圆形的
  round: {
    type: Boolean,
    default: false,
  },
  // 管理员头像模式（头像为空时展示管理员默认头像）
  adminAvatar: {
    type: Boolean,
    default: false,
  },
  // 图片预览
  preview: {
    type: Boolean,
    default: false,
  },
  // 原生 object-fit 属性
  fit: {
    type: String,
  },
  lazy: {
    type: Boolean,
    default: true,
  },
  srcList: {
    type: Array<string>,
    default: [],
  },
});

const src: any = ref(null);
const previewSrcList = ref<any[]>([]);
const style = computed(() => {
  let obj: { [key: string]: any } = {};
  if (props.round) {
    obj["border-radius"] = "50%";
  }
  return obj;
});

const fit = computed(() => {
  if (props.avatar && !props.fit) {
    return "cover";
  }

  return props.fit;
});

const addParamToUrl = (urlString: string, key: string, value: any) => {
  if (urlString.indexOf("?") === -1) {
    return `${urlString}?${key}=${value}`;
  }

  const separator = urlString.endsWith("?") ? "" : "&";
  return `${urlString}${separator}${key}=${value}`;
};

const pathToSrc = (str: string) => {
  if (str.includes("data:image/")) {
    return str;
  }

  // http(s)
  if (str.indexOf("http") == 0) {
    return addParamToUrl(str, "t", new Date().getTime());
  }

  // OSS
  let domain = storeConfig.osdDomain;
  const cleanDomain = domain.endsWith("/") ? domain.slice(0, -1) : domain;
  const cleanSrc = str.startsWith("/") ? str.slice(1) : str;
  return addParamToUrl(`${cleanDomain}/${cleanSrc}`, "t", new Date().getTime());
};

const start = async () => {
  // 空图像
  if (!props.src) {
    if (props.adminAvatar) {
      src.value = adminEmptyAvatar;
      return;
    }
    if (props.avatar) {
      src.value = emptyAvatar;
    }
    return;
  }

  src.value = pathToSrc(props.src);
  if (props.preview) {
    let pUrls = [];
    for (let i = 0; i < props.srcList.length; i++) {
      const url = props.srcList[i];
      pUrls.push(pathToSrc(url));
    }
    if (!props.srcList.length) {
      pUrls.push(src.value);
    }
    previewSrcList.value.push(...pUrls);
  }
};

const previewHandler = () => {
  if (!props.preview) return;
};

start();
</script>
<style lang="scss" scoped></style>
