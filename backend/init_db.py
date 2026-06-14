import os
from app.database import Base, engine
from app.models.tables import Usuario, Equipo, Partido, Pronostico

print("⚽ Conectando con tu PostgreSQL externo a través de pgAdmin...")

try:
    Base.metadata.create_all(bind=engine)
    print("🚀 ¡Conexión exitosa! Tablas creadas en tu DB externa (usuarios, equipos, partidos, pronosticos)")
except Exception as e:
    print(f"❌ Error de conexión. Revisa los datos de tu archivo .env: {e}")