# Atlas BI 启动说明

## Windows 后端

确保 MySQL 服务已经启动。首次运行时，后端会自动创建平台管理数据库
`bi_platform` 以及所需数据表，不需要手工执行建库 SQL。

在 PowerShell 中执行：

```powershell
conda activate BI
cd D:\bi_plantform\bi_plantform\backend
python main.py
```

如果 MySQL 的 `root` 账号有密码，先配置连接地址：

```powershell
$env:DATABASE_URL = "mysql+pymysql://root:你的密码@127.0.0.1:3306/bi_platform?charset=utf8mb4"
python main.py
```

用于 `DATABASE_URL` 的账号首次启动时需要具有 `CREATE DATABASE` 权限。
数据库创建完成后，后端会继续自动建表和执行结构迁移。

第一次打开登录页时，如果系统还没有任何用户，页面会显示“注册首个管理员”。
首个账号创建成功后公开注册自动关闭，其他账号由管理员在“用户管理”中创建。

如果无法使用注册页面，也可以先生成密码哈希：

```powershell
cd D:\bi_plantform\bi_plantform\backend
python -c "from security import hash_password; print(hash_password('替换为你的密码'))"
```

复制输出的完整哈希，然后在 MySQL 中创建管理员：

```sql
USE bi_platform;
INSERT INTO users (username, password, role)
VALUES ('admin', '粘贴上一步生成的完整哈希', 'admin');
```

## macOS 后端

```bash
cd /Users/wayne/Documents/Projects/bi_plantform/backend
conda run -n BI python main.py
```

DeepSeek API Key 由每个用户在“智能问数”页面配置，不要写入 README 或前端代码。
正式环境启动前请配置稳定的 `AUTH_SECRET` 和 `ATLAS_SECRET_KEY`，不要使用开发默认值。

本机 MySQL 新数据源会使用平台管理连接自动校验并补充目标库的 `SELECT` 权限。
远程 MySQL 如需自动授权，请只在后端进程中配置管理员连接和后端来源主机：

```bash
export DATA_SOURCE_ADMIN_URL="mysql+pymysql://admin:password@db-host:3306/mysql"
export DATA_SOURCE_READER_HOST="10.0.0.20"
```

管理员凭据不得提交到代码仓库或填写到前端数据源表单。

```bash
cd /Users/wayne/Documents/Projects/bi_plantform/frontend-macos
node server.mjs
```

浏览器访问：`http://127.0.0.1:5173/`

Vite 版以 macOS 版为只读模板，可通过以下命令单向同步并启动：

```bash
cd /Users/wayne/Documents/Projects/bi_plantform/frontend
npm run dev
```



启动sql

```bash
mysql -h 127.0.0.1 -P 3306 -u root
```
