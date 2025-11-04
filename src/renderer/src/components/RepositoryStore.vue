<template>
  <div class="repository-box" @click="resetChecks">
    <div class="left-box">
      <div class="common-repository-box">
        <div class="common-box">
          <div class="common-box-left">
            <img class="icon" src="@renderer/assets/repository/common-repository-icon.png" alt="" />
            公共知识库
          </div>
          <div class="square-icon-box">
            <img class="square-icon" src="@renderer/assets/repository/square-icon.png" alt="" />
          </div>
        </div>
        <div class="my-create-box">
          <div class="lable-box" @click="closeCommonChange">
            <div class="label-box-left">
              <img
                class="icon"
                :class="{ 'rotate-icon': closeCommonList }"
                src="@renderer/assets/repository/down-icon.png"
                alt=""
              />
              我的创建
            </div>
            <div class="add-icon-box" @click.stop="beforeAddRepository('common')">
              <img class="add-icon" src="@renderer/assets/repository/add-icon.png" alt="" />
            </div>
          </div>
          <div class="commom-list" :class="{ 'close-box': closeCommonList }">
            <div class="item active-repository">
              <div class="icon-box">
                <img class="icon" src="@renderer/assets/logo.png" alt="" />
              </div>
              <div class="title">糖吉医疗最新文献更新</div>
              <div class="dot-dark"></div>
            </div>
            <div class="item">
              <div class="icon-box">
                <img class="icon" src="@renderer/assets/logo.png" alt="" />
              </div>
              <div class="title">糖吉医疗最新文献更新</div>
              <div class="dot-dark"></div>
            </div>
            <div class="item">
              <div class="icon-box">
                <img class="icon" src="@renderer/assets/logo.png" alt="" />
              </div>
              <div class="title">糖吉医疗最新文献更新</div>
              <div class="dot-dark"></div>
            </div>
            <div class="expand" @click="commonExpandChange">
              {{ createCommonExpand ? '收起' : '展开' }}
            </div>
          </div>
        </div>
        <div class="my-create-box">
          <div class="lable-box">
            <div class="label-box-left" @click="closeJoinChange">
              <img
                class="icon"
                :class="{ 'rotate-icon': closeJoinList }"
                src="@renderer/assets/repository/down-icon.png"
                alt=""
              />
              我的加入
            </div>
          </div>
          <div class="commom-list" :class="{ 'close-box': closeJoinList }">
            <div class="item">
              <div class="icon-box">
                <img class="icon" src="@renderer/assets/logo.png" alt="" />
              </div>
              <div class="title">糖吉医疗最新文献更新</div>
              <div class="dot-dark"></div>
            </div>
            <div class="item">
              <div class="icon-box">
                <img class="icon" src="@renderer/assets/logo.png" alt="" />
              </div>
              <div class="title">糖吉医疗最新文献更新</div>
              <div class="dot-dark"></div>
            </div>
            <div class="item">
              <div class="icon-box">
                <img class="icon" src="@renderer/assets/logo.png" alt="" />
              </div>
              <div class="title">糖吉医疗最新文献更新</div>
              <div class="dot-dark"></div>
            </div>
            <div class="expand" @click="joinExpandChange">
              {{ joinCommonExpand ? '收起' : '展开' }}
            </div>
          </div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="personage-repository-box">
        <div class="personage-box">
          <div class="personage-box-left" @click="closePersonageChange">
            <img
              class="personage-icon"
              src="@renderer/assets/repository/personage-repository-icon.png"
              alt=""
            />
            个人知识库
            <img
              class="icon"
              :class="{ 'rotate-icon': closePersonageList }"
              src="@renderer/assets/repository/down-icon.png"
              alt=""
            />
          </div>
          <div class="add-icon-box" @click.stop="beforeAddRepository('personage')">
            <img class="add-icon" src="@renderer/assets/repository/add-icon.png" alt="" />
          </div>
        </div>
        <div class="personage-list" :class="{ 'close-box': closePersonageList }">
          <div class="item">
            <div class="icon-box">
              <img class="icon" src="@renderer/assets/logo.png" alt="" />
            </div>
            <div class="title">糖吉医疗最新糖吉医疗最新文献更新文献更新</div>
            <div class="dot-dark"></div>
          </div>
          <div class="item">
            <div class="icon-box">
              <img class="icon" src="@renderer/assets/logo.png" alt="" />
            </div>
            <div class="title">糖吉医疗最新文献更新</div>
            <div class="dot-dark"></div>
          </div>
          <div class="item">
            <div class="icon-box">
              <img class="icon" src="@renderer/assets/logo.png" alt="" />
            </div>
            <div class="title">糖吉医疗最新文献更新</div>
            <div class="dot-dark"></div>
          </div>
          <div class="storage-space-box">
            <div class="space-box">已使用 30MB/30GB</div>
            <div class="expand" @click="personageExpandChange">
              {{ personageExpand ? '收起' : '展开' }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="center-box">
      <div class="repository-detail-box">
        <el-popover
          ref="repositoryPopover"
          popper-class="custom-repository-popover"
          trigger="click"
          placement="bottom-start"
          :show-arrow="false"
        >
          <template #reference>
            <div class="handle">
              <img class="more-icon" src="@renderer/assets/repository/more-icon.png" alt="" />
            </div>
          </template>
          <div class="common-handle-box" @click="hidePopover(repositoryPopover)">
            <div class="item" @click="beforeEditRepository({ type: 'common' })">
              <img class="icon" src="@renderer/assets/repository/zlxg-icon.png" alt="" />
              <div class="title">资料修改</div>
            </div>
            <div class="item" @click="beforeRepositoryPermission">
              <img class="icon" src="@renderer/assets/repository/qxsz-icon.png" alt="" />
              <div class="title">权限设置</div>
            </div>
            <div class="item" @click="beforeRepositoryMember">
              <img class="icon" src="@renderer/assets/repository/cysz-icon.png" alt="" />
              <div class="title">知识库成员</div>
            </div>
            <div class="item" @click="beforeRepositoryFeedback">
              <img class="icon" src="@renderer/assets/repository/fk-icon.png" alt="" />
              <div class="title">反馈</div>
            </div>
            <div class="item" @click="addQuickAccess">
              <img class="icon" src="@renderer/assets/repository/kjfw-icon.png" alt="" />
              <div class="title">添加快捷访问</div>
            </div>
            <div class="item" @click="beforeDeleteRepository">
              <img class="icon" src="@renderer/assets/repository/del-icon.png" alt="" />
              <div class="title">删除知识库</div>
            </div>
          </div>
        </el-popover>
        <div class="detail-box">
          <div class="top" @click="beforeEditRepository({ type: 'common' })">
            <img class="cover-img" src="@renderer/assets/logo.png" alt="" />
            <div class="top-right">
              <div class="title">糖吉医疗最新文献更新</div>
              <div class="top-right-bottom">
                <div class="author-or-num-box">
                  <img class="avatar" src="@renderer/assets/default-avatar.png" alt="" />
                  <div class="author-name">糖吉医疗</div>
                  <div class="vertical-line"></div>
                  <div class="num">6个内容</div>
                </div>
                <div class="management-box">
                  <MultiAvatar :avatars="avatarList" :size="18" :max-count="5" :spacing="-5" />
                </div>
              </div>
            </div>
          </div>
          <div class="repository-des" @click="beforeEditRepository({ type: 'common' })">
            快来填写知识库的描述吧～
          </div>
        </div>
      </div>
      <div class="detail-list-box">
        <div v-show="!isSearching" class="list-handle-box">
          <div class="path-box">
            <span>内容</span>
          </div>
          <div class="icons">
            <el-popover
              ref="repositoryaddPopover"
              popper-class="custom-repository-popover"
              trigger="click"
              placement="bottom-start"
              :show-arrow="false"
            >
              <template #reference>
                <img
                  class="icon"
                  src="@renderer/assets/repository/add-file-icon.png"
                  alt=""
                  @click="addMenuClick"
                />
              </template>
              <div class="common-handle-box" @click="hidePopover(repositoryaddPopover)">
                <div class="item" @click="beforeUploadFiles('local-file')">
                  <img class="icon" src="@renderer/assets/popover/local-file-icon.png" alt="" />
                  <div class="title">本地文件</div>
                </div>
                <div class="item" @click="beforeUploadFiles('local-folder')">
                  <img class="icon" src="@renderer/assets/popover/local-folder-icon.png" alt="" />
                  <div class="title">本地文件夹</div>
                </div>
                <!-- <div class="item">
                  <img class="icon" src="@renderer/assets/popover/catalogue-file-icon.png" alt="" />
                  <div class="title">目录文件</div>
                </div>
                <div class="item">
                  <img
                    class="icon"
                    src="@renderer/assets/popover/directory-folder-icon.png"
                    alt=""
                  />
                  <div class="title">目录文件夹</div>
                </div> -->
                <el-popover
                  ref="repositoryNotePopover"
                  popper-class="custom-repository-popover"
                  trigger="hover"
                  placement="right-start"
                  :show-arrow="false"
                >
                  <template #reference>
                    <div class="item">
                      <img class="icon" src="@renderer/assets/popover/note-icon.png" alt="" />
                      <div class="title">笔记</div>
                      <el-icon>
                        <ArrowRight />
                      </el-icon>
                    </div>
                  </template>
                  <div class="common-handle-box" @click="hidePopover(repositoryNotePopover)">
                    <div class="item">
                      <img
                        class="icon"
                        src="@renderer/assets/repository/new-note-icon.png"
                        alt=""
                      />
                      <div class="title">新建笔记</div>
                    </div>
                    <div class="item">
                      <img
                        class="icon"
                        src="@renderer/assets/repository/import-notes-icon.png"
                        alt=""
                      />
                      <div class="title">导入笔记</div>
                    </div>
                  </div>
                </el-popover>

                <div class="item" @click="beforeUploadFiles('createFolder')">
                  <img class="icon" src="@renderer/assets/popover/createFolder-icon.png" alt="" />
                  <div class="title">创建文件夹</div>
                </div>
                <div class="item" @click="beforeUploadFiles('import-web')">
                  <img class="icon" src="@renderer/assets/popover/web-page-icon.png" alt="" />
                  <div class="title">导入网页</div>
                </div>
              </div>
            </el-popover>
            <el-popover
              ref="repositorySortPopover"
              popper-class="custom-repository-popover"
              trigger="click"
              placement="bottom-start"
              :show-arrow="false"
            >
              <template #reference>
                <img class="icon" src="@renderer/assets/repository/sort-icon.png" alt="" />
              </template>
              <div class="common-handle-box" @click="hidePopover(repositorySortPopover)">
                <div
                  v-for="item in sortList"
                  :key="item.value"
                  class="item"
                  :class="{ active: item.value == sortType }"
                  @click="sortMenuClick(item)"
                >
                  <div class="title">{{ item.label }}</div>
                  <el-icon class="check-icon"><Check /></el-icon>
                </div>
              </div>
            </el-popover>

            <img
              class="icon"
              src="@renderer/assets/repository/search-icon.png"
              alt=""
              @click="searchMenuClick"
            />
          </div>
        </div>
        <div v-show="isSearching" class="search-box">
          <el-input
            ref="searchBoxRef"
            v-model="searchText"
            class="search-input"
            placeholder="搜索"
            clearable
            @blur="handleBlur"
          />
          <el-icon class="search-icon">
            <Search />
          </el-icon>
        </div>
        <div class="list-box">
          <template v-for="item in commomList" :key="item.id">
            <div
              v-if="item.type == 'directory'"
              class="list-item"
              :class="{ 'active-repository': item.checked }"
              @contextmenu="(e) => showContextMenu(e, item)"
            >
              <el-checkbox v-model="item.checked" class="checkbox" size="large" @click.stop="" />
              <img class="cover-img" :src="getFileIcon(item)" alt="" />
              <template v-if="!item.isCreated">
                <div class="item-right">
                  <div class="title">{{ item.name }}</div>
                  <div class="item-right-bottom">
                    <div class="size-or-num-box">
                      <div class="num">{{ item.count }}个内容</div>
                      <div class="vertical-line"></div>
                      <div class="size">{{ formatFileSize(item.size) }}</div>
                    </div>
                    <div class="management-box">{{ item.create_time }}</div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="item-right">
                  <div class="title">
                    <el-input
                      v-model="item.name"
                      autofocus
                      class="create-input"
                      placeholder="请输入文件夹名称"
                      @keyup.enter="createFolder(item)"
                      @blur="createFolder(item)"
                    />
                  </div>
                  <div class="item-right-bottom">
                    <div class="size-or-num-box">
                      <div class="num">{{ item.count }}个内容</div>
                      <div class="vertical-line"></div>
                      <div class="size">{{ formatFileSize(item.size) }}</div>
                    </div>
                    <div class="management-box">{{ item.isCreated ? '' : item.create_time }}</div>
                  </div>
                </div>
              </template>
            </div>
            <div
              v-else
              class="list-item"
              :class="{ 'active-repository': item.checked }"
              @contextmenu="(e) => showContextMenu(e, item)"
            >
              <el-checkbox
                v-model="item.checked"
                class="checkbox"
                size="large"
                @click.stop="contextMenu.show = false"
              />
              <img
                class="cover-img cover-file-img"
                src="https://gips2.baidu.com/it/u=1651586290,17201034&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f600_800"
                alt=""
              />
              <template v-if="!item.isCreated">
                <div class="item-right">
                  <div class="title">{{ item.name }}</div>
                  <div class="item-right-bottom">
                    <div class="size-or-num-box">
                      <div class="type-box">
                        <img class="icon" :src="getFileIcon(item)" alt="" />
                        <span v-if="item.type == 'web'">{{ item.name }}</span>
                        <span v-else-if="item.type == 'txt'">文本</span>
                        <span v-else-if="item.type == 'img'">图片</span>
                        <span v-else>{{ item.type.toLocaleUpperCase() }}</span>
                      </div>
                      <div v-if="item.type != 'web'" class="size">
                        {{ formatFileSize(item.size) }}
                      </div>
                    </div>
                    <div class="management-box">{{ item.create_time }}</div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="item-right">
                  <div class="title">
                    <el-input
                      v-model="item.name"
                      autofocus
                      class="create-input"
                      placeholder="请输入文件名称"
                      @keyup.enter="createFolder(item)"
                      @blur="createFolder(item)"
                    />
                  </div>
                  <div class="item-right-bottom">
                    <div class="size-or-num-box">
                      <div class="num">{{ item.count }}个内容</div>
                      <div class="vertical-line"></div>
                      <div class="size">{{ formatFileSize(item.size) }}</div>
                    </div>
                    <div class="management-box">{{ item.isCreated ? '' : item.create_time }}</div>
                  </div>
                </div>
              </template>
            </div>
          </template>
        </div>
      </div>
    </div>
    <HandleContextMenu
      :show="contextMenu.show"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :action-sheet="contextMenu.actionSheet"
      @action="handleContextMenuAction"
    />
    <UploadFiles
      v-model="uploadVisible"
      :ready-upload-list="ReadyUploadList"
      @close="closeUploadDialog"
      @before-upload-files="beforeUploadFiles"
    />
    <el-upload
      v-show="false"
      ref="elUploadRef"
      :auto-upload="false"
      :on-change="handleSelectChange"
    >
      <button ref="uploadBtnRef"></button>
    </el-upload>
    <el-dialog
      v-model="importWebVisible"
      draggable
      align-center
      modal-class="import-web-dialog"
      width="390"
    >
      <template #header>
        <img
          class="dialog-header-del-icon"
          src="@renderer/assets/popover/web-page-icon.png"
          alt=""
        />
        <div class="title">导入网页</div>
      </template>
      <el-form ref="webFormRef" :model="webForm" :rules="webRules" class="rename-form">
        <el-form-item prop="urls" style="margin-bottom: 0">
          <el-input
            v-model="webForm.urls"
            class="rename-input"
            size="large"
            resize="none"
            type="textarea"
            placeholder="请输入网址"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="importWebVisible = false">取消</el-button>
          <el-button class="confirm-btn" type="primary" @click="submitWebForm(webFormRef)">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      v-model="editTagVisible"
      draggable
      align-center
      modal-class="import-web-dialog"
      width="390"
    >
      <template #header>
        <img
          class="dialog-header-del-icon"
          src="@renderer/assets/contextMenu/edit-icon.png"
          alt=""
        />
        <div class="title">编辑标签</div>
      </template>
      <el-input-tag
        v-model="tagList"
        tag-type="primary"
        size="large"
        tag-effect="light"
        placeholder="输入标签"
        @add-tag="addTagChange"
        @remove-tag="removeTagChange"
      >
        <template #tag="{ value }">
          <div class="flex items-center">
            <span>{{ value }}</span>
          </div>
        </template>
      </el-input-tag>
      <div class="hased-tag-box">
        <div class="hased-label">我的标签</div>
        <div class="hased-list">
          <el-tag
            v-for="item in hasedTagList"
            :key="item.id"
            :type="item.type"
            @click="checkTagChange(item)"
            >{{ item.name }}</el-tag
          >
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="editTagVisible = false">取消</el-button>
          <el-button class="confirm-btn" type="primary" @click="submitEditTag"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 添加仓库弹窗 -->
    <AddRepository
      v-model="addRepositoryVisible"
      :type="repositoryType"
      :submit-type="submitRepositoryType"
      @close="closeAddRepositoryDialog"
      @add-repository="addRepository"
    />
    <!-- 知识库权限弹窗 -->
    <RepositoryPermission
      v-model="repositoryPermissionVisible"
      @close="closeRepositoryPermissionDialog"
      @set-permission="setRepositoryPermission"
    />
    <!-- 知识库成员弹窗 -->
    <RepositoryMember
      v-model="repositoryMemberVisible"
      @close="closeRepositoryMemberDialog"
      @set-permission="setRepositoryMemberPermission"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, inject, computed } from 'vue'
