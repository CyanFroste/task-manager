import { AxiosError } from 'axios'
import type { GenericResponse, Task, TaskBoardMeta } from './types'

export function parseGenericError(err: unknown) {
  if (err instanceof AxiosError) {
    const data = err.response?.data

    if (typeof data === 'string') {
      if (data.includes('<pre>')) return new Error(data.slice(data.indexOf('<pre>') + 5, data.indexOf('</pre>')))
      return new Error(data)
    }

    if (typeof data === 'object' && (data as GenericResponse).message)
      return new Error((data as GenericResponse).message)
  }

  if (err instanceof Error) return err
  if (typeof err === 'string') return new Error(err)

  return new Error('Unknown error')
}

export function createTaskBoardMeta(tasks: Task[]): TaskBoardMeta {
  return {
    tasks: tasks.reduce<Record<string, Task>>((acc, task) => {
      acc[task.id] = task
      return acc
    }, {}),

    columnOrder: ['pending', 'inProgress', 'completed'],
    columns: {
      pending: {
        id: 'pending',
        title: 'Pending',
        taskIds: tasks.filter(task => task.status === 'pending').map(task => task.id),
      },
      inProgress: {
        id: 'inProgress',
        title: 'In Progress',
        taskIds: tasks.filter(task => task.status === 'inProgress').map(task => task.id),
      },
      completed: {
        id: 'completed',
        title: 'Completed',
        taskIds: tasks.filter(task => task.status === 'completed').map(task => task.id),
      },
    },
  }
}
