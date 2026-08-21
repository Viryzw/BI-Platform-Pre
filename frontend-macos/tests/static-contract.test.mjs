import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const appSource = readFileSync(new URL('../assets/app.js', import.meta.url), 'utf8')
const indexSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const serverSource = readFileSync(new URL('../server.mjs', import.meta.url), 'utf8')
const styleSource = readFileSync(new URL('../assets/styles.css', import.meta.url), 'utf8')
const backendContract = readFileSync(new URL('./backend-routes.txt', import.meta.url), 'utf8')

const productContracts = [
  '/api/dashboard/',
  '/api/agent/',
  '/api/admin/metrics/',
  '/api/admin/knowledge/rebuild',
  '/api/admin/knowledge/documents/',
  '/api/admin/data_sources/',
  '/api/admin/users/',
  '/api/llm-config/status',
  '/api/llm-config/',
  '/api/conversations/',
  '/api/reports/'
]

const backendCompatibilityContracts = [...productContracts, '/api/query/']

test('all referenced browser assets are present', () => {
  for (const asset of ['../assets/app.js', '../assets/styles.css', '../assets/vendor/echarts.min.js', '../assets/vendor/exceljs.min.js']) {
    assert.equal(existsSync(new URL(asset, import.meta.url)), true, `${asset} should exist`)
  }
  assert.match(indexSource, /assets\/styles\.css/)
  assert.match(indexSource, /assets\/app\.js/)
  assert.match(indexSource, /assets\/vendor\/echarts\.min\.js/)
  assert.match(indexSource, /assets\/vendor\/exceljs\.min\.js/)
})

test('frontend API paths match the unchanged FastAPI router prefixes', () => {
  for (const frontendPath of productContracts) {
    assert.equal(appSource.includes(frontendPath), true, `${frontendPath} should be used by the frontend`)
    assert.equal(backendContract.includes(frontendPath), true, `${frontendPath} should exist in the verified backend contract`)
  }
  for (const backendPath of backendCompatibilityContracts) {
    assert.equal(backendContract.includes(backendPath), true, `${backendPath} should remain available in the backend`)
  }
})

test('smart analysis uses one API without exposing its internal tool chain', () => {
  assert.equal(appSource.includes("apiRequest('/api/query/'"), false)
  assert.equal(appSource.includes('data-chat-mode'), false)
  assert.match(appSource, /result\.chart_config/)
  assert.doesNotMatch(appSource, /tool_trace|toolTrace|分析链路|pipeline-badge|SQL Agent →/)
  assert.match(appSource, /id="chat-data-source"/)
  assert.match(appSource, /data_source_id: state\.selectedDataSourceId/)
  assert.match(appSource, /已切换到 .*并新建问数会话/)
})