import topIcon from '@renderer/assets/contextMenu/top-icon.png'
import unstickIcon from '@renderer/assets/contextMenu/unstick-icon.png'
import editIcon from '@renderer/assets/contextMenu/edit-icon.png'
import renameIcon from '@renderer/assets/contextMenu/rename-icon.png'
import permissionIcon from '@renderer/assets/contextMenu/permission-icon.png'
import exportIcon from '@renderer/assets/contextMenu/export-icon.png'
import deleteIcon from '@renderer/assets/contextMenu/delete-icon.png'
import canViewIcon from '@renderer/assets/contextMenu/can-view-icon.png'
import disabledExportIcon from '@renderer/assets/contextMenu/disabled-export-icon.png'
import cannotViewIcon from '@renderer/assets/contextMenu/cannot-view-icon.png'
import catalogueIcon from '@renderer/assets/upload-files/catalogue-icon.png'
import excelIcon from '@renderer/assets/file-icons/excel-icon.png'
import imgIcon from '@renderer/assets/file-icons/img-icon.png'
import pdfIcon from '@renderer/assets/file-icons/pdf-icon.png'
import pptIcon from '@renderer/assets/file-icons/ppt-icon.png'
import txtIcon from '@renderer/assets/file-icons/txt-icon.png'
import wordIcon from '@renderer/assets/file-icons/word-icon.png'
import webPageIcon from '@renderer/assets/file-icons/web-page-icon.png'
import feedbackIcon from '@renderer/assets/repository/fk-icon.png'
let repositorySortPopover = ref(null)
let repositoryNotePopover = ref(null)
let sortList = ref([
  {
    label: '上传时间',
    value: 'create_time'
  },
  {
    label: '大小',
    value: 'size'
  },
  {
    label: '名称',
    value: 'name'
  }
])
let sortType = ref('create_time')
let addRepositoryVisible = ref(false)
const addNewTab = inject('addNewTab')
// 反馈
const beforeRepositoryFeedback = () => {
  addNewTab({
    icon: feedbackIcon,
    title: '反馈中心',
    url: 'FeedbackCenter',
    backgroundColor: 'var(--primary-bg-color)',
    isInternal: true
  })
}
const closeAddRepositoryDialog = () => {
  addRepositoryVisible.value = false
}
// 确认添加知识库
const addRepository = (repository) => {
  console.log(repository)

  // addRepositoryVisible.value = false
}
// 添加知识库类型
const repositoryType = ref('common')
// 知识库提交类型
const submitRepositoryType = ref('create')
// 唤起添加知识库弹窗
const beforeAddRepository = (type) => {
  repositoryType.value = type
  submitRepositoryType.value = 'create'
  addRepositoryVisible.value = true
}
// 资料修改
// 唤起资料修改弹窗
const beforeEditRepository = (item) => {
  repositoryType.value = item.type
  submitRepositoryType.value = 'update'
  addRepositoryVisible.value = true
}
// 添加快捷访问
const addQuickAccess = () => {
  console.log(6666)
}
// 删除知识库
const beforeDeleteRepository = () => {
  // eslint-disable-next-line no-undef
  ElMessageBox.confirm('确认删除吗？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      // eslint-disable-next-line no-undef
      ElMessage({
        type: 'primary',
        message: '删除成功'
      })
    })
    .catch(() => {})
}
// 知识库权限弹窗
let repositoryPermissionVisible = ref(false)
const beforeRepositoryPermission = () => {
  repositoryPermissionVisible.value = true
}
const closeRepositoryPermissionDialog = () => {
  repositoryPermissionVisible.value = false
}
let tagList = ref(['糖源医疗', '品质部', '销售部', '采购部'])
let editTagVisible = ref(false)
let hasedTagList = ref([
  {
    name: '糖源医疗',
    type: 'primary',
    id: new Date().getTime()
  },
  {
    name: '品质部',
    type: 'primary',
    id: new Date().getTime()
  },
  {
    name: '销售部',
    type: 'primary',
    id: new Date().getTime()
  },
  {
    name: '采购部',
    type: 'primary',
    id: new Date().getTime()
  }
])
const submitEditTag = () => {
  hasedTagList.value = tagList.value
  editTagVisible.value = false
}
const addTagChange = () => {
  let newTagList = [...new Set(tagList.value)]
  tagList.value = newTagList
}
const removeTagChange = (tagName) => {
  var i = hasedTagList.value.findIndex((tag) => tagName === tag.name)
  if (i !== -1) {
    hasedTagList.value[i].type = 'info'
  }
}
const checkTagChange = (item) => {
  var i = tagList.value.findIndex((tag) => tag === item.name)
  if (i == -1) {
    item.type = 'primary'
    tagList.value.push(item.name)
  } else {
    item.type = 'info'
    tagList.value.splice(i, 1)
  }
}
// 确认设置知识库权限
const setRepositoryPermission = (permission) => {
  console.log(999999, permission)
  repositoryPermissionVisible.value = false
}
// 知识库成员弹窗
let repositoryMemberVisible = ref(false)
const beforeRepositoryMember = () => {
  repositoryMemberVisible.value = true
}
const closeRepositoryMemberDialog = () => {
  repositoryMemberVisible.value = false
}
// 确认设置知识库成员权限
const setRepositoryMemberPermission = (permission) => {
  console.log(permission)
  repositoryMemberVisible.value = false
}
// 知识库列表
const commomList = ref([
  {
    type: 'directory',
    name: '糖源医疗',
    count: 3,
    size: 1600,
    create_time: '2025/09/09',
    id: 1,
    checked: false
  },
  {
    type: 'docx',
    name: '糖源医疗',
    count: 3,
    size: 326,
    create_time: '2025/09/09',
    id: 2,
    checked: false
  },
  {
    type: 'xlsx',
    name: '糖源医疗',
    count: 3,
    size: 3699,
    create_time: '2025/09/09',
    id: 3,
    checked: false
  },
  {
    type: 'img',
    name: '糖源医疗',
    count: 3,
    size: 123,
    create_time: '2025/09/09',
    id: 4,
    checked: false
  },
  {
    type: 'web',
    name: 'https://www.baidu.com',
    count: 3,
    size: 562,
    create_time: '2025/09/09',
    id: 5,
    checked: false
  }
])
// 创建文件夹
const createFolder = (item) => {
  item.isCreated = false
}
const contextMenu = ref({ show: false, x: 0, y: 0, actionSheet: [] })
let importWebVisible = ref(false)
let webFormRef = ref(null)
const webForm = ref({
  urls: ''
})
let validateURL = (rule, value, callback) => {
  const urlRegex =
    /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/
  if (urlRegex.test(value)) {
    callback()
  } else {
    callback(new Error('请输入正确的网址'))
  }
}
const webRules = ref({
  urls: [
    { required: true, message: '请输入网址', trigger: ['blur'] },
    { validator: validateURL, message: '请输入正确的网址', trigger: ['blur'] }
  ]
})
const submitWebForm = (FormRef) => {
  FormRef.validate((valid) => {
    if (valid) {
      console.log('表单验证通过')
      importWebVisible.value = false
    } else {
      console.log('表单验证失败')
    }
  })
}
let activeFiles = computed(() => {
  return commomList.value.filter((item) => item.checked)
})
// 右键菜单相关函数
const showContextMenu = (e, item) => {
  repositoryaddPopover.value?.hide()
  repositoryNotePopover.value?.hide()
  repositorySortPopover.value?.hide()
  repositoryPopover.value?.hide()
  if (!item.checked) {
    resetChecks()
  }
  item.checked = true
  e.preventDefault()
  contextMenu.value = {
    show: true,
    x: e.clientX,
    y: e.clientY,
    actionSheet: [
      {
        name: '置顶',
        icon: topIcon,
        action: 'top'
      },
      {
        name: '取消置顶',
        icon: unstickIcon,
        action: 'unstick'
      },
      {
        name: '编辑标签',
        icon: editIcon,
        action: 'editTag'
      },
      {
        name: '重命名',
        icon: renameIcon,
        action: 'rename'
      },
      {
        name: '内容权限',
        icon: permissionIcon,
        action: 'permission',
        children: [
          {
            name: '可查看、导出',
            icon: canViewIcon,
            action: 'canView'
          },
          {
            name: '可查看、不可导出',
            icon: disabledExportIcon,
            action: 'private'
          },
          {
            name: '不可查看',
            icon: cannotViewIcon,
            action: 'cannotView'
          }
        ]
      },
      {
        name: '导出',
        icon: exportIcon,
        action: 'export'
      },
      {
        name: '删除',
        icon: deleteIcon,
        action: 'delete'
      }
    ]
  }
}
const handleContextMenuAction = ({ action }) => {
  if (action === 'top') {
    // 置顶
  } else if (action === 'unstick') {
    // 取消置顶
  } else if (action === 'editTag') {
    // 编辑标签
    editTagVisible.value = true
  } else if (action === 'rename') {
    // 重命名
    if (activeFiles.value.length == 1) {
      activeFiles.value[0].isCreated = true
      nextTick(() => {
        // 让新生成的input聚焦 且让其内容selected选中
        const newInput = document.querySelector('.create-input input')
        var timer = setTimeout(() => {
          clearTimeout(timer)
          newInput.focus()
          newInput.select()
        }, 100)
      })
    }
  } else if (action === 'permission') {
    // 设置权限
  } else if (action === 'export') {
    // 导出
  } else if (action === 'delete') {
    // 删除
    // eslint-disable-next-line no-undef
    ElMessageBox.confirm('确认删除吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        // eslint-disable-next-line no-undef
        ElMessage({
          type: 'primary',
          message: '删除成功'
        })
      })
      .catch(() => {})
  } else if (action === 'canView') {
    // 可查看、导出
  } else if (action === 'private') {
    // 可查看、不可导出
  } else if (action === 'cannotView') {
    // 不可查看
  }
  contextMenu.value.show = false
}
const resetChecks = () => {
  commomList.value.map((item) => {
    item.checked = false
  })
}
const hideContextMenu = (e) => {
  if (contextMenu.value.show && !e.target.closest('.context-menu')) {
    contextMenu.value.show = false
  }
  resetChecks()
}

