const MAX_IMPRESSIONS_PER_DAY = 3
const TOP_ADS_LIMIT = 5

/**
 * Infer seniority level from user's job title.
 * @returns {string} 'Entry' | 'Mid' | 'Senior'
 */
function inferSeniority(userProfile) {
  const title = userProfile?.currentPosition?.title ?? userProfile?.headline ?? ''
  const t = title.toLowerCase()
  if (/intern|junior|entry|associate(?!\s*partner)/i.test(t)) return 'Entry'
  if (/senior|staff|principal|lead|director|vp|vice president|manager|head of/i.test(t)) return 'Senior'
  return 'Mid'
}

/**
 * Normalize location for matching (e.g. "San Francisco, CA" -> "San Francisco").
 */
function normalizeLocation(loc) {
  if (!loc || typeof loc !== 'string') return ''
  const parts = loc.split(',').map((p) => p.trim())
  return parts[0] || ''
}

/**
 * Check if user location matches any of the ad's target locations.
 * Handles "Remote", city names, and "Global".
 */
function locationMatches(userLocation, targetLocations = []) {
  if (!targetLocations.length) return true
  const normalized = normalizeLocation(userLocation).toLowerCase()
  if (!normalized) return targetLocations.some((l) => l.toLowerCase() === 'remote' || l.toLowerCase() === 'global')
  return targetLocations.some((l) => {
    const t = l.toLowerCase()
    if (t === 'remote' || t === 'global') return true
    return normalized.includes(t) || t.includes(normalized)
  })
}

/**
 * Check if job title matches (exact or partial).
 */
function jobTitleMatches(userTitle, targetTitles = []) {
  if (!targetTitles?.length || !userTitle) return false
  const ut = userTitle.toLowerCase()
  return targetTitles.some((tt) => ut.includes(tt.toLowerCase()) || tt.toLowerCase().includes(ut))
}

/**
 * Count overlapping skills between user and ad.
 * Ads don't have skills in targeting - we'll use user skills vs common keywords in ad content/description.
 * For simplicity: if ad targeting has job titles, we treat that as "relevant skills" proxy.
 * Return 1 if any job title matches (skill overlap), else 0. Or we could check user.skills vs nothing in ad - skip for now, return 0.
 * Spec: +10 if skills overlap. Ads don't have skills - we could add a targeting.skills array to ads. For now, if job title matches we already get +20.
 * I'll add a simple check: if user has skills and ad content mentions any skill-like term, +10. Too complex without ad.skills. 
 * Simplified: +10 if jobTitleMatches (we already have that). Actually that would double-count. Let me re-read: "+10 if skills overlap" - separate from job title.
 * We don't have ad targeting.skills in our schema. I'll return 0 for skills overlap unless we extend. Or infer from job titles - if user skills intersect with common skill keywords for those job titles... too complex.
 * For now: check if any user skill (lowercased) appears in ad's job titles (e.g. "Software Engineer" - "engineer" could match "Engineering" in skills). Simple: user.skills some item partially matches target job titles. Give +10.
 */
function getSkillsOverlapScore(userProfile, ad) {
  const userSkills = userProfile?.skills ?? []
  const targetTitles = ad?.targeting?.jobTitles ?? []
  if (!userSkills.length || !targetTitles.length) return 0
  const userSkillSet = new Set(userSkills.map((s) => s.toLowerCase()))
  for (const tt of targetTitles) {
    const words = tt.toLowerCase().split(/\s+/)
    if (words.some((w) => [...userSkillSet].some((s) => s.includes(w) || w.includes(s)))) return 10
  }
  return 0
}

/**
 * Count mutual connections with the advertiser's company.
 * A mutual connection = one of user's connections works at the same company as the advertiser.
 */
function getMutualConnectionCount(userProfile, ad, usersById = {}) {
  const userConnections = userProfile?.connections ?? []
  const advertiser = usersById[ad?.advertiserId]
  if (!advertiser || !userConnections.length) return 0
  const advertiserCompany = advertiser?.currentPosition?.company?.toLowerCase()
  if (!advertiserCompany) return 0
  let count = 0
  for (const connId of userConnections) {
    const conn = usersById[connId]
    if (conn?.currentPosition?.company?.toLowerCase() === advertiserCompany) count += 1
  }
  return count
}

/**
 * Calculate relevance score (0-100) for user-ad match.
 * +30 industry, +20 job title, +15 location, +10 skills, +10 per mutual connection.
 */
export function calculateRelevanceScore(userProfile, ad, usersById = {}) {
  const targeting = ad?.targeting ?? {}
  let score = 0

  const userIndustry = userProfile?.industry
  const targetIndustries = targeting.industries ?? []
  if (userIndustry && targetIndustries.length && targetIndustries.some((i) => i.toLowerCase() === userIndustry?.toLowerCase())) {
    score += 30
  }

  const userTitle = userProfile?.currentPosition?.title
  if (targeting.jobTitles?.length && jobTitleMatches(userTitle, targeting.jobTitles)) score += 20

  if (locationMatches(userProfile?.location, targeting.locations)) score += 15

  score += getSkillsOverlapScore(userProfile, ad)

  const mutual = getMutualConnectionCount(userProfile, ad, usersById)
  score += Math.min(mutual * 10, 30)

  return Math.min(score, 100)
}

/**
 * Check if user has reached frequency cap for an ad.
 * - Exclude if user has already clicked
 * - Exclude if user has seen ad 3+ times today
 */
