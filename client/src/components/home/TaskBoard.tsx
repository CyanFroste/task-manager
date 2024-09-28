import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from '@hello-pangea/dnd'
import type { ColumnMeta, Task, TaskAction, TaskBoardMeta, TaskStatus } from '../../types'
import { useCallback } from 'react'

type Props = {
  data: TaskBoardMeta
  setData: React.Dispatch<React.SetStateAction<TaskBoardMeta>>
  onTaskStatusUpdate: (id: string, status: TaskStatus) => void
  setTaskAction: (task: Task, action: TaskAction) => void
}

export default function TaskBoard({ data, setData, setTaskAction, onTaskStatusUpdate }: Props) {
  const onDragEnd: OnDragEndResponder = useCallback(
    ({ source, destination, draggableId }) => {
      if (!destination) return
      if (destination.droppableId === source.droppableId && destination.index === source.index) return

      const startColumn = data.columns[source.droppableId as TaskStatus]
      const finalColumn = data.columns[destination.droppableId as TaskStatus]

      if (startColumn.id === finalColumn.id) {
        const newTaskIds = [...startColumn.taskIds]

        newTaskIds.splice(source.index, 1)
        newTaskIds.splice(destination.index, 0, draggableId)

        setData(prev => ({
          ...prev,
          columns: {
            ...prev.columns,
            [startColumn.id]: { ...startColumn, taskIds: newTaskIds },
          },
        }))

        onTaskStatusUpdate(draggableId, finalColumn.id as TaskStatus)
        return
      }

      const startTaskIds = [...startColumn.taskIds]
      const finalTaskIds = [...finalColumn.taskIds]

      startTaskIds.splice(source.index, 1)
      finalTaskIds.splice(destination.index, 0, draggableId)

      setData(prev => ({
        ...prev,
        columns: {
          ...prev.columns,
          [startColumn.id]: { ...startColumn, taskIds: startTaskIds },
          [finalColumn.id]: { ...finalColumn, taskIds: finalTaskIds },
        },
      }))

      onTaskStatusUpdate(draggableId, finalColumn.id as TaskStatus)
    },
    [data.columns, onTaskStatusUpdate, setData],
  )

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-3 gap-4">
        {data.columnOrder.map(columnId => {
          const column = data.columns[columnId as keyof typeof data.columns]
          const tasks = column.taskIds.map(taskId => data.tasks[taskId])

          return <Column key={column.id} meta={column} tasks={tasks} setTaskAction={setTaskAction} />
        })}
      </div>
    </DragDropContext>
  )
}

type ColumnProps = { meta: ColumnMeta; tasks: Task[]; setTaskAction: (task: Task, action: TaskAction) => void }

function Column({ meta, tasks, setTaskAction }: ColumnProps) {
  return (
    <div className="flex flex-col gap-4 border rounded-md shadow-lg p-4">
      <div className="font-semibold bg-blue-400 text-white py-2 px-4">{meta.title}</div>

      <Droppable droppableId={meta.id}>
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-2 min-h-32 h-full">
            {tasks.map((task, index) => (
              <Task
                key={task.id}
                meta={task}
                index={index}
                onUpdate={() => setTaskAction(task, 'update')}
                onDelete={() => setTaskAction(task, 'delete')}
                onView={() => setTaskAction(task, 'view')}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

type TaskProps = { meta: Task; index: number; onUpdate: () => void; onDelete: () => void; onView: () => void }

function Task({ meta, index, onUpdate, onDelete, onView }: TaskProps) {
  return (
    <Draggable draggableId={meta.id} index={index}>
      {provided => (
        <div ref={provided.innerRef} {...provided.draggableProps} className="bg-blue-200 rounded">
          <div className="p-4 flex flex-col gap-2" {...provided.dragHandleProps}>
            <h3 className="text-lg font-medium">{meta.title || 'No Title'}</h3>
            <p className="min-h-16">{meta.description}</p>
            <span className="text-sm text-gray-700">Created at: {new Date(meta.createdAt).toLocaleString()}</span>
          </div>

          <div className="p-4 flex items-center gap-2 justify-end">
            <button className="rounded text-white bg-red-400 font-medium py-1 px-2 text-sm" onClick={onDelete}>
              Delete
            </button>
            <button className="rounded text-white bg-blue-400 font-medium py-1 px-2 text-sm" onClick={onUpdate}>
              Edit
            </button>
            <button className="rounded text-white bg-blue-500 font-medium py-1 px-2 text-sm" onClick={onView}>
              View Details
            </button>
          </div>
        </div>
      )}
    </Draggable>
  )
}