test('smart analysis results can export charts as PNG and complete tables as XLSX', () => {
  assert.match(appSource, /getDataURL\(\{/)
  assert.match(appSource, /type: 'png'/)
  assert.match(appSource, /new window\.ExcelJS\.Workbook\(\)/)
  assert.match(appSource, /workbook\.xlsx\.writeBuffer\(\)/)
  assert.match(appSource, /data-export-chart/)
  assert.match(appSource, /data-export-table/)
})

test('voice input has an explicit start and stop lifecycle', () => {
  assert.match(appSource, /■ 停止录音/)
  assert.match(appSource, /state\.voiceRecognition\.stop\(\)/)
  assert.match(appSource, /recognition\.continuous = true/)
  assert.match(appSource, /语音输入已停止，可编辑后发送/)
  assert.match(appSource, /stopVoiceInput\(\{ sendAfterStop: true \}\)/)
})

test('frontend server proxies API requests to the existing backend', () => {
  assert.match(serverSource, /BACKEND_URL/)
  assert.match(serverSource, /startsWith\('\/api\/'\)/)
  assert.match(serverSource, /proxyRequest\(request, response\)/)
  assert.match(serverSource, /127\.0\.0\.1:8000/)
  assert.match(serverSource, /timeout: 190000/)
  assert.match(serverSource, /'Cache-Control': 'no-store'/)
  assert.doesNotMatch(serverSource, /max-age=3600/)
})

test('metric management can rebuild and inspect the knowledge index', () => {
  assert.match(appSource, /\/api\/admin\/knowledge\/status/)
  assert.match(appSource, /\/api\/admin\/knowledge\/rebuild/)
  assert.match(appSource, /指标已保存并同步到知识库/)
  assert.match(appSource, /数据字典与分析规则/)
  assert.match(appSource, /知识条目已保存并同步到 RAG/)
  assert.match(appSource, /metric-catalog-segmented/)
  assert.match(appSource, /data-metric-catalog-mode="datasource"/)
  assert.match(appSource, /data-metric-catalog-mode="metric"/)
  assert.match(appSource, /metricDefinitionGroups/)
  assert.match(appSource, /data-toggle-metric-group/)
  assert.match(appSource, /data-add-metric-binding/)
  assert.match(appSource, /type: 'data-source-select'/)
  assert.match(appSource, /metric-definition-select/)
  assert.match(appSource, /新增指标绑定/)
  assert.match(appSource, /type: 'topic-select'/)
  assert.match(appSource, /commonTopics = \['未分类', '销售经营', '订单分析', '客户分析', '履约效率'/)
  assert.match(appSource, /existingTopics = state\.records\.metrics/)
  assert.match(appSource, /record\.topic === '通用' \? '未分类'/)
  assert.doesNotMatch(appSource, /metric-config-list/)
  assert.match(appSource, /closeModal\(\)\s+renderManagement\(entity\)/)
  assert.match(appSource, /Promise\.all\(\[loadRecords\('metrics'\), loadKnowledgeStatus\(\)\]\)/)
  assert.doesNotMatch(appSource, /主题是什么？|不是数据库字段，也不参与 SQL 计算/)
  assert.match(appSource, /metric-binding-sql/)
})

test('dictionary and analysis rules are grouped only by expandable data sources', () => {
  assert.match(appSource, /function knowledgeSourceGroups/)
  assert.match(appSource, /data-toggle-knowledge-source/)
  assert.match(appSource, /expandedKnowledgeSourceIds/)
  assert.match(appSource, /按数据源分类；展开后查看/)
  assert.match(appSource, /source:unbound/)
  assert.match(appSource, /未绑定数据源/)
  assert.doesNotMatch(appSource, /<th>数据源<\/th><th>操作<\/th>/)
  assert.match(styleSource, /\.knowledge-source-group/)
  assert.match(styleSource, /\.knowledge-source-toggle/)
  assert.match(styleSource, /\.knowledge-source-detail/)
})

test('each knowledge source expands into four expandable knowledge categories', () => {
  assert.match(appSource, /const knowledgeCategories = \['table', 'field', 'rule', 'question'\]/)
  assert.match(appSource, /function knowledgeCategoryGroup/)
  assert.match(appSource, /data-toggle-knowledge-category/)
  assert.match(appSource, /expandedKnowledgeCategoryKeys/)
  assert.match(appSource, /knowledgeCategories\.map\(\(category\) => knowledgeCategoryGroup\(group, category\)\)/)
  assert.match(appSource, /knowledge-category-table/)
  assert.doesNotMatch(appSource, /knowledge-source-table/)
  assert.match(styleSource, /\.knowledge-category-groups/)
  assert.match(styleSource, /\.knowledge-category-toggle/)
  assert.match(styleSource, /\.knowledge-category-detail/)
})

test('each chat user can configure and hot-update a DeepSeek API key', () => {
  assert.match(appSource, /请配置API/)
  assert.match(appSource, /已配置API/)
  assert.match(appSource, /configured \? '修改' : '配置'/)
  assert.match(appSource, /user_id: state\.currentUserId/)
  assert.doesNotMatch(appSource, /localStorage\.setItem\([^\n]*api[_-]?key/i)
})

test('query plan exposes matched metrics and metric validation', () => {
  assert.match(appSource, /matched_metrics/)
  assert.match(appSource, /metric_validation/)
  assert.match(appSource, /口径校验/)
})

test('dashboard and reports share a synchronized selectable data source', () => {
  assert.match(appSource, /dashboardDataSourceSelectHtml\(\)/)
  assert.match(appSource, /atlas-dashboard-data-source-id/)
  assert.match(appSource, /data_source_id: String\(requestedSourceId\)/)
  assert.match(appSource, /user_id: String\(state\.currentUserId\)/)
  assert.match(appSource, /include_insights: 'false'/)
  assert.match(appSource, /include_insights: 'true'/)
  assert.match(appSource, /\['dashboard', 'reports'\]\.includes\(view\)/)
  assert.match(appSource, /后台错误，当前为样例数据，请及时修复/)
  assert.match(appSource, /前往智能问数模块配置API/)
  assert.match(appSource, /dashboardInsightsHtml\(data\.insights\)/)
  assert.match(appSource, /atlas-dashboard-period/)
  assert.match(appSource, /period: requestedPeriod/)
})

test('dashboard insights are reused until their query context changes', () => {
  assert.match(appSource, /DASHBOARD_CACHE_PREFIX/)
  assert.match(appSource, /window\.sessionStorage\.setItem/)
  assert.match(appSource, /dashboardCacheKey/)
  assert.match(appSource, /sourceId.*period.*dimension/s)
  assert.match(appSource, /state\.dashboardLoading \|\| state\.dashboardInsightsLoading/)
  assert.match(appSource, /loadDashboardContext\(true, true\)/)
  assert.match(appSource, /loadDashboard\(true, true\)/)
  assert.match(appSource, /clearDashboardCache\(\)/)
})

test('new data sources report automatic read-only provisioning results', () => {
  assert.match(appSource, /saved\.provisioning_status === 'granted'/)
  assert.match(appSource, /自动授予只读权限/)
  assert.match(appSource, /连接和只读权限验证通过/)
})

test('SQL file onboarding hides database credentials and exposes durable progress', () => {
  const dataSourceConfig = appSource.slice(appSource.indexOf('datasources: {', appSource.indexOf('const managementConfig')), appSource.indexOf('users: {', appSource.indexOf('const managementConfig')))
  assert.match(dataSourceConfig, /上传 SQL 接入/)
  assert.doesNotMatch(dataSourceConfig, /name: 'username'|name: 'password'/)
  assert.equal(appSource.includes('/api/admin/data_sources/import'), true)
  assert.equal(appSource.includes('/api/admin/data_sources/import-jobs/latest'), true)
  assert.match(appSource, /import-jobs\/\$\{job\.id\}\/cancel/)
  assert.match(appSource, /SQL 文件上传中/)
  assert.match(appSource, /数据源建设/)
  assert.match(appSource, /指标与知识生成/)
  assert.match(appSource, /knowledge_documents_created/)
  assert.match(appSource, /数据字典和分析规则/)
  assert.match(appSource, /数据源接入成功/)
  assert.match(appSource, /dataSourceImportDismissed/)
  assert.match(appSource, /renderDataSourceImportProgressModal/)
  assert.match(appSource, /renderSelectedSqlFile/)
  assert.match(appSource, /parseDataSourceImportFileName/)
  assert.match(appSource, /企业名-数据源名\.sql/)
  assert.doesNotMatch(appSource.slice(appSource.indexOf('function openDataSourceImportModal'), appSource.indexOf('function formatUploadFileSize')), /import-enterprise-id|import-data-source-name/)
  assert.match(appSource, /dataSourceImportUploadController/)
  assert.match(appSource, /cancelLatest: true/)
  assert.match(styleSource, /\.data-source-import-chip/)
  assert.match(styleSource, /\.data-source-import-steps/)
  assert.match(styleSource, /\.sql-upload-dropzone\.selected/)
  assert.match(styleSource, /\.sql-upload-dropzone\.invalid/)
  assert.match(appSource, /activateImportedDataSource/)
  assert.match(appSource, /switchGlobalDataSource\(job\.data_source_id/)
  assert.match(appSource, /数据源序号/)
})

test('empty installations do not show a placeholder enterprise', () => {
  assert.match(appSource, /enterprises: \[\]/)
  assert.match(appSource, /datasources: \[\]/)
  assert.doesNotMatch(appSource, /示例企业/)
  assert.match(indexSource, /未配置企业/)
})

test('data source deletion distinguishes disconnect from destructive removal', () => {
  assert.match(appSource, /仅取消接入/)
  assert.match(appSource, /删除完整数据源/)
  assert.match(appSource, /将删除相关指标/)
  assert.match(appSource, /\?mode=\$\{mode\}/)
  assert.match(appSource, /mode === 'full' \? '确认' : '仅取消接入'/)
  assert.match(styleSource, /\.button\.warning/)
  assert.match(styleSource, /\.button\.danger-solid/)
})

test('enterprise catalog groups multiple data sources and follows the active source', () => {
  assert.match(appSource, /type: 'enterprise-select'/)
  assert.match(appSource, /data-toggle-enterprise/)
  assert.match(appSource, /enterprise-source-grid/)
  assert.match(appSource, /Number\(item\.enterprise_id\) === Number\(record\.id\)/)
  assert.match(appSource, /syncWorkspaceEnterprise\(\)/)
  assert.match(appSource, /selectedEnterpriseName\(\)/)
  assert.match(appSource, /data-select-global-source/)
  assert.match(appSource, /switchGlobalDataSource/)
  assert.match(appSource, /reloadAnalytics: true/)
  assert.match(appSource, /全局数据源已切换为/)
  assert.doesNotMatch(appSource, /平台采用单企业模式|平台唯一企业/)
})

test('department management uses an expandable tree and direct-scope employee task views', () => {
  assert.match(appSource, /renderDepartmentTree/)
  assert.match(appSource, /data-toggle-department/)
  assert.match(appSource, /children\.length\s*\?\s*`<button class="department-tree-toggle"/)
  assert.match(appSource, /data-open-department/)
  assert.match(appSource, /按员工/)
  assert.match(appSource, /按任务/)
  assert.match(appSource, /不包含任何下级部门/)
  assert.match(appSource, /departmentProgress\(task\.progress\)/)
  assert.match(appSource, /employees\.filter\(\(employee\) => Number\(employee\.task_id\) === Number\(task\.id\)\)/)
  assert.match(appSource, /department-parent-select/)
  assert.doesNotMatch(appSource, /<th>上级部门<\/th>/)
  assert.match(styleSource, /\.department-task-board/)
  assert.match(styleSource, /\.department-progress/)
})

test('smart-query history persists conversations and structured artifacts', () => {
  assert.match(appSource, /\/api\/conversations\//)
  assert.match(appSource, /persistConversationMessage/)
  assert.match(appSource, /chart_config: responseMessage\.chartOption/)
  assert.match(indexSource, /data-view="history"/)
})

test('chart details support filtering, type switching and both export formats', () => {
  assert.match(appSource, /renderChartDetail/)
  assert.match(appSource, /chart-detail-dimension-trigger/)
  assert.match(appSource, /日期筛选/)
  assert.match(appSource, /data-row-index/)
  assert.match(appSource, /aria-multiselectable="true"/)
  assert.match(appSource, /handleOutsideDimensionMenu/)
  assert.match(appSource, /state\.chartDetailRowIndexes = nextIndexes/)
  assert.doesNotMatch(appSource, /chart-detail-keyword/)
  assert.match(appSource, /chart-detail-type/)
  assert.match(appSource, /data-chart-detail/)
  assert.match(appSource, /chart-detail-xlsx/)
  assert.match(appSource, /chart-detail-png/)
})

test('report editor saves drafts and exposes immutable version history', () => {
  assert.match(appSource, /\/api\/reports\//)
  assert.match(appSource, /renderReportEditor/)
  assert.match(appSource, /版本历史/)
  assert.match(appSource, /data-restore-report-version/)
  assert.match(appSource, /保存新版本/)
})

test('all planned product views are registered', () => {
  for (const view of ['dashboard', 'chat', 'history', 'chartdetail', 'reports', 'reporteditor', 'metrics', 'datasources', 'users']) {
    assert.equal(appSource.includes(`${view}:`), true, `${view} should be registered`)
  }
})

test('user management navigation is visible to administrators only', () => {
  assert.match(indexSource, /data-view="users" data-admin-only hidden/)
  assert.match(appSource, /state\.currentUser\?\.role === 'admin'/)
  assert.match(appSource, /querySelectorAll\('\[data-admin-only\]'\)/)
  assert.match(appSource, /toggleAttribute\('hidden', !isAdmin\)/)
  const stylesSource = readFileSync(new URL('../assets/styles.css', import.meta.url), 'utf8')
  assert.match(stylesSource, /\.nav-item\[hidden\][^{]*\{[^}]*display:\s*none\s*!important/s)
})
