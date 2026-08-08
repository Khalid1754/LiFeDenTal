import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import {
  CalendarDaysIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

const statusColors = {
  Scheduled: 'bg-blue-100 text-blue-700',
  Confirmed: 'bg-green-100 text-green-700',
  CheckedIn: 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-gray-100 text-gray-600',
  Cancelled: 'bg-red-100 text-red-600',
  NoShow: 'bg-orange-100 text-orange-700',
}


const statusIcons = {
  Scheduled: ClockIcon,
  Confirmed: CheckCircleIcon,
  Completed: CheckCircleIcon,
  Cancelled: XCircleIcon,
}

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('appointments')
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [apptRes, recRes] = await Promise.all([
        api.get('/appointments/my'),
        api.get('/medicalrecords/my')
      ])
      setAppointments(apptRes.data)
      setRecords(recRes.data)
    } catch {
      console.error('Could not fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return
    try {
      await api.delete(`/appointments/${id}/cancel`, {
        data: { cancellationReason: 'Cancelled by patient' }
      })
      fetchData()
    } catch {
      console.error('Could not cancel appointment')
    }
  }

  const upcoming = appointments.filter(a =>
    a.status !== 'Cancelled' && a.status !== 'Completed' &&
    new Date(a.startTime) > new Date()
  )

  const past = appointments.filter(a =>
    a.status === 'Completed' || new Date(a.startTime) <= new Date()
  )

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      Loading...
    </div>
  )

  return (
    <div>
      {/* Welcome header */}
      <div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-2xl font-bold text-gray-900">
      Welcome, {user.firstName}!
    </h1>
    <p className="text-gray-500 text-sm mt-0.5">
      Here's an overview of your dental care.
    </p>
  </div>
  <button
    onClick={() => navigate('/book')}
    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
  >
    <CalendarDaysIcon className="w-4 h-4" />
    Book Appointment
  </button>
</div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-500">Upcoming</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{upcoming.length}</p>
          <p className="text-xs text-gray-400 mt-1">appointments scheduled</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {appointments.filter(a => a.status === 'Completed').length}
          </p>
          <p className="text-xs text-gray-400 mt-1">past visits</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <DocumentTextIcon className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-500">Medical Records</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{records.length}</p>
          <p className="text-xs text-gray-400 mt-1">journal entries</p>
        </div>
      </div>

      {/* Next appointment banner */}
      {upcoming.length > 0 && (
        <div className="bg-blue-600 rounded-xl p-5 mb-6 text-white">
          <p className="text-sm font-medium text-blue-100 mb-1">Next Appointment</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">
                {new Date(upcoming[0].startTime).toLocaleDateString('en-GB', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
              <p className="text-blue-100 text-sm mt-0.5">
                {new Date(upcoming[0].startTime).toLocaleTimeString('en-GB', {
                  hour: '2-digit', minute: '2-digit'
                })}
                {' — '}
                {new Date(upcoming[0].endTime).toLocaleTimeString('en-GB', {
                  hour: '2-digit', minute: '2-digit'
                })}
                {' · Dr. '}{upcoming[0].dentistName}
                {' · '}{upcoming[0].roomName}
              </p>
              {upcoming[0].reason && (
                <p className="text-blue-200 text-xs mt-1">Reason: {upcoming[0].reason}</p>
              )}
            </div>
            <button
              onClick={() => handleCancel(upcoming[0].id)}
              className="bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {[
          { id: 'appointments', label: 'Appointments', icon: CalendarDaysIcon },
          { id: 'records', label: 'Medical Records', icon: DocumentTextIcon },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointments tab */}
      {activeTab === 'appointments' && (
        <div className="space-y-3">
          {appointments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
              No appointments found.
            </div>
          ) : (
            appointments.map(a => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-50 rounded-lg p-2.5 text-center min-w-[56px]">
                      <p className="text-xs text-blue-500 font-medium">
                        {new Date(a.startTime).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}
                      </p>
                      <p className="text-2xl font-bold text-blue-700">
                        {new Date(a.startTime).getDate()}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Dr. {a.dentistName}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {new Date(a.startTime).toLocaleTimeString('en-GB', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                        {' — '}
                        {new Date(a.endTime).toLocaleTimeString('en-GB', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                        {' · '}{a.roomName}
                      </p>
                      {a.reason && (
                        <p className="text-xs text-gray-400 mt-1">{a.reason}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[a.status] ?? 'bg-gray-100'}`}>
                      {a.status}
                    </span>
                    {a.status === 'Scheduled' && new Date(a.startTime) > new Date() && (
                      <button
                        onClick={() => handleCancel(a.id)}
                        className="text-xs text-red-500 hover:text-red-700 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Medical Records tab */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
              No medical records found.
            </div>
          ) : (
            records.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-gray-900">{r.diagnosis}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Treatment</p>
                    <p className="text-gray-800">{r.treatment}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Dentist</p>
                    <p className="text-gray-800">Dr. {r.dentistName}</p>
                  </div>
                  {r.prescription && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Prescription</p>
                      <p className="text-gray-800">{r.prescription}</p>
                    </div>
                  )}
                  {r.notes && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Notes</p>
                      <p className="text-gray-800">{r.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}