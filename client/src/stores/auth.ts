import { create } from 'zustand'
import type { User } from '../types'

type Store = {
  user: User | null
  isInitialized: boolean
}

export const useAuthStore = create<Store>(() => ({
  user: null,
  isInitialized: false,
}))

export function setCurrentUser(user: User | null) {
  useAuthStore.setState({ user })
}

export function initializeAuth() {
  useAuthStore.setState({ isInitialized: true })
}
