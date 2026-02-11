import { useState } from 'react'
import { X, Check, Crown, Mail, BarChart3, Search, Award, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const PREMIUM_BENEFITS = [
  { icon: Sparkles, text: 'Ad-free experience' },
  { icon: Mail, text: 'InMail credits (5/month)' },
  { icon: BarChart3, text: '"Who viewed your profile" analytics' },
  { icon: Search, text: 'Advanced search filters' },
  { icon: Award, text: 'Profile badge' },
]

const PLANS = [
  { id: 'monthly', label: 'Monthly', price: 29.99, period: '/month', savings: null },
  { id: 'annual', label: 'Annual', price: 287.9, period: '/year', savings: '20% off', popular: true },
]

export default function PremiumModal({ onClose }) {
  const { upgradeToPremium } = useAuthStore()
  const [step, setStep] = useState('plan') // 'plan' | 'payment' | 'confirm'
  const [planId, setPlanId] = useState('annual')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [name, setName] = useState('')
  const [processing, setProcessing] = useState(false)

  const selectedPlan = PLANS.find((p) => p.id === planId)

  const formatCardNumber = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatExpiry = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return digits
  }

  const handlePlanSubmit = () => setStep('payment')
  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)
    await new Promise((r) => setTimeout(r, 1200))
    upgradeToPremium(planId === 'annual' ? 12 : 1)
    setProcessing(false)
    setStep('confirm')
  }

  if (step === 'confirm') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div className="relative w-full max-w-md rounded-xl bg-linkedin-white p-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <Check className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <h2 className="mt-4 text-center text-xl font-bold text-gray-900">You're now Premium!</h2>
          <p className="mt-2 text-center text-sm text-linkedin-text-gray">
            Enjoy your ad-free experience and all Premium benefits.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-full bg-linkedin-primary py-2.5 text-sm font-semibold text-linkedin-white hover:bg-linkedin-primary-dark"
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  if (step === 'payment') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-linkedin-white shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 flex items-center justify-between border-b border-linkedin-border-gray bg-linkedin-white p-4">
            <h2 className="text-lg font-bold text-gray-900">Payment</h2>
            <button type="button" onClick={onClose} className="rounded p-1 hover:bg-linkedin-light-gray">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <strong>Stripe test mode:</strong> Use card <code className="rounded bg-amber-100 px-1">4242 4242 4242 4242</code>, any future expiry, any CVC.
            </div>
            <form onSubmit={handlePaymentSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Card number</label>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="w-full rounded-md border border-linkedin-border-gray px-3 py-2 text-sm focus:border-linkedin-primary focus:ring-1 focus:ring-linkedin-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    className="w-full rounded-md border border-linkedin-border-gray px-3 py-2 text-sm focus:border-linkedin-primary focus:ring-1 focus:ring-linkedin-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full rounded-md border border-linkedin-border-gray px-3 py-2 text-sm focus:border-linkedin-primary focus:ring-1 focus:ring-linkedin-primary"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name on card</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-linkedin-border-gray px-3 py-2 text-sm focus:border-linkedin-primary focus:ring-1 focus:ring-linkedin-primary"
                />
              </div>
              <div className="rounded-lg border border-linkedin-border-gray bg-linkedin-light-gray p-3 text-sm">
                <span className="font-semibold">${selectedPlan?.price.toFixed(2)}</span>
                <span className="text-linkedin-text-gray">{selectedPlan?.period}</span>
              </div>
              <button
                type="submit"
                disabled={processing || !cardNumber || !expiry || !cvc}
                className="w-full rounded-full bg-linkedin-primary py-2.5 text-sm font-semibold text-linkedin-white hover:bg-linkedin-primary-dark disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Subscribe'}
              </button>
              <button type="button" onClick={() => setStep('plan')} className="w-full text-sm text-linkedin-primary hover:underline">
                ← Back to plan selection
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-linkedin-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-linkedin-border-gray bg-linkedin-white p-4">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-900">LinkedIn Premium</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-linkedin-light-gray">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Benefits */}
          <div>
            <h3 className="font-semibold text-gray-900">Premium benefits</h3>
            <ul className="mt-2 space-y-2">
              {PREMIUM_BENEFITS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2 text-sm text-gray-700">
                  <Icon className="h-4 w-4 text-amber-500" />
                  {text}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm font-semibold text-gray-900">$29.99/month</p>
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-sm">
              <thead>
                <tr className="border-b border-linkedin-border-gray">
                  <th className="py-2 text-left font-medium text-gray-700">Feature</th>
                  <th className="py-2 text-center font-medium text-gray-700">Free</th>
                  <th className="py-2 text-center font-medium text-amber-600">Premium</th>
                </tr>
              </thead>
              <tbody>
                {['Ads in feed', 'InMail', 'Who viewed profile', 'Search filters', 'Profile badge'].map((feat, i) => (
                  <tr key={feat} className="border-b border-linkedin-border-gray">
                    <td className="py-2 text-gray-700">{feat}</td>
                    <td className="py-2 text-center text-linkedin-text-gray">
                      {i === 0 ? 'Yes' : i === 1 ? 'Limited' : 'Basic'}
                    </td>
                    <td className="py-2 text-center">
                      {i === 0 ? <span className="text-green-600">No ads</span> : <Check className="mx-auto h-4 w-4 text-amber-500" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Plan selection */}
          <div>
            <h3 className="font-semibold text-gray-900">Select plan</h3>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setPlanId(plan.id)}
                  className={`relative rounded-lg border-2 p-4 text-left transition ${
                    planId === plan.id ? 'border-linkedin-primary bg-linkedin-primary/5' : 'border-linkedin-border-gray hover:border-linkedin-text-gray'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2 right-2 rounded bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">Popular</span>
                  )}
                  <span className="font-semibold text-gray-900">{plan.label}</span>
                  <p className="mt-1 text-lg font-bold text-gray-900">${plan.price.toFixed(2)}<span className="text-sm font-normal text-linkedin-text-gray">{plan.period}</span></p>
                  {plan.savings && <span className="text-xs text-green-600">{plan.savings}</span>}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handlePlanSubmit}
            className="w-full rounded-full bg-linkedin-primary py-2.5 text-sm font-semibold text-linkedin-white hover:bg-linkedin-primary-dark"
          >
            Continue to payment
          </button>
        </div>
      </div>
    </div>
  )
}
