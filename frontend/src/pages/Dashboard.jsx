import React, { useState } from 'react';
import MatchFixture from '../components/MatchFixture.jsx';
import Leaderboard from '../components/Leaderboard.jsx';
import Stats from '../components/Stats.jsx';

export default function Dashboard({ onLogout }) {
    const [activeTab, setActiveTab] = useState('partidos');

    return (
        <div className="w-100">

            {/* Contenedor de las pestañas activas */}
            <div className="mb-4" style={{ minHeight: '380px' }}>
                {activeTab === 'partidos' && (
                    <div>
                        <div className="text-center bg-secondary bg-opacity-10 p-3 rounded-3 border border-secondary border-opacity-50">
                            <h6 className="text-success fw-bold mb-1">📅 Mis Pronósticos</h6>
                            <p className="small text-muted mb-0">Ajusta tus goles antes del inicio de cada partido.</p>
                        </div>
                        <MatchFixture />
                    </div>
                )}

                {activeTab === 'ranking' && (
                    <div>
                        <div className="text-center bg-secondary bg-opacity-10 p-3 rounded-3 border border-secondary border-opacity-50 mb-3">
                            <h6 className="text-warning fw-bold mb-1">🥇 Tabla de Posiciones</h6>
                            <p className="small text-muted mb-0">Comprueba quién va liderando la porra en vivo.</p>
                        </div>
                        <Leaderboard />
                    </div>
                )}

                {activeTab === 'estadisticas' && (
                    <div>
                        <div className="text-center bg-secondary bg-opacity-10 p-3 rounded-3 border border-secondary border-opacity-50 mb-3">
                            <h6 className="text-info fw-bold mb-1">📊 Estado del Torneo</h6>
                            <p className="small text-muted mb-0">Control de rendimiento y banderas de los clasificados.</p>
                        </div>
                        <Stats />
                    </div>
                )}
            </div>

            {/* Menú inferior de navegación táctil con botones de Bootstrap */}
            <nav className="nav nav-pills nav-justified bg-dark p-1 rounded-3 border border-secondary shadow sticky-bottom">
                <button
                    onClick={() => setActiveTab('partidos')}
                    className={`nav-link text-uppercase fw-bold small py-2 d-flex flex-column align-items-center ${activeTab === 'partidos' ? 'active btn-success bg-success text-dark' : 'text-secondary'}`}
                >
                    <span className="fs-6">📅</span>
                    <span style={{ fontSize: '10px' }}>Partidos</span>
                </button>
                <button
                    onClick={() => setActiveTab('ranking')}
                    className={`nav-link text-uppercase fw-bold small py-2 d-flex flex-column align-items-center ${activeTab === 'ranking' ? 'active btn-warning bg-warning text-dark' : 'text-secondary'}`}
                >
                    <span className="fs-6">🥇</span>
                    <span style={{ fontSize: '10px' }}>Ranking</span>
                </button>
                <button
                    onClick={() => setActiveTab('estadisticas')}
                    className={`nav-link text-uppercase fw-bold small py-2 d-flex flex-column align-items-center ${activeTab === 'estadisticas' ? 'active btn-info bg-info text-dark' : 'text-secondary'}`}
                >
                    <span className="fs-6">📊</span>
                    <span style={{ fontSize: '10px' }}>Stats</span>
                </button>
            </nav>

            {/* Salida de la app */}
            <div className="text-center mt-3">
                <button onClick={onLogout} className="btn btn-sm btn-link text-muted text-decoration-underline small" style={{ fontSize: '11px' }}>
                    Cerrar Sesión de Prueba
                </button>
            </div>

        </div>
    );
}