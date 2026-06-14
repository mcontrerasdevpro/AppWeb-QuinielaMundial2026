# 🏆 Q-Mundial App • Quiniela Mundial 2026

Plataforma web premium, responsiva y de alta velocidad diseñada para gestionar porras y pronósticos deportivos en tiempo real para la Copa del Mundo de la FIFA 2026.

---

## 🚀 Características Principales

- **Fixture Oficial Inteligente**: Calendario navegable día por día mediante selectores interactivos que cargan los 72 partidos de la fase de grupos.
- **Base de Datos Serverless**: Persistencia remota indestructible conectada a la nube de **Neon (PostgreSQL)**.
- **Acceso Acorazado**: Sistema de autenticación con bloqueo de historial e inputs blindados contra autocompletados molestos de Chrome.
- **Podio y Analíticas en Vivo**: Pestañas automáticas de Ranking Global y Estadísticas con cálculo relacional de tendencias y puntos.
- **Gestión de Privacidad**: Opción integrada para que cada hincha pueda darse de baja y eliminar su cuenta de internet con un clic.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React.js (Vite), Bootstrap 5 (Estilo Dark Premium), Axios.
- **Backend**: Python 3.12, FastAPI, SQLAlchemy ORM, Uvicorn asíncrono.
- **Base de Datos**: Neon (PostgreSQL en la nube públicos).

---

## 📦 Instrucciones de Arranque Rápido

### 1. Servidor Backend (Python)
Asegúrate de estar dentro del entorno virtual e inicia el motor asíncrono:
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --ws websockets --loop asyncio
```

### 2. Panel Visual (React)
Abre una terminal secundaria y enciende la interfaz de usuario:
```bash
cd frontend
pnpm dev --force --host
```

---

## 🏁 Reglas del Torneo (Sistema de Puntos)
- **3 Puntos**: Acierto exacto del marcador (ej: Pronóstico: 2-1 | Real: 2-1).
- **1 Punto**: Acierto de tendencia / ganador (ej: Pronóstico: 1-0 | Real: 3-1).
- **0 Puntos**: Fallo total del encuentro.

---
*Desarrollado con éxito absoluto para el pitazo inicial del Mundial 2026 por Miguel Contreras. ¡A disfrutar del torneo! ⚽🔥*