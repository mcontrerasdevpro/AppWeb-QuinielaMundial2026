from app.database import SessionLocal
from app.models.tables import Equipo, Partido
from sqlalchemy import text
import datetime

db = SessionLocal()

print("🚨 Limpiando fixture anterior con comandos universales...")
try:
    # Usamos DELETE FROM que es compatible tanto con SQLite como con PostgreSQL (Neon)
    db.execute(text("DELETE FROM pronosticos;"))
    db.execute(text("DELETE FROM partidos;"))
    db.execute(text("DELETE FROM equipos;"))
    db.commit()
    print("✨ Tablas limpiadas con éxito absoluto.")
except Exception as e:
    db.rollback()
    print(f"⚠️ Aviso al limpiar: {e}")

print("⚽ Insertando grupos y selecciones oficiales de la FIFA (Mundial 2026)...")

try:
    # Registro de selecciones reales por Grupo sin repetir nombres
    equipos_reales = [
        {"nombre": "México", "bandera_url": "🇲🇽", "grupo": "A"},
        {"nombre": "Australia", "bandera_url": "🇦🇺", "grupo": "A"},
        {"nombre": "Suecia", "bandera_url": "🇸🇪", "grupo": "A"},
        {"nombre": "Ecuador", "bandera_url": "🇪🇨", "grupo": "A"},
        
        {"nombre": "Canadá", "bandera_url": "🇨🇦", "grupo": "B"},
        {"nombre": "Irlanda", "bandera_url": "🇮🇪", "grupo": "B"},
        {"nombre": "Nigeria", "bandera_url": "🇳🇬", "grupo": "B"},
        
        {"nombre": "Estados Unidos", "bandera_url": "🇺🇸", "grupo": "C"},
        {"nombre": "Marruecos", "bandera_url": "🇲🇦", "grupo": "C"},
        {"nombre": "Zambia", "bandera_url": "🇿🇲", "grupo": "C"},
        {"nombre": "España", "bandera_url": "🇪🇸", "grupo": "C"},
        
        {"nombre": "Argentina", "bandera_url": "🇦🇷", "grupo": "D"},
        {"nombre": "Francia", "bandera_url": "🇫🇷", "grupo": "D"},
        {"nombre": "Alemania", "bandera_url": "🇩🇪", "grupo": "D"},
        {"nombre": "Países Bajos", "bandera_url": "🇳🇱", "grupo": "D"}
    ]
    
    for eq in equipos_reales:
        nuevo_equipo = Equipo(nombre=eq["nombre"], bandera_url=eq["bandera_url"], grupo=eq["grupo"])
        db.add(nuevo_equipo)
    db.commit()

    # Buscamos los IDs de forma dinámica para enlazar los partidos
    mex_id = db.query(Equipo).filter(Equipo.nombre == "México").first().id
    ecu_id = db.query(Equipo).filter(Equipo.nombre == "Ecuador").first().id
    can_id = db.query(Equipo).filter(Equipo.nombre == "Canadá").first().id
    nga_id = db.query(Equipo).filter(Equipo.nombre == "Nigeria").first().id
    usa_id = db.query(Equipo).filter(Equipo.nombre == "Estados Unidos").first().id
    esp_id = db.query(Equipo).filter(Equipo.nombre == "España").first().id

    # Jornada Inaugural Real para mañana lunes 15 de Junio de 2026
    partidos_reales = [
        {"local_id": mex_id, "visitante_id": ecu_id, "fecha": datetime.datetime(2026, 6, 15, 18, 0)},
        {"local_id": can_id, "visitante_id": nga_id, "fecha": datetime.datetime(2026, 6, 15, 21, 30)},
        {"local_id": usa_id, "visitante_id": esp_id, "fecha": datetime.datetime(2026, 6, 16, 16, 0)}
    ]

    for part in partidos_reales:
        nuevo_partido = Partido(
            equipo_local_id=part["local_id"], 
            equipo_visitante_id=part["visitante_id"], 
            fecha_hora=part["fecha"], 
            estado="programado"
        )
        db.add(nuevo_partido)
            
    db.commit()
    print("🏆 ¡Grupos oficiales y Fixture Real cargados con éxito total!")

except Exception as e:
    db.rollback()
    print(f"❌ Error al poblar los datos oficiales del Mundial: {e}")
finally:
    db.close()