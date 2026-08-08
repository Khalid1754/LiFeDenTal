import { useState, useEffect } from 'react'
import api from '../api/axios'
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const statusColors = {
  Scheduled: 'bg-blue-500',
  Confirmed: 'bg-green-500',
  CheckedIn: 'bg-yellow-500',
  Completed: 'bg-gray-400',
  Cancelled: 'bg-red-500',
  NoShow: 'bg-orange-500',
}

const statusBadge = {
  Scheduled: 'bg-blue-100 text-blue-700',
  Confirmed: 'bg-green-100 text-green-700',
  CheckedIn: 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-gray-100 text-gray-600',
  Cancelled: 'bg-red-100 text-red-600',
  NoShow: 'bg-orange-100 text-orange-700',
}

export default function Calendar() {
  const [appointments, setAppointments] = useState([])
  const [search, setSearch] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => { fetchAppointments() }, [])

  const fetchAppointments = async () => {
    try {
      let res
      if (user.role === 'Patient') res = await api.get('/appointments/my')
      else if (user.role === 'Dentist') res = await api.get('/appointments/dentist')
      else res = await api.get('/receptionist/appointments')
      setAppointments(res.data)
    } catch {
      console.error('Could not fetch appointments')
    } finally {
      setLoading(false)
    }
  }

  const filtered = appointments.filter(a => {
    if (!search.trim()) return true
    return (
      a.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      a.dentistName?.toLowerCase().includes(search.toLowerCase())
    )
  })

  // Calendar helpers
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startPadding = firstDay === 0 ? 6 : firstDay - 1 // Monday start

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getAppointmentsForDay = (day) => {
    return filtered.filter(a => {
      const d = new Date(a.startTime)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  const today = new Date()
  const isToday = (day) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  const dayAppointments = selectedDay ? getAppointmentsForDay(selectedDay) : []

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {user.role === 'Patient' ? 'Your scheduled appointments'
              : user.role === 'Dentist' ? 'Your patient schedule'
              : 'All clinic appointments'}
          </p>
        </div>
        {(user.role === 'Receptionist' || user.role === 'Admin') && (
          <div className="relative w-72">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by patient or dentist..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ChevronLeftIcon className="w-4 h-4 text-gray-500" />
            </button>
            <h2 className="text-base font-semibold text-gray-900">{monthName}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ChevronRightIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Padding */}
            {Array.from({ length: startPadding }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dayAppts = getAppointmentsForDay(day)
              const isSelected = selectedDay === day
              const isTodayDay = isToday(day)

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[64px] p-1.5 rounded-lg cursor-pointer transition border ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                    isTodayDay ? 'bg-blue-600 text-white' : 'text-gray-700'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayAppts.slice(0, 2).map(a => (
                      <div
                        key={a.id}
                        className={`text-white text-xs px-1 py-0.5 rounded truncate ${statusColors[a.status] ?? 'bg-blue-500'}`}
                      >
                        {new Date(a.startTime).toLocaleTimeString('en-GB', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                        {user.role !== 'Patient' ? ` ${a.patientName?.split(' ')[0]}` : ` Dr. ${a.dentistName?.split(' ')[0]}`}
                      </div>
                    ))}
                    {dayAppts.length > 2 && (
                      <div className="text-xs text-gray-400 pl-1">+{dayAppts.length - 2} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                {status}
              </div>
            ))}
          </div>
        </div>

        {/* Day detail panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            {selectedDay
              ? `${selectedDay} ${currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`
              : 'Select a day'}
          </h3>

          {!selectedDay ? (
            <p className="text-sm text-gray-400">Click on a day to see appointments.</p>
          ) : dayAppointments.length === 0 ? (
            <p className="text-sm text-gray-400">No appointments on this day.</p>
          ) : (
            <div className="space-y-3">
              {dayAppointments.map(a => (
                <div
                  key={a.id}
                  onClick={() => setSelectedEvent(a)}
                  className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-900">
                      {new Date(a.startTime).toLocaleTimeString('en-GB', {
                        hour: '2-digit', minute: '2-digit'
                      })}
                      {' — '}
                      {new Date(a.endTime).toLocaleTimeString('en-GB', {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[a.status] ?? 'bg-gray-100'}`}>
                      {a.status}
                    </span>
                  </div>
                  {user.role !== 'Patient' && (
                    <p className="text-xs text-gray-700 font-medium">{a.patientName}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {user.role !== 'Dentist' ? `Dr. ${a.dentistName} · ` : ''}{a.roomName}
                  </p>
                  {a.reason && <p className="text-xs text-gray-400 mt-1">{a.reason}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Appointment Details</h2>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {user.role !== 'Patient' && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Patient</span>
                  <span className="font-medium">{selectedEvent.patientName}</span>
                </div>
              )}
              {user.role !== 'Dentist' && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Dentist</span>
                  <span className="font-medium">Dr. {selectedEvent.dentistName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Room</span>
                <span className="font-medium">{selectedEvent.roomName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">
                  {new Date(selectedEvent.startTime).toLocaleDateString('en-GB', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-medium">
                  {new Date(selectedEvent.startTime).toLocaleTimeString('en-GB', {
                    hour: '2-digit', minute: '2-digit'
                  })}
                  {' — '}
                  {new Date(selectedEvent.endTime).toLocaleTimeString('en-GB', {
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              {selectedEvent.reason && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Reason</span>
                  <span className="font-medium">{selectedEvent.reason}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge[selectedEvent.status] ?? 'bg-gray-100'}`}>
                  {selectedEvent.status}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="w-full mt-5 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}