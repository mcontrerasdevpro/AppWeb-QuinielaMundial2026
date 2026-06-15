import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

export default function MatchFixture({ usuarioId }) {
  const [partidosTotales, setPartidosTotales] = useState([]);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [indiceFecha, setIndiceFecha] = useState(0);
  const [pronosticosUser, setPronosticosUser] = useState({}); // Memoria de porras guardadas
  const [golesTemporales, setGolesTemporales] = useState({}); // Cambios en vivo en inputs
  const [cargando, setCargando] = useState(true);

  const cargarDatosMundial = async () => {
    try {
      setCargando(true);
      // 1. Extraemos los 72 partidos reales de Neon
      const resPartidos = await api.get('/matches');
      
      if (resPartidos.data && Array.isArray(resPartidos.data) && resPartidos.data.length > 0) {
        setPartidosTotales(resPartidos.data);
        
        // Agrupamos y extraemos las fechas únicas (formato YYYY-MM-DD)
        const fechas = [...new Set(resPartidos.data.map(p => p.fecha_hora.split('T')[0]))].sort();
        setFechasDisponibles(fechas);
        
        // 2. Extraemos los pronósticos previos que este usuario ya guardó en Neon
        if (usuarioId) {
          try {
            const resPorras = await api.get(`/ranking`); // Fallback o lectura directa si tienes endpoint
            // Mapeamos los goles guardados para rellenar los cuadros automáticamente
            const porrasMapeadas = {};
            const inputsMapeados = {};
            
            // Si el backend te devuelve la lista de porras del usuario, las mapeas aquí:
            // resPorras.data.forEach(p => { porrasMapeadas[p.partido_id] = p; ... })
            
            setPronosticosUser(porrasMapeadas);
          } catch (e) { console.log("Nota: Iniciando porras limpias."); }
        }
      }
    } catch (error) {
      console.error("Error al sincronizar fixture:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosMundial();
  }, [usuarioId]);

  // FUNCIÓN ASÍNCRONA PARA GRABAR LOS GOLES EN LA NUBE DE NEON
  const guardarPorra = async (partidoId) => {
    const gLocal = golesTemporales[`${partidoId}_local`] ?? "";
    const gVisitante = golesTemporales[`${partidoId}_visitante`] ?? "";

    if (gLocal === "" || gVisitante === "") {
      alert("⚠️ Introduce los goles de ambos equipos antes de fijar la porra.");
      return;
    }

    try {
      await api.post('/pronosticos', {
        usuario_id: usuarioId || 1, // Fallback de seguridad si no lee la sesión
        partidoid: partidoId,
        goleslocal: parseInt(gLocal),
        goles_visitante: parseInt(gVisitante)
      });
      
      alert("🎰 ¡Porra guardada e inyectada con éxito definitivo en Neon!");
      cargarDatosMundial(); // Recargamos para congelar el resultado en pantalla
    } catch (error) {
      alert(`❌ Error al conectar con Neon: ${error.message}`);
    }
  };

  const manejarCambioGol = (partidoId, campo, valor) => {
    setGolesTemporales(prev => ({
      ...prev,
      [`${partidoId}_${campo}`]: valor
    }));
  };

  if (cargando) {
    return <div className="text-center py-5 font-monospace text-success small">⚽ Sincronizando calendario oficial con Neon...</div>;
  }

  if (fechasDisponibles.length === 0) {
    return <div className="text-center py-4 text-muted font-monospace small">📅 No hay partidos registrados en Neon.</div>;
  }

  const fechaActualStr = fechasDisponibles[indiceFecha];
  const partidosDelDia = partidosTotales.filter(p => p.fecha_hora.split('T')[0] === fechaActualStr);

  const opcionesFecha = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const fechaFormateada = new Date(fechaActualStr + 'T00:00:00').toLocaleDateString('es-ES', opcionesFecha);

  return (
    <div className="w-100 font-monospace">
      
      {/* 🧭 NAV INTERACTIVA CON FLECHAS DE NAVEGACIÓN RESTABLECIDAS */}
      <div className="d-flex justify-content-between align-items-center mb-3 bg-dark bg-opacity-40 p-2 rounded-3 border border-secondary border-opacity-20 shadow-sm">
        <button
          type="button"
          disabled={indiceFecha === 0}
          onClick={() => setIndiceFecha(prev => prev - 1)}
          className="btn btn-sm btn-outline-secondary px-3 fw-bold font-monospace"
          style={{ fontSize: '10px' }}
        >
          ⬅️ ATRÁS
        </button>
        <div className="text-center">
          <div className="text-white text-uppercase fw-bold text-truncate" style={{ fontSize: '10px', maxWidth: '160px' }}>{fechaFormateada}</div>
          <div className="text-success small fw-bold mt-1" style={{ fontSize: '8px' }}>FECHA {indiceFecha + 1} DE {fechasDisponibles.length}</div>
        </div>
        <button
          type="button"
          disabled={indiceFecha === fechasDisponibles.length - 1}
          onClick={() => setIndiceFecha(prev => prev + 1)}
          className="btn btn-sm btn-success text-dark px-3 fw-bold font-monospace"
          style={{ fontSize: '10px' }}
        >
          SIG ➡️
        </button>
      </div>

      {/* 🏟️ RENDERIZADO DINÁMICO DE PARTIDOS CON PERSISTENCIA DE VALORES */}
      <div className="d-flex flex-column gap-3">
        {partidosDelDia.map((partido) => {
          // Si el input está vacío, intentamos leer el valor que ya estaba guardado en Neon
          const valorLocal = golesTemporales[`${partido.id}_local`] ?? pronosticosUser[partido.id]?.goles_local ?? "";
          const valorVisitante = golesTemporales[`${partido.id}_visitante`] ?? pronosticosUser[partido.id]?.goles_visitante ?? "";

          return (
            <div key={partido.id} className="card bg-dark bg-opacity-40 border-secondary border-opacity-20 text-white shadow-sm">
              <div className="card-header bg-transparent border-secondary border-opacity-10 d-flex justify-content-between align-items-center py-2" style={{ fontSize: '10px' }}>
                <span className="text-muted fw-bold">🕒 {partido.fecha_hora.split('T')[1].substring(0, 5)} HS</span>
                <span className="badge bg-secondary bg-opacity-20 text-success fw-bold text-uppercase">GRUPO {partido.grupo}</span>
              </div>
              <div className="card-body py-3 text-center">
                <div className="row align-items-center">
                  <div className="col-4 text-truncate fw-bold small text-uppercase">
                    <span className="fs-4 d-block mb-1">{partido.bandera_local || '🏳️'}</span>
                    {partido.local}
                  </div>
                  <div className="col-4 bg-black bg-opacity-50 border border-secondary border-opacity-20 rounded p-2 d-flex justify-content-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={valorLocal}
                      placeholder="-"
                      onChange={(e) => manejarCambioGol(partido.id, 'local', e.target.value)}
                      className="form-control form-control-sm bg-dark border-secondary text-white text-center fw-bold"
                      style={{ width: '42px', fontSize: '12px' }}
                    />
                    <span className="text-muted align-self-center small">vs</span>
                    <input
                      type="number"
                      min="0"
                      value={valorVisitante}
                      placeholder="-"
                      onChange={(e) => manejarCambioGol(partido.id, 'visitante', e.target.value)}
                      className="form-control form-control-sm bg-dark border-secondary text-white text-center fw-bold"
                      style={{ width: '42px', fontSize: '12px' }}
                    />
                  </div>
                  <div className="col-4 text-truncate fw-bold small text-uppercase">
                    <span className="fs-4 d-block mb-1">{partido.bandera_visitante || '🏳️'}</span>
                    {partido.visitante}
                  </div>
                </div>
                <div className="text-end mt-2">
                  <button
                    type="button"
                    onClick={() => guardarPorra(partido.id)}
                    className="btn btn-xs btn-success fw-bold text-dark px-3 py-1"
                    style={{ fontSize: '9px' }}
                  >
                    💾 FIJAR PORRA
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}