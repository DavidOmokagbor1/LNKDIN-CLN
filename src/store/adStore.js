import { create } from 'zustand'
import adsData from '@/data/ads.json'
import campaignsData from '@/data/campaigns.json'
import { matchesTargeting } from '@/utils/adTargeting'

export const useAdStore = create((set, get) => ({
  ads: adsData,
  campaigns: campaignsData,
  impressions: [], // { adId, userId, timestamp }
  clicks: [],

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
}))
