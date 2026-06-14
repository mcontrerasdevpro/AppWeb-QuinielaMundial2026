from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.database import get_db
from app.models.tables import Usuario, Partido, Equipo, Pronostico
from dateutil import parser  # Importación para procesar fechas de Neon sin fallos

app = FastAPI(
    title="API Quiniela Mundial 2026",
    description="Backend en Python de alta velocidad listo para operar.",
    version="1.0.0"
)

# 🔐 LIBERACIÓN TOTAL DE CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    usuario_id: int
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
def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == user_data.email).first()
    if not usuario:
        raise HTTPException(status_code=400, detail="El correo electrónico no está registrado.")
    
    if usuario.password_hash != user_data.password:
        raise HTTPException(status_code=400, detail="La contraseña ingresada es incorrecta.")
    
    return {
        "status": "success", 
        "mensaje": "¡Acceso concedido!", 
        "id": usuario.id,
        "usuario": usuario.nombre
    }

# ==========================================
# 3. ENDPOINT DE REGISTRO
# ==========================================
# Dejamos SOLAMENTE este decorador para que calce con React
@app.post("/auth/register", status_code=201)
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
    return {
        "status": "success", 
        "usuario": nuevo_usuario.nombre,
        "id": nuevo_usuario.id
    }

# 4. ENDPOINT DE FIXTURE DE PARTIDOS CORREGIDO PARA EL STRING DE NEON
@app.get("/matches")
@app.get("/api/matches")
@app.get("/match")
@app.get("/api/match")
def get_matches(usuario_id: int = 1, db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT p.id, el.grupo, p.fecha_hora, el.nombre as local, el.bandera_url as banderaL,
                   ev.nombre as visitante, ev.bandera_url as banderaV
            FROM partidos p
            JOIN equipos el ON p.equipo_local_id = el.id
            JOIN equipos ev ON p.equipo_visitante_id = ev.id
            WHERE p.estado = 'programado'
        """)
        result = db.execute(query).mappings().all()
        
        apuestas_usuario = db.query(Pronostico).filter(Pronostico.usuario_id == usuario_id).all()
        apuestas_map = {a.partido_id: (a.goles_local_pronostico, a.goles_visitante_pronostico) for a in apuestas_usuario}

        if result:
            fixture = []
            meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]
            for row in result:
                f_raw = row["fecha_hora"]
                f_obj = parser.parse(f_raw) if isinstance(f_raw, str) else f_raw
                fecha = f"{f_obj.day} {meses[f_obj.month - 1]} - {f_obj.strftime('%H:%M')}"
                
                # REGLA CLAVE: Si ya existía una apuesta previa en Neon, la pintamos; si no, por defecto ponemos 0
                partido_id = row["id"]
                gL, gV = apuestas_map.get(partido_id, (0, 0))

                fixture.append({
                    "id": partido_id, "grupo": row["grupo"], "fecha": fecha,
                    "local": row["local"], "banderaL": row["banderaL"],
                    "visitante": row["visitante"], "banderaV": row["banderaV"],
                    "golesL": gL,  # <-- Inyectamos sus goles reales guardados
                    "golesV": gV   # <-- Inyectamos sus goles reales guardados
                })
            return fixture
            
    except Exception as e:
        print(f"⚠️ Alerta de sincronización en Neon: {e}")
        
    return [
        {"id": 1, "grupo": "A", "fecha": "15 JUN - 18:00", "local": "México", "banderaL": "🇲🇽", "visitante": "EE. UU.", "banderaV": "🇺🇸", "golesL": 0, "golesV": 0},
        {"id": 2, "grupo": "A", "fecha": "15 JUN - 21:00", "local": "Canadá", "banderaL": "🇨🇦", "visitante": "Argentina", "banderaV": "🇦🇷", "golesL": 0, "golesV": 0},
        {"id": 3, "grupo": "B", "fecha": "16 JUN - 15:00", "local": "España", "banderaL": "🇪🇸", "visitante": "Alemania", "banderaV": "🇩🇪", "golesL": 0, "golesV": 0}
    ]

# 5. ENDPOINT DE GUARDADO DE PRONÓSTICOS
@app.post("/predictions", status_code=201)
@app.post("/api/predictions", status_code=201)
def save_prediction(data: PredictionCreate, db: Session = Depends(get_db)):
    try:
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
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en Neon: {str(e)}")

# 5.2 ENDPOINT DE LECTURA DE PRONÓSTICOS
@app.get("/predictions/{usuario_id}")
@app.get("/api/predictions/{usuario_id}")
def get_user_predictions(usuario_id: int, db: Session = Depends(get_db)):
    try:
        apuestas_db = db.query(Pronostico).filter(Pronostico.usuario_id == usuario_id).all()
        return {
            a.partido_id: {
                "golesL": a.goles_local_pronostico, 
                "golesV": a.goles_visitante_pronostico
            } 
            for a in apuestas_db
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al leer de Neon: {str(e)}")

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