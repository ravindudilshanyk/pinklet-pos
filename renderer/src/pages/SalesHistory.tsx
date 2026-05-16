import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { salesService } from '@/services/sales.service'

export default function SalesHistory() {
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0],
  )
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0],
  )
  const [paymentMethod, setPaymentMethod] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [selectedBill, setSelectedBill] = useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['sales', startDate, endDate, paymentMethod, type, page],
    queryFn: () =>
      salesService.getSales({
        startDate,
        endDate,
        paymentMethod: paymentMethod || undefined,
        type: type || undefined,
        page,
        limit: 20,
      }),
  })

  const { data: summary } = useQuery({
    queryKey: ['sales-summary', startDate, endDate],
    queryFn: () => salesService.getSummary(startDate, endDate),
  })

  const bills = data?.bills || []
  const pagination = data?.pagination

  const setQuickDate = (range: string) => {
    const today = new Date()
    const start = new Date()

    if (range === 'today') {
      setStartDate(today.toISOString().split('T')[0])
      setEndDate(today.toISOString().split('T')[0])
    } else if (range === 'yesterday') {
      start.setDate(today.getDate() - 1)
      setStartDate(start.toISOString().split('T')[0])
      setEndDate(start.toISOString().split('T')[0])
    } else if (range === 'week') {
      start.setDate(today.getDate() - 7)
      setStartDate(start.toISOString().split('T')[0])
      setEndDate(today.toISOString().split('T')[0])
    } else if (range === 'month') {
      start.setDate(1)
      setStartDate(start.toISOString().split('T')[0])
      setEndDate(today.toISOString().split('T')[0])
    }
    setPage(1)
  }

  return (
    <div style={{
      fontFamily: 'Inter, sans-serif',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#090909' }}>
            Sales History
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'rgba(9,9,9,0.45)' }}>
            View and filter all transactions
          </p>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          <SummaryCard label="Total Revenue" value={`Rs. ${summary.totalRevenue.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`} color="#EE2D7C" icon="💰" />
          <SummaryCard label="Total Profit" value={`Rs. ${summary.totalProfit.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`} color="#22c55e" icon="📈" />
          <SummaryCard label="Total Bills" value={String(summary.totalBills)} color="#3B3B98" icon="🧾" />
          <SummaryCard label="Items Sold" value={String(summary.totalItems)} color="#f59e0b" icon="📦" />
          <SummaryCard label="Discounts Given" value={`Rs. ${summary.totalDiscount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`} color="#ef4444" icon="🏷" />
        </div>
      )}

      {/* Filters */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '14px',
        border: '1px solid rgba(9,9,9,0.06)',
        padding: '14px 16px',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>

        {/* Quick date buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['today', 'yesterday', 'week', 'month'].map((r) => (
            <button
              key={r}
              onClick={() => setQuickDate(r)}
              style={{
                padding: '5px 12px', borderRadius: '8px',
                border: '1px solid rgba(238,45,124,0.20)',
                backgroundColor: 'transparent',
                color: '#EE2D7C', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                textTransform: 'capitalize',
              }}
            >
              {r === 'week' ? 'Last 7 days' : r === 'month' ? 'This month' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(9,9,9,0.08)' }} />

        {/* Date range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
            style={{
              height: '36px', padding: '0 10px', borderRadius: '8px',
              border: '1px solid rgba(238,45,124,0.15)',
              fontSize: '13px', color: '#090909', fontFamily: 'Inter, sans-serif',
              outline: 'none', backgroundColor: 'white',
            }}
          />
          <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.40)' }}>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
            style={{
              height: '36px', padding: '0 10px', borderRadius: '8px',
              border: '1px solid rgba(238,45,124,0.15)',
              fontSize: '13px', color: '#090909', fontFamily: 'Inter, sans-serif',
              outline: 'none', backgroundColor: 'white',
            }}
          />
        </div>

        {/* Payment method filter */}
        <select
          value={paymentMethod}
          onChange={(e) => { setPaymentMethod(e.target.value); setPage(1) }}
          style={{
            height: '36px', padding: '0 12px', borderRadius: '8px',
            border: '1px solid rgba(238,45,124,0.15)',
            backgroundColor: paymentMethod ? 'rgba(238,45,124,0.06)' : 'white',
            fontSize: '13px', color: paymentMethod ? '#EE2D7C' : 'rgba(9,9,9,0.55)',
            fontFamily: 'Inter, sans-serif', outline: 'none', cursor: 'pointer',
            fontWeight: paymentMethod ? 600 : 400,
          }}
        >
          <option value="">All Payment Methods</option>
          <option value="cash">💵 Cash</option>
          <option value="card">💳 Card</option>
          <option value="other">🔄 Other</option>
        </select>

        {/* Type filter */}
        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1) }}
          style={{
            height: '36px', padding: '0 12px', borderRadius: '8px',
            border: '1px solid rgba(238,45,124,0.15)',
            backgroundColor: type ? 'rgba(238,45,124,0.06)' : 'white',
            fontSize: '13px', color: type ? '#EE2D7C' : 'rgba(9,9,9,0.55)',
            fontFamily: 'Inter, sans-serif', outline: 'none', cursor: 'pointer',
            fontWeight: type ? 600 : 400,
          }}
        >
          <option value="">All Types</option>
          <option value="quick_sale">Quick Sale</option>
          <option value="pre_order">Pre-Order</option>
        </select>

      </div>

      {/* Table */}
      <div style={{
        flex: 1,
        backgroundColor: 'white',
        borderRadius: '14px',
        border: '1px solid rgba(9,9,9,0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 0.8fr 0.8fr',
          padding: '12px 20px',
          backgroundColor: 'rgba(238,45,124,0.04)',
          borderBottom: '1px solid rgba(9,9,9,0.06)',
        }}>
          {['Bill #', 'Customer', 'Cashier', 'Items', 'Total', 'Method', 'Time'].map((col) => (
            <span key={col} style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(9,9,9,0.40)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {col}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(9,9,9,0.35)' }}>
              Loading sales...
            </div>
          ) : bills.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(9,9,9,0.35)' }}>
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ margin: '0 auto 12px', display: 'block' }}>
                <path d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 2.5 2 2.5-2 3.5 2z" />
              </svg>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 500 }}>No sales found</p>
              <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Try a different date range</p>
            </div>
          ) : (
            bills.map((bill: any, index: number) => (
              <SaleRow
                key={bill.id}
                bill={bill}
                isLast={index === bills.length - 1}
                onClick={() => setSelectedBill(bill)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid rgba(9,9,9,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '13px', color: 'rgba(9,9,9,0.45)' }}>
              Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, pagination.total)} of {pagination.total} bills
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '6px 14px', borderRadius: '8px',
                  border: '1px solid rgba(238,45,124,0.20)',
                  backgroundColor: 'transparent', color: page === 1 ? 'rgba(9,9,9,0.25)' : '#EE2D7C',
                  fontSize: '13px', fontWeight: 600, cursor: page === 1 ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                ← Prev
              </button>
              <span style={{ padding: '6px 14px', fontSize: '13px', color: 'rgba(9,9,9,0.55)' }}>
                {page} / {pagination.pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                style={{
                  padding: '6px 14px', borderRadius: '8px',
                  border: '1px solid rgba(238,45,124,0.20)',
                  backgroundColor: 'transparent',
                  color: page === pagination.pages ? 'rgba(9,9,9,0.25)' : '#EE2D7C',
                  fontSize: '13px', fontWeight: 600,
                  cursor: page === pagination.pages ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bill detail modal */}
      {selectedBill && (
        <BillDetailModal
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
        />
      )}
    </div>
  )
}

// ── Summary Card ──────────────────────────────────────────
function SummaryCard({ label, value, color, icon }: {
  label: string
  value: string
  color: string
  icon: string
}) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '14px',
      border: '1px solid rgba(9,9,9,0.06)',
      padding: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color }}>{value}</p>
    </div>
  )
}

