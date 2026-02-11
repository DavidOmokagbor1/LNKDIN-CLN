import { create } from 'zustand'
import postsData from '@/data/posts.json'
import usersData from '@/data/users.json'
import { useAuthStore } from '@/store/authStore'
import { useAdStore } from '@/store/adStore'
import { getRelevantAdsForUser } from '@/utils/adTargeting'

export const useFeedStore = create((set, get) => ({
  posts: postsData,
  users: usersData,
  loading: false,

  fetchPosts: async () => {
    set({ loading: true })
    try {
      // Simulate network: in a real app you'd fetch from API; here we keep/merge with existing
      const posts = [...get().posts]
      set({ posts, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  createPost: (content, options = {}) => {
    const authorId = options.authorId ?? useAuthStore.getState().currentUser?.id
    if (!authorId) return
    const now = new Date().toISOString()
    const newPost = {
      id: `post-${Date.now()}`,
      authorId,
      content: typeof content === 'string' ? content : content.text,
      imageUrl: content.imageUrl ?? null,
      videoUrl: content.videoUrl ?? null,
      linkUrl: content.linkUrl ?? null,
      timestamp: now,
      likes: 0,
      comments: 0,
      reposts: 0,
      likedBy: [],
      commentsList: [],
      type: 'organic',
    }
    set((state) => ({ posts: [newPost, ...state.posts] }))
  },

  likePost: (postId) => {
    const userId = useAuthStore.getState().currentUser?.id
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p
        const likedBy = p.likedBy ?? []
        const hasLiked = likedBy.includes(userId)
        return {
          ...p,
          likes: hasLiked ? Math.max(0, (p.likes || 0) - 1) : (p.likes || 0) + 1,
          likedBy: hasLiked ? likedBy.filter((id) => id !== userId) : [...likedBy, userId],
        }
      }),
    }))
  },

  commentOnPost: (postId, comment) => {
    const userId = comment?.userId ?? useAuthStore.getState().currentUser?.id
    const text = typeof comment === 'string' ? comment : comment?.text
    if (!text) return
    const commentEntry = {
      id: `comment-${Date.now()}`,
      userId,
      text,
      timestamp: new Date().toISOString(),
    }
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p
        const commentsList = Array.isArray(p.commentsList) ? [...p.commentsList, commentEntry] : [commentEntry]
        return { ...p, comments: (p.comments || 0) + 1, commentsList }
      }),
    }))
  },

  repostPost: (postId) => {
    const userId = useAuthStore.getState().currentUser?.id
    if (!userId) return
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              reposts: (p.reposts || 0) + 1,
              repostedBy: [...(p.repostedBy || []), userId],
            }
          : p
      ),
    }))
  },

  getUserById: (userId) => get().users.find((u) => u.id === userId),

  getRelevantAdsForCurrentUser: () => {
    const { users } = get()
    const currentUser = useAuthStore.getState().currentUser
    const { ads, clicks, impressions } = useAdStore.getState()
    if (!currentUser) return []
    if (currentUser.isPremium === true) return []
    const usersById = Object.fromEntries(users.map((u) => [u.id, u]))
    return getRelevantAdsForUser(currentUser, ads, {
      clicks,
      impressions,
      usersById,
    })
  },
}))
