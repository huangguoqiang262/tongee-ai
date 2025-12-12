<template>
  <div class="maintenance-plan">
    <!-- 顶部导航栏 -->
    <div class="header-bar">
      <div class="nav-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab', { active: activeTab === tab.id }]"
          @click="handleTabChange(tab.id)"
        >
          {{ tab.name }}
        </button>
      </div>

      <div class="search-box">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索设备"
          class="search-input"
        />
        <span class="search-icon">🔍</span>
      </div>

      <button class="upload-btn" @click="handleUpload">
        上传保养计划
      </button>
    </div>

    <!-- 表格内容 -->
    <div class="table-container">
      <table class="maintenance-table">
        <thead>
          <tr>
            <th>序号</th>
            <th>设备名称</th>
            <th>设备编号</th>
            <th>位置</th>
            <th>保养项目</th>
            <th>保养周期(月)</th>
            <th v-for="month in months" :key="month">{{ month }}</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(equipment, eqIndex) in filteredData" :key="equipment.id">
            <tr
              v-for="(item, itemIndex) in equipment.item"
              :key="item.id"
              :class="{ 'first-row': itemIndex === 0 }"
            >
              <!-- 序号 -->
              <td v-if="itemIndex === 0" :rowspan="equipment.item.length">
                {{ getSerialNumber(eqIndex) }}
              </td>

              <!-- 设备名称 -->
              <td v-if="itemIndex === 0" :rowspan="equipment.item.length">
                {{ equipment.equipment_name }}
              </td>

              <!-- 设备编号 -->
              <td v-if="itemIndex === 0" :rowspan="equipment.item.length">
                <div class="code-list">
                  <span v-for="(code, idx) in equipment.code" :key="code.id">
                    {{ code.code }}<span v-if="idx < equipment.code.length - 1">, </span>
                  </span>
                </div>
              </td>

              <!-- 位置 -->
              <td v-if="itemIndex === 0" :rowspan="equipment.item.length">
                <div class="location-list">
                  <span v-for="(loc, idx) in equipment.location" :key="loc.id">
                    {{ loc.location_name }}<span v-if="idx < equipment.location.length - 1">, </span>
                  </span>
                </div>
              </td>

              <!-- 保养项目 -->
              <td class="maintenance-item">{{ item.maintenance_item }}</td>

              <!-- 保养周期 -->
              <td>{{ item.maintenance_cycle }}</td>

              <!-- 月度列 -->
              <td
                v-for="month in 12"
                :key="month"
                :class="['month-cell', { 'needs-maintenance': getMaintenanceStatus(item, month) === 'needed' }]"
                @click="handleMonthClick(item, month)"
              >
                <div v-if="getMaintenanceStatus(item, month) === 'needed'" class="status-content">
                  <span class="needs-label">需要</span>
                  <div class="checkboxes" v-if="getCurrentMonth() === month && isCurrentYear()">
                    <label>
                      <input
                        type="checkbox"
                        :checked="getMaintenanceCheckbox(item, month, 'early')"
                        @click.stop
                        @change="handleCheckboxChange(item, month, 'early', $event)"
                      />
                      提前完成
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        :checked="getMaintenanceCheckbox(item, month, 'completed')"
                        @click.stop
                        @change="handleCheckboxChange(item, month, 'completed', $event)"
                      />
                      完成
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        :checked="getMaintenanceCheckbox(item, month, 'marked')"
                        @click.stop
                        @change="handleCheckboxChange(item, month, 'marked', $event)"
                      />
                      标记保养
                    </label>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  apiData: {
    type: Array,
    required: true
  }
})

// 状态管理
const activeTab = ref('all')
const searchKeyword = ref('')
const maintenanceStatus = ref({}) // 存储复选框状态

// 标签页配置
const tabs = [
  { id: 'all', name: '全部' },
  { id: 1, name: '生产部' },
  { id: 2, name: '研发部' },
  { id: 3, name: '质量部' }
]

// 月份标签
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

// 计算过滤后的数据
const filteredData = computed(() => {
  let equipmentList = []

  // 根据标签页过滤部门
  if (activeTab.value === 'all') {
    props.apiData.forEach(dept => {
      equipmentList.push(...dept.equipment)
    })
  } else {
    const dept = props.apiData.find(d => d.id === activeTab.value)
    if (dept) {
      equipmentList = dept.equipment
    }
  }

  // 根据关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    equipmentList = equipmentList.filter(eq => {
      return eq.equipment_name.toLowerCase().includes(keyword) ||
             eq.code.some(c => c.code.toLowerCase().includes(keyword))
    })
  }

  return equipmentList
})

