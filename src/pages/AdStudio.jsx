import { useState, useEffect } from 'react'
import { useAdStore } from '@/store/adStore'
import { formatCount } from '@/utils/helpers'
import AnalyticsDashboard from '@/components/ads/AnalyticsDashboard'
import ABTestModal from '@/components/ads/ABTestModal'
import { FlaskConical } from 'lucide-react'

export default function AdStudio() {
  const { ads, campaigns, abTests } = useAdStore()
  const [activeTab, setActiveTab] = useState('analytics')
  const [abTestModalOpen, setAbTestModalOpen] = useState(false)

  // #region agent log
  useEffect(() => {
    const adsIsArray = Array.isArray(ads);
    const campaignsIsArray = Array.isArray(campaigns);
    fetch('http://127.0.0.1:7243/ingest/583556e0-318b-40c4-8060-a267d190354c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdStudio.jsx:mount',message:'AdStudio mounted',data:{adsIsArray,campaignsIsArray,adsLen:ads?.length,campaignsLen:campaigns?.length,activeTab},hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
    return () => { fetch('http://127.0.0.1:7243/ingest/583556e0-318b-40c4-8060-a267d190354c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdStudio.jsx:unmount',message:'AdStudio unmounting',data:{},hypothesisId:'D',timestamp:Date.now()})}).catch(()=>{}); };
  }, [ads, campaigns, activeTab]);
  // #endregion

  return (
    <main className="min-h-screen bg-linkedin-light-gray py-6">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="text-xl font-bold text-gray-900">Ad Studio</h1>
        <p className="mt-1 text-sm text-linkedin-text-gray">Manage campaigns and monetization.</p>

        {/* Tabs */}
        <div className="mt-4 flex gap-1 rounded-t-lg border border-b-0 border-linkedin-border-gray bg-linkedin-white px-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('campaigns')}
            className={`rounded-t px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'campaigns'
                ? 'border-b-2 border-linkedin-primary bg-linkedin-white text-linkedin-primary'
                : 'text-linkedin-text-gray hover:text-gray-900'
            }`}
          >
            Campaigns
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`rounded-t px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'border-b-2 border-linkedin-primary bg-linkedin-white text-linkedin-primary'
                : 'text-linkedin-text-gray hover:text-gray-900'
            }`}
          >
            Analytics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('abtests')}
            className={`rounded-t px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'abtests'
                ? 'border-b-2 border-linkedin-primary bg-linkedin-white text-linkedin-primary'
                : 'text-linkedin-text-gray hover:text-gray-900'
            }`}
          >
            A/B Tests
          </button>
        </div>

        {activeTab === 'analytics' ? (
          <div className="rounded-b-lg border border-t-0 border-linkedin-border-gray bg-linkedin-white p-4 shadow-sm">
            <AnalyticsDashboard />
          </div>
        ) : activeTab === 'abtests' ? (
          <div className="rounded-b-lg border border-t-0 border-linkedin-border-gray bg-linkedin-white p-4 shadow-sm">
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-linkedin-border-gray bg-linkedin-light-gray/50 py-12">
              <FlaskConical className="mb-3 h-12 w-12 text-linkedin-primary" />
              <h3 className="text-lg font-semibold text-gray-900">A/B Testing</h3>
              <p className="mt-1 max-w-md text-center text-sm text-linkedin-text-gray">
                Compare two ad variants (headlines, images, CTAs) and see which performs better. Run tests by campaign with configurable split and duration.
              </p>
              <p className="mt-2 text-xs text-linkedin-text-gray">
                {abTests?.length ?? 0} test(s) — {abTests?.filter((t) => t.status === 'running').length ?? 0} running
              </p>
              <button
                type="button"
                onClick={() => setAbTestModalOpen(true)}
                className="mt-4 rounded-lg bg-linkedin-primary px-4 py-2 text-sm font-medium text-white hover:bg-linkedin-primary-dark"
              >
                Manage A/B tests
              </button>
            </div>
            {abTestModalOpen && <ABTestModal onClose={() => setAbTestModalOpen(false)} />}
          </div>
        ) : (
          <div className="rounded-b-lg border border-t-0 border-linkedin-border-gray bg-linkedin-white p-4 shadow-sm">
        <div className="rounded-lg border border-linkedin-primary/20 bg-linkedin-primary/5 p-4">
          <p className="text-sm text-gray-700">
            <strong>How the platform generates revenue:</strong> Like LinkedIn, we earn through <strong>ads and promotions</strong>. Advertisers pay to run sponsored posts, job ads, and campaigns in the feed. Revenue comes from impressions (CPM), clicks (CPC), and campaign spend. Ad Studio lets advertisers create campaigns, target audiences, and track performance—powering the platform&apos;s business model.
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {ads.map((ad) => (
            <div key={ad.id} className="rounded-lg border border-linkedin-border-gray bg-linkedin-white p-4 shadow-sm">
              <h2 className="font-semibold text-gray-900">{ad.content?.headline ?? ad.title}</h2>
              <p className="mt-1 text-sm text-linkedin-text-gray">{ad.content?.description ?? ad.body}</p>
              <div className="mt-3 flex gap-4 text-xs text-linkedin-text-gray">
                <span>Impressions: {formatCount(ad.impressions)}</span>
                <span>Clicks: {formatCount(ad.clicks)}</span>
                <span>Spent: ${ad.spent}</span>
              </div>
              <span className="mt-2 inline-block rounded bg-linkedin-primary/10 px-2 py-0.5 text-xs font-medium text-linkedin-primary">{ad.status}</span>
            </div>
          ))}
        </div>
        <section className="mt-8">
          <h2 className="font-semibold text-gray-900">Campaigns</h2>
          <div className="mt-2 space-y-2">
            {campaigns.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded border border-linkedin-border-gray bg-linkedin-white px-4 py-3">
                <span className="font-medium">{c.name}</span>
                <span className="text-sm text-linkedin-text-gray">{c.startDate} – {c.endDate}</span>
                <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">{c.status}</span>
              </div>
            ))}
          </div>
        </section>
          </div>
        )}
      </div>
    </main>
  )
}
