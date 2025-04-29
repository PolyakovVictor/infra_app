from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from jose import JWTError, jwt
from app.core.config import settings
import re


class AuthenticationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        
        for public_path in settings.PUBLIC_PATHS:
            if re.match(f"^{public_path}", path):
                return await call_next(request)
        
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Authentication required"},
            )
        
        token = auth_header.split(" ")[1]
        
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            request.state.user_id = payload.get("sub")
            request.state.user_role = payload.get("role", "user")
            
        except JWTError as e:
            error_detail = "Invalid token"
            if isinstance(e, jwt.ExpiredSignatureError):
                error_detail = "Token expired"
                
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": error_detail},
            )
        
        return await call_next(request)
