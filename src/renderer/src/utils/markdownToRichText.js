/**
 * Markdown转富文本工具函数
 * 支持完整的Markdown语法转换，提供丰富的配置选项和辅助功能
 * @author AI Assistant
 * @version 1.0.0
 */

import { ElMessage } from 'element-plus'

/**
 * 默认转换配置
 */
const defaultOptions = {
  // 是否启用HTML转义
  escapeHtml: true,
  // 是否保留换行符
  preserveLineBreaks: true,
  // 是否启用代码高亮
  highlightCode: true,
  // 是否转换图片为富文本格式
  convertImages: true,
  // 是否转换链接
  convertLinks: true,
  // 是否转换表格
  convertTables: true,
  // 自定义CSS类名前缀
  classPrefix: 'md-',
  // 是否生成统计信息
  generateStats: false,
  // 是否启用严格模式（更严格的语法检查）
  strictMode: false
}

/**
 * HTML特殊字符转义
 * @param {string} text - 需要转义的文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return ''

  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  }

  return text.replace(/[&<>"'`]/g, (char) => escapeMap[char])
}

/**
 * 验证Markdown文本有效性
 * @param {string} markdown - Markdown文本
 * @returns {Object} 验证结果
 */
function validateMarkdown(markdown) {
  if (typeof markdown !== 'string') {
    return {
      isValid: false,
      error: '输入必须是字符串类型',
      suggestions: ['请检查输入参数类型']
    }
  }

  if (!markdown.trim()) {
    return {
      isValid: false,
      error: '输入内容为空',
      suggestions: ['请输入有效的Markdown内容']
    }
  }

  // 检查常见语法错误
  const errors = []
  const warnings = []

  // 检查未闭合的代码块
  const codeBlockCount = (markdown.match(/```/g) || []).length
  if (codeBlockCount % 2 !== 0) {
    errors.push('存在未闭合的代码块')
  }

  // 检查未闭合的引用块
  const blockquoteCount = (markdown.match(/^>/gm) || []).length
  if (blockquoteCount > 0 && !markdown.includes('\n\n')) {
    warnings.push('建议在引用块后添加空行以提高可读性')
  }

  // 检查过长的行
  const lines = markdown.split('\n')
  lines.forEach((line, index) => {
    if (line.length > 200) {
      warnings.push(`第${index + 1}行内容过长（${line.length}字符），建议分段`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    lineCount: lines.length,
    charCount: markdown.length,
    wordCount: markdown.split(/\s+/).filter((word) => word.length > 0).length
  }
}

/**
 * 解析Markdown标题
 * @param {string} line - 单行文本
 * @param {Object} options - 配置选项
 * @returns {Object|null} 解析结果
 */
function parseHeading(line, options) {
  const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
  if (!headingMatch) return null

  const [, hashes, content] = headingMatch
  const level = hashes.length

  return {
    type: 'heading',
    level,
    content: options.escapeHtml ? escapeHtml(content) : content,
    html: `<h${level} class="${options.classPrefix}heading ${options.classPrefix}heading-${level}">${options.escapeHtml ? escapeHtml(content) : content}</h${level}>`
  }
}

/**
 * 解析Markdown粗体和斜体
 * @param {string} text - 文本内容
 * @param {Object} options - 配置选项
 * @returns {string} 转换后的文本
 */
function parseEmphasis(text, options) {
  // 处理粗体 **text** 或 __text__
  text = text.replace(/\*\*(.*?)\*\*|__(.*?)__/g, (match, p1, p2) => {
    const content = p1 || p2
    return `<strong class="${options.classPrefix}bold">${options.escapeHtml ? escapeHtml(content) : content}</strong>`
  })

  // 处理斜体 *text* 或 _text_
  text = text.replace(/\*(.*?)\*|_(.*?)_/g, (match, p1, p2) => {
    const content = p1 || p2
    return `<em class="${options.classPrefix}italic">${options.escapeHtml ? escapeHtml(content) : content}</em>`
  })

  // 处理删除线 ~~text~~
  text = text.replace(/~~(.*?)~~/g, (match, content) => {
    return `<del class="${options.classPrefix}strikethrough">${options.escapeHtml ? escapeHtml(content) : content}</del>`
  })

  return text
}

/**
 * 解析Markdown代码
 * @param {string} text - 文本内容
 * @param {Object} options - 配置选项
 * @returns {string} 转换后的文本
 */
function parseCode(text, options) {
  // 处理行内代码 `code`
  text = text.replace(/`([^`]+)`/g, (match, code) => {
    return `<code class="${options.classPrefix}inline-code">${options.escapeHtml ? escapeHtml(code) : code}</code>`
  })

  return text
}

/**
 * 解析Markdown链接和图片
 * @param {string} text - 文本内容
 * @param {Object} options - 配置选项
 * @returns {string} 转换后的文本
 */
function parseLinksAndImages(text, options) {
  // 处理链接 [text](url)
  if (options.convertLinks) {
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
      const escapedText = options.escapeHtml ? escapeHtml(linkText) : linkText
      const escapedUrl = options.escapeHtml ? escapeHtml(url) : url
      return `<a href="${escapedUrl}" class="${options.classPrefix}link" target="_blank" rel="noopener noreferrer">${escapedText}</a>`
    })
  }

  // 处理图片 ![alt](src)
  if (options.convertImages) {
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      const escapedAlt = options.escapeHtml ? escapeHtml(alt) : alt
      const escapedSrc = options.escapeHtml ? escapeHtml(src) : src
      return `<img src="${escapedSrc}" alt="${escapedAlt}" class="${options.classPrefix}image" loading="lazy">`
    })
  }

  return text
}

