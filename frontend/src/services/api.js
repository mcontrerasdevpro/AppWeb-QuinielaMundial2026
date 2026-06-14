import axios from 'axios';

const API_URL = 'https://appweb-quinielamundial2026.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  registrar: async (nombre, email, password) => {
    try {
      // CORREGIDO: Ruta completa sin mutilaciones
      const response = await api.post('/auth/register', {
        nombre,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      const mensajeError = error.response?.data?.detail || 'Error en el servidor';
      throw new Error(mensajeError);
    }
  },

  login: async (email, password) => {
    try {
      // CORREGIDO: Ruta completa sin mutilaciones
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      const mensajeError = error.response?.data?.detail || 'Error en el inicio de sesión';
      throw new Error(mensajeError);
    }
  }
};

export const matchService = {
  obtenerPartidos: async () => {
    try {
      // CORREGIDO: Ruta completa
      const response = await api.get('/matches');
      return response.data;
    } catch (error) {
      throw new Error('No se pudieron cargar los partidos del Mundial.');
    }
  }
};

export const predictionService = {
  guardar: async (partidoId, golesLocal, golesVisitante) => {
    try {
      // CORREGIDO: Ruta completa
      const response = await api.post('/predictions', {
        partido_id: partidoId,
        goles_local_pronostico: golesLocal,
        goles_visitante_pronostico: golesVisitante
      });
      return response.data;
    } catch (error) {
      throw new Error('No se pudo conectar con el servidor para guardar tu apuesta.');
    }
  }
};

export default api;