import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from '@/components/navigation/NavBar'
import Home from '@/pages/Home'
import Profile from '@/pages/Profile'
import Network from '@/pages/Network'
import Jobs from '@/pages/Jobs'
import Messages from '@/pages/Messages'
import Notifications from '@/pages/Notifications'
import AdStudio from '@/pages/AdStudio'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-linkedin-light-gray">
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/network" element={<Network />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/ads" element={<AdStudio />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
