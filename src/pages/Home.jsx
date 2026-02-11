import { useFeedStore } from '@/store/feedStore'
import { useAdStore } from '@/store/adStore'
import { selectFeedAds } from '@/utils/adTargeting'
import { formatRelativeTime } from '@/utils/helpers'
import { Heart, MessageCircle, Repeat2, Send } from 'lucide-react'

export default function Home() {
  const { posts, likePost, getUserById } = useFeedStore()
  const { ads } = useAdStore()
  const feedAds = selectFeedAds(ads, 2)

  return (
    <main className="min-h-screen bg-linkedin-light-gray py-6">
      <div className="mx-auto max-w-2xl space-y-4 px-4">
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
          const showAd = index === 1 && feedAds.length > 0
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
                <section className="rounded-lg border border-linkedin-border-gray bg-linkedin-light-gray p-4">
                  <span className="text-xs font-medium uppercase tracking-wide text-linkedin-text-gray">Ad</span>
                  <p className="mt-1 font-medium text-gray-900">{feedAds[0].content?.headline ?? feedAds[0].title}</p>
                  <p className="text-sm text-linkedin-text-gray">{feedAds[0].content?.description ?? feedAds[0].body}</p>
                </section>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
