<template>
  <div class="message-center-box">
    <div class="square">
      <div class="page-title">消息中心</div>
      <div class="tabs">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-item"
          :class="{ 'active-tab': tab.id == activeTab }"
          @click="tabHandle(tab.id)"
        >
          {{ tab.name }}
        </div>
      </div>
      <div class="content-box">
        <div v-if="activeTab == '1'" class="repository-box">
          <div class="head">
            <div class="search-box">
              <el-input
                v-model="searchVal"
                clearable
                class="search-input"
                placeholder="搜索反馈内容"
                :suffix-icon="searchVal ? '' : Search"
              />
            </div>
            <div class="right-head-box">
              <el-tooltip
                ref="datePickerTooltip"
                placement="bottom-end"
                effect="light"
                trigger="click"
              >
                <template #content>
                  <el-date-picker
                    v-model="dateValue"
                    :teleported="false"
                    format="YYYY/MM/DD"
                    value-format="YYYY-MM-DD"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    @change="changeDate"
                  />
                </template>
                <div class="filter-box" :class="{ active: dateValue && dateValue.length > 0 }">
                  <!-- <img class="filter-icon" src="@renderer/assets/filter-icon1.svg" alt="" /> -->
                  <svg
                    width="14px"
                    height="14px"
                    viewBox="0 0 14 14"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                  >
                    <title>路径</title>
                    <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                      <g id="消息中心—知识库反馈" transform="translate(-1282, -244)">
                        <rect fill="#FAFAFA" x="0" y="0" width="1920" height="1080"></rect>
                        <g id="编组-2">
                          <rect id="矩形" x="0" y="0" width="1920" height="1080"></rect>
                          <g id="背景" transform="translate(0, 0)" fill="#EEEFF0">
                            <rect id="矩形" x="0" y="0" width="1920" height="1080"></rect>
                          </g>
                        </g>
                        <rect
                          id="矩形备份-18"
                          fill="#FFFFFF"
                          x="68"
                          y="52"
                          width="1842"
                          height="1018"
                          rx="16"
                        ></rect>
                        <rect
                          id="矩形"
                          fill="#F9F9F9"
                          x="534"
                          y="214"
                          width="910"
                          height="490"
                          rx="12"
                        ></rect>
                        <rect
                          id="矩形备份-3"
                          stroke="#EFEFEF"
                          x="1268.5"
                          y="238.5"
                          width="69"
                          height="25"
                          rx="6"
                        ></rect>
                        <g id="245筛选过滤" transform="translate(1282, 244)" fill-rule="nonzero">
                          <rect
                            id="矩形"
                            fill="#000000"
                            opacity="0"
                            x="0"
                            y="0"
                            width="14"
                            height="14"
                          ></rect>
                          <path
                            d="M11.9546875,2.996875 L7.875,7.8859375 L7.875,10.7296875 C7.875,10.7953125 7.8421875,10.8609375 7.7984375,10.9046875 L6.4859375,11.9765625 C6.34375,12.096875 6.125,11.9875 6.125,11.8015625 L6.125,7.8859375 L2.0453125,2.996875 C1.925,2.8546875 2.0234375,2.6359375 2.209375,2.6359375 L11.7796875,2.6359375 C11.965625,2.6359375 12.075,2.8546875 11.9546875,2.996875 Z"
                            id="路径"
                            :fill="fillColor"
                          ></path>
                        </g>
                      </g>
                    </g>
                  </svg>
                  筛选
                </div>
              </el-tooltip>

              <div class="export-box">导出反馈</div>
            </div>
          </div>
          <div class="list-box">
            <div v-for="item in list" :key="item" class="list-item">
              <img class="left-icon" src="@renderer/assets/file-icon.png" alt="" />
              <div class="center-box">
                <div class="title">关于产品分类的建议</div>
                <div class="desc">建议增加对新型智能医疗器械的分类、当前分类体系不够完善。</div>
                <div class="author">提交者：张工(研发部)</div>
                <div class="btns">
                  <div class="btn">标记已处理</div>
                  <div class="btn btn1">查看详情</div>
                  <div class="btn btn2">已处理</div>
                </div>
              </div>
              <div class="time">18:00</div>
            </div>
          </div>
        </div>
        <div v-if="activeTab == '2'" class="repository-box">
          <div class="list-box">
            <div v-for="item in list" :key="item" class="list-item">
              <img class="left-icon" src="@renderer/assets/file-icon1.png" alt="" />
              <div class="center-box">
                <div class="title">新增《临床实验报告模板》</div>
                <div class="desc">新增了符合最新法规要求的临床试验报告模板，供所有项目参考使用</div>
                <div class="author author1">张医生·临床部·5天前更新</div>
              </div>
              <div class="time">18:00</div>
            </div>
          </div>
        </div>
        <div v-if="activeTab == '3'" class="repository-box">
          <div class="list-box">
            <div class="list-item">
              <img class="left-icon" src="@renderer/assets/inform-icon.png" alt="" />
              <div class="center-box">
                <div class="title">系统维护通知</div>
                <div class="desc desc1">
                  系统将于本周六晚上10点至周日凌晨2点进行维护，期间可能无法访问，请提前做好准备
                </div>
              </div>
              <div class="time">18:00</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
