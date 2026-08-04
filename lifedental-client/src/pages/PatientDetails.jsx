import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import {
  ArrowLeftIcon,
  UserIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'

const statusColors = {
  Scheduled: 'bg-blue-100 text-blue-700',
  Confirmed: 'bg-green-100 text-green-700',
  CheckedIn: 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-gray-100 text-gray-600',
  Cancelled: 'bg-red-100 text-red-600',
  NoShow: 'bg-orange-100 text-orange-700',
}

export default function PatientDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Rollkontroll
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const allowedRoles = ['Admin', 'Receptionist', 'Dentist']
  if (!allowedRoles.includes(user.role)) {
    navigate('/dashboard')
    return null
  }

  useEffect(() => {
    fetchPatient()
  }, [id])

  const fetchPatient = async () => {
    try {
      const res = await api.get(`/receptionist/patients/${id}/details`)
      setPatient(res.data)
    } catch {
      navigate('/patients')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      Loading patient...
    </div>
  )

  if (!patient) return null

  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserIcon },
    { id: 'appointments', label: 'Appointments', icon: CalendarDaysIcon },
    { id: 'records', label: 'Medical Records', icon: DocumentTextIcon },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/patients')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeftIcon className="w-4 h-4 text-gray-500" />
        </button>
        <p className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
          onClick={() => navigate('/patients')}>
          Back to Patients
        </p>
      </div>

      {/* Patient hero */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
            {patient.firstName?.[0]}{patient.lastName?.[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                patient.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}>
                {patient.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-3">PID: P-{String(patient.id).padStart(6, '0')}</p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <EnvelopeIcon className="w-4 h-4" />
                {patient.email}
              </span>
              {patient.phoneNumber && (
                <span className="flex items-center gap-1.5">
                  <PhoneIcon className="w-4 h-4" />
                  {patient.phoneNumber}
                </span>
              )}
              {patient.dateOfBirth && (
                <span>
                  DOB: {new Date(patient.dateOfBirth).toLocaleDateString('en-GB')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map(tab => (
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

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Patient Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Full Name</span>
                <span className="font-medium">{patient.firstName} {patient.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date of Birth</span>
                <span className="font-medium">
                  {patient.dateOfBirth
                    ? new Date(patient.dateOfBirth).toLocaleDateString('en-GB')
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">{patient.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium">{patient.phoneNumber ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Address</span>
                <span className="font-medium">{patient.address ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Insurance</span>
                <span className="font-medium">{patient.insuranceInfo ?? '—'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Medical Notes</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Allergies</span>
                <span className="font-medium">{patient.allergies ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Emergency Contact</span>
                <span className="font-medium">{patient.emergencyContactName ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Emergency Phone</span>
                <span className="font-medium">{patient.emergencyContactPhone ?? '—'}</span>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="col-span-2 grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-600 font-medium mb-1">Total Appointments</p>
              <p className="text-2xl font-bold text-blue-700">{patient.appointments?.length ?? 0}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-green-600 font-medium mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-700">
                {patient.appointments?.filter(a => a.status === 'Completed').length ?? 0}
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-xs text-purple-600 font-medium mb-1">Medical Records</p>
              <p className="text-2xl font-bold text-purple-700">{patient.medicalRecords?.length ?? 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Appointments */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Date & Time</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Dentist</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Room</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Reason</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patient.appointments?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                patient.appointments?.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>{new Date(a.startTime).toLocaleDateString('en-GB')}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(a.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        {' — '}
                        {new Date(a.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{a.dentistName}</td>
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
      )}

      {/* Medical Records */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {patient.medicalRecords?.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
              No medical records found.
            </div>
          ) : (
            patient.medicalRecords?.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.diagnosis}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(r.createdAt).toLocaleDateString('en-GB')} — Dr. {r.dentistName}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Treatment</p>
                    <p className="text-gray-800">{r.treatment}</p>
                  </div>
                  {r.prescription && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Prescription</p>
                      <p className="text-gray-800">{r.prescription}</p>
                    </div>
                  )}
                  {r.notes && (
                    <div className="col-span-2">
                      <p className="text-gray-500 text-xs mb-1">Notes</p>
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