import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

export default function Leaderboard() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerRanking = async () => {
      try {
        const respuesta = await api.get('/ranking');
        setUsuarios(respuesta.data);
      } catch (error) {
        console.log("Error al cargar la tabla de posiciones.");
      } finally {
        setCargando(false);
      }
    };
    obtenerRanking();
  }, []);

  if (cargando) {
    return <div className="text-center py-4 text-secondary small">🥇 Calculando posiciones globales...</div>;
  }

  return (
    <div className="w-100 mt-2 font-monospace">
      <div className="table-responsive bg-dark bg-opacity-50 rounded-3 border border-secondary border-opacity-30 p-2 shadow">
        <table className="table table-dark table-hover table-borderless align-middle mb-0 text-center small">
          <thead>
            <tr className="text-secondary border-bottom border-secondary border-opacity-20" style={{ fontSize: '10px' }}>
              <th className="py-2">POS</th>
              <th className="py-2 text-start">HINCHA</th>
              <th className="py-2">PTS</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user, index) => {
              let medalla = `${index + 1}°`;
              if (index === 0) medalla = "🥇";
              if (index === 1) medalla = "🥈";
              if (index === 2) medalla = "🥉";

              return (
                <tr key={user.id} className="border-bottom border-secondary border-opacity-10">
                  <td className="fw-bold text-warning py-2">{medalla}</td>
                  <td className="text-start fw-bold text-white py-2 text-uppercase">{user.nombre}</td>
                  <td className="fw-black text-success py-2">{user.puntos}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}