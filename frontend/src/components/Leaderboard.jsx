import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

// Corregido: Se unifica la propiedad a 'usuarioId' para mantener consistencia con MatchFixture
export default function Leaderboard({ usuarioId }) {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Se convierte a número seguro para evitar problemas de tipos string/int en JS
  const uidLogueado = usuarioId && !isNaN(Number(usuarioId)) ? Number(usuarioId) : null;

  const obtenerRanking = async () => {
    try {
      const respuesta = await api.get('/ranking');
      setUsuarios(respuesta.data);
    } catch (error) {
      console.log("❌ Error al cargar la tabla de posiciones desde Render.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerRanking();
  }, []);

  const eliminarUsuario = async (id, nombre) => {
    const confirmar = window.confirm(`⚠️ ¿Estás seguro de que deseas eliminar permanentemente a "${nombre.toUpperCase()}" de la Quiniela?`);
    if (!confirmar) return;

    try {
      await api.delete(`/usuarios/${id}`);
      alert("🗑️ ¡Usuario borrado de Neon con éxito!");
      obtenerRanking(); // Recarga la tabla de inmediato tras la baja
    } catch (error) {
      alert(`❌ Error al eliminar: ${error.message}`);
    }
  };

  if (cargando) {
    return <div className="text-center py-4 text-secondary small font-monospace">🥇 Calculando posiciones globales...</div>;
  }

  return (
    <div 
      className="w-100 mt-2 font-monospace pe-1"
      style={{ 
        maxHeight: '340px',       
        overflowY: 'auto',        
        overflowX: 'hidden'       
      }}
    >
      <div className="table-responsive bg-dark bg-opacity-50 rounded-3 border border-secondary border-opacity-30 p-2 shadow-lg">
        <table className="table table-dark table-hover table-borderless align-middle mb-0 text-center small">
          <thead>
            <tr className="text-secondary border-bottom border-secondary border-opacity-20" style={{ fontSize: '10px' }}>
              <th className="py-2" style={{ width: '15%' }}>POS</th>
              <th className="py-2 text-start" style={{ width: '45%' }}>HINCHA</th>
              <th className="py-2" style={{ width: '20%' }}>PTS</th>
              <th className="py-2" style={{ width: '20%' }}>ACCION</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user, index) => {
              let medalla = `${index + 1}°`;
              if (index === 0) medalla = "🥇";
              if (index === 1) medalla = "🥈";
              if (index === 2) medalla = "🥉";

              const esElMismo = user.id === uidLogueado;

              return (
                <tr key={user.id} className="border-bottom border-secondary border-opacity-10">
                  <td className="fw-bold text-warning py-2">{medalla}</td>
                  <td className="text-start fw-bold text-white py-2 text-uppercase text-truncate" style={{ maxWidth: '130px' }}>
                    {user.nombre}
                  </td>
                  <td className="fw-black text-success py-2" style={{ fontSize: '1rem' }}>{user.puntos}</td>
                  <td className="py-1">
                    {esElMismo ? (
                      <button
                        type="button"
                        onClick={() => eliminarUsuario(user.id, user.nombre)}
                        className="btn btn-xs btn-danger px-2 py-1 fw-bold font-monospace shadow-sm rounded-2"
                        style={{ fontSize: '9px', letterSpacing: '0.2px' }}
                      >
                        ❌ DARME DE BAJA
                      </button>
                    ) : (
                      <span className="text-muted opacity-25 font-monospace" style={{ fontSize: '11px' }}>•</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}