import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

export default function MatchFixture({ usuarioId }) {
  const [partidosTotales, setPartidosTotales] = useState([]);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [indiceFecha, setIndiceFecha] = useState(0);
  const [golesTemporales, setGolesTemporales] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardandoId, setGuardandoId] = useState(null);

  const [vistaActiva, setVistaActiva] = useState("activos");

  const uid = usuarioId && !isNaN(Number(usuarioId)) ? Number(usuarioId) : 1;

  useEffect(() => {
    const cargarFixture = async () => {
      try {
        setCargando(true);
        const respuesta = await api.get(`/matches?usuario_id=${uid}`);

        if (respuesta.data && Array.isArray(respuesta.data) && respuesta.data.length > 0) {
          setPartidosTotales(respuesta.data);

          const fechasUnicas = [...new Set(respuesta.data.map(p => {
            if (!p.fecha_hora) return "2026-06-11";
            return String(p.fecha_hora).substring(0, 10);
          }))].sort();

          setFechasDisponibles(fechasUnicas);

          const hoyISO = new Date().toISOString().substring(0, 10);
          const indexHoy = fechasUnicas.indexOf(hoyISO);
          setIndiceFecha(indexHoy !== -1 ? indexHoy : 0);

          const estadoInicialGoles = {};
          respuesta.data.forEach(p => {
            estadoInicialGoles[`${p.id}_local`] = p.golesL !== undefined ? p.golesL : 0;
            estadoInicialGoles[`${p.id}_visitante`] = p.golesV !== undefined ? p.golesV : 0;
          });
          setGolesTemporales(estadoInicialGoles);
        } else {
          setFechasDisponibles(["2026-06-11", "2026-06-12", "2026-06-13", "2026-06-14"]);
          setIndiceFecha(0);
        }
      } catch (error) {
        console.error("❌ Error al traer el fixture de Neon:", error);
        setFechasDisponibles(["2026-06-11", "2026-06-12", "2026-06-13", "2026-06-14"]);
      } finally {
        setCargando(false);
      }
    };
    cargarFixture();
  }, [usuarioId]);
  const irAtras = () => {
    if (indiceFecha > 0) setIndiceFecha(indiceFecha - 1);
  };

  const irSiguiente = () => {
    if (indiceFecha < fechasDisponibles.length - 1) setIndiceFecha(indiceFecha + 1);
  };

  const handleCambioGoles = (partidoId, campo, valor) => {
    const numero = valor === "" ? "" : Math.max(0, parseInt(valor) || 0);
    setGolesTemporales(prev => ({
      ...prev,
      [`${partidoId}_${campo}`]: numero
    }));
  };

  const guardarPronosticoEnBaseDeDatos = async (partidoId) => {
    const partidoActual = partidosTotales.find(p => p.id === partidoId);

    if (partidoActual && partidoActual.fecha_hora) {
      const ahora = new Date(); 
      const horaPartido = new Date(partidoActual.fecha_hora);
      const diferenciaMinutos = (horaPartido - ahora) / (1000 * 60);

      if (partidoActual.estado === 'en_vivo' || partidoActual.estado === 'terminado' || diferenciaMinutos < 10) {
        alert("⚠️ ¡Apuesta cerrada! El sistema bloquea las modificaciones 10 minutos antes del partido. 🚫");
        return;
      }
    }

    try {
      setGuardandoId(partidoId);

      const golesLocal = golesTemporales[`${partidoId}_local`] || 0;
      const golesVisitante = golesTemporales[`${partidoId}_visitante`] || 0;

      const payload = {
        usuario_id: uid,
        partido_id: partidoId,
        goles_local_pronostico: Number(golesLocal),
        goles_visitante_pronostico: Number(golesVisitante)
      };

      const respuesta = await api.post('/predictions', payload);

      if (respuesta.data && respuesta.data.status === "success") {
        alert("⚽ ¡Pronóstico guardado con éxito absoluto en Neon! 🔥");

        setPartidosTotales(prev => prev.map(p => {
          if (p.id === partidoId) {
            return { ...p, golesL: golesLocal, golesV: golesVisitante };
          }
          return p;
        }));
      }
    } catch (error) {
      console.error("❌ Error al almacenar el pronóstico:", error);
      alert("⚠️ Hubo un error de sincronización al conectar con Render.");
    } finally {
      setGuardandoId(null);
    }
  };
  if (cargando) {
    return (
      <div className="text-center py-5 font-monospace text-success small bg-dark bg-opacity-50 text-white rounded-4 border border-secondary my-3">
        <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
        ⚽ Sincronizando estadio con Neon...
      </div>
    );
  }

  const fechaActual = fechasDisponibles[indiceFecha] || "2026-06-11";

  const partidosDelDia = partidosTotales.filter(p => {
    if (!p.fecha_hora) return false;
    const pFechaLimpia = String(p.fecha_hora).substring(0, 10);
    if (pFechaLimpia !== fechaActual) return false;

    if (vistaActiva === "resultados") {
      return p.estado === "terminado" || p.goles_real_local !== null;
    }

    return p.estado === "programado" || p.estado === "en_vivo";
  });

  let fechaFormateadaVisual = fechaActual;
  try {
    const opcionesFecha = { day: 'numeric', month: 'long', timeZone: 'UTC' };
    fechaFormateadaVisual = new Date(fechaActual + "T00:00:00").toLocaleDateString('es-ES', opcionesFecha);
  } catch (e) {
    fechaFormateadaVisual = fechaActual;
  }
  return (
    <div className="p-1 text-white font-monospace" style={{ maxWidth: '100%' }}>

      <style>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
        .scroll-partidos::-webkit-scrollbar {
          width: 6px;
        }
        .scroll-partidos::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
          border-radius: 10px;
        }
        .scroll-partidos::-webkit-scrollbar-thumb {
          background: rgba(40, 167, 69, 0.4);
          border-radius: 10px;
        }
      `}</style>

      {/* Control Navegador de Jornadas */}
      <div className="d-flex justify-content-between align-items-center mb-3 bg-dark bg-opacity-70 p-2 rounded-3 border border-secondary shadow-sm" style={{ maxWidth: '500px', margin: '10px auto' }}>
        <button
          className="btn btn-sm btn-outline-success px-2 py-1 fw-bold text-white"
          onClick={irAtras}
          disabled={indiceFecha === 0}
        >
          ⬅️ Atrás
        </button>

        <div className="text-center">
          <div className="text-secondary tracking-wider mb-0" style={{ fontSize: '0.65rem' }}>
            JORNADA {indiceFecha + 1} / {fechasDisponibles.length}
          </div>
          <h6 className="mb-0 fw-bold text-success text-capitalize tracking-wide font-monospace">
            {fechaFormateadaVisual}
          </h6>
        </div>

        <button
          className="btn btn-sm btn-outline-success px-2 py-1 fw-bold text-white"
          onClick={irSiguiente}
          disabled={indiceFecha === fechasDisponibles.length - 1}
        >
          Siguiente ➡️
        </button>
      </div>
      <div className="row g-2 px-1 scroll-partidos" style={{ maxHeight: '310px', overflowY: 'auto', overflowX: 'hidden' }}>
        {partidosDelDia.length === 0 ? (
          <div className="text-center py-4 text-muted small bg-dark bg-opacity-50 rounded-3 border border-secondary border-opacity-30">
            📅 No hay partidos registrados para esta fecha.
          </div>
        ) : (
          partidosDelDia.map((partido) => {
            let horaStr = "00:00";
            if (partido.fecha_hora) {
              const d = new Date(partido.fecha_hora);
              horaStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            }

            const valLocal = golesTemporales[partido.id + "_local"] ?? "";
            const valVisitante = golesTemporales[partido.id + "_visitante"] ?? "";
            const estaGuardando = guardandoId === partido.id;
            const partidoBloqueado = partido.estado === 'en_vivo' || partido.estado === 'terminado';

            const obtenerCodigoSeguro = (nombre, banderaNeon) => {
              if (banderaNeon && String(banderaNeon).trim().length === 2) {
                return String(banderaNeon).trim().toLowerCase();
              }
              const n = String(nombre).trim().toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

              if (n === 'mexico') return 'mx';
              if (n === 'ecuador') return 'ec';
              if (n === 'canada') return 'ca';
              if (n === 'nigeria') return 'ng';
              if (n === 'australia') return 'au';
              if (n === 'suecia' || n === 'sweden') return 'se';
              if (n === 'irlanda' || n === 'republic of ireland') return 'ie';
              if (n === 'corea del sur' || n === 'south korea') return 'kr';
              if (n === 'estados unidos' || n === 'usa') return 'us';
              if (n === 'espana' || n === 'spain') return 'es';
              if (n === 'marruecos' || n === 'morocco') return 'ma';
              if (n === 'zambia') return 'zm';
              if (n === 'argentina') return 'ar';
              if (n === 'francia' || n === 'france') return 'fr';
              if (n === 'alemania' || n === 'germany') return 'de';
              if (n === 'paises bajos' || n === 'netherlands') return 'nl';
              if (n === 'brasil' || n === 'brazil') return 'br';
              if (n === 'italia' || n === 'italy') return 'it';
              if (n === 'japon' || n === 'japan') return 'jp';
              if (n === 'costa rica') return 'cr';
              if (n === 'belgica' || n === 'belgium') return 'be';
              if (n === 'croacia' || n === 'croatia') return 'hr';
              if (n === 'portugal') return 'pt';
              if (n === 'ghana') return 'gh';
              if (n === 'uruguay') return 'uy';
              if (n === 'inglaterra' || n === 'england') return 'gb-eng';
              if (n === 'colombia') return 'co';
              if (n === 'senegal') return 'sn';
              if (n === 'chile') return 'cl';
              if (n === 'dinamarca' || n === 'denmark') return 'dk';
              if (n === 'peru') return 'pe';
              if (n === 'suiza' || n === 'switzerland') return 'ch';
              if (n === 'paraguay') return 'py';
              if (n === 'camerun' || n === 'cameroon') return 'cm';
              if (n === 'venezuela') return 've';
              if (n === 'ucrania' || n === 'ukraine') return 'ua';
              return 'un';
            };

            const isoL = obtenerCodigoSeguro(partido.local, partido.banderaL);
            const isoV = obtenerCodigoSeguro(partido.visitante, partido.banderaV);
 return (
              <div key={partido.id} className="col-12 px-2">
                <div className="card shadow-sm border-0 border-start border-success border-3 bg-dark bg-opacity-60 text-white rounded-3 border border-secondary border-opacity-20 mb-1">
                  <div className="card-body p-2 font-monospace">

                    <div className="text-center text-secondary mb-2 d-flex justify-content-center align-items-center gap-2" style={{ fontSize: '0.65rem' }}>
                      <span>GRUPO {partido.grupo || 'A'} • 🕒 {horaStr} LOCAL</span>
                      {partido.estado === 'en_vivo' && (
                        <span className="badge bg-danger text-white animate-pulse px-1" style={{ fontSize: '0.55rem' }}>• EN VIVO</span>
                      )}
                    </div>

                    <div className="d-flex justify-content-between align-items-center px-1">
                      
                      {/* Local (Izquierda) */}
                      <div className="text-center flex-grow-1" style={{ width: '35%' }}>
                        <img
                          src={`https://flagcdn.com/w40/${isoL}.png`}
                          alt={partido.local}
                          className="rounded border border-secondary border-opacity-40 shadow-sm mb-1"
                          style={{ width: '26px', height: '17px', objectFit: 'cover' }}
                        />
                        <div className="fw-bold text-truncate text-light text-uppercase" style={{ fontSize: '0.72rem' }}>
                          {partido.local}
                        </div>
                      </div>

                      {/* Inputs / Marcador real (Centro) */}
                      <div className="d-flex flex-column align-items-center justify-content-center" style={{ width: '30%' }}>
                        <div className="d-flex align-items-center justify-content-center">
                          {vistaActiva === "resultados" ? (
                            <div className="d-flex align-items-center bg-black bg-opacity-50 px-2 py-0.5 rounded border border-secondary border-opacity-40 gap-2 fw-bold text-warning" style={{ fontSize: '1rem' }}>
                              <span>{partido.goles_real_local ?? 0}</span>
                              <span className="text-muted" style={{ fontSize: '0.7rem' }}>-</span>
                              <span>{partido.goles_real_visitante ?? 0}</span>
                            </div>
                          ) : (
                            <>
                              <input
                                type="number"
                                disabled={partidoBloqueado}
                                className="form-control form-control-sm text-center bg-dark text-success fw-bold p-0 border border-secondary"
                                style={{ width: '34px', fontSize: '0.95rem', height: '30px' }}
                                value={valLocal}
                                onChange={(e) => handleCambioGoles(partido.id, 'local', e.target.value)}
                              />
                              <span className="mx-1 text-secondary fw-bold small">-</span>
                              <input
                                type="number"
                                disabled={partidoBloqueado}
                                className="form-control form-control-sm text-center bg-dark text-success fw-bold p-0 border border-secondary"
                                style={{ width: '34px', fontSize: '0.95rem', height: '30px' }}
                                value={valVisitante}
                                onChange={(e) => handleCambioGoles(partido.id, 'visitante', e.target.value)}
                              />
                            </>
                          )}
                        </div>
                      </div>

                      {/* Visitante (Derecha) */}
                      <div className="text-center flex-grow-1" style={{ width: '35%' }}>
                        <img
                          src={`https://flagcdn.com/w40/${isoV}.png`}
                          alt={partido.visitante}
                          className="rounded border border-secondary border-opacity-40 shadow-sm mb-1"
                          style={{ width: '26px', height: '17px', objectFit: 'cover' }}
                        />
                        <div className="fw-bold text-truncate text-light text-uppercase" style={{ fontSize: '0.72rem' }}>
                          {partido.visitante}
                        </div>
                      </div>

                    </div>

                    {/* Auxiliar en vivo */}
                    {vistaActiva === "activos" && partido.estado === "en_vivo" && (
                      <div className="text-center text-emerald-400 fw-bold mt-2" style={{ fontSize: '0.7rem' }}>
                        Marcador Real FIFA: {partido.goles_real_local} - {partido.goles_real_visitante}
                      </div>
                    )}

                    {/* Botón guardar */}
                    {vistaActiva === "activos" && (
                      <div className="text-center mt-2 px-3">
                        {!partidoBloqueado ? (
                          <button
                            className="btn btn-sm btn-outline-success w-100 py-0.5 font-monospace fw-bold"
                            style={{ fontSize: '0.68rem', letterSpacing: '0.2px' }}
                            onClick={() => guardarPronosticoEnBaseDeDatos(partido.id)}
                            disabled={estaGuardando}
                          >
                            {estaGuardando ? "GUARDANDO..." : "💾 GUARDAR PRONÓSTICO"}
                          </button>
                        ) : (
                          <span className="text-muted italic bg-black bg-opacity-30 d-block py-0.5 rounded border border-secondary border-opacity-20" style={{ fontSize: '0.65rem' }}>🔒 APUESTA CERRADA</span>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}