<template>
  <div
    class="repository-box"
    @click="resetChecks"
    @dragenter="handleDragEnter"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div v-show="showDragOverlay" class="drag-overlay">
      <div class="drag-overlay-content">
        <div class="drag-text">拖拽文件到这里</div>
        <div class="drag-type">
          支持.doc,.xls,.xlsx,.csv,.pdf,.txt,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif等格式
        </div>
      </div>
    </div>

    <div class="left-box">
      <div class="common-repository-box">
        <div class="common-box">
          <div class="common-box-left">
            <img class="icon" src="@renderer/assets/repository/common-repository-icon.png" alt="" />
            公共知识库
          </div>
          <div class="square-icon-box" @click="squaretabChange">
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
            <template v-for="(item, index) in commonCreateList" :key="item.id">
              <div
                v-show="index < 3 || createCommonExpand"
                class="item"
                :class="{ 'active-repository': activeRepositoryId == item.id }"
                @click="getRepositoryInfo(item.id)"
              >
                <div class="icon-box">
                  <img class="icon" :src="item.picurl || defaultCover" alt="" />
                </div>
                <div class="title">{{ item.title }}</div>
                <div v-if="item.is_prompt == 1" class="dot-dark"></div>
              </div>
            </template>
            <div v-if="commonCreateList.length > 3" class="expand" @click="commonExpandChange">
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
            <template v-for="(item, index) in commonJoinList" :key="item.id">
              <div
                v-show="index < 3 || joinCommonExpand"
                class="item"
                :class="{ 'active-repository': activeRepositoryId == item.id }"
                @click="getRepositoryInfo(item.id)"
              >
                <div class="icon-box">
                  <img class="icon" :src="item.picurl || defaultCover" alt="" />
                </div>
                <div class="title">{{ item.title }}</div>
                <div v-if="item.is_prompt == 1" class="dot-dark"></div>
              </div>
            </template>

            <div v-if="commonJoinList.length > 3" class="expand" @click="joinExpandChange">
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
          <template v-for="(item, index) in personalCreateList" :key="item.id">
            <div
              v-show="index < 3 || personageExpand"
              class="item"
              :class="{ 'active-repository': activeRepositoryId == item.id }"
              @click="getRepositoryInfo(item.id)"
            >
              <div class="icon-box">
                <img class="icon" :src="item.picurl || defaultCover" alt="" />
              </div>
              <div class="title">{{ item.title }}</div>
              <div v-if="item.is_prompt == 1" class="dot-dark"></div>
            </div>
          </template>

          <div class="storage-space-box">
            <div class="space-box">
              已使用 {{ userInfo?.space_use_total || '0MB' }}/{{ userInfo?.space || '0GB' }}
            </div>
            <div v-if="personalCreateList.length > 3" class="expand" @click="personageExpandChange">
              {{ personageExpand ? '收起' : '展开' }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="center-box">
      <div class="repository-detail-box">
        <el-popover
          v-if="Object.keys(activeRepository).length"
          ref="repositoryPopover"
          popper-class="custom-repository-popover"
          trigger="click"
          placement="bottom-start"
          :show-arrow="false"
        >
          <template #reference>
            <div class="handle">
              <img class="more-icon" src="@renderer/assets/repository/more-icon.png" alt="" />
              <div v-if="unreadApplyNumber > 0" class="dot-dark"></div>
            </div>
          </template>
          <div class="common-handle-box" @click="hidePopover(repositoryPopover)">
            <template
              v-if="
                activeRepository.is_public == 1 &&
                (activeRepository.user_permission?.is_manager == 1 ||
                  activeRepository.user_permission?.is_creator == 1)
              "
            >
              <div class="item" @click="beforeEditRepository">
                <img class="icon" src="@renderer/assets/repository/zlxg-icon.png" alt="" />
                <div class="title">资料修改</div>
              </div>
              <div class="item" @click="beforeRepositoryPermission">
                <img class="icon" src="@renderer/assets/repository/qxsz-icon.png" alt="" />
                <div class="title">权限设置</div>
              </div>
              <div class="item" @click="beforeRepositoryMember(true)">
                <img class="icon" src="@renderer/assets/repository/cysz-icon.png" alt="" />
                <div class="title">
                  知识库成员
                  <div v-if="unreadApplyNumber > 0" class="unreadApplyNumber">
                    {{ unreadApplyNumber > 99 ? 99 : unreadApplyNumber }}
                  </div>
                </div>
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
            </template>
            <template
              v-else-if="
                activeRepository.is_public == 1 &&
                activeRepository.user_permission?.is_manager == 0 &&
                activeRepository.user_permission?.is_creator == 0
              "
            >
              <div class="item" @click="beforeRepositoryFeedback">
                <img class="icon" src="@renderer/assets/repository/fk-icon.png" alt="" />
                <div class="title">反馈</div>
              </div>
              <div class="item" @click="addQuickAccess">
                <img class="icon" src="@renderer/assets/repository/kjfw-icon.png" alt="" />
                <div class="title">添加快捷访问</div>
              </div>
              <div class="item" @click="beforeQuitRepository">
                <img class="icon" src="@renderer/assets/repository/del-icon.png" alt="" />
                <div class="title">退出知识库</div>
              </div>
            </template>
            <template v-else-if="activeRepository.is_public == 0">
              <div class="item" @click="beforeEditRepository">
                <img class="icon" src="@renderer/assets/repository/zlxg-icon.png" alt="" />
                <div class="title">资料修改</div>
              </div>
              <div class="item" @click="addQuickAccess">
                <img class="icon" src="@renderer/assets/repository/kjfw-icon.png" alt="" />
                <div class="title">添加快捷访问</div>
              </div>
              <div class="item" @click="beforeDeleteRepository">
                <img class="icon" src="@renderer/assets/repository/del-icon.png" alt="" />
                <div class="title">删除知识库</div>
              </div>
            </template>
          </div>
        </el-popover>
        <div v-if="Object.keys(activeRepository).length" class="detail-box">
          <div class="top" @click="beforeEditRepository">
            <img class="cover-img" :src="activeRepository.picurl || defaultCover" alt="" />
            <div class="top-right">
              <div class="title">{{ activeRepository.title }}</div>
              <div class="top-right-bottom">
                <div class="author-or-num-box">
                  <img
                    class="avatar"
                    :src="activeRepository.create_user?.avatar || defaultAvatar"
                    alt=""
                  />
                  <div class="author-name">{{ activeRepository.create_user?.name }}</div>
                  <div class="vertical-line"></div>
                  <div class="num">{{ activeRepository.content_count }}个内容</div>
                </div>
                <div class="management-box" @click.stop="">
                  <MultiAvatar
                    :avatars="activeRepository.manager_avatars"
                    :size="18"
                    :max-count="5"
                    :spacing="-5"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="repository-des" @click="beforeEditRepository">
            {{ activeRepository.desc || '快来填写知识库的描述吧～' }}
          </div>
        </div>
        <el-skeleton v-else class="detail-box" animated>
          <template #template>
            <div class="top">
              <el-skeleton-item class="cover-img" />
              <div class="top-right">
                <el-skeleton-item class="title"></el-skeleton-item>
                <div class="top-right-bottom">
                  <div class="author-or-num-box">
                    <el-skeleton-item variant="image" class="avatar" />
                    <el-skeleton-item class="author-name" style="width: 60px" />
                    <el-skeleton-item class="author-name" style="width: 60px" />
                  </div>
                </div>
              </div>
            </div>
            <el-skeleton-item class="repository-des"> </el-skeleton-item>
          </template>
        </el-skeleton>
      </div>
      <div class="detail-list-box">
        <div v-show="!isSearching" class="list-handle-box">
          <div class="path-box">
            <!-- <span>内容</span> -->
            <!-- <div class="path-box"> -->
            <div
              v-for="(item, index) in pathList"
              :key="index"
              class="path-item"
              :class="{ active: index === pathList.length - 1 }"
              @click="pathChange(index)"
            >
              <el-icon v-if="index !== 0" class="icon">
                <ArrowRight />
              </el-icon>
              {{ item.name }}
            </div>
            <!-- </div> -->
          </div>
          <div class="icons">
            <el-popover
              v-if="
                (activeRepository.is_public == 1 &&
                  (activeRepository.user_permission?.is_manager == 1 ||
                    activeRepository.user_permission?.is_creator == 1)) ||
                activeRepository.is_public == 0
              "
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
                    <div class="item" @click="beforeUploadFiles('createNote')">
                      <img
                        class="icon"
                        src="@renderer/assets/repository/new-note-icon.png"
                        alt=""
                      />
                      <div class="title">新建笔记</div>
                    </div>
                    <div class="item" @click="beforeUploadFiles('importNotes')">
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
                  <el-icon class="check-icon">
                    <Check />
                  </el-icon>
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
            @keyup.enter="handleBlur"
          />
          <el-icon class="search-icon">
            <Search />
          </el-icon>
        </div>
        <div v-if="detailFileList.length" class="list-box">
          <template v-for="item in detailFileList" :key="item.id">
            <div
              v-if="item.item_type == 2"
              class="list-item"
              :class="{ 'active-repository': item.checked, is_top: item.is_top }"
              @contextmenu="(e) => showContextMenu(e, item)"
              @click="dirChange(item)"
            >
              <el-checkbox v-model="item.checked" class="checkbox" size="large" @click.stop="" />
              <img class="cover-img" :src="getFileIcon(item)" alt="" />
              <div class="item-right">
                <div v-if="!item.isCreated" class="title">{{ item.title }}</div>
                <div v-else class="title">
                  <el-input
                    v-model="item.title"
                    autofocus
                    class="create-input"
                    placeholder="请输入文件夹名称"
                    @keyup.enter="createOrRename(item)"
                    @blur="createOrRename(item)"
                    @click.stop=""
                  />
                </div>
                <div class="item-right-bottom">
                  <div class="size-or-num-box">
                    <div class="num">{{ item.file_count }}个内容</div>
                    <div class="vertical-line"></div>
                    <div class="size">{{ formatFileSize(item.total_space) }}</div>
                    <div v-if="item.tags" class="tags">
                      <div v-for="tag in item.tags.split(',')" :key="tag" class="tag">
                        <img class="icon" src="@renderer/assets/repository/tag-icon.png" alt="" />
                        {{ tag }}
                      </div>
                    </div>
                  </div>
                  <div class="management-box">{{ item.createtime }}</div>
                </div>
              </div>
            </div>
            <el-popover v-else popper-class="abstract-box-popover" placement="right-start">
              <template #reference>
                <div
                  class="list-item"
                  :class="{ 'active-repository': item.checked, is_top: item.is_top }"
                  @contextmenu="(e) => showContextMenu(e, item)"
                  @click="detailChange(item)"
                >
                  <el-checkbox
                    v-model="item.checked"
                    class="checkbox"
                    size="large"
                    @click.stop="contextMenu.show = false"
                  />
                  <img class="cover-img cover-file-img" :src="item.info?.icon" alt="" />
                  <div class="item-right">
                    <div v-if="!item.isCreated" class="title">{{ item.title }}</div>
                    <div v-else class="title">
                      <el-input
                        v-model="item.title"
                        autofocus
                        class="create-input"
                        placeholder="请输入文件名称"
                        @click.stop=""
                        @keyup.enter="createOrRename(item)"
                        @blur="createOrRename(item)"
                      />
                    </div>
                    <div class="item-right-bottom">
                      <div class="size-or-num-box">
                        <div class="type-box">
                          <img class="icon" :src="getFileIcon(item)" alt="" />
                          <span v-if="item.item_type == 3" class="web-url">{{
                            item.info.web_url
                          }}</span>
                          <span v-else-if="item.title.split('.').pop() == 'txt'">文本</span>
                          <span
                            v-else-if="
                              ['png', 'jpg', 'jpeg', 'gif'].includes(item.title.split('.').pop())
                            "
                            >图片</span
                          >
                          <span v-else>{{ item.title.split('.').pop().toLocaleUpperCase() }}</span>
                        </div>
                        <div v-if="item.item_type != 3" class="size">
                          {{ formatFileSize(item.total_space) }}
                        </div>
                        <div v-if="item.tags" class="tags">
                          <div v-for="tag in item.tags.split(',')" :key="tag" class="tag">
                            <img
                              class="icon"
                              src="@renderer/assets/repository/tag-icon.png"
                              alt=""
                            />
                            {{ tag }}
                          </div>
                        </div>
                      </div>
                      <div class="management-box">{{ item.createtime }}</div>
                    </div>
                  </div>
                </div>
              </template>
              <div class="abstract-box">
                <div class="abstract-title">{{ item.title }}</div>
                <div class="time">上传时间：{{ item.createtime }}</div>
                <div class="abstract-desc">{{ item.info?.ai_desc || '该内容暂未生成摘要' }}</div>
              </div>
            </el-popover>
          </template>
        </div>
        <div v-else class="empty">
          <div class="empty-text">暂无内容，快去添加吧</div>
        </div>
      </div>
    </div>
    <div class="right-box">
      <RepositoryChatPage
        :know-id="activeRepository.id"
        :item-id="parentItemId"
        :selecte-file-id-list="selecteFileIdList"
        :repository-name="activeRepository.title"
        :questions="activeRepository.questions"
      />
    </div>
    <HandleContextMenu
      :show="contextMenu.show"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :permission-type="contextMenu.permission_type"
      :action-sheet="contextMenu.actionSheet"
      @action="handleContextMenuAction"
    />
    <UploadFiles
      v-model="uploadVisible"
      :ready-upload-list="ReadyUploadList"
      :knowledge-id="activeRepositoryId"
      :knowledge-path="
        activeRepository.title +
        (pathList.length > 1 ? '/' : '') +
        pathList
          .filter((item) => item.id)
          .map((item) => item.name)
          .join('/')
      "
      :parent-item-id="parentItemId"
      @close="closeUploadDialog"
      @refresh-list="refreshList"
      @before-upload-files="beforeUploadFiles"
    />
    <!-- <el-upload
      v-show="false"
      ref="elUploadRef"
      :auto-upload="false"
      multiple
      accept=".txt,.png,.jpg,.jpeg,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
      :on-change="handleSelectChange"
    >
      <button ref="uploadBtnRef"></button>
    </el-upload> -->
    <input
      v-show="false"
      ref="uploadBtnRef"
      type="file"
      multiple
      accept=".txt,.png,.jpg,.jpeg,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
      :onchange="handleSelectChange"
    />
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
      <div v-if="hasedTagList.length" class="hased-tag-box">
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
      :repository="activeRepository"
      :submit-type="submitRepositoryType"
      @close="closeAddRepositoryDialog"
      @submit-repository="submitRepository"
    />
    <!-- 知识库权限弹窗 -->
    <RepositoryPermission
      v-model="repositoryPermissionVisible"
      :permission="repositoryPermission"
      @close="closeRepositoryPermissionDialog"
      @set-permission="setRepositoryPermission"
    />
    <!-- 知识库成员弹窗 -->
    <RepositoryMember
      v-model="repositoryMemberVisible"
      :member-list="repositoryMemberList"
      :unread-apply-number="unreadApplyNumber"
      :apply-list="repositoryMemberApplyList"
      :tree-data="repositoryMemberTree"
      @close="closeRepositoryMemberDialog"
      @set-permission="setRepositoryMemberPermission"
    />
    <input
      ref="directoryInputRef"
      type="file"
      webkitdirectory
      directory
      accept=".doc,.xls,.xlsx,.pdf,.txt,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.gif"
      multiple
      style="display: none"
      @change="handleDirectorySelect"
    />
    <take-notes
      v-model="onlineNoteVisible"
      import-type="repository"
      @submit-import="submitImport"
    />
    <el-dialog
      v-model="conflictVisible"
      class="custom-transition-dialog"
      width="460"
      align-center
      :close-on-click-modal="false"
      :show-close="false"
      transition="dialog-bounce"
    >
      <template #header>
        <el-icon style="font-size: 20px; color: #e6a23c">
          <WarnTriangleFilled />
        </el-icon>
        <span class="title">同名文件</span>
      </template>
      <div class="conflict-title">
        监测到当前位置存在以下同名文件{{
          conflictFiles[0]?.type == 'directory' ? '夹' : ''
        }}，请选择操作
      </div>
      <div class="conflict-box">
        <div v-for="(item, index) in conflictFiles" :key="index" class="conflict-item">
          <img v-if="item.type == 'directory'" :src="catalogueIcon" class="conflict-icon" alt="" />
          <img v-else class="conflict-icon" :src="getFileIcon(item)" alt="" />
          <div class="conflict-name">{{ item?.title || '' }}</div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="retainAll">保留全部</el-button>
          <el-button
            v-if="conflictFiles.length && conflictFiles[0].type != 'directory'"
            class="cancel-btn"
            type="primary"
            @click="displace"
          >
            替换
          </el-button>
          <el-button class="cancel-btn" @click="cancelConflict">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, nextTick, inject, computed } from 'vue'
