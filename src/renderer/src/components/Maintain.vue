<template>
  <div class="maintain">
    <MaintenancePlan :api-data="apiData" @refresh-data="getData" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { get_maintenance_plan } from '@renderer/api/maintain'
const apiData = ref([])
const getData = () => {
  get_maintenance_plan().then((res) => {
    apiData.value = res.data
  })
}
onMounted(() => {
  getData()
})
</script>

<style scoped lang="scss">
.maintain {
  padding: 48px 120px;
  height: 100%;
  width: 100%;
}
</style>
