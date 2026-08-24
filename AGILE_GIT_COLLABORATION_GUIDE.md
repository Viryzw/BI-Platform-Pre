# Atlas BI 敏捷协作与 Git 提交指南

## 1. 协作目标

项目采用 4 个迭代、5 名成员、每人 4 次功能提交的方式重新组织代码，共计 20 个 Conventional Commits。

协作时应遵守以下原则：

- 使用短生命周期功能分支。
- 每个分支只解决一个明确问题。
- 每项任务对应一个提交、一次推送和一个 Pull Request。
- 所有代码通过 PR 审查后进入 `develop`。
- 管理员使用 Rebase Merge，避免产生无意义的合并提交。
- `main` 只保存经过完整验证的发布版本。
- 每个文件只分配给一名成员的一次提交，成员只需按完整路径暂存文件。
- 每名成员应实际检查、测试并对自己提交的代码负责，不能仅修改提交作者信息。

## 2. 提交前必须处理的问题

### 2.1 清理敏感信息

当前 `README.md` 存在未提交修改，并包含服务器地址和明文登录信息。新仓库不得原样提交这些内容。

提交前必须：

- 将服务器地址替换为 `YOUR_SERVER_HOST` 等占位符。
- 删除所有真实用户名、密码和 API Key。
- 立即更换已经暴露过的密码。
- 使用环境变量保存 `DATABASE_URL`、`AUTH_SECRET` 和 `ATLAS_SECRET_KEY`。
- 不得提交 `.env`、私钥、证书和本地数据库文件。

### 2.2 不应进入仓库的文件

以下内容不应复制到新仓库：

- `.git/`
- `.env`、`.env.*`
- `.DS_Store`
- `__pycache__/`
- `node_modules/`
- `frontend/dist/`
- `backend/chroma_db/`
- `backend/chroma_db.broken-*/`
- `backend/models/` 本地嵌入模型目录
- 日志、临时上传文件和运行时数据库

注意：应提交 Python 文件 `backend/models.py`，但不要提交本地模型目录 `backend/models/`。

## 3. 人员与提交分配

本方案采用文件级独占责任制：每个文件只出现在一名成员的一次提交中，不需要拆分代码块，也不使用交互式暂存。

对于 `backend/crud.py`、`frontend/public/assets/app.js` 等大文件，由指定负责人一次性提交完整文件。其他成员不得在自己的提交中重复添加这些文件。

### 3.1 人员 A：管理员 / 技术负责人

负责仓库管理、认证安全、应用入口、最终集成和 PR 合并。

| 次数 | 分支 | Commit message | 文件路径 |
| --- | --- | --- | --- |
| A1 | `chore/project-bootstrap` | `chore(repo): initialize project tooling and dependency manifests` | `.gitignore`、`requirements.txt`、`frontend/.gitignore`、`frontend/package.json`、`frontend/package-lock.json`、`frontend/vite.config.js` |
| A2 | `feat/security-controls` | `feat(security): add authentication encryption and audit controls` | `backend/security.py`、`backend/secret_store.py`、`backend/audit.py`、`backend/routers/auth.py`、`backend/routers/audit_logs.py` |
| A3 | `feat/application-bootstrap` | `feat(core): bootstrap database and application lifecycle` | `backend/database.py`、`backend/main.py`、`backend/routers/_init_.py` |
| A4 | `docs/release-guide` | `docs(release): finalize deployment and collaboration guides` | `README.md`、`frontend/README.md`、`AGILE_GIT_COLLABORATION_GUIDE.md` |

A4 必须同时完成：

- 使用占位符替换地址、密码、账号和密钥。
- 补充 Windows、macOS 和 Linux 部署说明。

### 3.2 人员 B：数据平台与后台管理

