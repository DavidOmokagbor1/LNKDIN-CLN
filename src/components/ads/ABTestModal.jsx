import { useState } from 'react'
import { useAdStore } from '@/store/adStore'
import { calculateSignificance, getWinnerByCtr } from '@/utils/abTesting'
import { X, FlaskConical, Plus, BarChart3, Trophy, Pause, Zap } from 'lucide-react'

const DURATION_OPTIONS = [7, 14, 30]
const SPLIT_OPTIONS = [50, 60, 70, 80]

export default function ABTestModal({ onClose }) {
  const { campaigns, ads, abTests, createAbTest, updateAbTest, declareWinner, pauseAbTest } = useAdStore()
  const [view, setView] = useState('list') // 'list' | 'create' | 'results'
  const [selectedTestId, setSelectedTestId] = useState(null)
  const [form, setForm] = useState({
    campaignId: '',
    name: '',
    variantA: { headline: '', imageUrl: '', ctaText: '', ctaUrl: '' },
    variantB: { headline: '', imageUrl: '', ctaText: '', ctaUrl: '' },
    splitPercent: 50,
    durationDays: 7,
  })

  const selectedTest = abTests.find((t) => t.id === selectedTestId)
  const campaign = campaigns.find((c) => c.id === (selectedTest?.campaignId ?? form.campaignId))
  const campaignAds = ads.filter((a) => a.campaignId === (form.campaignId || selectedTest?.campaignId))

  const handleCreate = () => {
    if (!form.campaignId || !form.variantA.headline || !form.variantB.headline) return
    const adId = campaignAds[0]?.id ?? null
    const id = createAbTest({
      campaignId: form.campaignId,
      adId,
      name: form.name || `Test: ${campaign?.name ?? form.campaignId}`,
      variantA: form.variantA,
      variantB: form.variantB,
      splitPercent: form.splitPercent,
      durationDays: form.durationDays,
      status: 'running',
    })
    setSelectedTestId(id)
    setView('results')
    setForm({ campaignId: '', name: '', variantA: { headline: '', imageUrl: '', ctaText: '', ctaUrl: '' }, variantB: { headline: '', imageUrl: '', ctaText: '', ctaUrl: '' }, splitPercent: 50, durationDays: 7 })
  }

  const handleDeclareWinner = (winner) => {
    if (selectedTestId) declareWinner(selectedTestId, winner)
  }

  const handlePauseTest = () => {
    if (selectedTestId) pauseAbTest(selectedTestId)
  }

  const openCreate = () => {
    setView('create')
    setSelectedTestId(null)
  }

  const openResults = (testId) => {
    setSelectedTestId(testId)
    setView('results')
  }

  const backToList = () => {
    setView('list')
    setSelectedTestId(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <FlaskConical className="h-5 w-5 text-linkedin-primary" />
            A/B Testing
          </h2>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-gray-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {view === 'list' && (
            <>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={openCreate}
                  className="flex items-center gap-2 rounded-lg bg-linkedin-primary px-4 py-2 text-sm font-medium text-white hover:bg-linkedin-primary-dark"
                >
                  <Plus className="h-4 w-4" /> New test
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {abTests.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 text-center text-sm text-gray-500">
                    No A/B tests yet. Create one to compare ad variants.
                  </p>
                ) : (
                  abTests.map((t) => {
                    const camp = campaigns.find((c) => c.id === t.campaignId)
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => openResults(t.id)}
                        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-linkedin-primary/30 hover:bg-linkedin-primary/5"
                      >
                        <span className="font-medium text-gray-900">{t.name || t.id}</span>
                        <span className="rounded px-2 py-0.5 text-xs font-medium text-gray-600">
                          {camp?.name ?? t.campaignId}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-xs ${
                            t.status === 'running'
                              ? 'bg-green-100 text-green-800'
                              : t.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {t.status}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            </>
          )}

          {view === 'create' && (
            <div className="space-y-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Campaign</label>
                <select
                  value={form.campaignId}
                  onChange={(e) => setForm((f) => ({ ...f, campaignId: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select campaign</option>
                  {campaigns.filter((c) => c.status === 'active').map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Test name (optional)</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Headline test Q1"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-linkedin-primary/30 bg-linkedin-primary/5 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">Variant A</h3>
                  <input
                    type="text"
                    value={form.variantA.headline}
                    onChange={(e) => setForm((f) => ({ ...f, variantA: { ...f.variantA, headline: e.target.value } }))}
                    placeholder="Headline"
                    className="mb-2 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  />
                  <input
                    type="text"
                    value={form.variantA.imageUrl}
                    onChange={(e) => setForm((f) => ({ ...f, variantA: { ...f.variantA, imageUrl: e.target.value } }))}
                    placeholder="Image URL"
                    className="mb-2 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  />
                  <input
                    type="text"
                    value={form.variantA.ctaText}
                    onChange={(e) => setForm((f) => ({ ...f, variantA: { ...f.variantA, ctaText: e.target.value } }))}
                    placeholder="CTA text"
                    className="mb-2 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  />
                  <input
                    type="text"
                    value={form.variantA.ctaUrl}
                    onChange={(e) => setForm((f) => ({ ...f, variantA: { ...f.variantA, ctaUrl: e.target.value } }))}
                    placeholder="CTA URL"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">Variant B</h3>
                  <input
                    type="text"
                    value={form.variantB.headline}
                    onChange={(e) => setForm((f) => ({ ...f, variantB: { ...f.variantB, headline: e.target.value } }))}
                    placeholder="Headline"
                    className="mb-2 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  />
                  <input
                    type="text"
                    value={form.variantB.imageUrl}
                    onChange={(e) => setForm((f) => ({ ...f, variantB: { ...f.variantB, imageUrl: e.target.value } }))}
                    placeholder="Image URL"
                    className="mb-2 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  />
                  <input
                    type="text"
                    value={form.variantB.ctaText}
                    onChange={(e) => setForm((f) => ({ ...f, variantB: { ...f.variantB, ctaText: e.target.value } }))}
                    placeholder="CTA text"
                    className="mb-2 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  />
                  <input
                    type="text"
                    value={form.variantB.ctaUrl}
                    onChange={(e) => setForm((f) => ({ ...f, variantB: { ...f.variantB, ctaUrl: e.target.value } }))}
                    placeholder="CTA URL"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Split % (Variant A)</label>
                  <select
                    value={form.splitPercent}
                    onChange={(e) => setForm((f) => ({ ...f, splitPercent: Number(e.target.value) }))}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    {SPLIT_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}% / {100 - p}%</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Duration</label>
                  <select
                    value={form.durationDays}
                    onChange={(e) => setForm((f) => ({ ...f, durationDays: Number(e.target.value) }))}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d} days</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={backToList} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!form.campaignId || !form.variantA.headline || !form.variantB.headline}
                  className="rounded-lg bg-linkedin-primary px-4 py-2 text-sm font-medium text-white hover:bg-linkedin-primary-dark disabled:opacity-50"
                >
                  Start test
                </button>
              </div>
            </div>
          )}

          {view === 'results' && selectedTest && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{selectedTest.name}</h3>
                <span className="rounded px-2 py-0.5 text-xs font-medium text-gray-600">
                  {selectedTest.startDate} – {selectedTest.endDate}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ResultsCard variant="A" data={selectedTest.metrics.A} creative={selectedTest.variantA} />
                <ResultsCard variant="B" data={selectedTest.metrics.B} creative={selectedTest.variantB} />
              </div>

              <ComparisonTable metricsA={selectedTest.metrics.A} metricsB={selectedTest.metrics.B} />

              {(() => {
                const sig = calculateSignificance(selectedTest.metrics.A, selectedTest.metrics.B)
                const autoWinner = getWinnerByCtr(selectedTest.metrics.A, selectedTest.metrics.B)
                return (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <BarChart3 className="h-4 w-4" />
                      Statistical significance: {sig.significant ? (
                        <span className="text-green-600">{sig.confidence}% confidence</span>
                      ) : (
                        <span className="text-amber-600">Not yet significant (need more data)</span>
                      )}
                    </div>
                    {selectedTest.winner ? (
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        Winner: <strong>Variant {selectedTest.winner}</strong>
                      </div>
                    ) : (
                      autoWinner && (
                        <div className="mt-2 text-sm text-gray-600">
                          Leading by CTR: Variant {autoWinner}
                        </div>
                      )
                    )}
                  </div>
                )
              })()}

              <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4">
                <button type="button" onClick={backToList} className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
                  Back to tests
                </button>
                {selectedTest.status === 'running' && (
                  <>
                    <button type="button" onClick={handlePauseTest} className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-100">
                      <Pause className="h-4 w-4" /> Pause test
                    </button>
                    <button type="button" onClick={() => handleDeclareWinner('A')} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-800 hover:bg-blue-100">
                      Declare A winner
                    </button>
                    <button type="button" onClick={() => handleDeclareWinner('B')} className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-sm text-green-800 hover:bg-green-100">
                      Declare B winner
                    </button>
                  </>
                )}
                <button type="button" onClick={() => { backToList(); openCreate(); }} className="flex items-center gap-1 rounded-lg bg-linkedin-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-linkedin-primary-dark">
                  <Zap className="h-4 w-4" /> Allocate 100% to winner / New test
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ResultsCard({ variant, data, creative }) {
  const ctr = (data?.impressions ?? 0) > 0 ? ((data?.clicks ?? 0) / (data?.impressions ?? 1) * 100).toFixed(2) : '0.00'
  const costPerClick = (data?.clicks ?? 0) > 0 ? ((data?.spent ?? 0) / (data?.clicks ?? 1)).toFixed(2) : '—'
  return (
    <div className={`rounded-lg border-2 p-4 ${variant === 'A' ? 'border-linkedin-primary/40 bg-linkedin-primary/5' : 'border-green-300 bg-green-50/50'}`}>
      <h4 className="mb-2 text-sm font-semibold text-gray-900">Variant {variant}</h4>
      <p className="text-xs text-gray-600 truncate">{creative?.headline || '—'}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <span>Impressions: {(data?.impressions ?? 0).toLocaleString()}</span>
        <span>Clicks: {(data?.clicks ?? 0).toLocaleString()}</span>
        <span>CTR: {ctr}%</span>
        <span>Cost/click: ${costPerClick}</span>
      </div>
    </div>
  )
}

function ComparisonTable({ metricsA, metricsB }) {
  const ctrA = (metricsA?.impressions ?? 0) > 0 ? ((metricsA?.clicks ?? 0) / (metricsA?.impressions ?? 1) * 100).toFixed(2) : '0'
  const ctrB = (metricsB?.impressions ?? 0) > 0 ? ((metricsB?.clicks ?? 0) / (metricsB?.impressions ?? 1) * 100).toFixed(2) : '0'
  const cpcA = (metricsA?.clicks ?? 0) > 0 ? ((metricsA?.spent ?? 0) / (metricsA?.clicks ?? 1)).toFixed(2) : '—'
  const cpcB = (metricsB?.clicks ?? 0) > 0 ? ((metricsB?.spent ?? 0) / (metricsB?.clicks ?? 1)).toFixed(2) : '—'
  const rows = [
    ['Impressions', (metricsA?.impressions ?? 0).toLocaleString(), (metricsB?.impressions ?? 0).toLocaleString()],
    ['Clicks', (metricsA?.clicks ?? 0).toLocaleString(), (metricsB?.clicks ?? 0).toLocaleString()],
    ['CTR %', `${ctrA}%`, `${ctrB}%`],
    ['Engagements', (metricsA?.engagements ?? 0).toLocaleString(), (metricsB?.engagements ?? 0).toLocaleString()],
    ['Cost per result', `$${cpcA}`, `$${cpcB}`],
  ]
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 text-left font-medium text-gray-700">Metric</th>
            <th className="px-4 py-2 text-right font-medium text-linkedin-primary">Variant A</th>
            <th className="px-4 py-2 text-right font-medium text-green-700">Variant B</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, a, b], i) => (
            <tr key={i} className="border-t border-gray-100">
              <td className="px-4 py-2 text-gray-700">{label}</td>
              <td className="px-4 py-2 text-right">{a}</td>
              <td className="px-4 py-2 text-right">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
