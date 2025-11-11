<template>
  <div class="Recycled-box">
    <!-- 账号设置 -->
    <div v-if="activeTab == 'account'" class="square">
      <div class="page-title-box">
        <div class="page-title">账号设置</div>
      </div>
      <div class="content-box">
        <div class="account-box" @click="sonClick('person')">
          <div class="account-left">
            <img class="buddha" :src="userInfo.avatar || defaultAvatar" alt="" />
            <div class="name">{{ userInfo.name }}</div>
          </div>
          <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" />
        </div>
        <div class="general-title">通用设置</div>
        <div class="handle-box">
          <div class="handle-item">
            <div class="label">主题色配置</div>
            <!-- <el-select v-model="memberPrivileges" placeholder="请选择" style="width: 160px">
              <el-option
                v-for="item in appearanceList"
                :key="item.action"
                :label="item.name"
                :value="item.action"
              />
            </el-select> -->
            <theme-picker></theme-picker>
          </div>
          <div class="handle-item" @click="sonClick('paddle')">
            <div class="label">ai划词工具栏</div>
            <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" />
          </div>
          <div class="handle-item">
            <div class="label">首选大模型</div>
            <el-select v-model="memberPrivileges" placeholder="请选择" style="width: 160px">
              <el-option
                v-for="item in appearanceList"
                :key="item.action"
                :label="item.name"
                :value="item.action"
              />
            </el-select>
          </div>
          <div class="handle-item" @click="manualClick('manual')">
            <div class="label">知识库使用手册</div>
            <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" />
          </div>
          <div class="handle-item" @click="sonClick('assist')">
            <div class="label">帮助与反馈</div>
            <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" />
          </div>
        </div>
      </div>
    </div>
    <!-- 个人设置 -->
    <div v-if="activeTab == 'person'" class="square">
      <div class="retreat-box" @click="tabHandle()">
        <img class="icon" src="@renderer/assets/down-icon.png" alt="" />
      </div>
      <div class="page-title-box">
        <div class="page-title">个人设置</div>
      </div>
      <div class="content-box">
        <div class="handle-box">
          <div class="handle-item">
            <div class="label">头像</div>
            <img class="buddha" :src="userInfo.avatar || defaultAvatar" alt="" />
          </div>
          <!-- <div class="handle-item">
            <div class="label">昵称</div>
            <div class="item-right">
              <div>昵称</div>
              <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" />
            </div>
          </div> -->
          <div class="handle-item">
            <div class="label">姓名</div>
            <div class="item-right">
              <div>{{ userInfo.name }}</div>
            </div>
            <!-- <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" /> -->
          </div>
          <div class="handle-item">
            <div class="label">部门</div>
            <div class="item-right">
              <template v-if="userInfo?.organs">
                <el-popover title="" popper-class="more-position-popover" placement="bottom-end">
                  <template #reference>
                    <div>
                      {{ userInfo?.organs?.[0]?.hierarchy_names || '--' }}
                    </div>
                  </template>
                  <div class="more-position-box">
                    <span v-for="item in userInfo?.organs" :key="item" class="more-position">{{
                      item.hierarchy_names
                    }}</span>
                  </div>
                </el-popover>
              </template>
            </div>
            <!-- <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" /> -->
          </div>
          <div class="handle-item">
            <div class="label">职位</div>
            <div class="item-right">
              <div>{{ userInfo?.position || '--' }}</div>
            </div>
            <!-- <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" /> -->
          </div>
          <div class="handle-item">
            <div class="label">手机号</div>
            <div class="item-right">
              <div>{{ userInfo?.mobile || '--' }}</div>
            </div>
            <!-- <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" /> -->
          </div>
        </div>
        <div class="handle-box" style="margin-top: 20px">
          <div class="handle-item">
            <div class="label">登录密码</div>
            <div class="item-right">
              <div
                style="color: var(--el-color-primary); cursor: pointer"
                @click="beforeClearChange()"
              >
                修改密码
              </div>
            </div>
            <!-- <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" /> -->
          </div>
        </div>
        <div class="quit-box" @click="quitLogin">退出登录</div>
      </div>
    </div>
    <!-- 帮助与反馈 -->
    <div v-if="activeTab == 'assist'" class="square">
      <div class="retreat-box" @click="tabHandle()">
        <img class="icon" src="@renderer/assets/down-icon.png" alt="" />
      </div>
      <div class="page-title-box">
        <div class="page-title">帮助与反馈</div>
        <div class="export-box" @click="beforeClearChange">我要反馈</div>
      </div>
      <div class="content-box" style="border-top: 1px solid #efefef">
        <div class="assist-list">
          <div class="assist-item">
            <div class="disc"></div>
            我创建的知识库如何删除？
          </div>
          <div class="assist-item">
            <div class="disc"></div>
            我创建的知识库如何删除？
          </div>
        </div>
      </div>
      <div class="quiz-box">
        <el-input
          v-model="quizContent"
          class="quiz-input"
          size="large"
          placeholder="请描述一下你遇到的问题"
        />
      </div>
    </div>
    <!-- ai划词工具栏 -->
    <div v-if="activeTab == 'paddle'" class="square">
      <div class="retreat-box" @click="tabHandle()">
        <img class="icon" src="@renderer/assets/down-icon.png" alt="" />
      </div>
      <div class="page-title-box">
        <div class="page-title">AI划词工具栏</div>
      </div>
      <div class="content-box">
        <div class="paddle-box">
          <div class="operate">
            <div v-for="(item, index) in operateList" :key="index" class="operate-item">
              <img class="item-icon" :src="item.icon" alt="" />
              <div class="item-title">{{ item.name }}</div>
            </div>
          </div>
          <div class="examples">
            作为独立部署数据库并以知识库为核心的AI工作台，<span>糖源AI Tongee Origin AI</span>
            集读、搜、写一体，提升办公、学习效率
          </div>
          <div class="bottom-operate">
            <div class="label">当选中文本时显示工具栏</div>
            <el-select
              v-model="toolbarShow"
              placeholder="请选择"
              style="width: 160px"
              @change="updateToolbarShow"
            >
              <el-option
                v-for="item in toolbarList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
      </div>
    </div>
    <!-- 修改密码弹窗 -->
    <el-dialog
      v-model="passwordVisible"
      draggable
      align-center
      modal-class="clear-recycled-dialog"
      width="390"
    >
      <template #header>
        <img
          class="dialog-header-del-icon"
          src="@renderer/assets/contextMenu/edit-icon.png"
          alt=""
        />
        <div class="title">修改密码</div>
      </template>
      <el-form
        ref="passwordFormRef"
        label-position="top"
        :model="passwordForm"
        :rules="passwordRules"
      >
        <el-form-item prop="password" label="新密码">
          <el-input
            v-model="passwordForm.password"
            class="book-input"
            type="password"
            size="large"
            show-password
            placeholder="设置您的新密码"
          />
        </el-form-item>
        <el-form-item prop="repeatPassword" label="确认密码">
          <el-input
            v-model="passwordForm.repeatPassword"
            class="book-input"
            type="password"
            size="large"
            show-password
            placeholder="再次输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="passwordVisible = false">取消</el-button>
          <el-button
            class="confirm-btn"
            type="primary"
            @click="submitpasswordForm(passwordFormRef)"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useCheckLogin, useUserInfo } from '@renderer/hooks/checkLogin'
