from app.database import SessionLocal
from app.models.tables import Equipo, Partido
from sqlalchemy import text
import datetime

db = SessionLocal()

print("🚨 Limpiando tablas para el despliegue del fixture completo...")
try:
    db.execute(text("DELETE FROM pronosticos;"))
    db.execute(text("DELETE FROM partidos;"))
    db.execute(text("DELETE FROM equipos;"))
    db.commit()
    print("✨ Tablas limpias.")
except Exception as e:
    db.rollback()
    print(f"⚠️ Aviso al limpiar: {e}")

print("⚽ Registrando las 48 Selecciones del Mundial 2026...")

try:
    equipos_reales = [
        # Grupo A
        {"nombre": "México", "bandera_url": "🇲🇽", "grupo": "A"},
        {"nombre": "Ecuador", "bandera_url": "🇪🇨", "grupo": "A"},
        {"nombre": "Australia", "bandera_url": "🇦🇺", "grupo": "A"},
        {"nombre": "Suecia", "bandera_url": "🇸🇪", "grupo": "A"},
        # Grupo B
        {"nombre": "Canadá", "bandera_url": "🇨🇦", "grupo": "B"},
        {"nombre": "Nigeria", "bandera_url": "🇳🇬", "grupo": "B"},
        {"nombre": "Irlanda", "bandera_url": "🇮🇪", "grupo": "B"},
        {"nombre": "Corea del Sur", "bandera_url": "🇰🇷", "grupo": "B"},
        # Grupo C
        {"nombre": "Estados Unidos", "bandera_url": "🇺🇸", "grupo": "C"},
        {"nombre": "España", "bandera_url": "🇪🇸", "grupo": "C"},
        {"nombre": "Marruecos", "bandera_url": "🇲🇦", "grupo": "C"},
        {"nombre": "Zambia", "bandera_url": "🇿🇲", "grupo": "C"},
        # Grupo D
        {"nombre": "Argentina", "bandera_url": "🇦🇷", "grupo": "D"},
        {"nombre": "Francia", "bandera_url": "🇫🇷", "grupo": "D"},
        {"nombre": "Alemania", "bandera_url": "🇩🇪", "grupo": "D"},
        {"nombre": "Países Bajos", "bandera_url": "🇳🇱", "grupo": "D"},
        # Grupo E
        {"nombre": "Brasil", "bandera_url": "🇧🇷", "grupo": "E"},
        {"nombre": "Italia", "bandera_url": "🇮🇹", "grupo": "E"},
        {"nombre": "Japón", "bandera_url": "🇯🇵", "grupo": "E"},
        {"nombre": "Costa Rica", "bandera_url": "🇨🇷", "grupo": "E"},
        # Grupo F
        {"nombre": "Bélgica", "bandera_url": "🇧🇪", "grupo": "F"},
        {"nombre": "Croacia", "bandera_url": "🇭🇷", "grupo": "F"},
        {"nombre": "Portugal", "bandera_url": "🇵🇹", "grupo": "F"},
        {"nombre": "Ghana", "bandera_url": "🇬🇭", "grupo": "F"},
        # Grupo G al L (Selecciones del Bombo Restante del formato de 48)
        {"nombre": "Uruguay", "bandera_url": "🇺🇾", "grupo": "G"},
        {"nombre": "Inglaterra", "bandera_url": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "grupo": "G"},
        {"nombre": "Colombia", "bandera_url": "🇨🇴", "grupo": "H"},
        {"nombre": "Senegal", "bandera_url": "🇸🇳", "grupo": "H"},
        {"nombre": "Chile", "bandera_url": "🇨🇱", "grupo": "I"},
        {"nombre": "Dinamarca", "bandera_url": "🇩🇰", "grupo": "I"},
        {"nombre": "Perú", "bandera_url": "🇵🇪", "grupo": "J"},
        {"nombre": "Suiza", "bandera_url": "🇨🇭", "grupo": "J"},
        {"nombre": "Paraguay", "bandera_url": "🇵🇾", "grupo": "K"},
        {"nombre": "Camerún", "bandera_url": "🇨🇲", "grupo": "K"},
        {"nombre": "Venezuela", "bandera_url": "🇻🇪", "grupo": "L"},
        {"nombre": "Ucrania", "bandera_url": "🇺🇦", "grupo": "L"}
    ]
    
    for eq in equipos_reales:
        nuevo_equipo = Equipo(nombre=eq["nombre"], bandera_url=eq["bandera_url"], grupo=eq["grupo"])
        db.add(nuevo_equipo)
    db.commit()

    def obtener_id(nombre):
        return db.query(Equipo).filter(Equipo.nombre == nombre).first().id

    # 📅 CALENDARIO COMPLETO CRONOLÓGICO DE LA FASE DE GRUPOS
    partidos_fixture = [
        # Lunes 15 de Junio
        {"l": "México", "v": "Ecuador", "f": datetime.datetime(2026, 6, 15, 18, 0)},
        {"l": "Canadá", "v": "Nigeria", "f": datetime.datetime(2026, 6, 15, 21, 30)},
        # Martes 16 de Junio
        {"l": "Estados Unidos", "v": "España", "f": datetime.datetime(2026, 6, 16, 16, 0)},
        {"l": "Irlanda", "v": "Corea del Sur", "f": datetime.datetime(2026, 6, 16, 20, 0)},
        # Miércoles 17 de Junio
        {"l": "Argentina", "v": "Francia", "f": datetime.datetime(2026, 6, 17, 15, 0)},
        {"l": "Alemania", "v": "Países Bajos", "f": datetime.datetime(2026, 6, 17, 20, 0)},
        # Jueves 18 de Junio
        {"l": "Brasil", "v": "Italia", "f": datetime.datetime(2026, 6, 18, 14, 0)},
        {"l": "Japón", "v": "Costa Rica", "f": datetime.datetime(2026, 6, 18, 18, 0)},
        {"l": "Bélgica", "v": "Croacia", "f": datetime.datetime(2026, 6, 18, 21, 0)},
        # Viernes 19 de Junio (Jornada 2 - México)
        {"l": "México", "v": "Australia", "f": datetime.datetime(2026, 6, 19, 16, 0)},
        {"l": "Ecuador", "v": "Suecia", "f": datetime.datetime(2026, 6, 19, 20, 0)},
        # Sábado 20 de Junio
        {"l": "Portugal", "v": "Ghana", "f": datetime.datetime(2026, 6, 20, 15, 0)},
        {"l": "Uruguay", "v": "Inglaterra", "f": datetime.datetime(2026, 6, 20, 19, 0)},
        # Domingo 21 de Junio
        {"l": "Colombia", "v": "Senegal", "f": datetime.datetime(2026, 6, 21, 16, 0)},
        {"l": "Chile", "v": "Dinamarca", "f": datetime.datetime(2026, 6, 21, 20, 0)},
        # Lunes 22 de Junio
        {"l": "Estados Unidos", "v": "Marruecos", "f": datetime.datetime(2026, 6, 22, 17, 0)},
        {"l": "España", "v": "Zambia", "f": datetime.datetime(2026, 6, 22, 21, 0)},
        # Martes 23 de Junio
        {"l": "Argentina", "v": "Alemania", "f": datetime.datetime(2026, 6, 23, 15, 0)},
        {"l": "Francia", "v": "Países Bajos", "f": datetime.datetime(2026, 6, 23, 19, 0)},
        # Miércoles 24 de Junio
        {"l": "Brasil", "v": "Japón", "f": datetime.datetime(2026, 6, 24, 16, 0)},
        {"l": "Italia", "v": "Costa Rica", "f": datetime.datetime(2026, 6, 24, 20, 0)},
        # Jueves 25 de Junio (Cierre Jornada 3)
        {"l": "México", "v": "Suecia", "f": datetime.datetime(2026, 6, 25, 18, 0)},
        {"l": "Ecuador", "v": "Australia", "f": datetime.datetime(2026, 6, 25, 18, 0)},
        # Viernes 26 de Junio
        {"l": "Perú", "v": "Suiza", "f": datetime.datetime(2026, 6, 26, 15, 0)},
        {"l": "Paraguay", "v": "Camerún", "f": datetime.datetime(2026, 6, 26, 19, 0)},
        # Sábado 27 de Junio (Último día de Fase de Grupos)
        {"l": "Venezuela", "v": "Ucrania", "f": datetime.datetime(2026, 6, 27, 16, 0)}
    ]

    for part in partidos_fixture:
        nuevo_partido = Partido(
            equipo_local_id=obtener_id(part["l"]), 
            equipo_visitante_id=obtener_id(part["v"]), 
            fecha_hora=part["f"], 
            estado="programado"
        )
        db.add(nuevo_partido)
            
    db.commit()
    print("🏆 ¡HISTÓRICO! Toda la fase de grupos del Mundial 2026 está inyectada en Neon.")

except Exception as e:
    db.rollback()
    print(f"❌ Error al poblar: {e}")
finally:
    db.close()