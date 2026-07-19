"""
Bangladesh Financial Companion API
FastAPI application entry point.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.core.logging import setup_logging
from app.routers import health, products, calculator, locations, checklists, assistant, events, voice, cashbook, whatsapp, scenarios, leads, enterprise
from prometheus_fastapi_instrumentator import Instrumentator


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    setup_logging()
    try:
        await init_db()
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(
            f"Database connection failed ({e}). Starting API server without active DB connection."
        )
    yield


app = FastAPI(
    title="Bangladesh Financial Companion API",
    description="Privacy-first financial information and comparison API for Bangladesh",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type", "Accept", "Accept-Language", "X-API-Key"],
)

# ─── Prometheus metrics ────────────────────────────────────────────────────────
Instrumentator().instrument(app).expose(app, endpoint="/api/metrics")

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(products.router, prefix="/api", tags=["products"])
app.include_router(calculator.router, prefix="/api", tags=["calculator"])
app.include_router(locations.router, prefix="/api", tags=["locations"])
app.include_router(checklists.router, prefix="/api", tags=["checklists"])
app.include_router(assistant.router, prefix="/api", tags=["assistant"])
app.include_router(events.router, prefix="/api", tags=["events"])
app.include_router(voice.router, prefix="/api", tags=["voice"])
app.include_router(cashbook.router, prefix="/api", tags=["cashbook"])
app.include_router(whatsapp.router, prefix="/api", tags=["whatsapp"])
app.include_router(scenarios.router, prefix="/api", tags=["scenarios"])
app.include_router(leads.router, prefix="/api", tags=["leads"])
app.include_router(enterprise.router, prefix="/api", tags=["enterprise"])
