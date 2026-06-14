from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.tables import Usuario
from app.schemas.user import UserCreate, UserResponse

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    email_exists = db.query(Usuario).filter(Usuario.email == user_data.email).first()
    if email_exists:
        raise HTTPException(
            status_code=400,
            detail="El correo electrónico ya está registrado en la quiniela."
        )
    
    nuevo_usuario = Usuario(
        nombre=user_data.nombre,
        email=user_data.email,
        password_hash=user_data.password 
    )
    
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    return nuevo_usuario