import { useState } from 'react'
import { Crown } from 'lucide-react'

export default function PremiumBadge({ className = '', size = 'sm' }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const iconSize = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'

  return (
    <span
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Crown className={`${iconSize} text-amber-500`} aria-hidden />
      {showTooltip && (
        <span
          className="absolute left-1/2 bottom-full z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white"
          role="tooltip"
        >
          Premium Member
        </span>
      )}
    </span>
  )
}
