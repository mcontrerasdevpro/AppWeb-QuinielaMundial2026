from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base   
import datetime

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    puntos_totales = Column(Integer, default=0)
    pronosticos = relationship("Pronostico", back_populates="usuario")

class Equipo(Base):
    __tablename__ = "equipos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)
    bandera_url = Column(String, nullable=True)
    grupo = Column(String(1), nullable=False) 
    eliminado = Column(Boolean, default=False) 

class Partido(Base):
    __tablename__ = "partidos"

    id = Column(Integer, primary_key=True, index=True)
    equipo_local_id = Column(Integer, ForeignKey("equipos.id"), nullable=False)
    equipo_visitante_id = Column(Integer, ForeignKey("equipos.id"), nullable=False)
    fecha_hora = Column(DateTime, default=datetime.datetime.utcnow)
    goles_local = Column(Integer, default=0)
    goles_visitante = Column(Integer, default=0)
    estado = Column(String, default="programado") 

    equipo_local = relationship("Equipo", foreign_keys=[equipo_local_id])
    equipo_visitante = relationship("Equipo", foreign_keys=[equipo_visitante_id])
    pronosticos = relationship("Pronostico", back_populates="partido")

class Pronostico(Base):
    __tablename__ = "pronosticos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    partido_id = Column(Integer, ForeignKey("partidos.id"), nullable=False)
    goles_local_pronostico = Column(Integer, nullable=False)
    goles_visitante_pronostico = Column(Integer, nullable=False)
    puntos_ganados = Column(Integer, default=0) 
    usuario = relationship("Usuario", back_populates="pronosticos")
    partido = relationship("Partido", back_populates="pronosticos")