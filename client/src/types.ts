export type User = {
  _id: string
  name: string
  email?: string
  googleId?: string
}

export type GenericResponse = { message: string }

export type TaskStatus = 'pending' | 'inProgress' | 'completed'

export type Task = {
  id: string
  title: string
  description: string
  status: TaskStatus
  // createdAt: string
  // updatedAt: string
}

export type ColumnMeta = {
  id: string
  title: string
  taskIds: string[]
}

export type TaskBoardMeta = {
  tasks: Record<string, Task>
  columns: Record<TaskStatus, ColumnMeta>
  columnOrder: TaskStatus[]
}