/**
 * 解析Markdown列表
 * @param {Array} lines - 文本行数组
 * @param {number} startIndex - 起始索引
 * @param {Object} options - 配置选项
 * @returns {Object} 解析结果
 */
function parseList(lines, startIndex, options) {
  const line = lines[startIndex]
  const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/)
  if (!listMatch) return null

  const [, indent, marker] = listMatch
  const isOrdered = !isNaN(parseInt(marker))
  const indentLevel = indent.length / 2

  let listItems = []
  let currentIndex = startIndex

  while (currentIndex < lines.length) {
    const currentLine = lines[currentIndex]
    const currentMatch = currentLine.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/)

    if (!currentMatch) break

    const [, currentIndent, currentMarker, currentContent] = currentMatch
    const currentIndentLevel = currentIndent.length / 2

    if (currentIndentLevel === indentLevel) {
      listItems.push({
        content: parseInlineElements(currentContent, options),
        marker: currentMarker
      })
      currentIndex++
    } else {
      break
    }
  }

  const listTag = isOrdered ? 'ol' : 'ul'
  const listClass = isOrdered
    ? `${options.classPrefix}ordered-list`
    : `${options.classPrefix}unordered-list`

  const listHtml = listItems
    .map((item) => `<li class="${options.classPrefix}list-item">${item.content}</li>`)
    .join('')

  return {
    type: 'list',
    listType: isOrdered ? 'ordered' : 'unordered',
    items: listItems,
    html: `<${listTag} class="${listClass}">${listHtml}</${listTag}>`,
    endIndex: currentIndex - 1
  }
}

/**
 * 解析Markdown块引用
 * @param {Array} lines - 文本行数组
 * @param {number} startIndex - 起始索引
 * @param {Object} options - 配置选项
 * @returns {Object} 解析结果
 */
function parseBlockquote(lines, startIndex, options) {
  const line = lines[startIndex]
  if (!line.startsWith('>')) return null

  let quoteLines = []
  let currentIndex = startIndex

  while (currentIndex < lines.length && lines[currentIndex].startsWith('>')) {
    const content = lines[currentIndex].substring(1).trim()
    if (content) {
      quoteLines.push(parseInlineElements(content, options))
    }
    currentIndex++
  }

  const quoteHtml = quoteLines
    .map((line) => `<p class="${options.classPrefix}quote-line">${line}</p>`)
    .join('')

  return {
    type: 'blockquote',
    lines: quoteLines,
    html: `<blockquote class="${options.classPrefix}blockquote">${quoteHtml}</blockquote>`,
    endIndex: currentIndex - 1
  }
}

/**
 * 解析Markdown代码块
 * @param {Array} lines - 文本行数组
 * @param {number} startIndex - 起始索引
 * @param {Object} options - 配置选项
 * @returns {Object} 解析结果
 */