| 次数 | 分支 | Commit message | 文件路径 |
| --- | --- | --- | --- |
| B1 | `feat/domain-models` | `feat(data): define platform domain models and migrations` | `backend/models.py`、`backend/schemas.py`、`backend/schema_migrations.py` |
| B2 | `feat/persistence-services` | `feat(data): implement persistence and enterprise rules` | `backend/crud.py`、`backend/single_enterprise.py` |
| B3 | `feat/datasource-services` | `feat(datasource): add provisioning and SQL onboarding services` | `backend/data_source_provisioning.py`、`backend/enterprise_catalog.py`、`backend/data_source_import.py` |
| B4 | `feat/admin-apis` | `feat(admin): expose data source and organization management APIs` | `backend/routers/data_sources.py`、`backend/routers/enterprises.py`、`backend/routers/departments.py`、`backend/routers/users.py` |

### 3.3 人员 C：AI、RAG 与分析 Agent

| 次数 | 分支 | Commit message | 文件路径 |
| --- | --- | --- | --- |
| C1 | `feat/metric-rag` | `feat(rag): index metrics schemas and analysis knowledge` | `backend/knowledge_base.py`、`backend/routers/knowledge.py`、`backend/routers/metrics.py` |
| C2 | `feat/user-llm-config` | `feat(llm): add per-user DeepSeek configuration` | `backend/llm_config.py`、`backend/routers/llm_config.py` |
| C3 | `feat/text-to-sql` | `feat(query): implement RAG-guided text-to-SQL planning` | `backend/sql_agent.py`、`backend/query_engine.py`、`backend/routers/query.py` |
| C4 | `feat/analysis-agent` | `feat(agent): orchestrate analytics dashboard and reporting tools` | `backend/agent_tools.py`、`backend/routers/agent.py`、`backend/routers/dashboard.py`、`backend/routers/conversations.py`、`backend/routers/reports.py` |

### 3.4 人员 D：BI 前端

生产界面的 `frontend/public/assets/app.js`、`client-id.js` 和 `styles.css` 统一归 D2，一次性按完整文件提交。其余三次提交使用互不重叠的文件集合。

| 次数 | 分支 | Commit message | 文件路径 |
| --- | --- | --- | --- |
| D1 | `feat/frontend-shell` | `feat(ui): create the application shell and design system` | `frontend/index.html`、`frontend/public/favicon.svg`、`frontend/public/icons.svg`、`frontend/public/assets/vendor/*`、`frontend/src/main.js`、`frontend/src/App.vue`、`frontend/src/router/index.js`、`frontend/src/layouts/*`、`frontend/src/components/*`、`frontend/src/assets/*`、`frontend/src/style.css`、`frontend/src/api/index.js` |
| D2 | `feat/integrated-bi-ui` | `feat(ui): implement the integrated BI workspace` | `frontend/public/assets/app.js`、`frontend/public/assets/client-id.js`、`frontend/public/assets/styles.css` |
| D3 | `feat/analytics-views` | `feat(analytics-ui): add modular dashboard and chat views` | `frontend/src/views/Dashboard.vue`、`frontend/src/views/Chat.vue` |
| D4 | `feat/governance-views` | `feat(frontend): add governance views and export utilities` | `frontend/src/views/Admin/DataSources.vue`、`frontend/src/views/Admin/Metrics.vue`、`frontend/src/views/Admin/Users.vue`、`frontend/src/utils/exportArtifacts.js` |

### 3.5 人员 E：测试、数据样例与质量保障

| 次数 | 分支 | Commit message | 文件路径 |
| --- | --- | --- | --- |
| E1 | `test/manufacturing-fixture` | `test(fixtures): add manufacturing operations dataset` | `sql/星辰智造-运营数据.sql` |
| E2 | `test/agriculture-fixture` | `test(fixtures): add agriculture operations dataset` | `sql/慧农新境-Agrinova.sql` |
| E3 | `test/backend-workflows` | `test(backend): cover authentication and agent workflows` | `backend/tests/test_auth_registration.py`、`backend/tests/test_agent_pipeline.py`、`backend/test_agent.py`、`backend/test_knowledge.py` |
| E4 | `test/system-regression` | `test(system): add reliability and frontend regression coverage` | `backend/tests/test_platform_reliability.py`、`frontend/tests/client-id.test.mjs`、`frontend/tests/data-source-import.test.mjs`、`frontend/tests/export-artifacts.test.mjs`、`frontend/tests/metric-dashboard-toggle.test.mjs`、`frontend/tests/voice-control.test.mjs` |

