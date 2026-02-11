import { useMemo, useState, useEffect, useRef } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import { useAdStore } from '@/store/adStore'
import { Calendar, Filter, Download, Mail, FileText } from 'lucide-react'

const COLORS = ['#0A66C2', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

function generateTimeSeriesData(ads, campaigns, days = 30) {
  const data = []
  const now = new Date()
  const totalImpressions = ads.reduce((s, a) => s + (a.impressions || 0), 0)
  const totalClicks = ads.reduce((s, a) => s + (a.clicks || 0), 0)
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dayFactor = 0.8 + Math.sin(i * 0.2) * 0.2
    data.push({
      date: d.toISOString().slice(0, 10),
      impressions: Math.round((totalImpressions / days) * dayFactor * (0.9 + Math.random() * 0.2)),
      clicks: Math.round((totalClicks / days) * dayFactor * (0.9 + Math.random() * 0.2)),
    })
  }
  return data
}

function getCtrColor(ctr) {
  if (ctr >= 2) return '#22c55e'
  if (ctr >= 1) return '#eab308'
  return '#ef4444'
}

function generateHourlyData(ads) {
  const hours = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, ctr: 0.5 + Math.sin(h / 24 * Math.PI * 2) * 0.5 + Math.random() * 0.3 }))
  return hours.map((h) => ({ ...h, ctr: Math.max(0.2, Math.min(3.5, h.ctr)).toFixed(2) }))
}

