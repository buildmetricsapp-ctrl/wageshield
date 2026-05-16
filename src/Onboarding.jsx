import { useState } from 'react'

function Onboarding({ onComplete }) {
  const [name, setName] = useState('')

  const handleComplete = () => {
    if (!name.trim()) return
    localStorage.setItem('wageshield_name', name.trim())
    onComplete(name.trim())
  }

  return (
    <div style={{
      maxWidth: '430px', margin: '0 auto', minHeight: '100vh',
      backgroundColor: '#0a0a0a', color: '#ffffff',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '40px 24px',
    }}>
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '32px', fontWeight: '800', color: '#00e676' }}>WageShield</div>
        <div style={{ fontSize: '15px', color: '#666', marginTop: '4px' }}>Your wages. Protected.</div>
      </div>

      <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
        What's your name?
      </div>
      <div style={{ fontSize: '15px', color: '#666', marginBottom: '32px' }}>
        WageShield keeps everything private. Your data never leaves your control.
      </div>

      <input
        type="text"
        placeholder="Enter your first name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleComplete()}
        style={{
          width: '100%', backgroundColor: '#111', border: '1px solid #333',
          borderRadius: '12px', padding: '16px', color: '#fff',
          fontSize: '18px', boxSizing: 'border-box', marginBottom: '16px'
        }}
      />

      <button onClick={handleComplete} style={{
        width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
        backgroundColor: name.trim() ? '#00e676' : '#1a1a1a',
        color: name.trim() ? '#000' : '#444',
        fontSize: '16px', fontWeight: '700', cursor: 'pointer'
      }}>
        Start protecting my wages →
      </button>

      <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[
          '🔒 Zero personal data collected',
          '📵 No ads. Ever.',
          '👤 You own your data completely',
        ].map(item => (
          <div key={item} style={{ fontSize: '13px', color: '#444' }}>{item}</div>
        ))}
      </div>
    </div>
  )
}

export default Onboarding