// 获取序号
const getSerialNumber = (index) => {
  return index + 1
}

// 获取保养状态
const getMaintenanceStatus = (item, month) => {
  const plan = item.plans.find(p => p.month_number === month)
  if (plan && plan.need_maintenance === 1) {
    return 'needed'
  }
  return 'none'
}

// 获取当前月份（假设为8月）
const getCurrentMonth = () => {
  return 8 // 可以根据实际需求改为 new Date().getMonth() + 1
}

// 判断是否为当前年份
const isCurrentYear = () => {
  // 这里可以根据实际需求判断
  return true
}

// 获取复选框状态
const getMaintenanceCheckbox = (item, month, type) => {
  const key = `${item.id}_${month}_${type}`
  return maintenanceStatus.value[key] || false
}

// 处理复选框变更
const handleCheckboxChange = (item, month, type, event) => {
  const key = `${item.id}_${month}_${type}`

  if (type === 'early') {
    // 如果选择提前完成，取消其他选项
    maintenanceStatus.value[key] = event.target.checked
    if (event.target.checked) {
      maintenanceStatus.value[`${item.id}_${month}_completed`] = false
      maintenanceStatus.value[`${item.id}_${month}_marked`] = false
    }
  } else {
    maintenanceStatus.value[key] = event.target.checked
  }

  // 这里可以添加API调用来保存状态
  console.log('Maintenance status updated:', {
    itemId: item.id,
    month,
    type,
    checked: event.target.checked
  })
}

// 处理标签页切换
const handleTabChange = (tabId) => {
  activeTab.value = tabId
}

// 处理上传
const handleUpload = () => {
  console.log('Upload maintenance plan')
  // 这里添加上传逻辑
}

// 处理月份单元格点击
const handleMonthClick = (item, month) => {
  // 可以添加其他交互逻辑
  console.log('Month clicked:', item.id, month)
}

onMounted(() => {
  console.log('Maintenance plan mounted', props.apiData)
})
</script>

<style scoped lang="scss">
.maintenance-plan {
  width: 100%;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 顶部导航栏 */
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.nav-tabs {
  display: flex;
  gap: 8px;
}

.tab {
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-radius: 4px;
  transition: all 0.3s;
}

.tab:hover {
  background: #e8e8e8;
}

.tab.active {
  background: #1890ff;
  color: #fff;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 300px;
  margin: 0 24px;
}

.search-input {
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.search-icon {
  position: absolute;
  right: 12px;
  cursor: pointer;
}

.upload-btn {
  padding: 8px 16px;
  background: #52c41a;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.upload-btn:hover {
  background: #73d13d;
}

/* 表格容器 */
.table-container {
  overflow-x: auto;
  padding: 24px;
}

.maintenance-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  min-width: 1800px;
}

.maintenance-table thead {
  background: #fafafa;
  position: sticky;
  top: 0;
  z-index: 10;
}

.maintenance-table th {
  padding: 12px 8px;
  text-align: center;
  border: 1px solid #e8e8e8;
  font-weight: 600;
  white-space: nowrap;
}

.maintenance-table td {
  padding: 8px;
  text-align: center;
  border: 1px solid #e8e8e8;
  vertical-align: middle;
}

.maintenance-table tbody tr:hover {
  background: #f5f5f5;
}

.maintenance-table .first-row td {
  border-top: 2px solid #e8e8e8;
}

.code-list,
.location-list {
  text-align: left;
  line-height: 1.6;
}

.maintenance-item {
  text-align: left;
  max-width: 250px;
}

.month-cell {
  min-width: 80px;
  cursor: pointer;
  position: relative;
}

.month-cell.needs-maintenance {
  background: #fff7e6;
}

.status-content {
  position: relative;
}

.needs-label {
  display: block;
  color: #fa8c16;
  font-weight: 500;
  margin-bottom: 4px;
}

.checkboxes {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
  align-items: flex-start;
}

.checkboxes label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
}

.checkboxes input[type="checkbox"] {
  cursor: pointer;
}
</style>