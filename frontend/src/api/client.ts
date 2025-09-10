import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// =============================================
// CONFIGURACIÓN DEL CLIENTE API
// =============================================

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://api.sharedmelody.com/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =============================================
// INTERCEPTOR DE SOLICITUDES
// =============================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Agregar token de autorización si está disponible
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Agregar timestamp para evitar cache
    if (config.params) {
      config.params._t = Date.now();
    } else {
      config.params = { _t: Date.now() };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =============================================
// INTERCEPTOR DE RESPUESTAS
// =============================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Manejar errores de autenticación
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Intentar renovar el token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${apiClient.defaults.baseURL}/auth/refresh`,
            { refreshToken }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Reintentar la solicitud original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Si falla la renovación, limpiar datos y redirigir
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Solo redirigir si no estamos ya en la página de login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    // Manejar otros errores HTTP
    if (error.response?.status === 403) {
      console.error('Acceso denegado:', error.response.data?.message);
    } else if (error.response?.status === 404) {
      console.error('Recurso no encontrado:', error.response.data?.message);
    } else if (error.response?.status >= 500) {
      console.error('Error del servidor:', error.response.data?.message);
    }

    return Promise.reject(error);
  }
);

// =============================================
// UTILIDADES DEL CLIENTE API
// =============================================

export const apiUtils = {
  // Configurar token de autorización
  setAuthToken: (token: string) => {
    localStorage.setItem('accessToken', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  // Limpiar token de autorización
  clearAuthToken: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete apiClient.defaults.headers.common['Authorization'];
  },

  // Obtener configuración base para uploads
  getUploadConfig: () => ({
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 300000, // 5 minutos para uploads
  }),

  // Manejar descarga de archivos
  downloadFile: async (url: string, filename?: string): Promise<void> => {
    try {
      const response = await apiClient.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      throw error;
    }
  },

  // Verificar conectividad
  checkConnectivity: async (): Promise<boolean> => {
    try {
      await apiClient.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }
};

export { apiClient };
export default apiClient;