// Configuración base de la API
const API_BASE_URL = 'http://localhost:3000'

// Tipos para las respuestas de la API
export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
}

// Callback para manejar errores de autenticación (será configurado por UserContext)
let onUnauthorized: (() => void) | null = null

export const setUnauthorizedCallback = (callback: () => void) => {
  onUnauthorized = callback
}

// Configuración base para las peticiones
const defaultConfig: RequestInit = {
  credentials: 'include', // Importante para enviar cookies
  headers: {
    'Content-Type': 'application/json',
  },
}

// Función helper para manejar las respuestas
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  // Detectar 401 Unauthorized
  if (response.status === 401) {
    if (onUnauthorized) {
      onUnauthorized()
    }
    throw new Error('Unauthorized: Session expired. Please log in again.')
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }

  // Handle 204 No Content - no body to parse
  if (response.status === 204) {
    return { data: undefined as T }
  }

  const data = await response.json()
  return { data }
}

// Función helper para hacer peticiones
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`

  const hasBody = options.body !== undefined && options.body !== null

  const config =
    options.body instanceof FormData
      ? {
          ...defaultConfig,
          ...options,
          headers: options.headers || {},
        }
      : {
          ...defaultConfig,
          ...options,
          headers: {
            ...(hasBody ? defaultConfig.headers : {}), // Only include default headers if there's a body
            ...options.headers,
          },
        }

  const response = await fetch(url, config)
  return await handleResponse<T>(response)
}

// Métodos HTTP helpers
export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),

  post: <T>(endpoint: string, data?: any) => {
    if (data instanceof FormData) {
      return apiRequest<T>(endpoint, {
        method: 'POST',
        body: data,
      })
    }

    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  patch: <T>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, {
      method: 'DELETE',
    }),
}

export default api
