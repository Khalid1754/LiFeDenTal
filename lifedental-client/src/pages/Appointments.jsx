import { useState, useEffect } from 'react'
import api from '../api/axios'
import { CalendarDaysIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

const statusColors = {
  Scheduled: 'bg-blue-100 text-blue-700',
  Confirmed: 'bg-green-100 text-green-700',
  CheckedIn: 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-gray-100 text-gray-600',
  Cancelled: 'bg-red-100 text-red-600',
  NoShow: 'bg-orange-100 text-orange-700',
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [dentists, setDentists] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [form, setForm] = useState({
    patientId: '',
    dentistId: '',
    startTime: '',
    endTime: '',
    reason: ''
  })

  useEffect(() => {
    fetchAppointments()
    fetchDentists()
    fetchPatients()
  }, [])

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/receptionist/appointments')
      setAppointments(res.data)
    } catch {
      console.error('Kunde inte hämta bokningar')
    } finally {
      setLoading(false)
    }
  }

  const fetchDentists = async () => {
  try {
    const res = await api.get('/receptionist/dentists')
    setDentists(res.data)
  } catch {
    console.error('Kunde inte hämta tandläkare')
  }
}

  const fetchPatients = async () => {
    try {
      const res = await api.get('/receptionist/patients')
      setPatients(res.data)
    } catch {
      console.error('Kunde inte hämta patienter')
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/receptionist/appointments', {
        patientId: parseInt(form.patientId),
        dentistId: parseInt(form.dentistId),
        startTime: form.startTime,
        endTime: form.endTime,
        reason: form.reason || null
      })
      setSuccess('Bokning skapad!')
      setShowModal(false)
      setForm({ patientId: '', dentistId: '', startTime: '', endTime: '', reason: '' })
      fetchAppointments()
    } catch (err) {
      setError(err.response?.data || 'Något gick fel.')
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Vill du avboka denna tid?')) return
    try {
      await api.delete(`/receptionist/appointments/${id}/cancel`, {
        data: { cancellationReason: 'Avbokad av receptionist' }
      })
      fetchAppointments()
    } catch {
      console.error('Kunde inte avboka')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 text-sm mt-0.5">{appointments.length} bokningar totalt</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <PlusIcon className="w-4 h-4" />
          Ny bokning
        </button>
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      {/* Bokningslista */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Patient</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Tandläkare</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Rum</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Datum & Tid</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Anledning</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  Laddar bokningar...
                </td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  Inga bokningar hittades.
                </td>
              </tr>
            ) : (
              appointments.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{a.patientName}</td>
                  <td className="px-6 py-4 text-gray-500">{a.dentistName}</td>
                  <td className="px-6 py-4 text-gray-500">{a.roomName}</td>
                  <td className="px-6 py-4 text-gray-500">
                    <div>{new Date(a.startTime).toLocaleDateString('sv-SE')}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(a.startTime).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                      {' — '}
                      {new Date(a.endTime).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{a.reason ?? '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {a.status !== 'Cancelled' && a.status !== 'Completed' && (
                      <button
                        onClick={() => handleCancel(a.id)}
                        className="text-red-400 hover:text-red-600 transition"
                        title="Avboka"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal — Ny bokning */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Ny bokning</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <select
                  value={form.patientId}
                  onChange={e => setForm({ ...form, patientId: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Välj patient...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tandläkare</label>
                <select
                  value={form.dentistId}
                  onChange={e => setForm({ ...form, dentistId: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Välj tandläkare...</option>
                  {dentists.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.firstName} {d.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Starttid</label>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={e => setForm({ ...form, startTime: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sluttid</label>
                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={e => setForm({ ...form, endTime: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anledning</label>
                <input
                  type="text"
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  placeholder="T.ex. Kontroll, Tandvärk..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition"
                >
                  Skapa bokning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}