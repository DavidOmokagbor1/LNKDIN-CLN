import { useAuthStore } from '@/store/authStore'
import PremiumBadge from '@/components/profile/PremiumBadge'

export default function Profile() {
  const { currentUser: user } = useAuthStore()
  return (
    <main className="min-h-screen bg-linkedin-light-gray py-6">
      <div className="mx-auto max-w-3xl px-4">
        <div className="rounded-lg border border-linkedin-border-gray bg-linkedin-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-linkedin-primary text-linkedin-white text-3xl font-bold">
              {user ? (user.firstName?.charAt(0) || user.lastName?.charAt(0) || '?') : '?'}
            </div>
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                {user ? `${user.firstName} ${user.lastName}` : ''}
                {user?.isPremium && <PremiumBadge size="lg" />}
              </h1>
              <p className="text-linkedin-text-gray">{user?.headline}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
