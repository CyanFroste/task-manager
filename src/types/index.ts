export type User = {
  name: string
  email?: string
  googleId?: string
  password?: string
}

export type TaskStatus = 'pending' | 'inProgress' | 'completed'

export type Task = {
  title: string
  description: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
  userId: string
}