export function hasReachedFrequencyCap(userId, adId, { clicks = [], impressions = [] }) {
  if (!userId || !adId) return false
  const hasClicked = clicks.some((c) => c.adId === adId && c.userId === userId)
  if (hasClicked) return true
  const today = new Date().toISOString().slice(0, 10)
  const todayImpressions = impressions.filter(
    (i) => i.adId === adId && i.userId === userId && i.timestamp?.startsWith(today)
  )
  return todayImpressions.length >= MAX_IMPRESSIONS_PER_DAY
}

/**
 * Get bid amount for an ad (normalized 0-1 scale).
 * Uses remaining budget (budget - spent) as proxy; normalized by typical max.
 */
export function getBidAmount(ad) {
  const budget = ad?.budget ?? 0
  const spent = ad?.spent ?? 0
  const remaining = Math.max(0, budget - spent)
  const maxTypical = 10000
  return Math.min(remaining / maxTypical, 1)
}

/**
 * Get historical CTR for an ad (clicks/impressions, 0-1 decimal).
 */
export function getHistoricalCTR(ad) {
  const impressions = ad?.impressions ?? 0
  if (impressions <= 0) return 0
  const clicks = ad?.clicks ?? 0
  return Math.min(clicks / impressions, 1)
}

/**
 * Check if ad passes targeting criteria (industry, job title, location, seniority).
 */
function passesTargeting(userProfile, ad) {
  const targeting = ad?.targeting ?? {}
  const userIndustry = userProfile?.industry
  const targetIndustries = targeting.industries ?? []
  if (targetIndustries.length && userIndustry && !targetIndustries.some((i) => i.toLowerCase() === userIndustry?.toLowerCase())) {
    return false
  }
  const userTitle = userProfile?.currentPosition?.title
  const targetTitles = targeting.jobTitles ?? []
  if (targetTitles.length && userTitle && !jobTitleMatches(userTitle, targetTitles)) return false
  if (!locationMatches(userProfile?.location, targeting.locations)) return false
  const targetSeniority = targeting.seniorityLevels ?? []
  if (targetSeniority.length) {
    const userSeniority = inferSeniority(userProfile)
    if (!targetSeniority.some((s) => s.toLowerCase() === userSeniority?.toLowerCase())) return false
  }
  return true
}

/**
 * Check if ad should be excluded (budget exhausted, campaign ended, not active).
 */
function shouldExcludeAd(ad) {
  if (ad?.status !== 'active') return true
  const budget = ad?.budget ?? 0
  const spent = ad?.spent ?? 0
  if (spent >= budget) return true
  const endDate = ad?.endDate
  if (endDate && new Date(endDate) < new Date()) return true
  const startDate = ad?.startDate
  if (startDate && new Date(startDate) > new Date()) return true
  return false
}

/**
 * Get top 5 relevant ads for a user, sorted by combined score.
 *
 * @param {Object} userProfile - User profile (id, industry, location, currentPosition, skills, connections)
 * @param {Array} allAds - All ads
 * @param {Object} [options] - Optional context
 * @param {Array} [options.clicks=[]] - Click events { adId, userId, timestamp }
 * @param {Array} [options.impressions=[]] - Impression events { adId, userId, timestamp }
 * @param {Object} [options.usersById={}] - Map of userId -> user for mutual connection calculation
 * @returns {Array} Top 5 ads sorted by finalScore descending
 */
export function getRelevantAdsForUser(userProfile, allAds, options = {}) {
  const { clicks = [], impressions = [], usersById = {} } = options
  const userId = userProfile?.id

  const filtered = allAds.filter((ad) => {
    if (shouldExcludeAd(ad)) return false
    if (!passesTargeting(userProfile, ad)) return false
    if (userId && hasReachedFrequencyCap(userId, ad.id, { clicks, impressions })) return false
    return true
  })

  const scored = filtered.map((ad) => {
    const relevanceScore = calculateRelevanceScore(userProfile, ad, usersById)
    const bidAmount = getBidAmount(ad)
    const historicalCTR = getHistoricalCTR(ad)
    const finalScore = relevanceScore * 0.4 + bidAmount * 0.3 + historicalCTR * 100 * 0.3
    return { ad, relevanceScore, bidAmount, historicalCTR, finalScore }
  })

  const sorted = scored.sort((a, b) => b.finalScore - a.finalScore)
  const top = sorted.slice(0, TOP_ADS_LIMIT).map((s) => s.ad)
  const hasVideo = top.some((ad) => ad?.type === 'sponsored_video')
  if (!hasVideo) {
    const bestVideo = sorted.find((s) => s.ad?.type === 'sponsored_video')
    if (bestVideo) {
      const withoutLowest = top.slice(0, -1)
      return [...withoutLowest, bestVideo.ad]
    }
  }
  return top
}

// --- Legacy / compatibility exports ---

export function matchesTargeting(ad, userContext = {}) {
  const { targeting = {} } = ad
  const { location, industry, jobTitle } = userContext
  const title = jobTitle ?? userContext.currentPosition?.title
  if (targeting.locations?.length && location && !locationMatches(location, targeting.locations)) return false
  if (targeting.industries?.length && industry && !targeting.industries.some((i) => i?.toLowerCase() === industry?.toLowerCase())) return false
  if (targeting.jobTitles?.length && title && !jobTitleMatches(title, targeting.jobTitles)) return false
  return true
}

export function selectFeedAds(ads, limit = 2, userContext = {}) {
  return ads
    .filter((ad) => ad.status === 'active' && matchesTargeting(ad, userContext))
    .slice(0, limit)
}

export function selectFeedVideoAds(ads, limit = 2, userContext = {}) {
  return ads
    .filter(
      (ad) =>
        ad.status === 'active' &&
        ad.type === 'sponsored_video' &&
        matchesTargeting(ad, userContext)
    )
    .slice(0, limit)
}
