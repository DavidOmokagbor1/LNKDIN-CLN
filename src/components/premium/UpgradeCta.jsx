import { Crown } from 'lucide-react'

export default function UpgradeCta({ onUpgrade, compact = false }) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onUpgrade}
        className="flex items-center gap-1.5 rounded-full border border-amber-500 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100"
      >
        <Crown className="h-4 w-4" /> Upgrade to Premium
      </button>
    )
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
          <Crown className="h-6 w-6 text-amber-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900">Go ad-free with Premium</h3>
          <p className="text-sm text-linkedin-text-gray">Enjoy an ad-free experience, InMail credits, and more.</p>
        </div>
        <button
          type="button"
          onClick={onUpgrade}
          className="shrink-0 rounded-full border-2 border-amber-500 bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
        >
          Upgrade
        </button>
      </div>
    </div>
  )
}
