/**
 * 将Markdown或富文本转换为纯文本
 * @param {string} input - 输入的Markdown或富文本
 * @param {Object} options - 转换选项
 * @param {boolean} options.removeLinks - 是否移除链接文本
 * @param {boolean} options.removeImages - 是否移除图片描述
 * @param {boolean} options.removeFormatting - 是否移除所有格式标记
 * @param {number} options.maxLength - 最大输出长度，0表示不限制
 * @returns {string} 纯文本
 */
function convertToPlainText(input, options = {}) {
  if (!input || typeof input !== 'string') {
    return ''
  }

  const {
    removeLinks = true,
    removeImages = true,
    removeFormatting = true,
    maxLength = 0
  } = options

  let text = input

  // 1. 处理HTML标签（富文本）
  text = stripHTMLTags(text)

  // 2. 处理Markdown格式
  text = stripMarkdownFormatting(text, {
    removeLinks,
    removeImages,
    removeFormatting
  })

  // 3. 清理多余的空格和换行
  text = cleanWhitespace(text)

  // 4. 限制长度
  if (maxLength > 0 && text.length > maxLength) {
    text = text.substring(0, maxLength).trim() + '...'
  }

  return text
}

/**
 * 移除HTML标签
 */
function stripHTMLTags(html) {
  if (!html) return ''

  return (
    html
      // 移除脚本和样式标签
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // 替换常见的HTML实体
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // 移除所有HTML标签
      .replace(/<[^>]+>/g, '')
      // 处理多个连续换行
      .replace(/\n\s*\n/g, '\n\n')
  )
}

/**
 * 移除Markdown格式
 */
function stripMarkdownFormatting(markdown, options) {
  if (!markdown) return ''

  let text = markdown

  // 移除标题
  text = text.replace(/^#{1,6}\s+/gm, '')

  // 移除粗体和斜体
  if (options.removeFormatting) {
    text = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // 粗体
      .replace(/\*(.*?)\*/g, '$1') // 斜体
      .replace(/__(.*?)__/g, '$1') // 粗体（下划线）
      .replace(/_(.*?)_/g, '$1') // 斜体（下划线）
  }

  // 移除代码块和内联代码
  text = text
    .replace(/```[\s\S]*?```/g, '') // 代码块
    .replace(/`([^`]+)`/g, '$1') // 内联代码

  // 移除链接
  if (options.removeLinks) {
    text = text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [文本](链接)
      .replace(/<([^>]+)>/g, '$1') // <链接>
  }

  // 移除图片
  if (options.removeImages) {
    text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
  }

  // 移除引用
  text = text.replace(/^>\s+/gm, '')

  // 移除列表标记
  text = text
    .replace(/^[\s]*[-*+]\s+/gm, '') // 无序列表
    .replace(/^[\s]*\d+\.\s+/gm, '') // 有序列表

  // 移除水平分割线
  text = text.replace(/^[-*_]{3,}\s*$/gm, '')

  // 移除表格标记
  text = text.replace(/^\|.*\|$/gm, '') // 简单的表格处理
  text = text.replace(/\|/g, ' ') // 移除表格中的竖线

  return text
}

/**
 * 清理多余的空格和换行
 */
function cleanWhitespace(text) {
  return (
    text
      // 移除行首行尾空格
      .replace(/^[ \t]+|[ \t]+$/gm, '')
      // 将多个连续空格合并为一个
      .replace(/[ ]{2,}/g, ' ')
      // 将多个连续换行合并为最多两个
      .replace(/\n{3,}/g, '\n\n')
      // 移除段落开头的空行
      .replace(/^\n+/, '')
      // 移除段落结尾的空行
      .replace(/\n+$/, '')
      .trim()
  )
}

export { convertToPlainText, stripHTMLTags, stripMarkdownFormatting, cleanWhitespace }
