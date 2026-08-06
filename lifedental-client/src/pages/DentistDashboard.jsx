import { useState, useEffect } from 'react'
import api from '../api/axios'
import {
  CalendarDaysIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const statusColors = {
  Scheduled: 'bg-blue-100 text-blue-700',
  Confirmed: 'bg-green-100 text-green-700',
  CheckedIn: 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-gray-100 text-gray-600',
  Cancelled: 'bg-red-100 text-red-600',
  NoShow: 'bg-orange-100 text-orange-700',
}

export default function DentistDashboard() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('appointments')
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [recordError, setRecordError] = useState('')
  const [recordSuccess, setRecordSuccess] = useState('')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [recordForm, setRecordForm] = useState({
    patientId: '',
    appointmentId: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    prescription: ''
  })

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/dentist')
      setAppointments(res.data)
    } catch {
      console.error('Could not fetch appointments')
    } finally {
      setLoading(false)
    }
  }

  const openRecordModal = (appointment) => {
    setSelectedAppointment(appointment)
    setRecordForm({
      patientId: appointment.patientId,
      appointmentId: appointment.id,
      diagnosis: '',
      treatment: '',
      notes: '',
      prescription: ''
    })
    setRecordError('')
    setRecordSuccess('')
    setShowRecordModal(true)
  }

  const handleRecordSubmit = async e => {
    e.preventDefault()
    setRecordError('')
    try {
      await api.post('/medicalrecords', {
        patientId: parseInt(recordForm.patientId),
        appointmentId: parseInt(recordForm.appointmentId),
        diagnosis: recordForm.diagnosis,
        treatment: recordForm.treatment,
        notes: recordForm.notes || null,
        prescription: recordForm.prescription || null
      })
      setRecordSuccess('Medical record saved!')
      setShowRecordModal(false)
      fetchAppointments()
    } catch (err) {
      setRecordError(err.response?.data || 'Something went wrong.')
    }
  }

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const upcoming = appointments.filter(a =>
    a.status !== 'Cancelled' && a.status !== 'Completed' &&
    new Date(a.startTime) > new Date()
  )

  const todayAppts = appointments.filter(a => {
    const d = new Date(a.startTime)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      Loading...
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, Dr. {user.firstName}!
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">{today}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">Today's Appointments</p>
            <div className="bg-blue-100 p-2 rounded-lg">
              <CalendarDaysIcon className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{todayAppts.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">Upcoming</p>
            <div className="bg-purple-100 p-2 rounded-lg">
              <ClockIcon className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{upcoming.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">Completed</p>
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {appointments.filter(a => a.status === 'Completed').length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {[
          { id: 'appointments', label: 'My Appointments', icon: CalendarDaysIcon },
          { id: 'today', label: "Today's Schedule", icon: ClockIcon },
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

      {/* All appointments */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Date & Time</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Patient</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Room</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Reason</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                appointments.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {new Date(a.startTime).toLocaleDateString('en-GB')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(a.startTime).toLocaleTimeString('en-GB', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                        {' — '}
                        {new Date(a.endTime).toLocaleTimeString('en-GB', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                          {a.patientName?.[0]}
                        </div>
                        <span className="text-gray-900">{a.patientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{a.roomName}</td>
                    <td className="px-6 py-4 text-gray-500">{a.reason ?? '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[a.status] ?? 'bg-gray-100'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {a.status !== 'Cancelled' && (
                        <button
                          onClick={() => openRecordModal(a)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition"
                        >
                          <PlusIcon className="w-3 h-3" />
                          Add Record
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Today's schedule */}
      {activeTab === 'today' && (
        <div className="space-y-3">
          {todayAppts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
              No appointments scheduled for today.
            </div>
          ) : (
            todayAppts.map(a => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-50 rounded-lg p-2.5 text-center min-w-[56px]">
                      <p className="text-lg font-bold text-blue-700">
                        {new Date(a.startTime).toLocaleTimeString('en-GB', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{a.patientName}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
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
                    {a.status !== 'Cancelled' && (
                      <button
                        onClick={() => openRecordModal(a)}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg transition"
                      >
                        <PlusIcon className="w-3 h-3" />
                        Add Record
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Medical Record Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add Medical Record</h2>
                {selectedAppointment && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    Patient: {selectedAppointment.patientName}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowRecordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {recordError && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                {recordError}
              </div>
            )}

            <form onSubmit={handleRecordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={recordForm.diagnosis}
                  onChange={e => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                  required
                  placeholder="e.g. Caries tooth 46"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={recordForm.treatment}
                  onChange={e => setRecordForm({ ...recordForm, treatment: e.target.value })}
                  required
                  placeholder="e.g. Filling composite"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prescription</label>
                <input
                  type="text"
                  value={recordForm.prescription}
                  onChange={e => setRecordForm({ ...recordForm, prescription: e.target.value })}
                  placeholder="e.g. Ibuprofen 400mg"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={recordForm.notes}
                  onChange={e => setRecordForm({ ...recordForm, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}