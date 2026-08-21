# Atlas BI 前端（macOS / 跨平台验收版）

这个目录是新增的 macOS 前端入口。原项目中的 `frontend/` Windows/Vue 代码保持不变。

## 为什么原前端在 macOS 无法启动

HTML、CSS、JavaScript 和 Vue 源码本身是跨平台的。问题来自原 `node_modules`：其中包含按 Windows 安装的 Rolldown、LightningCSS 原生二进制文件，不能直接在 macOS 上执行；Windows 复制过来的命令文件也没有 macOS 所需的可执行权限。

不要在操作系统之间复制 `node_modules`。如果继续使用原 Vue/Vite 版本，应在每台电脑上删除 `node_modules` 后重新执行 `npm ci`。

## macOS 启动

前端只依赖 Node.js，不需要安装 npm 包：

```bash
cd frontend-macos
node server.mjs
```

也可以双击 `start-macos.command`。默认访问地址：

```text
http://127.0.0.1:5173
```

默认把 `/api/*` 转发给：

```text
http://127.0.0.1:8000
```

如需更换后端地址：

```bash
BACKEND_URL=http://127.0.0.1:9000 node server.mjs
```

## Windows 启动

原来的 `frontend/` 目录和 Vue/Vite 代码仍然保留；也可以双击本目录中的 `start-windows.cmd` 运行这个无构建版本。

## 后端准备（macOS）

若 Mac 尚未安装运行环境，可先准备 Python 和 MySQL：

```bash
brew install python mysql
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r frontend-macos/requirements-backend-macos.txt
```

然后进入包含 `models/` 与 `chroma_db/` 的原后端目录启动：

```bash
cd backend
python main.py
```

先访问 `http://127.0.0.1:8000/` 确认后端正常，再打开前端。顶部状态会显示“后端已连接”。

## SQL 文件接入数据源

在“数据源管理”中选择“上传 SQL 接入”，上传 UTF-8 编码的 `.sql` 文件。文件名必须为“企业名-数据源名.sql”，平台会按第一个英文半角减号自动匹配或创建企业，并将后半部分作为数据源名。文件必须创建一个使用英文、数字或下划线命名的新数据库；平台不会覆盖已有数据库。数据库读取账号由后端统一托管，前端不再收集账号和密码。

本机 MySQL 默认复用 `DATABASE_URL` 中的管理连接。远程 MySQL 可在后端设置：

```bash
DATA_SOURCE_ADMIN_URL='mysql+pymysql://admin:password@db-host:3306/mysql?charset=utf8mb4'
DATA_SOURCE_IMPORT_HOST='db-host'
DATA_SOURCE_READER_USERNAME='atlas_bi_reader'
DATA_SOURCE_READER_PASSWORD='replace-with-a-strong-password'
DATA_SOURCE_READER_HOST='backend-host-as-seen-by-mysql'
```

`DATA_SOURCE_READER_USERNAME` 和 `DATA_SOURCE_READER_PASSWORD` 必须同时配置；若均不配置，平台会为每个数据库自动生成独立只读账号和随机强密码，并加密保存。用户需要先在智能问数页面配置 DeepSeek API Key；SQL 导入完成后，后台会使用该用户的 API 自动生成并校验指标，再按真实表结构与指标口径生成数据字典、分析规则和常见问题，全部绑定到当前数据源并写入 RAG。空安装不再自动创建占位企业。

## 数据状态

- 后端在线：仪表盘、问数及后台管理请求真实 FastAPI 接口。
- 后端离线：界面进入明确标识的“预览模式”，使用样例数据方便验收样式，不会假装写入后端。
