import { useCallback, useEffect, useState } from 'react'
import Dialog from '../Dialog'
import TaskBoard from './TaskBoard'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTask, deleteTask, getAllTasks, updateTask } from '../../services/tasks'
import { createTaskBoardMeta } from '../../utils'
import type { Task, TaskActionType, TaskStatus } from '../../types'
import Select from '../Select'

type CreateTaskParams = { title: string; description: string }
type UpdateTaskParams = { id: string; title?: string; description?: string; status?: TaskStatus }
type TaskAction = { task?: Task; type: TaskActionType }

const SORT_OPTIONS = ['Recent', 'Title (A-Z)']

export default function HomeScreen() {
  const queryClient = useQueryClient()

  const [data, setData] = useState(createTaskBoardMeta([]))
  const [taskAction, setTaskAction] = useState<TaskAction | null>(null)
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0])

  const queryTasks = useQuery({
    queryKey: ['TASKS'],
    queryFn: async () => {
      return createTaskBoardMeta(await getAllTasks())
    },
  })

  useEffect(() => {
    if (!queryTasks.data) return
    setData(queryTasks.data)
  }, [queryTasks.data])

  const mutationAddTask = useMutation({
    mutationFn: ({ title, description }: CreateTaskParams) => createTask(title, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['TASKS'] })
      if (taskAction) setTaskAction(null)
    },
  })

  const mutationUpdateTask = useMutation({
    mutationFn: ({ id, ...updates }: UpdateTaskParams) => updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['TASKS'] })
      if (taskAction) setTaskAction(null)
    },
  })

  const mutationDeleteTask = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['TASKS'] })
      if (taskAction) setTaskAction(null)
    },
  })

  const onTaskStatusUpdate = useCallback(
    (id: string, status: TaskStatus) => {
      mutationUpdateTask.mutate({ id, status })
    },
    [mutationUpdateTask],
  )

  const onAddTask: React.FormEventHandler<HTMLFormElement> = useCallback(
    evt => {
      evt.preventDefault()

      const title = (evt.currentTarget.elements.namedItem('title') as HTMLInputElement).value
      const description = (evt.currentTarget.elements.namedItem('description') as HTMLInputElement).value

      mutationAddTask.mutate({ title, description })
    },
    [mutationAddTask],
  )

  const onUpdateTask: React.FormEventHandler<HTMLFormElement> = useCallback(
    evt => {
      evt.preventDefault()
      const id = taskAction?.task?.id
      if (!id) return

      const title = (evt.currentTarget.elements.namedItem('title') as HTMLInputElement).value
      const description = (evt.currentTarget.elements.namedItem('description') as HTMLInputElement).value

      mutationUpdateTask.mutate({ id, title, description })
    },
    [mutationUpdateTask, taskAction?.task?.id],
  )

  const onDeleteTask = useCallback(() => {
    const id = taskAction?.task?.id
    if (!id) return

    mutationDeleteTask.mutate(id)
  }, [mutationDeleteTask, taskAction?.task?.id])

  return (
    <div className="py-10 flex flex-col container gap-6">
      <button
        className="py-2 px-10 rounded text-white bg-blue-500 font-medium self-start"
        onClick={() => setTaskAction({ type: 'create' })}>
        Add Task
      </button>

      <div className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-md shadow-lg">
        <label className="flex items-center gap-2 w-full md:w-1/2">
          <span className="font-medium shrink-0">Search</span>
          <input type="search" placeholder="Search" className="w-full p-2 border rounded" />
        </label>

        <div className="flex items-center gap-2 self-start md:ml-auto">
          <span className="font-medium shrink-0">Sort By</span>
          <Select options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} />
        </div>
      </div>

      <TaskBoard
        data={data}
        setData={setData}
        onTaskStatusUpdate={onTaskStatusUpdate}
        setTaskAction={(task, type) => setTaskAction({ task, type })}
      />

      <Dialog open={taskAction?.type === 'create'}>
        <div className="p-4 bg-white rounded shadow-lg m-auto w-[90%] max-w-screen-sm h-4/5 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Add Task</h2>

          <form className="flex flex-col gap-4 h-full" onSubmit={onAddTask}>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-600">Title</span>
              <input name="title" type="text" placeholder="Task Title" className="w-full p-2 border-b" />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-600">Description</span>
              <textarea name="description" placeholder="Task Title" className="w-full p-2 border-b h-32" />
            </label>

            <div className="flex items-center gap-2 mt-auto ml-auto">
              <button type="submit" className="bg-blue-500 text-white rounded py-2 px-4 font-medium">
                Save
              </button>

              <button
                type="button"
                className="bg-gray-200 rounded py-2 px-4 font-medium"
                onClick={() => setTaskAction(null)}>
                Close
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      <Dialog open={taskAction?.type === 'update'}>
        <div className="p-4 bg-white rounded shadow-lg m-auto w-[90%] max-w-screen-sm h-4/5 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Edit Task</h2>

          <form className="flex flex-col gap-4 h-full" onSubmit={onUpdateTask}>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-600">Title</span>
              <input
                name="title"
                type="text"
                placeholder="Task Title"
                className="w-full p-2 border-b"
                defaultValue={taskAction?.task?.title}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-600">Description</span>
              <textarea
                name="description"
                placeholder="Task Title"
                className="w-full p-2 border-b h-32"
                defaultValue={taskAction?.task?.description}
              />
            </label>

            <div className="flex items-center gap-2 mt-auto ml-auto">
              <button type="submit" className="bg-blue-500 text-white rounded py-2 px-4 font-medium">
                Save
              </button>

              <button
                type="button"
                className="bg-gray-200 rounded py-2 px-4 font-medium"
                onClick={() => setTaskAction(null)}>
                Close
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      <Dialog open={taskAction?.type === 'delete'}>
        <div className="p-4 bg-white rounded shadow-lg m-auto w-[90%] max-w-screen-sm flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Delete Task</h2>

          <p>Are you sure you want to delete this task?</p>
          <h3 className="text-lg font-medium text-blue-500">{taskAction?.task?.title || 'No Title'}</h3>

          <div className="flex items-center gap-2 mt-auto ml-auto">
            <button
              type="button"
              className="bg-red-400 text-white rounded py-2 px-4 font-medium"
              onClick={onDeleteTask}>
              Yes
            </button>

            <button
              type="button"
              className="bg-gray-200 rounded py-2 px-4 font-medium"
              onClick={() => setTaskAction(null)}>
              Close
            </button>
          </div>
        </div>
      </Dialog>

      <Dialog open={taskAction?.type === 'view'}>
        <div className="p-4 bg-white rounded shadow-lg m-auto w-[90%] max-w-screen-sm h-4/5 flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Task Details</h2>

          <span className="text-sm text-gray-600">Title</span>
          <h3 className="text-lg font-medium">{taskAction?.task?.title || 'No Title'}</h3>

          <span className="text-sm text-gray-600">Description</span>
          <p className="min-h-32">{taskAction?.task?.description}</p>

          <span className="text-sm text-gray-600">Created</span>
          <p className="text-sm">
            {taskAction?.task?.createdAt
              ? new Date(taskAction?.task?.createdAt).toLocaleString()
              : '--/--/---- --:--:-- --'}
          </p>

          <div className="flex items-center gap-2 mt-auto ml-auto">
            <button
              type="button"
              className="bg-gray-200 rounded py-2 px-4 font-medium"
              onClick={() => setTaskAction(null)}>
              Close
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
