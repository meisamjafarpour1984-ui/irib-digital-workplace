import { apiClient } from '@/lib/api-client'
import type { AuthUser } from '@/lib/stores/auth-store'

export interface OtpChallengeResponse {
  challengeId: string
  expiresIn: number
  devOtp?: string
}

export interface SessionResponse {
  accessToken: string
  expiresIn: number
  user: AuthUser
  refreshToken?: string
}

export interface KeycloakSessionResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: AuthUser
}

export const authApi = {
  register: (input: { personnelCode: string; mobile: string; name?: string }) =>
    apiClient.post<OtpChallengeResponse>('/auth/register', input),
  login: (input: { personnelCode: string; password: string }) =>
    apiClient.post<OtpChallengeResponse>('/auth/login', input),
  devLogin: (input: { personnelCode: string; password: string }) =>
    apiClient.post<SessionResponse>('/auth/dev-login', input),
  verifyOtp: (input: { challengeId: string; code: string }) =>
    apiClient.post<SessionResponse>('/auth/verify-otp', input),
  refresh: () => apiClient.post<SessionResponse>('/auth/refresh'),
  logout: () => apiClient.post<{ success: boolean }>('/auth/logout'),
  setPin: (pin: string) => apiClient.post<{ success: boolean }>('/auth/set-pin', { pin }),

  // Keycloak direct login (bypasses OTP)
  keycloakLogin: (input: { personnelCode: string; password: string }) =>
    apiClient.post<KeycloakSessionResponse>('/auth/keycloak-login', input),
}