import { edit_user, logout } from '@renderer/api/user'
import { useUserStore, useToolBarStore } from '@renderer/stores/user'
import unscrambleIcon from '@renderer/assets/settings/unscramble-icon.png'
import translateIcon from '@renderer/assets/settings/translate-icon.png'
import notebookIcon from '@renderer/assets/settings/notebook-icon.png'
import copyIcon from '@renderer/assets/settings/copy-icon.png'
import defaultAvatar from '@renderer/assets/default-avatar.png'
const userStore = useUserStore()
const userInfo = useUserInfo()
let memberPrivileges = ref('')
let toolbarShow = ref(useToolBarStore().toolbarShow)
// 工具栏选择
let toolbarList = ref([
  {
    name: '开启',
    value: true
  },
  {
    name: '关闭',
    value: false
  }
])
const updateToolbarShow = (val) => {
  useToolBarStore().toolbarShow = val
}
// 外观选择
let appearanceList = ref([
  {
    name: '跟随系统',
    action: 'public'
  }
])
const addNewTab = inject('addNewTab')
let activeTab = ref('account')

const tabHandle = () => {
  activeTab.value = 'account'
}
// 修改密码
let passwordVisible = ref(false)
let beforeClearChange = () => {
  passwordVisible.value = true
  passwordFormRef.value?.resetFields()
}
let passwordFormRef = ref(null)
let passwordForm = ref({
  password: '',
  repeatPassword: ''
})
let passwordRules = ref({
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  repeatPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})
const submitpasswordForm = async (formRef) => {
  formRef.validate((valid) => {
    if (valid) {
      edit_user({
        password: passwordForm.value.password
      }).then((res) => {
        if (res.code == 200) {
          // eslint-disable-next-line no-undef
          ElMessage.primary('修改成功')
          passwordVisible.value = false
        }
      })
    }
  })
}
const quitLogin = () => {
  logout().then((res) => {
    if (res.code == 200) {
      // eslint-disable-next-line no-undef
      ElMessage.primary('退出登录成功')
      userStore.reset()
      activeTab.value = 'account'
    }
  })
}
// 修改密码end
// 进入个人设置
const sonClick = (val) => {
  if (!useCheckLogin().value) {
    return
  }
  activeTab.value = val
}
// 提问输入
let quizContent = ref('')
// 划词操作
let operateList = ref([
  {
    name: 'AI解读',
    icon: unscrambleIcon
  },
  {
    name: '翻译',
    icon: translateIcon
  },
  {
    name: '笔记本',
    icon: notebookIcon
  },
  {
    name: '复制',
    icon: copyIcon
  }
])

