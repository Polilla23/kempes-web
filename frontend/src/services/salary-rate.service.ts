import api from './api'
import type { RegisterSalaryRateFormData, SalaryRateResponse, SalaryRatesResponse, SalaryRate, KempesitaConfig } from '@/types'

export class SalaryRateService {
    // Crear un nuevo salary rate
    static async createSalaryRate(salaryRateData: RegisterSalaryRateFormData): Promise<SalaryRateResponse> {
        try {
            const response = await api.post<{ data: SalaryRate; message: string }>('/api/v1/salary-rates', salaryRateData)
            return { salaryRate: response.data?.data, message: response.data?.message || 'Salary rate created successfully' }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error creating salary rate')
        }
    }

    // Obtener todos los salary rates
    static async getSalaryRates(): Promise<SalaryRatesResponse> {
        try {
            const response = await api.get<{ data: SalaryRate[] }>('/api/v1/salary-rates')
            return { salaryRates: response.data?.data || [] }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error fetching salary rates')
        }
    }

    // Obtener un salary rate por su ID
    static async getSalaryRateById(id: string): Promise<SalaryRateResponse> {
        try {
            const response = await api.get<{ data: SalaryRate; message: string }>(`/api/v1/salary-rates/${id}`)
            return { salaryRate: response.data?.data, message: response.data?.message || 'Salary rate fetched successfully' }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error fetching salary rate')
        }
    }

    // Actualizar un salary rate
    static async updateSalaryRate(id: string, salaryRateData: Partial<RegisterSalaryRateFormData>): Promise<SalaryRateResponse> {
        try {
            const response = await api.patch<{ data: SalaryRate; message: string }>(`/api/v1/salary-rates/${id}`, salaryRateData)
            return { salaryRate: response.data?.data, message: response.data?.message || 'Salary rate updated successfully' }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error updating salary rate')
        }
    }

    // Eliminar un salary rate
    static async deleteSalaryRate(id: string): Promise<SalaryRateResponse> {
        try {
            const response = await api.delete<{ data: SalaryRate; message: string }>(`/api/v1/salary-rates/${id}`)
            return { salaryRate: response.data?.data, message: response.data?.message || 'Salary rate deleted successfully' }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error deleting salary rate')
        }
    }

    // Obtener configuracion kempesita activa
    static async getKempesitaConfig(): Promise<KempesitaConfig | null> {
        try {
            const response = await api.get<{ data: KempesitaConfig | null }>('/api/v1/kempesita-config')
            return response.data?.data || null
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error fetching kempesita config')
        }
    }

    // Crear o actualizar configuracion kempesita
    static async upsertKempesitaConfig(maxBirthYear: number): Promise<KempesitaConfig> {
        try {
            const response = await api.put<{ data: KempesitaConfig; message: string }>('/api/v1/kempesita-config', { maxBirthYear })
            return response.data?.data
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error saving kempesita config')
        }
    }
}
