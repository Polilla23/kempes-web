import api from './api'
import type {
  LoginFormData,
  RegisterFormData,
  ResetPasswordFormData,
  NewPasswordFormData,
  AuthResponse,
} from '../types'

export class AuthService {
  // Login de usuario
  static async login(credentials: LoginFormData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/user/login', credentials)
      return response.data || { message: response.message || 'Login successful' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error during login')
    }
  }

  // Registro de usuario
  static async register(userData: RegisterFormData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/user/register', userData)
      return response.data || { message: response.message || 'Registration successful' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error during registration')
    }
  }

  // Logout de usuario
  static async logout(): Promise<AuthResponse> {
    try {
      const response = await api.get<AuthResponse>('/user/logout')
      return response.data || { message: response.message || 'Logout successful' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error during logout')
    }
  }

  // Verificar email con token
  static async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const response = await api.get<AuthResponse>(`/user/verify-email/${token}`)
      return response.data || { message: response.message || 'Email verified successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error during email verification')
    }
  }

  // Reenviar email de verificación
  static async resendVerificationEmail(email: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/user/resend-verification-email', { email })
      return response.data || { message: response.message || 'Verification email sent' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error resending verification email')
    }
  }

  // Solicitar reset de contraseña
  static async requestPasswordReset(data: ResetPasswordFormData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/user/request-reset-password', data)
      return response.data || { message: response.message || 'Password reset email sent' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error requesting password reset')
    }
  }

  // Verificar si el token es válido
  static async verifyResetPasswordToken(token: string): Promise<AuthResponse> {
    try {
      const response = await api.get<AuthResponse>(`/user/verify-reset-password-token/${token}`)
      return response.data || { message: response.message || 'Reset password token verified' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error verifying reset password token')
    }
  }

  // Reset de contraseña con token
  static async resetPassword(token: string, data: NewPasswordFormData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(`/user/reset-password/${token}`, data)
      return response.data || { message: response.message || 'Password reset successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error resetting password')
    }
  }

  // Verificar si el usuario está autenticado
  static async checkAuth(): Promise<boolean> {
    try {
      // Intentar hacer una petición que requiera autenticación
      await api.get('/myaccount/profile')
      return true
    } catch (error) {
      return false
    }
  }
}

export default AuthService
