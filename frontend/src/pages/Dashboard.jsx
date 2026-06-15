import React, { useState } from 'react';
import MatchFixture from '../components/MatchFixture.jsx';
import Leaderboard from '../components/Leaderboard.jsx';
import Stats from '../components/Stats.jsx';
import FinishedMatches from '../components/FinishedMatches.jsx';

export default function Dashboard({ onLogout, userSession }) {
  const [activeTab, setActiveTab] = useState('partidos');
  const [subFiltroPartidos, setSubFiltroPartidos] = useState('activos');

  return (
    <div className="w-100 font-monospace">

      {/* CABECERA DE USUARIO */}
      <div className="d-flex justify-content-between align-items-center bg-dark bg-opacity-50 p-3 rounded-3 border border-secondary border-opacity-20 mb-3 shadow-sm">
        <div className="d-flex align-items-center gap-2">
          <span className="fs-5">🏆</span>
          <span className="fw-bold text-success small text-uppercase">HINCHA: {userSession?.nombre || 'SURVI'}</span>
        </div>
        <button onClick={onLogout} className="btn btn-sm btn-danger fw-bold text-uppercase px-3 py-2 shadow-sm">
          🔓 Salir
        </button>
      </div>

      {/* CONTENEDOR PRINCIPAL DINÁMICO */}
      <div className="mb-4" style={{ minHeight: '420px' }}>

        {/* PESTAÑA 1: PARTIDOS */}
        {activeTab === 'partidos' && (
          <div>
            {/* SELECTOR SUPERIOR */}
            <div className="d-flex gap-2 mb-3 bg-dark bg-opacity-40 p-1 rounded-3 border border-secondary border-opacity-20">
              <button
                type="button"
                onClick={() => setSubFiltroPartidos('activos')}
                className={`btn btn-sm w-50 fw-bold text-uppercase py-2 ${subFiltroPartidos === 'activos' ? 'btn-success text-dark' : 'btn-link text-secondary text-decoration-none'}`}
              >
                ⏳ Activos
              </button>
              <button
                type="button"
                onClick={() => setSubFiltroPartidos('terminados')}
                className={`btn btn-sm w-50 fw-bold text-uppercase py-2 ${subFiltroPartidos === 'terminados' ? 'btn-warning text-dark' : 'btn-link text-secondary text-decoration-none'}`}
              >
                🏁 Resultados
              </button>
            </div>

            {/* CONDICIONAL EXCLUSIVO */}
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

      {/* NAV BAR INFERIOR */}
        <div className="nav nav-pills justify-content-around bg-dark bg-opacity-70 p-2 rounded-4 border border-secondary border-opacity-30 shadow-lg">
          <button
            onClick={() => { setActiveTab('partidos'); setSubFiltroPartidos('activos'); }}
            className={`nav-link d-flex flex-column align-items-center py-2 px-3 rounded-3 transition-all ${activeTab === 'partidos' ? 'active bg-success text-dark' : 'text-secondary bg-transparent'}`}
          >
            <span className="fs-5 mb-1">📅</span>
            <span className="fw-bold" style={{ fontSize: '9px' }}>PARTIDOS</span>
          </button>

          <button
            onClick={() => setActiveTab('ranking')}
            className={`nav-link d-flex flex-column align-items-center py-2 px-3 rounded-3 transition-all ${activeTab === 'ranking' ? 'active bg-success text-dark' : 'text-secondary bg-transparent'}`}
          >
            <span className="fs-5 mb-1">🥇</span>
            <span className="fw-bold" style={{ fontSize: '9px' }}>RANKING</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`nav-link d-flex flex-column align-items-center py-2 px-3 rounded-3 transition-all ${activeTab === 'stats' ? 'active bg-success text-dark' : 'text-secondary bg-transparent'}`}
          >
            <span className="fs-5 mb-1">📊</span>
            <span className="fw-bold" style={{ fontSize: '9px' }}>STATS</span>
          </button>
        </div>

      </div>
      );
}