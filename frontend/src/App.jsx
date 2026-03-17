import axios from 'axios'
// In production (Vercel), VITE_API_URL = your Render backend URL
// In local dev, it's empty and Vite proxy handles /api/* → localhost:5000
axios.defaults.baseURL = import.meta.env.VITE_API_URL || ''

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'
import Login from './pages/Login'
import MyTeams from './pages/MyTeams'
import MyTasks from './pages/MyTasks'
import Register from './pages/Register'
import SuperAdminUsers from './pages/SuperAdminUsers'
import TaskCreate from './pages/TaskCreate'
import TeamCreate from './pages/TeamCreate'
import TeamView from './pages/TeamView'
import VerifyEmail from './pages/VerifyEmail' // ✅ Add this import
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'


// Attach token from storage if present
const token = sessionStorage.getItem('token') || localStorage.getItem('token')
if (token) axios.defaults.headers.common.Authorization = 'Bearer ' + token

function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

function RoleRoute({ roles, children }) {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token')
  const userRole = sessionStorage.getItem('userRole') || localStorage.getItem('userRole')
  if (!token) return <Navigate to="/login" replace />
  return roles.includes(userRole) ? children : <Navigate to="/dashboard" replace />
}

function HomeRoute() {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token')
  return token ? <Navigate to="/dashboard" replace /> : <Landing />
}

function App() {
  return (
    <BrowserRouter>
      <div className="container mt-3">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/teams" element={<RoleRoute roles={['Admin', 'SuperAdmin']}><MyTeams /></RoleRoute>} />
          <Route path="/teams/create" element={<RoleRoute roles={['Admin', 'SuperAdmin']}><TeamCreate /></RoleRoute>} />
          <Route path="/teams/:id" element={<RoleRoute roles={['Admin', 'SuperAdmin']}><TeamView /></RoleRoute>} />
          <Route path="/tasks/my" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
          <Route path="/tasks/create" element={<RoleRoute roles={['Admin', 'SuperAdmin']}><TaskCreate /></RoleRoute>} />
          <Route path="/superadmin/users" element={<RoleRoute roles={['SuperAdmin']}><SuperAdminUsers /></RoleRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
