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

          // Obtiene las fechas reales del calendario de Neon (A partir del 15 de Junio)
          const fechasUnicas = [...new Set(respuesta.data.map(p => {
            if (!p.fecha_hora) return "2026-06-15";
            return String(p.fecha_hora).replace('T', ' ').trim().substring(0, 10);
          }))].sort();

          setFechasDisponibles(fechasUnicas);
          
          // CORRECCIÓN CLAVE: Posiciona automáticamente la app en la jornada real activa
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
          setFechasDisponibles(["2026-06-15", "2026-06-16", "2026-06-17", "2026-06-18"]);
          setIndiceFecha(0);
        }
      } catch (error) {
        console.error("❌ Error al traer el fixture de Neon:", error);
        setFechasDisponibles(["2026-06-15", "2026-06-16", "2026-06-17", "2026-06-18"]);
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

  const fechaActual = fechasDisponibles[indiceFecha] || "2026-06-15";

  const partidosDelDia = partidosTotales.filter(p => {
    if (!p.fecha_hora) return false;
    const pFechaLimpia = String(p.fecha_hora).replace('T', ' ').trim().substring(0, 10);
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
      `}</style>

      {/* Selector Único de Vistas (Se eliminó el bloque amarillo duplicado) */}
      <div className="d-flex justify-content-center mb-3 bg-dark p-1 rounded-3 border border-secondary">
        <button 
          className={`btn btn-sm flex-fill fw-bold ${vistaActiva === "activos" ? "btn-success text-white" : "btn-dark text-secondary"}`}
          onClick={() => setVistaActiva("activos")}
        >
          ⌛ ACTIVOS
        </button>
        <button 
          className={`btn btn-sm flex-fill fw-bold ${vistaActiva === "resultados" ? "btn-success text-white" : "btn-dark text-secondary"}`}
          onClick={() => setVistaActiva("resultados")}
        >
          🏁 RESULTADOS
        </button>
      </div>

      {/* Navegación por jornadas */}
      <div className="d-flex justify-content-between align-items-center mb-3 bg-dark bg-opacity-70 p-3 rounded-3 border border-secondary shadow">
        <button
          className="btn btn-success px-3 py-2 fw-bold text-white border border-light border-opacity-20 shadow-sm"
          onClick={irAtras}
          disabled={indiceFecha === 0}
          style={{ minWidth: '95px' }}
        >
          ⬅️ Atrás
        </button>

        <div className="text-center">
          <div className="text-secondary small tracking-wider mb-1" style={{ fontSize: '0.75rem' }}>
            JORNADA {indiceFecha + 1} / {fechasDisponibles.length}
          </div>
          <h5 className="mb-0 fw-black text-success text-capitalize tracking-wide font-monospace text-shadow-sm">
            {fechaFormateadaVisual}
          </h5>
        </div>

        <button
          className="btn btn-success px-3 py-2 fw-bold text-white border border-light border-opacity-20 shadow-sm"
          onClick={irSiguiente}
          disabled={indiceFecha === fechasDisponibles.length - 1}
          style={{ minWidth: '95px' }}
        >
          Siguiente ➡️
        </button>
      </div>

      {/* Contenedor del listado de tarjetas */}
      <div className="row g-2 px-1" style={{ maxHeight: '330px', overflowY: 'auto' }}>
        {partidosDelDia.length === 0 ? (
          <div className="text-center py-4 text-muted small bg-dark bg-opacity-50 rounded-3 border border-secondary">
            📅 No hay partidos registrados para esta fecha.
          </div>
        ) : (
          partidosDelDia.map((partido) => {
            let horaStr = "00:00";
            const strCompleto = String(partido.fecha_hora).replace('T', ' ').trim();
            if (strCompleto.length >= 16) {
              horaStr = strCompleto.substring(11, 16);
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

            const isoL = obtenerCodigoSeguro(partido.local, partido.banderaL);
            const isoV = obtenerCodigoSeguro(partido.visitante, partido.banderaV);

            return (
              <div key={partido.id} className="col-12">
                <div className="card shadow border-0 border-start border-success border-3 bg-dark bg-opacity-50 text-white rounded-3 border border-secondary">
                  <div className="card-body p-2 pb-3">

                    <div className="text-center text-secondary mb-1 d-flex justify-content-center align-items-center gap-2" style={{ fontSize: '0.7rem' }}>
                      <span>GRUPO {partido.grupo || 'U'} • 🕒 {horaStr} HS</span>
                      {partido.estado === 'en_vivo' && (
                        <span className="badge bg-danger text-white font-monospace animate-pulse px-1" style={{ fontSize: '0.6rem' }}>• EN VIVO</span>
                      )}
                    </div>

                    <div className="d-flex justify-content-between align-items-center px-1 mb-2">

                      {/* Local */}
                      <div className="text-center flex-grow-1" style={{ width: '35%' }}>
                        <img
                          src={`https://flagcdn.com/w40/${isoL}.png`}
                          alt={partido.local}
                          className="rounded border border-secondary shadow-sm mb-1"
                          style={{ width: '32px', height: '20px', objectFit: 'cover' }}
                        />
                        <div className="fw-bold text-truncate text-light" style={{ fontSize: '0.8rem' }}>
                          {partido.local}
                        </div>
                      </div>

                      {/* Marcadores e Inputs Reactivos */}
                      <div className="d-flex align-items-center justify-content-center px-1" style={{ width: '30%' }}>
                        {vistaActiva === "resultados" ? (
                          <div className="d-flex align-items-center bg-black bg-opacity-40 px-2 py-1 rounded border border-secondary gap-2 fw-bold text-warning" style={{ fontSize: '1.1rem' }}>
                            <span>{partido.goles_real_local ?? 0}</span>
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>-</span>
                            <span>{partido.goles_real_visitante ?? 0}</span>
                          </div>
                        ) : (
                          <>
                            <input
                              type="number"
                              disabled={partidoBloqueado}
                              className="form-control form-control-sm text-center bg-dark text-success fw-bold p-1 border border-secondary"
                              style={{ width: '38px', fontSize: '1rem', height: '34px' }}
                              value={valLocal}
                              onChange={(e) => handleCambioGoles(partido.id, 'local', e.target.value)}
                            />
                            <span className="mx-1 text-secondary fw-bold">-</span>
                            <input
                              type="number"
                              disabled={partidoBloqueado}
                              className="form-control form-control-sm text-center bg-dark text-success fw-bold p-1 border border-secondary"
                              style={{ width: '38px', fontSize: '1rem', height: '34px' }}
                              value={valVisitante}
                              onChange={(e) => handleCambioGoles(partido.id, 'visitante', e.target.value)}
                            />
                          </>
                        )}
                      </div>

                      {/* Visitante */}
                      <div className="text-center flex-grow-1" style={{ width: '35%' }}>
                        <img
                          src={`https://flagcdn.com/w40/${isoV}.png`}
                          alt={partido.visitante}
                          className="rounded border border-secondary shadow-sm mb-1"
                          style={{ width: '32px', height: '20px', objectFit: 'cover' }}
                        />
                        <div className="fw-bold text-truncate text-light" style={{ fontSize: '0.8rem' }}>
                          {partido.visitante}
                        </div>
                      </div>

                    </div>

                    {/* Alerta de marcador en vivo en la pestaña activos */}
                    {vistaActiva === "activos" && partido.estado === "en_vivo" && (
                      <div className="text-center text-emerald-400 small font-bold mb-2" style={{ fontSize: '0.75rem' }}>
                        Marcador Real: {partido.goles_real_local} - {partido.goles_real_visitante}
                      </div>
                    )}

                    {/* Botón dinámico de Guardar / Bloqueado */}
                    {vistaActiva === "activos" && (
                      <div className="text-center mt-2 px-4">
                        {!partidoBloqueado ? (
                          <button
                            className="btn btn-outline-success btn-sm w-100 py-1 font-monospace fw-bold"
                            style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}
                            onClick={() => guardarPronosticoEnBaseDeDatos(partido.id)}
                            disabled={estaGuardando}
                          >
                            {estaGuardando ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                Guardando...
                              </>
                            ) : "💾 GUARDAR PRONÓSTICO"}
                          </button>
                        ) : (
                          <span className="text-xs text-muted italic bg-black bg-opacity-20 d-block py-1 rounded border border-secondary border-opacity-50">🔒 Apuestas cerradas</span>
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