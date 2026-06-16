import React, { useState } from 'react';
import { authService } from '../services/api.js';

export default function Landing({ onRegisterSuccess }) {
  const [showForm, setShowForm] = useState(false);
  const [modo, setModo] = useState('login'); 
  const [cargando, setCargando] = useState(false);
  
  const [formData, setFormData] = useState({ 
    nombre: '', 
    email: '', 
    password: '' 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (modo === 'registro') {
      setCargando(true);
      try {
        const respuestaRegistro = await authService.registrar(formData.nombre, formData.email, formData.password);
        alert("🚀 ¡Registro exitoso! Revisa tu correo electrónico para confirmar tu cuenta.");
        
        // SOLUCIÓN AL CRASH: Validamos de forma segura los campos que vengan de la API
        if (respuestaRegistro) {
          onRegisterSuccess({ 
            id: respuestaRegistro.id || 999, 
            nombre: respuestaRegistro.nombre || formData.nombre 
          });
        }
      } catch (error) {
        alert(`❌ Error al registrar: ${error.message}`);
      } finally {
        setCargando(false);
      }
    } else {
      setCargando(true);
      try {
        const respuestaLogin = await authService.login(formData.email, formData.password);
        alert("⚽ ¡Acceso concedido! Bienvenido de vuelta al estadio.");
        
        if (respuestaLogin) {
          onRegisterSuccess({ 
            id: respuestaLogin.id || 999, 
            nombre: respuestaLogin.usuario || respuestaLogin.nombre || 'Hincha' 
          });
        }
      } catch (error) {
        alert(`❌ Error al acceder: ${error.message}`);
      } finally {
        setCargando(false);
      }
    }
  };

  return (
    <div className="w-100 d-flex flex-column justify-content-between min-vh-65 py-4">
      
      {/* Zona Superior: Tarjeta Informativa */}
      <div className="mb-4">
        <div className="card bg-dark bg-opacity-20 border-secondary p-4 p-md-5 text-center rounded-3 shadow-lg">
          <div className="fs-1 mb-2">🏆</div>
          <h4 className="text-success fw-bold mb-3 font-monospace">¡Demuestra tus conocimientos!</h4>
          <p className="text-secondary mb-0 fs-6" style={{ lineHeight: '1.5' }}>
            Pronostica resultados, suma puntos en vivo y compite en tiempo real con tus amigos.
          </p>
        </div>
      </div>

      {/* Zona Central: Contenido variable estirado verticalmente */}
      <div className="flex-grow-1 d-flex flex-column justify-content-center py-4">
        {!showForm ? (
          <div className="text-center py-5">
            <p className="fs-5 text-secondary mb-5 font-monospace">Toca el balón oficial para ingresar al estadio:</p>
            <div 
              onClick={() => setShowForm(true)}
              className="d-inline-flex bg-light text-dark rounded-circle justify-content-center align-items-center animacion-balon border border-success border-4 shadow-lg my-3"
              style={{ width: '120px', height: '120px', cursor: 'pointer', fontSize: '3.5rem', transition: 'transform 0.2s' }}
            >
              ⚽
            </div>
            <p className="fs-5 text-success fw-bold text-uppercase mt-5 tracking-wide texto-parpadeante">
              ¡HACER CLIC PARA JUGAR!
            </p>
          </div>
        ) : (
          <div className="px-1">          
            {/* BOTONERA SELECTORA DE MODO DE ACCESO */}
            <div className="d-flex justify-content-center mb-5">
              <div className="btn-group w-100 border border-secondary rounded-3 p-1 bg-black bg-opacity-40">
                <button 
                  type="button"
                  className={`btn btn-sm fw-bold text-uppercase py-3 rounded-2 font-monospace ${modo === 'login' ? 'btn-success text-dark shadow-sm' : 'btn-outline-secondary text-white border-0'}`}
                  onClick={() => setModo('login')}
                >
                  🔐 Iniciar Sesión
                </button>
                <button 
                  type="button"
                  className={`btn btn-sm fw-bold text-uppercase py-3 rounded-2 font-monospace ${modo === 'registro' ? 'btn-success text-dark shadow-sm' : 'btn-outline-secondary text-white border-0'}`}
                  onClick={() => setModo('registro')}
                >
                  🎟️ Registrarme
                </button>
              </div>
            </div>
            
            {/* FORMULARIO ADAPTADO */}
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-4" autoComplete="off">
              
              {modo === 'registro' && (
                <div>
                  <label className="text-success fw-bold mb-2 font-monospace fs-6">Apodo de Hincha</label>
                  <input 
                    type="text" 
                    name="nombre" 
                    required 
                    placeholder="Ej: ElReyDelGol" 
                    className="form-control form-control-lg bg-black text-white border-secondary py-3 px-3 fs-6" 
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>
              )}

              <div>
                <label className="text-success fw-bold mb-2 font-monospace fs-6">Correo Electrónico</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  placeholder="hincha@mundial.com" 
                  className="form-control form-control-lg bg-black text-white border-secondary py-3 px-3 fs-6" 
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="text-success fw-bold mb-2 font-monospace fs-6">Contraseña</label>
                <input 
                  type="text" 
                  name="password" 
                  required 
                  placeholder="••••••••" 
                  className="form-control form-control-lg bg-black text-white border-secondary py-3 px-3 fs-6" 
                  onChange={handleChange}
                  autoComplete="off"
                  style={{ WebkitTextSecurity: 'disc' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={cargando} 
                className="btn btn-success btn-lg w-100 fw-bold text-uppercase py-3 shadow-sm mt-4 font-monospace fs-6"
              >
                {cargando ? '⚽ Procesando...' : modo === 'login' ? '🔐 Entrar al Estadio' : '⚽ Registrarme y Jugar'}
              </button>

            </form>
          </div>
        )}
      </div>
    </div>
  );
}