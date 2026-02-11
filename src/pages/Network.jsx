import connections from '@/data/connections.json'
import usersData from '@/data/users.json'

export default function Network() {
  const myGraph = connections.find((c) => c.userId === 'user-1')
  const connectionIds = myGraph?.connections ?? []
  return (
    <main className="min-h-screen bg-linkedin-light-gray py-6">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-xl font-bold text-gray-900">My Network</h1>
        <div className="mt-4 space-y-3 rounded-lg border border-linkedin-border-gray bg-linkedin-white p-4 shadow-sm">
          {connectionIds.map((connectionId) => {
            const user = usersData.find((u) => u.id === connectionId)
            if (!user) return null
            const name = `${user.firstName} ${user.lastName}`
            return (
              <div key={connectionId} className="flex items-center justify-between border-b border-linkedin-border-gray pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linkedin-border-gray text-linkedin-text-gray font-semibold">
                    {user.firstName?.charAt(0) || user.lastName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{name}</p>
                    <p className="text-sm text-linkedin-text-gray">{user.headline}</p>
                  </div>
                </div>
                <button type="button" className="rounded-full border border-linkedin-primary px-4 py-2 text-sm font-medium text-linkedin-primary hover:bg-linkedin-primary hover:text-linkedin-white transition">
                  Message
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
