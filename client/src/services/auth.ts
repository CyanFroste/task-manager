import axios from 'axios'

const API_URL = 'http://localhost:3000'

export function loginWithGoogle() {
  window.open(`${API_URL}/auth/google`, '_self')
}

export async function getUser() {
  const res = await axios.get(`${API_URL}/api/user`, { withCredentials: true })
  return res.data
}

export async function register(email: string, password: string, name: string) {
  const res = await axios.post(`${API_URL}/api/register`, { email, password, name })
  return res.data
}

export const login = async (email: string, password: string) => {
  const res = await axios.post(`${API_URL}/api/login`, { email, password }, { withCredentials: true })
  return res.data
}

export async function logout() {
  await axios.post(`${API_URL}/api/logout`, {}, { withCredentials: true })
}
