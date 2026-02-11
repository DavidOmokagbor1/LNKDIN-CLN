import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: {
    id: 'u1',
    name: 'Jane Doe',
    headline: 'Software Engineer at Tech Co',
    avatar: null,
    email: 'jane@example.com',
  },
  isAuthenticated: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}))
