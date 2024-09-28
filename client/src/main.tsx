import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Container from './components/Container'
import HomeScreen from './components/home/HomeScreen'
import LoginScreen from './components/auth/LoginScreen'
import RegisterScreen from './components/auth/RegisterScreen'

import './index.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: 2 * 60 * 1000, refetchOnMount: 'always' } },
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <Container />,
    children: [
      { path: '', element: <HomeScreen /> },
      { path: 'login', element: <LoginScreen /> },
      { path: 'register', element: <RegisterScreen /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
