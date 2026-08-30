import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import NewPatient from './pages/NewPatient'
import Appointments from './pages/Appointments'
import PatientDetails from './pages/PatientDetails'
import PatientDashboard from './pages/PatientDashboard'
import DentistDashboard from './pages/DentistDashboard'
import Calendar from './pages/Calendar'
import AdminPanel from './pages/AdminPanel'
import Settings from './pages/Settings'
import BookAppointment from './pages/BookAppointment'
import Messages from './pages/Messages'


function PrivateRoute({ children }) {
  const user = localStorage.getItem('user')
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="book" element={<BookAppointment />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="dentist" element={<DentistDashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="patients/new" element={<NewPatient />} />
          <Route path="messages" element={<Messages />} />
          <Route path="patient" element={<PatientDashboard />} />
          <Route path="patients/:id" element={<PatientDetails />} />
          <Route path="appointments" element={<Appointments />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}