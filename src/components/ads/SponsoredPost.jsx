import { useEffect } from 'react'
import { Heart, MessageCircle, Info } from 'lucide-react'
import { useFeedStore } from '@/store/feedStore'
import { useAdStore } from '@/store/adStore'

/**
 * SponsoredPost - displays a promoted ad in the feed.
 * Tracks impression on mount, click/conversion when CTA is clicked.
 * When ad is in an A/B test, records test metrics (impressions/clicks) per variant.
 */
export default function SponsoredPost({ ad, onImpression, onClick }) {
  const { getUserById } = useFeedStore()
  const { recordTestMetric } = useAdStore()
  const advertiser = getUserById(ad?.advertiserId)
  const companyName = advertiser?.currentPosition?.company ?? advertiser?.headline?.split(' at ')[1] ?? (advertiser ? `${advertiser.firstName} ${advertiser.lastName}` : 'Sponsor')
  const logoUrl = advertiser?.profilePicture
  const headline = ad?.content?.headline ?? ad?.title
  const description = ad?.content?.description ?? ad?.body
  const imageUrl = ad?.content?.imageUrl
  const ctaText = ad?.content?.ctaText
  const ctaUrl = ad?.content?.ctaUrl
  const engagement = ad?.engagement ?? {}

  useEffect(() => {
    if (ad?.id && onImpression) {
      onImpression(ad.id)
      if (ad.abTestId && ad.abVariant) {
        recordTestMetric(ad.abTestId, ad.abVariant, 'impressions', 1)
      }
    }
  }, [ad?.id, ad?.abTestId, ad?.abVariant, onImpression, recordTestMetric])

  const handleCtaClick = () => {
    if (onClick && ad?.id) onClick(ad.id)
    if (ad?.abTestId && ad?.abVariant) {
      recordTestMetric(ad.abTestId, ad.abVariant, 'clicks', 1)
    }
    if (ctaUrl) window.open(ctaUrl, '_blank', 'noopener,noreferrer')
  }

  const handleWhySeeing = (e) => {
    e.stopPropagation()
    // Could show a tooltip or modal explaining targeting
    alert(`This ad is shown based on your industry, job title, or location. Advertiser: ${companyName}`)
  }

  if (!ad) return null

  return (
    <section
      className="rounded-lg border-2 border-linkedin-primary/15 bg-linkedin-white/95 p-0 shadow-sm"
      data-sponsored-post
    >
      {/* Promoted badge + Why am I seeing this */}
      <div className="flex items-center justify-between px-4 pt-3">
        <span className="text-xs font-medium uppercase tracking-wide text-linkedin-text-gray">
          Promoted
        </span>
        <button
          type="button"
          onClick={handleWhySeeing}
          className="flex items-center gap-1 text-xs text-linkedin-text-gray hover:text-linkedin-primary hover:underline"
          title="Why am I seeing this?"
        >
          <Info className="h-3.5 w-3.5" /> Why am I seeing this?
        </button>
      </div>

      {/* Author: Company logo + name */}
      <div className="flex gap-3 px-4 pt-2">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linkedin-primary/20 text-linkedin-primary text-lg font-bold">
            {companyName.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900">{companyName}</p>
          <p className="text-xs text-linkedin-text-gray">Sponsored</p>
        </div>
      </div>

      {/* Headline (bold, larger) */}
      <h3 className="mt-3 px-4 text-lg font-bold text-gray-900">
        {headline}
      </h3>

      {/* Description */}
      {description && (
        <p className="mt-2 px-4 text-sm text-gray-700">
          {description}
        </p>
      )}

      {/* High-quality image */}
      {imageUrl && (
        <div className="mt-3 overflow-hidden">
          <img
            src={imageUrl}
            alt=""
            className="h-auto w-full max-h-[400px] object-cover"
          />
        </div>
      )}

      {/* CTA button */}
      {ctaText && (
        <div className="px-4 py-3">
          <button
            type="button"
            onClick={handleCtaClick}
            className="w-full rounded-full bg-linkedin-primary py-2.5 px-4 text-sm font-semibold text-linkedin-white transition hover:bg-linkedin-primary-dark"
          >
            {ctaText}
          </button>
        </div>
      )}

      {/* Engagement (Like, Comment only - no Repost) */}
      <div className="flex gap-4 border-t border-linkedin-border-gray px-4 py-2 text-sm text-linkedin-text-gray">
        <button type="button" className="flex items-center gap-1 hover:underline">
          <Heart className="h-4 w-4" /> {engagement.likes ?? 0}
        </button>
        <button type="button" className="flex items-center gap-1 hover:underline">
          <MessageCircle className="h-4 w-4" /> {engagement.comments ?? 0}
        </button>
      </div>
    </section>
  )
}
