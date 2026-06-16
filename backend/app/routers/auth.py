import os
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.tables import Usuario
from app.schemas.user import UserCreate, UserResponse

router = APIRouter()

mail_config = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=465,             
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=False,      
    MAIL_SSL_TLS=True,         
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

def enviar_email_confirmacion(email: str, usuario: str):
    html_content = f"""
    <html>
        <body style="font-family: sans-serif; background-color: #06140d; margin: 0; padding: 40px; color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #111a14; border: 1px solid #198754; border-radius: 15px; padding: 30px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                <div style="font-size: 50px; margin-bottom: 10px;">🏆</div>
                <h1 style="color: #28a745; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">
                    ¡Bienvenido a la Quiniela!
                </h1>
                <p style="font-size: 18px; color: #e2e8f0; line-height: 1.6;">
                    ¡Hola, <strong style="color: #28a745;">{usuario}</strong>! Tu cuenta ha sido registrada con éxito en nuestra plataforma oficial para el **Mundial 2026**.
                </p>
                <div style="margin: 30px 0; padding: 15px; background-color: #0b0f0d; border-left: 4px solid #28a745; border-radius: 4px; text-align: left;">
                    <p style="margin: 0; font-size: 14px; color: #a0aec0;">📍 <strong>Usuario de acceso:</strong></p>
                    <p style="margin: 5px 0 0 0; font-size: 15px;">{email}</p>
                </div>
                <p style="font-size: 15px; color: #a0aec0; margin-bottom: 30px; line-height: 1.5;">
                    Ya puedes ingresar al estadio virtual, guardar tus pronósticos en tiempo real y competir contra todos tus amigos.
                </p>
                <div style="background-color: #198754; color: #000000; font-weight: bold; text-transform: uppercase; padding: 12px 35px; border-radius: 8px; display: inline-block;">
                    ⚽ ¡A jugar!
                </div>
                <footer style="margin-top: 40px; font-size: 11px; color: #4a5568; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
                    Q-MUNDIAL APP • Entrada Oficial de Participantes 2026.
                </footer>
            </div>
        </body>
    </html>
    """

    message = MessageSchema(
        subject="🏆 Confirmación de Registro - Quiniela Mundial 2026",
        recipients=[email],
        body=html_content,
        subtype=MessageType.html
    )

    fm = FastMail(mail_config)
    fm.send_message(message)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: UserCreate, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
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
    background_tasks.add_task(enviar_email_confirmacion, nuevo_usuario.email, nuevo_usuario.nombre)
    
    return nuevo_usuario