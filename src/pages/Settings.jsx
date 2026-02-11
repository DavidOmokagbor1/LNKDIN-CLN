import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import UpgradeCta from '@/components/premium/UpgradeCta'
import PremiumModal from '@/components/premium/PremiumModal'

export default function Settings() {
  const { currentUser } = useAuthStore()
  const [premiumModalOpen, setPremiumModalOpen] = useState(false)
  const isPremium = currentUser?.isPremium === true

  return (
    <main className="min-h-screen bg-linkedin-light-gray py-6">
      {premiumModalOpen && <PremiumModal onClose={() => setPremiumModalOpen(false)} />}
      <div className="mx-auto max-w-2xl px-4">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Settings</h1>

        <section className="rounded-lg border border-linkedin-border-gray bg-linkedin-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Ad preferences</h2>
          <p className="mt-2 text-sm text-linkedin-text-gray">
            Control how ads appear in your feed and upgrade to Premium for an ad-free experience.
          </p>
          {isPremium ? (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <strong>Premium member</strong> — You have an ad-free experience.
            </div>
          ) : (
            <div className="mt-4">
              <UpgradeCta onUpgrade={() => setPremiumModalOpen(true)} />
            </div>
          )}
        </section>
      </div>
    </main>
  )
}