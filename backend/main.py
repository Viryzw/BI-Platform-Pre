from fastapi import FastAPI
from database import engine, Base, ensure_database_exists
from routers import enterprises, data_sources, metrics, users, knowledge
from routers import query
from routers import agent
from routers import dashboard
from routers import llm_config
from routers import conversations
from routers import reports
from routers import auth, departments, audit_logs
from audit import AuditMiddleware
from sqlalchemy import text
from fastapi.responses import JSONResponse
import uvicorn
from knowledge_base import build_knowledge_base, get_knowledge_base_status
from contextlib import asynccontextmanager
from schema_migrations import run_schema_migrations
from data_source_import import abort_unfinished_data_source_imports

# 首次部署时先创建平台管理库，再创建业务管理表。
database_created = ensure_database_exists()
if database_created:
    print("✅ 已自动创建平台管理数据库")
Base.metadata.create_all(bind=engine)
run_schema_migrations(engine)
aborted_imports = abort_unfinished_data_source_imports()
if aborted_imports:
    print(f"⏹️ 后端重新启动，已中止并回退 {aborted_imports} 个未完成的数据源接入任务")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Chroma indexes metrics, dictionary documents and live business schema.
    # Startup verifies the derived count; a RAG failure must not block admin.
    try:
        status = get_knowledge_base_status()
        if not status["synchronized"]:
            print("🔄 RAG 知识库未同步，正在重建...")
            build_knowledge_base()
        else:
            print(f"✅ RAG 知识库已同步，共 {status['source_count']} 条知识来源")
    except Exception as exc:
        print(f"⚠️ 指标知识库初始化失败，可在管理页面重试：{exc}")
    yield
    # —— 关闭时执行（如有清理逻辑可放在这里）——

# 将 lifespan 参数传入 FastAPI 构造函数
app = FastAPI(
    title="BI Platform Admin API",
    version="0.1.0",
    lifespan=lifespan
)
app.add_middleware(AuditMiddleware)

# 注册路由
app.include_router(enterprises.router)
app.include_router(data_sources.router)
app.include_router(metrics.router)
app.include_router(users.router)
app.include_router(knowledge.router)
app.include_router(query.router)
app.include_router(agent.router)
app.include_router(dashboard.router)
app.include_router(llm_config.router)
app.include_router(conversations.router)
app.include_router(reports.router)
app.include_router(auth.router)
app.include_router(departments.router)
app.include_router(audit_logs.router)

@app.get("/")
def root():
    return {"message": "BI Platform Admin API is running"}


@app.get("/health/live")
def liveness():
    return {"status": "ok"}


@app.get("/__backend_health")
def frontend_health():
    return {"online": True, "status": 200, "target": "fastapi"}


@app.get("/health/ready")
def readiness():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        rag = get_knowledge_base_status()
        return {"status": "ready", "database": "ok", "knowledge_base": rag}
    except Exception as exc:
        return JSONResponse(
            status_code=503,
            content={"status": "degraded", "database": "error", "message": str(exc)},
        )

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
   
