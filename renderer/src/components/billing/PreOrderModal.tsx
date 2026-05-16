import { useState } from 'react'
import { useBillingStore } from '@/stores/billingStore'

interface Props {
    onClose: () => void
    onProceed: () => void
}

const OCCASIONS = [
    'Birthday', 'Anniversary', "Mother's Day", "Father's Day",
    "Valentine's Day", 'Wedding', 'Baby Shower', 'Graduation',
    'Christmas', 'New Year', 'Other',
]

const fieldLabel: React.CSSProperties = {
    fontSize: '11px', fontWeight: 600,
    color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase',
    letterSpacing: '0.05em', marginBottom: '6px', display: 'block',
}

const inputStyle: React.CSSProperties = {
    width: '100%', height: '46px', padding: '0 14px',
    borderRadius: '12px', border: '1px solid rgba(238,45,124,0.18)',
    backgroundColor: 'rgba(238,45,124,0.03)',
    fontSize: '14px', color: '#090909',
    fontFamily: 'Inter, sans-serif', outline: 'none',
    boxSizing: 'border-box',
}

export default function PreOrderModal({ onClose, onProceed }: Props) {
    const preOrder = useBillingStore((s) => s.preOrder)
    const setPreOrder = useBillingStore((s) => s.setPreOrder)
    const getTotal = useBillingStore((s) => s.getTotal)
    const customer = useBillingStore((s) => s.customer)

    const [error, setError] = useState('')

    const total = getTotal()
    const advancePaid = parseFloat(preOrder.advancePayment || '0')
    const balance = Math.max(0, total - advancePaid)

    const today = new Date().toISOString().split('T')[0]

    const handleProceed = () => {
        setError('')
        if (!preOrder.deliveryDate) {
            return setError('Required date is mandatory for pre-orders')
        }
        onProceed()
    }

    return (
        <div style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(9,9,9,0.50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 150, fontFamily: 'Inter, sans-serif', padding: '16px',
        }}>
            <div style={{
                backgroundColor: 'white', borderRadius: '20px',
                width: '100%', maxWidth: '500px', maxHeight: '90vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 8px 40px rgba(9,9,9,0.20)', overflow: 'hidden',
            }}>

                {/* Header */}
                <div style={{
                    padding: '20px 24px', borderBottom: '1px solid rgba(9,9,9,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexShrink: 0,
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#090909' }}>
                            📋 Pre-Order Details
                        </h3>
                        <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>
                            Fill in the order details before proceeding to payment
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(9,9,9,0.06)', color: 'rgba(9,9,9,0.50)', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >×</button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

                    {/* Customer info banner */}
                    {customer && (
                        <div style={{
                            backgroundColor: 'rgba(238,45,124,0.05)',
                            border: '1px solid rgba(238,45,124,0.15)',
                            borderRadius: '12px', padding: '12px 16px', marginBottom: '20px',
                            display: 'flex', alignItems: 'center', gap: '12px',
                        }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(238,45,124,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#EE2D7C', flexShrink: 0 }}>
                                {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#090909' }}>{customer.name}</p>
                                <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(9,9,9,0.45)' }}>
                                    {customer.phone || 'No phone'} · 💎 {customer.points} coins
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Dates row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div>
                            <label style={fieldLabel}>Order Date</label>
                            <input
                                type="date"
                                value={preOrder.orderDate || today}
                                onChange={(e) => setPreOrder({ orderDate: e.target.value })}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={fieldLabel}>Required Date *</label>
                            <input
                                type="date"
                                value={preOrder.deliveryDate}
                                onChange={(e) => setPreOrder({ deliveryDate: e.target.value })}
                                min={today}
                                style={{
                                    ...inputStyle,
                                    borderColor: error && !preOrder.deliveryDate ? '#ef4444' : 'rgba(238,45,124,0.18)',
                                }}
                            />
                        </div>
                    </div>

                    {/* Occasion */}
                    <div style={{ marginBottom: '14px' }}>
                        <label style={fieldLabel}>Occasion / Reason</label>
                        <select
                            value={preOrder.note}
                            onChange={(e) => setPreOrder({ note: e.target.value })}
                            style={{ ...inputStyle, cursor: 'pointer' }}
                        >
                            <option value="">Select occasion...</option>
                            {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>

                    {/* Order notes */}
                    <div style={{ marginBottom: '14px' }}>
                        <label style={fieldLabel}>Order Notes / Special Instructions</label>
                        <textarea
                            value={preOrder.designNotes || ''}
                            onChange={(e) => setPreOrder({ designNotes: e.target.value } as any)}
                            placeholder="e.g. Blue flowers, gold letters, photo on top, deliver to office..."
                            rows={3}
                            style={{
                                ...inputStyle,
                                height: 'auto', padding: '12px 14px',
                                resize: 'none', lineHeight: 1.5,
                            }}
                        />
                    </div>

                    {/* Advance payment section */}
                    <div style={{
                        backgroundColor: 'rgba(238,45,124,0.03)',
                        border: '1px solid rgba(238,45,124,0.12)',
                        borderRadius: '14px', padding: '16px', marginBottom: '4px',
                    }}>
                        <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#090909' }}>
                            💰 Advance Payment
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <div>
                                <label style={fieldLabel}>Advance Amount (Rs.)</label>
                                <input
                                    type="number"
                                    value={preOrder.advancePayment}
                                    onChange={(e) => setPreOrder({ advancePayment: e.target.value })}
                                    placeholder="0.00"
                                    min="0"
                                    max={total}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={fieldLabel}>Payment Method</label>
                                <select
                                    value={(preOrder as any).advanceType || ''}
                                    onChange={(e) => setPreOrder({ advanceType: e.target.value } as any)}
                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                >
                                    <option value="">Select method...</option>
                                    <option value="cash">💵 Cash</option>
                                    <option value="card">💳 Card</option>
                                    <option value="transfer">🔄 Bank Transfer</option>
                                </select>
                            </div>
                        </div>

                        {/* Bill summary */}
                        <div style={{ borderTop: '1px solid rgba(238,45,124,0.12)', paddingTop: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontSize: '13px', color: 'rgba(9,9,9,0.55)' }}>Total Order Value</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#090909' }}>Rs. {total.toFixed(2)}</span>
                            </div>
                            {advancePaid > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '13px', color: 'rgba(9,9,9,0.55)' }}>Advance Paid</span>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#22c55e' }}>Rs. {advancePaid.toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                paddingTop: '8px', borderTop: '1px dashed rgba(9,9,9,0.10)',
                            }}>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#090909' }}>Balance Remaining</span>
                                <span style={{ fontSize: '15px', fontWeight: 800, color: balance > 0 ? '#f59e0b' : '#22c55e' }}>
                                    Rs. {balance.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '13px', padding: '10px 14px', borderRadius: '10px', marginTop: '12px' }}>
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px', borderTop: '1px solid rgba(9,9,9,0.06)',
                    display: 'flex', gap: '10px', flexShrink: 0,
                }}>
                    <button
                        onClick={onClose}
                        style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1px solid rgba(9,9,9,0.12)', backgroundColor: 'transparent', color: 'rgba(9,9,9,0.55)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleProceed}
                        style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', backgroundColor: '#EE2D7C', color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                    >
                        Continue to Payment →
                    </button>
                </div>
            </div>
        </div>
    )
}