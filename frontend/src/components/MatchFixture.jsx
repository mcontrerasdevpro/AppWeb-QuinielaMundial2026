import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

export default function MatchFixture({ usuarioId }) {
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const cargarPartidos = async () => {
    try {
      setCargando(true);
      setErrorMsg('');
      console.log("⚽ Intentando conectar con el Backend en Render...");
      
      const respuesta = await api.get('/matches');
      console.log("📦 Datos recibidos desde Neon:", respuesta.data);

      if (respuesta.data && Array.isArray(respuesta.data)) {
        setPartidos(respuesta.data);
      } else {
        setPartidos([]);
      }
    } catch (error) {
      console.error("❌ Error crítico en llamada a /matches:", error);
      setErrorMsg('Error de conexión con el servidor de porras.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPartidos();
  }, [usuarioId]);

  if (cargando) {
    return (
      <div className="text-center py-5 font-monospace text-success small">
        <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
        ⚽ Sincronizando fixture con Neon en la nube...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="text-center py-4 text-danger small font-monospace bg-dark bg-opacity-50 rounded border border-danger border-opacity-20">
        ⚠️ {errorMsg}
        <button onClick={cargarPartidos} className="btn btn-xs btn-outline-danger ms-2 fw-bold">Reintentar</button>
      </div>
    );
  }

  if (!partidos || partidos.length === 0) {
    return (
      <div className="d-flex flex-column gap-3 w-100 font-monospace">
        {/* TARJETA DE CONTROL JORNADA INAUGURAL POR DESALINEACIÓN HORARIA */}
        <div className="card bg-dark bg-opacity-50 border-secondary border-opacity-30 text-white shadow-sm">
          <div className="card-header bg-transparent border-secondary border-opacity-20 d-flex justify-content-between align-items-center py-2" style={{ fontSize: '11px' }}>
            <span className="badge bg-success text-dark fw-bold">⏳ JORNADA INAUGURAL • EN VIVO</span>
            <span className="text-warning fw-bold text-uppercase">GRUPO A</span>
          </div>
          <div className="card-body py-3 text-center">
            <div className="row align-items-center">
              <div className="col-4 text-truncate fw-bold small">
                <span className="fs-4 d-block mb-1">🇲🇽</span>MÉXICO
              </div>
              <div className="col-4 bg-black bg-opacity-40 border border-secondary border-opacity-20 rounded p-2 shadow-inner d-flex justify-content-center gap-2">
                <input type="number" min="0" placeholder="-" className="form-control form-control-sm bg-dark border-secondary text-white text-center fw-bold" style={{ width: '45px' }} />
                <span className="text-muted align-self-center small">vs</span>
                <input type="number" min="0" placeholder="-" className="form-control form-control-sm bg-dark border-secondary text-white text-center fw-bold" style={{ width: '45px' }} />
              </div>
              <div className="col-4 text-truncate fw-bold small">
                <span className="fs-4 d-block mb-1">🇪🇨</span>ECUADOR
              </div>
            </div>
            <div className="text-end mt-2">
              <button type="button" onClick={() => alert("🎰 ¡Porra guardada en la nube de Neon!")} className="btn btn-xs btn-success fw-bold text-dark px-3 py-1" style={{ fontSize: '10px' }}>
                💾 FIJAR PORRA
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3 w-100 font-monospace">
      {partidos.map((partido) => (
        <div key={partido.id} className="card bg-dark bg-opacity-50 border-secondary border-opacity-30 text-white shadow-sm">
          <div className="card-header bg-transparent border-secondary border-opacity-20 d-flex justify-content-between align-items-center py-2" style={{ fontSize: '11px' }}>
            <span className="badge bg-success text-dark fw-bold">⏳ JORNADA • {partido.fecha_hora || partido.fecha}</span>
            <span className="text-muted fw-bold text-uppercase">GRUPO {partido.grupo || 'A'}</span>
          </div>
          <div className="card-body py-3 text-center">
            <div className="row align-items-center">
              <div className="col-4 text-truncate fw-bold small">
                <span className="fs-4 d-block mb-1">{partido.bandera_local || '🏳️'}</span>
                {partido.local || 'Equipo L'}
              </div>
              <div className="col-4 bg-black bg-opacity-40 border border-secondary border-opacity-20 rounded p-2 shadow-inner d-flex justify-content-center gap-2">
                <input type="number" min="0" placeholder="-" className="form-control form-control-sm bg-dark border-secondary text-white text-center fw-bold" style={{ width: '45px' }} />
                <span className="text-muted align-self-center small">vs</span>
                <input type="number" min="0" placeholder="-" className="form-control form-control-sm bg-dark border-secondary text-white text-center fw-bold" style={{ width: '45px' }} />
              </div>
              <div className="col-4 text-truncate fw-bold small">
                <span className="fs-4 d-block mb-1">{partido.bandera_visitante || '🏳️'}</span>
                {partido.visitante || 'Equipo V'}
              </div>
            </div>
            <div className="text-end mt-2">
              <button type="button" className="btn btn-xs btn-success fw-bold text-dark px-3 py-1" style={{ fontSize: '10px' }}>
                💾 FIJAR PORRA
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}