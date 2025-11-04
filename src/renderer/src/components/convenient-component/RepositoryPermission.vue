<template>
  <div class="repository-permission-box">
    <el-dialog
      v-model="repositoryVisible"
      draggable
      :close-on-click-modal="false"
      align-center
      destroy-on-close
      modal-class="repository-permission-box-dialog"
      width="390"
    >
      <template #header>
        <img
          class="dialog-header-del-icon"
          src="@renderer/assets/repository/qxsz-icon.png"
          alt=""
        />
        <div class="">权限设置</div>
      </template>
      <div class="form-box">
        <div class="type-list-box">
          <div class="list-item" @click="permissionChange('autoAddMember')">
            <div class="radio" :class="{ 'is-checked': permissionType === 'autoAddMember' }"></div>
            <div class="right">
              <div class="title">自动添加成员</div>
              <div class="desc">根据部门组织设置，自动将成员加入知识库</div>
            </div>
          </div>
          <div class="list-item" @click="permissionChange('private')">
            <div class="radio" :class="{ 'is-checked': permissionType === 'private' }"></div>
            <div class="right">
              <div class="title">转为私密</div>
              <div class="desc">知识库仅自己可见</div>
            </div>
          </div>
        </div>
        <div v-if="permissionType === 'autoAddMember'" class="handle-box">
          <div class="handle-item">
            <div class="label">成员内容权限</div>
            <el-select v-model="memberPrivileges" placeholder="请选择" style="width: 160px">
              <el-option
                v-for="item in permissionList"
                :key="item.action"
                :label="item.name"
                :value="item.action"
              />
            </el-select>
          </div>
          <div class="handle-item">
            <div class="label">成员加入需确认</div>
            <el-switch v-model="isConfirm" />
          </div>
          <div class="handle-item">
            <div class="label">自动添加范围</div>
            <div class="organization" @click="getOrganizationList">选择组织</div>
          </div>
        </div>
      </div>
      <el-dialog
        v-model="organizationVisible"
        draggable
        :close-on-click-modal="false"
        align-center
        destroy-on-close
        modal-class="repository-permission-box-dialog organization-dialog"
        width="790"
      >
        <template #header>
          <img
            class="dialog-header-del-icon"
            src="@renderer/assets/repository/qxsz-icon.png"
            alt=""
          />
          <div class="">选择组织</div>
        </template>
        <div class="organization-box">
          <DepartmentSelector />
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button class="cancel-btn" @click="organizationVisible = false">取消</el-button>
            <el-button class="confirm-btn" type="primary" @click="organizationVisible = false">
              确定
            </el-button>
          </div>
        </template>
      </el-dialog>
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
import { ref } from 'vue'
const repositoryVisible = defineModel({ type: Boolean })
const props = defineProps({
  type: {
    type: String,
    default: 'private'
  }
})
// 权限类型
let permissionList = ref([
  {
    name: '可查看、导出',
    action: 'public'
  },
  {
    name: '可查看、不可导出',
    action: 'private'
  },
  {
    name: '不可查看',
    action: 'cannotView'
  }
])
// 权限类型
let permissionType = ref(props.type)
// 成员权限
let memberPrivileges = ref('public')
const permissionChange = (type) => {
  permissionType.value = type
}
// 获取组织列表
const getOrganizationList = () => {
  organizationVisible.value = true
}
// 成员加入需确认
let isConfirm = ref(true)
// 组织权限选择
let organizationVisible = ref(false)
let formRef = ref(null)
const form = ref({
  type: props.type
})
// 提交
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 提交表单数据
      console.log('表单数据:', form.value)
    } else {
      console.log('表单验证失败')
    }
  })
}
</script>

<style scoped lang="scss">
.repository-permission-box {
  :deep(.repository-permission-box-dialog) {
    &.organization-dialog {
      .el-dialog {
        height: 486px;
        .organization-box {
          display: flex;
          align-items: flex-start;
          padding: 20px 0px;
          height: 360px;
          background: #f9f9f9;
          border-radius: 10px;
          .optional-box {
            padding: 0 85px 0 40px;
            flex-shrink: 0;
            width: 50%;
            height: 100%;
            border-right: 1px solid #efefef;
          }
          .selected-box {
            padding: 0 85px 0 40px;
            flex-shrink: 0;
            height: 100%;
            width: calc(50% - 1px);
          }
          .hd-label {
            font-size: 14px;
            color: #909090;
            line-height: 16px;
          }
        }
      }
    }
    .el-dialog {
      padding: 17px 20px 14px;
      .el-dialog__header {
        padding-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        font-size: 16px;
        color: var(--default-font-color);
        line-height: 22px;

        .dialog-header-del-icon {
          width: 20px;
          height: 20px;
        }
      }

      .el-dialog__body {
        font-size: 14px;
        color: var(--default-font-color);
        line-height: 22px;
        overflow: hidden;

        .form-box {
          box-sizing: border-box;
          // height: 100%;
          // overflow-y: auto;
          // color: var(--default-font-color);
          // &::-webkit-scrollbar {
          //   width: 4px;
          //   height: 4px;
          // }

          // &::-webkit-scrollbar-thumb {
          //   border-radius: 2px;
          //   background-color: #dddcdc;

          //   &:hover {
          //     background-color: #909090;
          //   }
          // }
          .type-list-box {
            padding: 0 19px;
            background: #f9f9f9;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 10px;
            .list-item {
              padding: 16px 0;
              display: flex;
              align-items: center;
              overflow: hidden;
              gap: 10px;
              border-bottom: 1px solid #efefef;
              &:last-of-type {
                border-bottom: none;
              }
              .radio {
                flex-shrink: 0;
                display: block;
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: transparent;
                border: 1px solid #ccc;

                &.is-checked {
                  background: #fff;
                  border: 1px solid var(--el-color-primary);
                  &::after {
                    content: '';
                    display: block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    border: 2px solid #fff;
                    background: var(--el-color-primary);
                  }
                }
              }
              .right {
                flex: 1;
                .title {
                  margin-bottom: 8px;
                  font-size: 14px;
                  color: var(--default-font-color);
                  line-height: 20px;
                }
                .desc {
                  font-size: 12px;
                  color: #909090;
                  line-height: 16px;
                }
              }
            }
          }
          .handle-box {
            padding: 0 19px;
            background: #f9f9f9;
            border-radius: 8px;
            overflow: hidden;
            .el-select__wrapper {
              background-color: #eaeaea !important;
              border-radius: 4px !important;
              box-shadow: 0 0 0 1px #f9f9f9 inset;
              &.is-focus {
                box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
              }
            }
            .handle-item {
              padding: 16px 0;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #efefef;
              &:last-of-type {
                border-bottom: none;
              }
              .label {
                flex-shrink: 0;
                font-size: 14px;
                color: var(--default-font-color);
                line-height: 20px;
              }
              .organization {
                width: 76px;
                height: 26px;
                background: #eaeaea;
                border-radius: 4px;
                font-size: 14px;
                color: var(--default-font-color);
                text-align: center;
                line-height: 26px;
                transition: all 0.2s linear;
                cursor: pointer;
                &:active {
                  color: #a8abb2;
                }
              }
            }
          }
        }
      }
      .el-dialog__footer {
        .dialog-footer {
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
