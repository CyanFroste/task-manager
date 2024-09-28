import { useEffect } from 'react'
import { getCurrentUser } from '../services/users'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { setCurrentUser, initializeAuth, useAuthStore } from '../stores/auth'
import { useQuery } from '@tanstack/react-query'
import NavBar from './NavBar'

function isPublicAuthRoute(pathname: string) {
  return pathname === '/login' || pathname === '/register'
}

export default function Container() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isInitialized } = useAuthStore()

  const queryCurrentUser = useQuery({
    queryKey: ['CURRENT_USER'],
    queryFn: getCurrentUser,
  })

  useEffect(() => {
    if (queryCurrentUser.isFetched && !isInitialized) initializeAuth()

    if (queryCurrentUser.isSuccess && queryCurrentUser.data) {
      setCurrentUser(queryCurrentUser.data)
    } else if (queryCurrentUser.isError) {
      setCurrentUser(null)
    }

    if (!isInitialized || location.pathname.startsWith('/api')) return

    if (!user && !isPublicAuthRoute(location.pathname)) return navigate('/login')
    if (user && isPublicAuthRoute(location.pathname)) return navigate('/')
  }, [
    isInitialized,
    location.pathname,
    navigate,
    queryCurrentUser.data,
    queryCurrentUser.isError,
    queryCurrentUser.isFetched,
    queryCurrentUser.isSuccess,
    user,
  ])

  return (
    <>
      <NavBar />
      {isInitialized && <Outlet />}
    </>
  )
}
