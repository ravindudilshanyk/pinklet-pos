import { useState } from 'react'
import api from '@/services/api'

interface Props {
    item: any
    onClose: () => void
    onSaved: () => void
}

const WASTE_REASONS = [
    'Expired / Past shelf life',
    'Damaged in storage',
    'Damaged during delivery',
    'Quality failed inspection',
    'Unsold perishable',
    'Customer return - damaged',
    'Other',
]

export default function WasteModal({ item, onClose, onSaved }: Props) {
    const [quantity, setQuantity] = useState('1')
    const [reason, setReason] = useState('')
    const [note, setNote] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const qty = parseInt(quantity || '0')
    const cost = qty * item.buyingPrice

    const handleSave = async () => {
        if (!quantity || qty <= 0) return setError('Enter a valid quantity')
        if (!reason) return setError('Please select a reason')
        if (qty > item.stock) return setError(`Only ${item.stock} units in stock`)

        try {
            setLoading(true)
            await api.post(`/items/${item.id}/waste`, { quantity: qty, reason, note })
            onSaved()
            onClose()
        } catch {
            setError('Failed to log waste')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(9,9,9,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: 'Inter, sans-serif', padding: '16px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 40px rgba(9,9,9,0.20)', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(9,9,9,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#090909' }}>⚠ Log Waste / Damage</h3>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>{item.name} · Stock: {item.stock}</p>
                    </div>
                    <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(9,9,9,0.06)', color: 'rgba(9,9,9,0.50)', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>

                <div style={{ padding: '20px 24px' }}>

                    {/* Quantity */}
                    <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantity</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '12px', height: '50px', padding: '0 16px', marginBottom: '14px' }}>
                        <button onClick={() => setQuantity(String(Math.max(1, qty - 1)))} style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(245,158,11,0.15)', color: '#b45309', cursor: 'pointer', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', fontSize: '18px', fontWeight: 700, color: '#090909', fontFamily: 'Inter, sans-serif', backgroundColor: 'transparent', textAlign: 'center' }} />
                        <button onClick={() => setQuantity(String(Math.min(item.stock, qty + 1)))} style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(245,158,11,0.15)', color: '#b45309', cursor: 'pointer', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>

                    {/* Cost impact */}
                    {qty > 0 && (
                        <div style={{ backgroundColor: 'rgba(239,68,68,0.06)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', color: 'rgba(9,9,9,0.55)' }}>Cost loss</span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>Rs. {cost.toFixed(2)}</span>
                        </div>
                    )}

                    {/* Reason */}
                    <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason *</p>
                    <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '12px', border: '1px solid rgba(9,9,9,0.15)', backgroundColor: 'white', fontSize: '14px', color: reason ? '#090909' : 'rgba(9,9,9,0.40)', fontFamily: 'Inter, sans-serif', outline: 'none', cursor: 'pointer', marginBottom: '12px' }}
                    >
                        <option value="">Select reason...</option>
                        {WASTE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>

                    {/* Note */}
                    <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Note (optional)</p>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Additional details..."
                        style={{ width: '100%', height: '46px', padding: '0 14px', borderRadius: '12px', border: '1px solid rgba(9,9,9,0.12)', fontSize: '14px', color: '#090909', fontFamily: 'Inter, sans-serif', outline: 'none', marginBottom: '16px', boxSizing: 'border-box' }}
                    />

                    {error && <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '13px', padding: '8px 14px', borderRadius: '10px', marginBottom: '12px' }}>{error}</div>}

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1px solid rgba(9,9,9,0.12)', backgroundColor: 'transparent', color: 'rgba(9,9,9,0.55)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
                        <button onClick={handleSave} disabled={loading} style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', backgroundColor: loading ? 'rgba(245,158,11,0.40)' : '#f59e0b', color: 'white', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}>
                            {loading ? 'Logging...' : 'Log Waste'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}