import { create } from 'zustand'
import postsData from '@/data/posts.json'
import usersData from '@/data/users.json'

export const useFeedStore = create((set, get) => ({
  posts: postsData,
  users: usersData,
  addPost: (post) =>
    set((state) => ({
      posts: [{ ...post, id: `p${Date.now()}`, likes: 0, comments: 0 }, ...state.posts],
    })),
  likePost: (postId) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p
      ),
    })),
  getUserById: (userId) => get().users.find((u) => u.id === userId),
}))
