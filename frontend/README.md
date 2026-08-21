# Atlas BI 前端

`frontend-macos/` 是只读界面模板，`frontend/` 是 Windows/Vite 开发与生产构建目录。
两者现在独立维护，运行和构建 Windows 前端不会覆盖本目录中的修改，也不会修改
macOS 版。

只有需要重新从 macOS 模板开始时才手工执行以下命令；该命令会覆盖 Windows
前端的 `index.html` 与 `public/assets/`：

```bash
cd /Users/wayne/Documents/Projects/bi_plantform/frontend
npm run sync:macos-template
```

该命令只读取 `frontend-macos/`，不会修改 macOS 版。日常启动不要执行该命令。

```bash
npm run dev
npm run build
npm test
```

开发服务会将 `/api` 和 `/__backend_health` 代理到 `http://127.0.0.1:8000`。
