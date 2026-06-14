import React, { useState, useEffect } from 'react';
import api, { matchService } from '../services/api.js';

export default function MatchFixture({ usuarioId }) {
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 1. CARGA INICIAL DE PARTIDOS DESDE LA NUBE
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const data = await matchService.obtainPartidos || await matchService.obtenerPartidos();
        const partidosConGoles = data.map(p => ({ ...p, golesL: 0, golesV: 0 }));
        setPartidos(partidosConGoles);
      } catch (error) {
        // Fallback por si la base de datos se limpia en Neon
        setPartidos([
          { id: 1, grupo: 'A', fecha: '15 JUN - 18:00', local: 'México', banderaL: '🇲🇽', visitante: 'EE. UU.', banderaV: '🇺🇸', golesL: 0, golesV: 0 },
          { id: 2, grupo: 'A', fecha: '15 JUN - 21:00', local: 'Canadá', banderaL: '🇨🇦', visitante: 'Argentina', banderaV: '🇦🇷', golesL: 0, golesV: 0 }
        ]);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  // 2. CONEXIÓN AL CANAL DE WEBSOCKETS EN VIVO
  useEffect(() => {
    const wsUrl = 'wss://probable-sniffle-jjp5g57gvqr9f9pp-8000.app.github.dev/ws';
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'GOL_REAL') {
        alert(`⚽ ¡GOOOL EN VIVO! ${data.partido} ahora va ${data.marcador}`);
      }
    };

    return () => socket.close(); 
  }, []);

  // 3. REGLA TEMPORAL: Retornamos siempre "false" para dejarte probar los botones libres
  const estaBloqueado = (fechaTexto) => {
    return false; 
  };

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

  // 4. ACCIÓN CRUCIAL: GUARDAR EL PRONÓSTICO DIRECTO EN NEON
  const guardarPronostico = async (id) => {
    const partido = partidos.find(p => p.id === id);
    
    // Si por alguna razón el ID de usuario no bajó, le asignamos el ID 1 de respaldo
    const idUsuarioActivo = usuarioId ? usuarioId : 1;

    try {
      // Golpeamos directamente el endpoint enviando las llaves exactas que espera Python
      const respuesta = await api.post('/predictions', {
        usuario_id: idUsuarioActivo,
        partido_id: partido.id,
        goles_local_pronostico: partido.golesL,
        goles_visitante_pronostico: partido.golesV
      });
      
      alert(respuesta.data?.mensaje || "🚀 ¡Pronóstico fijado con éxito en Neon!");
    } catch (error) {
      alert(`❌ Error al guardar en la nube: ${error.message}`);
    }
  };

  if (cargando) {
    return <div className="text-center py-4 text-secondary small">⚽ Abriendo las compuertas del estadio...</div>;
  }

  return (
    <div className="d-flex flex-column gap-3 w-100 mt-3">
      {partidos.map((partido) => (
        <div key={partido.id} className="card bg-secondary bg-opacity-10 border-secondary text-white shadow-sm">
          
          <div className="card-header bg-transparent border-secondary d-flex justify-content-between align-items-center py-2">
            <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-20 font-monospace small">
              {partido.fecha} ⏳ ACTIVO
            </span>
            <span className="text-secondary small fw-bold text-uppercase">
              Grupo {partido.grupo}
            </span>
          </div>

          <div className="card-body py-3">
            <div className="row align-items-center text-center">
              
              {/* Local */}
              <div className="col-5 d-flex flex-column align-items-center">
                <span className="display-6 mb-1">{partido.banderaL}</span>
                <span className="small fw-bold text-truncate w-100">{partido.local}</span>
                <div className="d-flex align-items-center justify-content-center bg-dark border border-secondary rounded mt-2 px-1 py-1" style={{ maxWidth: '90px' }}>
                  <button onClick={() => modificarGoles(partido.id, 'local', 'menos')} className="btn btn-sm btn-link text-secondary fw-black p-0 px-2 text-decoration-none">-</button>
                  <span className="mx-1 fw-bold font-monospace text-success">{partido.golesL}</span>
                  <button onClick={() => modificarGoles(partido.id, 'local', 'mas')} className="btn btn-sm btn-link text-secondary fw-black p-0 px-2 text-decoration-none">+</button>
                </div>
              </div>

              <div className="col-2 text-secondary fw-black small">VS</div>

              {/* Visitante */}
              <div className="col-5 d-flex flex-column align-items-center">
                <span className="display-6 mb-1">{partido.banderaV}</span>
                <span className="small fw-bold text-truncate w-100">{partido.visitante}</span>
                <div className="d-flex align-items-center justify-content-center bg-dark border border-secondary rounded mt-2 px-1 py-1" style={{ maxWidth: '90px' }}>
                  <button onClick={() => modificarGoles(partido.id, 'visitante', 'menos')} className="btn btn-sm btn-link text-secondary fw-black p-0 px-2 text-decoration-none">-</button>
                  <span className="mx-1 fw-bold font-monospace text-success">{partido.golesV}</span>
                  <button onClick={() => modificarGoles(partido.id, 'visitante', 'mas')} className="btn btn-sm btn-link text-secondary fw-black p-0 px-2 text-decoration-none">+</button>
                </div>
              </div>

            </div>
          </div>

          <div className="card-footer bg-transparent border-top-0 pt-0 pb-3 px-3">
            <button 
              type="button"
              onClick={() => guardarPronostico(partido.id)}
              className="btn btn-sm btn-outline-success w-100 fw-bold text-uppercase"
            >
              💾 Fijar Pronóstico
            </button>
          </div>

        </div>
      ))}
    </div>
  );
}