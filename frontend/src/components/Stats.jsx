import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

export default function Stats() {
  const [metricas, setMetricas] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarMetricas = async () => {
      try {
        setCargando(true);
        const respuesta = await api.get('/stats');
        
        if (respuesta.data && typeof respuesta.data === 'object') {
          setMetricas(respuesta.data);
        } else {
          throw new Error("Datos corruptos");
        }
      } catch (error) {
        console.error("⚠️ Alerta en servidor de estadísticas:", error);
        // 🛠️ FALLBACK SEGURO: Si la API falla o está vacía, inicializamos datos estéticos neutros para no romper React
        setMetricas({
          total_predictions: 0,
          average_goals: 0.0,
          tendencies: { local: 33, draw: 34, away: 33 }
        });
      } finally {
        setCargando(false);
      }
    };
    cargarMetricas();
  }, []);

  if (cargando || !metricas) {
    return (
      <div className="text-center py-5 font-monospace text-success small bg-dark bg-opacity-50 text-white rounded-4 border border-secondary my-3">
        <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
        📊 Compilando analítica de la FIFA...
      </div>
    );
  }

  return (
    <div className="w-100 mt-2 font-monospace text-white">
      <div className="d-flex flex-column gap-3">
        
        <div className="row g-2 text-center">
          <div className="col-6">
            <div className="bg-secondary bg-opacity-10 border border-secondary border-opacity-30 rounded-3 p-3 shadow-sm">
              <span className="d-block text-muted small" style={{ fontSize: '10px' }}>PRONÓSTICOS</span>
              <span className="fs-3 fw-black text-success">{metricas.total_predictions}</span>
            </div>
          </div>
          <div className="col-6">
            <div className="bg-secondary bg-opacity-10 border border-secondary border-opacity-30 rounded-3 p-3 shadow-sm">
              <span className="d-block text-muted small" style={{ fontSize: '10px' }}>PROM. GOLES</span>
              <span className="fs-3 fw-black text-warning">{metricas.average_goals}</span>
            </div>
          </div>
        </div>

        <div className="bg-secondary bg-opacity-10 border border-secondary border-opacity-30 rounded-4 p-3 shadow-sm">
          <h6 className="text-center text-success fw-bold tracking-wider mb-3" style={{ fontSize: '12px' }}>📊 TENDENCIA DE APUESTAS</h6>
          
          <div className="d-flex flex-column gap-2 small">
            <div>
              <div className="d-flex justify-content-between mb-1 text-muted" style={{ fontSize: '11px' }}>
                <span>🏠 Victoria Local</span>
                <span className="fw-bold text-white">{metricas.tendencies?.local ?? 33}%</span>
              </div>
              <div className="progress bg-dark" style={{ height: '8px' }}>
                <div className="progress-bar bg-success" style={{ width: `${metricas.tendencies?.local ?? 33}%` }}></div>
              </div>
            </div>

            <div>
              <div className="d-flex justify-content-between mb-1 text-muted" style={{ fontSize: '11px' }}>
                <span>🤝 Empate</span>
                <span className="fw-bold text-white">{metricas.tendencies?.draw ?? 34}%</span>
              </div>
              <div className="progress bg-dark" style={{ height: '8px' }}>
                <div className="progress-bar bg-warning" style={{ width: `${metricas.tendencies?.draw ?? 34}%` }}></div>
              </div>
            </div>

            <div>
              <div className="d-flex justify-content-between mb-1 text-muted" style={{ fontSize: '11px' }}>
                <span>✈️ Victoria Visitante</span>
                <span className="fw-bold text-white">{metricas.tendencies?.away ?? 33}%</span>
              </div>
              <div className="progress bg-dark" style={{ height: '8px' }}>
                <div className="progress-bar bg-info" style={{ width: `${metricas.tendencies?.away ?? 33}%` }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}