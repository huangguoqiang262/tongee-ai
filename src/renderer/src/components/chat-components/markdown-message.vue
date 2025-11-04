<template>
  <!--  markdown显示消息-->
  <!-- <md-preview  :model-value="message" preview-theme="smart-blue"></md-preview> -->
  <v-md-preview :text="message"></v-md-preview>
</template>
<script setup>
defineProps({
  message: {
    type: String,
    default: ''
  }
})
</script>
<style scoped lang="scss">
// 调整markdown组件的一些样式，deep可以修改组件内的样式，正常情况是scoped只能修改本组件的样式。
:deep(.md-editor-preview-wrapper) {
  // padding: 0 10px;

  .smart-blue-theme p {
    line-height: unset;
  }
}
</style>