let fillColor = 'var(--default-font-color)'
let searchVal = ref('')
let tabs = ref([
  {
    id: '1',
    name: '知识库反馈'
  },
  {
    id: '2',
    name: '文件更新'
  },
  {
    id: '3',
    name: '系统通知'
  }
])
let activeTab = ref('1')
const tabHandle = (id) => {
  activeTab.value = id
}
let dateValue = ref([])
let datePickerTooltip = ref(null)
const changeDate = (val) => {
  console.log(val)
  datePickerTooltip.value.hide()
  if (val && val.length > 0) {
    fillColor = 'var(--el-color-primary)'
  } else {
    fillColor = 'var(--default-font-color)'
  }
}
const list = ref(Array(6))
onMounted(() => {})
</script>

<style scoped lang="scss">
.message-center-box {
  box-sizing: border-box;
  padding: 50px 20px 10px;
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  .square {
    width: 100%;
    max-width: 910px;
    height: 100%;
    margin: 0 auto;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .page-title {
      flex-shrink: 0;
      margin-bottom: 40px;
      font-size: 22px;
      font-weight: 500;
      color: var(--default-font-color);
      line-height: 30px;
    }
    .tabs {
      margin-bottom: 20px;
      flex-shrink: 0;
      width: 100%;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px 40px;
      .tab-item {
        flex-shrink: 0;
        font-size: 14px;
        color: #555555;
        line-height: 22px;
        cursor: pointer;
        transition: all 0.2s linear;
        &.active-tab {
          color: var(--el-color-primary);
          font-size: 16px;
          font-weight: 500;
        }
      }
    }
    .content-box {
      flex: 1;
      overflow: hidden;
      .repository-box {
        max-height: 100%;
        width: 100%;
        box-sizing: border-box;
        padding: 0 20px;
        background: #f9f9f9;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        .head {
          flex-shrink: 0;
          padding-top: 20px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .search-box {
            .search-input {
              :deep(.el-input__wrapper) {
                background: #fff;
                border-radius: 20px;
                width: 280px;
                padding-left: 20px;
                font-size: 14px;
                .el-input__inner {
                  color: var(--default-font-color);
                  height: 32px;
                }
              }
            }
          }
          .right-head-box {
            display: flex;
            align-items: center;
            gap: 10px;
            .filter-box {
              width: 70px;
              height: 26px;
              border-radius: 6px;
              border: 1px solid #efefef;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
              font-size: 12px;
              color: var(--default-font-color);
              cursor: pointer;
              &:active {
                opacity: 0.8;
              }
              &.active {
                color: var(--el-color-primary);
                border-color: var(--el-color-primary-light-8);
              }
              .filter-icon {
                width: 14px;
                height: 14px;
              }
            }
            .export-box {
              width: 76px;
              height: 26px;
              background: var(--el-color-primary);
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              color: #fff;
              cursor: pointer;
              &:active {
                opacity: 0.8;
              }
            }
          }
        }
        .list-box {
          overflow-y: auto;
          &::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          &::-webkit-scrollbar-thumb {
            border-radius: 2px;
            background-color: #dddcdc;
            &:hover {
              background-color: #909090;
            }
          }
          .list-item {
            padding: 20px 0;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            gap: 20px;
            &:last-child {
              border-bottom: none;
            }
            .left-icon {
              flex-shrink: 0;
              width: 20px;
              height: 20px;
            }
            .center-box {
              flex: 1;
              .title {
                margin-bottom: 4px;
                font-size: 14px;
                color: var(--default-font-color);
                line-height: 22px;
              }
              .desc {
                margin-bottom: 8px;
                font-size: 12px;
                color: #909090;
                line-height: 16px;
                &.desc1 {
                  margin-bottom: 0;
                }
              }
              .author {
                margin-bottom: 10px;
                font-size: 12px;
                color: #909090;
                line-height: 16px;
                &.author1 {
                  margin-bottom: 0;
                }
              }
              .btns {
                display: flex;
                gap: 10px;
                .btn {
                  box-sizing: border-box;
                  min-width: 76px;
                  padding: 5px 8px;
                  font-size: 12px;
                  text-align: center;
                  color: var(--el-color-primary);
                  line-height: 16px;
                  border-radius: 6px;
                  border: 1px solid var(--el-color-primary-light-8);
                  cursor: pointer;
                  &:active {
                    opacity: 0.8;
                  }
                  &.btn1 {
                    color: var(--default-font-color);
                    border-color: #efefef;
                  }
                  &.btn2 {
                    color: #909090;
                    border-color: #efefef;
                  }
                }
              }
            }
            .time {
              flex-shrink: 0;
              font-size: 12px;
              color: #909090;
              line-height: 22px;
            }
          }
        }
      }
    }
  }
}
</style>
