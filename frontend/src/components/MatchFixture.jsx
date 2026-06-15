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
        // Saneamos el usuario_id para producción
        const idLimpio = usuarioId && !isNaN(Number(usuarioId)) ? Number(usuarioId) : 1;
        
        const respuesta = await api.get(`/matches?usuario_id=${idLimpio}`);
        
        if (respuesta.data && Array.isArray(respuesta.data) && respuesta.data.length > 0) {
          setPartidosTotales(respuesta.data);
          
          // Extraer fechas YYYY-MM-DD ordenadas
          const fechasUnicas = [...new Set(respuesta.data.map(p => {
            if (!p.fecha_hora) return "2026-06-11";
            return String(p.fecha_hora).replace('T', ' ').trim().substring(0, 10);
          }))].sort();
          
          setFechasDisponibles(fechasUnicas);
          
          // 🛠️ SOLUCIÓN: Forzamos a que empiece siempre en el DÍA 1 del mundial (índice 0) 
          // para ver los partidos cargados desde el 11 de junio.
          setIndiceFecha(0);
        }
      } catch (error) {
        console.error("❌ Error al traer el fixture de Neon:", error);
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
      <div className="text-center py-5 font-monospace text-success small bg-white rounded border my-3">
        <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
        ⚽ Cargando fixture oficial de Neon...
      </div>
    );
  }

  if (fechasDisponibles.length === 0) {
    return (
      <div className="text-center py-4 text-muted font-monospace small bg-white rounded border my-3">
        📅 No se encontraron fechas en Neon.
      </div>
    );
  }

  const fechaActual = fechasDisponibles[indiceFecha];
  
  // Filtrado estricto por la fecha del índice actual
  const partidosDelDia = partidosTotales.filter(p => {
    if (!p.fecha_hora) return false;
    const pFechaLimpia = String(p.fecha_hora).replace('T', ' ').trim().substring(0, 10);
    return pFechaLimpia === fechaActual;
  });

  // Convertir fecha YYYY-MM-DD a formato legible (Ej: "11 de junio")
  let fechaFormateadaVisual = fechaActual;
  try {
    const opcionesFecha = { day: 'numeric', month: 'long', timeZone: 'UTC' };
    fechaFormateadaVisual = new Date(fechaActual + "T00:00:00").toLocaleDateString('es-ES', opcionesFecha);
  } catch (e) {
    fechaFormateadaVisual = fechaActual;
  }

  return (
    <div className="p-3 bg-white text-dark rounded border my-3" style={{ maxWidth: '100%' }}>
      
      {/* 🔘 NAVEGACIÓN DEL CALENDARIO */}
      <div className="d-flex justify-content-between align-items-center mb-3 bg-light p-2 rounded border">
        <button 
          className="btn btn-success btn-sm px-2 fw-bold" 
          onClick={irAtras} 
          disabled={indiceFecha === 0}
        >
          ⬅️
        </button>
        
        <div className="text-center">
          <div className="text-muted small font-monospace" style={{ fontSize: '0.75rem' }}>
            DÍA {indiceFecha + 1} DE {fechasDisponibles.length}
          </div>
          <h6 className="mb-0 fw-bold text-success text-capitalize small font-monospace">
            {fechaFormateadaVisual}
          </h6>
        </div>

        <button 
          className="btn btn-success btn-sm px-2 fw-bold" 
          onClick={irSiguiente} 
          disabled={indiceFecha === fechasDisponibles.length - 1}
        >
          ➡️
        </button>
      </div>

      {/* ⚽ LISTA DE PARTIDOS FILTRADOS */}
      <div className="row" style={{ maxHeight: '280px', overflowY: 'auto' }}>
        {partidosDelDia.length === 0 ? (
          <div className="text-center py-3 text-muted small">No hay partidos agendados para este día.</div>
        ) : (
          partidosDelDia.map((partido) => {
            let horaStr = "00:00";
            const strCompleto = String(partido.fecha_hora).replace('T', ' ').trim();
            if (strCompleto.length >= 16) {
              horaStr = strCompleto.substring(11, 16);
            }

            return (
              <div key={partido.id} className="col-12 mb-2">
                <div className="card shadow-sm border-0 border-start border-success border-3 bg-light">
                  <div className="card-body p-2">
                    
                    <div className="text-center text-muted font-monospace mb-1" style={{ fontSize: '0.7rem' }}>
                      Grupo {partido.grupo || 'U'} • 🕒 {horaStr} HS
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      
                      {/* Local */}
                      <div className="text-center flex-grow-1" style={{ width: '35%' }}>
                        <img 
                          src={partido.banderaL || 'https://placeholder.com'} 
                          alt={partido.local}
                          className="rounded border shadow-sm mb-1"
                          style={{ width: '30px', height: '18px', objectFit: 'cover' }}
                        />
                        <div className="fw-bold text-truncate text-dark" style={{ fontSize: '0.75rem' }}>
                          {partido.local}
                        </div>
                      </div>

                      {/* Marcador */}
                      <div className="px-1 text-center" style={{ width: '30%' }}>
                        <span className="badge bg-dark font-monospace px-2 py-1" style={{ fontSize: '0.8rem' }}>
                          {partido.golesL} - {partido.golesV}
                        </span>
                      </div>

                      {/* Visitante */}
                      <div className="text-center flex-grow-1" style={{ width: '35%' }}>
                        <img 
                          src={partido.banderaV || 'https://placeholder.com'} 
                          alt={partido.visitante}
                          className="rounded border shadow-sm mb-1"
                          style={{ width: '30px', height: '18px', objectFit: 'cover' }}
                        />
                        <div className="fw-bold text-truncate text-dark" style={{ fontSize: '0.75rem' }}>
                          {partido.visitante}
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}