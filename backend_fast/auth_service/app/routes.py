import os

from fastapi import APIRouter, HTTPException, status, Depends
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from services import authenticate_user, create_access_token, get_current_active_user
from dotenv import load_dotenv
import schemas


load_dotenv()
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', 60))

router = APIRouter()


# Mock user database
fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "johndoe@example.com",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # "secret"
        "disabled": False,
    }
}

# Routes
@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me/", response_model=schemas.User)
async def read_users_me(current_user: Annotated[schemas.User, Depends(get_current_active_user)]):
    return current_user

@router.get("/protected-resource/")
async def get_protected_resource(current_user: Annotated[schemas.User, Depends(get_current_active_user)]):
    return {"message": f"Hello {current_user.username}, this is a protected resource"}