// ── Sale Row ──────────────────────────────────────────────
function SaleRow({ bill, isLast, onClick }: { bill: any; isLast: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const itemCount = bill.lines.reduce((sum: number, l: any) => sum + l.quantity, 0)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 0.8fr 0.8fr',
        padding: '14px 20px',
        borderBottom: isLast ? 'none' : '1px solid rgba(9,9,9,0.04)',
        backgroundColor: hovered ? 'rgba(238,45,124,0.02)' : 'transparent',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
        alignItems: 'center',
      }}
    >
      {/* Bill number */}
      <div>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#EE2D7C' }}>
          {bill.billNumber}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'rgba(9,9,9,0.35)' }}>
          {bill.type === 'quick_sale' ? 'Quick Sale' : 'Pre-Order'}
        </p>
      </div>

      {/* Customer */}
      <div>
        {bill.customer ? (
          <>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#090909' }}>
              {bill.customer.name}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(9,9,9,0.40)' }}>
              {bill.customer.phone}
            </p>
          </>
        ) : (
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(9,9,9,0.35)' }}>Walk-in</p>
        )}
      </div>

      {/* Cashier */}
      <div>
        <p style={{ margin: 0, fontSize: '13px', color: '#090909' }}>{bill.cashier.name}</p>
        <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(9,9,9,0.35)', textTransform: 'capitalize' }}>{bill.cashier.role}</p>
      </div>

      {/* Items count */}
      <div>
        <p style={{ margin: 0, fontSize: '13px', color: '#090909' }}>
          {itemCount} item{itemCount !== 1 ? 's' : ''}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(9,9,9,0.35)' }}>
          {bill.lines.length} line{bill.lines.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Total */}
      <div>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#090909' }}>
          Rs. {bill.total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
        </p>
        {bill.discountAmount > 0 && (
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#ef4444' }}>
            -{' '}Rs. {bill.discountAmount.toFixed(2)} off
          </p>
        )}
      </div>

      {/* Payment method */}
      <div>
        <span style={{
          display: 'inline-block',
          padding: '3px 10px', borderRadius: '99px',
          fontSize: '11px', fontWeight: 600,
          backgroundColor:
            bill.paymentMethod === 'cash' ? 'rgba(34,197,94,0.10)' :
              bill.paymentMethod === 'card' ? 'rgba(59,59,152,0.10)' :
                'rgba(245,158,11,0.10)',
          color:
            bill.paymentMethod === 'cash' ? '#16a34a' :
              bill.paymentMethod === 'card' ? '#3B3B98' :
                '#b45309',
        }}>
          {bill.paymentMethod === 'cash' ? '💵 Cash' :
            bill.paymentMethod === 'card' ? '💳 Card' : '🔄 Other'}
        </span>
      </div>

      {/* Time */}
      <div>
        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(9,9,9,0.55)' }}>
          {new Date(bill.createdAt).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'rgba(9,9,9,0.35)' }}>
          {new Date(bill.createdAt).toLocaleDateString('en-LK', { month: 'short', day: 'numeric' })}
        </p>
      </div>
    </div>
  )
}

