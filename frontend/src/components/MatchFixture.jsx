import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

export default function MatchFixture({ usuarioId }) {
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [diaCalendario, setDiaCalendario] = useState(15);

  const obtenerTextoDia = (d) => {
    if (d === 15) return "📅 LUNES 15 JUNIO • JORNADA INAUGURAL";
    if (d === 16) return "📅 MARTES 16 JUNIO • JORNADA 1";
    if (d === 17) return "📅 MIÉRCOLES 17 JUNIO • JORNADA 1";
    return `📅 JORNADA • ${d} DE JUNIO`;
  };

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const idUsuarioActivo = usuarioId ? usuarioId : 1;
        const respuesta = await api.get(`/matches?usuario_id=${idUsuarioActivo}&dia=${diaCalendario}`);
        setPartidos(respuesta.data);
      } catch (error) {
        console.log("Error al sincronizar el calendario con el servidor.");
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [usuarioId, diaCalendario]); 

  const modificarGoles = (partidoId, equipo, operacion) => {
    setPartidos(partidos.map(partido => {
      if (partido.id === partidoId) {
        const campo = equipo === 'local' ? 'golesL' : 'golesV';
        const nuevoValor = operacion === 'mas' ? partido[campo] + 1 : Math.max(0, partido[campo] - 1);
        return { ...partido, [campo]: nuevoValor };
      }
      return partido;
    }));
  };

  const guardarPronostico = async (id) => {
    const partido = partidos.find(p => p.id === id);
    const idUsuarioActivo = usuarioId ? usuarioId : 1;
    try {
      await api.post('/predictions', {
        usuario_id: idUsuarioActivo,
        partido_id: partido.id,
        goles_local_pronostico: partido.golesL,
        goles_visitante_pronostico: partido.golesV
      });
      alert("🚀 ¡Pronóstico fijado con éxito en la nube de Neon!");
    } catch (error) {
      alert(`❌ Error al guardar en Neon: ${error.message}`);
    }
  };

  return (
    <div className="w-100 mt-3">

      {/* 🧭 BARRA INTERACTIVA DEL CALENDARIO */}
      <div className="d-flex justify-content-between align-items-center bg-dark p-3 rounded-3 border border-secondary border-opacity-50 mb-4 shadow-lg">

        {/* Botón Atrás: Grande, estilizado en gris claro/rojo si se bloquea */}
        <button
          type="button"
          onClick={() => setDiaCalendario(prev => Math.max(15, prev - 1))}
          className={`btn btn-md fw-black text-uppercase px-3 py-2 font-monospace shadow-sm ${diaCalendario === 15 ? 'btn-outline-secondary opacity-25' : 'btn-warning text-dark'}`}
          disabled={diaCalendario === 15}
        >
          ⬅️ Atrás
        </button>

        {/* Marcador de Fecha Central: Más grande, centrado y brillante */}
        <div className="text-center px-2 flex-grow-1">
          <span className="d-block small text-muted font-monospace tracking-wider text-uppercase" style={{ fontSize: '9px' }}>FECHA DEL TORNEO</span>
          <span className="fw-black text-success font-monospace" style={{ fontSize: '13px', letterSpacing: '0.5px' }}>
            {obtenerTextoDia(diaCalendario).replace("📅 ", "")}
          </span>
        </div>

        {/* Botón Siguiente: Grande, verde brillante de Bootstrap listo para presionar */}
        <button 
          type="button"
          onClick={() => setDiaCalendario(prev => Math.min(27, prev + 1))}
          className={`btn btn-md btn-success fw-black text-dark text-uppercase px-3 py-2 font-monospace shadow-sm ${diaCalendario === 27 ? 'opacity-25' : ''}`}
          disabled={diaCalendario === 27}
        >
          Sig ➡️
        </button>
      </div>

      {/* LISTADO DE TARJETAS DE PARTIDOS */}
      {cargando ? (
        <div className="text-center py-4 text-secondary small">⚽ Sincronizando calendario con Neon...</div>
      ) : partidos.length === 0 ? (
        <div className="text-center py-5 text-muted bg-secondary bg-opacity-5 rounded border border-secondary border-opacity-20 my-2">
          <span className="fs-3 d-block mb-2">📭</span>
          <p className="small mb-0 font-monospace text-secondary">No hay partidos programados para este día.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {partidos.map((partido) => (
            <div key={partido.id} className="card bg-secondary bg-opacity-10 border-secondary text-white shadow-sm">

              <div className="card-header bg-transparent border-secondary d-flex justify-content-between align-items-center py-2">
                <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-20 font-monospace small">
                  {partido.fecha} ⏳ ACTIVO
                </span>
                <span className="text-secondary small fw-bold text-uppercase">Grupo {partido.grupo}</span>
              </div>

              <div className="card-body py-3">
                <div className="row align-items-center text-center">

                  {/* Local */}
                  <div className="col-5 d-flex flex-column align-items-center">
                    <span className="display-6 mb-1">{partido.banderaL}</span>
                    <span className="small fw-bold text-truncate w-100">{partido.local}</span>
                    <div className="d-flex align-items-center justify-content-center bg-dark border border-secondary rounded mt-2 px-1 py-1" style={{ maxWidth: '90px' }}>
                      <button type="button" onClick={() => modificarGoles(partido.id, 'local', 'menos')} className="btn btn-sm btn-link text-secondary fw-black p-0 px-2 text-decoration-none">-</button>
                      <span className="mx-1 fw-bold font-monospace text-success">{partido.golesL}</span>
                      <button type="button" onClick={() => modificarGoles(partido.id, 'local', 'mas')} className="btn btn-sm btn-link text-secondary fw-black p-0 px-2 text-decoration-none">+</button>
                    </div>
                  </div>

                  <div className="col-2 text-secondary fw-black small">VS</div>

                  {/* Visitante */}
                  <div className="col-5 d-flex flex-column align-items-center">
                    <span className="display-6 mb-1">{partido.banderaV}</span>
                    <span className="small fw-bold text-truncate w-100">{partido.visitante}</span>
                    <div className="d-flex align-items-center justify-content-center bg-dark border border-secondary rounded mt-2 px-1 py-1" style={{ maxWidth: '90px' }}>
                      <button type="button" onClick={() => modificarGoles(partido.id, 'visitante', 'menos')} className="btn btn-sm btn-link text-secondary fw-black p-0 px-2 text-decoration-none">-</button>
                      <span className="mx-1 fw-bold font-monospace text-success">{partido.golesV}</span>
                      <button type="button" onClick={() => modificarGoles(partido.id, 'visitante', 'mas')} className="btn btn-sm btn-link text-secondary fw-black p-0 px-2 text-decoration-none">+</button>
                    </div>
                  </div>

                </div>
              </div>

              <div className="card-footer bg-transparent border-top-0 pt-0 pb-3 px-3">
                <button type="button" onClick={() => guardarPronostico(partido.id)} className="btn btn-sm btn-outline-success w-100 fw-bold text-uppercase">
                  💾 Fijar Pronóstico
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}