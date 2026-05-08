import { useState, useEffect } from 'react'
import ClockIn from './ClockIn'
import Payment from './Payment'
import Report from './Report'
import Onboarding from './Onboarding'
import { supabase } from './supabase'

function App() {
  const [currentScreen, setCurrentScreen] = useState('home')
  const [activeTab, setActiveTab] = useState('home')
  const [userName, setUserName] = useState(() => localStorage.getItem('wageshield_name') || '')
  const [stats, setStats] = useState({ hours: 0, unpaid: 0 })

  const userId = userName.toLowerCase() || 'carlos'

  useEffect(() => {
    if (userName) fetchStats()
  }, [userName])

  const fetchStats = async () => {
    const { data: sessions } = await supabase
      .from('sessions')
      .select('duration')
      .eq('user_id', userId)

    const { data: payments } = await supabase
      .from('payments')
      .select('gap')
      .eq('user_id', userId)

    if (sessions) {
      let totalSeconds = 0
      sessions.forEach(s => {
        const parts = s.duration.split(':')
        if (parts.length === 3) {
          totalSeconds += parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
        }
      })
      const totalHours = (totalSeconds / 3600).toFixed(1)
      const totalUnpaid = payments
        ? payments.reduce((sum, p) => sum + Math.max(0, parseFloat(p.gap || 0)), 0).toFixed(2)
        : '0.00'
      setStats({ hours: totalHours, unpaid: totalUnpaid })
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (!userName) {
    return <Onboarding onComplete={(name) => setUserName(name)} />
  }

  if (currentScreen === 'clockin') {
    return <ClockIn onBack={() => { setCurrentScreen('home'); fetchStats() }} userId={userId} />
  }

  if (currentScreen === 'payment') {
    return <Payment onBack={() => { setCurrentScreen('home'); fetchStats() }} userId={userId} />
  }

  if (currentScreen === 'report') {
    return <Report onBack={() => setCurrentScreen('home')} userId={userId} />
  }

  return (
    <div style={{
      maxWidth: '430px',
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Header */}
      <div style={{
        padding: '20px 24px 16px',
        borderBottom: '1px solid #1a1a1a',
      }}>
        <div style={{ fontSize: '22px', fontWeight: '700', color: '#00e676' }}>
          WageShield
        </div>
        <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
          Your wages. Protected.
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '24px' }}>

        {activeTab === 'home' && (
          <div>
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>
              {getGreeting()}, {userName} 👷
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                flex: 1, backgroundColor: '#111', borderRadius: '12px',
                padding: '16px', border: '1px solid #1e1e1e'
              }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Total hours</div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#00e676' }}>{stats.hours}h</div>
                <div style={{ fontSize: '11px', color: '#444' }}>hours logged</div>
              </div>
              <div style={{
                flex: 1, backgroundColor: '#111', borderRadius: '12px',
                padding: '16px', border: '1px solid #1e1e1e'
              }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Owed</div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: parseFloat(stats.unpaid) > 0 ? '#ffb300' : '#00e676' }}>
                  ${stats.unpaid}
                </div>
                <div style={{ fontSize: '11px', color: '#444' }}>unpaid wages</div>
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>QUICK ACTIONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: '⏱', label: 'Clock In / Clock Out', screen: 'clockin' },
                { icon: '💰', label: 'Log a Payment', screen: 'payment' },
                { icon: '📋', label: 'Generate Evidence Report', screen: 'report' },
              ].map((item) => (
                <div key={item.label} onClick={() => setCurrentScreen(item.screen)} style={{
                  backgroundColor: '#111',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  border: '1px solid #1e1e1e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                }}>
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  <span style={{ fontSize: '15px', fontWeight: '500' }}>{item.label}</span>
                  <span style={{ marginLeft: 'auto', color: '#333' }}>›</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Bottom nav */}
      <div style={{
        display: 'flex',
        borderTop: '1px solid #1a1a1a',
        backgroundColor: '#0a0a0a',
      }}>
        {[
          { id: 'home', icon: '🏠', label: 'Home' },
          { id: 'hours', icon: '⏱', label: 'Hours' },
          { id: 'payments', icon: '💰', label: 'Payments' },
          { id: 'report', icon: '📋', label: 'Report' },
        ].map((tab) => (
          <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1,
            padding: '12px 0',
            textAlign: 'center',
            cursor: 'pointer',
            color: activeTab === tab.id ? '#00e676' : '#444',
          }}>
            <div style={{ fontSize: '20px' }}>{tab.icon}</div>
            <div style={{ fontSize: '10px', marginTop: '2px' }}>{tab.label}</div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default App