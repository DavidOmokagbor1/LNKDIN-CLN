import { create } from 'zustand'
import usersData from '@/data/users.json'

export const useAuthStore = create((set, get) => ({
  currentUser: usersData.find((u) => u.id === 'user-1') ?? null,
  isAuthenticated: true,

  login: (userId) => {
    const user = usersData.find((u) => u.id === userId)
    set({ currentUser: user ?? null, isAuthenticated: !!user })
  },

  logout: () => set({ currentUser: null, isAuthenticated: false }),

  updateProfile: (data) => {
    const { currentUser } = get()
    if (!currentUser) return
    set({
      currentUser: {
        ...currentUser,
        ...data,
      },
    })
  },
}))
