<template>
  <div class="maintenance-plan">
    <!-- 顶部导航栏 -->
    <div class="header-bar">
      <div class="nav-tabs">
        <el-button
          v-for="tab in tabs"
          :key="tab.id"
          link
          :class="['tab', { active: activeTab === tab.id }]"
          @click="handleTabChange(tab.id)"
        >
          {{ tab.name }}
        </el-button>
      </div>
      <div class="hd-right">
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            :suffix-icon="Search"
            type="text"
            placeholder="搜索设备"
            class="search-input"
          />
        </div>

        <el-upload class="upload-box" accept=".xls,.xlsx" :http-request="customUpload">
          <el-button class="upload-btn" type="primary">上传保养计划</el-button>
        </el-upload>
      </div>
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
            <tr v-for="(item, itemIndex) in equipment.item" :key="item.id">
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
                    {{ loc.location_name
                    }}<span v-if="idx < equipment.location.length - 1">, </span>
                  </span>
                </div>
              </td>

              <!-- 保养项目 -->
              <td class="maintenance-item">{{ item.maintenance_item }}</td>

              <!-- 保养周期 -->
              <td>{{ item.maintenance_cycle }}</td>

              <!-- 月度列 -->
              <td
                v-for="monthItem in item.plans"
                :key="monthItem.id"
                :class="[
                  'month-cell',
                  {
                    'needs-maintenance':
                      monthItem.need_maintenance === 1 && monthItem.maintenance_status === 0,
                    'completed-maintenance': monthItem.maintenance_status === 1
                  }
                ]"
                @contextmenu="(e) => showContextMenu(e, monthItem)"
              >
                <div class="status-content">
                  <span
                    v-if="monthItem.need_maintenance === 1 && monthItem.maintenance_status === 0"
                    class="needs-label"
                    >需要</span
                  >
                  <span v-if="monthItem.maintenance_status === 1" class="completed-label"
                    >已完成</span
                  >
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <HandleContextMenu
      :show="contextMenu.show"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :action-sheet="contextMenu.actionSheet"
      @action="handleContextMenuAction"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useUserStore } from '@renderer/stores/user'
import { useCheckLogin } from '@renderer/hooks/checkLogin'
import { maintenance_edit } from '@renderer/api/maintain'
import FinishIcon from '@renderer/assets/contextMenu/finish-icon.png'
import AheadIcon from '@renderer/assets/contextMenu/ahead-icon.png'
import SignIcon from '@renderer/assets/contextMenu/sign-icon.png'
const props = defineProps({
  apiData: {
    type: Array,
    required: true
  }
})
const emits = defineEmits(['refresh-data'])
// 状态管理
const activeTab = ref('all')
const searchKeyword = ref('')
// 标签页配置
const tabs = [
  { id: 'all', name: '全部' },
  { id: 1, name: '生产部' },
  { id: 2, name: '研发部' },
  { id: 3, name: '质量部' }
]
const actionItem = ref(null)
const contextMenu = ref({ show: false, x: 0, y: 0, actionSheet: [] })
//右键菜单相关函数
const showContextMenu = (e, monthItem) => {
  e.stopPropagation()
  e.preventDefault()
  if (!useCheckLogin().value) {
    return
  }
  actionItem.value = monthItem
  if (monthItem.maintenance_status === 1) {
    return
  } else if (monthItem.need_maintenance === 1 && monthItem.maintenance_status === 0) {
    contextMenu.value = {
      show: true,
      x: e.clientX,
      y: e.clientY,
      actionSheet: [
        {
          name: '完成保养',
          icon: FinishIcon,
          action: 'finishMaintenance'
        }
      ]
    }
  } else if (monthItem.need_maintenance === 0 && monthItem.maintenance_status === 0) {
    contextMenu.value = {
      show: true,
      x: e.clientX,
      y: e.clientY,
      actionSheet: [
        {
          name: '提前保养',
          icon: AheadIcon,
          action: 'aheadMaintenance'
        },
        {
          name: '标记保养',
          icon: SignIcon,
          action: 'signMaintenance'
        }
      ]
    }
  }
}
// 处理右键菜单操作
const handleContextMenuAction = ({ action }) => {
  if (action === 'finishMaintenance') {
    // 完成保养逻辑
    maintenance_edit({
      monthly_plans_id: actionItem.value.id,
      edit_type: 1
    }).then((res) => {
      if (res.code == 200) {
        // eslint-disable-next-line no-undef
        ElMessage.primary('保养完成')
        // 刷新数据
        emits('refresh-data')
      }
    })
  } else if (action === 'aheadMaintenance') {
    // 提前保养逻辑
    maintenance_edit({
      monthly_plans_id: actionItem.value.id,
      edit_type: 2
    }).then((res) => {
      if (res.code == 200) {
        // eslint-disable-next-line no-undef
        ElMessage.primary('提前保养成功')
        // 刷新数据
        emits('refresh-data')
      }
    })
  } else if (action === 'signMaintenance') {
    // 标记保养逻辑
    maintenance_edit({
      monthly_plans_id: actionItem.value.id,
      edit_type: 3
    }).then((res) => {
      if (res.code == 200) {
        // eslint-disable-next-line no-undef
        ElMessage.primary('标记保养成功')
        // 刷新数据
        emits('refresh-data')
      }
    })
  }
  contextMenu.value.show = false
}
// 月份标签
const months = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月'
]

