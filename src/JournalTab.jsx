import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function JournalTab({ userId, onOpen }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) fetchEntries()
  }, [userId])

  const fetchEntries = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('journal')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (!error && data) setEntries(data)
    setLoading(false)
  }

  const totalOwed = entries
    .reduce((sum, e) => sum + Math.max(0, parseFloat(e.amount_owed || 0)), 0)
    .toFixed(2)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '18px', fontWeight: '600' }}>Work Journal</div>
        <div onClick={onOpen} style={{
          backgroundColor: '#00e676', color: '#000', borderRadius: '8px',
          padding: '8px 14px', fontWeight: '700', cursor: 'pointer', fontSize: '13px'
        }}>+ Add Entry</div>
      </div>

      {entries.length > 0 && (
        <div style={{
          backgroundColor: parseFloat(totalOwed) > 0 ? '#1a0a0a' : '#0a1a0a',
          borderRadius: '12px', padding: '14px 16px',
          border: `1px solid ${parseFloat(totalOwed) > 0 ? '#3a1a1a' : '#1a3a1a'}`,
          marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontSize: '13px', color: '#666' }}>Total unpaid across all jobs</span>
          <span style={{ fontSize: '18px', fontWeight: '700', color: parseFloat(totalOwed) > 0 ? '#ff4444' : '#00e676' }}>
            ${totalOwed}
          </span>
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', color: '#444' }}>Loading journal...</div>}

      {!loading && entries.length === 0 && (
        <div style={{ textAlign: 'center', color: '#444', marginTop: '60px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📓</div>
          <div style={{ fontSize: '15px' }}>No journal entries yet</div>
          <div style={{ fontSize: '13px', marginTop: '4px' }}>Tap + Add Entry to get started</div>
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
          <div style={{ fontSize: '13px', color: '#ffb300', marginBottom: '4px' }}>{e.employer}</div>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px', fontStyle: 'italic' }}>{e.work_description}</div>
          <div style={{ fontSize: '12px', color: '#555' }}>
            {e.hours_worked}h x {e.hourly_rate}/hr = {e.expected_pay} expected - {e.amount_paid} paid
          </div>
          {e.next_visit && (
            <div style={{ fontSize: '12px', color: '#ffb300', marginTop: '4px' }}>📅 Next visit: {e.next_visit}</div>
          )}
          {e.notes && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>📝 {e.notes}</div>
          )}
        </div>
      ))}
    </div>
  )
}

export default JournalTab