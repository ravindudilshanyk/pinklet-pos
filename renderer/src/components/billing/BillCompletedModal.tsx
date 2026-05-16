interface Props {
  bill: any
  coinsEarned: number
  customer: any
  onClose: () => void
}

export default function BillCompletedModal({ bill, coinsEarned, customer, onClose }: Props) {

  const buildWhatsAppMessage = () => {
    const items = bill.lines.map((l: any) =>
      `• ${l.item?.name || 'Item'} ×${l.quantity} — Rs. ${l.lineTotal.toFixed(2)}`
    ).join('\n')

    return (
      `🛍 *Pinklet POS - Receipt*\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `📅 Date: ${new Date(bill.createdAt).toLocaleDateString('en-LK')}\n` +
      `🧾 Bill #: ${bill.billNumber}\n\n` +
      `*Items:*\n${items}\n\n` +
      `━━━━━━━━━━━━━━━━\n` +
      (bill.discountAmount > 0 ? `Discount:  - Rs. ${bill.discountAmount.toFixed(2)}\n` : '') +
      `*Total:    Rs. ${bill.total.toFixed(2)}*\n\n` +
      (coinsEarned > 0 ? `💎 Loyalty Coins Earned: ${coinsEarned}\n\n` : '') +
      `Thank you for shopping! 🎀`
    )
  }

  const handleWhatsApp = () => {
    const number = customer?.whatsappNumber || customer?.phone
    if (!number) {
      alert('No WhatsApp number saved for this customer.\nPlease add a WhatsApp number in the customer profile.')
      return
    }

    // Clean number — remove spaces, dashes, + sign
    const cleanNumber = number.replace(/[\s\-\+]/g, '')
    const message = encodeURIComponent(buildWhatsAppMessage())

    // Try WhatsApp desktop app first, fallback to web
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const handlePrint = () => {
    const items = bill.lines.map((l: any) =>
      `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;">${l.item?.name || 'Item'}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${l.quantity}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">Rs. ${l.unitPrice.toFixed(2)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">Rs. ${l.lineTotal.toFixed(2)}</td>
      </tr>`
    ).join('')

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${bill.billNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; font-size: 12px; color: #000; width: 80mm; margin: 0 auto; padding: 8px; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .large { font-size: 16px; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; }
          th { padding: 6px 8px; text-align: left; border-bottom: 2px solid #000; font-size: 11px; }
          .total-row td { font-weight: bold; font-size: 14px; padding: 8px; border-top: 2px solid #000; }
        </style>
      </head>
      <body>
        <div class="center bold large">🎀 Pinklet POS</div>
        <div class="center" style="margin-top:4px;font-size:11px;color:#555;">Point of Sale System</div>
        <div class="divider"></div>

        <div style="font-size:11px;margin-bottom:4px;">
          <div><b>Bill #:</b> ${bill.billNumber}</div>
          <div><b>Date:</b> ${new Date(bill.createdAt).toLocaleString('en-LK')}</div>
          <div><b>Cashier:</b> ${bill.cashier?.name || '—'}</div>
          ${customer ? `<div><b>Customer:</b> ${customer.name}</div>` : ''}
        </div>

        <div class="divider"></div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Price</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items}
          </tbody>
          <tfoot>
            ${bill.discountAmount > 0 ? `
            <tr>
              <td colspan="3" style="padding:4px 8px;text-align:right;font-size:11px;">Discount:</td>
              <td style="padding:4px 8px;text-align:right;font-size:11px;color:#e00;">- Rs. ${bill.discountAmount.toFixed(2)}</td>
            </tr>` : ''}
            <tr class="total-row">
              <td colspan="3">TOTAL</td>
              <td style="text-align:right;">Rs. ${bill.total.toFixed(2)}</td>
            </tr>
            ${bill.paymentMethod === 'cash' && bill.change > 0 ? `
            <tr>
              <td colspan="3" style="padding:4px 8px;text-align:right;font-size:11px;">Change:</td>
              <td style="padding:4px 8px;text-align:right;font-size:11px;">Rs. ${bill.change.toFixed(2)}</td>
            </tr>` : ''}
          </tfoot>
        </table>

        <div class="divider"></div>

        ${coinsEarned > 0 ? `<div class="center" style="margin-bottom:6px;font-size:11px;">💎 Loyalty Coins Earned: <b>${coinsEarned}</b></div>` : ''}

        <div class="center" style="margin-top:8px;font-size:11px;color:#555;">
          Thank you for shopping with us! 🎀
        </div>
        <div class="center" style="font-size:10px;color:#999;margin-top:4px;">
          Powered by Pinklet POS
        </div>

        <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); } }</script>
      </body>
      </html>
    `

    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
    }
  }

  const handleBoth = () => {
    handlePrint()
    setTimeout(() => handleWhatsApp(), 1000)
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

        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#090909', margin: '0 0 6px' }}>Bill Completed!</h2>
        <p style={{ fontSize: '13px', color: 'rgba(9,9,9,0.45)', margin: '0 0 4px' }}>{bill.billNumber}</p>
        <p style={{ fontSize: '26px', fontWeight: 800, color: '#EE2D7C', margin: '0 0 20px' }}>Rs. {bill.total.toFixed(2)}</p>

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
            <p style={{ margin: '0 0 2px', fontSize: '14px', color: '#EE2D7C', fontWeight: 700 }}>💎 +{coinsEarned} Loyalty Coins Earned!</p>
            {customer && (
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>
                {customer.name} now has {customer.points + coinsEarned} coins
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* Print + WhatsApp side by side */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1px solid rgba(238,45,124,0.25)', backgroundColor: 'rgba(238,45,124,0.06)', color: '#EE2D7C', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              🖨 Print Bill
            </button>
            <button
              onClick={handleWhatsApp}
              style={{ flex: 1, padding: '13px', borderRadius: '12px', border: 'none', backgroundColor: '#25D366', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              💬 WhatsApp
            </button>
          </div>

          {/* Both together */}
          <button
            onClick={handleBoth}
            style={{ width: '100%', padding: '13px', borderRadius: '12px', border: '1px solid rgba(9,9,9,0.12)', backgroundColor: 'transparent', color: 'rgba(9,9,9,0.60)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            🖨 Print + 💬 WhatsApp Both
          </button>

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