const isSearching = ref(false)
const searchText = ref('')
const searchBoxRef = ref(null)
const handleBlur = () => {
  if (!searchText.value) {
    isSearching.value = false
  }
}
const addMenuClick = () => {
  // console.log('添加文件')
}
const sortMenuClick = (item) => {
  sortType.value = item.value
  console.log('排序')
}
const searchMenuClick = () => {
  isSearching.value = true
  nextTick(() => {
    searchBoxRef.value.focus()
  })
}
onMounted(() => {
  document.addEventListener('click', hideContextMenu)
})
const avatarList = ref([
  'https://gips0.baidu.com/it/u=2715557971,1924949551&fm=3074&app=3074&f=PNG?w=2048&h=2048',
  'https://img1.baidu.com/it/u=2347178170,458451905&fm=253&app=138&f=JPEG?w=500&h=500',
  'https://gips0.baidu.com/it/u=2715557971,1924949551&fm=3074&app=3074&f=PNG?w=2048&h=2048',
  'https://gips3.baidu.com/it/u=2776647388,3101487920&fm=3074&app=3074&f=PNG?w=2048&h=2048',
  'https://gips0.baidu.com/it/u=2715557971,1924949551&fm=3074&app=3074&f=PNG?w=2048&h=2048',
  'https://img0.baidu.com/it/u=4127955635,2106699935&fm=253&app=138&f=JPEG?w=500&h=500'
])
let createCommonExpand = ref(false)
const commonExpandChange = () => {
  createCommonExpand.value = !createCommonExpand.value
}
let closeCommonList = ref(false)
const closeCommonChange = () => {
  closeCommonList.value = !closeCommonList.value
}
let joinCommonExpand = ref(false)
const joinExpandChange = () => {
  joinCommonExpand.value = !joinCommonExpand.value
}
let closeJoinList = ref(false)
const closeJoinChange = () => {
  closeJoinList.value = !closeJoinList.value
}
let personageExpand = ref(false)
const personageExpandChange = () => {
  personageExpand.value = !personageExpand.value
}
let closePersonageList = ref(false)
const closePersonageChange = () => {
  closePersonageList.value = !closePersonageList.value
}
// 公共知识库操作
let repositoryPopover = ref(null)
// 添加文件操作
const repositoryaddPopover = ref(null)
const hidePopover = (popoverName) => {
  if (popoverName) {
    popoverName.hide()
  }
}
let elUploadRef = ref(null) //elinput 组件
let uploadBtnRef = ref(null) //elinput上传按钮触发
let uploadVisible = ref(false) //自定义上传组件
const closeUploadDialog = () => {
  uploadVisible.value = false
}