function parseCodeBlock(lines, startIndex, options) {
  const line = lines[startIndex]
  if (!line.startsWith('```')) return null

  const languageMatch = line.match(/^```(\w*)/)
  const language = languageMatch ? languageMatch[1] : ''

  let codeLines = []
  let currentIndex = startIndex + 1

  while (currentIndex < lines.length && !lines[currentIndex].startsWith('```')) {
    codeLines.push(lines[currentIndex])
    currentIndex++
  }

  if (currentIndex >= lines.length) {
    return null // 未找到结束标记
  }

  const codeContent = codeLines.join('\n')
  const escapedCode = options.escapeHtml ? escapeHtml(codeContent) : codeContent

  const codeHtml = options.highlightCode
    ? `<pre class="${options.classPrefix}code-block ${options.classPrefix}code-block-${language}"><code class="language-${language}">${escapedCode}</code></pre>`
    : `<pre class="${options.classPrefix}code-block"><code>${escapedCode}</code></pre>`

  return {
    type: 'code_block',
    language,
    content: codeContent,
    html: codeHtml,
    endIndex: currentIndex
  }
}

/**
 * 解析行内元素（粗体、斜体、代码、链接等）
 * @param {string} text - 文本内容
 * @param {Object} options - 配置选项
 * @returns {string} 转换后的文本
 */
function parseInlineElements(text, options) {
  let result = text

  // 按顺序应用转换（注意顺序很重要）
  result = parseCode(result, options)
  result = parseLinksAndImages(result, options)
  result = parseEmphasis(result, options)

  return result
}

/**
 * 解析Markdown表格
 * @param {Array} lines - 文本行数组
 * @param {number} startIndex - 起始索引
 * @param {Object} options - 配置选项
 * @returns {Object} 解析结果
 */
function parseTable(lines, startIndex, options) {
  if (!options.convertTables) return null

  const headerLine = lines[startIndex]
  const separatorLine = lines[startIndex + 1]
  const dataLines = []

  // 检查是否为表格
  if (!headerLine.includes('|') || !separatorLine.includes('|') || !separatorLine.includes('-')) {
    return null
  }

  // 验证分隔符行格式
  const separatorMatch = separatorLine.match(/^\|?(-+\|?)+$/)
  if (!separatorMatch) return null

  let currentIndex = startIndex + 2
  while (currentIndex < lines.length && lines[currentIndex].includes('|')) {
    dataLines.push(lines[currentIndex])
    currentIndex++
  }

  // 解析表头
  const headers = headerLine
    .split('|')
    .filter((cell) => cell.trim())
    .map((cell) => cell.trim())
  const alignments = separatorLine
    .split('|')
    .filter((cell) => cell.trim())
    .map((cell) => {
      const content = cell.trim()
      if (content.startsWith(':') && content.endsWith(':')) return 'center'
      if (content.endsWith(':')) return 'right'
      return 'left'
    })

  // 解析数据行
  const rows = dataLines.map((line) =>
    line
      .split('|')
      .filter((cell) => cell.trim())
      .map((cell) => cell.trim())
  )

  // 生成HTML表格
  const headerHtml = headers
    .map(
      (header, index) =>
        `<th class="${options.classPrefix}table-header" style="text-align: ${alignments[index]}">${parseInlineElements(header, options)}</th>`
    )
    .join('')

  const rowsHtml = rows
    .map(
      (row) =>
        `<tr class="${options.classPrefix}table-row">${row
          .map(
            (cell, index) =>
              `<td class="${options.classPrefix}table-cell" style="text-align: ${alignments[index]}">${parseInlineElements(cell, options)}</td>`
          )
          .join('')}</tr>`
    )
    .join('')

  const tableHtml = `
    <table class="${options.classPrefix}table">
      <thead class="${options.classPrefix}table-head">
        <tr class="${options.classPrefix}table-header-row">${headerHtml}</tr>
      </thead>
      <tbody class="${options.classPrefix}table-body">${rowsHtml}</tbody>
    </table>
  `

  return {
    type: 'table',
    headers,
    rows,
    alignments,
    html: tableHtml,
    endIndex: currentIndex - 1
  }
}

