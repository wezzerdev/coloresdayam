const API_BASE = import.meta.env.VITE_API_URL || '';

const TOKEN_KEY = 'colores_dayam_token';
const USER_KEY = 'colores_dayam_user';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

const authListeners = new Set();

const notifyAuthChange = (event, session) => {
  authListeners.forEach((callback) => {
    try {
      callback(event, session);
    } catch (e) {
      console.error('[API Client] Error en callback de autenticación:', e);
    }
  });
};

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
  }

  return data;
}

export const supabase = {
  auth: {
    // 1. Registro con Nombre Completo
    async signUp({ email, password, name }) {
      try {
        const result = await apiFetch('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email, password, name }),
        });

        return { data: result, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    // 2. Verificación de Código de 6 dígitos
    async verifyCode({ email, code }) {
      try {
        const result = await apiFetch('/api/auth/verify-code', {
          method: 'POST',
          body: JSON.stringify({ email, code }),
        });

        if (result.token) {
          setToken(result.token);
          setStoredUser(result.user);
          notifyAuthChange('SIGNED_IN', { user: result.user });
        }

        return { data: { user: result.user }, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    // 3. Inicio de Sesión
    async signInWithPassword({ email, password }) {
      try {
        const result = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        if (result.token) {
          setToken(result.token);
          setStoredUser(result.user);
          notifyAuthChange('SIGNED_IN', { user: result.user });
        }

        return { data: { user: result.user }, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    // 4. Solicitar Código de Recuperación de Contraseña
    async forgotPassword({ email }) {
      try {
        const result = await apiFetch('/api/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email }),
        });
        return { data: result, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    // 5. Restablecer Contraseña con Código
    async resetPassword({ email, code, newPassword }) {
      try {
        const result = await apiFetch('/api/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ email, code, newPassword }),
        });
        return { data: result, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    // 6. Actualizar Nombre de Perfil
    async updateProfile({ name }) {
      try {
        const result = await apiFetch('/api/auth/profile', {
          method: 'PUT',
          body: JSON.stringify({ name }),
        });
        if (result.user) {
          setStoredUser(result.user);
          notifyAuthChange('USER_UPDATED', { user: result.user });
        }
        return { data: result.user, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    // 7. Cambiar Contraseña desde Sesión Activa
    async changePassword({ currentPassword, newPassword }) {
      try {
        const result = await apiFetch('/api/auth/change-password', {
          method: 'PUT',
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        return { data: result, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    async signInWithOAuth() {
      alert("Autenticación OAuth no disponible en modo servidor local autónomo.");
      return { data: null, error: new Error("OAuth no disponible localmente") };
    },

    async signOut() {
      removeToken();
      notifyAuthChange('SIGNED_OUT', null);
      return { error: null };
    },

    async getUser() {
      const user = getStoredUser();
      if (!user) return { data: { user: null }, error: null };
      
      try {
        const res = await apiFetch('/api/auth/me');
        if (res.user) {
          setStoredUser(res.user);
          return { data: { user: res.user }, error: null };
        }
      } catch (e) {
        removeToken();
      }
      return { data: { user: null }, error: null };
    },

    async getSession() {
      const user = getStoredUser();
      const token = getToken();
      if (user && token) {
        return { data: { session: { user, access_token: token } }, error: null };
      }
      return { data: { session: null }, error: null };
    },

    onAuthStateChange(callback) {
      authListeners.add(callback);
      const user = getStoredUser();
      if (user) {
        callback('SIGNED_IN', { user });
      } else {
        callback('SIGNED_OUT', null);
      }

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners.delete(callback);
            },
          },
        },
      };
    },
  },

  from(table) {
    let targetEndpoint = `/api/${table === 'user_palettes' ? 'palettes' : table}`;
    let filterId = null;
    let payload = null;
    let method = 'GET';

    const builder = {
      select() {
        method = 'GET';
        return builder;
      },
      insert(data) {
        method = 'POST';
        payload = Array.isArray(data) ? data[0] : data;
        return builder;
      },
      update(data) {
        method = 'PUT';
        payload = data;
        return builder;
      },
      delete() {
        method = 'DELETE';
        return builder;
      },
      eq(column, value) {
        if (column === 'id') {
          filterId = value;
        }
        return builder;
      },
      order() {
        return builder;
      },
      single() {
        return builder;
      },
      async then(resolve, reject) {
        try {
          let url = targetEndpoint;
          if (filterId && (method === 'PUT' || method === 'DELETE')) {
            url = `${targetEndpoint}/${filterId}`;
          }

          const res = await apiFetch(url, {
            method,
            ...(payload ? { body: JSON.stringify(payload) } : {}),
          });

          resolve({ data: res.data || res, error: null });
        } catch (error) {
          resolve({ data: null, error });
        }
      },
    };

    return builder;
  },
};
