import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { itemsService } from '@/services/items.service'

interface Props {
    onClose: () => void
}

const WASTE_REASONS = [
    'Expired / Past best-before date',
    'Damaged during handling',
    'Damaged during delivery',
    'Quality not acceptable',
    'Unsold — end of day',
    'Customer returned — unusable',
    'Dropped / Accidentally destroyed',
    'Theft or missing',
    'Used for tasting / sampling',
    'Other reason',
]

export default function WasteLogModal({ onClose }: Props) {
    const queryClient = useQueryClient()
    const [view, setView] = useState<'log' | 'history'>('log')

    // Form state
    const [itemId, setItemId] = useState('')
    const [quantity, setQuantity] = useState('1')
    const [reason, setReason] = useState('')
    const [note, setNote] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const { data: items = [] } = useQuery({
        queryKey: ['items-management'],
        queryFn: () => itemsService.getItems(),
    })

    const { data: wasteLogs = [], refetch: refetchLogs } = useQuery({
        queryKey: ['waste-logs'],
        queryFn: itemsService.getWasteLogs,
    })

    const selectedItem = items.find((i: any) => i.id === itemId)
    const qty = parseInt(quantity || '0')
    const estimatedLoss = selectedItem ? selectedItem.buyingPrice * qty : 0

    const handleSubmit = async () => {
        setError('')
        setSuccess('')
        if (!itemId) return setError('Select an item')
        if (!qty || qty <= 0) return setError('Enter a valid quantity')
        if (!reason) return setError('Select a reason')
        if (selectedItem && qty > selectedItem.stock) {
            return setError(`Only ${selectedItem.stock} in stock`)
        }

        try {
            setLoading(true)
            await itemsService.createWasteLog({ itemId, quantity: qty, reason, note })
            queryClient.invalidateQueries({ queryKey: ['items-management'] })
            refetchLogs()
            setSuccess(`Logged ${qty}× ${selectedItem?.name} as waste`)
            setItemId('')
            setQuantity('1')
            setReason('')
            setNote('')
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to log waste')
        } finally {
            setLoading(false)
        }
    }

    const totalLoss = wasteLogs.reduce((sum: number, l: any) => sum + l.cost, 0)
    const todayLoss = wasteLogs
        .filter((l: any) => new Date(l.createdAt).toDateString() === new Date().toDateString())
        .reduce((sum: number, l: any) => sum + l.cost, 0)

    const inputStyle: React.CSSProperties = {
        width: '100%', height: '46px', padding: '0 14px',
        borderRadius: '12px', border: '1px solid rgba(238,45,124,0.18)',
        backgroundColor: 'rgba(238,45,124,0.03)',
        fontSize: '14px', color: '#090909',
        fontFamily: 'Inter, sans-serif', outline: 'none',
        boxSizing: 'border-box',
    }

    const labelStyle: React.CSSProperties = {
        fontSize: '11px', fontWeight: 600,
        color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase',
        letterSpacing: '0.05em', marginBottom: '6px', display: 'block',
    }

    return (
        <div style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(9,9,9,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, fontFamily: 'Inter, sans-serif', padding: '16px',
        }}>
            <div style={{
                backgroundColor: 'white', borderRadius: '20px', width: '100%',
                maxWidth: '540px', maxHeight: '90vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 8px 40px rgba(9,9,9,0.20)', overflow: 'hidden',
            }}>

                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(9,9,9,0.06)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#090909' }}>
                                🗑 Waste & Damage Log
                            </h3>
                            <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>
                                Record damaged, expired or wasted items
                            </p>
                        </div>
                        <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(9,9,9,0.06)', color: 'rgba(9,9,9,0.50)', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>

                    {/* Tab toggle */}
                    <div style={{ display: 'flex', backgroundColor: 'rgba(9,9,9,0.04)', borderRadius: '10px', padding: '3px' }}>
                        <button
                            onClick={() => setView('log')}
                            style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', backgroundColor: view === 'log' ? 'white' : 'transparent', color: view === 'log' ? '#EE2D7C' : 'rgba(9,9,9,0.45)', fontSize: '13px', fontWeight: view === 'log' ? 600 : 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: view === 'log' ? '0 1px 4px rgba(9,9,9,0.10)' : 'none' }}
                        >
                            + Log Waste
                        </button>
                        <button
                            onClick={() => setView('history')}
                            style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', backgroundColor: view === 'history' ? 'white' : 'transparent', color: view === 'history' ? '#EE2D7C' : 'rgba(9,9,9,0.45)', fontSize: '13px', fontWeight: view === 'history' ? 600 : 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: view === 'history' ? '0 1px 4px rgba(9,9,9,0.10)' : 'none' }}
                        >
                            History ({wasteLogs.length})
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

                    {view === 'log' ? (
                        <>
                            {/* Item select */}
                            <label style={labelStyle}>Item *</label>
                            <select
                                value={itemId}
                                onChange={(e) => setItemId(e.target.value)}
                                style={{ ...inputStyle, cursor: 'pointer', marginBottom: '14px' }}
                            >
                                <option value="">Select item...</option>
                                {items.map((item: any) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} (Stock: {item.stock})
                                    </option>
                                ))}
                            </select>

                            {/* Selected item info */}
                            {selectedItem && (
                                <div style={{ backgroundColor: 'rgba(9,9,9,0.03)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', display: 'flex', gap: '16px' }}>
                                    <div>
                                        <p style={{ margin: '0 0 1px', fontSize: '11px', color: 'rgba(9,9,9,0.40)' }}>Current Stock</p>
                                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: selectedItem.stock <= selectedItem.lowStockAlert ? '#f59e0b' : '#090909' }}>{selectedItem.stock}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 1px', fontSize: '11px', color: 'rgba(9,9,9,0.40)' }}>Cost Price</p>
                                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#090909' }}>Rs. {selectedItem.buyingPrice}</p>
                                    </div>
                                    {qty > 0 && (
                                        <div>
                                            <p style={{ margin: '0 0 1px', fontSize: '11px', color: 'rgba(9,9,9,0.40)' }}>Estimated Loss</p>
                                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#ef4444' }}>Rs. {estimatedLoss.toFixed(2)}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Quantity */}
                            <label style={labelStyle}>Quantity *</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, height: '46px', backgroundColor: 'rgba(238,45,124,0.03)', border: '1px solid rgba(238,45,124,0.18)', borderRadius: '12px', padding: '0 14px' }}>
                                    <button onClick={() => setQuantity(String(Math.max(1, qty - 1)))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#EE2D7C', fontWeight: 700 }}>−</button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        min="1"
                                        style={{ flex: 1, border: 'none', outline: 'none', fontSize: '16px', fontWeight: 600, color: '#090909', fontFamily: 'Inter, sans-serif', backgroundColor: 'transparent', textAlign: 'center' }}
                                    />
                                    <button onClick={() => setQuantity(String(qty + 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#EE2D7C', fontWeight: 700 }}>+</button>
                                </div>
                                {[1, 5, 10].map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => setQuantity(String(n))}
                                        style={{ padding: '8px 14px', borderRadius: '10px', border: qty === n ? '2px solid #EE2D7C' : '1px solid rgba(238,45,124,0.20)', backgroundColor: qty === n ? 'rgba(238,45,124,0.08)' : 'transparent', color: qty === n ? '#EE2D7C' : 'rgba(9,9,9,0.50)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>

                            {/* Reason */}
                            <label style={labelStyle}>Reason *</label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                style={{ ...inputStyle, cursor: 'pointer', marginBottom: '14px' }}
                            >
                                <option value="">Select reason...</option>
                                {WASTE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>

                            {/* Note */}
                            <label style={labelStyle}>Additional Notes</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Any additional details about this waste..."
                                rows={2}
                                style={{ ...inputStyle, height: 'auto', padding: '12px 14px', resize: 'none', lineHeight: 1.5, marginBottom: '4px' }}
                            />

                            {/* Success/Error */}
                            {success && (
                                <div style={{ backgroundColor: 'rgba(34,197,94,0.08)', color: '#15803d', fontSize: '13px', padding: '10px 14px', borderRadius: '10px', marginTop: '12px', fontWeight: 500 }}>
                                    ✓ {success}
                                </div>
                            )}
                            {error && (
                                <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '13px', padding: '10px 14px', borderRadius: '10px', marginTop: '12px' }}>
                                    {error}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* History stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                                <div style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '12px', padding: '14px' }}>
                                    <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.40)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Loss</p>
                                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#ef4444' }}>Rs. {todayLoss.toFixed(2)}</p>
                                </div>
                                <div style={{ backgroundColor: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.10)', borderRadius: '12px', padding: '14px' }}>
                                    <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.40)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Loss</p>
                                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#dc2626' }}>Rs. {totalLoss.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Log entries */}
                            {wasteLogs.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(9,9,9,0.35)' }}>
                                    <p style={{ fontSize: '14px', fontWeight: 500 }}>No waste logs yet</p>
                                    <p style={{ fontSize: '12px', marginTop: '4px' }}>Switch to "Log Waste" to record waste</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {wasteLogs.map((log: any) => (
                                        <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', backgroundColor: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.10)', borderRadius: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                                                🗑
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 600, color: '#090909' }}>
                                                    {log.item?.name} × {log.quantity}
                                                </p>
                                                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(9,9,9,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {log.reason} {log.note ? `— ${log.note}` : ''}
                                                </p>
                                                <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'rgba(9,9,9,0.35)' }}>
                                                    {new Date(log.createdAt).toLocaleString('en-LK')}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>
                                                    -Rs. {log.cost.toFixed(2)}
                                                </p>
                                                <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'rgba(9,9,9,0.35)' }}>
                                                    Rs. {log.item?.buyingPrice}/unit
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {view === 'log' && (
                    <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(9,9,9,0.06)', display: 'flex', gap: '10px', flexShrink: 0 }}>
                        <button onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1px solid rgba(9,9,9,0.12)', backgroundColor: 'transparent', color: 'rgba(9,9,9,0.55)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                            Close
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', backgroundColor: loading ? 'rgba(239,68,68,0.35)' : '#ef4444', color: 'white', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}
                        >
                            {loading ? 'Logging...' : '🗑 Log as Waste'}
                        </button>
                    </div>
                )}
                {view === 'history' && (
                    <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(9,9,9,0.06)', flexShrink: 0 }}>
                        <button onClick={onClose} style={{ width: '100%', padding: '13px', borderRadius: '12px', border: '1px solid rgba(9,9,9,0.12)', backgroundColor: 'transparent', color: 'rgba(9,9,9,0.55)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}