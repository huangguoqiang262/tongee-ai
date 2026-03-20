<template>
  <div class="feedback-center-box">
    <div class="feedback-center">
      <div class="square">
        <div class="page-title-box">
          <div class="page-title">系统反馈</div>
        </div>
        <!-- <div class="tabs">
          <el-radio-group v-model="feedbackData.sug_or_pb">
            <el-radio v-for="tab in tabs" :key="tab.id" :value="tab.id" size="large">{{
              tab.name
            }}</el-radio>
          </el-radio-group>
        </div> -->
        <div class="content-box">
          <el-form
            ref="feedbackForm"
            label-position="top"
            hide-required-asterisk
            :model="feedbackData"
            :rules="feedbackRules"
            class="feedback-form"
            @submit.prevent
          >
            <!-- 反馈分类 -->
            <el-form-item label="反馈类型" prop="sug_or_pb">
              <el-radio-group v-model="feedbackData.sug_or_pb" size="large">
                <el-radio v-for="tab in tabs" :key="tab.id" :value="tab.id" size="large">{{
                  tab.name
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <!-- 反馈分类 -->
            <el-form-item label="反馈分类" prop="type">
              <el-cascader
                v-model="feedbackData.type"
                :options="typeTreeList"
                :props="{ emitPath: false, label: 'name', value: 'id' }"
                size="large"
                class="type-cascader"
                placeholder="请选择反馈分类"
                clearable
              />
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
                  <el-button
                    v-if="!activeHistoryItem?.id"
                    class="confirm-btn"
                    type="primary"
                    @click="submitFeedback"
                    >提交反馈</el-button
                  >
                  <el-button v-else class="cancel-btn" @click="resetFeedback">重置</el-button>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, nextTick } from 'vue'
import { useUserStore } from '@renderer/stores/user'
import { system_feedback_type, system_feedback_add } from '@renderer/api/feedback'
let tabs = ref([
  {
    id: '2',
    name: '建议',
    icon: 'problemIcon',
    des: '提供文档缺少、改进或新想法'
  },
  {
    id: '1',
    name: '问题',
    icon: 'suggestionIcon',
    des: '报告文档中错误的内容等问题'
  }
])
let feedbackForm = ref(null)
let defaultConfig = {
  excludeKeys: [
    'insertImage',
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
let activeHistoryItem = ref({})
let feedbackData = ref({
  content: '',
  type: undefined,
  sug_or_pb: '2'
})
let editorRef = shallowRef(null)
const userStore = useUserStore()
let editorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      server: import.meta.env.VITE_API_BASE_URL + '/api/common/upload',
      headers: {
        Authorization: userStore.token,
        uniacid: userStore.uniacid
      },
      fieldName: 'file[]',
      meta: {
        uniacid: userStore.uniacid
      },
      allowedFileTypes: ['.png', '.jpg', '.jpeg', '.gif'],
      customInsert(res, insertFn) {
        insertFn(res.data[0].url, res.data[0].file_type || '', res.data[0].url || '')
      }
    }
  }
}
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
  sug_or_pb: [{ required: true, message: '请选择反馈类型', trigger: 'blur' }]
})
// 提交
const submitFeedback = () => {
  feedbackForm.value.validate((valid) => {
    if (valid) {
      system_feedback_add(feedbackData.value).then(() => {
        // eslint-disable-next-line no-undef
        ElMessage.primary('提交成功')
        feedbackForm.value.resetFields()
      })
    }
  })
}
const handleCreated = (editor) => {
  editorRef.value = editor
  editorRef.value.clear()
  // editorRef.value.setContent(feedbackData.value.content)
}
// 反馈类型树
let typeTreeList = ref([])
const getTypeTreeList = () => {
  system_feedback_type().then((res) => {
    typeTreeList.value = res.data
  })
}
const resetFeedback = () => {
  feedbackForm.value.resetFields()
  activeHistoryItem.value = {}
  feedbackData.value = {
    content: '',
    type: undefined,
    sug_or_pb: '2'
  }
  nextTick(() => {
    editorRef.value.enable()
  })
}
onMounted(() => {
  getTypeTreeList()
})
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
      width: 78%;
      max-width: 910px;
      height: 100%;
      margin: 0 auto;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .page-title-box {
        flex-shrink: 0;
        margin-bottom: 30px;
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

      .content-box {
        flex: 1;
        overflow: hidden;
        .feedback-form {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          :deep(.type-cascader) {
            width: 100%;
            .el-input__wrapper {
              background-color: #f9f9f9;
              border-radius: 6px !important;
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
            border-radius: 6px;
            overflow: hidden;
            .w-e-text-placeholder {
              top: 10px;
            }
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
              &:hover {
                background: #d8d8d8;
              }
            }
          }
        }
      }
    }
  }
}
</style>
