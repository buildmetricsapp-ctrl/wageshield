import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function Journal({ onBack, userId }) {
  const [entries, setEntries] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedEmployer, setSelectedEmployer] = useState('')
  const [workDone, setWorkDone] = useState('')
  const [notes, setNotes] = useState('')
  const [nextVisit, setNextVisit] = useState('')

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-CA')
  const displayDate = today.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: p } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    const { data: j } = await supabase
      .from('journal')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (p) setPayments(p)
    if (j) setEntries(j)
    setLoading(false)
  }

  const employers = [...new Set(payments.map(p => p.employer).filter(Boolean))]
  const employerData = payments.find(p => p.employer === selectedEmployer)

  const expectedPay = employerData ? employerData.expected_pay : '0.00'
  const amountPaid = employerData ? employerData.amount_received : '0.00'
  const hourlyRate = employerData ? employerData.hourly_rate : '0.00'
  const hoursWorked = employerData ? employerData.hours_worked : '0'
  const paymentNotes = employerData ? employerData.notes : ''
  const amountOwed = employerData
    ? Math.max(0, parseFloat(expectedPay) - parseFloat(amountPaid)).toFixed(2)
    : '0.00'

  const handleSave = async () => {
    if (!selectedEmployer || !workDone) return
    const entry = {
      date: dateStr,
      display_date: displayDate,
      employer: selectedEmployer,
      work_description: workDone,
      hours_worked: hoursWorked,
      hourly_rate: hourlyRate,
      expected_pay: expectedPay,
      amount_paid: amountPaid,
      amount_owed: amountOwed,
      notes: notes,
      next_visit: nextVisit,
      user_id: userId,
    }
    const { error } = await supabase.from('journal').insert([entry])
    if (!error) {
      fetchData()
      setShowForm(false)
      setSelectedEmployer('')
      setWorkDone('')
      setNotes('')
      setNextVisit('')
    }
  }

  const totalOwed = entries
    .reduce((sum, e) => sum + Math.max(0, parseFloat(e.amount_owed || 0)), 0)
    .toFixed(2)

  return (
    <div style={{
      maxWidth: '430px', margin: '0 auto', minHeight: '100vh',
      backgroundColor: '#0a0a0a', color: '#ffffff',
      fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span onClick={onBack} style={{ cursor: 'pointer', color: '#00e676', fontSize: '20px' }}>←</span>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#00e676' }}>Work Journal</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{displayDate}</div>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          backgroundColor: '#00e676', color: '#000', border: 'none',
          borderRadius: '8px', padding: '8px 14px', fontWeight: '700', cursor: 'pointer'
        }}>
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>

        {entries.length > 0 && (
          <div style={{
            backgroundColor: parseFloat(totalOwed) > 0 ? '#1a0a0a' : '#0a1a0a',
            borderRadius: '12px', padding: '16px',
            border: `1px solid ${parseFloat(totalOwed) > 0 ? '#3a1a1a' : '#1a3a1a'}`,
            marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontSize: '14px', color: '#666' }}>Total unpaid across all jobs</span>
            <span style={{ fontSize: '20px', fontWeight: '700', color: parseFloat(totalOwed) > 0 ? '#ff4444' : '#00e676' }}>
              ${totalOwed}
            </span>
          </div>
        )}

        {showForm && (
          <div style={{ backgroundColor: '#111', borderRadius: '16px', padding: '20px', border: '1px solid #1e1e1e', marginBottom: '24px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>New Journal Entry</div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>{displayDate}</div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Select employer</div>
              {employers.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#444', padding: '10px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                  No employers found. Log a payment first.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {employers.map(emp => (
                    <div key={emp} onClick={() => setSelectedEmployer(emp)} style={{
                      padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                      backgroundColor: selectedEmployer === emp ? '#00e676' : '#1a1a1a',
                      color: selectedEmployer === emp ? '#000' : '#fff',
                      fontSize: '14px', fontWeight: selectedEmployer === emp ? '700' : '400',
                      border: `1px solid ${selectedEmployer === emp ? '#00e676' : '#333'}`
                    }}>
                      {emp}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedEmployer && employerData && (
              <div style={{ backgroundColor: '#0a0a0a', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>AUTO-FILLED FROM PAYMENT LOG</div>
                {[
                  { label: 'Hours worked', value: `${hoursWorked}h` },
                  { label: 'Hourly rate', value: `$${hourlyRate}/hr` },
                  { label: 'Expected pay', value: `$${expectedPay}` },
                  { label: 'Amount paid', value: `$${amountPaid}` },
                  { label: 'Notes from log', value: paymentNotes || 'None' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>{item.label}</span>
                    <span style={{ fontSize: item.label === 'Notes from log' ? '11px' : '13px', color: '#fff' }}>{item.value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #1a1a1a' }}>
                  <span style={{ fontSize: '13px', color: '#666', fontWeight: '700' }}>Amount owed</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: parseFloat(amountOwed) > 0 ? '#ff4444' : '#00e676' }}>
                    {parseFloat(amountOwed) > 0 ? `-$${amountOwed}` : '✓ Fully paid'}
                  </span>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Is next visit required? If yes, when?</div>
              <input
                type="date"
                value={nextVisit}
                onChange={(e) => setNextVisit(e.target.value)}
                style={{
                  width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #333',
                  borderRadius: '8px', padding: '10px 12px', color: '#fff',
                  fontSize: '15px', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Work status / what was done</div>
              <textarea
                value={workDone}
                onChange={(e) => setWorkDone(e.target.value)}
                placeholder="e.g. Poured concrete on 3rd floor, installed rebar..."
                rows={3}
                style={{
                  width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #333',
                  borderRadius: '8px', padding: '10px 12px', color: '#fff',
                  fontSize: '15px', boxSizing: 'border-box', resize: 'none'
                }}
              />
            </div>

            

            <button onClick={handleSave} disabled={!selectedEmployer || !workDone} style={{
              width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
              backgroundColor: selectedEmployer && workDone ? '#00e676' : '#1a1a1a',
              color: selectedEmployer && workDone ? '#000' : '#444',
              fontSize: '15px', fontWeight: '700', cursor: 'pointer'
            }}>
              Save to Journal
            </button>
          </div>
        )}

        {loading && <div style={{ textAlign: 'center', color: '#444' }}>Loading journal...</div>}

        {!loading && entries.length === 0 && !showForm && (
          <div style={{ textAlign: 'center', color: '#444', marginTop: '60px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📓</div>
            <div style={{ fontSize: '15px' }}>No entries yet</div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>Tap + Add to record your first work day</div>
          </div>
        )}

        {entries.map((e) => (
          <div key={e.id} style={{
            backgroundColor: '#111', borderRadius: '12px', padding: '16px',
            border: `1px solid ${parseFloat(e.amount_owed) > 0 ? '#3a1a1a' : '#1a2a1a'}`,
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700' }}>{e.display_date || e.date}</span>
              {parseFloat(e.amount_owed) > 0
                ? <span style={{ fontSize: '13px', color: '#ff4444', fontWeight: '700' }}>-${e.amount_owed} owed</span>
                : <span style={{ fontSize: '13px', color: '#00e676', fontWeight: '700' }}>✓ Fully paid</span>
              }
            </div>
            <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '4px' }}>{e.employer}</div>
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px', fontStyle: 'italic' }}>{e.work_description}</div>
            <div style={{ fontSize: '12px', color: '#555' }}>
              {e.hours_worked}h x {e.hourly_rate}/hr = {e.expected_pay} expected - {e.amount_paid} paid
            </div>
            {e.next_visit && <div style={{ fontSize: '12px', color: '#ffb300', marginTop: '4px' }}>📅 Next visit: {e.next_visit}</div>}
            {e.notes && <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>📝 {e.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Journal