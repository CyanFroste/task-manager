import axios from 'axios'
import { API_URL } from '../constants'
import type { User } from '../types'

export async function getCurrentUser() {
  const res = await axios.get<User>(`${API_URL}/users/current`, { withCredentials: true })
  return res.data
}