const beforeUploadFiles = (type) => {
  if (type == 'local-file') {
    elUploadRef.value.clearFiles()
    ReadyUploadList.length = 0
    uploadBtnRef.value.click()
  } else if (type == 'local-folder') {
    elUploadRef.value.clearFiles()
    ReadyUploadList.length = 0
    openDirectorySelector()
  } else if (type == 'import-web') {
    importWebVisible.value = true
  } else if (type == 'createFolder') {
    commomList.value.unshift({
      type: 'directory',
      name: '新建文件夹' + Date.now(),
      count: 0,
      size: 0,
      create_time: new Date().toLocaleString().split(' ')[0],
      id: Date.now(),
      checked: false,
      isCreated: true
    })
    nextTick(() => {
      // 让新生成的input聚焦 且让其内容selected选中
      const newInput = document.querySelector('.create-input input')
      var timer = setTimeout(() => {
        clearTimeout(timer)
        newInput.focus()
        newInput.select()
      }, 100)
    })
  }
}
const ReadyUploadList = reactive([])
const handleSelectChange = (file) => {
  // 如果是文件夹，使用新的目录树结构
  if (file.webkitRelativePath) {
    // 处理文件夹上传
    file.type = 'directory'
    file.uploadStatus = 'pending'
    ReadyUploadList.push(file)
    uploadVisible.value = true
  } else {
    // 处理单个文件
    file.type = 'file'
    file.uploadStatus = 'pending'
    ReadyUploadList.push(file)
    // ReadyUploadList.push({
    //   type: 'directory',
    //   name: directoryTree.name,
    //   path: directoryTree.path,
    //   fileCount: directoryTree.fileCount,
    //   children: directoryTree.children,
    //   uploadStatus: 'pending'
    // })
    uploadVisible.value = true
  }
}
const openDirectorySelector = async () => {
  const directoryPath = await window.customApi.openDirectoryDialog()
  if (directoryPath) {
    try {
      // 使用新的readDir函数获取目录树结构
      const directoryTree = await window.customApi.readDir(directoryPath)
      // console.log('目录树结构:', directoryTree)
      // 将目录树添加到准备上传列表
      if (directoryTree && directoryTree.children && directoryTree.children.length > 0) {
        // 清空现有列表
        ReadyUploadList.length = 0
        // 添加目录树到上传列表
        ReadyUploadList.push({
          type: 'directory',
          name: directoryTree.name,
          path: directoryTree.path,
          fileCount: directoryTree.fileCount,
          children: directoryTree.children,
          uploadStatus: 'pending'
        })
        // 显示上传对话框
        uploadVisible.value = true
      } else {
        // eslint-disable-next-line no-undef
        ElMessage({
          message: '选择的目录为空或没有可上传的文件',
          type: 'warning'
        })
      }
    } catch (error) {
      console.error('读取文件或目录出错:', error)
      // eslint-disable-next-line no-undef
      ElMessage({
        message: '读取目录失败: ' + error.message,
        type: 'error'
      })
    }
  }
}
// 获取文件图标
const getFileIcon = (item) => {
  if (item.type === 'directory') {
    return catalogueIcon
  }
  // 根据文件扩展名返回不同的图标
  // const ext = item.name?.split('.').pop()?.toLowerCase()
  const ext = item.type
  const iconMap = {
    doc: wordIcon,
    docx: wordIcon,
    pdf: pdfIcon,
    xls: excelIcon,
    xlsx: excelIcon,
    ppt: pptIcon,
    pptx: pptIcon,
    txt: txtIcon,
    img: imgIcon,
    web: webPageIcon
  }

  return iconMap[ext] || wordIcon
}
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  if (bytes < 1024) {
    return bytes + ' B'
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' KB'
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
}
</script>

