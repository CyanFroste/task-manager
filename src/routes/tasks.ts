import { Router } from 'express'
import { MongoClient, ObjectId } from 'mongodb'
import type { Task } from '../types'

export function getTaskRoutes(dbClient: MongoClient): Router {
  const router = Router()

  router.post('/', async (req, res) => {
    const { title, description }: Omit<Task, 'status' | 'createdAt' | 'updatedAt'> = req.body

    const createdAt = new Date().toISOString()
    const newTask: Task = { title, description, status: 'pending', createdAt, updatedAt: createdAt }

    const { insertedId } = await dbClient.db().collection('tasks').insertOne(newTask)
    res.status(201).json({ id: insertedId, ...newTask })
  })

  router.get('/', async (req, res) => {
    const tasks = await dbClient
      .db()
      .collection('tasks')
      .find()
      .map(task => ({ ...task, id: task._id.toHexString() }))
      .toArray()

    res.status(200).json(tasks)
  })

  router.get('/:id', async (req, res) => {
    const taskId = req.params.id

    const task = await dbClient
      .db()
      .collection('tasks')
      .findOne({ _id: new ObjectId(taskId) })

    if (!task) {
      res.status(404).json({ message: 'Task not found' })
      return
    }

    res.status(200).json({ ...task, id: task._id.toHexString() })
  })

  router.patch('/:id', async (req, res) => {
    const taskId = req.params.id
    const {
      title = '',
      description = '',
      status = 'pending',
    }: Partial<Omit<Task, 'createdAt' | 'updatedAt'>> = req.body

    const updatedTask: Omit<Task, 'createdAt'> = {
      title,
      description,
      status,
      updatedAt: new Date().toISOString(),
    }

    const before = await dbClient
      .db()
      .collection('tasks')
      .findOneAndUpdate({ _id: new ObjectId(taskId) }, { $set: updatedTask })

    if (!before) {
      res.status(404).json({ message: 'Task not found' })
      return
    }

    res.status(200).json({ ...before, ...updatedTask, id: before._id.toHexString() })
  })

  router.delete('/:id', async (req, res) => {
    const taskId = req.params.id

    const result = await dbClient
      .db()
      .collection('tasks')
      .deleteOne({ _id: new ObjectId(taskId) })

    if (result.deletedCount === 0) {
      res.status(404).json({ message: 'Task not found' })
      return
    }

    res.status(204).send()
  })

  return router
}
