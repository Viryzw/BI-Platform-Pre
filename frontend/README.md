# Atlas BI 前端

当前目录是 Atlas BI 在 Windows、macOS 和 Linux 上统一使用的 Vite 前端。

## 安装依赖

```bash
npm install
```

## 本地开发

```bash
npm run dev
```

如需允许局域网或服务器外部访问：

```bash
npm run dev -- --host 0.0.0.0
```

开发服务会将 `/api` 和 `/__backend_health` 代理到 `http://127.0.0.1:8000`。

## 测试与生产构建

```bash
npm run build
npm test
```

构建结果位于 `frontend/dist/`。生产部署时应发布完整目录，不能遗漏
`dist/assets/` 下的脚本和样式文件。
