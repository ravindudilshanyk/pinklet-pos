import { useQuery } from '@tanstack/react-query'
import { customersService } from '@/services/customers.service'

interface Props {
    customerId: string
    onClose: () => void
    onEdit: () => void
}

export default function CustomerProfileModal({ customerId, onClose, onEdit }: Props) {
    const { data: customer, isLoading } = useQuery({
        queryKey: ['customer', customerId],
        queryFn: () => customersService.getById(customerId),
    })

    const { data: bills = [] } = useQuery({
        queryKey: ['customer-bills', customerId],
        queryFn: () => customersService.getBills(customerId),
    })

    const handleWhatsApp = () => {
        const number = customer?.whatsappNumber || customer?.phone
        if (!number) return alert('No WhatsApp number available')
        window.open(`https://wa.me/${number}`, '_blank')
    }

    const totalSpent = bills.reduce((sum: number, b: any) => sum + b.total, 0)

    if (isLoading) return null

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(9,9,9,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: 'Inter, sans-serif', padding: '16px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '560px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 40px rgba(9,9,9,0.20)', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid rgba(9,9,9,0.06)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                        {/* Avatar */}
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(238,45,124,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 700, color: '#EE2D7C', flexShrink: 0 }}>
                            {customer?.name?.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#090909' }}>{customer?.name}</h3>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {customer?.phone && <span style={{ fontSize: '13px', color: 'rgba(9,9,9,0.55)' }}>📞 {customer.phone}</span>}
                                {customer?.email && <span style={{ fontSize: '13px', color: 'rgba(9,9,9,0.55)' }}>✉ {customer.email}</span>}
                                {customer?.birthday && (
                                    <span style={{ fontSize: '13px', color: 'rgba(9,9,9,0.55)' }}>
                                        🎂 {new Date(customer.birthday).toLocaleDateString('en-LK', { month: 'long', day: 'numeric' })}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={handleWhatsApp} style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', backgroundColor: '#25D366', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                                💬 WhatsApp
                            </button>
                            <button onClick={onEdit} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(238,45,124,0.25)', backgroundColor: 'rgba(238,45,124,0.06)', color: '#EE2D7C', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                                Edit
                            </button>
                            <button onClick={onClose} style={{ width: '34px', height: '34px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(9,9,9,0.06)', color: 'rgba(9,9,9,0.50)', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                        <StatCard label="Total Spent" value={`Rs. ${totalSpent.toLocaleString('en-LK', { minimumFractionDigits: 0 })}`} color="#22c55e" />
                        <StatCard label="💎 Loyalty Coins" value={String(customer?.points || 0)} color="#3B3B98" />
                        <StatCard label="Total Purchases" value={String(bills.length)} color="#EE2D7C" />
                    </div>

                    {/* Notes */}
                    {customer?.notes && (
                        <div style={{ backgroundColor: 'rgba(238,45,124,0.04)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px' }}>
                            <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.40)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</p>
                            <p style={{ margin: 0, fontSize: '13px', color: '#090909', lineHeight: 1.5 }}>{customer.notes}</p>
                        </div>
                    )}

                    {/* Loyalty history */}
                    {customer?.loyaltyTransactions?.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 700, color: 'rgba(9,9,9,0.40)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                💎 Loyalty History
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                                {customer.loyaltyTransactions.map((t: any) => (
                                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(9,9,9,0.02)', borderRadius: '8px' }}>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: '#090909' }}>{t.note || (t.type === 'earn' ? 'Coins earned' : 'Coins redeemed')}</p>
                                            <p style={{ margin: '1px 0 0', fontSize: '11px', color: 'rgba(9,9,9,0.40)' }}>{new Date(t.createdAt).toLocaleDateString('en-LK')}</p>
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: t.coins > 0 ? '#22c55e' : '#ef4444' }}>
                                            {t.coins > 0 ? '+' : ''}{t.coins} coins
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Purchase history */}
                    <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 700, color: 'rgba(9,9,9,0.40)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Purchase History ({bills.length})
                    </p>
                    {bills.length === 0 ? (
                        <p style={{ fontSize: '13px', color: 'rgba(9,9,9,0.35)', textAlign: 'center', padding: '20px' }}>No purchases yet</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {bills.map((bill: any) => (
                                <div key={bill.id} style={{ padding: '12px 14px', backgroundColor: 'rgba(9,9,9,0.02)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#EE2D7C' }}>{bill.billNumber}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(9,9,9,0.45)' }}>
                                            {new Date(bill.createdAt).toLocaleDateString('en-LK')} · {bill.cashier?.name} · {bill.lines.length} item{bill.lines.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#090909' }}>Rs. {bill.total.toFixed(2)}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(9,9,9,0.40)', textTransform: 'capitalize' }}>{bill.paymentMethod}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div style={{ backgroundColor: 'rgba(238,45,124,0.03)', border: '1px solid rgba(238,45,124,0.10)', borderRadius: '12px', padding: '14px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.40)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color }}>{value}</p>
        </div>
    )
}