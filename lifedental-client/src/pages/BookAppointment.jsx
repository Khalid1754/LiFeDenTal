import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

export default function BookAppointment() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [step, setStep] = useState(1) // 1: date, 2: dentist+slot, 3: confirm
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedDentist, setSelectedDentist] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [availability, setAvailability] = useState([])
  const [patients, setPatients] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date())
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startPadding = firstDay === 0 ? 6 : firstDay - 1

  const isReceptionist = user.role === 'Receptionist' || user.role === 'Admin'

  useEffect(() => {
    if (isReceptionist) fetchPatients()
  }, [])

  useEffect(() => {
    if (selectedDate) fetchAvailability()
  }, [selectedDate])

  const fetchPatients = async () => {
    try {
      const res = await api.get('/receptionist/patients')
      setPatients(res.data)
    } catch {
      console.error('Could not fetch patients')
    }
  }

  const fetchAvailability = async () => {
    setLoading(true)
    setAvailability([])
    setSelectedDentist(null)
    setSelectedSlot(null)
    try {
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
      const res = await api.get(`/availability/all?date=${dateStr}`)
      setAvailability(res.data)
    } catch {
      console.error('Could not fetch availability')
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async () => {
    setError('')
    try {
      const body = {
        dentistId: selectedDentist.dentistId,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason: reason || null
      }

      if (isReceptionist) {
        if (!selectedPatientId) { setError('Please select a patient.'); return }
        await api.post('/receptionist/appointments', {
          ...body,
          patientId: parseInt(selectedPatientId)
        })
      } else {
        await api.post('/appointments', body)
      }

      setSuccess(true)
    } catch (err) {
      setError(err.response?.data || 'Something went wrong.')
    }
  }

  const isWeekend = (day) => {
  const d = new Date(year, month, day)
  const dow = d.getDay()
  return dow === 0 || dow === 6 // 0 = Sunday, 6 = Saturday
}

  const isPast = (day) => {
    const d = new Date(year, month, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return d < today
  }

  const isSelected = (day) =>
    selectedDate &&
    selectedDate.getFullYear() === year &&
    selectedDate.getMonth() === month &&
    selectedDate.getDate() === day

  const isToday = (day) => {
    const today = new Date()
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
  }

  if (success) return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircleIcon className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Booked!</h2>
      <p className="text-gray-500 mb-2">
        {new Date(selectedSlot.startTime).toLocaleDateString('en-GB', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })}
      </p>
      <p className="text-gray-500 mb-6">
        {new Date(selectedSlot.startTime).toLocaleTimeString('en-GB', {
          hour: '2-digit', minute: '2-digit'
        })}
        {' — '}
        {new Date(selectedSlot.endTime).toLocaleTimeString('en-GB', {
          hour: '2-digit', minute: '2-digit'
        })}
        {' · Dr. '}{selectedDentist.dentistName}
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => navigate('/calendar')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition"
        >
          View Calendar
        </button>
        <button
          onClick={() => navigate(isReceptionist ? '/appointments' : '/patient')}
          className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeftIcon className="w-4 h-4 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-500 text-sm mt-0.5">Select a date and available time slot</p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { n: 1, label: 'Select Date' },
          { n: 2, label: 'Choose Slot' },
          { n: 3, label: 'Confirm' },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
              step >= s.n ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {s.n}
            </div>
            <span className={`text-sm ${step >= s.n ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {s.label}
            </span>
            {i < 2 && <div className="w-8 h-px bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1 — Select Date */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeftIcon className="w-4 h-4 text-gray-500" />
            </button>
            <h2 className="text-base font-semibold text-gray-900">{monthName}</h2>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRightIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startPadding }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const disabled = isWeekend(day) || isPast(day)
              const selected = isSelected(day)
              const today = isToday(day)

              return (
                <button
                  key={day}
                  disabled={disabled}
                  onClick={() => {
                    setSelectedDate(new Date(year, month, day))
                    setStep(2)
                  }}
                  className={`h-9 w-9 mx-auto rounded-full text-sm font-medium transition flex items-center justify-center ${
                    selected ? 'bg-blue-600 text-white'
                    : disabled ? 'text-gray-300 cursor-not-allowed'
                    : today ? 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                    : 'text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Weekends and past dates are not available
          </p>
        </div>
      )}

      {/* Step 2 — Choose Slot */}
      {step === 2 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setStep(1)} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <ChevronLeftIcon className="w-3 h-3" />
              Change date
            </button>
            <span className="text-sm text-gray-500">
              {selectedDate?.toLocaleDateString('en-GB', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading available slots...</div>
          ) : availability.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No dentists available on this date.</div>
          ) : (
            <div className="space-y-4">
              {availability.map(dentist => (
                <div key={dentist.dentistId} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {dentist.dentistName?.[3]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Dr. {dentist.dentistName}</p>
                      <p className="text-xs text-gray-400">
                        {dentist.timeSlots.filter(s => s.isAvailable).length} slots available
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {dentist.timeSlots.map((slot, i) => (
                      <button
                        key={i}
                        disabled={!slot.isAvailable}
                        onClick={() => {
                          setSelectedDentist(dentist)
                          setSelectedSlot(slot)
                          setStep(3)
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-medium transition ${
                          !slot.isAvailable
                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                            : selectedSlot === slot && selectedDentist?.dentistId === dentist.dentistId
                            ? 'bg-blue-600 text-white'
                            : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                        }`}
                      >
                        {new Date(slot.startTime).toLocaleTimeString('en-GB', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3 — Confirm */}
      {step === 3 && (
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setStep(2)} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <ChevronLeftIcon className="w-3 h-3" />
              Change slot
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Confirm Appointment</h2>

            {/* Summary */}
            <div className="bg-blue-50 rounded-lg p-4 mb-5 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <CalendarDaysIcon className="w-4 h-4 text-blue-600" />
                {selectedDate?.toLocaleDateString('en-GB', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <ClockIcon className="w-4 h-4 text-blue-600" />
                {new Date(selectedSlot.startTime).toLocaleTimeString('en-GB', {
                  hour: '2-digit', minute: '2-digit'
                })}
                {' — '}
                {new Date(selectedSlot.endTime).toLocaleTimeString('en-GB', {
                  hour: '2-digit', minute: '2-digit'
                })}
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <UserIcon className="w-4 h-4 text-blue-600" />
                Dr. {selectedDentist.dentistName}
              </div>
            </div>

            {/* Patient selector for receptionist */}
            {isReceptionist && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select patient...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for visit
              </label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Routine checkup, Toothache..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={handleBook}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}