import { useState } from 'react'
import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from '@hello-pangea/dnd'
import sampleData from '../../sample-data.json'
import type { ColumnMeta, Task, TaskBoardMeta, TaskStatus } from '../../types'

export default function TaskBoard() {
  const [data, setData] = useState(sampleData as TaskBoardMeta)

  const onDragEnd: OnDragEndResponder = ({ source, destination, draggableId }) => {
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const startColumn = data.columns[source.droppableId as TaskStatus]
    const finalColumn = data.columns[destination.droppableId as TaskStatus]

    if (startColumn.id === finalColumn.id) {
      const newTaskIds = [...startColumn.taskIds]

      newTaskIds.splice(source.index, 1)
      newTaskIds.splice(destination.index, 0, draggableId)

      return setData(prev => ({
        ...prev,
        columns: {
          ...prev.columns,
          [startColumn.id]: { ...startColumn, taskIds: newTaskIds },
        },
      }))
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
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-3 gap-4">
        {data.columnOrder.map(columnId => {
          const column = data.columns[columnId as keyof typeof data.columns]
          const tasks = column.taskIds.map(taskId => data.tasks[taskId])

          return <Column key={column.id} meta={column} tasks={tasks} />
        })}
      </div>
    </DragDropContext>
  )
}

type ColumnProps = { meta: ColumnMeta; tasks: Task[] }

function Column({ meta, tasks }: ColumnProps) {
  return (
    <div className="flex flex-col gap-4 border rounded-md shadow-lg p-4">
      <div className="font-semibold bg-blue-400 text-white py-2 px-4">{meta.title}</div>

      <Droppable droppableId={meta.id}>
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-2 min-h-32 h-full">
            {tasks.map((task, index) => (
              <Task key={task.id} meta={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

type TaskProps = { meta: Task; index: number }

function Task({ meta, index }: TaskProps) {
  return (
    <Draggable draggableId={meta.id} index={index}>
      {provided => (
        <div ref={provided.innerRef} {...provided.draggableProps} className="bg-blue-200 rounded">
          <div className="p-4" {...provided.dragHandleProps}>
            {meta.title}
          </div>

          <div className="p-4 flex items-center gap-2 justify-end">
            <button className="rounded text-white bg-red-400 font-medium py-1 px-2 text-sm">Delete</button>
            <button className="rounded text-white bg-blue-400 font-medium py-1 px-2 text-sm">Edit</button>
            <button className="rounded text-white bg-blue-500 font-medium py-1 px-2 text-sm">View Details</button>
          </div>
        </div>
      )}
    </Draggable>
  )
}
