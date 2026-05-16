import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function Payment({ onBack, userId }) {
  const [clockInTime, setClockInTime] = useState(null)
  const [clockOutTime, setClockOutTime] = useState(null)
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    date: '',
    employer: '',
    hoursWorked: '',
    hourlyRate: '',
    amountReceived: '',
    notes: '',
  })

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (!error && data) setPayments(data)
    setLoading(false)
  }

  const handleClockIn = () => {
    const now = new Date()
    setClockInTime(now)
    setClockOutTime(null)
    setIsClockedIn(true)
    setForm(f => ({
      ...f,
      date: now.toLocaleDateString('en-CA'),
    }))
  }

  const handleClockOut = () => {
    const now = new Date()
    setClockOutTime(now)
    setIsClockedIn(false)

    const diffMs = now - clockInTime
    const diffHrs = (diffMs / 3600000).toFixed(2)

    setForm(f => ({
      ...f,
      hoursWorked: diffHrs,
    }))
    setShowForm(true)
  }

  const formatTime = (date) => {
    if (!date) return '--:--'
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const expectedPay = form.hoursWorked && form.hourlyRate
    ? (parseFloat(form.hoursWorked) * parseFloat(form.hourlyRate)).toFixed(2)
    : '0.00'

  const gap = form.amountReceived
    ? (parseFloat(expectedPay) - parseFloat(form.amountReceived)).toFixed(2)
    : '0.00'

  const handleSave = async () => {
    if (!form.date || !form.hoursWorked || !form.hourlyRate || !form.amountReceived) return
    const payment = {
      date: form.date,
      employer: form.employer,
      hours_worked: form.hoursWorked,
      hourly_rate: form.hourlyRate,
      amount_received: form.amountReceived,
      expected_pay: expectedPay,
      gap: gap,
      notes: form.notes,
      user_id: userId,
    }
    const { error } = await supabase.from('payments').insert([payment])
    if (!error) {
      fetchPayments()
      setShowForm(false)
      setClockInTime(null)
      setClockOutTime(null)
      setForm({ date: '', employer: '', hoursWorked: '', hourlyRate: '', amountReceived: '', notes: '' })
    }
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
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#00e676' }}>Log a Payment</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Clock in, clock out, get paid right</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>

        {/* Clock In / Clock Out */}
        <div style={{ backgroundColor: '#111', borderRadius: '16px', padding: '20px', border: '1px solid #1e1e1e', marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>WORK SESSION</div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, backgroundColor: '#0a0a0a', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>CLOCK IN</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: clockInTime ? '#00e676' : '#333' }}>
                {formatTime(clockInTime)}
              </div>
            </div>
            <div style={{ flex: 1, backgroundColor: '#0a0a0a', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>CLOCK OUT</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: clockOutTime ? '#ff4444' : '#333' }}>
                {formatTime(clockOutTime)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleClockIn} disabled={isClockedIn} style={{
              flex: 1, padding: '14px', borderRadius: '10px', border: 'none',
              backgroundColor: isClockedIn ? '#1a2a1a' : '#00e676',
              color: isClockedIn ? '#00e676' : '#000',
              fontSize: '15px', fontWeight: '700', cursor: isClockedIn ? 'not-allowed' : 'pointer'
            }}>
              {isClockedIn ? '✓ Clocked In' : '▶ Clock In'}
            </button>
            <button onClick={handleClockOut} disabled={!isClockedIn} style={{
              flex: 1, padding: '14px', borderRadius: '10px', border: 'none',
              backgroundColor: isClockedIn ? '#ff4444' : '#1a1a1a',
              color: isClockedIn ? '#fff' : '#444',
              fontSize: '15px', fontWeight: '700', cursor: isClockedIn ? 'pointer' : 'not-allowed'
            }}>
              🛑 Clock Out
            </button>
          </div>
        </div>

        {/* Payment form — shows after clock out */}
        {showForm && (
          <div style={{ backgroundColor: '#111', borderRadius: '16px', padding: '20px', border: '1px solid #1e1e1e', marginBottom: '24px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Complete Payment Record</div>

            {[
              { label: 'Employer / Job site', key: 'employer', type: 'text' },
              { label: 'Hourly rate ($)', key: 'hourlyRate', type: 'number' },
              { label: 'Amount received ($)', key: 'amountReceived', type: 'number' },
              { label: 'Notes (optional)', key: 'notes', type: 'text' },
            ].map((field) => (
              <div key={field.key} style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{field.label}</div>
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  style={{
                    width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #333',
                    borderRadius: '8px', padding: '10px 12px', color: '#fff',
                    fontSize: '15px', boxSizing: 'border-box'
                  }}
                />
              </div>
            ))}

            <div style={{ backgroundColor: '#0a0a0a', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#666' }}>Hours worked</span>
                <span style={{ fontSize: '13px', color: '#fff' }}>{form.hoursWorked}h</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#666' }}>Expected pay</span>
                <span style={{ fontSize: '13px', color: '#00e676' }}>${expectedPay}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#666' }}>Unpaid gap</span>
                <span style={{ fontSize: '13px', color: parseFloat(gap) > 0 ? '#ff4444' : '#00e676', fontWeight: '700' }}>
                  {parseFloat(gap) > 0 ? `-$${gap}` : '$0.00'}
                </span>
              </div>
            </div>

            <button onClick={handleSave} style={{
              width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
              backgroundColor: '#00e676', color: '#000', fontSize: '15px',
              fontWeight: '700', cursor: 'pointer'
            }}>
              Save Payment Record
            </button>
          </div>
        )}

        {/* Payments list */}
        {loading && <div style={{ textAlign: 'center', color: '#444' }}>Loading payments...</div>}

        {!loading && payments.length === 0 && !showForm && (
          <div style={{ textAlign: 'center', color: '#444', marginTop: '40px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>💰</div>
            <div style={{ fontSize: '15px' }}>No payments logged yet</div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>Clock in to start tracking</div>
          </div>
        )}

        {payments.map((p) => (
          <div key={p.id} style={{
            backgroundColor: '#111', borderRadius: '12px', padding: '16px',
            border: `1px solid ${parseFloat(p.gap) > 0 ? '#3a1a1a' : '#1a2a1a'}`,
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              {parseFloat(p.gap) > 0
                ? <span style={{ fontSize: '13px', color: '#ff4444', fontWeight: '700' }}>-${p.gap} unpaid</span>
                : <span style={{ fontSize: '13px', color: '#00e676', fontWeight: '700' }}>✓ Paid in full</span>
              }
            </div>
            <div style={{ fontSize: '12px', color: '#ffb300' }}>{p.employer}</div>
            <div style={{ fontSize: '12px', color: '#ffb300', marginTop: '4px' }}>
              {p.hours_worked}h x {p.hourly_rate}/hr = {p.expected_pay} expected - {p.amount_received} received
            </div>
            {p.notes ? <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>📝 {p.notes}</div> : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Payment