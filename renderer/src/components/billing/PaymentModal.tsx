import { useState } from 'react'
import { useBillingStore } from '@/stores/billingStore'
import { billService } from '@/services/billing.service'
import BillCompletedModal from './BillCompletedModal'

interface Props {
  onClose: () => void
}

export default function PaymentModal({ onClose }: Props) {
  const items = useBillingStore((s) => s.items)
  const customer = useBillingStore((s) => s.customer)
  const loyaltyCoinsToUse = useBillingStore((s) => s.loyaltyCoinsToUse)
  const note = useBillingStore((s) => s.note)
  const activeTab = useBillingStore((s) => s.activeTab)
  const preOrder = useBillingStore((s) => s.preOrder)
  const getSubtotal = useBillingStore((s) => s.getSubtotal)
  const getTotalDiscount = useBillingStore((s) => s.getTotalDiscount)
  const getTotal = useBillingStore((s) => s.getTotal)
  const clearBill = useBillingStore((s) => s.clearBill)

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'other'>('cash')
  const [amountReceived, setAmountReceived] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [completedBill, setCompletedBill] = useState<any>(null)

  const total = getTotal()
  const subtotal = getSubtotal()
  const discount = getTotalDiscount()
  const received = parseFloat(amountReceived || '0')
  const change = Math.max(0, received - total)

  const canComplete =
    paymentMethod !== 'cash' || received >= total

  const handleComplete = async () => {
    if (!canComplete) {
      setError('Amount received must be at least Rs. ' + total.toFixed(2))
      return
    }

    setError('')

    try {
      setLoading(true)

      const billData = {
        type: activeTab,
        customerId: customer?.id || undefined,
        paymentMethod,
        items: items.map((i) => ({
          itemId: i.itemId.startsWith('custom_') ? null : i.itemId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          buyingPrice: i.buyingPrice,
          discountAmount: i.discount?.amount ?? 0,
          discountType: i.discount?.type || null,
          discountValue: i.discount?.value || null,
          lineTotal: i.lineTotal,
          name: i.name,
        })).filter((i) => i.itemId !== null),
        subtotal,
        discountAmount: discount,
        tax: 0,
        loyaltyCoinsUsed: loyaltyCoinsToUse,
        total,
        amountReceived: paymentMethod === 'cash' ? received : total,
        change: paymentMethod === 'cash' ? change : 0,
        note: note || undefined,
        ...(activeTab === 'pre_order' ? {
          orderDate: preOrder.orderDate || undefined,
          deliveryDate: preOrder.deliveryDate || undefined,
          advancePayment: preOrder.advancePayment
            ? parseFloat(preOrder.advancePayment)
            : undefined,
        } : {}),
      }

      const result = await billService.completeBill(billData)
      setCompletedBill(result)
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || 'Failed to complete bill'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (completedBill) {
    return (
      <BillCompletedModal
        bill={completedBill.bill}
        coinsEarned={completedBill.coinsEarned}
        customer={customer}
        onClose={() => {
          clearBill()
          onClose()
        }}
      />
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(9,9,9,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '20px',
        padding: '28px', width: '100%', maxWidth: '420px',
        boxShadow: '0 8px 32px rgba(9,9,9,0.15)',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#090909' }}>Payment</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: 'rgba(9,9,9,0.40)' }}>×</button>
        </div>

        {/* Bill summary */}
        <div style={{ backgroundColor: 'rgba(238,45,124,0.04)', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
          {customer && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.50)' }}>Customer</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#EE2D7C' }}>{customer.name}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.50)' }}>Items</span>
            <span style={{ fontSize: '12px', color: '#090909' }}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.50)' }}>Subtotal</span>
            <span style={{ fontSize: '12px', color: '#090909' }}>Rs. {subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.50)' }}>Discount</span>
              <span style={{ fontSize: '12px', color: '#ef4444' }}>- Rs. {discount.toFixed(2)}</span>
            </div>
          )}
          {loyaltyCoinsToUse > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.50)' }}>💎 Loyalty coins</span>
              <span style={{ fontSize: '12px', color: '#EE2D7C' }}>- Rs. {loyaltyCoinsToUse.toFixed(2)}</span>
            </div>
          )}
          <div style={{ borderTop: '1px solid rgba(9,9,9,0.08)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#090909' }}>Total</span>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#EE2D7C' }}>Rs. {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment method */}
        <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
          Payment Method
        </p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {(['cash', 'card', 'other'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setPaymentMethod(m); setError('') }}
              style={{
                flex: 1, padding: '10px', borderRadius: '10px',
                border: paymentMethod === m ? '2px solid #EE2D7C' : '1px solid rgba(9,9,9,0.12)',
                backgroundColor: paymentMethod === m ? 'rgba(238,45,124,0.06)' : 'transparent',
                color: paymentMethod === m ? '#EE2D7C' : 'rgba(9,9,9,0.50)',
                fontSize: '13px', fontWeight: paymentMethod === m ? 600 : 500,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              {m === 'cash' ? '💵 Cash' : m === 'card' ? '💳 Card' : '🔄 Other'}
            </button>
          ))}
        </div>

        {/* Cash amount */}
        {paymentMethod === 'cash' && (
          <>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Amount Received
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              backgroundColor: 'rgba(238,45,124,0.04)',
              border: '1px solid rgba(238,45,124,0.18)',
              borderRadius: '12px', height: '52px', padding: '0 16px', marginBottom: '12px',
            }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(9,9,9,0.40)' }}>Rs.</span>
              <input
                type="number"
                value={amountReceived}
                onChange={(e) => { setAmountReceived(e.target.value); setError('') }}
                placeholder={total.toFixed(2)}
                autoFocus
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '18px', fontWeight: 600, color: '#090909', fontFamily: 'Inter, sans-serif', backgroundColor: 'transparent' }}
              />
            </div>

            {/* Quick amount buttons */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              {[
                Math.ceil(total / 100) * 100,
                Math.ceil(total / 500) * 500,
                Math.ceil(total / 1000) * 1000,
              ].filter((v, i, a) => a.indexOf(v) === i).map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmountReceived(String(amt))}
                  style={{
                    flex: 1, padding: '7px', borderRadius: '8px',
                    border: received === amt ? '2px solid #EE2D7C' : '1px solid rgba(238,45,124,0.20)',
                    backgroundColor: received === amt ? 'rgba(238,45,124,0.08)' : 'transparent',
                    color: received === amt ? '#EE2D7C' : 'rgba(9,9,9,0.55)',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Rs. {amt.toLocaleString()}
                </button>
              ))}
              <button
                onClick={() => setAmountReceived(String(total.toFixed(2)))}
                style={{
                  flex: 1, padding: '7px', borderRadius: '8px',
                  border: received === total ? '2px solid #22c55e' : '1px solid rgba(34,197,94,0.25)',
                  backgroundColor: received === total ? 'rgba(34,197,94,0.08)' : 'transparent',
                  color: '#16a34a', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}
              >
                Exact
              </button>
            </div>

            {/* Change */}
            {received >= total && received > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(34,197,94,0.08)', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#15803d' }}>Change to Return</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#15803d' }}>Rs. {change.toFixed(2)}</span>
              </div>
            )}
          </>
        )}

        {/* Card / Other info */}
        {paymentMethod !== 'cash' && (
          <div style={{ backgroundColor: 'rgba(59,59,152,0.06)', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#3B3B98', fontWeight: 500 }}>
              {paymentMethod === 'card' ? '💳 Card payment — full amount will be charged' : '🔄 Other payment method'}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>
              Total: Rs. {total.toFixed(2)}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '13px', padding: '10px 14px', borderRadius: '10px', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        {/* Complete button */}
        <button
          onClick={handleComplete}
          disabled={loading || !canComplete}
          style={{
            width: '100%', padding: '15px', borderRadius: '12px', border: 'none',
            backgroundColor: canComplete && !loading ? '#EE2D7C' : 'rgba(238,45,124,0.35)',
            color: 'white', fontSize: '15px', fontWeight: 700,
            cursor: canComplete && !loading ? 'pointer' : 'not-allowed',
            fontFamily: 'Inter, sans-serif', transition: 'background-color 0.2s',
          }}
        >
          {loading ? 'Processing...' : 'Complete Bill'}
        </button>
      </div>
    </div>
  )
}