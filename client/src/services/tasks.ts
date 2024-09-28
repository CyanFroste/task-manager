import axios from 'axios'
import { API_URL } from '../constants'
import type { Task, TaskStatus } from '../types'

export async function createTask(title: string, description: string, status: TaskStatus = 'pending') {
  const res = await axios.post<Task>(`${API_URL}/tasks`, { title, description, status }, { withCredentials: true })
  return res.data
}

export async function getAllTasks() {
  const res = await axios.get<Task[]>(`${API_URL}/tasks`, { withCredentials: true })
  return res.data
}

export async function getTaskById(id: string) {
  const res = await axios.get<Task>(`${API_URL}/tasks/${id}`, { withCredentials: true })
  return res.data
}

export async function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) {
  const res = await axios.patch<Task>(`${API_URL}/tasks/${id}`, updates, { withCredentials: true })
  return res.data
}

export async function deleteTask(id: string) {
  await axios.delete(`${API_URL}/tasks/${id}`, { withCredentials: true })
}
