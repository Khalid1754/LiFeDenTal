import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import {
  UsersIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

const statusColors = {
  Scheduled: 'bg-blue-100 text-blue-700',
  Confirmed: 'bg-green-100 text-green-700',
  CheckedIn: 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-gray-100 text-gray-600',
  Cancelled: 'bg-red-100 text-red-600',
  NoShow: 'bg-orange-100 text-orange-700',
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await api.get('/receptionist/dashboard')
      setStats(res.data)
    } catch {
      console.error('Could not fetch dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      Loading dashboard...
    </div>
  )

  const statCards = [
    {
      label: 'Total Patients',
      value: stats?.totalPatients ?? 0,
      icon: UsersIcon,
      color: 'bg-blue-100 text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: "Today's Appointments",
      value: stats?.appointmentsToday ?? 0,
      icon: CalendarDaysIcon,
      color: 'bg-purple-100 text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Completed Today',
      value: stats?.completedToday ?? 0,
      icon: CheckCircleIcon,
      color: 'bg-green-100 text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Cancelled Today',
      value: stats?.cancelledToday ?? 0,
      icon: XCircleIcon,
      color: 'bg-red-100 text-red-600',
      bg: 'bg-red-50',
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user.firstName}!
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">{today}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{card.label}</p>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Today's appointments */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">
              Today's Appointments
            </h2>
          </div>
          <button
            onClick={() => navigate('/appointments')}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            View all →
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Time</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Patient</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Dentist</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Room</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Reason</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stats?.todayAppointments?.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  No appointments scheduled for today.
                </td>
              </tr>
            ) : (
              stats?.todayAppointments?.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {new Date(a.startTime).toLocaleTimeString('en-GB', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                    <span className="text-gray-400 text-xs"> — </span>
                    {new Date(a.endTime).toLocaleTimeString('en-GB', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                        {a.patientName?.[0]}
                      </div>
                      <span className="text-gray-900">{a.patientName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">Dr. {a.dentistName}</td>
                  <td className="px-6 py-4 text-gray-500">{a.roomName}</td>
                  <td className="px-6 py-4 text-gray-500">{a.reason ?? '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[a.status] ?? 'bg-gray-100'}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}