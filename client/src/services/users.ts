import axios from 'axios'
import { API_URL } from '../constants'

export async function getCurrentUser() {
  const res = await axios.get(`${API_URL}/users/current`, { withCredentials: true })
  return res.data
}
