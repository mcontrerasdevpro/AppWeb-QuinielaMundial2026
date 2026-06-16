from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    nombre: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    puntos_totales: int

    class Config:
        from_attributes = True

from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    nombre: str
    email: EmailStr
    password: str