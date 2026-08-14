<template>
  <svg aria-hidden="true" class="f-svg-icon" :width="size" :height="size">
    <use :xlink:href="symbolId" :fill="color" />
  </svg>
</template>
<script setup lang="ts" name="f-svg-icon">
import { computed } from "vue";

const props = defineProps({
  prefix: {
    type: String,
    default: "icon",
  },
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "#333",
  },
  width: {
    type: String,
    default: "16px",
  },
  height: {
    type: String,
    default: "16px",
  },
  size: {
    type: String,
    default: "16px",
  },
});

const symbolId = computed(() => `#${props.prefix}-${props.name}`);
</script>
<style lang="scss" scoped>
</style>
