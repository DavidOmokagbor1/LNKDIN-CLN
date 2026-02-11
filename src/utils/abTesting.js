/**
 * A/B testing utilities for ad variants.
 * - selectVariant: randomly choose A or B based on split %
 * - recordTestMetric: (handled by store)
 * - calculateSignificance: chi-square or z-test for CTR difference
 * - declareWinner: (handled by store)
 */

/**
 * Randomly select variant A or B based on test split percentage.
 * @param {string} testId - Test id
 * @param {number} splitPercent - % for A (0-100); B gets remainder
 * @returns {'A'|'B'}
 */
export function selectVariant(testId, splitPercent = 50) {
  const p = Math.max(0, Math.min(100, splitPercent)) / 100
  return Math.random() < p ? 'A' : 'B'
}

/**
 * Two-proportion z-test for CTR difference.
 * Returns p-value (two-tailed); lower = more significant.
 * @param {{ impressions: number, clicks: number }} variantA
 * @param {{ impressions: number, clicks: number }} variantB
 * @returns {{ significant: boolean, pValue: number, confidence: number }} confidence as % (e.g. 95)
 */
export function calculateSignificance(variantA, variantB) {
  const n1 = variantA?.impressions ?? 0
  const n2 = variantB?.impressions ?? 0
  const x1 = variantA?.clicks ?? 0
  const x2 = variantB?.clicks ?? 0

  if (n1 < 30 || n2 < 30) {
    return { significant: false, pValue: 1, confidence: 0 }
  }

  const p1 = x1 / n1
  const p2 = x2 / n2
  const pPool = (x1 + x2) / (n1 + n2)
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2))
  if (se === 0) return { significant: false, pValue: 1, confidence: 0 }

  const z = Math.abs(p1 - p2) / se
  const pValue = 2 * (1 - normalCdf(z))
  const significant = pValue < 0.05
  const confidence = Math.round((1 - pValue) * 100)

  return { significant, pValue, confidence: Math.min(confidence, 99) }
}

/** Approximate standard normal CDF (Abramowitz & Stegun). */
function normalCdf(z) {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const t = 1.0 / (1.0 + p * Math.abs(z))
  const t2 = t * t
  const t3 = t2 * t
  const t4 = t3 * t
  const t5 = t4 * t
  const y = 1.0 - (((a5 * t5 + a4 * t4 + a3 * t3) + a2 * t2) + a1 * t) * Math.exp(-z * z / 2)
  return z < 0 ? 1 - y : y
}

/**
 * Determine winner by CTR (auto). Caller can override with manual choice.
 * @param {{ impressions: number, clicks: number }} variantA
 * @param {{ impressions: number, clicks: number }} variantB
 * @returns {'A'|'B'|null} null if tie or insufficient data
 */
export function getWinnerByCtr(variantA, variantB) {
  const ctrA = (variantA?.impressions ?? 0) > 0 ? (variantA?.clicks ?? 0) / (variantA?.impressions ?? 1) : 0
  const ctrB = (variantB?.impressions ?? 0) > 0 ? (variantB?.clicks ?? 0) / (variantB?.impressions ?? 1) : 0
  if (ctrA > ctrB) return 'A'
  if (ctrB > ctrA) return 'B'
  return null
}
