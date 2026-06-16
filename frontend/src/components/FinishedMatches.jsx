import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

export default function FinishedMatches() {
  const [terminados, setTerminados] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarTerminados = async () => {
      try {

        {/* CORREGIDO: Cambiada la ruta /matches por /matches/finished */ }
        const respuesta = await api.get('/matches/finished');

        const datosPartidos = respuesta?.data?.data || respuesta?.data || [];

        if (Array.isArray(datosPartidos)) {
          const filtrados = datosPartidos.filter(p => {
            return p.estado === 'terminado' ||
              (p.goles_real_local !== null && p.goles_real_local !== undefined && p.goles_real_local !== "");
          });

          setTerminados(filtrados);
        }
      } catch (error) {
        console.error("❌ Error al traer los resultados oficiales:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarTerminados();
  }, []);

  const obtenerCodigoSeguro = (nombre, banderaNeon) => {
    if (banderaNeon && String(banderaNeon).trim().length === 2) {
      return String(banderaNeon).trim().toLowerCase();
    }
    const n = String(nombre).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (n === 'mexico') return 'mx';
    if (n === 'sudafrica') return 'za';
    if (n === 'corea del sur') return 'kr';
    if (n === 'republica checa') return 'cz';
    if (n === 'estados unidos') return 'us';
    if (n === 'paraguay') return 'py';
    if (n === 'qatar') return 'qa';
    if (n === 'suiza') return 'ch';
    if (n === 'brasil') return 'br';
    if (n === 'marruecos') return 'ma';
    if (n === 'haiti') return 'ht';
    if (n === 'escocia') return 'gb-sct';
    if (n === 'australia') return 'au';
    if (n === 'turquia') return 'tr';
    if (n === 'alemania') return 'de';
    if (n === 'curacao') return 'cw';
    if (n === 'paises bajos') return 'nl';
    if (n === 'japon') return 'jp';
    if (n === 'canada') return 'ca';
    if (n === 'bosnia herzegovina' || n === 'bosnia') return 'ba';
    return 'un';
  };

  if (cargando) {
    return (
      <div className="text-center py-5 font-monospace text-success small">
        <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
        ⚽ Sincronizando marcadores con Neon...
      </div>
    );
  }

  if (terminados.length === 0) {
    return (
      /* CORRECCIÓN DE ALTURA: Añadido py-5 y márgenes para empujar la estructura vertical al mismo tamaño que la Landing */
      <div className="text-center py-5 text-muted font-monospace my-3 bg-dark bg-opacity-30 rounded-3 border border-secondary border-opacity-30 p-4 shadow-lg">
        <div className="fs-3 mb-2">🏁</div>
        <p className="small mb-0 text-secondary text-uppercase tracking-wider" style={{ fontSize: '12px', lineHeight: '1.5' }}>
          No hay partidos registrados de jornadas anteriores o falta cargar resultados en la Base de Datos.
        </p>
      </div>
    );
  }

  return (
    /* ALTURA AJUSTADA RESPONSIVA: Subido de 330px a min-vh-50 con gap-3 para que las tarjetas respiren */
    <div className="d-flex flex-column gap-3 w-100 font-monospace py-2" style={{ minHeight: '400px' }}>
      {terminados.map((partido) => {
        const isoL = obtenerCodigoSeguro(partido.local, partido.banderaL);
        const isoV = obtenerCodigoSeguro(partido.visitante, partido.banderaV);

        return (
          /* DISEÑO PREMIUM ACORDE AL DASHBOARD: Mayor padding vertical (p-3) y efecto de sombra */
          <div key={partido.id} className="card shadow-lg border-0 border-start border-warning border-4 bg-dark bg-opacity-40 text-white rounded-3 border border-secondary border-opacity-20 p-3 transition-all">
            <div className="row align-items-center justify-content-between g-0">

              {/* Local */}
              <div className="col-4 text-center d-flex flex-column align-items-center justify-content-center">
                <img
                  src={`https://flagcdn.com/w40/${isoL}.png`}
                  alt={partido.local}
                  className="rounded border border-secondary border-opacity-40 shadow mb-2"
                  style={{ width: '38px', height: '24px', objectFit: 'cover' }}
                />
                <div className="fw-bold text-truncate text-light w-100" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                  {partido.local}
                </div>
              </div>

              {/* Marcador Real Estilizado */}
              <div className="col-3 text-center d-flex justify-content-center align-items-center">
                <div className="d-flex align-items-center justify-content-center bg-black bg-opacity-60 border border-secondary border-opacity-40 rounded px-3 py-2 fw-bold text-warning" style={{ fontSize: '1.25rem', minWidth: '85px', letterSpacing: '1px' }}>
                  <span>{partido.goles_real_local ?? 0}</span>
                  <span className="text-muted mx-1.5 opacity-50">-</span>
                  <span>{partido.goles_real_visitante ?? 0}</span>
                </div>
              </div>

              {/* Visitante */}
              <div className="col-4 text-center d-flex flex-column align-items-center justify-content-center">
                <img
                  src={`https://flagcdn.com/w40/${isoV}.png`}
                  alt={partido.visitante}
                  className="rounded border border-secondary border-opacity-40 shadow mb-2"
                  style={{ width: '38px', height: '24px', objectFit: 'cover' }}
                />
                <div className="fw-bold text-truncate text-light w-100" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                  {partido.visitante}
                </div>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}