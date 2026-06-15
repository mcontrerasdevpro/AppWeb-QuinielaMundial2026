import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

export default function FinishedMatches() {
  const [terminados, setTerminados] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarTerminados = async () => {
      try {
        const respuesta = await api.get('/matches/finished');
        if (respuesta.data && Array.isArray(respuesta.data)) {
          setTerminados(respuesta.data);
        }
      } catch (error) {
        console.log("Historial vacío detectado.");
      } finally {
        setCargando(false);
      }
    };
    cargarTerminados();
  }, []);

  if (cargando) {
    return (
      <div className="text-center py-4 font-monospace text-secondary small">
        ⚽ Cargando resultados oficiales...
      </div>
    );
  }

  if (terminados.length === 0) {
    return (
      <div className="text-center py-4 text-muted font-monospace my-2">      
        <p className="small mb-0 text-secondary text-uppercase" style={{ fontSize: '11px' }}>
          El Mundial arranca hoy lunes. No hay partidos finalizados aún.
        </p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-2 w-100 font-monospace">
      {terminados.map((partido) => (
        <div key={partido.id} className="bg-dark bg-opacity-40 border border-secondary border-opacity-30 rounded-3 p-3 text-center">
          <div className="row align-items-center small">
            <div className="col-4 text-truncate fw-bold">{partido.banderaL} {partido.local}</div>
            <div className="col-4 bg-black bg-opacity-50 border border-secondary border-opacity-20 rounded py-1 fw-black text-warning">
              {partido.golesL} : {partido.golesV}
            </div>
            <div className="col-4 text-truncate fw-bold">{partido.banderaV} {partido.visitante}</div>
          </div>
        </div>
      ))}
    </div>
  );
}