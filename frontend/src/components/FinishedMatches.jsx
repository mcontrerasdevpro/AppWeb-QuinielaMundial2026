import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

export default function FinishedMatches() {
  const [terminados, setTerminados] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarTerminados = async () => {
      try {
        const respuesta = await api.get('/matches');
        
        if (respuesta.data && Array.isArray(respuesta.data)) {
          const filtrados = respuesta.data.filter(p => 
            p.golesL !== null && 
            p.golesL !== undefined && 
            p.golesL !== ""
          );
          setTerminados(filtrados);
        }
      } catch (error) {
        console.error("❌ Error al traer los resultados:", error);
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
    if (n === 'ecuador') return 'ec';
    if (n === 'canada') return 'ca';
    if (n === 'nigeria') return 'ng';
    if (n === 'australia') return 'au';
    if (n === 'suecia') return 'se';
    if (n === 'irlanda') return 'ie';
    if (n === 'corea del sur') return 'kr';
    if (n === 'estados unidos') return 'us';
    if (n === 'espana') return 'es';
    if (n === 'marruecos') return 'ma';
    if (n === 'zambia') return 'zm';
    if (n === 'argentina') return 'ar';
    if (n === 'francia') return 'fr';
    if (n === 'alemania') return 'de';
    if (n === 'paises bajos') return 'nl';
    if (n === 'brasil') return 'br';
    if (n === 'italia') return 'it';
    if (n === 'japon') return 'jp';
    if (n === 'costa rica') return 'cr';
    if (n === 'belgica') return 'be';
    if (n === 'croacia') return 'hr';
    if (n === 'portugal') return 'pt';
    if (n === 'ghana') return 'gh';
    if (n === 'uruguay') return 'uy';
    if (n === 'inglaterra') return 'gb-eng';
    if (n === 'colombia') return 'co';
    if (n === 'senegal') return 'sn';
    if (n === 'chile') return 'cl';
    if (n === 'dinamarca') return 'dk';
    if (n === 'peru') return 'pe';
    if (n === 'suiza') return 'ch';
    if (n === 'paraguay') return 'py';
    if (n === 'camerun') return 'cm';
    if (n === 'venezuela') return 've';
    if (n === 'ucrania') return 'ua';
    return 'un';
  };

  if (cargando) {
    return (
      <div className="text-center py-4 font-monospace text-success small">
        <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
        ⚽ Conectando resultados con Neon...
      </div>
    );
  }

  if (terminados.length === 0) {
    return (
      <div className="text-center py-4 text-muted font-monospace my-2 bg-dark bg-opacity-50 rounded-3 border border-secondary">
        <p className="small mb-0 text-secondary text-uppercase" style={{ fontSize: '11px' }}>
          🏁 No hay partidos finalizados cargados todavía.
        </p>
      </div>
    );
  }

   return (
    <div className="d-flex flex-column gap-2 w-100 font-monospace" style={{ maxHeight: '330px', overflowY: 'auto' }}>
      {terminados.map((partido) => {
        const isoL = obtenerCodigoSeguro(partido.local, partido.banderaL);
        const isoV = obtenerCodigoSeguro(partido.visitante, partido.banderaV);

        return (
          <div key={partido.id} className="card shadow border-0 border-start border-warning border-3 bg-dark bg-opacity-50 text-white rounded-3 border border-secondary p-2">
            <div className="row align-items-center justify-content-between g-0">
              
              {/* Local */}
              <div className="col-4 text-center d-flex flex-column align-items-center justify-content-center">
                <img
                  src={`https://flagcdn.com/w40/${isoL}.png`}
                  alt={partido.local}
                  className="rounded border border-secondary shadow-sm mb-1"
                  style={{ width: '32px', height: '20px', objectFit: 'cover' }}
                />
                <div className="fw-bold text-truncate text-light w-100" style={{ fontSize: '0.8rem' }}>
                  {partido.local}
                </div>
              </div>

              {/* Marcador */}
              <div className="col-3 text-center d-flex justify-content-center align-items-center">
                <div className="d-flex align-items-center justify-content-center bg-black bg-opacity-50 border border-secondary rounded px-3 py-1 fw-bold text-warning h-100" style={{ fontSize: '1.1rem', minWidth: '70px' }}>
                  <span>{partido.goles_real_local ?? 0}</span>
                  <span className="text-muted mx-1">-</span>
                  <span>{partido.goles_real_visitante ?? 0}</span>
                </div>
              </div>

              {/* Visitante */}
              <div className="col-4 text-center d-flex flex-column align-items-center justify-content-center">
                <img
                  src={`https://flagcdn.com/w40/${isoV}.png`}
                  alt={partido.visitante}
                  className="rounded border border-secondary shadow-sm mb-1"
                  style={{ width: '32px', height: '20px', objectFit: 'cover' }}
                />
                <div className="fw-bold text-truncate text-light w-100" style={{ fontSize: '0.8rem' }}>
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