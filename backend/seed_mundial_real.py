import os
import requests
from datetime import datetime
from app.database import SessionLocal
from app.models.tables import Equipo, Partido

API_FIXTURES_URL = "https://api-sports.io"
HEADERS = {
    'x-rapidapi-host': "v3.football.api-sports.io",
    'x-rapidapi-key': os.getenv("API_SPORTS_KEY") 
}

def mapear_estado(status_short):
    """Convierte estados de la API a cadenas legibles para tu frontend"""
    if status_short == "NS":
        return "programado"
    elif status_short in ["1H", "HT", "2H", "ET", "BT", "P"]:
        return "en_vivo"
    elif status_short in ["FT", "AET", "PEN"]:
        return "finalizado"
    return "programado"

def sincronizar_mundial():
    db = SessionLocal()
    print("📡 Conectando con API-Sports para obtener los datos reales...")
    
    try:
        response = requests.get(API_FIXTURES_URL, headers=HEADERS)
        if response.status_code != 200:
            print(f"❌ Error de API: {response.status_code}")
            return
        partidos_api = response.json().get("response", [])
        print(f"⚽ Se encontraron {len(partidos_api)} partidos en la API.")
    except Exception as e:
        print(f"❌ Error de red: {e}")
        return

    try:
        print("📥 Verificando y registrando equipos en Neon...")
        for item in partidos_api:
            teams = item.get("teams", {})
            for side in ["home", "away"]:
                t_info = teams.get(side, {})
                t_id = t_info.get("id")
                t_name = t_info.get("name")
                t_logo = t_info.get("logo")

                if t_id:
                    
                    db_team = db.query(Equipo).filter(Equipo.id == t_id).first()
                    if not db_team:
                        nuevo_equipo = Equipo(
                            id=t_id,
                            nombre=t_name,
                            bandera_url=t_logo,
                            grupo=None
                        )
                        db.add(nuevo_equipo)
        db.commit()

        equipos_db = db.query(Equipo).all()
        equipos_ids = {eq.id for eq in equipos_db}

        print("🔄 Sincronizando partidos, fechas y resultados reales...")
        actualizados = 0
        insertados = 0

        for item in partidos_api:
            fixture = item.get("fixture", {})
            teams = item.get("teams", {})
            goals = item.get("goals", {})
            api_match_id = fixture.get("id")
            id_local = teams.get("home", {}).get("id")
            id_visitante = teams.get("away", {}).get("id")

            if id_local not in equipos_ids or id_visitante not in equipos_ids:
                continue

            fecha_utc = datetime.fromisoformat(fixture.get("date").replace("+00:00", ""))            
            goles_l = goals.get("home") if goals.get("home") is not None else 0
            goles_v = goals.get("away") if goals.get("away") is not None else 0
            nuevo_estado = mapear_estado(fixture.get("status", {}).get("short"))

            db_match = db.query(Partido).filter(Partido.id == api_match_id).first()

            if db_match:
                db_match.goles_local = goles_l
                db_match.goles_visitante = goles_v
                db_match.estado = nuevo_estado
                actualizados += 1
            else:
                nuevo_partido = Partido(
                    id=api_match_id, 
                    equipo_local_id=id_local,
                    equipo_visitante_id=id_visitante,
                    fecha_hora=fecha_utc,
                    goles_local=goles_l if nuevo_estado != "programado" else None,
                    goles_visitante=goles_v if nuevo_estado != "programado" else None,
                    estado=nuevo_estado
                )
                db.add(nuevo_partido)
                insertados += 1

        db.commit()
        print(f"✨ Transacción en Neon completada de forma limpia.")
        print(f"📊 Resumen -> Nuevos partidos agregados: {insertados} | Partidos actualizados: {actualizados}")

    except Exception as e:
        db.rollback()
        print(f"❌ Error durante la actualización de la BD: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if not os.getenv("API_SPORTS_KEY"):
        print("🚨 Error: Falta la variable de entorno API_SPORTS_KEY en tu entorno.")
    else:
        sincronizar_mundial()