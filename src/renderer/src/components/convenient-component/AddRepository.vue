<template>
  <div class="add-repository-box">
    <el-dialog
      v-model="repositoryVisible"
      draggable
      :close-on-click-modal="false"
      align-center
      destroy-on-close
      modal-class="add-repository-box-dialog"
      width="470"
    >
      <template #header>
        <img
          class="dialog-header-del-icon"
          :src="props.type === 'personage' ? personageRepositoryIcon : commonRepositoryIcon"
          alt=""
        />
        <div class="">
          {{ props.submitType === 'create' ? '添加知识库' : '编辑知识库' }}
        </div>
      </template>
      <div class="form-box">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="60px"
          label-position="left"
          require-asterisk-position="right"
          @submit.prevent
        >
          <el-form-item v-if="props.type == 'common'" label="类型" prop="type_id">
            <el-select v-model="form.type_id" size="large" placeholder="请选择类型">
              <el-option
                v-for="item in knowTypes"
                :key="item.id"
                :label="item.title"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="名称" prop="title">
            <el-input v-model="form.title" size="large" placeholder="请输入知识库名称" />
          </el-form-item>
          <!-- 封面 -->
          <el-form-item label="封面">
            <el-upload
              class="cover-uploader"
              :action="uploadUrl"
              :show-file-list="false"
              accept=".jpg,.jpeg,.png"
              name="file[]"
              :data="{ uniacid: uniacid }"
              :headers="{ Authorization: token }"
              :on-success="handleAvatarSuccess"
            >
              <div class="cover-box">
                <img
                  class="edit-cover-icon"
                  src="@renderer/assets/repository/edit-cover-icon.png"
                  alt=""
                />
                <img v-if="form.pic_url" :src="form.pic_url" class="cover" />
                <defaultCoverSvg v-else class="cover" />
              </div>
            </el-upload>
          </el-form-item>
          <el-form-item label="描述">
            <el-input
              v-model="form.desc"
              type="textarea"
              size="large"
              resize="none"
              placeholder="请对知识库简要描述"
            />
          </el-form-item>
        </el-form>
        <!-- 推荐问题 -->
        <div class="recommendQuestions-box">
          <div class="recommendQuestions-hd">
            <div class="label-title">设置推荐问题</div>
            <div
              v-if="form.recommendQuestions.length < 5"
              class="add-btn"
              @click="addRecommendQuestion"
            >
              添加问题
            </div>
          </div>
          <div class="recommendQuestions-list">
            <div
              v-for="(item, index) in form.recommendQuestions"
              :key="index"
              class="question-input-box"
            >
              <img
                v-if="form.recommendQuestions.length > 1"
                src="@renderer/assets/repository/del-icon.png"
                alt=""
                class="remove-icon"
                @click.stop="removeRecommendQuestion(index)"
              />
              <el-input v-model="item.question" size="large" placeholder="请设置推荐问题" />
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="repositoryVisible = false">取消</el-button>
          <el-button class="confirm-btn" type="primary" @click="submitForm"> 添加 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import cloneDeep from 'lodash.clonedeep'
import { useUserStore } from '@renderer/stores/user'
import { ref, watch, onMounted, computed } from 'vue'
import { know_types } from '@renderer/api/repository'
import defaultCoverSvg from '@renderer/assets/repository/default-cover.svg'
import personageRepositoryIcon from '@renderer/assets/repository/personage-repository-icon.png'
import commonRepositoryIcon from '@renderer/assets/repository/common-repository-icon.png'
const props = defineProps({
  type: {
    type: String,
    default: 'common'
  },
  submitType: {
    type: String,
    default: 'create'
  },
  repository: {
    type: Object,
    default: () => ({})
  }
})
const emits = defineEmits(['submitRepository'])
let uniacid = computed(() => useUserStore().uniacid)
let token = computed(() => useUserStore().token)
let formRef = ref(null)
let uploadUrl = import.meta.env.VITE_API_BASE_URL + '/api/common/upload'
let repositoryVisible = defineModel({ type: Boolean })
const knowTypes = ref([])
const getKnowTypes = () => {
  know_types().then((res) => {
    if (res.code == 200) {
      knowTypes.value = res.data
    }
  })
}
onMounted(() => {
  getKnowTypes()
})
watch(repositoryVisible, (newVal) => {
  if (newVal) {
    const deepRepository = cloneDeep(props.repository)
    if (deepRepository && props.submitType != 'create' && Object.keys(deepRepository).length) {
      form.value = {
        type_id: deepRepository.type_id,
        title: deepRepository.title,
        pic_url: deepRepository.picurl,
        desc: deepRepository.desc,
        recommendQuestions: [
          {
            question: ''
          },
          {
            question: ''
          },
          {
            question: ''
          },
          {
            question: ''
          },
          {
            question: ''
          }
        ]
      }
      if (deepRepository.questions.length) {
        form.value.recommendQuestions = deepRepository.questions.map((item) => ({
          question: item
        }))
      }
    } else {
      form.value = {
        type_id: '',
        title: '',
        pic_url: '',
        desc: '',
        recommendQuestions: [
          {
            question: ''
          },
          {
            question: ''
          },
          {
            question: ''
          },
          {
            question: ''
          },
          {
            question: ''
          }
        ]
      }
    }
  }
})
const form = ref({
  type_id: '',
  title: '',
  pic_url: '',
  desc: '',
  recommendQuestions: [
    {
      question: ''
    },
    {
      question: ''
    },
    {
      question: ''
    },
    {
      question: ''
    },
    {
      question: ''
    }
  ]
})
// 添加推荐问题
const addRecommendQuestion = () => {
  form.value.recommendQuestions.push({
    question: ''
  })
}
// 删除推荐问题
const removeRecommendQuestion = (index) => {
  form.value.recommendQuestions.splice(index, 1)
}
const rules = ref({
  type_id: [{ required: true, message: '请选择类型', trigger: 'blur' }],
  title: [{ required: true, message: '请输入知识库名称', trigger: 'blur' }],
  desc: [{ required: true, message: '请对知识库简要描述', trigger: 'blur' }]
  // recommendQuestions: [{ required: true, message: '请设置推荐问题', trigger: 'blur' }]
})
const handleAvatarSuccess = (res) => {
  form.value.pic_url = res.data[0].url
}
// 提交
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      var submitData = {
        ...form.value,
        desc: form.value.desc.trim(),
        question: form.value.recommendQuestions
          .map((item) => item.question)
          .filter((item) => item.trim())
      }
      emits('submitRepository', submitData)
    } else {
      console.log('表单验证失败')
    }
  })
}
</script>

