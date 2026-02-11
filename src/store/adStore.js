import { create } from 'zustand'
import adsData from '@/data/ads.json'
import campaignsData from '@/data/campaigns.json'
import { matchesTargeting } from '@/utils/adTargeting'
import { selectVariant as selectVariantUtil } from '@/utils/abTesting'

const emptyMetrics = () => ({ impressions: 0, clicks: 0, engagements: 0, spent: 0 })

export const useAdStore = create((set, get) => ({
  ads: adsData,
  campaigns: campaignsData,
  impressions: [], // { adId, userId, timestamp }
  clicks: [],
  abTests: [], // { id, campaignId, adId, name, variantA, variantB, splitPercent, durationDays, startDate, endDate, status, winner, metrics: { A, B } }

  trackImpression: (adId, userId) => {
    const entry = { adId, userId, timestamp: new Date().toISOString() }
    set((state) => ({ impressions: [...state.impressions, entry] }))
  },

  trackClick: (adId, userId) => {
    const entry = { adId, userId, timestamp: new Date().toISOString() }
    set((state) => ({ clicks: [...state.clicks, entry] }))
    // Optionally increment ad's click count in state
    set((state) => ({
      ads: state.ads.map((ad) =>
        ad.id === adId ? { ...ad, clicks: (ad.clicks || 0) + 1 } : ad
      ),
    }))
  },

  fetchAdsForUser: (userProfile) => {
    const { ads } = get()
    const userContext = {
      location: userProfile?.location,
      industry: userProfile?.industry,
      jobTitle: userProfile?.currentPosition?.title,
    }
    return ads
      .filter((ad) => ad.status === 'active' && matchesTargeting(ad, userContext))
  },

  createCampaign: (campaignData) => {
    const { advertiserId } = campaignData
    const id = `campaign-${Date.now()}`
    const campaign = {
      id,
      advertiserId: advertiserId ?? campaignData.advertiserId,
      name: campaignData.name ?? 'New Campaign',
      objective: campaignData.objective ?? 'brand_awareness',
      totalBudget: campaignData.totalBudget ?? 0,
      dailyBudget: campaignData.dailyBudget ?? 0,
      spent: 0,
      status: 'draft',
      ads: [],
      startDate: campaignData.startDate ?? new Date().toISOString().slice(0, 10),
      endDate: campaignData.endDate ?? new Date().toISOString().slice(0, 10),
      metrics: {
        impressions: 0,
        clicks: 0,
        ctr: 0,
        conversions: 0,
        costPerClick: 0,
        costPerConversion: 0,
      },
    }
    set((state) => ({ campaigns: [...state.campaigns, campaign] }))
    return id
  },

  updateCampaign: (campaignId, data) => {
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === campaignId ? { ...c, ...data } : c
      ),
    }))
  },

  // --- A/B testing ---
  createAbTest: (payload) => {
    const id = `ab-${Date.now()}`
    const startDate = new Date().toISOString().slice(0, 10)
    const end = new Date()
    end.setDate(end.getDate() + (payload.durationDays ?? 7))
    const endDate = end.toISOString().slice(0, 10)
    const test = {
      id,
      campaignId: payload.campaignId,
      adId: payload.adId ?? null,
      name: payload.name ?? `Test ${id}`,
      variantA: payload.variantA ?? { headline: '', imageUrl: '', ctaText: '', ctaUrl: '' },
      variantB: payload.variantB ?? { headline: '', imageUrl: '', ctaText: '', ctaUrl: '' },
      splitPercent: payload.splitPercent ?? 50,
      durationDays: payload.durationDays ?? 7,
      startDate,
      endDate,
      status: payload.status ?? 'running',
      winner: null,
      metrics: { A: emptyMetrics(), B: emptyMetrics() },
    }
    set((state) => ({ abTests: [...state.abTests, test] }))
    return id
  },

  updateAbTest: (testId, data) => {
    set((state) => ({
      abTests: state.abTests.map((t) => (t.id === testId ? { ...t, ...data } : t)),
    }))
  },

  recordTestMetric: (testId, variant, metric, value = 1) => {
    set((state) => ({
      abTests: state.abTests.map((t) => {
        if (t.id !== testId || !t.metrics[variant]) return t
        const m = { ...t.metrics[variant] }
        m[metric] = (m[metric] ?? 0) + value
        return { ...t, metrics: { ...t.metrics, [variant]: m } }
      }),
    }))
  },

  declareWinner: (testId, winner) => {
    set((state) => ({
      abTests: state.abTests.map((t) =>
        t.id === testId ? { ...t, winner: winner ?? null, status: 'completed' } : t
      ),
    }))
  },

  getActiveTestForCampaign: (campaignId) => {
    return get().abTests.find(
      (t) => t.campaignId === campaignId && t.status === 'running'
    )
  },

  getActiveTestForAd: (adId) => {
    const ad = get().ads.find((a) => a.id === adId)
    return ad ? get().getActiveTestForCampaign(ad.campaignId) : null
  },

  selectVariantForTest: (testId) => {
    const test = get().abTests.find((t) => t.id === testId)
    if (!test || test.status !== 'running') return null
    return selectVariantUtil(testId, test.splitPercent)
  },

  pauseAbTest: (testId) => {
    set((state) => ({
      abTests: state.abTests.map((t) =>
        t.id === testId ? { ...t, status: 'paused' } : t
      ),
    }))
  },
}))
