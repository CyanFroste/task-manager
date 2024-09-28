import { Link } from 'react-router-dom'
import { setCurrentUser, useAuthStore } from '../stores/auth'
import { logout } from '../services/auth'
import { useCallback } from 'react'

export default function NavBar() {
  const { user, isInitialized } = useAuthStore()

  const onLogout = useCallback(async () => {
    await logout()
    setCurrentUser(null)
  }, [])

  //   const onLogin = async () => {
  //     setUser(await login(email, password))
  //   }

  //   const onRegister = async () => {
  //     await register(email, password, name)
  //     await onLogin()
  //   }

  //   const onLoginWithGoogle = async () => {
  //     loginWithGoogle()
  //   }

  return (
    <header className="h-16 flex items-center bg-blue-500">
      {isInitialized && (
        <>
          {user ? (
            <nav className="ml-auto">
              <ul className="flex items-center">
                <li>
                  <button onClick={onLogout}>Log Out</button>
                </li>
              </ul>
            </nav>
          ) : (
            <nav className="ml-auto">
              <ul className="flex items-center">
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/register">Register</Link>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </header>
  )
}
