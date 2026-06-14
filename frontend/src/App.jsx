import React, { useState } from 'react';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="container-fluid min-vh-screen d-flex flex-column justify-content-between p-3 py-4">
      
      {/* Encabezado centrado */}
      <header className="text-center my-3">
        <h1 className="display-5 fw-black text-success tracking-wider text-uppercase font-monospace">
          QUINIELA MUNDIAL 2026
        </h1>
        <span className="badge rounded-pill bg-dark border border-secondary px-3 py-2 text-tracking mt-1">
          ACTUALIZACIONES AL INSTANTE ⚡
        </span>
      </header>

      {/* Cuerpo principal ajustable para PC y Móvil */}
      <main className="row justify-content-center flex-grow-1 align-items-center my-4">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="bg-dark bg-opacity-75 text-white p-4 rounded-4 shadow-lg border border-secondary">
            {!isAuthenticated ? (
              <Landing onRegisterSuccess={() => setIsAuthenticated(true)} />
            ) : (
              <Dashboard onLogout={() => setIsAuthenticated(false)} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-secondary small my-2">
        🏆 Q-MUNDIAL APP • ENTRADA OFICIAL DE PARTICIPANTES 🏆
      </footer>
    </div>
  );
}

export default App;