## 4. 四个迭代的合并顺序

每个迭代每名成员完成一次完整文件提交和一次推送。下列任务之间不存在文件交叉，可以直接使用普通 `git add 文件路径`。

1. 迭代一：A1 → B1 → C1 → D1 → E1
2. 迭代二：A2 → B2 → C2 → D2 → E2
3. 迭代三：B3 → C3 → D3 → E3 → A4
4. 迭代四：B4 → C4 → A3 → D4 → E4

每个箭头表示管理员确认前一个 PR 合并并通过测试后，再合并下一个 PR。

## 5. 新仓库初始化

管理员应先在 GitHub 或 GitLab 创建一个空仓库，不要自动生成 README、`.gitignore` 或 License。

```bash
mkdir atlas-bi-platform
cd atlas-bi-platform

git init -b main
git config user.name "Administrator Name"
git config user.email "administrator@example.com"

git remote add origin git@github.com:YOUR_ORG/atlas-bi-platform.git
```

### 5.1 创建本地代码来源副本

下面的目录只作为本地代码来源，不能整个提交：

```bash
rsync -av \
  --exclude='.git' \
  --exclude='.env*' \
  --exclude='.DS_Store' \
  --exclude='__pycache__' \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='backend/chroma_db' \
  --exclude='backend/chroma_db.broken-*' \
  --exclude='backend/models' \
  /Users/wayne/Documents/Projects/bi_plantform/ \
  ./source-package/
```

各成员只从 `source-package/` 复制自己负责的路径。

### 5.2 管理员完成第一次提交

```bash
git add .gitignore requirements.txt
git add frontend/.gitignore frontend/package.json
git add frontend/package-lock.json frontend/vite.config.js

git diff --cached --check
git commit -m "chore(repo): initialize project tooling and dependency manifests"
git push -u origin main
```

建立集成分支：

```bash
git switch -c develop
git push -u origin develop
```

创建 `main` 和 `develop` 的保护规则：

- 禁止直接推送。
- 必须通过 Pull Request。
- 至少需要一名成员审核。
- 必须通过自动测试。
- 禁止 force push。
- 建议启用线性提交历史。

## 6. 成员创建分支并提交

下面以人员 B 的 B1 为例。

### 6.1 克隆仓库并配置身份

```bash
git clone git@github.com:YOUR_ORG/atlas-bi-platform.git
cd atlas-bi-platform

git config user.name "github名"
git config user.email "随意一个自己的邮箱"
```

### 6.2 从最新 develop 创建功能分支

```bash
git switch develop
git pull --ff-only origin develop
git switch -c feat/domain-models
```

每次新建分支前都必须更新 `develop`，不能从旧功能分支继续创建新分支。

### 6.3 暂存并提交文件

```bash
git add backend/models.py
git add backend/schemas.py
git add backend/schema_migrations.py

git status
git diff --cached --stat
git diff --cached --check

git commit -m "feat(data): define platform domain models and migrations"
git push -u origin feat/domain-models
```

### 6.4 创建 Pull Request

```bash
gh pr create \
  --base develop \
  --head feat/domain-models \
  --title "feat(data): define platform domain models and migrations" \
  --body "Adds domain models, API schemas, and database migrations."
```

如果没有安装 GitHub CLI，也可以在 GitHub 网页中创建 Pull Request。

## 7. 按完整文件提交

每个文件已经分配给唯一负责人，不需要拆分代码块。仍然不建议使用下面的命令：

```bash
git add .
```

应根据分工表明确添加完整文件。例如 B2：

```bash
git add backend/crud.py backend/single_enterprise.py
```

例如 D2：

```bash
git add frontend/public/assets/app.js
git add frontend/public/assets/client-id.js
git add frontend/public/assets/styles.css
```

包含中文文件名时使用引号：

```bash
git add -- "sql/星辰智造-运营数据.sql"
```

