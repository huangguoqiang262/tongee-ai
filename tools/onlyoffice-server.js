/*
OnlyOffice 示例后端（用于局域网文件访问与保存回调示例）
使用方式（开发环境快速测试）:
  1. 在项目根目录创建目录: onlyoffice_files/，把要预览的 Office 文件放到里面
  2. 安装依赖: npm i express morgan cors body-parser
  3. 启动: node tools/onlyoffice-server.js
  4. 在浏览器或 Electron 中访问文件: http://<server-ip>:3000/files/example.docx

说明:
  - OnlyOffice Document Server 需要能从局域网访问到上述文件 URL（/files/...）。
  - 如果你开启了 OnlyOffice 的 JWT 校验，请在 OnlyOffice Preview 组件中传入 jwt。
  - 生产环境建议做鉴权、HTTPS 和更严格的错误处理。
*/

const express = require('express')
const path = require('path')
const fs = require('fs')
const cors = require('cors')
const morgan = require('morgan')
const bodyParser = require('body-parser')

const app = express()
const PORT = process.env.PORT || 3000
const FILES_DIR = path.resolve(process.cwd(), 'onlyoffice_files')

app.use(cors())
app.use(morgan('dev'))
app.use(bodyParser.json())

if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR, { recursive: true })
}

// 提供静态文件访问: /files/:filename
app.get('/files/:filename', (req, res) => {
  const filename = req.params.filename
  const filePath = path.join(FILES_DIR, filename)
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found')
  }
  // 以二进制流返回，OnlyOffice 会通过这个 URL 拉取文档
  res.sendFile(filePath)
})

// OnlyOffice 编辑完成后的回调示例（保存回调）
app.post('/onlyoffice/callback', (req, res) => {
  // OnlyOffice 会发送一系列操作回调（例如 status=2 表示保存完成）
  // 这里仅做示例：记录 body 并返回 {error:0}
  console.log('OnlyOffice callback body:', req.body)
  // 生产环境请根据 OnlyOffice 回调规范处理保存流程
  res.json({ error: 0 })
})

app.listen(PORT, () => {
  console.log(`OnlyOffice 文件服务启动: http://0.0.0.0:${PORT}`)
  console.log(`请把要预览的文件放到: ${FILES_DIR}`)
})
