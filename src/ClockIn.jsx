import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function ClockIn({ onBack }) {
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [clockInTime, setClockInTime] = useState(null)
  const [elapsed, setElapsed] = useState('00:00:00')
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  const userId = 'carlos'

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    let timer
    if (isClockedIn && clockInTime) {
      timer = setInterval(() => {
        const diff = Math.floor((Date.now() - clockInTime) / 1000)
        const h = String(Math.floor(diff / 3600)).padStart(2, '0')
        const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0')
        const s = String(diff % 60).padStart(2, '0')
        setElapsed(`${h}:${m}:${s}`)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isClockedIn, clockInTime])

  const fetchSessions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
    if (!error && data) setSessions(data)
    setLoading(false)
  }

  const handleClockIn = () => {
    setIsClockedIn(true)
    setClockInTime(Date.now())
    setElapsed('00:00:00')
  }

  const handleClockOut = async () => {
    const session = {
      date: new Date(clockInTime).toLocaleDateString(),
      clock_in: new Date(clockInTime).toLocaleTimeString(),
      clock_out: new Date().toLocaleTimeString(),
      duration: elapsed,
      user_id: userId,
    }
    const { error } = await supabase.from('sessions').insert([session])
    if (!error) fetchSessions()
    setIsClockedIn(false)
    setClockInTime(null)
    setElapsed('00:00:00')
  }

  return (
    <div style={{
      maxWidth: '430px', margin: '0 auto', minHeight: '100vh',
      backgroundColor: '#0a0a0a', color: '#ffffff',
      fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span onClick={onBack} style={{ cursor: 'pointer', color: '#00e676', fontSize: '20px' }}>←</span>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#00e676' }}>Clock In / Out</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Track your work hours</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px' }}>
        {/* Timer display */}
        <div style={{
          backgroundColor: '#111', borderRadius: '16px', padding: '32px',
          textAlign: 'center', border: '1px solid #1e1e1e', marginBottom: '24px'
        }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
            {isClockedIn ? 'TIME ELAPSED' : 'READY TO CLOCK IN'}
          </div>
          <div style={{ fontSize: '48px', fontWeight: '700', color: isClockedIn ? '#00e676' : '#333', letterSpacing: '2px' }}>
            {elapsed}
          </div>
          {isClockedIn && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Started at {new Date(clockInTime).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Clock in/out button */}
        <button onClick={isClockedIn ? handleClockOut : handleClockIn} style={{
          width: '100%', padding: '18px', borderRadius: '12px', border: 'none',
          backgroundColor: isClockedIn ? '#ff4444' : '#00e676',
          color: isClockedIn ? '#ffffff' : '#000000',
          fontSize: '17px', fontWeight: '700', cursor: 'pointer', marginBottom: '32px'
        }}>
          {isClockedIn ? '🛑 Clock Out' : '▶ Clock In'}
        </button>

        {/* Sessions list */}
        {loading && <div style={{ textAlign: 'center', color: '#444' }}>Loading sessions...</div>}
        {!loading && sessions.length > 0 && (
          <div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>RECENT SESSIONS</div>
            {sessions.map((s) => (
              <div key={s.id} style={{
                backgroundColor: '#111', borderRadius: '12px', padding: '14px 16px',
                border: '1px solid #1e1e1e', marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{s.date}</span>
                  <span style={{ fontSize: '14px', color: '#00e676', fontWeight: '700' }}>{s.duration}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {s.clock_in} → {s.clock_out}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ClockIn