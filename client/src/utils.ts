import { AxiosError } from 'axios'
import { GenericResponse } from './types'

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
