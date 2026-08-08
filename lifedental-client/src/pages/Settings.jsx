import { useState } from 'react'
import api from '../api/axios'
import {
  UserCircleIcon,
  LockClosedIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

export default function Settings() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [profileForm, setProfileForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phoneNumber: user.phoneNumber || ''
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const handleProfileSubmit = async e => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setProfileLoading(true)

    try {
      const res = await api.put('/auth/profile', profileForm)
      // Update localStorage
      const updated = { ...user, ...res.data }
      localStorage.setItem('user', JSON.stringify(updated))
      setProfileSuccess('Profile updated successfully!')
    } catch (err) {
      setProfileError(err.response?.data || 'Something went wrong.')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async e => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return
    }

    setPasswordLoading(true)
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      setPasswordSuccess('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPasswordError(err.response?.data || 'Something went wrong.')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your account settings</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-blue-100 p-2 rounded-lg">
            <UserCircleIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Profile Information</h2>
            <p className="text-xs text-gray-500">Update your personal details</p>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {user.role}
            </span>
          </div>
        </div>

        {profileSuccess && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
            <CheckCircleIcon className="w-4 h-4" />
            {profileSuccess}
          </div>
        )}
        {profileError && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {profileError}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                value={profileForm.firstName}
                onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                value={profileForm.lastName}
                onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              value={user.email}
              disabled
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              value={profileForm.phoneNumber}
              onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
              placeholder="+46 70 123 45 67"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-orange-100 p-2 rounded-lg">
            <LockClosedIcon className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Change Password</h2>
            <p className="text-xs text-gray-500">Update your login password</p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
            <CheckCircleIcon className="w-4 h-4" />
            {passwordSuccess}
          </div>
        )}
        {passwordError && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            {passwordLoading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}