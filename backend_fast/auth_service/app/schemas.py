from pydantic import BaseModel
from typing import Annotated, Optional


class Token(BaseModel):
    access: str
    refresh: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserCredentials(User):
    password: str