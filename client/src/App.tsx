import { useEffect, useState } from 'react'
import { login, loginWithGoogle, logout, register } from './services/auth'
import type { User } from './types'
import { getCurrentUser } from './services/users'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUser(await getCurrentUser())
      } catch (err) {
        console.error(err)
        console.log('Not authenticated')
      }
    }

    fetchUser()
  }, [])

  const onLoginWithGoogle = async () => {
    loginWithGoogle()
  }

  const onLogout = async () => {
    await logout()
    setUser(null)
  }

  const onLogin = async () => {
    setUser(await login(email, password))
  }

  const onRegister = async () => {
    await register(email, password, name)
    await onLogin()
  }

  return (
    <div>
      <h1>Google Authentication with TypeScript</h1>

      {user ? (
        <div>
          <h2>Welcome, {user.name}</h2>
          <pre>{JSON.stringify(user, null, 2)}</pre>
          <button onClick={onLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <h2>Login</h2>
          <input type="email" placeholder="Email" onChange={e => setEmail(e.currentTarget.value)} />
          <input type="password" placeholder="Password" onChange={e => setPassword(e.currentTarget.value)} />
          <button onClick={onLogin}>Login</button>

          <h2>Register</h2>
          <input type="text" placeholder="Name" onChange={e => setName(e.currentTarget.value)} />
          <input type="email" placeholder="Email" onChange={e => setEmail(e.currentTarget.value)} />
          <input type="password" placeholder="Password" onChange={e => setPassword(e.currentTarget.value)} />

          <button onClick={onRegister}>Register</button>
          <button onClick={onLoginWithGoogle}>Login with Google</button>
        </div>
      )}
    </div>
  )
}