import { on, off } from '@renderer/utils/eventBus'
import { useCheckLogin, useUserInfo } from '@renderer/hooks/checkLogin'
import { useUserStore } from '@renderer/stores/user'
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
import csvIcon from '@renderer/assets/file-icons/csv-icon.png'
import feedbackIcon from '@renderer/assets/repository/fk-icon.png'
import headSquareIcon from '@renderer/assets/repository/head-square-icon.png'
import defaultCover from '@renderer/assets/repository/default-cover.png'
import defaultAvatar from '@renderer/assets/default-avatar.png'
import noteIcon from '@renderer/assets/menu/note-icon.png'
import { WarnTriangleFilled } from '@element-plus/icons-vue'
import {
  get_knows,
  create_know,
  edit_know,
  del_know,
  get_know_info,
  get_know_permission,
  set_know_permission,
  get_know_persons,
  set_know_person,
  apply_know_persons,
  apply_know_agree,
  know_apply_number,
  add_know_person,
  add_access,
  setTags,
  doTopKnowFile,
  create_dir,
  reNameItem,
  delItem,
  create_know_website,
  setKnowItemPermission,
  withdraw_join,
  import_note
} from '@renderer/api/repository'
import { user_info } from '@renderer/api/user'
const props = defineProps({
  attrs: {
    type: Object,
    default: () => ({})
  }
})
// 拖拽相关数据
const showDragOverlay = ref(false)

