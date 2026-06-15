from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.database import get_db
from app.models.tables import Usuario, Partido, Equipo, Pronostico
from dateutil import parser
import datetime 

app = FastAPI(
    title="API Quiniela Mundial 2026",
    description="Backend en Python de alta velocidad listo para operar.",
    version="1.0.0"
)

from app.database import engine
from app.models.tables import Base

try:
    Base.metadata.create_all(bind=engine)
    print("✨ ¡Tablas estructurales verificadas/creadas con éxito en Neon! 🏛️")
except Exception as e:
    print(f"⚠️ Nota en creación de tablas: {e}")

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

class PredictionCreate(BaseModel):
    usuario_id: int
    partido_id: int
    goles_local_pronostico: int
    goles_visitante_pronostico: int

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
        "id": usuario.id,
        "usuario": usuario.nombre
    }

# 3. ENDPOINT DE REGISTRO
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

# 4. ENDPOINT DE FIXTURE DE PARTIDOS (CORREGIDO PARA PRODUCCIÓN)
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
            ORDER BY p.fecha_hora ASC
        """)
        result = db.execute(query).mappings().all()
        
        apuestas_usuario = db.query(Pronostico).filter(Pronostico.usuario_id == usuario_id).all()
        apuestas_map = {a.partido_id: (a.goles_local_pronostico, a.goles_visitante_pronostico) for a in apuestas_usuario}

        fixture_completo = []
        
        if result:
            for row in result:
                f_raw = row["fecha_hora"]
                f_obj = parser.parse(f_raw) if isinstance(f_raw, str) else f_raw
                
                fecha_iso = f_obj.isoformat()
                partido_id = row["id"]
                gL, gV = apuestas_map.get(partido_id, (0, 0))

                fixture_completo.append({
                    "id": partido_id, 
                    "grupo": row["grupo"], 
                    "fecha_hora": fecha_iso,
                    "local": row["local"], 
                    "banderaL": row["banderaL"],
                    "visitante": row["visitante"], 
                    "banderaV": row["banderaV"],
                    "golesL": gL, 
                    "golesV": gV
                })
            return fixture_completo
            
    except Exception as e:
        print(f"⚠️ Alerta de sincronización en Neon: {e}")
        
    return []

# 4.2 ENDPOINT DE PARTIDOS TERMINADOS (NEON)
@app.get("/matches/finished")
@app.get("/api/matches/finished")
def get_finished_matches(db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT p.id, el.grupo, p.fecha_hora, 
                   el.nombre as local, el.bandera_url as banderaL, p.goles_local,
                   ev.nombre as visitante, ev.bandera_url as banderaV, p.goles_visitante
            FROM partidos p
            JOIN equipos el ON p.equipo_local_id = el.id
            JOIN equipos ev ON p.equipo_visitante_id = ev.id
            WHERE p.estado = 'finalizado'
            ORDER BY p.fecha_hora DESC
        """)
        result = db.execute(query).mappings().all()
        
        fixture_terminado = []
        meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]
        
        if result:
            for row in result:
                f_raw = row.get("fecha_hora") or datetime.datetime.now()
                f_obj = parser.parse(f_raw) if isinstance(f_raw, str) else f_raw
                
                fecha_formateada = f"{f_obj.day} {meses[f_obj.month - 1]} - {f_obj.strftime('%H:%M')}"
                
                fixture_terminado.append({
                    "id": row["id"], 
                    "grupo": row["grupo"], 
                    "fecha": fecha_formateada,
                    "local": row["local"], 
                    "banderaL": row["banderaL"], 
                    "golesL": row.get("goles_local", 0),  
                    "visitante": row["visitante"], 
                    "banderaV": row["banderaV"], 
                    "golesV": row.get("goles_visitante", 0)  
                })
            return fixture_terminado
            
    except Exception as e:
        print(f"❌ Error crítico en partidos terminados: {e}")
        
    return []

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

# 6. CANAL WEBSOCKET
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

