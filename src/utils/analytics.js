export function trackImpression(adId, placement) {
  console.debug('[Analytics] Impression', { adId, placement })
}

export function trackClick(adId, placement) {
  console.debug('[Analytics] Click', { adId, placement })
}

export function trackCampaignEvent(campaignId, event, payload = {}) {
  console.debug('[Analytics] Campaign', { campaignId, event, ...payload })
}
