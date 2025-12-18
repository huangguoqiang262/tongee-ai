<template>
  <div class="document-detail">
    <FilePreview v-if="fileUrl" :file-url="fileUrl" :file-name="fileName" />
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
const props = defineProps({
  attrs: {
    type: Object,
    default: () => ({})
  }
})
let fileUrl = ref('')
let fileName = ref('')
watchEffect(() => {
  fileUrl.value = props.attrs.fileUrl || ''
  fileName.value = props.attrs.fileName || ''
})
</script>
<style scoped lang="scss">
.document-detail {
  width: 100%;
  height: 100%;
}
</style>
