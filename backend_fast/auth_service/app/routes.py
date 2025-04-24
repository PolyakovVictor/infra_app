import os
import schemas
import models

from fastapi import APIRouter, HTTPException, status, Depends
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from services import authenticate_user, create_access_token, get_current_active_user, get_user, get_password_hash, get_user_by_email
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession
from db import get_db


load_dotenv()
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', 60))

router = APIRouter()

# Routes
@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(db: AsyncSession = Depends(get_db), form_data: Annotated[OAuth2PasswordRequestForm, Depends()] = None):
    user = await authenticate_user(db, form_data.username, form_data.password)
    print(f'\n ----------------- \n  test USER : {user}')
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

# First, create a proper registration schema that includes email
# Then update your endpoint
@router.post("/register", response_model=schemas.UserInDB, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: schemas.UserRegistration,
    db: AsyncSession = Depends(get_db)
):
    # Check if username already exists
    existing_user = await get_user(db, user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail='User with provided username already exists'
        )
    
    existing_user_with_email = await get_user_by_email(db, user_data.email)
    if existing_user_with_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail='User with provided email already exists'
        )
    
    
    # Hash the password
    hashed_password = get_password_hash(user_data.password)

    # Create new user
    new_user = models.User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
    )
    
    # Add user to database
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Return user data according to the response_model
    return new_user  # This should match your schemas.UserInDB structure
    

# router.py
@router.get("/users/me/", response_model=schemas.User)
async def read_users_me(
    current_user: Annotated[models.User, Depends(get_current_active_user)]
):
    return current_user

@router.get("/protected-resource/")
async def get_protected_resource(
    current_user: Annotated[models.User, Depends(get_current_active_user)]
):
    return {"message": f"Hello {current_user.username}, this is a protected resource"}
