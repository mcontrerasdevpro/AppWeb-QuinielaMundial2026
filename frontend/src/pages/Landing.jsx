import React, { useState } from 'react';
import { authService } from '../services/api.js';

export default function Landing({ onRegisterSuccess }) {
  const [showForm, setShowForm] = useState(false);
  const [modo, setModo] = useState('login'); 
  const [cargando, setCargando] = useState(false);
  
  const [formData, setFormData] = useState({ 
    nombre: '', 
    email: '', 
    confirmEmail: '', 
    password: '', 
    confirmPassword: '' 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (modo === 'registro') {
      if (formData.email !== formData.confirmEmail) {
        alert("⚠️ Los correos electrónicos ingresados no coinciden.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert("⚠️ Las contraseñas ingresadas no coinciden.");
        return;
      }

      setCargando(true);
      try {
        const respuestaRegistro = await authService.registrar(formData.nombre, formData.email, formData.password);
        alert("🚀 ¡Registro exitoso en la base de datos!");
        
        onRegisterSuccess({ id: respuestaRegistro.id, nombre: respuestaRegistro.usuario });
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
        
        onRegisterSuccess({ id: respuestaLogin.id, nombre: respuestaLogin.usuario });
      } catch (error) {
        alert(`❌ Error al acceder: ${error.message}`);
      } finally {
        setCargando(false);
      }
    }
  };

  return (
    <div className="w-100">
      {/* Tarjeta Informativa Superior */}
      <div className="card bg-secondary bg-opacity-10 border-secondary mb-4 p-3 text-center rounded-3">
        <div className="fs-2 mb-1">🏆</div>
        <h6 className="text-success fw-bold mb-1">¡Demuestra tus conocimientos!</h6>
        <p className="text-secondary mb-0" style={{ fontSize: '12px' }}>
          Pronostica resultados, suma puntos en vivo y compite en tiempo real con tus amigos.
        </p>
      </div>

      {!showForm ? (
        <div className="text-center py-3">
          <p className="small text-secondary mb-3">Toca el balón oficial para ingresar al estadio:</p>
          <div 
            onClick={() => setShowForm(true)}
            className="d-inline-flex bg-light text-dark rounded-circle justify-content-center align-items-center animacion-balon border border-success border-4"
            style={{ width: '90px', height: '90px', cursor: 'pointer', fontSize: '2.2rem' }}
          >
            ⚽
          </div>
          <p className="small text-success fw-bold text-uppercase mt-3 tracking-wide">¡HACER CLIC PARA JUGAR!</p>
        </div>
      ) : (
        <div className="position-relative p-1">
          <button 
            type="button" 
            className="btn-close btn-close-white position-absolute top-0 end-0 m-2 small"
            onClick={() => setShowForm(false)}
            style={{ zIndex: '20' }}
          ></button>

          {/* BOTONERA SELECTORA DE MODO DE ACCESO */}
          <div className="d-flex justify-content-center mb-3 mt-2">
            <div className="btn-group w-100 border border-secondary rounded-3 p-1 bg-dark">
              <button 
                type="button"
                className={`btn btn-sm fw-bold text-uppercase py-2 rounded-2 ${modo === 'login' ? 'btn-success text-dark' : 'btn-outline-secondary text-white border-0'}`}
                onClick={() => setModo('login')}
              >
                🔐 Iniciar Sesión
              </button>
              <button 
                type="button"
                className={`btn btn-sm fw-bold text-uppercase py-2 rounded-2 ${modo === 'registro' ? 'btn-success text-dark' : 'btn-outline-secondary text-white border-0'}`}
                onClick={() => setModo('registro')}
              >
                🎟️ Registrarme
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="d-flex flex-column gap-2">
            
            {/* Campo exclusivo de Registro */}
            {modo === 'registro' && (
              <div className="mb-2">
                <label className="text-success fw-bold mb-1" style={{ fontSize: '11px' }}>Apodo de Hincha</label>
                <input type="text" name="nombre" required placeholder="Ej: ElReyDelGol" className="form-control form-control-sm bg-dark text-white border-secondary" onChange={handleChange}/>
              </div>
            )}

            <div className="mb-2">
              <label className="text-success fw-bold mb-1" style={{ fontSize: '11px' }}>Correo Electrónico</label>
              <input type="email" name="email" required placeholder="hincha@mundial.com" className="form-control form-control-sm bg-dark text-white border-secondary" onChange={handleChange}/>
            </div>

            {/* Campo exclusivo de Registro */}
            {modo === 'registro' && (
              <div className="mb-2">
                <label className="text-success fw-bold mb-1" style={{ fontSize: '11px' }}>Confirmar Correo</label>
                <input type="email" name="confirmEmail" required placeholder="hincha@mundial.com" className="form-control form-control-sm bg-dark text-white border-secondary" onChange={handleChange}/>
              </div>
            )}

            <div className="mb-2">
              <label className="text-success fw-bold mb-1" style={{ fontSize: '11px' }}>Contraseña</label>
              <input type="password" name="password" required placeholder="••••••••" className="form-control form-control-sm bg-dark text-white border-secondary" onChange={handleChange}/>
            </div>

            {/* Campo exclusivo de Registro */}
            {modo === 'registro' && (
              <div className="mb-3">
                <label className="text-success fw-bold mb-1" style={{ fontSize: '11px' }}>Confirmar Contraseña</label>
                <input type="password" name="confirmPassword" required placeholder="••••••••" className="form-control form-control-sm bg-dark text-white border-secondary" onChange={handleChange}/>
              </div>
            )}

            <button type="submit" disabled={cargando} className="btn btn-success btn-sm w-100 fw-bold text-uppercase py-2 shadow-sm mt-2">
              {cargando ? '⚽ Procesando...' : modo === 'login' ? '🔐 Entrar al Estadio' : '⚽ Registrarme y Jugar'}
            </button>
            
          </form>
        </div>
      )}
    </div>
  );
}