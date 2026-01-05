/**
 * 将base64图片URL转换为正常图片格式并复制到剪贴板
 * 专注于使用navigator.clipboard.write方法
 * @param {string} base64Url - base64格式的图片URL
 * @returns {Promise<boolean>} 复制是否成功
 */
export async function copyBase64ImageAsNormalImage(base64Url) {
  try {
    // 1. 验证输入参数
    if (!base64Url || typeof base64Url !== 'string') {
      throw new Error('base64图片URL不能为空')
    }

    // 2. 验证base64格式
    if (!base64Url.startsWith('data:image/')) {
      throw new Error('无效的base64图片URL格式，必须以data:image/开头')
    }

    // 3. 提取base64数据和MIME类型
    const base64Data = base64Url.split(',')[1]
    if (!base64Data) {
      throw new Error('base64数据格式错误，缺少数据部分')
    }

    const mimeTypeMatch = base64Url.match(/data:(image\/\w+);base64/)
    if (!mimeTypeMatch) {
      throw new Error('无法识别图片MIME类型')
    }
    const mimeType = mimeTypeMatch[1]

    // 4. 检查Clipboard API支持
    if (!navigator.clipboard) {
      throw new Error('浏览器不支持Clipboard API')
    }

    if (!window.ClipboardItem) {
      throw new Error('浏览器不支持ClipboardItem API')
    }

    // 5. 将base64转换为Blob
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: mimeType })

    // 6. 验证Blob创建成功
    if (!blob || blob.size === 0) {
      throw new Error('创建图片Blob失败')
    }

    // 7. 使用navigator.clipboard.write复制图片
    const clipboardItem = new ClipboardItem({
      [mimeType]: blob
    })

    await navigator.clipboard.write([clipboardItem])
    return true
  } catch (error) {
    console.error('复制base64图片失败:', error)

    // 提供更详细的错误信息
    if (error.name === 'NotAllowedError') {
      throw new Error('复制操作被拒绝，请检查浏览器剪贴板权限')
    } else if (error.name === 'DataError') {
      throw new Error('图片数据格式错误，无法复制')
    } else if (error.name === 'TypeError') {
      throw new Error('浏览器不支持此操作')
    }

    throw error
  }
}

/**
 * 简化的base64图片下载功能
 * @param {string} base64Url - base64格式的图片URL
 * @param {string} [fileName='image.png'] - 下载的文件名
 * @returns {boolean} 下载是否成功
 */
export function downloadBase64Image(base64Url, fileName = 'image.png') {
  try {
    if (!base64Url || !base64Url.startsWith('data:image/')) {
      throw new Error('无效的base64图片URL')
    }

    // 直接使用base64 URL创建下载链接
    const link = document.createElement('a')
    link.href = base64Url
    link.download = fileName
    link.style.display = 'none'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return true
  } catch (error) {
    console.error('下载base64图片失败:', error)
    return false
  }
}

/**
 * 验证base64图片URL是否有效
 * @param {string} base64Url - base64格式的图片URL
 * @returns {boolean} 是否有效
 */
export function isValidBase64Image(base64Url) {
  try {
    if (!base64Url || typeof base64Url !== 'string') {
      return false
    }

    if (!base64Url.startsWith('data:image/')) {
      return false
    }

    const base64Data = base64Url.split(',')[1]
    if (!base64Data) {
      return false
    }

    // 尝试解码base64数据
    atob(base64Data)
    return true
  } catch {
    return false
  }
}

/**
 * 获取base64图片的MIME类型
 * @param {string} base64Url - base64格式的图片URL
 * @returns {string|null} MIME类型
 */
export function getBase64ImageMimeType(base64Url) {
  try {
    if (!isValidBase64Image(base64Url)) {
      return null
    }

    const mimeTypeMatch = base64Url.match(/data:(image\/\w+);base64/)
    return mimeTypeMatch ? mimeTypeMatch[1] : null
  } catch {
    return null
  }
}

/**
 * 检查浏览器是否支持图片复制功能
 * @returns {boolean} 是否支持
 */
export function isImageCopySupported() {
  return !!(navigator.clipboard && window.ClipboardItem)
}
