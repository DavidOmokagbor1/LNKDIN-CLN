export function matchesTargeting(ad, userContext = {}) {
  const { targeting = {} } = ad
  const { location, industry } = userContext
  if (targeting.locations?.length && location && !targeting.locations.includes(location)) return false
  if (targeting.industries?.length && industry && !targeting.industries.includes(industry)) return false
  return true
}

export function selectFeedAds(ads, limit = 2, userContext = {}) {
  return ads
    .filter((ad) => ad.status === 'active' && matchesTargeting(ad, userContext))
    .slice(0, limit)
}
