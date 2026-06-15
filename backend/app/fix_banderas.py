from sqlalchemy import text
from database import SessionLocal

MAPEO_BANDERAS = {
    "México": "mx", "Ecuador": "ec", "Canadá": "ca", "Nigeria": "ng",
    "España": "es", "Alemania": "de", "Francia": "fr", "Argentina": "ar",
    "Brasil": "br", "Uruguay": "uy", "Colombia": "co", "Chile": "cl",
    "Estados Unidos": "us", "Inglaterra": "gb-eng", "Italia": "it", "Portugal": "pt",
    "Países Bajos": "nl", "Bélgica": "be", "Croacia": "hr", "Japón": "jp",
    "Corea del Sur": "kr", "Marruecos": "ma", "Senegal": "sn", "Ghana": "gh",
    "Camerún": "cm", "Túnez": "tn", "Arabia Saudita": "sa", "Australia": "au",
    "Costa Rica": "cr", "Panamá": "pa", "Jamaica": "jm", "Honduras": "hn",
    "Perú": "pe", "Venezuela": "ve", "Paraguay": "py", "Suecia": "se", "Irlanda": "ie"
}

def actualizar_todas_las_banderas():
    db = SessionLocal()
    try:
        print("⚡ Conectando a Neon para inyectar URLs corregidas...")
        equipos = db.execute(text("SELECT id, nombre FROM equipos")).mappings().all()
        
        contador = 0
        for eq in equipos:
            nombre = eq["nombre"]
            codigo_iso = MAPEO_BANDERAS.get(nombre)
            
            if codigo_iso:
                url_real = f"https://flagcdn.com/w40/{codigo_iso}.png"
            else:
                url_real = "https://flagcdn.com"
                
            db.execute(
                text("UPDATE equipos SET bandera_url = :url WHERE id = :id"),
                {"url": url_real, "id": eq["id"]}
            )
            contador += 1
            
        db.commit()
        print(f"🏆 ¡ÉXITO TOTAL! Se han inyectado {contador} banderas de forma impecable en Neon. 🔥")
    except Exception as e:
        db.rollback()
        print(f"❌ Error al inyectar: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    actualizar_todas_las_banderas()