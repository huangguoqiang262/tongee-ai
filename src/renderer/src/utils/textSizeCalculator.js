/**
 * 文本大小计算工具函数
 * 支持计算文本的字节大小、字符数、单词数，并提供格式化显示
 * @author AI Assistant
 * @version 1.0.0
 */

/**
 * 默认配置选项
 */
const defaultOptions = {
  // 是否启用Unicode字符处理
  handleUnicode: true,
  // 是否计算换行符
  countLineBreaks: true,
  // 是否计算空格
  countSpaces: true,
  // 格式化选项
  formatOptions: {
    // 小数位数
    decimalPlaces: 2,
    // 是否显示单位
    showUnits: true,
    // 单位分隔符
    unitSeparator: ' ',
    // 是否使用二进制单位 (1024) 或十进制单位 (1000)
    useBinaryUnits: true
  }
}

/**
 * 计算文本的字节大小
 * @param {string} text - 需要计算大小的文本
 * @param {Object} options - 配置选项
 * @returns {number} 字节大小
 */
export function calculateTextSize(text, options = {}) {
  const config = { ...defaultOptions, ...options }

  if (typeof text !== 'string') {
    throw new Error('输入必须是字符串类型')
  }

  let byteSize = 0

  if (config.handleUnicode) {
    // 使用TextEncoder处理Unicode字符
    const encoder = new TextEncoder()
    byteSize = encoder.encode(text).length
  } else {
    // 简单计算（不处理Unicode）
    byteSize = text.length
  }

  // 如果不计算换行符，减去换行符的大小
  if (!config.countLineBreaks) {
    const lineBreakCount = (text.match(/\n/g) || []).length
    byteSize -= lineBreakCount
  }

  // 如果不计算空格，减去空格的大小
  if (!config.countSpaces) {
    const spaceCount = (text.match(/ /g) || []).length
    byteSize -= spaceCount
  }

  return Math.max(0, byteSize)
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节大小
 * @param {Object} formatOptions - 格式化选项
 * @returns {string} 格式化后的文件大小
 */
export function formatFileSize(bytes, formatOptions = {}) {
  if (typeof bytes !== 'number' || bytes < 0) {
    throw new Error('字节大小必须是正数')
  }

  const config = { ...defaultOptions.formatOptions, ...formatOptions }
  const base = config.useBinaryUnits ? 1024 : 1000

  if (bytes === 0) {
    return config.showUnits ? `0${config.unitSeparator}B` : '0'
  }

  const units = config.useBinaryUnits
    ? ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const exponent = Math.floor(Math.log(bytes) / Math.log(base))
  const unitIndex = Math.min(exponent, units.length - 1)
  const size = bytes / Math.pow(base, unitIndex)
  const unit = units[unitIndex]

  const formattedSize = size.toFixed(config.decimalPlaces)

  if (config.showUnits) {
    return `${formattedSize}${config.unitSeparator}${unit}`
  } else {
    return formattedSize
  }
}

/**
 * 计算文本的字符数
 * @param {string} text - 需要计算字符数的文本
 * @param {Object} options - 配置选项
 * @returns {number} 字符数
 */
export function countCharacters(text, options = {}) {
  const config = { ...defaultOptions, ...options }

  if (typeof text !== 'string') {
    throw new Error('输入必须是字符串类型')
  }

  let characterCount = text.length

  // 如果不计算换行符
  if (!config.countLineBreaks) {
    characterCount -= (text.match(/\n/g) || []).length
  }

  // 如果不计算空格
  if (!config.countSpaces) {
    characterCount -= (text.match(/ /g) || []).length
  }

  return Math.max(0, characterCount)
}

/**
 * 计算文本的单词数
 * @param {string} text - 需要计算单词数的文本
 * @returns {number} 单词数
 */
export function countWords(text) {
  if (typeof text !== 'string') {
    throw new Error('输入必须是字符串类型')
  }

  if (!text.trim()) {
    return 0
  }

  // 使用正则表达式分割单词（支持中文、英文、数字等）
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
  return words.length
}

/**
 * 计算文本的行数
 * @param {string} text - 需要计算行数的文本
 * @returns {number} 行数
 */
export function countLines(text) {
  if (typeof text !== 'string') {
    throw new Error('输入必须是字符串类型')
  }

  if (!text.trim()) {
    return 0
  }

  // 计算行数（空文本算作0行）
  const lines = text.split('\n').filter((line) => line.trim().length > 0)
  return lines.length
}

/**
 * 获取文本的详细统计信息
 * @param {string} text - 需要统计的文本
 * @param {Object} options - 配置选项
 * @returns {Object} 统计信息对象
 */
export function getTextStatistics(text, options = {}) {
  const config = { ...defaultOptions, ...options }

  if (typeof text !== 'string') {
    throw new Error('输入必须是字符串类型')
  }

  const byteSize = calculateTextSize(text, config)
  const characterCount = countCharacters(text, config)
  const wordCount = countWords(text)
  const lineCount = countLines(text)

  const formattedSize = formatFileSize(byteSize, config.formatOptions)

  // 计算平均单词长度
  const avgWordLength = wordCount > 0 ? (characterCount / wordCount).toFixed(2) : 0

  // 计算平均每行字符数
  const avgCharsPerLine = lineCount > 0 ? (characterCount / lineCount).toFixed(2) : 0

  return {
    byteSize,
    formattedSize,
    characterCount,
    wordCount,
    lineCount,
    avgWordLength: parseFloat(avgWordLength),
    avgCharsPerLine: parseFloat(avgCharsPerLine),
    isEmpty: text.trim().length === 0,
    hasContent: text.trim().length > 0
  }
}

/**
 * 比较两个文本的大小
 * @param {string} text1 - 第一个文本
 * @param {string} text2 - 第二个文本
 * @param {Object} options - 配置选项
 * @returns {Object} 比较结果
 */
export function compareTextSizes(text1, text2, options = {}) {
  const stats1 = getTextStatistics(text1, options)
  const stats2 = getTextStatistics(text2, options)

  const sizeDifference = stats1.byteSize - stats2.byteSize
  const sizeRatio = stats2.byteSize > 0 ? (stats1.byteSize / stats2.byteSize).toFixed(2) : 0

  return {
    text1: stats1,
    text2: stats2,
    sizeDifference,
    sizeRatio: parseFloat(sizeRatio),
    isText1Larger: sizeDifference > 0,
    isText2Larger: sizeDifference < 0,
    areEqual: sizeDifference === 0,
    percentageDifference:
      stats2.byteSize > 0 ? ((sizeDifference / stats2.byteSize) * 100).toFixed(2) + '%' : 'N/A'
  }
}

/**
 * 估算文本的存储空间需求
 * @param {string} text - 需要估算的文本
 * @param {Object} options - 配置选项
 * @returns {Object} 存储空间估算
 */
export function estimateStorageRequirements(text, options = {}) {
  const stats = getTextStatistics(text, options)
  const baseSize = stats.byteSize

  // 估算不同编码格式下的存储需求
  const estimations = {
    utf8: baseSize,
    utf16: baseSize * 2, // UTF-16通常使用2字节
    ascii: Math.ceil(baseSize * 0.8), // ASCII通常更小
    compressed: Math.ceil(baseSize * 0.6), // 压缩后的估算
    withMetadata: Math.ceil(baseSize * 1.2) // 包含元数据的估算
  }

  return {
    baseSize: stats.formattedSize,
    estimations: {
      utf8: formatFileSize(estimations.utf8, options.formatOptions),
      utf16: formatFileSize(estimations.utf16, options.formatOptions),
      ascii: formatFileSize(estimations.ascii, options.formatOptions),
      compressed: formatFileSize(estimations.compressed, options.formatOptions),
      withMetadata: formatFileSize(estimations.withMetadata, options.formatOptions)
    },
    recommendations: {
      smallText: baseSize < 1024 ? '适合内存存储' : '建议文件存储',
      compression: baseSize > 10240 ? '建议压缩存储' : '无需压缩',
      encoding: baseSize > 50000 ? '建议使用UTF-8编码' : '任何编码均可'
    }
  }
}

/**
 * 验证文本大小限制
 * @param {string} text - 需要验证的文本
 * @param {number} maxSizeBytes - 最大允许的字节大小
 * @param {Object} options - 配置选项
 * @returns {Object} 验证结果
 */
export function validateTextSize(text, maxSizeBytes, options = {}) {
  const stats = getTextStatistics(text, options)
  const isWithinLimit = stats.byteSize <= maxSizeBytes
  const remainingBytes = Math.max(0, maxSizeBytes - stats.byteSize)
  const usagePercentage = ((stats.byteSize / maxSizeBytes) * 100).toFixed(2)

  return {
    isValid: isWithinLimit,
    currentSize: stats.formattedSize,
    maxSize: formatFileSize(maxSizeBytes, options.formatOptions),
    remainingSize: formatFileSize(remainingBytes, options.formatOptions),
    usagePercentage: parseFloat(usagePercentage),
    isOverLimit: !isWithinLimit,
    overByBytes: Math.max(0, stats.byteSize - maxSizeBytes),
    overByFormatted: formatFileSize(
      Math.max(0, stats.byteSize - maxSizeBytes),
      options.formatOptions
    )
  }
}

/**
 * 批量计算多个文本的大小
 * @param {Array} texts - 文本数组
 * @param {Object} options - 配置选项
 * @returns {Array} 计算结果数组
 */
export function batchCalculateTextSizes(texts, options = {}) {
  if (!Array.isArray(texts)) {
    throw new Error('输入必须是数组')
  }

  return texts.map((text, index) => ({
    index,
    text: text.substring(0, 50) + (text.length > 50 ? '...' : ''), // 截取前50字符显示
    statistics: getTextStatistics(text, options),
    isValid: typeof text === 'string'
  }))
}

/**
 * 创建文本大小监控器
 * @param {string} initialText - 初始文本
 * @param {Object} options - 配置选项
 * @returns {Object} 监控器对象
 */
export function createTextSizeMonitor(initialText = '', options = {}) {
  const config = { ...defaultOptions, ...options }
  let currentText = initialText
  let history = []

  const monitor = {
    /**
     * 更新文本并记录历史
     * @param {string} newText - 新文本
     */
    update(newText) {
      if (typeof newText !== 'string') {
        throw new Error('新文本必须是字符串')
      }

      const oldStats = getTextStatistics(currentText, config)
      currentText = newText
      const newStats = getTextStatistics(newText, config)

      history.push({
        timestamp: new Date().toISOString(),
        oldText: currentText,
        newText: newText,
        oldStats,
        newStats,
        change: {
          sizeDifference: newStats.byteSize - oldStats.byteSize,
          characterDifference: newStats.characterCount - oldStats.characterCount,
          wordDifference: newStats.wordCount - oldStats.wordCount
        }
      })

      // 限制历史记录数量
      if (history.length > 100) {
        history = history.slice(-50)
      }

      return newStats
    },

    /**
     * 获取当前文本统计信息
     */
    getCurrentStats() {
      return getTextStatistics(currentText, config)
    },

    /**
     * 获取历史记录
     */
    getHistory() {
      return [...history]
    },

    /**
     * 清空历史记录
     */
    clearHistory() {
      history = []
    },

    /**
     * 获取变化趋势
     */
    getTrend() {
      if (history.length < 2) {
        return { trend: 'stable', changeRate: 0 }
      }

      const recentChanges = history.slice(-5)
      const totalChange = recentChanges.reduce((sum, entry) => sum + entry.change.sizeDifference, 0)

      const avgChange = totalChange / recentChanges.length
      let trend = 'stable'

      if (avgChange > 10) trend = 'growing'
      else if (avgChange < -10) trend = 'shrinking'

      return { trend, changeRate: avgChange }
    }
  }

  return monitor
}

// 默认导出主函数
export default getTextStatistics