const manualClick = () => {
  addNewTab({
    url: 'ServiceManual',
    title: '使用手册',
    icon: notebookIcon,
    isInternal: true
  })
}
</script>

<style scoped lang="scss">
.Recycled-box {
  box-sizing: border-box;
  padding: 50px 20px 10px;
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;

  .square {
    width: 100%;
    max-width: 808px;
    height: 100%;
    margin: 0 auto;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .retreat-box {
      width: 30px;
      height: 30px;
      background: #efefef;
      border-radius: 6px;
      position: absolute;
      left: 20px;
      top: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      .icon {
        width: 16px;
        height: 16px;
        transform: rotate(90deg);
      }
    }
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
      .export-box {
        width: 94px;
        height: 34px;
        background: var(--el-color-primary);
        border-radius: 8px;
        text-align: center;
        line-height: 34px;
        font-size: 16px;
        color: #fff;
        cursor: pointer;

        &:active {
          opacity: 0.6;
        }
      }
    }

    :deep(.content-box) {
      flex: 1;
      overflow: hidden;
      .account-box {
        // width: 808px;
        height: 100px;
        background: #f9f9f9;
        border-radius: 8px;
        padding: 0 23px 0 20px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .account-left {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          .buddha {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            object-fit: cover;
          }
          .name {
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 500;
            font-size: 18px;
            color: #221815;
            line-height: 24px;
          }
        }

        .icon {
          width: 15px;
          height: 16px;
          transform: rotate(-90deg);
        }
      }
      .general-title {
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        font-size: 16px;
        color: #909090;
        line-height: 22px;
        margin-top: 40px;
        margin-bottom: 24px;
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
          padding: 15px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #efefef;
          &:last-of-type {
            border-bottom: none;
          }
          .label {
            flex-shrink: 0;
            font-weight: 500;
            font-size: 16px;
            color: var(--default-font-color);
            line-height: 22px;
          }
          .buddha {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            object-fit: cover;
          }
          .item-right {
            display: flex;
            align-items: center;
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 400;
            font-size: 16px;
            color: #221815;
            line-height: 22px;
            gap: 14px;
          }
          .icon {
            width: 16px;
            height: 16px;
            transform: rotate(-90deg);
          }
        }
      }
      .quit-box {
        width: 100%;
        height: 62px;
        background: #f9f9f9;
        border-radius: 8px;
        margin-top: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 500;
        font-size: 16px;
        color: #ff5151;
        cursor: pointer;
      }
    }
  }

  :deep(.clear-recycled-dialog) {
    .el-dialog {
      .el-dialog__header {
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
        .book-input,
        .repository-select,
        .notebook-select {
          .el-input__wrapper,
          .el-select__wrapper {
            height: 40px;
            background-color: #f9f9f9;
            border-radius: 8px;
            box-shadow: none;

            &.is-focus,
            &.is-focused {
              box-shadow: 0 0 0 1px var(--el-color-primary) inset;
            }
          }
          .el-textarea__inner {
            background: #f9f9f9;
            box-shadow: none;
            font-size: 14px;
            height: 122px;
            color: var(--default-font-color);
            border-radius: 8px;

            &.is-focus {
              box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
            }
          }
        }
      }
      .dialog-footer {
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

  .assist-list {
    padding-top: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    .assist-item {
      cursor: pointer;
      color: var(--el-color-primary);
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      font-size: 16px;
      line-height: 22px;
      margin-bottom: 12px;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 0 6px;
      border-radius: 4px;
      .disc {
        width: 8px;
        height: 8px;
        background: var(--el-color-primary);
        border-radius: 50%;
      }
    }
    .assist-item:hover {
      background: var(--el-color-primary-light-9);
      // opacity: 0.1;
    }
  }
  :deep(.quiz-box) {
    margin-bottom: 30px;
    .quiz-input,
    .el-input__wrapper {
      height: 58px;
      background-color: #f6f6f6;
      border-radius: 8px;
      box-shadow: none;
      font-size: 16px;
      &.is-focus,
      &.is-focused {
        box-shadow: 0 0 0 1px var(--el-color-primary) inset;
      }
    }
  }
  :deep(.paddle-box) {
    padding: 0 20px;
    height: 322px;
    background: #f9f9f9;
    border-radius: 8px;
    position: relative;
    .operate {
      width: 366px;
      height: 50px;
      background: #ffffff;
      box-shadow: 0px 2px 20px 8px rgba(0, 0, 0, 0.07);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: space-evenly;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 70px;
      .operate-item {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        .item-icon {
          width: 16px;
          height: 16px;
          img {
            width: 16px;
            height: 16px;
          }
        }
        .item-title {
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          font-size: 14px;
          color: var(--default-font-color);
          line-height: 20px;
        }
      }
    }
    .examples {
      width: 498px;
      height: 52px;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: #221815;
      line-height: 26px;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 140px;
      > span {
        background: #eaf5f5;
        padding: 0 4px;
      }
    }
    .bottom-operate {
      width: calc(100% - 40px);
      border-top: 1px solid #efefef;
      padding: 20px 0;
      position: absolute;
      bottom: 0px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .label {
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 500;
        font-size: 16px;
        color: #221815;
        line-height: 22px;
      }
      .el-select__wrapper {
        background-color: #eaeaea !important;
        border-radius: 4px !important;
        box-shadow: 0 0 0 1px #f9f9f9 inset;
        &.is-focus {
          box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.more-position-popover {
  .more-position-box {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}
.Recycled-handle-popover {
  border-radius: 8px !important;
  padding: 19px 18px !important;
  .handle-box {
    display: flex;
    flex-direction: column;
    gap: 22px;

    .handle-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 22px;
      cursor: pointer;
      transition: all 0.2s linear;

      // &:hover {
      //   color: var(--el-color-primary);
      // }
      &:active {
        opacity: 0.6;
      }

      .icon {
        flex-shrink: 0;
        width: 16px;
        height: 16px;
      }
    }
  }
}
</style>
