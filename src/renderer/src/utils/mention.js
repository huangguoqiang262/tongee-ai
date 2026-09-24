const MENTION_TOKEN_REG = /@[^\s@]+/
const ALL_KNOWLEDGE_LABEL = '所有知识库'

/**
 * 根据输入框当前文本校正已引用的知识库列表。
 *
 * el-mention 的 `whole-remove` 事件只有在光标紧贴提及内容并退格时才会触发，
 * 用户「全选删除 / 剪切 / 一键清空」等操作都不会触发该事件，
 * 会导致 mentioned 中残留已经删除的引用，发送时携带错误的参数。
 * 因此统一以输入框文本为准做一次校正，保证 mentioned 与文本始终一致。
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

  // 文本中已不存在任何 @提及（全选删除、清空、剪切等），直接清空引用，避免传参残留
  if (!MENTION_TOKEN_REG.test(value)) {
    return []
  }

  // “所有知识库”会被展开为全量知识库，文本中只会保留 @所有知识库 一个标记，
  // 无法逐项匹配，此时不做剔除，交由 whole-remove / 发送时的展开逻辑处理
  if (value.includes('@' + ALL_KNOWLEDGE_LABEL)) {
    return mentioned
  }

  // 逐项校正：已经不在文本中的提及项予以移除
  const next = mentioned.filter((item) => item && item.label && value.includes('@' + item.label))
  return next.length === mentioned.length ? mentioned : next
}
