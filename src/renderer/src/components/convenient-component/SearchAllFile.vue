<template>
    <div class="search-file-box" :class="{ focus: focus }" @click="focusChange">
        <div ref="inputWrapper" class="input-wrapper" @click="focusChange">
            <div class="input-box">
                <img v-show="!focus && !fileList.length" class="circle-logo" src="@renderer/assets/logo.png" />
                <!-- 按回车键发送，输入框高度三行 -->
                <el-mention v-model="message.text" autosize class="input" resize="none" placeholder="@知识库或输入文件名称进行检索"
                    type="textarea" :options="mentionOptions" :whole="true" @whole-remove="handleWholeRemove"
                    @focus="focus = true" @select="handleMentionSelect" @keydown.enter.prevent="sendMessage">
                </el-mention>
            </div>
            <div class="btn-box">
                <searchBtn class="searchBtn" @click="sendMessage($event)" />
            </div>
        </div>
        <div v-if="fileList.length" v-loading="loading"  class="all-file-box">
            <div class="all-file-content" :infinite-scroll-distance="1" v-infinite-scroll="loadData">
                <div class="list-item" v-for="item in fileList" :key="item.id"
                    @contextmenu="showContextMenu(item, $event)" @click="detailChange(item)">
                    <div class="item-right">
                        <div class="title">
                            <!-- 将字符串分割为每个字符 -->
                            <template v-if="item.title">
                                <span v-for="(text, i) in item.title" :key="i"
                                    :class="{ 'active-filter': searchText && searchText.includes(text) }">{{ text
                                    }}</span>
                            </template>
                        </div>
                        <div class="item-right-bottom">
                            <div class="size-or-num-box">
                                <div class="type-box">
                                    <img class="icon" :src="getFileIcon(item)" alt="" />
                                    <span v-if="item.item_type == 3" class="web-url">{{
                                        item.info?.web_url
                                    }}</span>
                                    <span
                                        v-else-if="item.info?.url.split('.').pop() == 'txt' && (!item.note_id || item.note_id == 0)">文本</span>
                                    <span v-else-if="item.note_id && item.note_id != 0">笔记</span>
                                    <span v-else-if="
                                        ['png', 'jpg', 'jpeg', 'gif'].includes(
                                            item.info?.url.split('.').pop()
                                        )
                                    ">图片</span>
                                    <span v-else>{{
                                        item.info?.url.split('.').pop().toUpperCase()
                                    }}</span>
                                    <span>{{ item.createtime_date || '' }}</span>

                                </div>
                                <div  class="repository-folder-box">
                                    <div class="repository-name">
                                        {{ item.know_info?.title || ''  }}
                                    </div>
                                    <div v-if="item.item_path_info?.length > 1" class="repository-folder">
                                        /{{ item.item_path_info?.map(item => item.title).slice(0,item.item_path_info.length -1).join('/') || '' }}
                                    </div>
                                </div>
                                
                                
                            </div>
                            <div class="user-box">
                                <img class="user-default" src="@renderer/assets/home/user-default.png" alt="">
                                {{ item.upload_user || '' }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="hasSearched && !loading" class="empty">
            <el-empty :image-size="60" description="暂无数据" />
        </div>
        <HandleContextMenu :show="contextMenu.show" :x="contextMenu.x" :y="contextMenu.y"
            :permission-type="contextMenu.permission_type" :action-sheet="contextMenu.actionSheet"
            @action="handleContextMenuAction" />
    </div>
</template>
<script>
import cloneDeep from 'lodash.clonedeep'
import { useCheckLogin } from '@renderer/hooks/checkLogin'
import { useUserStore } from '@renderer/stores/user'
import { get_user_knows } from '@renderer/api/chat'
import { search_know_files } from '@renderer/api/repository'
import { user_info } from '@renderer/api/user'
import { syncMentionedByText } from '@renderer/utils/mention'
import excelIcon from '@renderer/assets/file-icons/excel-icon.png'
import imgIcon from '@renderer/assets/file-icons/img-icon.png'
import videoIcon from '@renderer/assets/file-icons/video-icon.png'
import pdfIcon from '@renderer/assets/file-icons/pdf-icon.png'
import pptIcon from '@renderer/assets/file-icons/ppt-icon.png'
import txtIcon from '@renderer/assets/file-icons/txt-icon.png'
import wordIcon from '@renderer/assets/file-icons/word-icon.png'
import webPageIcon from '@renderer/assets/file-icons/web-page-icon.png'
import csvIcon from '@renderer/assets/file-icons/csv-icon.png'
import catalogueIcon from '@renderer/assets/upload-files/catalogue-icon.png'
import noteIcon from '@renderer/assets/menu/note-icon.png'
import noteSmallIcon from '@renderer/assets/notebook/notebook-small.png'
import openLocationIcon from '@renderer/assets/contextMenu/open-location-icon.png'
import searchBtn from '@renderer/assets/home/search-file-icon.svg'
import repositoryIcon from '@renderer/assets/menu/repository-icon.png'
export default {
    name: 'MessageInput',
    components: {
        searchBtn
    },
    inject: ['addNewTab', 'replaceActiveTab'],
    props: {
        isActiveTab: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            message: { text: '', image: '' },
            searchText: '',
            loading: false,
            uniacid: 2,
            focus: false,
            mentionOptions: [],
            fileList: [],
            mentioned: [],
            allKnowsList: [],
            knowsToSend: [],
            page: 1,
            page_size: 10,
            total: 0,
            contextMenu: { show: false, x: 0, y: 0, actionSheet: [] },
            activeItem: {},
            hasSearched: false
        }
    },
    watch: {
        // 全选删除、清空、剪切等操作不会触发 whole-remove，这里以文本为准兜底同步
        'message.text'() {
            this.syncMentioned()
        }
    },
    async mounted() {
        if (useCheckLogin().value) {
            await this.getUserInfo()
        }
        this.getKnows()
        document.addEventListener('click', this.hideContextMenu)
    },
    beforeUnmount() {
        document.removeEventListener('click', this.hideContextMenu)
    },
    methods: {
        // 右键菜单相关函数
        showContextMenu(item, e) {
            e.stopPropagation()
            e.preventDefault()
            this.activeItem = item
            this.contextMenu = {
                show: true,
                permission_type: 'cannotView',
                x: e.clientX,
                y: e.clientY,
                actionSheet: [
                    {
                        name: '打开所在位置',
                        icon: openLocationIcon,
                        action: 'openLocation'
                    },
                ]
            }
        },
        handleContextMenuAction({ action }) {
            // 打开协同文件
            if (action === 'openLocation') {
                this.addNewTab({
                    url: 'RepositoryStore',
                    title: '知识库',
                    icon: repositoryIcon,
                    isInternal: true,
                    attrs: {
                    RepositoryId: this.activeItem.know_id,
                    item_path_info: this.activeItem.item_path_info,
                    randomId: this.activeItem.know_id + '-' + Math.random().toString(36).substring(2)
                    }
                })
            } 
            this.contextMenu.show = false
        },
        hideContextMenu(e) {
            if (this.contextMenu.show && !e.target.closest('.handleContextMenu')) {
                this.contextMenu.show = false
            }
        },
        loadData() {
            if (this.loading) {
                return
            }
            if (this.page * this.page_size >= this.total) {
                return
            }
            this.page++
            this.getFiles()
        },
        getFiles() {
            var data = {
                t: Date.now(),
                page_size: this.page_size,
                page: this.page,
                search_key: this.searchText,
                know_ids: this.knowsToSend.length ? this.knowsToSend.map(item => item.know_id) : [] //
            }
            this.loading = true
            search_know_files(data).then(res => {
                if (res.code == 200) {
                    if (this.page == 1) {
                        this.fileList = res.data?.data || []
                    } else {
                        this.fileList = this.fileList.concat(res.data?.data || [])
                    }
                    this.total = res.data?.total || 0
                    this.page = res.data?.current_page || 1
                    this.page_size = res.data?.per_page || 10
                }
            }).finally(() => {
                this.loading = false
            })
        },
        detailChange(item) {
            if (item.item_type == 3) {
                this.addNewTab({
                    icon: item.info?.logo || this.getFileIcon(item),
                    title: item.title,
                    url: 'DocumentDetail',
                    isInternal: true,
                    attrs: {
                        fileUrl: item.info?.url,
                        fileName: item.title,
                        fileId: item.info?.file_key || '',
                        download: false,
                        webUrl: item.info?.web_url
                    }
                })
            } else {
                if (item.is_create_user && item.note_id && item.notebook_id) {
                    this.addNewTab({
                        title: '笔记',
                        url: 'Note',
                        icon: noteIcon,
                        isInternal: true,
                        attrs: {
                            note_id: item.note_id,
                            notebook_id: item.notebook_id,
                        }
                    })
                } else {
                    this.addNewTab({
                        icon: this.getFileIcon(item),
                        title: item.title,
                        url: 'DocumentDetail',
                        isInternal: true,
                        attrs: {
                            fileUrl: item.info?.url,
                            fileName: item.title,
                            fileId: item.info?.file_key || '',
                            download: true,
                            note_id: item.note_id,
                            notebook_id: item.notebook_id,
                            is_create_user: item.is_create_user
                        }
                    })
                }
            }
        },
        getUserInfo() {
            const userStore = useUserStore()
            return user_info({}).then((res) => {
                if (res.code == 200) {
                    userStore.updateUser(res.data?.user_info)
                }
            })
        },
        // 依据输入框文本同步引用的知识库，兜底处理不会触发 whole-remove 的删除方式
        syncMentioned() {
            const next = syncMentionedByText(this.message.text, this.mentioned)
            if (next !== this.mentioned) {
                this.mentioned = next
            }
        },
        handleWholeRemove(e) {
            // 如果删除的是"所有知识库"，清空所有 mentioned
            if (e === '所有知识库') {
                this.mentioned = []
                this.message.text = this.message.text.replace(/@所有知识库\s?/g, '')
                return
            }
            // 匹配提及内容并删除
            var reg = new RegExp('@' + e, 'g')
            this.message.text = this.message.text.replace(reg, '')
            this.mentioned = this.mentioned.filter((item) => item.label !== e)
        },
        triggerMention() {
            const text = this.message.text
            const lastAtIndex = text.lastIndexOf('@')
            // 检查 @ 后面是否紧跟着空格（用户输入了 @ 但没有选择提及，直接空格后输入了其他内容）
            // 例如：'@ 后续内容' → @ 位置在0，后面第一个字符是空格
            const afterAt = lastAtIndex !== -1 ? text.substring(lastAtIndex + 1) : ''
            const atFollowedBySpace = afterAt.startsWith(' ')

            if (lastAtIndex !== -1 && atFollowedBySpace) {
                // @ 后面紧跟空格，用户本意是想提及但没选，光标定位到 @ 后面
                this.focus = true
                this.$nextTick(() => {
                    const inputEl = this.$el.querySelector('.input textarea, .input input')
                    if (inputEl) {
                        inputEl.focus()
                        // 光标定位到 @ 后面（@ 和空格之间）
                        inputEl.setSelectionRange(lastAtIndex + 1, lastAtIndex + 1)
                    }
                })
            } else if (lastAtIndex !== -1 && lastAtIndex === text.length - 1) {
                // @ 在文本末尾，后面为空，等待输入提及
                this.focus = true
                this.$nextTick(() => {
                    const inputEl = this.$el.querySelector('.input textarea, .input input')
                    if (inputEl) {
                        inputEl.focus()
                        inputEl.setSelectionRange(text.length, text.length)
                    }
                })
            } else {
                // 没有未完成的 @，追加一个 @ 并聚焦
                this.message.text += '@'
                this.focus = true
                this.$nextTick(() => {
                    const inputEl = this.$el.querySelector('.input textarea, .input input')
                    if (inputEl) {
                        inputEl.focus()
                        inputEl.setSelectionRange(this.message.text.length, this.message.text.length)
                    }
                })
            }
        },
        handleMentionSelect(item) {
            this.mentioned.push(item)
        },
        // 获取文件图标
        getFileIcon(item) {
            if (item.item_type == 2) {
                return catalogueIcon
            } else if (item.item_type == 3) {
                return webPageIcon
            } else if (item.note_id && item.note_id != 0) {
                return noteSmallIcon
            }
            // 根据文件扩展名返回不同的图标
            const ext = item.info?.url?.split('.').pop()?.toLowerCase()
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
                web: webPageIcon,
                mp4: videoIcon,
                avi: videoIcon,
                mov: videoIcon,
                wmv: videoIcon,
                flv: videoIcon,
                mkv: videoIcon,
                rmvb: videoIcon,
                webm: videoIcon,
                '3gp': videoIcon,
                mpeg: videoIcon,
                mpg: videoIcon
            }
            return iconMap[ext] || wordIcon
        },
        getKnows() {
            get_user_knows({ t: new Date().getTime() }).then((res) => {
                var list = []
                if (res.data?.length) {
                    res.data.map((item) => {
                        item.knows.map((children) => {
                            list.push({
                                value: children.title,
                                know_id: children.id,
                                know_key: children.know_key,
                                label: children.title,
                                model_key: children.vector_model?.model_key || '',
                                provider_key: children.vector_model?.provider_key || ''
                            })
                        })
                    })
                }
                // 保存全量知识库列表，用于 _all_ 展开
                this.allKnowsList = [...list]
                // 在最前面插入"所有知识库"选项
                if (list.length > 0) {
                    list.unshift({
                        value: '所有知识库',
                        know_key: '_all_',
                        know_id: '_all_',
                        label: '所有知识库',
                        model_key: '',
                        provider_key: ''
                    })
                }
                this.mentionOptions = list
            })
        },
        formatFileSize(kb) {
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
        },
        focusChange(e) {
            if (this.$refs.inputWrapper?.contains(e.target) || e.target == this.$refs.inputWrapper) {
                this.focus = true
            } else if (!this.message.text) {
                this.focus = false
            }
        },
        checkIfSearchingMention(text) {
            if (!text.includes('@')) return false
            // 获取最后一个 @ 的位置
            const lastAtIndex = text.lastIndexOf('@')
            if (lastAtIndex === -1) return false
            // 获取 @ 之后到文本结尾的内容
            const afterAt = text.substring(lastAtIndex + 1)
            // 如果 @ 后面是空字符串，返回 false
            if (afterAt.length > 0) return false
            // 检查 @ 后面是否有空格或换行（如果有，说明提及已结束）
            const firstCharAfterAt = afterAt[0]
            if (firstCharAfterAt === ' ' || firstCharAfterAt === '\n') {
                return false
            }
            // 检查 @ 后面的内容是否包含空格（如果包含，说明提及已结束）
            if (afterAt.includes(' ') || afterAt.includes('\n')) {
                return false
            }
            return true
        },
        // ... existing code ...
        sendMessage(event) {
            if (event.key === 'Enter' && (event.shiftKey || event.ctrlKey || event.altKey)) {
                this.message.text += '\n'
            } else {
                if (!this.message.text.trim().length) {
                    // eslint-disable-next-line no-undef
                    ElMessage({
                        message: '请输入文件名称',
                        type: 'warning'
                    })
                    return
                }
                if (this.checkIfSearchingMention(this.message.text)) {
                    return
                }
            }
            this.handleSendClick()
        },
        handleSendClick() {
            if (!useCheckLogin().value) {
                return
            }
            if (!/@[^\s]+/g.test(this.message.text)) {
                this.mentioned = []
            }
            if (this.message.text.trim().length) {
                // 检查是否包含 _all_，如果有则展开所有知识库
                var hasAll = this.mentioned.some((item) => item.know_key === '_all_')
                var knowsToSend
                if (hasAll) {
                    // 过滤掉 _all_ 标记项，并用全量知识库替换
                    knowsToSend = this.mentioned
                        .filter((item) => item.know_key !== '_all_')
                        .concat(
                            this.allKnowsList.map((k) => ({
                                know_key: k.know_key,
                                know_id: k.know_id,
                                label: k.label,
                                value: k.value,
                                model_name: k.model_name || '',
                                model_key: k.model_key || '',
                                provider_key: k.provider_key || ''
                            }))
                        )
                } else {
                    knowsToSend = cloneDeep(this.mentioned)
                }
                this.knowsToSend = knowsToSend
                var text = JSON.parse(JSON.stringify(this.message.text))
                this.searchText = text.replace(/@[^\s]+/g, '')
                if (this.loading) {
                    return
                }
                this.hasSearched = true
                this.page = 1
                this.page_size = 10
                this.total = 0
                this.getFiles()
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.empty {
    height: 156px;
    transition: all 0.3s ease-in-out;
    background: #F9F9F9;
    border-radius: 16px;
    color: #737475;
    font-size: 13px;
    text-align: center;
    .el-empty {
        padding-top: 20px;
    }
}

.search-file-box {
    min-height: 58px;
    user-select: none;

    &.focus {
        .input-wrapper {
            min-height: 58px;
            // max-height: 311px;
            // flex-direction: column;
            border-color: var(--el-color-primary);

            // .btn-box {
            //     flex: 1;
            //     padding-top: 9px;
            //     align-self: flex-end;
            // }
        }
    }

    .input-wrapper {
        margin-bottom: 10px;
        padding: 9px 9px 9px 15px;
        min-height: 58px;
        max-height: 58px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        overflow: hidden;
        background: #f9f9f9;
        border-radius: 16px;
        border: 1px solid #dfdfdf;
        transition:
            // min-height 0.3s linear,
            // max-height 0.6s linear;
            border-color 0.2s linear;

        .input-box {
            flex: 1;
            flex-shrink: 0;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;

            .circle-logo {
                flex-shrink: 0;
                margin-right: 10px;
                width: 24px;
                height: 24px;

            }

            :deep(.input) {
                .el-textarea__inner {
                    padding: 0;
                    min-height: 22px;
                    max-height: 150px;
                    background: transparent;
                    border: none;
                    font-size: 16px;
                    outline: none;
                    box-shadow: none;
                    color: #221815;

                    &::placeholder {
                        color: #909090;
                        font-size: 16px;
                    }
                }
            }
        }

        .btn-box {
            margin-left: 10px;
            width: 38px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;

            .searchBtn {
                color: var(--el-color-primary);
                width: 100%;
                height: 100%;
            }
        }
    }

    .all-file-box {
        padding: 10px 10px 10px 20px;
        transition: all 0.3s ease-in-out;
        background: #F9F9F9;
        border-radius: 16px;

        .all-file-content {
            min-height: 50px;
            max-height: 35vh;
            overflow-y: auto;

            .list-item {
                position: relative;
                padding: 10px 0 20px 0;
                display: flex;
                gap: 10px;
                margin-bottom: 10px;
                cursor: pointer;
                border-radius: 8px;
                border-bottom: 1px solid #EBEBEB;
                &:last-child {
                    padding-bottom: 10px;
                    margin-bottom: 0;
                    border-bottom: none;
                }
                &.is_top {
                    background: #f6f6f6;
                }

                .item-right {
                    flex: 1;
                    overflow: hidden;

                    .title {
                        margin-bottom: 14px;
                        font-size: 14px;
                        color: var(--default-font-color);
                        line-height: 16px;
                        word-break: break-all;
                        display: -webkit-box;
                        -webkit-box-orient: vertical;
                        -webkit-line-clamp: 2;
                        line-clamp: 2;
                        overflow: hidden;
                        text-overflow: ellipsis;

                        .active-filter {
                            color: var(--el-color-primary);
                        }
                    }

                    .item-right-bottom {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 0 10px;
                        font-size: 12px;
                        color: #909090;
                        line-height: 12px;
                        overflow: hidden;

                        .size-or-num-box {
                            flex: 1;
                            display: flex;
                            align-items: center;
                            justify-content: flex-start;
                            gap: 10px;
                            overflow: hidden;
                            .type-box {
                                flex-shrink: 0;
                                display: flex;
                                align-items: center;
                                gap: 4px;
                                font-size: 12px;
                                color: #909090;
                                line-height: 12px;
                                overflow: hidden;

                                .web-url {
                                    /* 在 flex 容器中允许此项按比例收缩并显示省略号 */
                                    display: block;
                                    flex: 1;
                                    min-width: 0;
                                    /* 允许在 flex 中正确收缩 */
                                    white-space: nowrap;
                                    text-overflow: ellipsis;
                                    overflow: hidden;
                                    max-width: none;
                                }

                                .icon {
                                    display: block;
                                    width: 12px;
                                    height: 12px;
                                }
                            }
                            .repository-folder-box {
                                flex: 1;
                                display: flex;
                                align-items: center;
                                justify-content: flex-start;
                                overflow: hidden;
                                .repository-name {
                                    flex-shrink: 0;
                                    font-weight: 500;
                                    font-size: 12px;
                                    color: var(--el-color-primary);
                                    line-height: 12px;
                                }
                                .repository-folder {
                                    flex: 1;
                                    font-size: 12px;
                                    color: #909090;
                                    line-height: 12px;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    white-space: nowrap;
                                }
                            }
                            
                        }
                    }

                    .user-box {
                        flex-shrink: 0;
                        font-weight: 400;
                        font-size: 12px;
                        color: var(--default-font-color);
                        line-height: 12px;
                        display: flex;
                        align-items: center;
                        gap: 4px;

                        .user-default {
                            width: 12px;
                            height: 12px;
                            vertical-align: middle;
                        }
                    }
                }
            }
        }
    }
}

.stop-btn-box {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    padding: 2px;

    &::before {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: inline-block;
        content: '';
        width: 130%;
        height: 130%;
        // background: conic-gradient(from 45deg, #fff, #e7f1e6, #ab92f7, red);
        background: conic-gradient(from 45deg, #fff, #e9dadb, #e2838a, #f5222d);

        animation: flowing 2s infinite linear;
    }

    .stop-btn {
        position: relative;
        z-index: 1;
        border: 1px solid transparent !important;
        background: #fff !important;
    }
}

// 当按钮禁用时隐藏动画
.stop-btn[disabled]::before {
    display: none;
}

@keyframes flowing {
    0% {
        transform: translate(-50%, -50%) rotate(0deg);
    }

    100% {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}
</style>
<style lang="scss">
.message-input-model-select {
    .el-select-dropdown__list {
        padding: 10px;

        .el-select-dropdown__item {
            border-radius: 4px;
            height: 64px;
            padding: 5px 10px;
            line-height: 27px;
            color: var(--default-font-color);

            &.is-hovering {
                .value-text {
                    color: var(--el-color-primary);
                }
            }

            &.is-selected {
                .value-text {
                    color: var(--el-color-primary);
                }
            }

            .value-text {
                font-style: 16px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .value-label {
                font-style: 14px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                color: #909090;
            }
        }
    }
}
</style>
