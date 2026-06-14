import React, { useState, useEffect } from 'react';

export default function Leaderboard() {
    const [usuarios, setUsuarios] = useState([
        { id: 1, nombre: 'Survi', puntos: 15 },
        { id: 2, nombre: 'GolMundial', puntos: 12 },
        { id: 3, nombre: 'HinchaFiel', puntos: 9 },
        { id: 4, nombre: 'Maradona99', puntos: 6 },
        { id: 5, nombre: 'CR7_Fans', puntos: 3 }
    ]);

    return (
        <div className="w-100 mt-3 animate-fadeIn">
            <div className="card bg-secondary bg-opacity-10 border-secondary text-white shadow-sm">

                {/* Encabezado de la Tabla */}
                <div className="card-header bg-dark border-secondary py-2 text-center text-uppercase fw-bold font-monospace text-warning small">
                    🏆 Clasificación General 🏆
                </div>

                {/* Lista de Posiciones */}
                <div className="list-group list-group-flush bg-transparent">
                    {usuarios.map((user, index) => {
                        let medalla = '👤';
                        let colorClase = 'text-white';

                        if (index === 0) { medalla = '🥇'; colorClase = 'text-warning fw-bold'; }
                        else if (index === 1) { medalla = '🥈'; colorClase = 'text-light fw-bold'; }
                        else if (index === 2) { medalla = '🥉'; colorClase = 'text-info fw-bold'; }

                        return (
                            <div
                                key={user.id}
                                className="list-group-item bg-transparent border-secondary d-flex justify-content-between align-items-center py-3"
                            >
                                <div className="d-flex align-items-center gap-3">
                                    {/* Número de posición y medalla */}
                                    <span className="font-monospace text-secondary fw-bold" style={{ width: '20px' }}>
                                        {index + 1}
                                    </span>
                                    <span className="fs-5">{medalla}</span>
                                    <span className={`small ${colorClase}`}>{user.nombre}</span>
                                </div>

                                {/* Puntaje total */}
                                <span className="badge bg-dark border border-secondary text-success font-monospace px-3 py-2 fs-6">
                                    {user.puntos} pts
                                </span>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}