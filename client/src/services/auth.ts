import axios from 'axios'
import { API_URL } from '../constants'
import type { User } from '../types'

export function loginWithGoogle() {
  window.open(`${API_URL}/auth/google`, '_self')
}

export async function register(email: string, password: string, name: string) {
  const res = await axios.post<User>(`${API_URL}/auth/register`, { email, password, name })
  return res.data
}

export const login = async (email: string, password: string) => {
  const res = await axios.post<User>(`${API_URL}/auth/login`, { email, password }, { withCredentials: true })
  return res.data
}

export async function logout() {
  await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true })
}
