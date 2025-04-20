from datetime import datetime, timedelta
from typing import Annotated, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from routes import router


app = FastAPI()
app.include_router(router)
