import { Link, useNavigate } from 'react-router-dom'
import { setCurrentUser, useAuthStore } from '../stores/auth'
import { logout } from '../services/auth'
import { useCallback } from 'react'
import { ClipboardListIcon } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

export default function NavBar() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isInitialized } = useAuthStore()

  const onLogout = useCallback(async () => {
    await logout()

    queryClient.invalidateQueries({ queryKey: ['CURRENT_USER'] })
    setCurrentUser(null)
    navigate('/login')
  }, [navigate, queryClient])

  return (
    <header className="bg-blue-500">
      {isInitialized && (
        <>
          <nav className="h-16 container flex items-center text-white">
            <Link to="/" className="text-3xl">
              <ClipboardListIcon />
            </Link>

            <ul className="ml-auto flex items-center gap-4">
              {user ? (
                <li>
                  <button className="py-2 px-4 rounded bg-white text-blue-500 font-medium" onClick={onLogout}>
                    Log Out
                  </button>
                </li>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="py-2 px-4 rounded bg-white text-blue-500 font-medium">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/register">Signup</Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </>
      )}
    </header>
  )
}
