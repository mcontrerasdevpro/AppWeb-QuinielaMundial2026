import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userSession, setUserSession] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      window.history.pushState(null, null, window.location.href);
      const handlePopState = () => {
        window.history.pushState(null, null, window.location.href);
        alert("🔒 Sesión cerrada. Debes iniciar sesión para volver a entrar al estadio.");
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = (userData) => {
    setUserSession(userData);
    setIsAuthenticated(true);
    window.history.pushState(null, null, window.location.href);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserSession(null); 
    window.history.replaceState(null, null, window.location.href);
    alert("👋 Saliste del estadio. ¡Vuelve pronto!");
  };

  return (
    <div className="container-fluid min-vh-screen d-flex flex-column justify-content-between p-3 py-4">
      <header className="text-center my-3">
        <h1 className="display-5 fw-black text-success tracking-wider text-uppercase font-monospace">
          QUINIELA MUNDIAL 2026
        </h1>
        <span className="badge rounded-pill bg-dark border border-secondary px-3 py-2 text-tracking mt-1">
          ACTUALIZACIONES AL INSTANTE ⚡
        </span>
      </header>

      <main className="row justify-content-center flex-grow-1 align-items-center my-4">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="bg-dark bg-opacity-75 text-white p-4 rounded-4 shadow-lg border border-secondary">
            {!isAuthenticated ? (
              <Landing onRegisterSuccess={handleLoginSuccess} />
            ) : (
              <Dashboard onLogout={handleLogout} userSession={userSession} />
            )}
          </div>
        </div>
      </main>

      <footer className="text-center text-secondary small my-2">
        🏆 Q-MUNDIAL APP • ENTRADA OFICIAL DE PARTICIPANTES 🏆
      </footer>
    </div>
  );
}

export default App;