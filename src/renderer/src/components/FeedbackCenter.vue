<template>
  <div class="feedback-center-box">
    <div class="feedback-center">
      <div class="square">
        <div class="page-title-box">
          <div class="page-title">反馈中心</div>
        </div>
        <div class="tabs">
          <div
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-item"
            :class="{ 'active-tab': tab.id == activeTab }"
            @click="tabHandle(tab.id)"
          >
            <img class="icon" :src="tab.icon" alt="" />
            <div class="tab-right">
              <div class="title">{{ tab.name }}</div>
              <div class="desc">{{ tab.des }}</div>
            </div>
          </div>
        </div>
        <div class="content-box">
          <el-form
            ref="feedbackForm"
            label-position="top"
            hide-required-asterisk
            :model="feedbackData"
            :rules="feedbackRules"
            class="feedback-form"
          >
            <el-form-item label="文档类别" prop="doc_type">
              <el-select v-model="feedbackData.doc_type" size="large" placeholder="请选择文档类别">
                <el-option label="问题反馈" value="problem" />
                <el-option label="建议反馈" value="suggestion" />
              </el-select>
            </el-form-item>
            <!-- 反馈分类 -->
            <el-form-item label="反馈分类" prop="type">
              <el-select v-model="feedbackData.type" size="large" placeholder="请选择反馈分类">
                <el-option label="反馈分类" value="problem" />
                <el-option label="反馈分类" value="suggestion" />
              </el-select>
            </el-form-item>
            <el-form-item class="editor-container-box" label="反馈内容" prop="content">
              <div class="editor-container">
                <Toolbar :default-config="defaultConfig" :editor="editorRef" mode="default" />
                <Editor
                  v-model="feedbackData.content"
                  class="editor-content"
                  :default-config="editorConfig"
                  mode="default"
                  @on-created="handleCreated"
                />
                <div class="footer-btns">
                  <el-button class="cancel-btn">取消</el-button>
                  <el-button class="confirm-btn" type="primary" @click="submitFeedback"
                    >提交反馈</el-button
                  >
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <div class="history-box">
      <div class="history-hd">反馈历史</div>
      <div class="list-box">
        <div class="hisrory-item">
          <div class="status">建议</div>
          <div class="title">建议在质量体系文档中增加审核流程可视化图表</div>
          <div class="time">2023-08-10</div>
        </div>
        <div class="hisrory-item">
          <div class="status">建议</div>
          <div class="title">
            建议在质量体系文档中增加审核流程可视化图表建议在质量体系文档中增加审核流程可视化图表
          </div>
          <div class="time">2023-08-10</div>
        </div>
        <div class="hisrory-item">
          <div class="status status-err">问题</div>
          <div class="title">建议在质量体系文档中增加审核流程可视化图表</div>
          <div class="time">2023-08-10</div>
        </div>
        <div class="hisrory-item">
          <div class="status">建议</div>
          <div class="title">建议在质量体系文档中增加审核流程可视化图表</div>
          <div class="time">2023-08-10</div>
        </div>
        <div class="hisrory-item">
          <div class="status">建议</div>
          <div class="title">
            建议在质量体系文档中增加审核流程可视化图表建议在质量体系文档中增加审核流程可视化图表
          </div>
          <div class="time">2023-08-10</div>
        </div>
        <div class="hisrory-item">
          <div class="status status-err">问题</div>
          <div class="title">建议在质量体系文档中增加审核流程可视化图表</div>
          <div class="time">2023-08-10</div>
        </div>
        <div class="hisrory-item">
          <div class="status">建议</div>
          <div class="title">建议在质量体系文档中增加审核流程可视化图表</div>
          <div class="time">2023-08-10</div>
        </div>
        <div class="hisrory-item">
          <div class="status">建议</div>
          <div class="title">
            建议在质量体系文档中增加审核流程可视化图表建议在质量体系文档中增加审核流程可视化图表
          </div>
          <div class="time">2023-08-10</div>
        </div>
        <div class="hisrory-item">
          <div class="status status-err">问题</div>
          <div class="title">建议在质量体系文档中增加审核流程可视化图表</div>
          <div class="time">2023-08-10</div>
        </div>
        <div class="hisrory-item">
          <div class="status">建议</div>
          <div class="title">建议在质量体系文档中增加审核流程可视化图表</div>
          <div class="time">2023-08-10</div>
        </div>
        <div class="hisrory-item">
          <div class="status">建议</div>
          <div class="title">
            建议在质量体系文档中增加审核流程可视化图表建议在质量体系文档中增加审核流程可视化图表
          </div>
          <div class="time">2023-08-10</div>
        </div>
        <div class="hisrory-item">
          <div class="status status-err">问题</div>
          <div class="title">建议在质量体系文档中增加审核流程可视化图表</div>
          <div class="time">2023-08-10</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted } from 'vue'