<style scoped lang="scss">
.add-repository-box {
  :deep(.add-repository-box-dialog) {
    .el-dialog {
      padding: 17px 10px 14px;
      height: 736px;
      display: flex;
      flex-direction: column;

      .el-dialog__header {
        flex-shrink: 0;
        padding-left: 10px;
        padding-bottom: 32px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        font-size: 14px;
        color: var(--default-font-color);
        line-height: 22px;

        .dialog-header-del-icon {
          width: 16px;
          height: 16px;
        }
      }

      .el-dialog__body {
        flex: 1;
        font-size: 14px;
        color: var(--default-font-color);
        line-height: 22px;
        overflow: hidden;

        .form-box {
          box-sizing: border-box;
          padding: 0 30px;
          height: 100%;
          overflow-y: auto;
          color: var(--default-font-color);
          .el-form-item {
            margin-bottom: 16px;
          }
          .el-form-item__label {
            color: var(--default-font-color);
          }
          .el-input__wrapper,
          .el-select__wrapper {
            background-color: #f9f9f9 !important;
            border-radius: 6px !important;
            box-shadow: 0 0 0 1px #f9f9f9 inset;
            // .el-select__placeholder {
            //   color: var(--el-text-color-placeholder);
            // }
            // .el-select__selected-item {
            //   color: var(--default-font-color);
            // }
            &.is-focus {
              box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
            }
          }
          .el-textarea__inner {
            background: #f9f9f9;
            box-shadow: none;
            font-size: 14px;
            height: 90px;
            color: var(--default-font-color);
            border-radius: 6px;

            &.is-focus {
              box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
            }
          }
          .recommendQuestions-box {
            .recommendQuestions-hd {
              margin-bottom: 16px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              .label-title {
                font-size: 14px;
                color: var(--default-font-color);
                line-height: 20px;
              }
              .add-btn {
                font-size: 14px;
                color: var(--el-color-primary);
                line-height: 20px;
                cursor: pointer;
              }
            }
            .recommendQuestions-list {
              display: flex;
              flex-direction: column;
              gap: 10px;
              .question-input-box {
                position: relative;
                .remove-icon {
                  display: none;
                  position: absolute;
                  top: 50%;
                  right: 10px;
                  width: 16px;
                  height: 16px;
                  transform: translateY(-50%);
                  transition: all 0.2s;
                  z-index: 1;
                  cursor: pointer;
                }
                &:hover {
                  .remove-icon {
                    display: block;
                  }
                }
              }
            }
          }
        }

        .cover-uploader {
          width: 90px;
          height: 90px;
          .el-upload {
            box-sizing: border-box;
            border: 1px dashed transparent;
            border-radius: 10px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: var(--el-transition-duration-fast);
            .cover-box {
              position: relative;
              .edit-cover-icon {
                display: block;
                position: absolute;
                bottom: 4px;
                right: 4px;
                width: 24px;
                height: 24px;
              }
              .cover {
                display: block;
                width: 90px;
                height: 90px;
                border-radius: 12px;
                object-fit: cover;
                color: var(--el-color-primary);
              }
            }
            &:hover {
              border-color: var(--el-color-primary);
            }
          }
        }
      }
      .el-dialog__footer {
        padding-top: 12px;
        .dialog-footer {
          padding: 0 30px;
          flex-shrink: 0;
          .cancel-btn,
          .confirm-btn {
            height: 36px;
            width: 80px;
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
</style>
