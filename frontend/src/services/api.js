// Configuración de la API
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Helper para obtener el token
const getToken = () => localStorage.getItem('token');

// Helper para hacer peticiones
async function request(endpoint, options = {}) {
  const token = getToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ============ AUTH ============
export const authService = {
  async login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async registro(userData) {
    const data = await request('/auth/registro', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async getPerfil() {
    return request('/auth/perfil');
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated() {
    return !!getToken();
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// ============ CLIENTES ============
export const clientesService = {
  async listar() {
    return request('/clientes');
  },

  async obtener(id) {
    return request(`/clientes/${id}`);
  },

  async crear(cliente) {
    return request('/clientes', {
      method: 'POST',
      body: JSON.stringify(cliente)
    });
  },

  async actualizar(id, cliente) {
    return request(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cliente)
    });
  },

  async eliminar(id) {
    return request(`/clientes/${id}`, {
      method: 'DELETE'
    });
  }
};

// ============ VISITAS ============
export const visitasService = {
  async listar(filtros = {}) {
    const params = new URLSearchParams(filtros).toString();
    return request(`/visitas${params ? `?${params}` : ''}`);
  },

  async hoy() {
    return request('/visitas/hoy');
  },

  async obtener(id) {
    return request(`/visitas/${id}`);
  },

  async crear(visita) {
    return request('/visitas', {
      method: 'POST',
      body: JSON.stringify(visita)
    });
  },

  async actualizar(id, visita) {
    return request(`/visitas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(visita)
    });
  },

  async cambiarEstado(id, estado) {
    return request(`/visitas/${id}/estado?estado=${estado}`, {
      method: 'PATCH'
    });
  },

  async completar(id, data) {
    return request(`/visitas/${id}/completar`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async eliminar(id) {
    return request(`/visitas/${id}`, {
      method: 'DELETE'
    });
  }
};

// ============ PRESUPUESTOS ============
export const presupuestosService = {
  async listar(filtros = {}) {
    const params = new URLSearchParams(filtros).toString();
    return request(`/presupuestos${params ? `?${params}` : ''}`);
  },

  async porCliente(clienteId) {
    return request(`/presupuestos/cliente/${clienteId}`);
  },

  async obtener(id) {
    return request(`/presupuestos/${id}`);
  },

  async crear(presupuesto) {
    return request('/presupuestos', {
      method: 'POST',
      body: JSON.stringify(presupuesto)
    });
  },

  async cambiarEstado(id, estado) {
    return request(`/presupuestos/${id}/estado?estado=${estado}`, {
      method: 'PATCH'
    });
  },

  async eliminar(id) {
    return request(`/presupuestos/${id}`, {
      method: 'DELETE'
    });
  },

  async estadisticas() {
    return request('/estadisticas/presupuestos');
  }
};

// ============ DASHBOARD ============
export const dashboardService = {
  async obtener() {
    return request('/dashboard');
  }
};

export default {
  auth: authService,
  clientes: clientesService,
  visitas: visitasService,
  presupuestos: presupuestosService,
  dashboard: dashboardService
};
