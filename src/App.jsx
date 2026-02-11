import { Component } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from '@/components/navigation/NavBar'
import Home from '@/pages/Home'

// #region agent log
class DebugErrorBoundary extends Component {
  componentDidCatch(error, info) {
    fetch('http://127.0.0.1:7243/ingest/583556e0-318b-40c4-8060-a267d190354c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DebugErrorBoundary:componentDidCatch',message:'Error boundary caught',data:{errorMsg:error?.message,errorStack:error?.stack?.slice(0,500),componentStack:info?.componentStack?.slice(0,300)},hypothesisId:'A,B',timestamp:Date.now()})}).catch(()=>{});
  }
  render() { return this.props.children; }
}
// #endregion

import Profile from '@/pages/Profile'
import Settings from '@/pages/Settings'
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
          <Route path="/settings" element={<Settings />} />
          <Route path="/network" element={<Network />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/ads" element={<DebugErrorBoundary><AdStudio /></DebugErrorBoundary>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
