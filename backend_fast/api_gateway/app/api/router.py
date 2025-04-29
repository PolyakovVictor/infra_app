from fastapi import APIRouter, Request, Response, HTTPException
from app.services.proxy import proxy_request
from app.core.config import settings

api_router = APIRouter()

@api_router.api_route("/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def auth_service_route(request: Request, path: str):
    response = await proxy_request(request, f"{settings.AUTH_SERVICE_URL}/{path}")
    return Response(
        content=response.content,
        status_code=response.status_code,
        headers=dict(response.headers)
    )

@api_router.api_route("/users/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def user_service_route(request: Request, path: str):
    response = await proxy_request(request, f"{settings.USER_SERVICE_URL}/{path}")
    return Response(
        content=response.content,
        status_code=response.status_code,
        headers=dict(response.headers)
    )

@api_router.api_route("/posts/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def post_service_route(request: Request, path: str):
    response = await proxy_request(request, f"{settings.POST_SERVICE_URL}/{path}")
    return Response(
        content=response.content,
        status_code=response.status_code,
        headers=dict(response.headers)
    )

@api_router.api_route("/notifications/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def notification_service_route(request: Request, path: str):
    response = await proxy_request(request, f"{settings.NOTIFICATION_SERVICE_URL}/{path}")
    return Response(
        content=response.content,
        status_code=response.status_code,
        headers=dict(response.headers)
    )