// 计算过滤后的数据
const filteredData = computed(() => {
  let equipmentList = []

  // 根据标签页过滤部门
  if (activeTab.value === 'all') {
    props.apiData.forEach((dept) => {
      equipmentList.push(...dept.equipment)
    })
  } else {
    const dept = props.apiData.find((d) => d.id === activeTab.value)
    if (dept) {
      equipmentList = dept.equipment
    }
  }

  // 根据关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    equipmentList = equipmentList.filter((eq) => {
      return (
        eq.equipment_name.toLowerCase().includes(keyword) ||
        eq.code.some((c) => c.code.toLowerCase().includes(keyword))
      )
    })
  }

  return equipmentList
})

// 获取序号
const getSerialNumber = (index) => {
  return index + 1
}
// 处理标签页切换
const handleTabChange = (tabId) => {
  activeTab.value = tabId
}

// 处理上传
// 自定义上传逻辑
const customUpload = (fileItem) => {
  const userStore = useUserStore()
  // eslint-disable-next-line no-undef
  let loadcontext = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.3)',
    customClass: 'upload-loading'
  })
  const formData = new FormData()
  formData.append('uniacid', userStore.uniacid)
  formData.append('file[]', fileItem.file) // 实际使用时需要真实文件数据
  const xhr = new XMLHttpRequest()

  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) {
      const progress = (event.loaded / event.total) * 100
      fileItem.progress = Math.round(progress)
    }
  }
  xhr.onload = () => {
    loadcontext.close()
    let response = JSON.parse(xhr.response)
    if (xhr.status == 200 && response.code == 200) {
      emits('refresh-data', response.data)
    } else {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: response.msg || '上传失败',
        type: 'error'
      })
    }
  }

  xhr.onerror = () => {
    loadcontext.close()
  }

  // 实际使用时需要配置正确的上传地址
  xhr.open('POST', import.meta.env.VITE_API_BASE_URL + '/api/maintenance/upload')
  xhr.setRequestHeader('Authorization', userStore.token)
  xhr.send(formData)
}
const hideContextMenu = (e) => {
  if (contextMenu.value.show && !e.target.closest('.handleContextMenu')) {
    contextMenu.value.show = false
  }
}
onUnmounted(() => {
  document.removeEventListener('click', hideContextMenu)
})
onMounted(() => {
  console.log('Maintenance plan mounted', props.apiData)
  document.addEventListener('click', hideContextMenu)
})
</script>

<style scoped lang="scss">
.maintenance-plan {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 顶部导航栏 */
.header-bar {
  flex-shrink: 0;
  display: flex;
  gap: 0 20px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}

.nav-tabs {
  flex: 1;
  height: 34px;
  display: flex;
  align-items: center;
  gap: 0 3vw;
  white-space: nowrap;
  overflow-x: auto;
}

.tab {
  flex: 0 0 auto !important;
  width: fit-content;
  min-width: 20px !important;
  font-size: 14px;
  color: #555555;
}
.tab.active {
  color: var(--el-color-primary);
  font-weight: 600;
  // transform: scale(1.1);
}
.hd-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 20px;
}
.search-box {
  display: flex;
  align-items: center;
  width: 280px;
  :deep(.search-input) {
    width: 100%;
    font-size: 14px;
    .el-input__wrapper {
      padding-left: 20px;
      height: 34px;
      border-radius: 20px;
      background: #f9f9f9;
      box-shadow: none;
      &.is-focus {
        box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
      }
    }
  }
}
.upload-box {
  display: flex;
  align-items: center;
  .upload-btn {
    width: 96px;
    height: 26px;
    font-size: 12px;
    border-radius: 6px;
  }
}

/* 表格容器 */
.table-container {
  overflow: auto;
  flex: 1;
}

.maintenance-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  min-width: 1500px;
}

.maintenance-table thead {
  background: #fff;
  position: sticky;
  top: 0px;
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
  background: var(--el-color-danger-light-8);
}

.month-cell.completed-maintenance {
  background: var(--el-color-primary-light-8);
}

.status-content {
  position: relative;
}

.needs-label {
  display: block;
  color: var(--el-color-danger);
  font-weight: 500;
  margin-bottom: 4px;
}
.completed-label {
  display: block;
  color: var(--el-color-primary);
  font-weight: 500;
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

.checkboxes input[type='checkbox'] {
  cursor: pointer;
}
</style>
