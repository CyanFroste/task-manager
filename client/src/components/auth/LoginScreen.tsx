import { Link, useNavigate } from 'react-router-dom'
import { login, loginWithGoogle } from '../../services/auth'
import { useCallback, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { parseGenericError } from '../../utils'
import { setCurrentUser } from '../../stores/auth'

type LoginCredentials = { email: string; password: string }

export default function LoginScreen() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [errors, setErrors] = useState<string[]>([])

  const mutationLogin = useMutation({
    mutationFn: ({ email, password }: LoginCredentials) => login(email, password),
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
      const password = (evt.currentTarget.elements.namedItem('password') as HTMLInputElement).value

      if (!email) return setErrors(['Email is required.'])
      if (!password) return setErrors(['Password is required.'])

      setErrors([])
      mutationLogin.mutate({ email, password })
    },
    [mutationLogin],
  )

  return (
    <div>
      <div className="container py-10">
        <div className="flex flex-col max-w-screen-sm mx-auto gap-6">
          <h2 className="text-4xl text-blue-500 font-semibold">Login</h2>

          <form className="border-2 rounded-md shadow-lg border-blue-500 p-6 flex flex-col gap-4" onSubmit={onSubmit}>
            <label className="text-gray-600 flex flex-col gap-1">
              <span className="text-sm font-medium">Email</span>
              <input name="email" type="email" placeholder="Email" className="p-2 border rounded" />
            </label>

            <label className="text-gray-600 flex flex-col gap-1">
              <span className="text-sm font-medium">Password</span>
              <input name="password" type="password" placeholder="Password" className="p-2 border rounded" />
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
              Login
            </button>

            <p className="text-center">
              Do you have an account?{' '}
              <Link to="/register" className="text-blue-500">
                Signup
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
