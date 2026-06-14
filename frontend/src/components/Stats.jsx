import React, { useState } from 'react';

export default function Stats() {
  // Simulación de equipos del Mundial 2026 y su estado de eliminación
  const [equipos, setEquipos] = useState([
    { id: 1, nombre: 'Argentina', bandera: '🇦🇷', eliminado: false, grupo: 'A' },
    { id: 2, nombre: 'España', bandera: '🇪🇸', eliminado: false, grupo: 'B' },
    { id: 3, nombre: 'México', bandera: '🇲🇽', eliminado: false, grupo: 'A' },
    { id: 4, nombre: 'Canadá', bandera: '🇨🇦', eliminado: true, grupo: 'A' },  // Eliminado de prueba
    { id: 5, nombre: 'Alemania', bandera: '🇩🇪', eliminado: true, grupo: 'B' } // Eliminado de prueba
  ]);

  return (
    <div className="w-100 mt-3 animate-fadeIn">
      <div className="card bg-secondary bg-opacity-10 border-secondary text-white shadow-sm">
        
        <div className="card-header bg-dark border-secondary py-2 text-center text-uppercase fw-bold font-monospace text-info small">
          📊 Monitoreo de Selecciones 📊
        </div>

        <div className="card-body p-3">
          <p className="text-secondary text-center mb-3" style={{ fontSize: '11px' }}>
            Los equipos eliminados oficialmente del torneo se muestran atenuados en escala de grises.
          </p>

          <div className="d-flex flex-column gap-2">
            {equipos.map((team) => (
              <div 
                key={team.id}
                className={`d-flex justify-content-between align-items-center p-2 rounded border border-opacity-25 ${
                  team.eliminado 
                    ? 'bg-danger bg-opacity-10 border-danger opacity-50 text-secondary' 
                    : 'bg-dark bg-opacity-50 border-secondary text-white'
                }`}
              >
                <div className="d-flex align-items-center gap-3">
                  <span className="fs-4">{team.bandera}</span>
                  <span className="small fw-bold">{team.nombre}</span>
                  {team.eliminado && (
                    <span className="badge bg-danger text-uppercase font-monospace" style={{ fontSize: '8px' }}>
                      Eliminado ❌
                    </span>
                  )}
                </div>
                
                <span className="badge bg-secondary bg-opacity-25 border border-secondary text-muted small">
                  Grupo {team.grupo}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}