# 7. MOTOR DE PUNTOS Y ACTUALIZACIÓN 
@app.post("/matches/{partido_id}/finish")
@app.post("/api/matches/{partido_id}/finish")
def finish_match(partido_id: int, goles_local_real: int, goles_visitante_real: int, db: Session = Depends(get_db)):
    try:
        partido = db.query(Partido).filter(Partido.id == partido_id).first()
        if not partido:
            raise HTTPException(status_code=404, detail="Partido no encontrado.")
        
        partido.estado = "finalizado"
        partido.goles_local = goles_local_real       
        partido.goles_visitante = goles_visitante_real 
        db.commit()

        pronosticos = db.query(Pronostico).filter(Pronostico.partido_id == partido_id).all()

        for p in pronosticos:
            puntos_ganados = 0
            
            if p.goles_local_pronostico == goles_local_real and p.goles_visitante_pronostico == goles_visitante_real:
                puntos_ganados = 3
            else:
                tendencia_real = goles_local_real - goles_visitante_real
                tendencia_pronostico = p.goles_local_pronostico - p.goles_visitante_pronostico
                
                if (tendencia_real > 0 and tendencia_pronostico > 0) or \
                   (tendencia_real < 0 and tendencia_pronostico < 0) or \
                   (tendencia_real == 0 and tendencia_pronostico == 0):
                    puntos_ganados = 1

            usuario = db.query(Usuario).filter(Usuario.id == p.usuario_id).first()
            if usuario:
                if getattr(usuario, 'puntos', None) is None:
                    usuario.puntos = 0
                usuario.puntos += puntos_ganados

        db.commit()
        return {"status": "success", "mensaje": f"🏁 ¡Partido {partido_id} finalizado con marcador {goles_local_real}-{goles_visitante_real}!"}
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error en finish_match: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 7.2 ENDPOINT PARA EXPONER EL RANKING EN VIVO
@app.get("/ranking")
@app.get("/api/ranking")
def get_ranking(db: Session = Depends(get_db)):
    try:
        usuarios_db = db.query(Usuario).all()
        ranking_final = []
        for u in usuarios_db:
            ranking_final.append({
                "id": u.id,
                "nombre": u.nombre,
                "puntos": u.puntos if (hasattr(u, 'puntos') and u.puntos is not None) else 0
            })
        ranking_final.sort(key=lambda x: x["puntos"], reverse=True)
        return ranking_final
    except Exception as e:
        print(f"⚠️ Alerta en ranking ORM: {e}")
        return [{"id": 1, "nombre": "Survi", "puntos": 0}]
    
# ==========================================
# 8. MOTOR DE ESTADÍSTICAS GLOBALES (NEON)
# ==========================================
@app.get("/stats")
@app.get("/api/stats")
def get_global_stats(db: Session = Depends(get_db)):
    try:
        total_apuestas = db.query(Pronostico).count()
        query_goles = text("""
            SELECT COALESCE(AVG(goles_local_pronostico + goles_visitante_pronostico), 0) as promedio 
            FROM pronosticos
        """)
        promedio_goles = round(float(db.execute(query_goles).scalar()), 1)
        
        query_tendencias = text("""
            SELECT 
                COUNT(CASE WHEN goles_local_pronostico > goles_visitante_pronostico THEN 1 END) as locales,
                COUNT(CASE WHEN goles_local_pronostico = goles_visitante_pronostico THEN 1 END) as empates,
                COUNT(CASE WHEN goles_local_pronostico < goles_visitante_pronostico THEN 1 END) as visitantes
            FROM pronosticos
        """)
        res = db.execute(query_tendencias).mappings().first()
        
        total = total_apuestas if total_apuestas > 0 else 1
        pct_local = round((res["locales"] / total) * 100)
        pct_empate = round((res["empates"] / total) * 100)
        pct_visitante = round((res["visitantes"] / total) * 100)
        
        return {
            "total_predictions": total_apuestas,
            "average_goals": promedio_goles,
            "tendencies": {"local": pct_local, "draw": pct_empate, "away": pct_visitante}
        }
    except Exception as e:
        print(f"⚠️ Alerta en Stats: {e}")
        return {"total_predictions": 0, "average_goals": 0.0, "tendencies": {"local": 33, "draw": 34, "away": 33}}
    
# ==========================================
# 9. ENDPOINT PARA ELIMINAR UN USUARIO (NEON)
# ==========================================
@app.delete("/usuarios/{usuario_id}")
@app.delete("/api/usuarios/{usuario_id}")
def delete_user(usuario_id: int, db: Session = Depends(get_db)):
    try:
        usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado.")
        db.execute(text("DELETE FROM pronosticos WHERE usuario_id = :uid"), {"uid": usuario_id})
        db.delete(usuario)
        db.commit()
        return {"status": "success", "mensaje": "🗑️ ¡Usuario eliminado de la base de datos con éxito!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al borrar: {str(e)}")
    
