from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logging import logger
from app.core.database import init_db
from app.services.ml_service import ml_service
from app.routers import predict, history, stats


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("ChurnSight API starting up...")
    init_db()
    ml_service.load()
    logger.info("Ready ✓")
    yield
    # Shutdown
    logger.info("ChurnSight API shutting down.")


app = FastAPI(
    title="ChurnSight API",
    description="Industry-grade customer churn prediction powered by Random Forest",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(stats.router,   prefix="/api")


@app.get("/api/health", tags=["health"])
def health():
    return {
        "status": "ok",
        "model_accuracy": round(ml_service.accuracy, 4),
        "features": len(ml_service.feature_cols),
        "version": "2.0.0",
    }
