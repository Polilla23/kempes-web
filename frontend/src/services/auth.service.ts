import api from './api'
import type {
  LoginFormData,
  RegisterUserFormData,
  ResetPasswordFormData,
  NewPasswordFormData,
  AuthResponse,
} from '../types'

class AuthService {
  // Login de usuario
  static async login(credentials: LoginFormData): Promise<AuthResponse> {
    try {
      const response = await api.post<{ data?: any; message: string }>('/api/v1/users/login', credentials)
      // Backend devuelve { data: { message }, message, timestamp } para auth endpoints
      return { message: response.data?.message || 'Login successful' }
    } catch (error) {
      console.error('[AuthService] Login error:', error)
      throw new Error(error instanceof Error ? error.message : 'Error during login')
    }
  }

  // Registro de usuario
  static async register(userData: RegisterUserFormData): Promise<AuthResponse> {
    try {
      const response = await api.post<{ data?: any; message: string }>('/api/v1/users/register', userData)
      // Backend devuelve { data: { message }, message, timestamp }
      return { message: response.data?.message || 'Registration successful' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error during registration')
    }
  }

  // Logout de usuario
  static async logout(): Promise<AuthResponse> {
    try {
      const response = await api.get<{ data?: any; message: string }>('/api/v1/users/logout')
      // Backend devuelve { data: { message }, message, timestamp }
      return { message: response.data?.message || 'Logout successful' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error during logout')
    }
  }

  // Verificar email con token
  static async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const response = await api.get<{ data?: any; message: string }>(`/api/v1/users/verify-email/${token}`)
      // Backend devuelve { data: { message }, message, timestamp }
      return { message: response.data?.message || 'Email verified successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error during email verification')
    }
  }

  // Reenviar email de verificación
  static async resendVerificationEmail(email: string): Promise<AuthResponse> {
    try {
      const response = await api.post<{ data?: any; message: string }>('/api/v1/users/resend-verification-email', { email })
      // Backend devuelve { data: { message }, message, timestamp }
      return { message: response.data?.message || 'Verification email sent' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error resending verification email')
    }
  }

  // Solicitar reset de contraseña
  static async requestPasswordReset(data: ResetPasswordFormData): Promise<AuthResponse> {
    try {
      const response = await api.post<{ data?: any; message: string }>('/api/v1/users/request-reset-password', data)
      // Backend devuelve { data: { message }, message, timestamp }
      return { message: response.data?.message || 'Password reset email sent' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error requesting password reset')
    }
  }

  // Verificar si el token es válido
  static async verifyResetPasswordToken(token: string): Promise<AuthResponse> {
    try {
      const response = await api.get<{ data: any; message: string }>(`/api/v1/users/verify-reset-password-token/${token}`)
      // Backend devuelve { data: User, message, timestamp }
      return { message: response.data?.message || 'Reset password token verified' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error verifying reset password token')
    }
  }

  // Reset de contraseña con token
  static async resetPassword(token: string, data: NewPasswordFormData): Promise<AuthResponse> {
    try {
      const response = await api.post<{ data?: any; message: string }>(`/api/v1/users/reset-password/${token}`, data)
      // Backend devuelve { data: { message }, message, timestamp }
      return { message: response.data?.message || 'Password reset successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error resetting password')
    }
  }

  // Obtener perfil del usuario autenticado
  static async getProfile(): Promise<{ id: string; role: 'ADMIN' | 'USER' } | null> {
    try {
      const response = await api.get<{ data: { id: string; role: 'ADMIN' | 'USER' } }>('/api/v1/me')
      return response.data?.data || null
    } catch (error) {
      console.error('[AuthService] Profile fetch error:', error)
      throw new Error(error instanceof Error ? error.message : 'Error al obtener el perfil del usuario')
    }
  }
}

export default AuthService
