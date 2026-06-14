# Patrones del Sistema y Arquitectura

## Stack de Tecnologías
- **Frontend:** React (Vite) + Tailwind CSS (Diseño responsivo).
- **Backend:** Python + FastAPI (Elegido por su soporte nativo optimizado para WebSockets).
- **Base de Datos:** PostgreSQL + SQLAlchemy (ORM) + Alembic (Migraciones).

## Decisiones Arquitectónicas
1. **Comunicación Bidireccional:** Uso de WebSockets para la actualización inmediata de goles y puntos de usuarios en el cliente React sin sobrecargar con HTTP Polling.
2. **Estructura de Base de Datos Relacional:** PostgreSQL garantiza la integridad de datos entre usuarios, partidos y predicciones mediante llaves foráneas.
3. **Validación de Datos:** Uso estricto de Pydantic en Python para la validación de payloads entrantes y salientes de la API.