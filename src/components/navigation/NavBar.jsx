import { NavLink } from 'react-router-dom'
import { Home, Users, Briefcase, MessageCircle, Bell } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/network', icon: Users, label: 'My Network' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/messages', icon: MessageCircle, label: 'Messaging' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
]

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-linkedin-border-gray bg-linkedin-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
        <NavLink
          to="/"
          className="flex shrink-0 items-center text-2xl font-bold text-linkedin-primary"
        >
          <span className="rounded bg-linkedin-primary px-1.5 py-0.5 text-linkedin-white text-[22px] font-bold leading-tight">
            in
          </span>
        </NavLink>

        <nav className="flex items-center gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded px-3 py-2 text-[10px] font-medium transition sm:px-4 ${
                  isActive
                    ? 'text-linkedin-primary'
                    : 'text-linkedin-text-gray hover:bg-linkedin-light-gray hover:text-linkedin-primary-dark'
                }`
              }
              title={label}
            >
              <Icon className="h-6 w-6" strokeWidth={1.5} />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linkedin-primary text-linkedin-white text-sm font-semibold">
            J
          </div>
        </div>
      </div>
    </header>
  )
}
