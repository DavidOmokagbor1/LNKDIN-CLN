import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  Users,
  Briefcase,
  MessageSquare,
  Bell,
  Search,
  Menu,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  X,
  Crown,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import PremiumBadge from '@/components/profile/PremiumBadge'
import PremiumModal from '@/components/premium/PremiumModal'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/network', icon: Users, label: 'My Network' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/messages', icon: MessageSquare, label: 'Messaging' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
]

// Mock badge counts – in production these would come from a store or API
const NOTIFICATIONS_COUNT = 3
const MESSAGES_COUNT = 2

export default function NavBar() {
  const navigate = useNavigate()
  const { currentUser, logout, isAuthenticated } = useAuthStore()
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const profileRef = useRef(null)      // desktop Me area
  const profileRefMobile = useRef(null) // mobile Me area
  const mobileMenuRef = useRef(null)

  const isAdvertiser = currentUser?.isAdvertiser === true
  const isPremium = currentUser?.isPremium === true
  const [premiumModalOpen, setPremiumModalOpen] = useState(false)
  const userInitial = currentUser
    ? (currentUser.firstName?.charAt(0) || currentUser.lastName?.charAt(0) || '?')
    : '?'

  useEffect(() => {
    function handleClickOutside(e) {
      const outsideProfile =
        !profileRef.current?.contains(e.target) && !profileRefMobile.current?.contains(e.target)
      if (outsideProfile) setProfileOpen(false)
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) setMobileOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = () => {
    setProfileOpen(false)
    setMobileOpen(false)
    logout()
    navigate('/')
  }

  const navLinkClass = ({ isActive }) =>
    `flex flex-col items-center gap-0.5 rounded px-2 py-2 text-[10px] font-medium transition sm:px-3 ${
      isActive
        ? 'text-linkedin-white'
        : 'text-linkedin-white/90 hover:bg-linkedin-white/10 hover:text-linkedin-white'
    }`

  return (
    <header className="sticky top-0 z-50 bg-linkedin-primary shadow-md">
      {premiumModalOpen && <PremiumModal onClose={() => setPremiumModalOpen(false)} />}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:px-4">
        {/* Left: Logo + Search */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <NavLink
            to="/"
            className="flex shrink-0 items-center text-linkedin-white"
            aria-label="LinkedIn Home"
          >
            <span className="rounded bg-linkedin-white px-1.5 py-0.5 text-linkedin-primary text-[20px] font-bold leading-tight sm:text-[22px]">
              in
            </span>
          </NavLink>

          <div className="hidden flex-1 max-w-[280px] sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-linkedin-white/70" />
              <input
                type="search"
                placeholder="Search"
                className="w-full rounded-md border-0 bg-linkedin-white/15 py-2 pl-9 pr-3 text-sm text-linkedin-white placeholder-linkedin-white/70 outline-none transition focus:bg-linkedin-white/25 focus:ring-1 focus:ring-linkedin-white/50"
              />
            </div>
          </div>
        </div>

        {/* Right: Nav icons (desktop) */}
        <nav className="hidden items-center gap-0.5 md:flex">
          <NavLink to="/" className={navLinkClass} title="Home">
            <Home className="h-6 w-6" strokeWidth={1.5} />
            <span className="hidden lg:inline">Home</span>
          </NavLink>
          <NavLink to="/network" className={navLinkClass} title="My Network">
            <Users className="h-6 w-6" strokeWidth={1.5} />
            <span className="hidden lg:inline">My Network</span>
          </NavLink>
          <NavLink to="/jobs" className={navLinkClass} title="Jobs">
            <Briefcase className="h-6 w-6" strokeWidth={1.5} />
            <span className="hidden lg:inline">Jobs</span>
          </NavLink>
          <NavLink to="/messages" className={navLinkClass} title="Messaging">
            <span className="relative">
              <MessageSquare className="h-6 w-6" strokeWidth={1.5} />
              {MESSAGES_COUNT > 0 && (
                <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-linkedin-white px-1 text-[10px] font-bold text-linkedin-primary">
                  {MESSAGES_COUNT > 9 ? '9+' : MESSAGES_COUNT}
                </span>
              )}
            </span>
            <span className="hidden lg:inline">Messaging</span>
          </NavLink>
          <NavLink to="/notifications" className={navLinkClass} title="Notifications">
            <span className="relative">
              <Bell className="h-6 w-6" strokeWidth={1.5} />
              {NOTIFICATIONS_COUNT > 0 && (
                <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-linkedin-white px-1 text-[10px] font-bold text-linkedin-primary">
                  {NOTIFICATIONS_COUNT > 9 ? '9+' : NOTIFICATIONS_COUNT}
                </span>
              )}
            </span>
            <span className="hidden lg:inline">Notifications</span>
          </NavLink>

          {/* Me – Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className={`flex flex-col items-center gap-0.5 rounded px-2 py-2 text-[10px] font-medium transition sm:px-3 ${
                profileOpen
                  ? 'bg-linkedin-white/15 text-linkedin-white'
                  : 'text-linkedin-white/90 hover:bg-linkedin-white/10 hover:text-linkedin-white'
              }`}
              title="Me"
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-linkedin-white/80 bg-linkedin-primary text-linkedin-white text-xs font-semibold">
                {userInitial}
              </div>
              <span className="hidden lg:inline">Me</span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 rounded-md border border-linkedin-border-gray bg-linkedin-white py-1 shadow-lg">
                <div className="border-b border-linkedin-border-gray px-4 py-3">
                  <p className="flex items-center gap-1 truncate font-semibold text-gray-900">
                    {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User'}
                    {isPremium && <PremiumBadge size="sm" />}
                  </p>
                  <p className="truncate text-xs text-linkedin-text-gray">{currentUser?.headline}</p>
                </div>
                {!isPremium && (
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); setPremiumModalOpen(true) }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-amber-600 hover:bg-amber-50"
                  >
                    <Crown className="h-4 w-4" /> Upgrade to Premium
                  </button>
                )}
                <NavLink
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-linkedin-light-gray"
                  onClick={() => setProfileOpen(false)}
                >
                  <User className="h-4 w-4" /> View Profile
                </NavLink>
                <NavLink
                  to="/settings"
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-linkedin-light-gray"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings className="h-4 w-4" /> Settings
                </NavLink>
                {isAdvertiser && (
                  <NavLink
                    to="/ads"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-linkedin-light-gray"
                    onClick={() => setProfileOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" /> Ad Studio
                  </NavLink>
                )}
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile: Hamburger */}
        <div className="md:hidden" ref={mobileMenuRef}>
          <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded text-linkedin-white hover:bg-linkedin-white/10"
            aria-label="Open menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="relative" ref={profileRefMobile}>
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-linkedin-white/80 bg-linkedin-primary text-linkedin-white text-sm font-semibold"
            >
              {userInitial}
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 rounded-md border border-linkedin-border-gray bg-linkedin-white py-1 shadow-lg">
                <div className="border-b border-linkedin-border-gray px-4 py-3">
                  <p className="flex items-center gap-1 truncate font-semibold text-gray-900">
                    {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User'}
                    {isPremium && <PremiumBadge size="sm" />}
                  </p>
                  <p className="truncate text-xs text-linkedin-text-gray">{currentUser?.headline}</p>
                </div>
                {!isPremium && (
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); setPremiumModalOpen(true) }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-amber-600 hover:bg-amber-50"
                  >
                    <Crown className="h-4 w-4" /> Upgrade to Premium
                  </button>
                )}
                <NavLink
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-linkedin-light-gray"
                  onClick={() => setProfileOpen(false)}
                >
                  <User className="h-4 w-4" /> View Profile
                </NavLink>
                <NavLink
                  to="/settings"
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-linkedin-light-gray"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings className="h-4 w-4" /> Settings
                </NavLink>
                {isAdvertiser && (
                  <NavLink
                    to="/ads"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-linkedin-light-gray"
                    onClick={() => setProfileOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" /> Ad Studio
                  </NavLink>
                )}
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
          </div>

          {/* Mobile menu panel – inside ref so clicking it doesn't close */}
          {mobileOpen && (
            <div className="border-t border-linkedin-white/20 bg-linkedin-primary">
              <nav className="flex flex-col py-2">
                {navItems.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 text-linkedin-white ${isActive ? 'bg-linkedin-white/15 font-medium' : ''}`
                    }
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                    {label}
                    {(label === 'Messaging' && MESSAGES_COUNT > 0) || (label === 'Notifications' && NOTIFICATIONS_COUNT > 0) ? (
                      <span className="ml-auto rounded-full bg-linkedin-white px-2 py-0.5 text-xs font-bold text-linkedin-primary">
                        {label === 'Messaging' ? MESSAGES_COUNT : NOTIFICATIONS_COUNT}
                      </span>
                    ) : null}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
