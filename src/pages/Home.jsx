import { useCallback, useState } from 'react'
import { useFeedStore } from '@/store/feedStore'
import { useAdStore } from '@/store/adStore'
import { useAuthStore } from '@/store/authStore'
import { formatRelativeTime } from '@/utils/helpers'
import SponsoredPost from '@/components/ads/SponsoredPost'
import SponsoredVideoPost from '@/components/ads/SponsoredVideoPost'
import UpgradeCta from '@/components/premium/UpgradeCta'
import PremiumModal from '@/components/premium/PremiumModal'
import { Heart, MessageCircle, Repeat2, Send } from 'lucide-react'

const AD_SLOT_INDICES = [1, 4, 7]

export default function Home() {
  const { posts, likePost, getUserById, getRelevantAdsForCurrentUser } = useFeedStore()
  const { trackImpression, trackClick } = useAdStore()
  const { currentUser } = useAuthStore()
  const [premiumModalOpen, setPremiumModalOpen] = useState(false)
  const isPremium = currentUser?.isPremium === true
  const relevantAds = getRelevantAdsForCurrentUser()
  const feedAds = relevantAds.filter((a) => a.type === 'sponsored_post')
  const feedVideoAds = relevantAds.filter((a) => a.type === 'sponsored_video')
  const allAdsForSlots = [
    feedAds[0],
    feedVideoAds[0],
    feedAds[1] ?? feedVideoAds[1],
  ].filter(Boolean)

  const handleAdImpression = useCallback(
    (adId) => {
      trackImpression(adId, currentUser?.id)
    },
    [trackImpression, currentUser?.id]
  )

  const handleAdClick = useCallback(
    (adId) => {
      trackClick(adId, currentUser?.id)
    },
    [trackClick, currentUser?.id]
  )

  return (
    <main className="min-h-screen bg-linkedin-light-gray py-6">
      {premiumModalOpen && <PremiumModal onClose={() => setPremiumModalOpen(false)} />}
      <div className="mx-auto max-w-2xl space-y-4 px-4">
        {!isPremium && (
          <UpgradeCta onUpgrade={() => setPremiumModalOpen(true)} />
        )}
        <section className="rounded-lg border border-linkedin-border-gray bg-linkedin-white p-4 shadow-sm">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linkedin-primary text-linkedin-white font-semibold">
              J
            </div>
            <button
              type="button"
              className="flex-1 rounded-full border border-linkedin-border-gray bg-linkedin-white px-4 py-2.5 text-left text-sm text-linkedin-text-gray hover:border-linkedin-text-gray hover:bg-linkedin-light-gray"
            >
              Start a post
            </button>
          </div>
        </section>

        {posts.map((post, index) => {
          const user = getUserById(post.authorId)
          const adSlotIndex = AD_SLOT_INDICES.indexOf(index)
          const adForSlot = adSlotIndex >= 0 ? allAdsForSlots[adSlotIndex] : null
          const showAd = adForSlot != null
          const showUpgradeCta = !isPremium && adSlotIndex === 2 && showAd
          const isVideoAd = adForSlot?.type === 'sponsored_video'
          return (
            <div key={post.id} className="space-y-4">
              <section className="rounded-lg border border-linkedin-border-gray bg-linkedin-white p-4 shadow-sm">
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linkedin-border-gray text-linkedin-text-gray font-semibold">
                    {user ? (user.firstName?.charAt(0) || user.lastName?.charAt(0) || '?') : '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900">{user ? `${user.firstName} ${user.lastName}` : ''}</p>
                    <p className="text-xs text-linkedin-text-gray">{user?.headline}</p>
                    <p className="text-xs text-linkedin-text-gray">{formatRelativeTime(post.timestamp)}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-800">{post.content}</p>
                {post.imageUrl && (
                  <div className="mt-3 overflow-hidden rounded-md">
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="max-h-[400px] w-full object-cover"
                    />
                  </div>
                )}
                <div className="mt-3 flex gap-4 text-sm text-linkedin-text-gray">
                  <button type="button" onClick={() => likePost(post.id)} className="flex items-center gap-1 hover:underline">
                    <Heart className="h-4 w-4" /> {post.likes}
                  </button>
                  <button type="button" className="flex items-center gap-1 hover:underline">
                    <MessageCircle className="h-4 w-4" /> {post.comments}
                  </button>
                  <button type="button" className="flex items-center gap-1 hover:underline">
                    <Repeat2 className="h-4 w-4" /> Repost
                  </button>
                  <button type="button" className="flex items-center gap-1 hover:underline">
                    <Send className="h-4 w-4" /> Send
                  </button>
                </div>
              </section>
              {showAd && (
                isVideoAd ? (
                  <SponsoredVideoPost
                    ad={adForSlot}
                    onImpression={handleAdImpression}
                    onClick={handleAdClick}
                  />
                ) : (
                  <SponsoredPost
                    ad={adForSlot}
                    onImpression={handleAdImpression}
                    onClick={handleAdClick}
                  />
                )
              )}
              {showUpgradeCta && (
                <UpgradeCta onUpgrade={() => setPremiumModalOpen(true)} />
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
