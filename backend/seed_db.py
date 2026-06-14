from app.database import SessionLocal
from app.models.tables import Equipo, Partido
import datetime

db = SessionLocal()

print("⚽ Insertando selecciones y fixture en la nube de Neon...")

try:
    # 1. Crear Equipos si no existen
    equipos_datos = [
        {"nombre": "México", "bandera_url": "🇲🇽", "grupo": "A"},
        {"nombre": "EE. UU.", "bandera_url": "🇺🇸", "grupo": "A"},
        {"nombre": "Canadá", "bandera_url": "🇨🇦", "grupo": "A"},
        {"nombre": "Argentina", "bandera_url": "🇦🇷", "grupo": "A"},
        {"nombre": "España", "bandera_url": "🇪🇸", "grupo": "B"},
        {"nombre": "Alemania", "bandera_url": "🇩🇪", "grupo": "B"}
    ]
    
    for eq in equipos_datos:
        existe = db.query(Equipo).filter(Equipo.nombre == eq["nombre"]).first()
        if not existe:
            nuevo_equipo = Equipo(nombre=eq["nombre"], bandera_url=eq["bandera_url"], grupo=eq["grupo"])
            db.add(nuevo_equipo)
    
    db.commit()

    # Obtener los IDs autogenerados de cada selección
    mex = db.query(Equipo).filter(Equipo.nombre == "México").first().id
    usa = db.query(Equipo).filter(Equipo.nombre == "EE. UU.").first().id
    can = db.query(Equipo).filter(Equipo.nombre == "Canadá").first().id
    arg = db.query(Equipo).filter(Equipo.nombre == "Argentina").first().id
    esp = db.query(Equipo).filter(Equipo.nombre == "España").first().id
    ale = db.query(Equipo).filter(Equipo.nombre == "Alemania").first().id

    # 2. Crear Partidos Programados
    # Ponemos fechas exactas para el Mundial 2026 (a partir de mañana 15 de Junio)
    partidos_datos = [
        {"local_id": mex, "visitante_id": usa, "fecha": datetime.datetime(2026, 6, 15, 22, 0)},
        {"local_id": can, "visitante_id": arg, "fecha": datetime.datetime(2026, 6, 15, 23, 59)},
        {"local_id": esp, "visitante_id": ale, "fecha": datetime.datetime(2026, 6, 16, 15, 0)}
    ]

    for part in partidos_datos:
        # Evitamos duplicar registros duplicados si ejecutas el script más de una vez
        existe_partido = db.query(Partido).filter(
            Partido.equipo_local_id == part["local_id"], 
            Partido.equipo_visitante_id == part["visitante_id"]
        ).first()
        
        if not existe_partido:
            nuevo_partido = Partido(
                equipo_local_id=part["local_id"], 
                equipo_visitante_id=part["visitante_id"], 
                fecha_hora=part["fecha"], 
                estado="programado"
            )
            db.add(nuevo_partido)
            
    db.commit()
    print("🏆 ¡Fixture cargado con éxito total en Neon! Todo listo para recibir apuestas.")

except Exception as e:
    print(f"❌ Error al poblar los datos: {e}")
finally:
    db.close()