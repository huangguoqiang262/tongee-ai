<template>
  <div class="maintain">
    <MaintenancePlan :api-data="apiData" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { get_maintenance_plan } from '@renderer/api/maintain'
const apiData = ref([])
const getData = () => {
  get_maintenance_plan().then((res) => {
    console.log(res)
    apiData.value = res.data
  })
}
onMounted(() => {
  getData()
})
</script>

<style scoped lang="scss">
.maintain {
  padding: 48px 20px;
}
</style>