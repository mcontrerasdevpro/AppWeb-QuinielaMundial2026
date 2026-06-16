import React, { useState } from 'react';
import MatchFixture from '../components/MatchFixture.jsx';
import Leaderboard from '../components/Leaderboard.jsx';
import Stats from '../components/Stats.jsx';
import FinishedMatches from '../components/FinishedMatches.jsx';

export default function Dashboard({ onLogout, userSession }) {
  const [activeTab, setActiveTab] = useState('partidos');
  const [subFiltroPartidos, setSubFiltroPartidos] = useState('activos');

  return (
    /* CORREGIDO: min-vh-65 y py-4 clonan la altura física y empaque responsivo de la Landing Page */
    <div className="w-100 font-monospace min-vh-65 d-flex flex-column justify-content-between py-4">

      {/* MARQUESINA SUPERIOR */}
      <div className="mb-2">
        <div className="text-center mb-3 text-uppercase small texto-parpadeante" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
          🏆 Q-MUNDIAL APP • ENTRADA OFICIAL DE PARTICIPANTES 🏆
        </div>

        {/* CABECERA DE USUARIO (Padding vertical ligeramente aumentado) */}
        <div className="d-flex justify-content-between align-items-center bg-dark bg-opacity-50 p-3 px-3 rounded-3 border border-secondary border-opacity-20 mb-3 shadow-sm">
          <div className="d-flex align-items-center gap-2">
            <span className="fs-5">🏆</span>
            <span className="fw-bold text-success small text-uppercase" style={{ fontSize: '12px' }}>
              HINCHA: {userSession?.nombre || 'SURVI'}
            </span>
          </div>
          <button onClick={onLogout} className="btn btn-sm btn-outline-danger border-0 fw-bold text-uppercase px-2 py-1" style={{ fontSize: '12px' }}>
            🚪 Salir
          </button>
        </div>

        {/* SELECTOR SUPERIOR (Con paddings incrementados para mayor presencia) */}
        {activeTab === 'partidos' && (
          <div className="d-flex gap-2 mb-4 bg-dark bg-opacity-40 p-1 rounded-3 border border-secondary border-opacity-20">
            <button
              type="button"
              onClick={() => setSubFiltroPartidos('activos')}
              className={`btn btn-sm w-50 fw-bold text-uppercase py-2.5 rounded-2 ${subFiltroPartidos === 'activos' ? 'btn-success text-dark shadow-sm' : 'btn-link text-secondary text-decoration-none'}`}
              style={{ fontSize: '12px' }}
            >
              ⏳ Activos
            </button>
            <button
              type="button"
              onClick={() => setSubFiltroPartidos('terminados')}
              className={`btn btn-sm w-50 fw-bold text-uppercase py-2.5 rounded-2 ${subFiltroPartidos === 'terminados' ? 'btn-warning text-dark shadow-sm' : 'btn-link text-secondary text-decoration-none'}`}
              style={{ fontSize: '12px' }}
            >
              🏁 Resultados
            </button>
          </div>
        )}
      </div>

      {/* CONTENEDOR PRINCIPAL EXPANSIBLE CON SCROLL INTERNO */}
      {/* flex-grow-1 y py-3 estiran dinámicamente las tarjetas de partidos hacia abajo */}
      <div className="flex-grow-1 overflow-y-auto mb-4 pe-1 py-3" style={{ minHeight: '380px' }}>
        
        {/* PESTAÑA 1: PARTIDOS */}
        {activeTab === 'partidos' && (
          <div>
            {subFiltroPartidos === 'activos' ? (
              <MatchFixture usuarioId={userSession?.id} />
            ) : (
              <FinishedMatches />
            )}
          </div>
        )}

        {/* PESTAÑA 2: RANKING */}
        {activeTab === 'ranking' && <Leaderboard usuarioLogueadoId={userSession?.id} />}

        {/* PESTAÑA 3: ESTADÍSTICAS */}
        {activeTab === 'stats' && <Stats />}

      </div>

      {/* NAV BAR INFERIOR FIJA (Mayor padding para empujar verticalmente la estructura) */}
      <div className="mt-2">
        <div className="nav nav-pills justify-content-around bg-dark bg-opacity-70 p-2 rounded-4 border border-secondary border-opacity-30 shadow-lg">
          <button
            onClick={() => { setActiveTab('partidos'); setSubFiltroPartidos('activos'); }}
            className={`nav-link d-flex flex-column align-items-center py-2.5 px-3 rounded-3 transition-all ${activeTab === 'partidos' ? 'active bg-success text-dark shadow-sm' : 'text-secondary bg-transparent'}`}
          >
            <span className="fs-4 mb-1">📅</span>
            <span className="fw-bold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>PARTIDOS</span>
          </button>

          <button
            onClick={() => setActiveTab('ranking')}
            className={`nav-link d-flex flex-column align-items-center py-2.5 px-3 rounded-3 transition-all ${activeTab === 'ranking' ? 'active bg-success text-dark shadow-sm' : 'text-secondary bg-transparent'}`}
          >
            <span className="fs-4 mb-1">🥇</span>
            <span className="fw-bold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>RANKING</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`nav-link d-flex flex-column align-items-center py-2.5 px-3 rounded-3 transition-all ${activeTab === 'stats' ? 'active bg-success text-dark shadow-sm' : 'text-secondary bg-transparent'}`}
          >
            <span className="fs-4 mb-1">📊</span>
            <span className="fw-bold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>STATS</span>
          </button>
        </div>
      </div>

    </div>
  );
}