export default function AnalyticsDashboard() {
  const { ads, campaigns } = useAdStore()
  const [dateRange, setDateRange] = useState({ start: '2026-01-15', end: '2026-02-10' })
  const [selectedCampaign, setSelectedCampaign] = useState('all')
  const [adTypeFilter, setAdTypeFilter] = useState('all')
  const [drillDownCampaign, setDrillDownCampaign] = useState(null)
  const renderCount = useRef(0)

  const filteredAds = useMemo(() => {
    let result = ads
    if (selectedCampaign !== 'all') result = result.filter((a) => a.campaignId === selectedCampaign)
    if (adTypeFilter !== 'all') result = result.filter((a) => a.type === adTypeFilter)
    return result
  }, [ads, selectedCampaign, adTypeFilter])

  const performanceData = useMemo(
    () => generateTimeSeriesData(filteredAds, campaigns, 30),
    [filteredAds, campaigns]
  )

  const campaignCtrData = useMemo(() => {
    const byCampaign = {}
    filteredAds.forEach((ad) => {
      const cid = ad.campaignId
      if (!byCampaign[cid]) byCampaign[cid] = { impressions: 0, clicks: 0 }
      byCampaign[cid].impressions += ad.impressions || 0
      byCampaign[cid].clicks += ad.clicks || 0
    })
    return campaigns
      .filter((c) => byCampaign[c.id])
      .map((c) => {
        const m = byCampaign[c.id]
        const ctr = m.impressions > 0 ? (m.clicks / m.impressions) * 100 : 0
        return { name: c.name.slice(0, 20), ctr: ctr.toFixed(2), fill: getCtrColor(ctr) }
      })
  }, [filteredAds, campaigns])

  const budgetData = useMemo(() => {
    const totalSpent = campaigns.reduce((s, c) => s + (c.spent || 0), 0)
    if (totalSpent === 0) return []
    return campaigns
      .filter((c) => (c.spent || 0) > 0)
      .map((c, i) => ({
        name: c.name.slice(0, 15),
        value: Math.round((c.spent / totalSpent) * 100),
        fill: COLORS[i % COLORS.length],
      }))
  }, [campaigns])

  const demographicData = useMemo(() => {
    const byIndustry = {}
    filteredAds.forEach((ad) => {
      const industries = ad.targeting?.industries || ['Other']
      industries.forEach((ind) => {
        byIndustry[ind] = (byIndustry[ind] || 0) + (ad.impressions || 0)
      })
    })
    return Object.entries(byIndustry)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [filteredAds])

  const hourlyData = useMemo(() => generateHourlyData(filteredAds), [filteredAds])

  const funnelData = useMemo(() => {
    const totalImpressions = filteredAds.reduce((s, a) => s + (a.impressions || 0), 0)
    const totalClicks = filteredAds.reduce((s, a) => s + (a.clicks || 0), 0)
    const totalEngagement = filteredAds.reduce(
      (s, a) => s + (a.engagement?.likes || 0) + (a.engagement?.comments || 0) + (a.engagement?.shares || 0),
      0
    )
    const conversions = campaigns
      .filter((c) => (filteredAds.some((a) => a.campaignId === c.id)))
      .reduce((s, c) => s + (c.metrics?.conversions || 0), 0)
    return [
      { name: 'Impressions', value: totalImpressions, fill: '#0A66C2' },
      { name: 'Clicks', value: totalClicks, fill: '#22c55e' },
      { name: 'Engagements', value: totalEngagement, fill: '#eab308' },
      { name: 'Conversions', value: conversions, fill: '#8b5cf6' },
    ]
  }, [filteredAds, campaigns])

  // #region agent log
  useEffect(() => {
    const fdValid = funnelData?.every((d) => typeof d.value === 'number');
    fetch('http://127.0.0.1:7243/ingest/583556e0-318b-40c4-8060-a267d190354c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AnalyticsDashboard.jsx:data-ready',message:'Chart data ready',data:{adsLen:ads?.length,campaignsLen:campaigns?.length,filteredAdsLen:filteredAds?.length,funnelDataLen:funnelData?.length,funnelDataValid:fdValid,funnelValues:funnelData?.map((d)=>d.value)},hypothesisId:'A,B',timestamp:Date.now(),runId:'post-fix'})}).catch(()=>{});
  }, [ads, campaigns, filteredAds, funnelData]);
  // #endregion

  const handleExportCsv = () => {
    const headers = ['Metric', 'Value']
    const rows = [
      ['Total Impressions', filteredAds.reduce((s, a) => s + (a.impressions || 0), 0)],
      ['Total Clicks', filteredAds.reduce((s, a) => s + (a.clicks || 0), 0)],
      ['Total Spent', filteredAds.reduce((s, a) => s + (a.spent || 0), 0)],
    ]
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${dateRange.start}-${dateRange.end}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPdf = () => {
    const printContent = document.getElementById('analytics-dashboard')
    if (!printContent) return
    const prevTitle = document.title
    document.title = 'Ad Studio Analytics Report'
    window.print()
    document.title = prevTitle
  }

  const handleEmailReport = () => {
    const summary = `Analytics Summary (${dateRange.start} to ${dateRange.end})\nImpressions: ${filteredAds.reduce((s, a) => s + (a.impressions || 0), 0)}\nClicks: ${filteredAds.reduce((s, a) => s + (a.clicks || 0), 0)}`
    window.location.href = `mailto:?subject=Ad Studio Analytics Report&body=${encodeURIComponent(summary)}`
  }

  return (
    <div id="analytics-dashboard" className="space-y-6">
      {/* Filters */}
      <div className="no-print flex flex-wrap items-center gap-3 rounded-lg border border-linkedin-border-gray bg-linkedin-white p-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-linkedin-text-gray" />
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange((r) => ({ ...r, start: e.target.value }))}
            className="rounded border border-linkedin-border-gray px-2 py-1 text-sm"
          />
          <span className="text-linkedin-text-gray">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange((r) => ({ ...r, end: e.target.value }))}
            className="rounded border border-linkedin-border-gray px-2 py-1 text-sm"
          />
        </div>
        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="rounded border border-linkedin-border-gray px-2 py-1 text-sm"
        >
          <option value="all">All campaigns</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={adTypeFilter}
          onChange={(e) => setAdTypeFilter(e.target.value)}
          className="rounded border border-linkedin-border-gray px-2 py-1 text-sm"
        >
          <option value="all">All ad types</option>
          <option value="sponsored_post">Sponsored Post</option>
          <option value="sponsored_video">Video</option>
        </select>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1 rounded-lg border border-linkedin-border-gray bg-linkedin-white px-3 py-1.5 text-sm hover:bg-linkedin-light-gray"
          >
            <Download className="h-4 w-4" /> CSV
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            className="flex items-center gap-1 rounded-lg border border-linkedin-border-gray bg-linkedin-white px-3 py-1.5 text-sm hover:bg-linkedin-light-gray"
          >
            <FileText className="h-4 w-4" /> PDF
          </button>
          <button
            type="button"
            onClick={handleEmailReport}
            className="flex items-center gap-1 rounded-lg border border-linkedin-border-gray bg-linkedin-white px-3 py-1.5 text-sm hover:bg-linkedin-light-gray"
          >
            <Mail className="h-4 w-4" /> Email
          </button>
        </div>
      </div>

      {/* Drill-down banner */}
      {drillDownCampaign && (
        <div className="no-print rounded-lg border border-linkedin-primary/30 bg-linkedin-primary/5 p-3 flex items-center justify-between">
          <span className="text-sm font-medium">Viewing: {drillDownCampaign}</span>
          <button
            type="button"
            onClick={() => setDrillDownCampaign(null)}
            className="text-sm text-linkedin-primary hover:underline"
          >
            Clear filter
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 1. Performance Over Time */}
        <div className="min-h-[320px] rounded-lg border border-linkedin-border-gray bg-linkedin-white p-4 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Performance Over Time (30 days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0DFDC" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value) => [value?.toLocaleString(), '']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line type="monotone" dataKey="impressions" stroke="#0A66C2" strokeWidth={2} name="Impressions" dot={false} />
              <Line type="monotone" dataKey="clicks" stroke="#22c55e" strokeWidth={2} name="Clicks" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 2. Campaign Comparison */}
        <div className="rounded-lg border border-linkedin-border-gray bg-linkedin-white p-4 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Campaign CTR % (Green &gt;2%, Yellow 1–2%, Red &lt;1%)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={campaignCtrData} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0DFDC" />
              <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 10 }} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={55} />
              <Tooltip formatter={(v) => [`${v}%`, 'CTR']} />
              <Bar dataKey="ctr" fill="#0A66C2" radius={[0, 4, 4, 0]}>
                {campaignCtrData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
                <LabelList dataKey="ctr" position="right" formatter={(v) => `${v}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 3. Budget Allocation */}
        <div className="rounded-lg border border-linkedin-border-gray bg-linkedin-white p-4 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Budget Allocation (% of spend)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={budgetData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                onClick={(e) => e?.name && setDrillDownCampaign(e.name)}
                style={{ cursor: 'pointer' }}
              >
                {budgetData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} stroke="#fff" strokeWidth={1} />
                ))}
                <LabelList dataKey="value" formatter={(v) => `${v}%`} />
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, 'Share']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 4. Demographic Reach */}
        <div className="rounded-lg border border-linkedin-border-gray bg-linkedin-white p-4 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Impressions by Industry</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={demographicData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0DFDC" />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : v)} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
              <Tooltip formatter={(v) => [v?.toLocaleString(), 'Impressions']} />
              <Bar dataKey="value" fill="#0A66C2" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 5. Hourly Performance */}
        <div className="rounded-lg border border-linkedin-border-gray bg-linkedin-white p-4 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">CTR by Hour (best times to run ads)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0DFDC" />
              <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={1} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 4]} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, 'CTR']} />
              <Bar dataKey="ctr" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                {hourlyData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={parseFloat(entry.ctr) >= 2 ? '#22c55e' : parseFloat(entry.ctr) >= 1 ? '#eab308' : '#94a3b8'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 6. Funnel */}
        <div className="rounded-lg border border-linkedin-border-gray bg-linkedin-white p-4 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={280}>
            <FunnelChart>
              <Funnel dataKey="value" data={funnelData} isAnimationActive nameKey="name">
                <LabelList position="center" fill="#fff" dataKey="name" formatter={(v, obj) => `${v}: ${(obj?.payload?.value ?? 0).toLocaleString()}`} />
              </Funnel>
              <Tooltip formatter={(v) => [(v ?? 0).toLocaleString(), '']} />
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #analytics-dashboard, #analytics-dashboard * { visibility: visible; }
          #analytics-dashboard { position: absolute; left: 0; top: 0; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="no-print" />
    </div>
  )
}
