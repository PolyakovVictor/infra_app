from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.middleware.logging import LoggingMiddleware
from app.middleware.auth import AuthenticationMiddleware
# from app.middleware.rate_limiter import RateLimitMiddleware

app = FastAPI(
    title="Social Network API Gateway",
    description="API Gateway for Social Network microservices",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(LoggingMiddleware)
# app.add_middleware(RateLimitMiddleware)
app.add_middleware(AuthenticationMiddleware)

app.include_router(api_router)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

#qwe