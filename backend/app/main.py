from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import get_db
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.tables import Usuario
from pydantic import BaseModel, EmailStr
from fastapi import WebSocket, WebSocketDisconnect
from typing import List

app = FastAPI(
    title="API Quiniela Mundial 2026",
    description="Backend en Python de alta velocidad listo para operar.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserCreate(BaseModel):
    nombre: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

# 1. ENDPOINT RAIZ
@app.get("/")
def read_root():
    return {
        "status": "online",
        "proyecto": "Quiniela Mundial 2026",
        "mensaje": "¡Servidor FastAPI encendido con éxito absoluto! ⚽🔥"
    }

# 2. ENDPOINT DE INICIO DE SESIÓN (SIGN IN)
@app.post("/auth/login")
@app.post("/api/auth/login")
def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == user_data.email).first()
    if not usuario:
        raise HTTPException(status_code=400, detail="El correo electrónico no está registrado.")
    
    if usuario.password_hash != user_data.password:
        raise HTTPException(status_code=400, detail="La contraseña ingresada es incorrecta.")
    
    return {
        "status": "success", 
        "mensaje": "¡Acceso concedido!", 
        "usuario": usuario.nombre
    }

# 3. ENDPOINT DE REGISTRO
@app.post("/auth/register", status_code=201)
@app.post("/api/auth/register", status_code=201)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    email_exists = db.query(Usuario).filter(Usuario.email == user_data.email).first()
    if email_exists:
        raise HTTPException(status_code=400, detail="El correo ya existe.")
    
    nuevo_usuario = Usuario(
        nombre=user_data.nombre,
        email=user_data.email,
        password_hash=user_data.password 
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return {"status": "success", "usuario": nuevo_usuario.nombre}

# 4. ENDPOINT DE FIXTURE DE PARTIDOS
@app.get("/matches")
@app.get("/api/matches") 
def get_matches():
    return [
        {
            "id": 1,
            "grupo": "A",
            "fecha": "15 JUN - 18:00",
            "local": "México",
            "banderaL": "🇲🇽",
            "visitante": "EE. UU.",
            "banderaV": "🇺🇸"
        },
        {
            "id": 2,
            "grupo": "A",
            "fecha": "15 JUN - 21:00",
            "local": "Canadá",
            "banderaL": "🇨🇦",
            "visitante": "Argentina",
            "banderaV": "🇦🇷"
        },
        {
            "id": 3,
            "grupo": "B",
            "fecha": "16 JUN - 15:00",
            "local": "España",
            "banderaL": "🇪🇸",
            "visitante": "Alemania",
            "banderaV": "🇩🇪"
        }
    ]

class PredictionCreate(BaseModel):
    usuario_id: int = 1  
    partido_id: int
    goles_local_pronostico: int
    goles_visitante_pronostico: int

@app.post("/predictions", status_code=201)
@app.post("/api/predictions", status_code=201)
def save_prediction(data: PredictionCreate, db: Session = Depends(get_db)):
    from app.models.tables import Pronostico
    
    apuesta = db.query(Pronostico).filter(
        Pronostico.usuario_id == data.usuario_id,
        Pronostico.partido_id == data.partido_id
    ).first()

    if apuesta:
        apuesta.goles_local_pronostico = data.goles_local_pronostico
        apuesta.goles_visitante_pronostico = data.goles_visitante_pronostico
        db.commit()
        return {"status": "success", "mensaje": "⚽ ¡Pronóstico actualizado en pgAdmin!"}
    
    nueva_apuesta = Pronostico(
        usuario_id=data.usuario_id,
        partido_id=data.partido_id,
        goles_local_pronostico=data.goles_local_pronostico,
        goles_visitante_pronostico=data.goles_visitante_pronostico
    )
    db.add(nueva_apuesta)
    db.commit()
    return {"status": "success", "mensaje": "🚀 ¡Pronóstico guardado con éxito en pgAdmin!"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)