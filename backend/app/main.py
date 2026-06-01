from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.routers.api import router


settings = get_settings()

app = FastAPI(
    title="GatePass FastAPI Backend",
    version="1.0.0",
    description="Organizer-first ticketing, QR scanner, GPS gatepass, reporting, settlement, and audit API.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.app_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/")
def root() -> dict:
    return {"service": "GatePass FastAPI Backend", "docs": "/docs", "health": "/api/health"}