/**
 * 解析普通段落
 * @param {Array} lines - 文本行数组
 * @param {number} startIndex - 起始索引
 * @param {Object} options - 配置选项
 * @returns {Object} 解析结果
 */
function parseParagraph(lines, startIndex, options) {
  let paragraphLines = []
  let currentIndex = startIndex

  while (currentIndex < lines.length) {
    const line = lines[currentIndex]

    // 遇到空行或新的块级元素时结束段落
    if (!line.trim() || line.match(/^(#{1,6}\s|[-*+] |\d+\.|>|```|\|)/)) {
      break
    }

    paragraphLines.push(line)
    currentIndex++
  }

  if (paragraphLines.length === 0) return null

  const paragraphText = paragraphLines.join(options.preserveLineBreaks ? '<br>' : ' ')
  const parsedText = parseInlineElements(paragraphText, options)

  return {
    type: 'paragraph',
    content: paragraphText,
    html: `<p class="${options.classPrefix}paragraph">${parsedText}</p>`,
    endIndex: currentIndex - 1
  }
}

/**
 * 主转换函数 - 将Markdown转换为富文本HTML
 * @param {string} markdown - Markdown文本
 * @param {Object} userOptions - 用户配置选项
 * @returns {Object} 转换结果
 */
export function markdownToRichText(markdown, userOptions = {}) {
  // 合并默认配置和用户配置
  const options = { ...defaultOptions, ...userOptions }

  // 验证输入
  const validation = validateMarkdown(markdown)
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
      suggestions: validation.suggestions,
      html: '',
      stats: validation
    }
  }

  try {
    const lines = markdown.split('\n')
    const blocks = []
    const stats = {
      headings: 0,
      paragraphs: 0,
      lists: 0,
      codeBlocks: 0,
      blockquotes: 0,
      tables: 0,
      images: 0,
      links: 0
    }

    let i = 0
    while (i < lines.length) {
      const line = lines[i]

      // 跳过空行
      if (!line.trim()) {
        i++
        continue
      }

      let block = null

      // 按优先级尝试解析不同类型的块
      if (!block) block = parseCodeBlock(lines, i, options)
      if (!block) block = parseHeading(line, options)
      if (!block) block = parseTable(lines, i, options)
      if (!block) block = parseList(lines, i, options)
      if (!block) block = parseBlockquote(lines, i, options)
      if (!block) block = parseParagraph(lines, i, options)

      if (block) {
        blocks.push(block)
        stats[
          block.type === 'code_block'
            ? 'codeBlocks'
            : block.type === 'heading'
              ? 'headings'
              : block.type === 'table'
                ? 'tables'
                : block.type === 'list'
                  ? 'lists'
                  : block.type === 'blockquote'
                    ? 'blockquotes'
                    : 'paragraphs'
        ]++

        // 更新图片和链接统计
        if (block.html) {
          const imageMatches = block.html.match(/<img/g) || []
          const linkMatches = block.html.match(/<a/g) || []
          stats.images += imageMatches.length
          stats.links += linkMatches.length
        }

        i = block.endIndex !== undefined ? block.endIndex + 1 : i + 1
      } else {
        i++ // 安全处理，避免无限循环
      }
    }

    // 生成最终的HTML
    const html = blocks.map((block) => block.html).join('\n')

    const result = {
      success: true,
      html,
      stats: options.generateStats ? { ...stats, ...validation } : null,
      blocks,
      warnings: validation.warnings
    }

    return result
  } catch (error) {
    return {
      success: false,
      error: `转换过程中发生错误: ${error.message}`,
      html: '',
      stats: null,
      suggestions: ['请检查Markdown语法是否正确', '尝试简化复杂结构']
    }
  }
}

/**
 * 将Markdown转换为纯文本（去除所有格式）
 * @param {string} markdown - Markdown文本
 * @returns {string} 纯文本
 */
