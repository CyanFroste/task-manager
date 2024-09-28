import { useEffect } from 'react'
import { getCurrentUser } from '../services/users'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { setCurrentUser, initializeAuth, useAuthStore } from '../stores/auth'
import { useQuery } from '@tanstack/react-query'
import NavBar from './NavBar'

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
    }

    if (!isInitialized) return

    if (!user) return navigate('/login')
    if (user && location.pathname === '/login') return navigate('/')
  }, [
    isInitialized,
    location.pathname,
    navigate,
    queryCurrentUser.data,
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