// ── Bill Detail Modal ─────────────────────────────────────
function BillDetailModal({ bill, onClose }: { bill: any; onClose: () => void }) {
  const profit = bill.lines.reduce((sum: number, l: any) => sum + l.profit, 0)

  const handleWhatsApp = () => {
    const number = bill.customer?.whatsappNumber || bill.customer?.phone
    if (!number) return alert('No WhatsApp number for this customer')
    const items = bill.lines.map((l: any) =>
      `• ${l.item.name} ×${l.quantity} — Rs. ${l.lineTotal.toFixed(2)}`
    ).join('\n')
    const message = encodeURIComponent(
      `🛍 *Pinklet POS - Receipt*\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `📅 ${new Date(bill.createdAt).toLocaleDateString()}\n` +
      `🧾 ${bill.billNumber}\n\n` +
      `*Items:*\n${items}\n\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `*Total: Rs. ${bill.total.toFixed(2)}*\n\n` +
      `Thank you! 🎀`
    )
    window.open(`https://wa.me/${number}?text=${message}`, '_blank')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(9,9,9,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, fontFamily: 'Inter, sans-serif', padding: '16px',
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '20px', width: '100%',
        maxWidth: '520px', maxHeight: '90vh', display: 'flex',
        flexDirection: 'column', boxShadow: '0 8px 40px rgba(9,9,9,0.20)',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(9,9,9,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#090909' }}>
              {bill.billNumber}
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>
              {new Date(bill.createdAt).toLocaleString('en-LK')} · {bill.cashier.name}
            </p>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(9,9,9,0.06)', color: 'rgba(9,9,9,0.50)', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* Customer info */}
          {bill.customer && (
            <div style={{ backgroundColor: 'rgba(238,45,124,0.04)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#090909' }}>👤 {bill.customer.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>{bill.customer.phone}</p>
              </div>
              {bill.loyaltyCoinsEarned > 0 && (
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#EE2D7C', backgroundColor: 'rgba(238,45,124,0.10)', padding: '4px 10px', borderRadius: '20px' }}>
                  💎 +{bill.loyaltyCoinsEarned} coins
                </span>
              )}
            </div>
          )}

          {/* Items */}
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(9,9,9,0.40)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Items
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {bill.lines.map((line: any) => (
              <div key={line.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'rgba(9,9,9,0.02)', borderRadius: '10px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#090909' }}>{line.item.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(9,9,9,0.45)' }}>
                    Rs. {line.unitPrice.toLocaleString()} × {line.quantity}
                    {line.discountAmount > 0 && <span style={{ color: '#ef4444' }}> · -{' '}Rs. {line.discountAmount.toFixed(2)}</span>}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#090909' }}>Rs. {line.lineTotal.toFixed(2)}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#22c55e' }}>+Rs. {line.profit.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ backgroundColor: 'rgba(238,45,124,0.04)', borderRadius: '12px', padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.50)' }}>Subtotal</span>
              <span style={{ fontSize: '12px', color: '#090909' }}>Rs. {bill.subtotal.toFixed(2)}</span>
            </div>
            {bill.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.50)' }}>Discount</span>
                <span style={{ fontSize: '12px', color: '#ef4444' }}>- Rs. {bill.discountAmount.toFixed(2)}</span>
              </div>
            )}
            {bill.loyaltyCoinsUsed > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.50)' }}>💎 Loyalty coins</span>
                <span style={{ fontSize: '12px', color: '#EE2D7C' }}>- Rs. {bill.loyaltyCoinsUsed.toFixed(2)}</span>
              </div>
            )}
            <div style={{ borderTop: '1px solid rgba(9,9,9,0.08)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#090909' }}>Total</span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#EE2D7C' }}>Rs. {bill.total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>Your Profit</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#22c55e' }}>Rs. {profit.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>Payment</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#090909', textTransform: 'capitalize' }}>
                {bill.paymentMethod === 'cash' ? '💵' : bill.paymentMethod === 'card' ? '💳' : '🔄'} {bill.paymentMethod}
                {bill.change > 0 && ` · Change: Rs. ${bill.change.toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(9,9,9,0.06)', display: 'flex', gap: '10px', flexShrink: 0 }}>
          <button
            onClick={() => window.print()}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(238,45,124,0.25)', backgroundColor: 'rgba(238,45,124,0.06)', color: '#EE2D7C', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            🖨 Print
          </button>
          {bill.customer && (
            <button
              onClick={handleWhatsApp}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#25D366', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              💬 WhatsApp
            </button>
          )}
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(9,9,9,0.12)', backgroundColor: 'transparent', color: 'rgba(9,9,9,0.55)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── useState import fix ───────────────────────────────────
// function useState<T>(initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
//   return require('react').useState(initial)
// }