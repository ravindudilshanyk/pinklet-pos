import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { salesService } from '@/services/sales.service'
import { printReceipt, shareReceiptWhatsApp } from '@/utils/receipt'

type Status = 'all' | 'pending' | 'confirmed' | 'ready' | 'delivered' | 'cancelled'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
    confirmed: { label: 'Confirmed', color: '#3B3B98', bg: 'rgba(59,59,152,0.10)' },
    ready: { label: 'Ready', color: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
    delivered: { label: 'Delivered', color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
    cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
    completed: { label: 'Completed', color: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
}

export default function PreOrders() {
    const queryClient = useQueryClient()
    const [statusFilter, setStatusFilter] = useState<Status>('all')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [showPaymentModal, setShowPaymentModal] = useState(false)

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['pre-orders', statusFilter, startDate, endDate],
        queryFn: () => salesService.getPreOrders({
            status: statusFilter === 'all' ? undefined : statusFilter,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        }),
        refetchInterval: 30000,
    })

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ['pre-orders'] })
    }

    // Stats
    const pending = orders.filter((o: any) => o.status === 'pending' || o.status === 'confirmed').length
    const ready = orders.filter((o: any) => o.status === 'ready').length
    const totalBalance = orders
        .filter((o: any) => o.status !== 'delivered' && o.status !== 'cancelled')
        .reduce((sum: number, o: any) => sum + Math.max(0, o.total - (o.advancePayment || 0)), 0)

    // Upcoming today
    const today = new Date().toDateString()
    const dueToday = orders.filter((o: any) => {
        if (!o.deliveryDate) return false
        return new Date(o.deliveryDate).toDateString() === today &&
            o.status !== 'delivered' && o.status !== 'cancelled'
    }).length

    const statuses: { key: Status; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'pending', label: 'Pending' },
        { key: 'confirmed', label: 'Confirmed' },
        { key: 'ready', label: 'Ready' },
        { key: 'delivered', label: 'Delivered' },
        { key: 'cancelled', label: 'Cancelled' },
    ]

    return (
        <div style={{ fontFamily: 'Inter, sans-serif', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#090909' }}>Pre-Orders</h1>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'rgba(9,9,9,0.45)' }}>
                        Manage upcoming cake and gift orders
                    </p>
                </div>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <StatCard icon="📋" label="Total Orders" value={String(orders.length)} color="#EE2D7C" bg="rgba(238,45,124,0.06)" />
                <StatCard icon="⏳" label="Pending / Confirmed" value={String(pending)} color="#f59e0b" bg="rgba(245,158,11,0.06)" />
                <StatCard icon="✅" label="Ready to Deliver" value={String(ready)} color="#22c55e" bg="rgba(34,197,94,0.06)" />
                <StatCard icon="📅" label="Due Today" value={String(dueToday)} color={dueToday > 0 ? '#ef4444' : '#6b7280'} bg={dueToday > 0 ? 'rgba(239,68,68,0.06)' : 'rgba(107,114,128,0.06)'} />
            </div>

            {/* Balance outstanding card */}
            {totalBalance > 0 && (
                <div style={{
                    backgroundColor: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.25)',
                    borderRadius: '14px', padding: '14px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>💰</span>
                        <div>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#92400e' }}>Outstanding Balance to Collect</p>
                            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(9,9,9,0.50)' }}>From active pre-orders</p>
                        </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#b45309' }}>
                        Rs. {totalBalance.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            )}

            {/* Filters */}
            <div style={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid rgba(9,9,9,0.06)', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>

                {/* Status pills */}
                <div style={{ display: 'flex', backgroundColor: 'rgba(9,9,9,0.04)', borderRadius: '10px', padding: '3px', gap: '2px' }}>
                    {statuses.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setStatusFilter(key)}
                            style={{
                                padding: '5px 12px', borderRadius: '8px', border: 'none',
                                backgroundColor: statusFilter === key ? 'white' : 'transparent',
                                color: statusFilter === key ? '#EE2D7C' : 'rgba(9,9,9,0.50)',
                                fontSize: '12px', fontWeight: statusFilter === key ? 600 : 500,
                                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                                boxShadow: statusFilter === key ? '0 1px 4px rgba(9,9,9,0.10)' : 'none',
                                transition: 'all 0.15s', whiteSpace: 'nowrap',
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Date range */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>Delivery date:</span>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{ height: '34px', padding: '0 10px', borderRadius: '8px', border: '1px solid rgba(238,45,124,0.15)', fontSize: '12px', color: '#090909', fontFamily: 'Inter, sans-serif', outline: 'none' }}
                    />
                    <span style={{ fontSize: '11px', color: 'rgba(9,9,9,0.35)' }}>to</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{ height: '34px', padding: '0 10px', borderRadius: '8px', border: '1px solid rgba(238,45,124,0.15)', fontSize: '12px', color: '#090909', fontFamily: 'Inter, sans-serif', outline: 'none' }}
                    />
                    {(startDate || endDate) && (
                        <button
                            onClick={() => { setStartDate(''); setEndDate('') }}
                            style={{ fontSize: '12px', color: '#EE2D7C', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Orders table */}
            <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '14px', border: '1px solid rgba(9,9,9,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 1fr 1fr 100px', padding: '12px 20px', backgroundColor: 'rgba(238,45,124,0.04)', borderBottom: '1px solid rgba(9,9,9,0.06)' }}>
                    {['Bill #', 'Customer', 'Occasion', 'Required Date', 'Total', 'Advance', 'Balance', 'Status'].map((col) => (
                        <span key={col} style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(9,9,9,0.40)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {col}
                        </span>
                    ))}
                </div>

                {/* Rows */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {isLoading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(9,9,9,0.35)' }}>Loading pre-orders...</div>
                    ) : orders.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(9,9,9,0.35)' }}>
                            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ margin: '0 auto 12px', display: 'block' }}>
                                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 500 }}>No pre-orders found</p>
                            <p style={{ margin: 0, fontSize: '13px' }}>Pre-orders created from Make Bill → Pre-Order tab</p>
                        </div>
                    ) : (
                        orders.map((order: any, index: number) => (
                            <PreOrderRow
                                key={order.id}
                                order={order}
                                isLast={index === orders.length - 1}
                                onClick={() => setSelectedOrder(order)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Detail modal */}
            {selectedOrder && (
                <PreOrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onStatusChange={async (id, status) => {
                        await salesService.updatePreOrderStatus(id, status)
                        refresh()
                        setSelectedOrder(null)
                    }}
                    onPayment={() => setShowPaymentModal(true)}
                    onRefresh={refresh}
                />
            )}

            {/* Payment modal */}
            {selectedOrder && showPaymentModal && (
                <BalancePaymentModal
                    order={selectedOrder}
                    onClose={() => setShowPaymentModal(false)}
                    onSaved={(updated) => {
                        setSelectedOrder(updated)
                        setShowPaymentModal(false)
                        refresh()
                    }}
                />
            )}
        </div>
    )
}

// ── Pre-Order Row ─────────────────────────────────────────
function PreOrderRow({ order, isLast, onClick }: { order: any; isLast: boolean; onClick: () => void }) {
    const [hovered, setHovered] = useState(false)
    const balance = Math.max(0, order.total - (order.advancePayment || 0))
    const isOverdue = order.deliveryDate &&
        new Date(order.deliveryDate) < new Date() &&
        order.status !== 'delivered' &&
        order.status !== 'cancelled'
    const isDueToday = order.deliveryDate &&
        new Date(order.deliveryDate).toDateString() === new Date().toDateString() &&
        order.status !== 'delivered'

    const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 1fr 1fr 100px',
                padding: '13px 20px',
                borderBottom: isLast ? 'none' : '1px solid rgba(9,9,9,0.04)',
                backgroundColor: isOverdue
                    ? 'rgba(239,68,68,0.03)'
                    : isDueToday
                        ? 'rgba(245,158,11,0.03)'
                        : hovered ? 'rgba(238,45,124,0.02)' : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                alignItems: 'center',
            }}
        >
            {/* Bill number */}
            <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#EE2D7C' }}>{order.billNumber}</p>
                <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'rgba(9,9,9,0.35)' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-LK')}
                </p>
            </div>

            {/* Customer */}
            <div>
                {order.customer ? (
                    <>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#090909' }}>{order.customer.name}</p>
                        <p style={{ margin: '1px 0 0', fontSize: '11px', color: 'rgba(9,9,9,0.40)' }}>{order.customer.phone || '—'}</p>
                    </>
                ) : (
                    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(9,9,9,0.35)' }}>Walk-in</p>
                )}
            </div>

            {/* Occasion */}
            <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#090909' }}>
                    {order.note || '—'}
                </p>
            </div>

            {/* Required date */}
            <div>
                {order.deliveryDate ? (
                    <>
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: isOverdue ? '#ef4444' : isDueToday ? '#f59e0b' : '#090909' }}>
                            {new Date(order.deliveryDate).toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {isOverdue && <p style={{ margin: '1px 0 0', fontSize: '10px', color: '#ef4444', fontWeight: 600 }}>OVERDUE</p>}
                        {isDueToday && !isOverdue && <p style={{ margin: '1px 0 0', fontSize: '10px', color: '#f59e0b', fontWeight: 600 }}>DUE TODAY</p>}
                    </>
                ) : (
                    <p style={{ margin: 0, fontSize: '12px', color: 'rgba(9,9,9,0.35)' }}>—</p>
                )}
            </div>

            {/* Total */}
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#090909' }}>
                Rs. {order.total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
            </p>

            {/* Advance paid */}
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#22c55e' }}>
                Rs. {(order.advancePayment || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
            </p>

            {/* Balance */}
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: balance > 0 ? '#f59e0b' : '#22c55e' }}>
                {balance > 0 ? `Rs. ${balance.toFixed(2)}` : '✓ Paid'}
            </p>

            {/* Status badge */}
            <div>
                <span style={{
                    display: 'inline-block', padding: '4px 10px', borderRadius: '99px',
                    fontSize: '11px', fontWeight: 600,
                    backgroundColor: statusCfg.bg, color: statusCfg.color,
                }}>
                    {statusCfg.label}
                </span>
            </div>
        </div>
    )
}

// ── Pre-Order Detail Modal ────────────────────────────────
function PreOrderDetailModal({ order, onClose, onStatusChange, onPayment, onRefresh }: {
    order: any
    onClose: () => void
    onStatusChange: (id: string, status: string) => void
    onPayment: () => void
    onRefresh: () => void
}) {
    const balance = Math.max(0, order.total - (order.advancePayment || 0))
    const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending

    const nextStatuses: Record<string, string[]> = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['ready', 'cancelled'],
        ready: ['delivered', 'cancelled'],
        delivered: [],
        cancelled: [],
        completed: [],
    }

    const statusLabels: Record<string, string> = {
        confirmed: '✓ Confirm Order',
        ready: '🎉 Mark as Ready',
        delivered: '🚚 Mark as Delivered',
        cancelled: '✕ Cancel Order',
    }

    const statusColors: Record<string, { bg: string; color: string }> = {
        confirmed: { bg: '#3B3B98', color: 'white' },
        ready: { bg: '#22c55e', color: 'white' },
        delivered: { bg: '#6b7280', color: 'white' },
        cancelled: { bg: '#ef4444', color: 'white' },
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
                maxWidth: '580px', maxHeight: '90vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 8px 40px rgba(9,9,9,0.20)', overflow: 'hidden',
            }}>

                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(9,9,9,0.06)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#090909' }}>
                                    {order.billNumber}
                                </h3>
                                <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, backgroundColor: statusCfg.bg, color: statusCfg.color }}>
                                    {statusCfg.label}
                                </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>
                                Created: {new Date(order.createdAt).toLocaleString('en-LK')} · {order.cashier?.name}
                            </p>
                        </div>
                        <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(9,9,9,0.06)', color: 'rgba(9,9,9,0.50)', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

                    {/* Customer info */}
                    {order.customer && (
                        <div style={{ backgroundColor: 'rgba(238,45,124,0.04)', border: '1px solid rgba(238,45,124,0.12)', borderRadius: '14px', padding: '14px 16px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(238,45,124,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: '#EE2D7C', flexShrink: 0 }}>
                                        {order.customer.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#090909' }}>{order.customer.name}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>{order.customer.phone || 'No phone'}</p>
                                    </div>
                                </div>
                                {(order.customer.whatsappNumber || order.customer.phone) && (
                                    <button
                                        onClick={() => shareReceiptWhatsApp(order, order.customer, 0)}
                                        style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', backgroundColor: '#25D366', color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                                    >
                                        💬 WhatsApp
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Order details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                        <InfoCard label="Occasion" value={order.note || '—'} icon="🎉" />
                        <InfoCard
                            label="Required Date"
                            value={order.deliveryDate
                                ? new Date(order.deliveryDate).toLocaleDateString('en-LK', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                                : '—'}
                            icon="📅"
                            highlight={order.deliveryDate && new Date(order.deliveryDate) <= new Date() && order.status !== 'delivered'}
                        />
                        <InfoCard label="Order Date" value={order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-LK') : new Date(order.createdAt).toLocaleDateString('en-LK')} icon="📋" />
                        <InfoCard label="Items" value={`${order.lines.length} item type${order.lines.length !== 1 ? 's' : ''}`} icon="📦" />
                    </div>

                    {/* Items list */}
                    <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 700, color: 'rgba(9,9,9,0.40)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Order Items
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                        {order.lines.map((line: any) => (
                            <div key={line.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'rgba(9,9,9,0.02)', borderRadius: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#090909' }}>{line.item?.name || 'Item'}</p>
                                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(9,9,9,0.45)' }}>
                                        Rs. {line.unitPrice.toLocaleString()} × {line.quantity}
                                        {line.discountAmount > 0 && <span style={{ color: '#ef4444' }}> · -{' '}Rs. {line.discountAmount.toFixed(2)}</span>}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#090909' }}>Rs. {line.lineTotal.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Payment summary */}
                    <div style={{ backgroundColor: 'rgba(238,45,124,0.04)', border: '1px solid rgba(238,45,124,0.12)', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
                        <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: '#EE2D7C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Payment Summary
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <PayRow label="Order Total" value={`Rs. ${order.total.toFixed(2)}`} bold />
                            <PayRow label="Advance Paid" value={`Rs. ${(order.advancePayment || 0).toFixed(2)}`} color="#22c55e" />
                            <div style={{ borderTop: '1px solid rgba(238,45,124,0.12)', paddingTop: '8px' }}>
                                <PayRow
                                    label="Balance Remaining"
                                    value={balance > 0 ? `Rs. ${balance.toFixed(2)}` : '✓ Fully Paid'}
                                    bold
                                    color={balance > 0 ? '#f59e0b' : '#22c55e'}
                                />
                            </div>
                        </div>

                        {/* Collect balance button */}
                        {balance > 0 && order.status !== 'cancelled' && (
                            <button
                                onClick={onPayment}
                                style={{ width: '100%', marginTop: '12px', padding: '11px', borderRadius: '10px', border: 'none', backgroundColor: '#f59e0b', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                            >
                                💰 Collect Balance Payment
                            </button>
                        )}
                    </div>

                </div>

                {/* Footer actions */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(9,9,9,0.06)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>

                        {/* Print */}
                        <button
                            onClick={() => printReceipt(order, order.customer, 0)}
                            style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(238,45,124,0.25)', backgroundColor: 'rgba(238,45,124,0.06)', color: '#EE2D7C', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                        >
                            🖨 Print
                        </button>

                        {/* Status change buttons */}
                        {nextStatuses[order.status]?.map((nextStatus) => {
                            const cfg = statusColors[nextStatus]
                            return (
                                <button
                                    key={nextStatus}
                                    onClick={() => onStatusChange(order.id, nextStatus)}
                                    style={{
                                        flex: 1, padding: '10px 16px', borderRadius: '10px', border: 'none',
                                        backgroundColor: cfg?.bg || '#EE2D7C',
                                        color: cfg?.color || 'white',
                                        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                        fontFamily: 'Inter, sans-serif',
                                        opacity: nextStatus === 'cancelled' ? 0.8 : 1,
                                    }}
                                >
                                    {statusLabels[nextStatus] || nextStatus}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Balance Payment Modal ─────────────────────────────────
function BalancePaymentModal({ order, onClose, onSaved }: {
    order: any
    onClose: () => void
    onSaved: (updated: any) => void
}) {
    const balance = Math.max(0, order.total - (order.advancePayment || 0))
    const [mode, setMode] = useState<'pay' | 'postpone'>('pay')
    const [amount, setAmount] = useState(String(balance.toFixed(2)))
    const [paymentMethod, setPaymentMethod] = useState('cash')
    const [note, setNote] = useState('')
    const [postponeReason, setPostponeReason] = useState('')
    const [postponeDate, setPostponeDate] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const POSTPONE_REASONS = [
        'Customer requested more time',
        'Financial difficulty — agreed new date',
        'Partial payment received',
        'Customer not available on required date',
        'Order delivery rescheduled',
        'Other reason',
    ]

    const handleSave = async () => {
        setError('')

        if (mode === 'pay') {
            const amt = parseFloat(amount)
            if (!amt || amt <= 0) return setError('Enter a valid amount')
            if (amt > balance) return setError(`Cannot exceed balance of Rs. ${balance.toFixed(2)}`)
            try {
                setLoading(true)
                const updated = await salesService.recordBalancePayment(
                    order.id, amt, paymentMethod, note
                )
                onSaved(updated)
            } catch {
                setError('Failed to record payment')
            } finally {
                setLoading(false)
            }
        } else {
            // Postpone — record a note but don't change advance
            if (!postponeReason) return setError('Please select a reason')
            try {
                setLoading(true)
                const noteText = `POSTPONED: ${postponeReason}${postponeDate ? ` — New date: ${postponeDate}` : ''}${note ? ` — ${note}` : ''}`
                // Record zero payment just to add the note
                const updated = await salesService.recordBalancePayment(
                    order.id, 0.001, paymentMethod,
                    noteText
                )
                onSaved(updated)
            } catch {
                setError('Failed to record postponement')
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(9,9,9,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 300, fontFamily: 'Inter, sans-serif', padding: '16px',
        }}>
            <div style={{
                backgroundColor: 'white', borderRadius: '20px', width: '100%',
                maxWidth: '440px', maxHeight: '90vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 8px 40px rgba(9,9,9,0.25)', overflow: 'hidden',
            }}>

                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(9,9,9,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#090909' }}>
                            Balance Payment
                        </h3>
                        <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>
                            {order.billNumber} · {order.customer?.name || 'Walk-in'} · Balance: Rs. {balance.toFixed(2)}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(9,9,9,0.06)', color: 'rgba(9,9,9,0.50)', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

                    {/* Mode toggle */}
                    <div style={{ display: 'flex', backgroundColor: 'rgba(9,9,9,0.04)', borderRadius: '12px', padding: '4px', marginBottom: '20px' }}>
                        <button
                            onClick={() => setMode('pay')}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '9px', border: 'none',
                                backgroundColor: mode === 'pay' ? 'white' : 'transparent',
                                color: mode === 'pay' ? '#22c55e' : 'rgba(9,9,9,0.45)',
                                fontSize: '13px', fontWeight: mode === 'pay' ? 700 : 500,
                                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                                boxShadow: mode === 'pay' ? '0 1px 4px rgba(9,9,9,0.10)' : 'none',
                            }}
                        >
                            💰 Collect Payment
                        </button>
                        <button
                            onClick={() => setMode('postpone')}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '9px', border: 'none',
                                backgroundColor: mode === 'postpone' ? 'white' : 'transparent',
                                color: mode === 'postpone' ? '#f59e0b' : 'rgba(9,9,9,0.45)',
                                fontSize: '13px', fontWeight: mode === 'postpone' ? 700 : 500,
                                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                                boxShadow: mode === 'postpone' ? '0 1px 4px rgba(9,9,9,0.10)' : 'none',
                            }}
                        >
                            📅 Postpone
                        </button>
                    </div>

                    {mode === 'pay' ? (
                        <>
                            {/* Payment summary */}
                            <div style={{ backgroundColor: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.50)' }}>Order Total</span>
                                    <span style={{ fontSize: '12px', color: '#090909', fontWeight: 500 }}>Rs. {order.total.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.50)' }}>Already Paid</span>
                                    <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: 500 }}>Rs. {(order.advancePayment || 0).toFixed(2)}</span>
                                </div>
                                <div style={{ borderTop: '1px solid rgba(34,197,94,0.15)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#090909' }}>Balance Due</span>
                                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#f59e0b' }}>Rs. {balance.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Amount */}
                            <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Amount Receiving
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(238,45,124,0.04)', border: '1px solid rgba(238,45,124,0.18)', borderRadius: '12px', height: '50px', padding: '0 16px', marginBottom: '10px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(9,9,9,0.40)' }}>Rs.</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    autoFocus
                                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: '18px', fontWeight: 600, color: '#090909', fontFamily: 'Inter, sans-serif', backgroundColor: 'transparent' }}
                                />
                            </div>

                            {/* Quick amounts */}
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                                {[balance, balance / 2].filter(v => v > 0).map((amt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setAmount(amt.toFixed(2))}
                                        style={{
                                            flex: 1, padding: '6px', borderRadius: '8px',
                                            border: '1px solid rgba(238,45,124,0.20)',
                                            backgroundColor: parseFloat(amount) === amt ? 'rgba(238,45,124,0.08)' : 'transparent',
                                            color: '#EE2D7C', fontSize: '12px', fontWeight: 600,
                                            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                                        }}
                                    >
                                        {i === 0 ? 'Full balance' : 'Half'} (Rs. {amt.toFixed(0)})
                                    </button>
                                ))}
                            </div>

                            {/* Payment method */}
                            <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Payment Method
                            </p>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                                {(['cash', 'card', 'transfer'] as const).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setPaymentMethod(m)}
                                        style={{
                                            flex: 1, padding: '9px', borderRadius: '10px',
                                            border: paymentMethod === m ? '2px solid #EE2D7C' : '1px solid rgba(9,9,9,0.12)',
                                            backgroundColor: paymentMethod === m ? 'rgba(238,45,124,0.06)' : 'transparent',
                                            color: paymentMethod === m ? '#EE2D7C' : 'rgba(9,9,9,0.50)',
                                            fontSize: '12px', fontWeight: paymentMethod === m ? 600 : 500,
                                            cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize',
                                        }}
                                    >
                                        {m === 'cash' ? '💵' : m === 'card' ? '💳' : '🔄'} {m}
                                    </button>
                                ))}
                            </div>

                            {/* Note */}
                            <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Note (optional)
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(238,45,124,0.04)', border: '1px solid rgba(238,45,124,0.18)', borderRadius: '12px', height: '44px', padding: '0 14px', marginBottom: '4px' }}>
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="e.g. Final payment on delivery"
                                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', color: '#090909', fontFamily: 'Inter, sans-serif', backgroundColor: 'transparent' }}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Postpone mode */}
                            <div style={{ backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.20)', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                                <p style={{ margin: 0, fontSize: '13px', color: '#92400e', lineHeight: 1.5 }}>
                                    📅 Record that the customer needs more time to pay. The balance of <strong>Rs. {balance.toFixed(2)}</strong> will still be tracked and shown as outstanding.
                                </p>
                            </div>

                            {/* Reason */}
                            <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Reason *
                            </p>
                            <select
                                value={postponeReason}
                                onChange={(e) => setPostponeReason(e.target.value)}
                                style={{ width: '100%', height: '46px', padding: '0 14px', borderRadius: '12px', border: '1px solid rgba(238,45,124,0.18)', backgroundColor: 'rgba(238,45,124,0.03)', fontSize: '13px', color: '#090909', fontFamily: 'Inter, sans-serif', outline: 'none', marginBottom: '12px', cursor: 'pointer', boxSizing: 'border-box' }}
                            >
                                <option value="">Select reason...</option>
                                {POSTPONE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>

                            {/* New date */}
                            <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Agreed New Payment Date (optional)
                            </p>
                            <input
                                type="date"
                                value={postponeDate}
                                onChange={(e) => setPostponeDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                style={{ width: '100%', height: '46px', padding: '0 14px', borderRadius: '12px', border: '1px solid rgba(238,45,124,0.18)', backgroundColor: 'rgba(238,45,124,0.03)', fontSize: '13px', color: '#090909', fontFamily: 'Inter, sans-serif', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' }}
                            />

                            {/* Additional note */}
                            <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Additional Notes
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(238,45,124,0.04)', border: '1px solid rgba(238,45,124,0.18)', borderRadius: '12px', height: '44px', padding: '0 14px', marginBottom: '4px' }}>
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Any additional context..."
                                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', color: '#090909', fontFamily: 'Inter, sans-serif', backgroundColor: 'transparent' }}
                                />
                            </div>
                        </>
                    )}

                    {error && (
                        <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '13px', padding: '8px 14px', borderRadius: '10px', marginTop: '10px' }}>
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(9,9,9,0.06)', display: 'flex', gap: '10px', flexShrink: 0 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1px solid rgba(9,9,9,0.12)', backgroundColor: 'transparent', color: 'rgba(9,9,9,0.55)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        style={{
                            flex: 2, padding: '13px', borderRadius: '12px', border: 'none',
                            backgroundColor: loading ? 'rgba(238,45,124,0.40)' : mode === 'pay' ? '#22c55e' : '#f59e0b',
                            color: 'white', fontSize: '14px', fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif',
                        }}
                    >
                        {loading ? 'Saving...' : mode === 'pay' ? '✓ Record Payment' : '📅 Record Postponement'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Small components ──────────────────────────────────────
function StatCard({ icon, label, value, color, bg }: { icon: string; label: string; value: string; color: string; bg: string }) {
    return (
        <div style={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid rgba(9,9,9,0.06)', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{icon}</div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
            </div>
            <p style={{ margin: 0, fontSize: '22px', fontWeight: 800, color }}>{value}</p>
        </div>
    )
}

function InfoCard({ label, value, icon, highlight }: { label: string; value: string; icon: string; highlight?: boolean | null }) {
    return (
        <div style={{
            backgroundColor: highlight ? 'rgba(239,68,68,0.04)' : 'rgba(9,9,9,0.02)',
            border: `1px solid ${highlight ? 'rgba(239,68,68,0.20)' : 'rgba(9,9,9,0.06)'}`,
            borderRadius: '10px', padding: '12px 14px',
        }}>
            <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.40)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {icon} {label}
            </p>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: highlight ? '#ef4444' : '#090909' }}>{value}</p>
        </div>
    )
}

function PayRow({ label, value, bold, color }: { label: string; value: string; bold?: boolean; color?: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'rgba(9,9,9,0.55)', fontWeight: bold ? 600 : 400 }}>{label}</span>
            <span style={{ fontSize: bold ? '14px' : '13px', fontWeight: bold ? 700 : 500, color: color || '#090909' }}>{value}</span>
        </div>
    )
}

// function useState<T>(initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
//     return require('react').useState(initial)
// }