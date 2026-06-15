import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

export default function MatchFixture({ usuarioId }) {
  const [partidosTotales, setPartidosTotales] = useState([]);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [indiceFecha, setIndiceFecha] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarFixture = async () => {
      try {
        setCargando(true);
        const uid = usuarioId || 1;
        const respuesta = await api.get(`/matches?usuario_id=${uid}`);
        
        if (respuesta.data && Array.isArray(respuesta.data) && respuesta.data.length > 0) {
          setPartidosTotales(respuesta.data);
          
          // Mapeo seguro de fechas en formato YYYY-MM-DD sin romper por la letra T
          const fechasUnicas = [...new Set(respuesta.data.map(p => {
            if (!p.fecha_hora) return "2026-06-15";
            const fStr = String(p.fecha_hora);
            return fStr.includes('T') ? fStr.split('T')[0] : fStr.substring(0, 10);
          }))].sort();
          
          setFechasDisponibles(fechasUnicas);
          
          // Auto-posicionar el día actual en el calendario
          const hoyStr = new Date().toISOString().split('T')[0];
          const idxHoy = fechasUnicas.indexOf(hoyStr);
          setIndiceFecha(idxHoy !== -1 ? idxHoy : 0);
        }
      } catch (error) {
        console.error("❌ Error en fixture frontend:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarFixture();
  }, [usuarioId]);

  const irAtras = () => {
    if (indiceFecha > 0) setIndiceFecha(indiceFecha - 1);
  };

  const irSiguiente = () => {
    if (indiceFecha < fechasDisponibles.length - 1) setIndiceFecha(indiceFecha + 1);
  };

  if (cargando) {
    return (
      <div className="text-center py-5 font-monospace text-success small">
        <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
        ⚽ Cargando fixture oficial de Neon...
      </div>
    );
  }

  if (fechasDisponibles.length === 0) {
    return <div className="text-center py-4 text-muted font-monospace small">📅 No hay partidos registrados en Neon.</div>;
  }

  // Filtrado de partidos del día activo
  const fechaActual = fechasDisponibles[indiceFecha];
  const partidosDelDia = partidosTotales.filter(p => {
    const pFecha = String(p.fecha_hora).includes('T') ? p.fecha_hora.split('T')[0] : p.fecha_hora.substring(0, 10);
    return pFecha === fechaActual;
  });

  const opcionesFecha = { day: 'numeric', month: 'long', timeZone: 'UTC' };
  const fechaFormateadaVisual = new Date(fechaActual + "T00:00:00").toLocaleDateString('es-ES', opcionesFecha);

  return (
    <div className="container mt-4" style={{ maxWidth: '600px' }}>
      
      {/* 🔘 CONTROLADORES DE CALENDARIO DEL MUNDIAL */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded shadow-sm border">
        <button 
          className="btn btn-success btn-sm px-3" 
          onClick={irAtras} 
          disabled={indiceFecha === 0}
        >
          ⬅️ Atrás
        </button>
        
        <div className="text-center">
          <small className="badge bg-success text-uppercase mb-1">Día {indiceFecha + 1} de {fechasDisponibles.length}</small>
          <h5 className="mb-0 fw-bold text-dark font-monospace">{fechaFormateadaVisual}</h5>
        </div>

        <button 
          className="btn btn-success btn-sm px-3" 
          onClick={irSiguiente} 
          disabled={indiceFecha === fechasDisponibles.length - 1}
        >
          Siguiente ➡️
        </button>
      </div>

      {/* ⚽ DETALLE DE LOS PARTIDOS DEL DÍA */}
      <div className="row">
        {partidosDelDia.map((partido) => {
          // Obtención segura de hora hh:mm
          const horaStr = partido.fecha_hora && partido.fecha_hora.includes('T') 
            ? partido.fecha_hora.split('T')[1].substring(0, 5) 
            : "00:00";

          return (
            <div key={partido.id} className="col-12 mb-3">
              <div className="card shadow-sm border-0 border-start border-success border-4">
                <div className="card-body py-3">
                  
                  <div className="text-center text-muted small mb-2 font-monospace">
                    Grupo {partido.grupo || 'General'} • 🕒 {horaStr} HS
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center">
                    
                    {/* Equipo Local */}
                    <div className="text-center flex-grow-1" style={{ width: '35%' }}>
                      <img 
                        src={partido.banderaL || 'https://placeholder.com'} 
                        alt={partido.local}
                        className="rounded border shadow-sm mb-1"
                        style={{ width: '35px', height: '23px', objectFit: 'cover' }}
                      />
                      <div className="fw-bold text-truncate small">{partido.local}</div>
                    </div>

                    {/* Marcador Registrado */}
                    <div className="px-2 text-center" style={{ width: '30%' }}>
                      <span className="badge bg-dark font-monospace fs-6 px-3 py-2">
                        {partido.golesL} - {partido.golesV}
                      </span>
                    </div>

                    {/* Equipo Visitante */}
                    <div className="text-center flex-grow-1" style={{ width: '35%' }}>
                      <img 
                        src={partido.banderaV || 'https://placeholder.com'} 
                        alt={partido.visitante}
                        className="rounded border shadow-sm mb-1"
                        style={{ width: '35px', height: '23px', objectFit: 'cover' }}
                      />
                      <div className="fw-bold text-truncate small">{partido.visitante}</div>
                    </div>

                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}