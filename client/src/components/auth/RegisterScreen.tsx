import { Link, useNavigate } from 'react-router-dom'
import { login, loginWithGoogle, register } from '../../services/auth'
import { useCallback, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { setCurrentUser } from '../../stores/auth'
import { parseGenericError } from '../../utils'

type RegisterCredentials = {
  email: string
  name: string
  password: string
  confirmPassword: string
}

export default function RegisterScreen() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [errors, setErrors] = useState<string[]>([])

  const mutationRegister = useMutation({
    mutationFn: async ({ email, password, name }: RegisterCredentials) => {
      await register(email, password, name)
      return await login(email, password)
    },
    onSuccess: user => {
      setErrors([])
      queryClient.invalidateQueries({ queryKey: ['CURRENT_USER'] })
      setCurrentUser(user)
      navigate('/')
    },
    onError: (err: unknown) => {
      const parsed = parseGenericError(err)
      setErrors(prev => prev.concat(parsed.message))
    },
  })

  const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
    async evt => {
      evt.preventDefault()

      const email = (evt.currentTarget.elements.namedItem('email') as HTMLInputElement).value
      const name = (evt.currentTarget.elements.namedItem('name') as HTMLInputElement).value
      const password = (evt.currentTarget.elements.namedItem('password') as HTMLInputElement).value
      const confirmPassword = (evt.currentTarget.elements.namedItem('confirmPassword') as HTMLInputElement).value

      if (!email) return setErrors(['Email is required.'])
      if (!password) return setErrors(['Password is required.'])
      if (!name) return setErrors(['Name is required.'])
      if (password !== confirmPassword) return setErrors(['Passwords do not match.'])

      setErrors([])
      mutationRegister.mutate({ name, email, password, confirmPassword })
    },
    [mutationRegister],
  )

  return (
    <div>
      <div className="container py-10">
        <div className="flex flex-col max-w-screen-sm mx-auto gap-6">
          <h2 className="text-4xl text-blue-500 font-semibold">Signup</h2>

          <form className="border-2 rounded-md shadow-lg border-blue-500 p-6 flex flex-col gap-4" onSubmit={onSubmit}>
            <label className="text-gray-600 flex flex-col gap-1">
              <span className="text-sm font-medium">Name</span>
              <input name="name" type="text" placeholder="Name" className="p-2 border rounded" />
            </label>

            <label className="text-gray-600 flex flex-col gap-1">
              <span className="text-sm font-medium">Email</span>
              <input name="email" type="email" placeholder="Email" className="p-2 border rounded" />
            </label>

            <label className="text-gray-600 flex flex-col gap-1">
              <span className="text-sm font-medium">Password</span>
              <input name="password" type="password" placeholder="Password" className="p-2 border rounded" />
            </label>

            <label className="text-gray-600 flex flex-col gap-1">
              <span className="text-sm font-medium">Confirm Password</span>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                className="p-2 border rounded"
              />
            </label>

            {errors.length > 0 && (
              <div className="text-red-500 text-sm">
                <ul>
                  {errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <button type="submit" className="bg-blue-500 text-white font-medium p-2 rounded">
              Signup
            </button>

            <p className="text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-500">
                Login
              </Link>
            </p>

            <button
              type="button"
              className="bg-blue-500 text-white font-medium py-2 px-4 rounded self-center"
              onClick={() => loginWithGoogle()}>
              Login with <span className="font-bold text-xl">Google</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