// 拖拽事件处理
const handleDragEnter = (event) => {
  event.preventDefault()
  event.stopPropagation()
  showDragOverlay.value = true
}

const handleDragOver = (event) => {
  event.preventDefault()
  event.stopPropagation()
}

const handleDragLeave = (event) => {
  event.preventDefault()
  event.stopPropagation()
  // 只有当拖拽离开整个容器时才隐藏遮罩
  if (!event.currentTarget.contains(event.relatedTarget)) {
    showDragOverlay.value = false
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  event.stopPropagation()
  showDragOverlay.value = false

  const files = event.dataTransfer.files
  if (!files || !files.length) return

  if (!activeRepositoryId.value) {
    // eslint-disable-next-line no-undef
    ElMessage.warning('请先选择知识库')
    return
  }
  if (
    activeRepository.value.is_public == 1 &&
    activeRepository.value.user_permission?.is_manager != 1 &&
    activeRepository.value.user_permission?.is_creator != 1
  ) {
    // eslint-disable-next-line no-undef
    ElMessage.warning('当前知识库没有权限上传文件')
    return
  }
  // 处理拖拽的文件
  handleDroppedFiles(files)
}

// 处理拖拽的文件
const handleDroppedFiles = (files) => {
  const validFiles = Array.from(files).filter((file) => {
    const allowedTypes = [
      '.txt',
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.pdf',
      '.doc',
      '.docx',
      '.xls',
      '.xlsx',
      '.ppt',
      '.pptx'
    ]
    const fileExt = '.' + file.name.split('.').pop().toLowerCase()
    return allowedTypes.includes(fileExt)
  })

  if (validFiles.length === 0) {
    // eslint-disable-next-line no-undef
    ElMessage.warning('不支持的文件类型')
    return
  }
  tempUploadList.value = []
  conflictFiles.value = []

  // 准备上传文件列表
  tempUploadList.value = validFiles.map((file) => ({
    file: file,
    title: file.name,
    name: file.name,
    type: 'file',
    uploadStatus: 'pending'
  }))
  if (detailFileList.value.length) {
    tempUploadList.value.filter((readyItem) => {
      var flag = detailFileList.value.some(
        (item) => item.title == readyItem.name && item.item_type == 1
      )
      if (flag) {
        conflictFiles.value.push(readyItem)
      }
    })
    if (conflictFiles.value.length) {
      conflictVisible.value = true
      return
    }
  }
  // 打开上传对话框
  ReadyUploadList.push(...tempUploadList.value)
  uploadVisible.value = true
}
const getUserInfo = () => {
  const userStore = useUserStore()
  return user_info({ t: Date.now() }).then((res) => {
    if (res.code == 200) {
      userStore.updateUser(res.data?.user_info)
    }
  })
}
const userInfo = useUserInfo()
let repositorySortPopover = ref(null)
let repositoryNotePopover = ref(null)
let sortList = ref([
  {
    label: '默认',
    value: 'createtime'
  },
  {
    label: '大小',
    value: 'total_space'
  },
  {
    label: '名称',
    value: 'title'
  }
])
let directoryInputRef = ref(null)
let onlineNoteVisible = ref(false)
// 未读申请数量
let unreadApplyNumber = ref(0)
let sortType = ref('createtime')
let addRepositoryVisible = ref(false)
const addNewTab = inject('addNewTab')
const squaretabChange = () => {
  addNewTab({
    icon: headSquareIcon,
    title: '知识库广场',
    url: 'Square',
    isInternal: true
  })
}
const downloadFile = (url, fileName) => {
  const x = new XMLHttpRequest()
  x.open('GET', url, true)
  x.responseType = 'blob'
  x.onload = () => {
    const url = window.URL.createObjectURL(x.response)
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.download = fileName
    a.click()
    a.remove()
  }
  x.send()
}
// 到达详情
const detailChange = (item) => {
  if (item.permission_type == 1 || item.permission_type == 2) {
    if (item.item_type == 3) {
      addNewTab({
        icon: item.info?.icon,
        title: item.title,
        url: item.info?.web_url,
        isInternal: false
      })
    } else {
      addNewTab({
        icon: item.info?.icon,
        title: item.title,
        url: 'DocumentDetail',
        isInternal: true,
        attrs: {
          fileUrl: item.info?.url,
          fileName: item.title
        }
      })
    }
  } else {
    // eslint-disable-next-line no-undef
    ElMessage({
      message: '您没有权限查看',
      type: 'warning'
    })
  }
}
// 公共知识库我的创建
const commonCreateList = ref([])
const getCommonCreateList = (repositoryId = '') => {
  get_knows({ is_public: 1, is_creater: 1 }).then((res) => {
    commonCreateList.value = res.data
    if (repositoryId) {
      const repo = commonCreateList.value.find((item) => item.id == repositoryId)
      if (repo) {
        activeRepositoryId.value = repo.id
        repositoryType.value = 'common'
        getRepositoryInfo(activeRepositoryId.value)
        return
      }
    }
    if (!activeRepositoryId.value && commonCreateList.value.length) {
      activeRepositoryId.value = commonCreateList.value[0].id
      repositoryType.value = 'common'
      getRepositoryInfo(activeRepositoryId.value)
    } else if (
      !activeRepositoryId.value &&
      !commonCreateList.value.length &&
      personalCreateList.value.length
    ) {
      activeRepositoryId.value = personalCreateList.value[0].id
      repositoryType.value = 'personage'
      getRepositoryInfo(activeRepositoryId.value)
    } else if (
      !activeRepositoryId.value &&
      !personalCreateList.value.length &&
      commonJoinList.value.length
    ) {
      activeRepositoryId.value = commonJoinList.value[0].id
      repositoryType.value = 'common'
      getRepositoryInfo(activeRepositoryId.value)
    }
  })
}
// 公共知识库我的加入
const commonJoinList = ref([])
const getCommonJoinList = (repositoryId = '') => {
  get_knows({ is_public: 1, is_creater: 0 }).then((res) => {
    commonJoinList.value = res.data
    if (repositoryId) {
      const repo = commonJoinList.value.find((item) => item.id == repositoryId)
      if (repo) {
        activeRepositoryId.value = repo.id
        repositoryType.value = 'common'
        getRepositoryInfo(activeRepositoryId.value)
      }
    }
    if (!activeRepositoryId.value && commonJoinList.value.length) {
      activeRepositoryId.value = commonJoinList.value[0].id
      repositoryType.value = 'personage'
      getRepositoryInfo(activeRepositoryId.value)
    } else if (
      !activeRepositoryId.value &&
      !commonJoinList.value.length &&
      commonCreateList.value.length
    ) {
      activeRepositoryId.value = commonCreateList.value[0].id
      repositoryType.value = 'common'
      getRepositoryInfo(activeRepositoryId.value)
    } else if (
      !activeRepositoryId.value &&
      !commonCreateList.value.length &&
      personalCreateList.value.length
    ) {
      activeRepositoryId.value = personalCreateList.value[0].id
      repositoryType.value = 'common'
      getRepositoryInfo(activeRepositoryId.value)
    }
  })
}
// 个人知识库我的创建
const personalCreateList = ref([])
const getPersonalCreateList = (repositoryId = '') => {
  get_knows({ is_public: 0, is_creater: 1 }).then((res) => {
    personalCreateList.value = res.data
    if (repositoryId) return
    if (!activeRepositoryId.value && personalCreateList.value.length) {
      activeRepositoryId.value = personalCreateList.value[0].id
      repositoryType.value = 'personage'
      getRepositoryInfo(activeRepositoryId.value)
    } else if (
      !activeRepositoryId.value &&
      !personalCreateList.value.length &&
      commonCreateList.value.length
    ) {
      activeRepositoryId.value = commonCreateList.value[0].id
      repositoryType.value = 'common'
      getRepositoryInfo(activeRepositoryId.value)
    } else if (
      !activeRepositoryId.value &&
      !commonCreateList.value.length &&
      commonJoinList.value.length
    ) {
      activeRepositoryId.value = commonJoinList.value[0].id
      repositoryType.value = 'common'
      getRepositoryInfo(activeRepositoryId.value)
    }
  })
}
const refreshRepository = () => {
  hideContextMenu()
  getCommonCreateList()
  getCommonJoinList()
  getPersonalCreateList()
}
onUnmounted(() => {
  document.removeEventListener('click', hideContextMenu)
  off('refresh-repository', refreshRepository)
})
onMounted(async () => {
  document.addEventListener('click', hideContextMenu)
  if (useCheckLogin().value) {
    await getUserInfo()
  }
  getCommonCreateList(props.attrs.RepositoryId)
  getCommonJoinList(props.attrs.RepositoryId)
  getPersonalCreateList(props.attrs.RepositoryId)
  on('refresh-repository', refreshRepository)
})
const repositoryPermission = ref({})
// 获取知识库权限
const getRepositoryPermission = () => {
  get_know_permission({ know_id: activeRepositoryId.value }).then((res) => {
    if (res.code == 200) {
      repositoryPermission.value = res.data
      repositoryMemberTree.value = res.data.tree
    }
  })
}
// 反馈
const beforeRepositoryFeedback = () => {
  addNewTab({
    icon: feedbackIcon,
    title: '反馈中心',
    url: 'FeedbackCenter',
    backgroundColor: 'var(--primary-bg-color)',
    isInternal: true,
    attrs: {
      knowId: activeRepositoryId.value
    }
  })
}
const closeAddRepositoryDialog = () => {
  addRepositoryVisible.value = false
}
// 确认添加知识库
const submitRepository = (repository) => {
  var data = {
    ...repository
  }
  if (repositoryType.value == 'common') {
    data.is_public = 1
    if (submitRepositoryType.value == 'create') {
      create_know(data).then((res) => {
        if (res.code == 200) {
          // eslint-disable-next-line no-undef
          ElMessage({
            type: 'primary',
            message: '创建成功'
          })
          activeRepositoryId.value = res.data.insert_id
          getRepositoryInfo(activeRepositoryId.value)
          getCommonCreateList()
          closeAddRepositoryDialog()
        }
      })
    } else {
      data.know_id = activeRepository.value.id
      edit_know(data).then((res) => {
        if (res.code == 200) {
          // eslint-disable-next-line no-undef
          ElMessage({
            type: 'primary',
            message: '修改成功'
          })
          getRepositoryInfo(activeRepository.value.id)
          closeAddRepositoryDialog()
          if (activeRepository.value?.user_permission.is_creator == 1) {
            getCommonCreateList()
          } else {
            getCommonJoinList()
          }
        }
      })
    }
  } else {
    data.is_public = 0
    if (submitRepositoryType.value == 'create') {
      create_know(data).then((res) => {
        if (res.code == 200) {
          // eslint-disable-next-line no-undef
          ElMessage({
            type: 'primary',
            message: '创建成功'
          })
          activeRepositoryId.value = res.data.insert_id
          getRepositoryInfo(activeRepositoryId.value)
          getPersonalCreateList()
          closeAddRepositoryDialog()
        }
      })
    } else {
      data.know_id = activeRepository.value.id
      edit_know(data).then((res) => {
        if (res.code == 200) {
          // eslint-disable-next-line no-undef
          ElMessage({
            type: 'primary',
            message: '修改成功'
          })
          getRepositoryInfo(activeRepository.value.id)
          getPersonalCreateList()
          closeAddRepositoryDialog()
        }
      })
    }
  }

  // addRepositoryVisible.value = false
}
const activeRepositoryId = ref('')
// 添加知识库类型
const repositoryType = ref('common')
// 知识库提交类型
const submitRepositoryType = ref('create')
// 知识库详情文件列表
const detailFileList = ref([])
// 活动知识库
const activeRepository = ref({})
// 导入笔记
const submitImport = (ids) => {
  import_note({
    knowledge_id: activeRepositoryId.value,
    note_ids: ids,
    item_id: parentItemId.value || 0
  }).then((res) => {
    if (res.code == 200) {
      // eslint-disable-next-line no-undef
      ElMessage({
        type: 'primary',
        message: '导入成功'
      })
      refreshList()
      onlineNoteVisible.value = false
    }
  })
}
const selecteFileIdList = computed(() => {
  return detailFileList.value
    .filter((item) => item.checked && item.item_type != 2)
    .map((item) => {
      return {
        fileId: item.info.file_key,
        fileName: item.info.title,
        fileUrl: item.info.url
      }
    })
})
const getRepositoryInfo = (id) => {
  isSearching.value = false
  searchText.value = ''
  activeRepositoryId.value = id
  pathList.value = [
    {
      name: '内容',
      id: 0
    }
  ]
  get_know_info({
    know_id: id,
    parent_item_id: 0,
    sort_type: sortType.value,
    search_key: searchText.value
  }).then((res) => {
    if (res.code == 200) {
      activeRepository.value = res.data
      detailFileList.value = res.data.items
      if (activeRepository.value.is_public == 1) {
        getRepositoryPermission()
        getUnreadApplyNumber()
      }
    }
  })
}
// 刷新知识库详情列表
const refreshList = () => {
  get_know_info({
    know_id: activeRepository.value.id,
    parent_item_id: parentItemId.value,
    sort_type: sortType.value,
    search_key: searchText.value
  }).then((res) => {
    if (res.code == 200) {
      activeRepository.value = res.data
      detailFileList.value = res.data.items
      getUserInfo()
      // if (activeRepository.value.is_public == 1) {
      //   getRepositoryPermission()
      //   getUnreadApplyNumber()
      // }
    }
  })
}
const getUnreadApplyNumber = () => {
  know_apply_number({ know_id: activeRepositoryId.value }).then((res) => {
    if (res.code == 200) {
      unreadApplyNumber.value = res.data.new_number
    }
  })
}
// 唤起添加知识库弹窗
const beforeAddRepository = (type) => {
  repositoryType.value = type
  submitRepositoryType.value = 'create'
  addRepositoryVisible.value = true
}
// 资料修改
// 唤起资料修改弹窗
const beforeEditRepository = () => {
  repositoryType.value = activeRepository.value.is_public == 1 ? 'common' : 'personage'
  submitRepositoryType.value = 'update'
  if (activeRepository.value.is_public == 1) {
    if (activeRepository.value?.user_permission.is_creator == 1) {
      addRepositoryVisible.value = true
    } else if (activeRepository.value?.user_permission.is_manager == 1) {
      addRepositoryVisible.value = true
    }
  } else {
    addRepositoryVisible.value = true
  }
}
// 添加快捷访问
const addQuickAccess = () => {
  add_access({ know_id: activeRepository.value.id }).then((res) => {
    if (res.code == 200) {
      // eslint-disable-next-line no-undef
      ElMessage({
        type: 'primary',
        message: '添加成功'
      })
    }
  })
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
      del_know({ know_id: activeRepository.value.id }).then((res) => {
        if (res.code == 200) {
          // eslint-disable-next-line no-undef
          ElMessage({
            type: 'primary',
            message: '删除成功'
          })
          if (activeRepository.value.is_public == 1) {
            if (activeRepository.value?.user_permission?.is_creator) {
              getCommonCreateList()
            } else if (!activeRepository.value?.user_permission?.is_creator) {
              getCommonJoinList()
            } else {
              getCommonCreateList()
            }
            activeRepositoryId.value = ''
            activeRepository.value = {}
          } else {
            activeRepositoryId.value = ''
            activeRepository.value = {}
            getPersonalCreateList()
          }
          getUserInfo()
        }
      })
    })
    .catch(() => {})
}
// 退出知识库
const beforeQuitRepository = () => {
  // eslint-disable-next-line no-undef
  ElMessageBox.confirm('确认退出吗？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      withdraw_join({ know_id: activeRepository.value.id }).then((res) => {
        if (res.code == 200) {
          // eslint-disable-next-line no-undef
          ElMessage({
            type: 'primary',
            message: '退出成功'
          })
          if (activeRepository.value.is_public == 1) {
            if (activeRepository.value?.user_permission?.is_creator) {
              getCommonCreateList()
            } else if (!activeRepository.value?.user_permission?.is_creator) {
              getCommonJoinList()
            } else {
              getCommonCreateList()
            }
            activeRepository.value = {}
            activeRepositoryId.value = ''
          } else {
            getPersonalCreateList()
            activeRepository.value = {}
            activeRepositoryId.value = ''
          }
        }
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
let tagList = ref([])
let editTagVisible = ref(false)
let hasedTagList = ref([])
let itemId = ref('')
const submitEditTag = () => {
  var data = {
    knowledge_id: activeRepository.value.id,
    tags: tagList.value.join(','),
    item_id: itemId.value
  }
  setTags(data).then((res) => {
    if (res.code == 200) {
      refreshList()
      editTagVisible.value = false
    }
  })
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
  set_know_permission({
    know_id: activeRepository.value.id,
    ...permission
  }).then((res) => {
    if (res.code == 200) {
      // eslint-disable-next-line no-undef
      ElMessage({
        type: 'primary',
        message: '知识库权限设置成功'
      })
      repositoryPermissionVisible.value = false
      getRepositoryPermission()
    }
  })
}
// 知识库成员弹窗
let repositoryMemberVisible = ref(false)
// 知识库成员列表
let repositoryMemberList = ref([])
// 知识库成员申请列表
let repositoryMemberApplyList = ref([])
// 知识库成员树
let repositoryMemberTree = ref([])
const beforeRepositoryMember = async (visible = true) => {
  try {
    await get_know_persons({ know_id: activeRepository.value.id }).then((res) => {
      if (res.code == 200) {
        repositoryMemberList.value = res.data
      }
    })
    await apply_know_persons({ know_id: activeRepository.value.id }).then((res) => {
      if (res.code == 200) {
        repositoryMemberApplyList.value = res.data
      }
    })
    repositoryMemberVisible.value = visible
  } catch (err) {
    console.log(err)
    repositoryMemberVisible.value = false
  }
}
const closeRepositoryMemberDialog = () => {
  repositoryMemberVisible.value = false
}
// 确认设置知识库成员权限
const setRepositoryMemberPermission = (permission) => {
  if (permission.type == 'member') {
    set_know_person({
      know_id: activeRepository.value.id,
      ...permission.data
    }).then((res) => {
      if (res.code == 200) {
        // eslint-disable-next-line no-undef
        ElMessage({
          type: 'primary',
          message: '设置成功'
        })
        beforeRepositoryMember()
      }
    })
  } else if (permission.type == 'join') {
    add_know_person({
      know_id: activeRepository.value.id,
      ...permission.data
    }).then((res) => {
      if (res.code == 200) {
        // eslint-disable-next-line no-undef
        ElMessage({
          type: 'primary',
          message: '添加成功'
        })
        beforeRepositoryMember(false)
      }
    })
  } else if (permission.type == 'allowable') {
    apply_know_agree({
      know_id: activeRepository.value.id,
      ...permission.data
    }).then((res) => {
      if (res.code == 200) {
        // eslint-disable-next-line no-undef
        ElMessage({
          type: 'primary',
          message: '添加成功'
        })
        getUnreadApplyNumber()
        beforeRepositoryMember()
      }
    })
  }
  // repositoryMemberVisible.value = false
}
// 创建文件夹或重命名
const createOrRename = (item) => {
  if (!item.title.trim()) {
    refreshList()
    return
  }
  var data
  if (item.item_type == 2) {
    if (!item.updatetime) {
      data = {
        know_id: activeRepository.value.id,
        folder_name: item.title,
        parent_item_id: parentItemId.value
      }
      create_dir(data).then((res) => {
        if (res.code == 200) {
          item.isCreated = false
          refreshList()
        }
      })
    } else {
      data = {
        item_id: item.id,
        new_name: item.title
      }
      reNameItem(data).then((res) => {
        if (res.code == 200) {
          item.isCreated = false
          refreshList()
        }
      })
    }
  } else {
    data = {
      item_id: item.id,
      new_name: item.title
    }
    reNameItem(data).then((res) => {
      if (res.code == 200) {
        item.isCreated = false
        refreshList()
      }
    })
  }
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
      var data = {
        web_url: webForm.value.urls,
        know_id: activeRepository.value.id,
        parent_item_id: parentItemId.value
      }
      // eslint-disable-next-line no-undef
      const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.3)'
      })
      create_know_website(data)
        .then((res) => {
          if (res.code == 200) {
            // eslint-disable-next-line no-undef
            ElMessage({
              type: 'primary',
              message: '添加成功'
            })
            refreshList()
            importWebVisible.value = false
            webForm.value.urls = ''
          }
        })
        .finally(() => {
          loading.close()
        })
    } else {
      console.log('表单验证失败')
    }
  })
}
let activeFiles = computed(() => {
  return detailFileList.value.filter((item) => item.checked)
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

  if (
    activeRepository.value.user_permission?.is_creator ||
    activeRepository.value.user_permission?.is_manager
  ) {
    item.checked = true
    e.preventDefault()
    if (activeFiles.value.length > 1) {
      contextMenu.value = {
        show: true,
        permission_type: 'cannotView',
        x: e.clientX,
        y: e.clientY,
        actionSheet: [
          {
            name: '删除',
            icon: deleteIcon,
            action: 'delete'
          }
        ]
      }
    } else {
      if (item.item_type == 2) {
        contextMenu.value = {
          show: true,
          permission_type: 'cannotView',
          x: e.clientX,
          y: e.clientY,
          actionSheet: [
            {
              name: item.is_top ? '取消置顶' : '置顶',
              icon: item.is_top ? unstickIcon : topIcon,
              action: item.is_top ? 'unstick' : 'top'
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
              name: '删除',
              icon: deleteIcon,
              action: 'delete'
            }
          ]
        }
      } else {
        contextMenu.value = {
          show: true,
          permission_type:
            activeFiles.value[0].permission_type == 1
              ? 'canView'
              : activeFiles.value[0].permission_type == 2
                ? 'private'
                : 'cannotView',
          x: e.clientX,
          y: e.clientY,
          actionSheet: [
            {
              name: item.is_top ? '取消置顶' : '置顶',
              icon: item.is_top ? unstickIcon : topIcon,
              action: item.is_top ? 'unstick' : 'top'
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
              name: '删除',
              icon: deleteIcon,
              action: 'delete'
            }
          ]
        }
        if (repositoryPermission.value.setting?.permission_type == 1) {
          contextMenu.value.actionSheet.splice(
            3,
            0,
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
            }
          )
        } else if (repositoryPermission.value.setting?.permission_type == 2) {
          contextMenu.value.actionSheet.splice(3, 0, {
            name: '内容权限',
            icon: permissionIcon,
            action: 'permission',
            children: [
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
          })
        }
      }
    }
  } else if (item.permission_type === 1) {
    if (item.item_type == 1) {
      item.checked = true
      contextMenu.value = {
        show: true,
        permission_type: 'cannotView',
        x: e.clientX,
        y: e.clientY,
        actionSheet: [
          {
            name: '导出',
            icon: exportIcon,
            action: 'export'
          }
        ]
      }
    }
  }
}
const handleContextMenuAction = ({ action }) => {
  if (action === 'top') {
    // 置顶
    doTopKnowFile({
      knowledge_id: activeRepositoryId.value,
      item_id: activeFiles.value[0].id,
      is_top: 1
    }).then((res) => {
      if (res.code == 200) {
        refreshList()
      }
    })
  } else if (action === 'unstick') {
    // 取消置顶
    doTopKnowFile({
      knowledge_id: activeRepositoryId.value,
      item_id: activeFiles.value[0].id,
      is_top: 0
    }).then((res) => {
      if (res.code == 200) {
        refreshList()
      }
    })
  } else if (action === 'editTag') {
    // 编辑标签
    tagList.value = JSON.parse(JSON.stringify(activeFiles.value[0].tags?.split(',') || []))
    hasedTagList.value = []
    tagList.value.map((item) => {
      var tag = {
        name: item,
        type: 'primary',
        id: new Date().getTime()
      }
      hasedTagList.value.push(tag)
    })
    itemId.value = activeFiles.value[0].id
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
    downloadFile(
      activeFiles.value[0]?.info.url,
      `${activeFiles.value[0]?.info.title.split('.')[0] || '文件'}-${new Date().getTime()}.${activeFiles.value[0]?.info.title.split('.').pop()}`
    )
  } else if (action === 'delete') {
    let tempFiles = JSON.parse(JSON.stringify(activeFiles.value))
    // 删除
    // eslint-disable-next-line no-undef
    ElMessageBox.confirm('确认删除吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        // eslint-disable-next-line no-undef
        let loadingInstance = ElLoading.service({
          lock: true,
          text: '删除中...',
          background: 'rgba(0, 0, 0, 0.3)'
        })
        delItem({
          item_ids: tempFiles.map((item) => item.id)
        })
          .then((res) => {
            if (res.code == 200) {
              // eslint-disable-next-line no-undef
              ElMessage({
                type: 'primary',
                message: '删除成功'
              })
              refreshList()
            }
          })
          .finally(() => {
            loadingInstance.close()
          })
      })
      .catch(() => {})
  } else if (action === 'canView') {
    // 可查看、导出
    setKnowItemPermission({
      knowledge_id: activeRepositoryId.value,
      item_id: activeFiles.value[0].id,
      permission_type: 1
    }).then((res) => {
      if (res.code == 200) {
        refreshList()
      }
    })
  } else if (action === 'private') {
    // 可查看、不可导出
    setKnowItemPermission({
      knowledge_id: activeRepositoryId.value,
      item_id: activeFiles.value[0].id,
      permission_type: 2
    }).then((res) => {
      if (res.code == 200) {
        refreshList()
      }
    })
  } else if (action === 'cannotView') {
    // 不可查看
    setKnowItemPermission({
      knowledge_id: activeRepositoryId.value,
      item_id: activeFiles.value[0].id,
      permission_type: 3
    }).then((res) => {
      if (res.code == 200) {
        refreshList()
      }
    })
  }
  contextMenu.value.show = false
}
const resetChecks = () => {
  detailFileList.value.map((item) => {
    if (item.item_type == 2) {
      item.checked = false
    }
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
  if (!searchText.value.trim()) {
    isSearching.value = false
  }
  refreshList()
}
const addMenuClick = () => {
  // console.log('添加文件')
}
const sortMenuClick = (item) => {
  sortType.value = item.value
  refreshList()
}
const searchMenuClick = () => {
  isSearching.value = true
  nextTick(() => {
    searchBoxRef.value.focus()
  })
}
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
// let elUploadRef = ref(null) //elinput 组件
let uploadBtnRef = ref(null) //elinput上传按钮触发
let uploadVisible = ref(false) //自定义上传组件
const closeUploadDialog = () => {
  uploadVisible.value = false
}

const beforeUploadFiles = (type) => {
  if (type == 'local-file') {
    uploadBtnRef.value.value = ''
    ReadyUploadList.length = 0
    uploadBtnRef.value?.click()
  } else if (type == 'local-folder') {
    directoryInputRef.value.value = ''
    ReadyUploadList.length = 0
    // openDirectorySelector()
    directoryInputRef.value?.click()
  } else if (type == 'import-web') {
    importWebVisible.value = true
    webForm.value.urls = ''
  } else if (type == 'createFolder') {
    detailFileList.value.unshift({
      item_type: 2,
      title: '新建文件夹' + Date.now(),
      file_count: 0,
      total_space: 0,
      createtime: '',
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
  } else if (type == 'createNote') {
    // createNoteVisible.value = true
    addNewTab({
      title: '笔记',
      url: 'Note',
      icon: noteIcon,
      isInternal: true
    })
  } else if (type == 'importNotes') {
    onlineNoteVisible.value = true
  }
}
const ReadyUploadList = reactive([])
const conflictFiles = ref([])
const tempUploadList = ref([])
const conflictVisible = ref(false)
const retainAll = () => {
  var list = tempUploadList.value.map((item) => {
    item.same_name_type = 0
    return item
  })
  ReadyUploadList.push(...list)
  conflictVisible.value = false
  uploadVisible.value = true
}
const displace = () => {
  var list = tempUploadList.value.map((item) => {
    item.same_name_type = 1
    return item
  })
  ReadyUploadList.push(...list)
  conflictVisible.value = false
  uploadVisible.value = true
}
const cancelConflict = () => {
  conflictVisible.value = false
}
const handleSelectChange = (event) => {
  tempUploadList.value = []
  conflictFiles.value = []
  if (event.target.files.length == 0) {
    return
  }
  tempUploadList.value = Array.from(event.target.files).map((item) => {
    return {
      uploadStatus: 'pending',
      title: item.name,
      name: item.name,
      file: item,
      type: 'file'
    }
  })
  if (detailFileList.value.length) {
    detailFileList.value.filter((item) => {
      tempUploadList.value.filter((readyItem) => {
        if (readyItem.title == item.title && item.item_type == 1) {
          conflictFiles.value.push(readyItem)
        }
      })
    })
    if (conflictFiles.value.length) {
      conflictVisible.value = true
      return
    }
  }

  ReadyUploadList.push(...tempUploadList.value)
  uploadVisible.value = true
}
// 分析文件夹结构
// const analyzeFolderStructure = (files) => {
//   var folderTree = {}

//   files.forEach((file) => {
//     const path = file.webkitRelativePath
//     const parts = path.split('/')

//     let currentLevel = folderTree

//     parts.forEach((part, index) => {
//       if (index === parts.length - 1) {
//         // 文件
//         currentLevel[part] = {
//           type: 'file',
//           size: file.size,
//           file: file
//         }
//       } else {
//         // 文件夹
//         if (!currentLevel[part]) {
//           currentLevel[part] = {
//             type: 'folder',
//             children: {}
//           }
//         }
//         currentLevel = currentLevel[part].children
//       }
//     })
//   })
//   return folderTree
// }
const handleDirectorySelect = (event) => {
  let exts = [
    'doc',
    'xls',
    'xlsx',
    'pdf',
    'txt',
    'docx',
    'ppt',
    'pptx',
    'png',
    'jpg',
    'jpeg',
    'gif'
  ]
  const files = Array.from(event.target.files).filter((file) =>
    exts.includes(file.name.split('.').pop())
  )
  if (!files.length) {
    // eslint-disable-next-line no-undef
    ElMessage({
      message: '选择的文件夹为空或没有文件',
      type: 'error'
    })
    return
  }
  // 显示文件信息
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  let fileItem = {
    type: 'directory',
    name: files[0].webkitRelativePath.split('/')[0],
    title: files[0].webkitRelativePath.split('/')[0],
    totalCount: files.length,
    size: totalSize,
    children: files,
    uploadStatus: 'pending'
  }
  tempUploadList.value = []
  conflictFiles.value = []
  if (detailFileList.value.length) {
    tempUploadList.value.push(fileItem)
    var flag = detailFileList.value.some(
      (item) => item.title == fileItem.name && item.item_type == 2
    )
    if (flag) {
      conflictFiles.value = [fileItem]
      conflictVisible.value = true
      return
    }
  }
  ReadyUploadList.length = 0
  // 添加目录树到上传列表
  ReadyUploadList.push(fileItem)
  if (directoryInputRef.value) {
    directoryInputRef.value.value = ''
  }
  // 显示上传对话框
  uploadVisible.value = true
}
// const openDirectorySelector = async () => {
//   const directoryPath = await window.customApi.openDirectoryDialog()
//   if (directoryPath) {
//     try {
//       // 使用新的readDir函数获取目录树结构
//       const directoryTree = await window.customApi.readDir(directoryPath)
//       // console.log('目录树结构:', directoryTree)
//       // 将目录树添加到准备上传列表
//       if (directoryTree && directoryTree.children && directoryTree.children.length > 0) {
//         // 清空现有列表
//         ReadyUploadList.length = 0
//         // 添加目录树到上传列表
//         ReadyUploadList.push({
//           type: 'directory',
//           name: directoryTree.name,
//           path: directoryTree.path,
//           fileCount: directoryTree.fileCount,
//           children: directoryTree.children,
//           uploadStatus: 'pending'
//         })
//         // 显示上传对话框
//         uploadVisible.value = true
//       } else {
//         // eslint-disable-next-line no-undef
//         ElMessage({
//           message: '选择的目录为空或没有可上传的文件',
//           type: 'warning'
//         })
//       }
//     } catch (error) {
//       console.error('读取文件或目录出错:', error)
//       // eslint-disable-next-line no-undef
//       ElMessage({
//         message: '读取目录失败: ' + error.message,
//         type: 'error'
//       })
//     }
//   }
// }
// 获取文件图标
const getFileIcon = (item) => {
  if (item.item_type == 2) {
    return catalogueIcon
  } else if (item.item_type == 3) {
    return webPageIcon
  }
  // 根据文件扩展名返回不同的图标
  const ext = item.title?.split('.').pop()?.toLowerCase()
  const iconMap = {
    doc: wordIcon,
    docx: wordIcon,
    pdf: pdfIcon,
    xls: excelIcon,
    xlsx: excelIcon,
    csv: csvIcon,
    ppt: pptIcon,
    pptx: pptIcon,
    txt: txtIcon,
    png: imgIcon,
    jpg: imgIcon,
    jpeg: imgIcon,
    gif: imgIcon,
    web: webPageIcon
  }

  return iconMap[ext] || wordIcon
}
const formatFileSize = (kb) => {
  if (!kb) return '0 KB'
  if (kb < 1024) {
    return kb + ' KB'
  } else if (kb < 1024 * 1024) {
    return (kb / 1024).toFixed(2) + ' MB'
  } else if (kb < 1024 * 1024 * 1024) {
    return (kb / (1024 * 1024)).toFixed(2) + ' GB'
  } else {
    return (kb / (1024 * 1024 * 1024)).toFixed(2) + ' TB'
  }
}
let pathList = ref([
  {
    name: '内容',
    id: 0
  }
  // {
  //   name: '个人知识库',
  //   id: 'personal',
  //   level: 1
  // },
  // {
  //   name: '公共知识库',
  //   id: 'public',
  //   level: 1
  // }
])
// parentItemId 知识库文件父级id
let parentItemId = computed(() => {
  return pathList.value[pathList.value.length - 1].id
})
// 点击文件夹
const dirChange = (e) => {
  pathList.value.push({
    name: e.title,
    id: e.id
  })

  refreshList()
}
const pathChange = (i) => {
  pathList.value = removeItemsAfterIndex(pathList.value, i)
  nextTick(() => {
    refreshList()
  })
}
const removeItemsAfterIndex = (array, index) => {
  if (index > -1 && index < array.length) {
    array.splice(index + 1, array.length - index - 1)
  }
  return array
}
watch(
  () => props.attrs.randomId,
  (newVal) => {
    if (newVal) {
      activeRepositoryId.value = newVal.split('-')[0]
      getRepositoryInfo(activeRepositoryId.value)
    }
  },
  {
    immediate: true
  }
)
</script>

<style scoped lang="scss">
.repository-box {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: flex-end;

  .drag-overlay {
    position: absolute;
    inset: 6px;
    background: rgba(249, 249, 249, 0.96);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #efefef;
    border-radius: 12px;

    .drag-overlay-content {
      padding: 40px;
      text-align: center;

      .drag-text {
        margin-bottom: 20px;
        font-weight: 600;
        font-size: 24px;
        color: var(--default-font-color);
        line-height: 32px;
      }

      .drag-type {
        font-size: 16px;
        color: #909090;
        line-height: 22px;
      }
    }
  }

  .left-box {
    flex-shrink: 0;
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
            line-height: 18px;
            height: 32px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              background: #f6f6f6;

              // .icon-box {
              //   background: #fff;
              // }
            }

            &.active-repository {
              background: var(--el-color-primary-light-9);

              // .icon-box {
              //   background: #fff;
              // }
            }

            .icon-box {
              flex-shrink: 0;
              width: 18px;
              height: 18px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 4px;
              transition: all 0.2s;
              overflow: hidden;

              .icon {
                display: block;
                width: 18px;
                height: 18px;
              }
            }

            .title {
              flex: 1;
              font-size: 14px;
              color: var(--default-font-color);
              line-height: 18px;
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
          line-height: 18px;
          height: 32px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: #f6f6f6;

            // .icon-box {
            //   background: #fff;
            // }
          }

          &.active-repository {
            background: var(--el-color-primary-light-9);

            // .icon-box {
            //   background: #fff;
            // }
          }

          .icon-box {
            flex-shrink: 0;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: all 0.2s;
            overflow: hidden;

            .icon {
              display: block;
              width: 18px;
              height: 18px;
            }
          }

          .title {
            font-size: 14px;
            color: var(--default-font-color);
            line-height: 18px;
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
    flex-shrink: 0;
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
        position: relative;
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

        .dot-dark {
          position: absolute;
          top: 2px;
          right: -2px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #ff5151;
        }
      }

      .detail-box {
        .top {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          cursor: pointer;

          .cover-img {
            flex-shrink: 0;
            display: block;
            width: 64px;
            height: 64px;
            object-fit: cover;
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
                  flex-shrink: 0;
                  display: block;
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  object-fit: cover;
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
        gap: 10px;
        font-size: 12px;
        color: var(--default-font-color);
        line-height: 16px;
        overflow: hidden;

        .path-box {
          flex: 1;
          display: flex;
          align-items: center;
          overflow: hidden;

          .path-item {
            display: inline-flex;
            align-items: center;
            // font-size: 14px;
            // line-height: 50px;
            color: #737475;
            cursor: pointer;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;

            .icon {
              flex-shrink: 0;
              line-height: 50px;
              color: #909090;
              margin: 0 2px;
            }

            &:first-of-type {
              flex-shrink: 0;
            }

            &:last-of-type {
              flex-shrink: 0;
            }

            &.active {
              color: var(--default-font-color);
            }
          }
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

      .empty {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        color: #909090;
        line-height: 22px;

        .empty-text {
          margin-bottom: 16vh;
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

          &.is_top {
            background: #f6f6f6;
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
              line-height: 18px;
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
              gap: 0 10px;
              font-size: 10px;
              color: #909090;
              line-height: 12px;
              overflow: hidden;

              .size-or-num-box {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 10px;
                overflow: hidden;

                .size {
                  flex-shrink: 0;
                  font-size: 10px;
                  color: #909090;
                  line-height: 12px;
                }

                .vertical-line {
                  flex-shrink: 0;
                  width: 1px;
                  height: 10px;
                  background: #ccc;
                }

                .num {
                  flex-shrink: 0;
                  font-size: 10px;
                  color: #909090;
                  line-height: 12px;
                }

                .tags {
                  flex: 1;
                  overflow: hidden;
                  white-space: nowrap;
                  text-overflow: ellipsis;

                  .tag {
                    margin-right: 10px;
                    display: inline-flex;
                    align-items: center;
                    gap: 0 2px;
                    font-size: 10px;
                    color: #909090;
                    line-height: 12px;

                    &:nth-last-of-type(1) {
                      margin-right: 0;
                    }

                    .icon {
                      vertical-align: middle;
                      width: 10px;
                      height: 10px;
                    }
                  }
                }

                .type-box {
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  font-size: 10px;
                  color: #909090;
                  line-height: 12px;
                  overflow: hidden;

                  .web-url {
                    display: block;
                    max-width: calc(100% - 20px);
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                  }

                  .icon {
                    display: block;
                    width: 10px;
                    height: 10px;
                  }
                }
              }
            }

            .management-box {
              flex-shrink: 0;
              font-size: 10px;
              color: #909090;
              line-height: 12px;
            }
          }
        }
      }
    }
  }

  .right-box {
    flex: 1;
    height: 100%;
    overflow: hidden;
  }

  :deep(.import-web-dialog) {
    .el-dialog {
      .el-dialog__header {
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

  :deep(.custom-transition-dialog) {
    &.el-dialog {
      .el-dialog__header {
        display: flex;
        align-items: center;
        gap: 5px;
        font-weight: 500;
        font-size: 14px;
        color: var(--default-font-color);
        line-height: 22px;
      }

      .el-dialog__body {
        font-size: 14px;
        color: var(--default-font-color);
        line-height: 22px;

        .conflict-title {
          margin-bottom: 16px;
          font-size: 14px;
          color: var(--default-font-color);
        }

        .conflict-box {
          max-height: 100px;
          overflow-y: auto;

          .conflict-item {
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 0 8px;

            .conflict-icon {
              width: 12px;
              height: 12px;
            }

            .conflict-name {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              font-size: 12px;
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
.dialog-bounce-enter-active,
.dialog-bounce-leave-active,
.dialog-bounce-enter-active .el-dialog,
.dialog-bounce-leave-active .el-dialog {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.dialog-bounce-enter-from,
.dialog-bounce-leave-to {
  opacity: 0;
}

.dialog-bounce-enter-from .el-dialog,
.dialog-bounce-leave-to .el-dialog {
  transform: scale(0.3) translateY(-50px);
  opacity: 0;
}

.abstract-box-popover {
  padding: 20px !important;
  width: 376px !important;
  background: #ffffff;
  box-shadow: 0px 2px 60px 8px rgba(0, 0, 0, 0.07);
  border-radius: 16px !important;

  .abstract-box {
    width: 100%;

    .abstract-title {
      margin-bottom: 14px;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 18px;
    }

    .time {
      margin-bottom: 10px;
      font-size: 14px;
      color: #adadad;
      line-height: 18px;
    }

    .abstract-desc {
      font-size: 14px;
      color: #646464;
      line-height: 24px;
    }
  }
}

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
        position: relative;
        flex: 1;
        white-space: nowrap;
        text-overflow: ellipsis;

        .unreadApplyNumber {
          position: absolute;
          top: 50%;
          right: -8px;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          background: #ff5151;
          border-radius: 50%;
          font-size: 10px;
          color: #fff;
          text-align: center;
          line-height: 16px;
        }
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