export function markdownToPlainText(markdown) {
  if (typeof markdown !== 'string') return ''

  // 移除Markdown格式标记
  return markdown
    .replace(/#{1,6}\s+/g, '') // 移除标题
    .replace(/\*\*(.*?)\*\*|__(.*?)__/g, '$1$2') // 移除粗体
    .replace(/\*(.*?)\*|_(.*?)_/g, '$1$2') // 移除斜体
    .replace(/~~(.*?)~~/g, '$1') // 移除删除线
    .replace(/`([^`]+)`/g, '$1') // 移除行内代码
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文本
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // 移除图片，保留alt文本
    .replace(/^>\s*/gm, '') // 移除引用标记
    .replace(/^\s*[-*+]\s+/gm, '') // 移除无序列表标记
    .replace(/^\s*\d+\.\s+/gm, '') // 移除有序列表标记
    .replace(/\|.*\|/g, '') // 移除表格
    .replace(/\n{3,}/g, '\n\n') // 合并多个空行
    .trim()
}

/**
 * 从Markdown中提取所有图片链接
 * @param {string} markdown - Markdown文本
 * @returns {Array} 图片链接数组
 */
export function extractImagesFromMarkdown(markdown) {
  if (typeof markdown !== 'string') return []

  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  const images = []
  let match

  while ((match = imageRegex.exec(markdown)) !== null) {
    const [, alt, src] = match
    images.push({
      alt: alt || '',
      src,
      index: match.index,
      length: match[0].length
    })
  }

  return images
}

/**
 * 从Markdown中提取所有链接
 * @param {string} markdown - Markdown文本
 * @returns {Array} 链接数组
 */
export function extractLinksFromMarkdown(markdown) {
  if (typeof markdown !== 'string') return []

  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const links = []
  let match

  while ((match = linkRegex.exec(markdown)) !== null) {
    const [, text, url] = match
    links.push({
      text,
      url,
      index: match.index,
      length: match[0].length
    })
  }

  return links
}

/**
 * 验证Markdown语法
 * @param {string} markdown - Markdown文本
 * @returns {Object} 验证结果
 */
export function validateMarkdownSyntax(markdown) {
  return validateMarkdown(markdown)
}

/**
 * 复制富文本到剪贴板
 * @param {string} html - 富文本HTML
 * @returns {Promise<boolean>} 是否复制成功
 */
export async function copyRichTextToClipboard(html) {
  try {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new Error('Clipboard API not supported')
    }

    const blob = new Blob([html], { type: 'text/html' })
    const clipboardItem = new ClipboardItem({ 'text/html': blob })

    await navigator.clipboard.write([clipboardItem])

    ElMessage({
      message: '富文本已复制到剪贴板',
      type: 'success'
    })

    return true
  } catch (error) {
    console.error('复制富文本失败:', error)

    // 降级方案：复制纯文本
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    const plainText = tempDiv.textContent || tempDiv.innerText || ''

    try {
      await navigator.clipboard.writeText(plainText)
      ElMessage({
        message: '已复制为纯文本',
        type: 'info'
      })
      return true
    } catch (fallbackError) {
      console.log(fallbackError)
      ElMessage({
        message: '复制失败，请手动选择文本复制',
        type: 'error'
      })
      return false
    }
  }
}

/**
 * 导出为HTML文件
 * @param {string} html - 富文本HTML
 * @param {string} filename - 文件名（不含扩展名）
 */
export function exportAsHtmlFile(html, filename = 'export') {
  try {
    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 20px; }
        .md-heading { margin: 1.2em 0 0.6em; }
        .md-paragraph { margin: 1em 0; }
        .md-code-block { background: #f6f8fa; padding: 1em; border-radius: 6px; overflow-x: auto; }
        .md-inline-code { background: #f6f8fa; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; }
        .md-blockquote { border-left: 4px solid #ddd; padding-left: 1em; margin: 1em 0; color: #666; }
        .md-table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        .md-table th, .md-table td { border: 1px solid #ddd; padding: 0.5em; text-align: left; }
        .md-table th { background: #f6f8fa; font-weight: bold; }
        .md-image { max-width: 100%; height: auto; }
        .md-link { color: #0366d6; text-decoration: none; }
        .md-link:hover { text-decoration: underline; }
    </style>
</head>
<body>
    ${html}
</body>
</html>`

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.html`
    link.click()
    URL.revokeObjectURL(url)

    ElMessage({
      message: 'HTML文件导出成功',
      type: 'success'
    })
  } catch (error) {
    console.error('导出HTML文件失败:', error)
    ElMessage({
      message: '导出失败',
      type: 'error'
    })
  }
}

// 默认导出主函数
export default markdownToRichText
