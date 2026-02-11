import { create } from 'zustand'
import adsData from '@/data/ads.json'
import campaignsData from '@/data/campaigns.json'

export const useAdStore = create((set, get) => ({
  ads: adsData,
  campaigns: campaignsData,
  setAds: (ads) => set({ ads }),
  addAd: (ad) =>
    set((state) => ({
      ads: [...state.ads, { ...ad, id: `ad${Date.now()}`, status: 'draft' }],
    })),
  updateAd: (id, updates) =>
    set((state) => ({
      ads: state.ads.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),
  getAdById: (id) => get().ads.find((a) => a.id === id),
}))
