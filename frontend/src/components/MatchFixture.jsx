import React, { useState, useEffect } from 'react';
import { matchService, predictionService } from '../services/api.js';

export default function MatchFixture() {
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 1. CARGA INICIAL DE PARTIDOS DESDE NEON
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const data = await matchService.obtenerPartidos();
        const partidosConGoles = data.map(p => ({ ...p, golesL: 0, golesV: 0 }));
        setPartidos(partidosConGoles);
      } catch (error) {
        alert(error.message);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  // 2. CONEXIÓN AL WEBSOCKET EN VIVO (Mundial 2026)
  useEffect(() => {
    const wsUrl = 'wss://probable-sniffle-f103b2v11qu6w-8000.app.github.dev/ws';
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("⚡ Alerta en tiempo real recibida del estadio:", data);
      if (data.type === 'GOL_REAL') {
        alert(`⚽ ¡GOOOL EN VIVO! ${data.partido} ahora va ${data.marcador}`);
      }
    };

    return () => socket.close(); 
  }, []);

  // 3. REGLA DE NEGOCIO: Bloquear si faltan menos de 2 horas para el pitazo inicial
  const estaBloqueado = (fechaTexto) => {
    try {
      const meses = { 'ENE': 0, 'FEB': 1, 'MAR': 2, 'ABR': 3, 'MAY': 4, 'JUN': 5, 'JUL': 6, 'AGO': 7, 'SET': 8, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DIC': 11 };
      
      const partes = fechaTexto.split(' ');
      const dia = parseInt(partes[0]);
      const mes = meses[partes[1].toUpperCase()];
      const horaPartes = partes[3].split(':');
      const hora = parseInt(horaPartes[0]);
      const minuto = parseInt(horaPartes[1]);

      const fechaPartido = new Date(2026, mes, dia, hora, minuto);
      const ahora = new Date(); 

      const diferenciaHoras = (fechaPartido - ahora) / (1000 * 60 * 60);

      return diferenciaHoras < 2;
    } catch (e) {
      return false; 
    } // <-- CORREGIDO: Aquí cerramos correctamente con llave
  };

  const modificarGoles = (partidoId, equipo, operacion) => {
    setPartidos(partidos.map(partido => {
      if (partido.id === partidoId) {
        if (estaBloqueado(partido.fecha)) return partido;

        const campo = equipo === 'local' ? 'golesL' : 'golesV';
        const nuevoValor = operacion === 'mas' ? partido[campo] + 1 : Math.max(0, partido[campo] - 1);
        return { ...partido, [campo]: nuevoValor };
      }
      return partido;
    }));
  };

  const guardarPronostico = async (id) => {
    const partido = partidos.find(p => p.id === id);
    if (estaBloqueado(partido.fecha)) {
      alert("⚠️ Tiempo agotado. No puedes guardar pronósticos a menos de 2 horas del partido.");
      return;
    }

    try {
      const respuesta = await predictionService.guardar(partido.id, partido.golesL, partido.golesV);
      alert(respuesta.mensaje);
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  if (cargando) {
    return <div className="text-center py-4 text-secondary small">⚽ Abriendo las compuertas del estadio...</div>;
  }

  return (
    <div className="d-flex flex-column gap-3 w-100 mt-3">
      {partidos.map((partido) => {
        const bloqueado = estaBloqueado(partido.fecha);

        return (
          <div key={partido.id} className={`card bg-secondary bg-opacity-10 border-secondary text-white shadow-sm ${bloqueado ? 'opacity-75' : ''}`}>
            
            <div className="card-header bg-transparent border-secondary d-flex justify-content-between align-items-center py-2">
              <span className={`badge font-monospace small ${bloqueado ? 'bg-danger text-white' : 'bg-success bg-opacity-25 text-success border border-success border-opacity-20'}`}>
                {partido.fecha} {bloqueado ? '🔒 CERRADO' : '⏳ ACTIVO'}
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
                    <button 
                      disabled={bloqueado} 
                      onClick={() => modificarGoles(partido.id, 'local', 'menos')} 
                      className={`btn btn-sm btn-link fw-black p-0 px-2 text-decoration-none ${bloqueado ? 'text-muted' : 'text-secondary'}`}
                    >-</button>
                    <span className={`mx-1 fw-bold font-monospace ${bloqueado ? 'text-muted' : 'text-success'}`}>{partido.golesL}</span>
                    <button 
                      disabled={bloqueado} 
                      onClick={() => modificarGoles(partido.id, 'local', 'mas')} 
                      className={`btn btn-sm btn-link fw-black p-0 px-2 text-decoration-none ${bloqueado ? 'text-muted' : 'text-secondary'}`}
                    >+</button>
                  </div>
                </div>

                <div className="col-2 text-secondary fw-black small">VS</div>

                {/* Visitante */}
                <div className="col-5 d-flex flex-column align-items-center">
                  <span className="display-6 mb-1">{partido.banderaV}</span>
                  <span className="small fw-bold text-truncate w-100">{partido.visitante}</span>
                  
                  <div className="d-flex align-items-center justify-content-center bg-dark border border-secondary rounded mt-2 px-1 py-1" style={{ maxWidth: '90px' }}>
                    <button 
                      disabled={bloqueado} 
                      onClick={() => modificarGoles(partido.id, 'visitante', 'menos')} 
                      className={`btn btn-sm btn-link fw-black p-0 px-2 text-decoration-none ${bloqueado ? 'text-muted' : 'text-secondary'}`}
                    >-</button>
                    <span className={`mx-1 fw-bold font-monospace ${bloqueado ? 'text-muted' : 'text-success'}`}>{partido.golesV}</span>
                    <button 
                      disabled={bloqueado} 
                      onClick={() => modificarGoles(partido.id, 'visitante', 'mas')} 
                      className={`btn btn-sm btn-link fw-black p-0 px-2 text-decoration-none ${bloqueado ? 'text-muted' : 'text-secondary'}`}
                    >+</button>
                  </div>
                </div>

              </div>
            </div>

            <div className="card-footer bg-transparent border-top-0 pt-0 pb-3 px-3">
              <button 
                disabled={bloqueado}
                onClick={() => guardarPronostico(partido.id)} 
                className={`btn btn-sm w-100 fw-bold text-uppercase ${bloqueado ? 'btn-outline-danger' : 'btn-outline-success'}`}
              >
                {bloqueado ? '🔒 Pronósticos Cerrados' : '💾 Fijar Pronóstico'}
              </button>
            </div>

          </div>
        );
      })}
    </div>
  );
}