import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { MagnifyingGlassIcon, UserPlusIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const res = await api.get('/receptionist/patients')
      setPatients(res.data)
    } catch (err) {
      console.error('Kunde inte hämta patienter', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = patients.filter(p =>
    `${p.firstName} ${p.lastName} ${p.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 text-sm mt-0.5">{patients.length} patienter totalt</p>
        </div>
        <button
          onClick={() => navigate('/patients/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <UserPlusIcon className="w-4 h-4" />
          Ny patient
        </button>
      </div>

      {/* Sökfält */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Sök på namn eller email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabell */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Patient</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Email</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Telefon</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Födelsedatum</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  Laddar patienter...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  Inga patienter hittades.
                </td>
              </tr>
            ) : (
              filtered.map(p => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/patients/${p.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                        {p.firstName?.[0]}{p.lastName?.[0]}
                      </div>
                      <span className="font-medium text-gray-900">
                        {p.firstName} {p.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{p.email}</td>
                  <td className="px-6 py-4 text-gray-500">{p.phoneNumber ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {p.dateOfBirth
                      ? new Date(p.dateOfBirth).toLocaleDateString('sv-SE')
                      : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      p.isActive !== false
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {p.isActive !== false ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    <ChevronRightIcon className="w-4 h-4" />
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