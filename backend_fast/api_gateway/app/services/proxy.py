import httpx
from fastapi import Request, HTTPException
from app.core.config import settings
import logging

logger = logging.getLogger("api_gateway")

async def proxy_request(request: Request, target_url: str, timeout: float = 30.0):
    try:
        headers = dict(request.headers)
        
        if hasattr(request.state, "user_id"):
            headers["X-User-ID"] = str(request.state.user_id)
        if hasattr(request.state, "user_role"):
            headers["X-User-Role"] = request.state.user_role
        
        body = await request.body()
        print(f'\n ------------- \n MY TARGET URL: {target_url}')
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body,
                params=request.query_params,
                timeout=timeout
            )
        
        return response
    
    except httpx.RequestError as exc:
        logger.error(f"Error proxying request to {target_url}: {str(exc)}")
        raise HTTPException(status_code=503, detail=f"Service unavailable: {str(exc)}")
    
    except Exception as exc:
        logger.error(f"Unexpected error: {str(exc)}")
        raise HTTPException(status_code=500, detail="Internal server error")