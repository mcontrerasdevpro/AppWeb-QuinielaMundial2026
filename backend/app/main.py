from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.database import get_db
from app.models.tables import Usuario, Partido, Equipo, Pronostico

app = FastAPI(
    title="API Quiniela Mundial 2026",
    description="Backend en Python de alta velocidad listo para operar.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite de forma absoluta cualquier puerto virtual de la nube
    allow_credentials=True,
    allow_methods=["*"],  # Permite GET, POST, OPTIONS, etc. sin restricciones
    allow_headers=["*"],  # Permite todas las cabeceras de Axios
)

# Esquemas de Validación (Pydantic)
class UserCreate(BaseModel):
    nombre: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class PredictionCreate(BaseModel):
    usuario_id: int = 1  
    partido_id: int
    goles_local_pronostico: int
    goles_visitante_pronostico: int

# Gestor de WebSockets (Tiempo Real)
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

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

# 4. ENDPOINT DE FIXTURE DE PARTIDOS DINÁMICO (Conectado Real a Neon)
@app.get("/matches")
@app.get("/api/matches") 
def get_matches(db: Session = Depends(get_db)):
    # Buscamos los partidos guardados en Neon
    partidos_db = db.query(Partido).filter(Partido.estado == "programado").all()
    
    fixture_limpio = []
    meses_es = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]
    
    for p in partidos_db:
        fecha_obj = p.fecha_hora
        fecha_formateada = f"{fecha_obj.day} {meses_es[fecha_obj.month - 1]} - {fecha_obj.strftime('%H:%M')}"

        fixture_limpio.append({
            "id": p.id,
            "grupo": p.equipo_local.grupo,
            "fecha": fecha_formateada,
            "local": p.equipo_local.nombre,
            "banderaL": p.equipo_local.bandera_url, 
            "visitante": p.equipo_visitante.nombre,
            "banderaV": p.equipo_visitante.bandera_url
        })
        
    return fixture_limpio

# 5. ENDPOINT DE GUARDADO DE PRONÓSTICOS
@app.post("/predictions", status_code=201)
@app.post("/api/predictions", status_code=201)
def save_prediction(data: PredictionCreate, db: Session = Depends(get_db)):
    apuesta = db.query(Pronostico).filter(
        Pronostico.usuario_id == data.usuario_id,
        Pronostico.partido_id == data.partido_id
    ).first()

    if apuesta:
        apuesta.goles_local_pronostico = data.goles_local_pronostico
        apuesta.goles_visitante_pronostico = data.goles_visitante_pronostico
        db.commit()
        return {"status": "success", "mensaje": "⚽ ¡Pronóstico actualizado en Neon!"}
    
    nueva_apuesta = Pronostico(
        usuario_id=data.usuario_id,
        partido_id=data.partido_id,
        goles_local_pronostico=data.goles_local_pronostico,
        goles_visitante_pronostico=data.goles_visitante_pronostico
    )
    db.add(nueva_apuesta)
    db.commit()
    return {"status": "success", "mensaje": "🚀 ¡Pronóstico guardado con éxito en Neon!"}

# 6. CANAL WEBSOCKET (TIEMPO REAL)
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