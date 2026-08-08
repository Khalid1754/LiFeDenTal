import { useState, useEffect } from 'react'
import api from '../api/axios'
import {
  UserPlusIcon,
  XMarkIcon,
  UsersIcon,
  ShieldCheckIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

const roleColors = {
  Admin: 'bg-purple-100 text-purple-700',
  Dentist: 'bg-blue-100 text-blue-700',
  Receptionist: 'bg-green-100 text-green-700',
  DentalNurse: 'bg-yellow-100 text-yellow-700',
  DentalHygienist: 'bg-orange-100 text-orange-700',
  Patient: 'bg-gray-100 text-gray-600',
}

const roles = [
  { value: 1, label: 'Dentist' },
  { value: 2, label: 'Dental Nurse' },
  { value: 3, label: 'Dental Hygienist' },
  { value: 4, label: 'Receptionist' },
  { value: 5, label: 'Admin' },
]

export default function AdminPanel() {
  const [staff, setStaff] = useState([])
  const [patients, setPatients] = useState([])
  const [activeTab, setActiveTab] = useState('staff')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 1,
    licenseNumber: '',
    specialization: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [staffRes, patientRes] = await Promise.all([
        api.get('/admin/staff'),
        api.get('/admin/patients')
      ])
      setStaff(staffRes.data)
      setPatients(patientRes.data)
    } catch {
      console.error('Could not fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/admin/staff', {
        ...form,
        role: parseInt(form.role),
        licenseNumber: form.licenseNumber || null,
        specialization: form.specialization || null,
        phoneNumber: form.phoneNumber || null
      })
      setSuccess('Staff member created successfully!')
      setShowModal(false)
      setForm({
        email: '', password: '', firstName: '', lastName: '',
        phoneNumber: '', role: 1, licenseNumber: '', specialization: ''
      })
      fetchData()
    } catch (err) {
      setError(err.response?.data || 'Something went wrong.')
    }
  }

  const handleDeactivate = async (userId) => {
    if (!confirm('Deactivate this user?')) return
    try {
      await api.put(`/admin/staff/${userId}/deactivate`)
      fetchData()
    } catch {
      console.error('Could not deactivate user')
    }
  }

  const handleActivate = async (userId) => {
    try {
      await api.put(`/admin/staff/${userId}/activate`)
      fetchData()
    } catch {
      console.error('Could not activate user')
    }
  }

  const tabs = [
    { id: 'staff', label: 'Staff Members', icon: ShieldCheckIcon, count: staff.length },
    { id: 'patients', label: 'All Patients', icon: UsersIcon, count: patients.length },
  ]

  const currentList = activeTab === 'staff' ? staff : patients

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage staff and users</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <UserPlusIcon className="w-4 h-4" />
          Add Staff
        </button>
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
          {success}
          <button onClick={() => setSuccess('')}>
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Staff</p>
          <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Dentists</p>
          <p className="text-2xl font-bold text-blue-600">
            {staff.filter(s => s.role === 'Dentist').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Patients</p>
          <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Active Users</p>
          <p className="text-2xl font-bold text-green-600">
            {[...staff, ...patients].filter(u => u.isActive).length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
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
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Name</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Email</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Phone</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Role</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : currentList.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  No users found.
                </td>
              </tr>
            ) : (
              currentList.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <span className="font-medium text-gray-900">
                        {u.firstName} {u.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 text-gray-500">{u.phoneNumber ?? '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.isActive ? (
                      <button
                        onClick={() => handleDeactivate(u.id)}
                        className="text-xs text-red-500 hover:text-red-700 transition flex items-center gap-1"
                      >
                        <TrashIcon className="w-3 h-3" />
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(u.id)}
                        className="text-xs text-green-600 hover:text-green-800 transition"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Add Staff Member</h2>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  value={form.phoneNumber}
                  onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {form.role === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.licenseNumber}
                      onChange={e => setForm({ ...form, licenseNumber: e.target.value })}
                      required
                      placeholder="e.g. LIC-0002"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                    <input
                      value={form.specialization}
                      onChange={e => setForm({ ...form, specialization: e.target.value })}
                      placeholder="e.g. Orthodontics"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition"
                >
                  Create Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}