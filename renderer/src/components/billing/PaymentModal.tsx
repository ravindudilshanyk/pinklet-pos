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

  const isPreOrder = activeTab === 'pre_order'
  const orderTotal = getTotal()
  const subtotal = getSubtotal()
  const discount = getTotalDiscount()

  // For pre-order: only collect advance now
  const advanceAmount = isPreOrder
    ? parseFloat(preOrder.advancePayment || '0')
    : 0
  const balanceAmount = isPreOrder ? Math.max(0, orderTotal - advanceAmount) : 0

  // Amount to collect NOW
  const amountDueNow = isPreOrder ? advanceAmount : orderTotal

  const received = parseFloat(amountReceived || '0')
  const change = Math.max(0, received - amountDueNow)

  const canComplete = amountDueNow === 0 ||
    paymentMethod !== 'cash' ||
    received >= amountDueNow

  const handleComplete = async () => {
    if (amountDueNow > 0 && !canComplete) {
      setError(`Amount received must be at least Rs. ${amountDueNow.toFixed(2)}`)
      return
    }

    setError('')

    try {
      setLoading(true)

      const billData = {
        type: activeTab,
        status: isPreOrder ? 'pending' : 'completed',
        customerId: customer?.id || undefined,
        paymentMethod,
        items: items
          .filter((i) => !i.itemId.startsWith('custom_'))
          .map((i) => ({
            itemId: i.itemId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            buyingPrice: i.buyingPrice,
            discountAmount: i.discount?.amount ?? 0,
            discountType: i.discount?.type || undefined,
            discountValue: i.discount?.value || undefined,
            lineTotal: i.lineTotal,
          })),
        subtotal,
        discountAmount: discount,
        tax: 0,
        loyaltyCoinsUsed: loyaltyCoinsToUse,
        total: orderTotal,
        amountReceived: paymentMethod === 'cash' ? received : amountDueNow,
        change: paymentMethod === 'cash' ? change : 0,
        note: note || undefined,
        ...(isPreOrder ? {
          orderDate: preOrder.orderDate || undefined,
          deliveryDate: preOrder.deliveryDate || undefined,
          advancePayment: advanceAmount,
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
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#090909' }}>
              {isPreOrder ? 'Pre-Order Payment' : 'Payment'}
            </h3>
            {isPreOrder && (
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#f59e0b', fontWeight: 500 }}>
                Collecting advance payment only
              </p>
            )}
          </div>
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

          {/* Order total (full) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.50)' }}>Order Total</span>
            <span style={{ fontSize: '12px', color: '#090909' }}>Rs. {orderTotal.toFixed(2)}</span>
          </div>

          {/* Pre-order breakdown */}
          {isPreOrder && advanceAmount > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: 500 }}>Advance Payment</span>
                <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: 600 }}>Rs. {advanceAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 500 }}>Balance (collect later)</span>
                <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>Rs. {balanceAmount.toFixed(2)}</span>
              </div>
            </>
          )}

          <div style={{ borderTop: '1px solid rgba(9,9,9,0.08)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#090909' }}>
              {isPreOrder && advanceAmount > 0 ? 'Collecting Now' : 'Total'}
            </span>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#EE2D7C' }}>
              Rs. {amountDueNow > 0 ? amountDueNow.toFixed(2) : '0.00'}
            </span>
          </div>

          {/* No advance note */}
          {isPreOrder && advanceAmount === 0 && (
            <div style={{ marginTop: '8px', padding: '8px 10px', backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#92400e' }}>
                ⚠ No advance set — full balance of Rs. {orderTotal.toFixed(2)} will be collected on delivery
              </p>
            </div>
          )}
        </div>

        {/* Only show payment input if there's something to collect now */}
        {amountDueNow > 0 ? (
          <>
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
                    placeholder={amountDueNow.toFixed(2)}
                    autoFocus
                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: '18px', fontWeight: 600, color: '#090909', fontFamily: 'Inter, sans-serif', backgroundColor: 'transparent' }}
                  />
                </div>

                {/* Quick amounts */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  {[
                    Math.ceil(amountDueNow / 100) * 100,
                    Math.ceil(amountDueNow / 500) * 500,
                    Math.ceil(amountDueNow / 1000) * 1000,
                  ].filter((v, i, a) => a.indexOf(v) === i && v !== amountDueNow).slice(0, 3).map((amt) => (
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
                    onClick={() => setAmountReceived(amountDueNow.toFixed(2))}
                    style={{
                      flex: 1, padding: '7px', borderRadius: '8px',
                      border: '1px solid rgba(34,197,94,0.25)',
                      backgroundColor: 'rgba(34,197,94,0.06)',
                      color: '#16a34a', fontSize: '12px', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    Exact
                  </button>
                </div>

                {/* Change */}
                {received >= amountDueNow && received > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(34,197,94,0.08)', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#15803d' }}>Change to Return</span>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#15803d' }}>Rs. {change.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}

            {/* Card/Other */}
            {paymentMethod !== 'cash' && (
              <div style={{ backgroundColor: 'rgba(59,59,152,0.06)', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#3B3B98', fontWeight: 500 }}>
                  {paymentMethod === 'card' ? '💳 Card payment' : '🔄 Other payment'}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>
                  Collecting: Rs. {amountDueNow.toFixed(2)}
                </p>
              </div>
            )}
          </>
        ) : (
          /* No advance — just confirm */
          <div style={{ backgroundColor: 'rgba(245,158,11,0.06)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#92400e', fontWeight: 500, textAlign: 'center' }}>
              Order will be saved. Full balance of Rs. {orderTotal.toFixed(2)} to be collected on delivery.
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
          disabled={loading || (amountDueNow > 0 && !canComplete)}
          style={{
            width: '100%', padding: '15px', borderRadius: '12px', border: 'none',
            backgroundColor: (canComplete || amountDueNow === 0) && !loading ? '#EE2D7C' : 'rgba(238,45,124,0.35)',
            color: 'white', fontSize: '15px', fontWeight: 700,
            cursor: (canComplete || amountDueNow === 0) && !loading ? 'pointer' : 'not-allowed',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {loading
            ? 'Processing...'
            : isPreOrder
              ? advanceAmount > 0
                ? `Confirm & Collect Rs. ${advanceAmount.toFixed(2)}`
                : 'Confirm Pre-Order'
              : 'Complete Bill'
          }
        </button>
      </div>
    </div>
  )
}