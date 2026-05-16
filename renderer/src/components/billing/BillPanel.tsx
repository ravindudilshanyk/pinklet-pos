import { useState } from 'react'
import BillItemRow from './BillItem'
import CustomerSearch from './CustomerSearch'
import PaymentModal from './PaymentModal'
import HoldBillDrawer from './HoldBillDrawer'
import { useBillingStore } from '@/stores/billingStore'
import PreOrderModal from './PreOrderModal'

const OCCASIONS = [
  'Birthday', 'Anniversary', "Mother's Day", "Father's Day",
  "Valentine's Day", 'Wedding', 'Baby Shower', 'Graduation',
  'Christmas', 'New Year', 'Other',
]

export default function BillPanel() {
  const activeTab = useBillingStore((s) => s.activeTab)
  const setActiveTab = useBillingStore((s) => s.setActiveTab)
  const items = useBillingStore((s) => s.items)
  const customer = useBillingStore((s) => s.customer)
  const loyaltyCoinsToUse = useBillingStore((s) => s.loyaltyCoinsToUse)
  const setLoyaltyCoins = useBillingStore((s) => s.setLoyaltyCoins)
  const preOrder = useBillingStore((s) => s.preOrder)
  const setPreOrder = useBillingStore((s) => s.setPreOrder)
  const getSubtotal = useBillingStore((s) => s.getSubtotal)
  const getTotalDiscount = useBillingStore((s) => s.getTotalDiscount)
  const getLoyaltyDiscount = useBillingStore((s) => s.getLoyaltyDiscount)
  const getTotal = useBillingStore((s) => s.getTotal)
  const getTotalProfit = useBillingStore((s) => s.getTotalProfit)

  const [showPayment, setShowPayment] = useState(false)
  const [showHold, setShowHold] = useState(false)
  const [showCustomer, setShowCustomer] = useState(false)
  const [showPreOrder, setShowPreOrder] = useState(false)

  const subtotal = getSubtotal()
  const discount = getTotalDiscount()
  const loyaltyDiscount = getLoyaltyDiscount()
  const total = getTotal()
  const profit = getTotalProfit()
  const maxCoins = customer ? Math.min(customer.points, Math.floor(total)) : 0

  const advancePaid = parseFloat(preOrder.advancePayment || '0')
  const balance = total - advancePaid

  return (
    <div style={{
      height: '100%', backgroundColor: 'white', borderRadius: '16px',
      border: '1px solid rgba(238,45,124,0.12)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* Tab switcher */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(9,9,9,0.06)', flexShrink: 0 }}>
        {(['quick_sale', 'pre_order'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '12px', border: 'none',
              borderBottom: activeTab === tab ? '2px solid #EE2D7C' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === tab ? '#EE2D7C' : 'rgba(9,9,9,0.45)',
              fontSize: '13px', fontWeight: activeTab === tab ? 600 : 500,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
            }}
          >
            {tab === 'quick_sale' ? 'Quick Sale' : 'Pre-Order'}
          </button>
        ))}
      </div>

      {/* Customer + Hold row */}
      <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', borderBottom: '1px solid rgba(9,9,9,0.06)', flexShrink: 0 }}>
        <button
          onClick={() => setShowCustomer(true)}
          style={{
            flex: 1, padding: '7px 12px', borderRadius: '10px',
            border: '1px solid rgba(238,45,124,0.20)',
            backgroundColor: customer ? 'rgba(238,45,124,0.06)' : 'transparent',
            color: customer ? '#EE2D7C' : 'rgba(9,9,9,0.50)',
            fontSize: '12px', fontWeight: 500, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', textAlign: 'left',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {customer ? `👤 ${customer.name}` : '+ Link Customer'}
        </button>
        <button
          onClick={() => setShowHold(true)}
          style={{ padding: '7px 12px', borderRadius: '10px', border: '1px solid rgba(9,9,9,0.12)', backgroundColor: 'transparent', color: 'rgba(9,9,9,0.50)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}
        >
          Hold (F4)
        </button>
      </div>

      {/* Pre-Order fields */}
      {activeTab === 'pre_order' && (
        <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(9,9,9,0.06)', backgroundColor: 'rgba(238,45,124,0.02)', flexShrink: 0 }}>
          <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#EE2D7C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pre-Order Details</p>

          {/* Dates row */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 3px', fontSize: '10px', fontWeight: 600, color: 'rgba(9,9,9,0.45)' }}>Order Date</p>
              <input
                type="date"
                value={preOrder.orderDate}
                onChange={(e) => setPreOrder({ orderDate: e.target.value })}
                style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: '8px', border: '1px solid rgba(238,45,124,0.18)', backgroundColor: 'white', fontSize: '12px', color: '#090909', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 3px', fontSize: '10px', fontWeight: 600, color: 'rgba(9,9,9,0.45)' }}>Required Date *</p>
              <input
                type="date"
                value={preOrder.deliveryDate}
                onChange={(e) => setPreOrder({ deliveryDate: e.target.value })}
                style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: '8px', border: '1px solid rgba(238,45,124,0.18)', backgroundColor: 'white', fontSize: '12px', color: '#090909', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Occasion */}
          <div style={{ marginBottom: '8px' }}>
            <p style={{ margin: '0 0 3px', fontSize: '10px', fontWeight: 600, color: 'rgba(9,9,9,0.45)' }}>Occasion / Reason</p>
            <select
              value={preOrder.note}
              onChange={(e) => setPreOrder({ note: e.target.value })}
              style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: '8px', border: '1px solid rgba(238,45,124,0.18)', backgroundColor: 'white', fontSize: '12px', color: '#090909', fontFamily: 'Inter, sans-serif', outline: 'none', cursor: 'pointer' }}
            >
              <option value="">Select occasion...</option>
              {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Advance payment */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 3px', fontSize: '10px', fontWeight: 600, color: 'rgba(9,9,9,0.45)' }}>Advance (Rs.)</p>
              <input
                type="number"
                value={preOrder.advancePayment}
                onChange={(e) => setPreOrder({ advancePayment: e.target.value })}
                placeholder="0.00"
                style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: '8px', border: '1px solid rgba(238,45,124,0.18)', backgroundColor: 'white', fontSize: '12px', color: '#090909', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 3px', fontSize: '10px', fontWeight: 600, color: 'rgba(9,9,9,0.45)' }}>Advance Type</p>
              <select
                value={preOrder.advanceType || ''}
                onChange={(e) => setPreOrder({ advanceType: e.target.value } as any)}
                style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: '8px', border: '1px solid rgba(238,45,124,0.18)', backgroundColor: 'white', fontSize: '12px', color: '#090909', fontFamily: 'Inter, sans-serif', outline: 'none', cursor: 'pointer' }}
              >
                <option value="">Select...</option>
                <option value="cash">💵 Cash</option>
                <option value="card">💳 Card</option>
                <option value="transfer">🔄 Transfer</option>
              </select>
            </div>
          </div>

          {/* Balance preview */}
          {advancePaid > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: '8px', padding: '7px 10px' }}>
              <span style={{ fontSize: '11px', color: '#92400e', fontWeight: 500 }}>Balance Remaining</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#b45309' }}>Rs. {Math.max(0, balance).toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {/* Bill items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {items.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(9,9,9,0.25)', gap: '8px' }}>
            <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 2.5 2 2.5-2 3.5 2z" />
            </svg>
            <p style={{ fontSize: '13px', margin: 0 }}>No items added yet</p>
            <p style={{ fontSize: '11px', margin: 0 }}>Click items to add to bill</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {items.map((item, index) => (
              <BillItemRow key={item.itemId} item={item} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Loyalty coins */}
      {customer && customer.points > 0 && (
        <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(9,9,9,0.06)', backgroundColor: 'rgba(238,45,124,0.03)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.60)', fontWeight: 500 }}>💎 {customer.points} coins available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              min={0}
              max={maxCoins}
              value={loyaltyCoinsToUse}
              onChange={(e) => setLoyaltyCoins(Math.min(Number(e.target.value), maxCoins))}
              style={{ width: '70px', padding: '5px 8px', borderRadius: '8px', border: '1px solid rgba(238,45,124,0.20)', fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif' }}
            />
            <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.50)' }}>
              coins = Rs. {loyaltyCoinsToUse.toFixed(2)} off
            </span>
            {loyaltyCoinsToUse > 0 && (
              <button onClick={() => setLoyaltyCoins(0)} style={{ marginLeft: 'auto', fontSize: '11px', color: '#EE2D7C', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer totals */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(9,9,9,0.06)', flexShrink: 0 }}>
        <TotalRow label="Subtotal" value={`Rs. ${subtotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`} />
        {discount > 0 && <TotalRow label="Discount" value={`- Rs. ${discount.toFixed(2)}`} color="#ef4444" />}
        {loyaltyDiscount > 0 && <TotalRow label="💎 Loyalty" value={`- Rs. ${loyaltyDiscount.toFixed(2)}`} color="#EE2D7C" />}
        {activeTab === 'pre_order' && advancePaid > 0 && (
          <TotalRow label="Advance Paid" value={`Rs. ${advancePaid.toFixed(2)}`} color="#22c55e" />
        )}
        <div style={{ borderTop: '1px solid rgba(9,9,9,0.08)', margin: '8px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#090909' }}>
            {activeTab === 'pre_order' && advancePaid > 0 ? 'Balance Due' : 'Total'}
          </span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#EE2D7C' }}>
            Rs. {activeTab === 'pre_order' && advancePaid > 0 ? Math.max(0, balance).toFixed(2) : total.toFixed(2)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', color: 'rgba(9,9,9,0.40)' }}>Your Profit</span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#22c55e' }}>Rs. {profit.toFixed(2)}</span>
        </div>

        <button
          onClick={() => {
            if (activeTab === 'pre_order') {
              setShowPreOrder(true)
            } else {
              setShowPayment(true)
            }
          }}
          disabled={items.length === 0}
          style={{
            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
            backgroundColor: items.length > 0 ? '#EE2D7C' : 'rgba(238,45,124,0.30)',
            color: 'white', fontSize: '14px', fontWeight: 700,
            cursor: items.length > 0 ? 'pointer' : 'not-allowed',
            fontFamily: 'Inter, sans-serif', transition: 'background-color 0.2s',
          }}
        >
          Proceed Bill (F12)
        </button>
      </div>

      {/* Modals */}
      {showPreOrder && <PreOrderModal onClose={() => setShowPreOrder(false)} onProceed={() => setShowPreOrder(false)} />}
      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} />}
      {showHold && <HoldBillDrawer onClose={() => setShowHold(false)} />}
      {showCustomer && <CustomerSearch onClose={() => setShowCustomer(false)} />}
    </div>
  )
}

function TotalRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
      <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.50)' }}>{label}</span>
      <span style={{ fontSize: '12px', fontWeight: 500, color: color || '#090909' }}>{value}</span>
    </div>
  )
}