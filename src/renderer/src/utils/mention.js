const ALL_KNOWLEDGE_LABEL = '所有知识库'

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 根据输入框当前文本校正已引用的知识库列表。
 *
 * el-mention 的 `whole-remove` 事件仅在光标紧贴提及内容并退格时触发，
 * 「全选删除 / 剪切 / 一键清空 / 全选后输入覆盖」等操作都不会触发该事件，
 * 会导致 mentioned 残留已经删除的引用，发送时携带错误的参数。
 * 因此统一以输入框文本为准做一次校正：只有仍以完整 @ 提及 token
 * （贴近 el-mention 实际 chip 形态：`@label` 后紧跟空白或文本结尾）存在的引用
 * 才予以保留，确保 mentioned 与文本始终一致。
 *
 * @param {string} text 输入框当前文本
 * @param {Array} mentioned 当前已引用的知识库列表
 * @returns {Array} 校正后的引用列表（未发生变化时返回原数组引用）
 */
export function syncMentionedByText(text, mentioned) {
  if (!Array.isArray(mentioned) || !mentioned.length) {
    return mentioned || []
  }
  const value = typeof text === 'string' ? text : ''

  // 解析文本中所有完整的 @ 提及 token（每次调用使用新字面量，避免 g 标志的 lastIndex 状态污染）
  const tokens = value.match(/@[^\s@]+/g) || []

  // 文本中已不存在任何 @提及（全选删除、清空、剪切、全选后输入覆盖等），直接清空引用
  if (tokens.length === 0) {
    return []
  }
  // “所有知识库”会被展开为全量知识库，文本中只会保留 @所有知识库 一个标记，
  // 无法逐项匹配，此时不做剔除，交由 whole-remove / 发送时的展开逻辑处理
  if (tokens.includes('@' + ALL_KNOWLEDGE_LABEL)) {
    return mentioned
  }
  // 仅保留那些 @label 仍以完整 chip 形态存在（紧跟空白或结尾）的项
  const next = mentioned.filter((item) => {
    if (!item || !item.label) return false
    const re = new RegExp('@' + escapeRegExp(item.label) + '(?=\\s|$)')
    return re.test(value)
  })
  return next.length === mentioned.length ? mentioned : next
}