暂存后核对文件列表，确认所有文件都属于分工表中的同一次任务：

```bash
git diff --cached --name-only
git diff --cached --stat
git diff --cached --check
```

如果出现不属于当前任务的文件，取消暂存：

```bash
git restore --staged PATH_TO_UNRELATED_FILE
```

提交后再次检查：

```bash
git show --stat --oneline HEAD
git show --name-only --format='' HEAD
```

## 8. 管理员审核与合并

管理员检查 PR：

```bash
gh pr list --base develop
gh pr checks PR_NUMBER
gh pr diff PR_NUMBER
```

建议使用 Rebase Merge，保留线性历史和 20 个功能提交：

```bash
gh pr merge PR_NUMBER --rebase --delete-branch
```

不建议使用普通 Merge Commit，因为它会额外产生大量 `Merge pull request` 提交。

管理员自己的 PR 应由另一名成员审核，再由管理员或另一名维护者合并。管理员执行的远程合并属于管理操作，不计入个人的 4 次功能推送。

## 9. 合并完成后清理本地分支

```bash
git switch develop
git pull --ff-only origin develop
git branch -d feat/domain-models
```

如果远程分支未由 PR 自动删除：

```bash
git push origin --delete feat/domain-models
```

## 10. 解决合并冲突

功能分支出现冲突时：

```bash
git switch feat/your-branch
git fetch origin
git rebase origin/develop
```

手工修改冲突文件，然后执行：

```bash
git add PATH_TO_RESOLVED_FILE
git rebase --continue
git push --force-with-lease
```

只能对自己的功能分支使用 `--force-with-lease`，绝对不能对 `main` 或 `develop` 强制推送。

如果需要放弃本次 rebase：

```bash
git rebase --abort
```

## 11. 常见撤销操作

取消暂存，但保留文件修改：

```bash
git restore --staged PATH_TO_FILE
```

修改尚未推送的最后一次提交：

```bash
git add PATH_TO_FILE
git commit --amend
```

撤销已经进入公共分支的提交，应使用：

```bash
git revert COMMIT_SHA
```

公共分支不要使用 `git reset --hard` 改写历史。

## 12. 测试命令

### 12.1 后端测试

```bash
cd backend
conda run -n BI python -m unittest discover -s tests -p "test_*.py"
```

### 12.2 前端测试与构建

```bash
cd frontend
npm ci
npm test
npm run build
```

### 12.3 提交内容检查

```bash
git diff --cached --check
git status --short
```

检查是否意外提交敏感信息：

```bash
git grep --cached -n -E \
  '(sk-[A-Za-z0-9]|DATABASE_URL=.*://[^:]+:[^@]+@|AUTH_SECRET=.+|ATLAS_SECRET_KEY=.+)'
```

如果命令匹配到真实凭据，应立即取消暂存、删除凭据并更换已经暴露的密钥。

## 13. Pull Request 检查清单

每个 PR 至少确认：

- Commit message 符合 Conventional Commits。
- 只包含本任务负责的文件和代码块。
- 没有 `.env`、密码、API Key、缓存和构建产物。
- 后端测试通过。
- 前端测试和生产构建通过。
- 新接口有错误处理和权限校验。
- 数据库变更包含迁移逻辑。
- UI 修改包含加载、空状态和失败状态。
- PR 描述说明完成内容、验证方式和潜在影响。

## 14. 发布到 main

全部 20 个 PR 合并到 `develop` 并通过完整测试后，创建发布 PR：

```bash
gh pr create \
  --base main \
  --head develop \
  --title "release: Atlas BI v1.0.0" \
  --body "Initial production release of the Atlas BI platform."
```

合并并更新本地 `main`：

```bash
git switch main
git pull --ff-only origin main
```

创建发布标签：

```bash
git tag -a v1.0.0 -m "release: Atlas BI v1.0.0"
git push origin v1.0.0
```

最终仓库应保留 20 个清晰、可审查的成员功能提交。发布 PR 应采用 Rebase Merge 或 Fast-forward，避免额外制造无意义的合并提交。
