import { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import api from '../api/axios'
import {
  HomeIcon, UsersIcon, CalendarDaysIcon, CalendarIcon,
  BeakerIcon, CreditCardIcon, ChartBarIcon, ArchiveBoxIcon,
  ChatBubbleLeftIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

const user = JSON.parse(localStorage.getItem('user') || '{}')

const allNavItems = [
  { to: '/dashboard', icon: HomeIcon, label: 'Dashboard', roles: ['Admin', 'Receptionist', 'Dentist', 'DentalNurse', 'DentalHygienist'] },
  { to: '/patient', icon: HomeIcon, label: 'Dashboard', roles: ['Patient'] },
  { to: '/dentist', icon: HomeIcon, label: 'Dashboard', roles: ['Dentist'] },
  { to: '/patients', icon: UsersIcon, label: 'Patients', roles: ['Admin', 'Receptionist', 'Dentist'] },
  { to: '/appointments', icon: CalendarDaysIcon, label: 'Appointments', roles: ['Admin', 'Receptionist'] },
  { to: '/calendar', icon: CalendarIcon, label: 'Calendar', roles: ['Admin', 'Receptionist', 'Dentist'] },
  { to: '/treatments', icon: BeakerIcon, label: 'Treatments', roles: ['Admin', 'Receptionist', 'Dentist'] },
  { to: '/billing', icon: CreditCardIcon, label: 'Billing', roles: ['Admin', 'Receptionist'] },
  { to: '/reports', icon: ChartBarIcon, label: 'Reports', roles: ['Admin'] },
  { to: '/messages', icon: ChatBubbleLeftIcon, label: 'Messages', roles: ['Admin', 'Receptionist', 'Dentist', 'Patient'] },
  { to: '/settings', icon: Cog6ToothIcon, label: 'Settings', roles: ['Admin', 'Receptionist', 'Dentist', 'Patient'] },
]

const navItems = allNavItems.filter(item => item.roles.includes(user.role))

export default function Layout() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const today = new Date().toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })

  const handleLogout = async () => {
    await api.post('/auth/logout')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 flex flex-col">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm">LiFeDenTal</p>
              <p className="text-blue-400 text-xs">DENTAL CLINIC</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Today's Summary */}
        <div className="mx-3 mb-3 bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-blue-600 rounded p-1">
              <CalendarDaysIcon className="w-3 h-3 text-white" />
            </div>
            <p className="text-white text-xs font-semibold">Today's Summary</p>
          </div>
          <p className="text-gray-400 text-xs mb-3">{today}</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Appointments</span><span className="text-white font-medium">8</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Patients Seen</span><span className="text-white font-medium">5</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>New Patients</span><span className="text-white font-medium">1</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Revenue</span><span className="text-green-400 font-medium">$1,240</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="px-3 pb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}