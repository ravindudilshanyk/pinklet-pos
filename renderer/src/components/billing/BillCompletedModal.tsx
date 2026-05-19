import { printReceipt, shareReceiptWhatsApp, downloadReceipt } from '@/utils/receipt'

interface Props {
  bill: any
  coinsEarned: number
  customer: any
  onClose: () => void
}

export default function BillCompletedModal({ bill, coinsEarned, customer, onClose }: Props) {

  const handlePrint = () => {
    printReceipt(bill, customer, coinsEarned)
  }

  const handleWhatsApp = () => {
    shareReceiptWhatsApp(bill, customer, coinsEarned)
  }

  const handleBoth = () => {
    printReceipt(bill, customer, coinsEarned)
    setTimeout(() => shareReceiptWhatsApp(bill, customer, coinsEarned), 1500)
  }

  const handleDownload = () => {
    downloadReceipt(bill, customer, coinsEarned)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(9,9,9,0.50)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '20px', padding: '32px',
        width: '100%', maxWidth: '400px',
        boxShadow: '0 8px 40px rgba(9,9,9,0.20)', textAlign: 'center',
      }}>

        {/* Success icon */}
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="32" height="32" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#090909', margin: '0 0 6px' }}>
          Bill Completed!
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(9,9,9,0.45)', margin: '0 0 4px' }}>
          {bill.billNumber}
        </p>
        <p style={{ fontSize: '26px', fontWeight: 800, color: '#EE2D7C', margin: '0 0 20px' }}>
          Rs. {bill.total.toFixed(2)}
        </p>

        {/* Payment info */}
        <div style={{ backgroundColor: 'rgba(9,9,9,0.03)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: 'rgba(9,9,9,0.50)' }}>Payment</span>
          <span style={{ fontWeight: 600, color: '#090909', textTransform: 'capitalize' }}>
            {bill.paymentMethod === 'cash' ? '💵' : bill.paymentMethod === 'card' ? '💳' : '🔄'} {bill.paymentMethod}
            {bill.change > 0 && ` · Change: Rs. ${bill.change.toFixed(2)}`}
          </span>
        </div>

        {/* Loyalty coins */}
        {coinsEarned > 0 && (
          <div style={{ backgroundColor: 'rgba(238,45,124,0.06)', borderRadius: '12px', padding: '12px', marginBottom: '20px' }}>
            <p style={{ margin: '0 0 2px', fontSize: '14px', color: '#EE2D7C', fontWeight: 700 }}>
              💎 +{coinsEarned} Loyalty Coins Earned!
            </p>
            {customer && (
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>
                {customer.name} now has {customer.points + coinsEarned} coins
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* Print + WhatsApp */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1px solid rgba(238,45,124,0.25)', backgroundColor: 'rgba(238,45,124,0.06)', color: '#EE2D7C', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              🖨 Print
            </button>
            <button
              onClick={handleWhatsApp}
              style={{ flex: 1, padding: '13px', borderRadius: '12px', border: 'none', backgroundColor: '#25D366', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              💬 WhatsApp
            </button>
          </div>

          {/* Both + Download */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleBoth}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(9,9,9,0.12)', backgroundColor: 'transparent', color: 'rgba(9,9,9,0.60)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              🖨 + 💬 Both
            </button>
            <button
              onClick={handleDownload}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(59,59,152,0.25)', backgroundColor: 'rgba(59,59,152,0.06)', color: '#3B3B98', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              📥 Download PDF
            </button>
          </div>

          {/* New Bill */}
          <button
            onClick={onClose}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#EE2D7C', color: 'white', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            ✕ New Bill
          </button>
        </div>
      </div>
    </div>
  )
}