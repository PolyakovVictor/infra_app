from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import time
import logging
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api_gateway")

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        request_id = request.headers.get("X-Request-ID", "")
        method = request.method
        path = request.url.path
        query_params = dict(request.query_params)
        client_ip = request.client.host
        user_agent = request.headers.get("User-Agent", "")
        
        logger.info(
            f"Request: {method} {path} | ID: {request_id} | IP: {client_ip} | User-Agent: {user_agent}"
        )
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        
        logger.info(
            f"Response: {response.status_code} | Time: {process_time:.4f}s | ID: {request_id}"
        )
        
        response.headers["X-Process-Time"] = str(process_time)
        
        return response