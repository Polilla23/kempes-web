// Configuración base de la API
const API_BASE_URL = 'http://localhost:3000/api/v1'

// Tipos para las respuestas de la API
export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
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
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
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

  try {
    const response = await fetch(url, config)
    return await handleResponse<T>(response)
  } catch (error) {
    // Manejo centralizado de errores
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        // Token expirado o inválido
        console.log('Unauthorized - redirecting to login')
        // Aquí puedes redirigir al login
      }
    }
    throw error
  }
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
