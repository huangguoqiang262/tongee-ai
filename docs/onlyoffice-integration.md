# OnlyOffice 集成说明（局域网自托管方案）

## 概述
本说明提供一个轻量的备用实现，包含：

- 前端组件：`src/renderer/src/components/convenient-component/onlyofficePreview.vue`（基于 iframe + OnlyOffice Docs API 的 srcdoc 实现）
- 局域网文件服务示例：`tools/onlyoffice-server.js`（用于在局域网内暴露文件 URL，供 Document Server 拉取）

目标：兼容各种 Office 格式并支持局域网访问、可在 Electron 应用中直接集成。

---

## 基本流程
1. 在内网某台机器部署 OnlyOffice Document Server（建议使用 Docker）。
2. 在可以访问 Document Server 的局域网机器上运行 `tools/onlyoffice-server.js`，把要预览的文件放到 `onlyoffice_files/` 目录。
3. 在前端使用 `onlyofficePreview.vue`，传入 `src`（例如 `http://192.168.1.100:3000/files/example.docx`）和 `serverUrl`（例如 `http://192.168.1.200:8080`）。

---

## 示例：部署 Document Server（快速）
使用 Docker:

```bash
docker run -i -t -d -p 80:80 onlyoffice/documentserver
```

启动后在局域网中可以通过 `http://<server-ip>/` 访问。

注意：生产环境推荐使用 HTTPS、JWT 等安全措施。

---

## 前端使用示例
在 Vue 页面中引入组件并使用：

```vue
<template>
  <OnlyOfficePreview
    src="http://192.168.1.100:3000/files/test.docx"
    serverUrl="http://192.168.1.200:8080"
    mode="view"
    height="600px"
    width="100%"
  />
</template>

<script>
import OnlyOfficePreview from '@/components/convenient-component/onlyofficePreview.vue'
export default { components: { OnlyOfficePreview } }
</script>
```

如果你的 Document Server 要求 JWT，请在启动 Document Server 时启用 JWT，并在组件中传入 `:jwt="yourToken"`。

---

## 后端示例（tools/onlyoffice-server.js）
- `GET /files/:filename`：返回指定文件，OnlyOffice Document Server 从该 URL 拉取文档。
- `POST /onlyoffice/callback`：OnlyOffice 在保存时的回调示例，返回 `{error:0}` 表示成功。

---

## 注意事项
- 确保 Document Server 能访问 `GET /files/:filename` 提供的 URL（网络连通、端口、防火墙）。
- 编辑功能（mode=edit）需要配置回调保存逻辑并处理 OnlyOffice 的保存协议。
- 生产部署请使用 HTTPS 和鉴权策略，并把 callbackUrl 指向可信任的保存服务。

---

如需我：
- 把 `onlyofficePreview` 直接集成到某个页面（我可以提交一个示例改动）；
- 实现编辑保存回调的具体逻辑（例如保存到本地或上传存储）；
- 或添加 JWT 生成/校验示例（服务器端）。

告诉我你接下来想要我做哪一步，我会继续实现。