import problemIcon from '@renderer/assets/feedback/problem-icon.png'
import suggestionIcon from '@renderer/assets/feedback/suggestion-icon.png'
let tabs = ref([
  {
    id: '1',
    name: '建议',
    icon: problemIcon,
    des: '提供文档缺少、改进或新想法'
  },
  {
    id: '2',
    name: '问题',
    icon: suggestionIcon,
    des: '报告文档中错误的内容等问题'
  }
])
let activeTab = ref('1')
const tabHandle = (id) => {
  activeTab.value = id
}
let feedbackForm = ref(null)
let defaultConfig = {
  excludeKeys: [
    'group-image',
    'group-video',
    'insertVideo',
    'unFullScreen',
    'fullScreen',
    'insertLink',
    'todo',
    'codeBlock',
    'emotion',
    'group-indent'
  ]
}
let feedbackData = ref({
  content: '',
  type: '',
  doc_type: ''
})
let editorRef = shallowRef(null)
let editorConfig = { placeholder: '请输入内容...' }
let isEmpty = (rule, value, callback) => {
  // 匹配<p><br></p>
  let reg = /^<p><br><\/p>$/
  if (value.trim() === '') {
    callback('请输入反馈内容')
  } else if (reg.test(value)) {
    callback('请输入反馈内容')
  } else {
    callback()
  }
}
let feedbackRules = ref({
  content: [
    { required: true, message: '请输入反馈内容', trigger: 'blur' },
    { validator: isEmpty, trigger: 'blur' }
  ],
  type: [{ required: true, message: '请选择反馈分类', trigger: 'blur' }],
  doc_type: [{ required: true, message: '请选择文档类别', trigger: 'blur' }]
})
// 提交
const submitFeedback = () => {
  feedbackForm.value.validate((valid, errors) => {
    if (valid) {
      console.log('提交反馈', feedbackData.value)
    } else {
      console.log('验证失败', errors)
      console.log(feedbackData.value)
    }
  })
}
const handleCreated = (editor) => {
  editorRef.value = editor
  editorRef.value.clear()
  console.log(editorRef.value)

  // editorRef.value.setContent(feedbackData.value.content)
}
onMounted(() => {})
</script>

<style scoped lang="scss">
.feedback-center-box {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  .feedback-center {
    box-sizing: border-box;
    padding: 50px 20px 10px;
    flex: 1;
    height: 100%;
    background-color: #fff;
    border-radius: 12px;
    overflow: hidden;

    .square {
      width: 67%;
      max-width: 910px;
      height: 100%;
      margin: 0 auto;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .page-title-box {
        flex-shrink: 0;
        margin-bottom: 40px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .page-title {
          font-size: 22px;
          font-weight: 500;
          color: var(--default-font-color);
          line-height: 30px;
        }
      }

      .tabs {
        margin-bottom: 20px;
        flex-shrink: 0;
        width: 100%;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;

        .tab-item {
          flex-shrink: 0;
          width: calc(50% - 10px);
          height: 90px;
          cursor: pointer;
          transition: all 0.2s linear;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          border-radius: 12px;
          border: 1px solid #d8d8d8;
          .icon {
            flex-shrink: 0;
            width: 26px;
            height: 26px;
          }
          .tab-right {
            .title {
              margin-bottom: 4px;
              font-size: 14px;
              font-weight: 500;
              color: var(--default-font-color);
              line-height: 22px;
            }
            .desc {
              font-size: 12px;
              color: #909090;
              line-height: 22px;
            }
          }

          &.active-tab {
            border-color: var(--el-color-primary);
            background: color-mix(in srgb, var(--el-color-primary) 5%, #ffffff);
          }
        }
      }

      .content-box {
        flex: 1;
        overflow: hidden;
        .feedback-form {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          :deep(.el-select) {
            .el-select__wrapper {
              background-color: #f9f9f9;
              border-radius: 6px !important;
              // .el-select__placeholder {
              //   color: var(--el-text-color-placeholder);
              // }
              // .el-select__selected-item {
              //   color: var(--default-font-color);
              // }
            }
          }
        }
        .editor-container-box {
          margin-bottom: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          :deep(.el-form-item__content) {
            padding-bottom: 20px;
            flex: 1;
            flex-direction: column;
            overflow: hidden;
            .el-form-item__error {
              top: calc(100% - 18px);
            }
          }
        }
        :deep(.editor-container) {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 0 10px;
          background: #f9f9f9;
          border-radius: 8px;
          border: 1px solid #d8d8d8;
          overflow: hidden;
          .w-e-toolbar {
            flex-shrink: 0;
            background: transparent !important;
          }
          .editor-content {
            flex: 1;
            background: #fff !important;
            overflow: hidden;
          }
          .footer-btns {
            width: 100%;
            height: 75px;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            .cancel-btn,
            .confirm-btn {
              height: 36px;
              width: 110px;
              border-radius: 8px;
              border: none;
              font-size: 14px;
            }
            .cancel-btn {
              background: #efefef;
              color: var(--default-font-color);
            }
          }
        }
      }
    }
  }
  .history-box {
    flex-shrink: 0;
    box-sizing: border-box;
    padding: 20px 10px;
    width: 26%;
    max-width: 426px;
    height: 100%;
    background-color: #fff;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .history-hd {
      flex-shrink: 0;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 20px;
      margin-bottom: 22px;
    }
    .list-box {
      flex: 1;
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
      .hisrory-item {
        margin-bottom: 10px;
        padding: 14px 10px;
        background: #f9f9f9;
        border-radius: 4px;
        &:last-of-type {
          margin-bottom: 0;
        }
        .status {
          margin-bottom: 10px;
          width: 48px;
          height: 22px;
          background: var(--el-color-primary-light-9);
          border-radius: 2px;
          line-height: 22px;
          font-size: 14px;
          text-align: center;
          color: var(--el-color-primary);
        }
        .status-err {
          background: var(--el-color-danger-light-9);
          color: var(--el-color-danger);
        }
        .title {
          margin-bottom: 10px;
          font-size: 14px;
          color: var(--default-font-color);
          line-height: 20px;
        }
        .time {
          font-size: 12px;
          color: #909090;
          line-height: 16px;
        }
      }
    }
  }
}
</style>
