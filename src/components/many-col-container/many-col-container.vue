<template>
  <div class="many-col-container">
    <template v-if="props.cent">
      <div
        class="col_item"
        :style="`width: ${100 / props.count}%;`"
        v-for="(item, index) in props.count"
      >
        <slot :name="index" :index="index"></slot>
      </div>
    </template>
    <template v-else>
      <template v-for="(_, index) in props.count">
        <div v-if="props.flex" class="col_item" style="flex: 1">
          <slot :name="index" :index="index"></slot>
        </div>
        <div v-else class="col_item" :style="flexIndx == index ? 'flex:1' : ''">
          <slot :name="index" :index="index"></slot>
        </div>
      </template>
    </template>
  </div>
</template>
<script setup lang="ts" name="many-col-container">
const props = defineProps({
  count: {
    type: Number,
    default: 2,
  },
  flexIndx: {
    type: Number,
    default: -1,
  },
  flex: {
    type: Boolean,
    default: false,
  },
  rightFlex: {
    type: Boolean,
    default: false,
  },
  cent: {
    type: Boolean,
    default: false,
  },
});
</script>
<style lang="scss" scoped>
.many-col-container {
  display: flex;
  & .col_item {
    padding: 0 5px;
    border-left: 1px solid #f1f2f4;
    overflow: auto;
  }
  & .col_item:nth-child(1) {
    border: none;
  }
}
</style>
