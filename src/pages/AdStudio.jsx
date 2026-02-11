import { useAdStore } from '@/store/adStore'
import { formatCount } from '@/utils/helpers'

export default function AdStudio() {
  const { ads, campaigns } = useAdStore()
  return (
    <main className="min-h-screen bg-linkedin-light-gray py-6">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="text-xl font-bold text-gray-900">Ad Studio</h1>
        <p className="mt-1 text-sm text-linkedin-text-gray">Manage campaigns and monetization.</p>
        <div className="mt-4 rounded-lg border border-linkedin-primary/20 bg-linkedin-primary/5 p-4">
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
    </main>
  )
}