<style scoped lang="scss">
.repository-box {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  .left-box {
    box-sizing: border-box;
    padding: 25px 8px 20px;
    width: 236px;
    height: 100%;
    border-right: 1px solid #efefef;
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

    .common-repository-box {
      width: 100%;
      overflow: hidden;

      .common-box {
        margin-bottom: 20px;
        box-sizing: border-box;
        padding: 0 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;

        .common-box-left {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          font-size: 14px;
          color: var(--default-font-color);
          line-height: 18px;

          .icon {
            display: block;
            width: 18px;
            height: 18px;
          }
        }

        .square-icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;

          // border-radius: 4px;
          .square-icon {
            display: block;
            width: 18px;
            height: 18px;
          }
        }
      }

      .my-create-box {
        .lable-box {
          margin-bottom: 13px;
          box-sizing: border-box;
          padding: 0 9px 0 11px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;

          .label-box-left {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #737475;
            line-height: 16px;
            cursor: pointer;

            .icon {
              display: block;
              width: 12px;
              height: 12px;
              transition: all 0.2s;

              &.rotate-icon {
                transform: rotate(-90deg);
              }
            }
          }

          .add-icon-box {
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;

            .add-icon {
              display: block;
              width: 16px;
              height: 16px;
            }
          }
        }

        .commom-list {
          margin-bottom: 10px;
          overflow: hidden;

          &.close-box {
            height: 0;
          }

          .item {
            position: relative;
            margin-bottom: 4px;
            box-sizing: border-box;
            padding: 0 36px 0 16px;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            color: #737475;
            line-height: 16px;
            height: 32px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              background: #f6f6f6;

              .icon-box {
                background: #fff;
              }
            }

            &.active-repository {
              background: var(--el-color-primary-light-9);

              .icon-box {
                background: #fff;
              }
            }

            .icon-box {
              flex-shrink: 0;
              width: 18px;
              height: 18px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 2px;
              transition: all 0.2s;

              .icon {
                display: block;
                width: 13px;
                height: 13px;
              }
            }

            .title {
              flex: 1;
              font-size: 14px;
              color: var(--default-font-color);
              line-height: 16px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .dot-dark {
              position: absolute;
              top: 50%;
              right: 14px;
              transform: translateY(-50%);
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #ff5151;
            }
          }

          .expand {
            margin: 5px 8px 0 0;
            float: right;
            font-size: 12px;
            color: #737475;
            line-height: 16px;
            cursor: pointer;
          }
        }
      }
    }

    .divider {
      margin: 2px auto 29px;
      width: 211px;
      height: 1px;
      background-color: #efefef;
    }

    .personage-repository-box {
      width: 100%;
      overflow: hidden;

      .personage-box {
        margin-bottom: 20px;
        box-sizing: border-box;
        padding: 0 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;

        .personage-box-left {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          font-size: 14px;
          color: var(--default-font-color);
          line-height: 18px;

          .personage-icon {
            display: block;
            width: 18px;
            height: 18px;
          }

          .icon {
            display: block;
            width: 12px;
            height: 12px;
            transition: all 0.2s;

            &.rotate-icon {
              transform: rotate(-90deg);
            }
          }
        }

        .add-icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;

          // border-radius: 4px;
          .add-icon {
            display: block;
            width: 16px;
            height: 16px;
          }
        }
      }

      .personage-list {
        margin-bottom: 10px;
        overflow: hidden;

        &.close-box {
          height: 0;
        }

        .item {
          position: relative;
          margin-bottom: 4px;
          box-sizing: border-box;
          padding: 0 36px 0 16px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #737475;
          line-height: 16px;
          height: 32px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: #f6f6f6;

            .icon-box {
              background: #fff;
            }
          }

          .active-repository {
            background: var(--el-color-primary-light-9);

            .icon-box {
              background: #fff;
            }
          }

          .icon-box {
            flex-shrink: 0;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 2px;
            transition: all 0.2s;

            .icon {
              display: block;
              width: 13px;
              height: 13px;
            }
          }

          .title {
            font-size: 14px;
            color: var(--default-font-color);
            line-height: 16px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .dot-dark {
            position: absolute;
            top: 50%;
            right: 14px;
            transform: translateY(-50%);
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #ff5151;
          }
        }

        .storage-space-box {
          margin: 11px 8px 0 0;
          box-sizing: border-box;
          padding: 0 0 0 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: #909090;
          line-height: 16px;

          .space-box {
            flex: 1;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .expand {
            flex-shrink: 0;
            font-size: 12px;
            color: #737475;
            line-height: 16px;
            cursor: pointer;
          }
        }
      }
    }
  }

  .center-box {
    box-sizing: border-box;
    padding: 10px 6px 20px;
    width: 399px;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #efefef;

    .repository-detail-box {
      flex-shrink: 0;
      width: calc(100% - 20px);
      margin: 0 auto 18px;
      padding: 0 0 20px;
      border-bottom: 1px solid #efefef;

      .handle {
        margin-left: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border-radius: 2px;
        cursor: pointer;

        &:hover {
          background: var(--primary-bg-color);
        }

        .more-icon {
          display: block;
          width: 18px;
          height: 18px;
        }
      }

      .detail-box {
        .top {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          cursor: pointer;

          .cover-img {
            display: block;
            width: 64px;
            height: 64px;
            border-radius: 8px;
          }

          .top-right {
            flex: 1;
            overflow: hidden;

            .title {
              padding-top: 10px;
              margin-bottom: 10px;
              font-weight: 600;
              font-size: 18px;
              color: var(--default-font-color);
              line-height: 22px;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
            }

            .top-right-bottom {
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 14px;
              color: #909090;
              line-height: 22px;

              .author-or-num-box {
                flex-shrink: 0;
                display: flex;
                align-items: center;
                gap: 4px;

                .avatar {
                  display: block;
                  width: 18px;
                  height: 18px;
                }

                .author-name {
                  font-size: 12px;
                  color: #737475;
                  line-height: 16px;
                }

                .vertical-line {
                  width: 1px;
                  height: 10px;
                  background: #ccc;
                }

                .num {
                  font-size: 12px;
                  color: #737475;
                  line-height: 16px;
                }
              }
            }

            .management-box {
              position: relative;
              display: flex;
              align-items: center;
            }
          }
        }

        .repository-des {
          font-size: 12px;
          color: #adadad;
          line-height: 16px;
          cursor: pointer;
        }
      }
    }

    .detail-list-box {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .list-handle-box {
        flex-shrink: 0;
        width: calc(100% - 20px);
        margin: 0 auto 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        color: var(--default-font-color);
        line-height: 16px;
        overflow: hidden;

        .path-box {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .icons {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 14px;

          .icon {
            flex-shrink: 0;
            width: 16px;
            height: 16px;
            cursor: pointer;
          }
        }
      }

      .search-box {
        flex-shrink: 0;
        width: calc(100% - 20px);
        margin: 0 auto 18px;
        display: flex;
        align-items: center;

        :deep(.search-input) {
          flex: 1;

          .el-input__wrapper {
            background-color: #f9f9f9 !important;
            border-radius: 6px !important;
            box-shadow: 0 0 0 1px #efefef inset;

            &.is-focus {
              box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
            }
          }
        }

        .search-icon {
          margin: 0 0px 0 12px;
          color: var(--el-color-primary);
          font-size: 18px;
          cursor: pointer;
        }
      }

      .list-box {
        flex: 1;
        overflow: auto;

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
          position: relative;
          margin-bottom: 10px;
          padding: 10px;
          display: flex;
          gap: 10px;
          cursor: pointer;
          border-radius: 8px;

          .checkbox {
            height: fit-content;
            position: absolute;
            top: 12px;
            right: 10px;
            display: none;
          }

          &:hover {
            background: #f6f6f6;

            .checkbox {
              display: block;
            }
          }

          &.active-repository {
            background: var(--el-color-primary-light-9);

            .checkbox {
              display: block;
            }
          }

          .cover-img {
            display: block;
            width: 40px;
            height: 40px;
            border-radius: 8px;

            &.cover-file-img {
              border-radius: 4px;
              border: 1px solid #efefef;
            }
          }

          .item-right {
            flex: 1;
            overflow: hidden;

            .title {
              margin-bottom: 8px;
              font-size: 14px;
              color: var(--default-font-color);
              line-height: 16px;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;

              :deep(.create-input) {
                width: calc(100% - 30px);
                height: 100%;

                .el-input__inner {
                  font-size: 14px;
                  color: var(--default-font-color);
                }
              }
            }

            .item-right-bottom {
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 10px;
              color: #909090;
              line-height: 12px;

              .size-or-num-box {
                flex-shrink: 0;
                display: flex;
                align-items: center;
                gap: 10px;

                .size {
                  font-size: 10px;
                  color: #909090;
                  line-height: 12px;
                }

                .vertical-line {
                  width: 1px;
                  height: 10px;
                  background: #ccc;
                }

                .num {
                  font-size: 10px;
                  color: #909090;
                  line-height: 12px;
                }

                .type-box {
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  font-size: 10px;
                  color: #909090;
                  line-height: 12px;

                  .icon {
                    display: block;
                    width: 10px;
                    height: 10px;
                  }
                }
              }
            }

            .management-box {
              font-size: 10px;
              color: #909090;
              line-height: 12px;
            }
          }
        }
      }
    }
  }

  :deep(.import-web-dialog) {
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
        .el-input-tag {
          background: #f9f9f9;
          border-radius: 8px;
          box-shadow: none;
          margin-top: 4px;
          margin-bottom: 18px;
          &.is-focused {
            box-shadow: 0 0 0 1px var(--el-color-primary) inset;
          }
        }
        .el-tag {
          border-radius: 12px;
        }
        .hased-tag-box {
          padding-bottom: 16px;
          .hased-label {
            margin-bottom: 10px;
            font-size: 14px;
            color: #909090;
            line-height: 20px;
          }
          .hased-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            .el-tag {
              cursor: pointer;
            }
          }
        }
        .rename-input {
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
}
</style>
<style lang="scss">
.custom-repository-popover {
  border-radius: 8px !important;
  padding: 12px 8px !important;

  .common-handle-box {
    .item {
      padding: 5px 10px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 22px;
      border-radius: 4px;
      cursor: pointer;
      &.active {
        background: var(--el-color-primary-light-9) !important;
        color: var(--el-color-primary);
        .check-icon {
          display: block;
        }
      }
      &:last-child {
        margin-bottom: 0;
      }

      &:hover {
        background: var(--primary-bg-color);
      }

      .title {
        flex: 1;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .check-icon {
        display: none;
        color: var(--el-color-primary);
      }
      .icon {
        flex-shrink: 0;
        display: block;
        width: 16px;
        height: 16px;
      }
    }
  }
}
</style>
