import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportsService } from '@/services/reports.service'

type Period = 'today' | 'week' | 'month' | 'year' | 'custom'

const COLORS = ['#EE2D7C', '#3B3B98', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Reports() {
  const [period, setPeriod] = useState<Period>('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const params = period === 'custom'
    ? { startDate, endDate }
    : { period }

  const { data: summary } = useQuery({
    queryKey: ['report-summary', period, startDate, endDate],
    queryFn: () => reportsService.getSummary(params),
  })

  const { data: chartData = [] } = useQuery({
    queryKey: ['report-chart', period],
    queryFn: () => reportsService.getSalesChart(
      period === 'today' ? 1 :
        period === 'week' ? 7 :
          period === 'month' ? 30 : 365
    ),
  })

  const { data: topItems = [] } = useQuery({
    queryKey: ['report-top-items'],
    queryFn: () => reportsService.getTopItems(10),
  })

  const { data: cashierPerf = [] } = useQuery({
    queryKey: ['report-cashier', period, startDate, endDate],
    queryFn: () => reportsService.getCashierPerformance(
      period === 'custom' ? startDate : undefined,
      period === 'custom' ? endDate : undefined,
    ),
  })

  const { data: paymentData = [] } = useQuery({
    queryKey: ['report-payment', period, startDate, endDate],
    queryFn: () => reportsService.getPaymentBreakdown(
      period === 'custom' ? startDate : undefined,
      period === 'custom' ? endDate : undefined,
    ),
  })

  const { data: categoryData = [] } = useQuery({
    queryKey: ['report-category', period, startDate, endDate],
    queryFn: () => reportsService.getCategoryBreakdown(
      period === 'custom' ? startDate : undefined,
      period === 'custom' ? endDate : undefined,
    ),
  })

  const maxRevenue = Math.max(...chartData.map((d: any) => d.revenue), 1)
  const maxItemQty = Math.max(...topItems.map((i: any) => i.quantity), 1)

  const handleExport = () => {
    const content = `
PINKLET POS - SALES REPORT
Generated: ${new Date().toLocaleString('en-LK')}
Period: ${period.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUMMARY
Revenue:      Rs. ${(summary?.revenue || 0).toFixed(2)}
Profit:       Rs. ${(summary?.profit || 0).toFixed(2)}
Discount:     Rs. ${(summary?.discount || 0).toFixed(2)}
Bills:        ${summary?.bills || 0}
Items Sold:   ${summary?.itemsSold || 0}
Avg Bill:     Rs. ${(summary?.avgBillValue || 0).toFixed(2)}
Profit Margin: ${(summary?.profitMargin || 0).toFixed(1)}%

TOP SELLING ITEMS
${topItems.map((i: any, idx: number) => `${idx + 1}. ${i.name} - ${i.quantity} sold - Rs. ${i.revenue.toFixed(2)}`).join('\n')}

CASHIER PERFORMANCE
${cashierPerf.map((c: any) => `${c.name} - ${c.bills} bills - Rs. ${c.revenue.toFixed(2)}`).join('\n')}

PAYMENT BREAKDOWN
${paymentData.map((p: any) => `${p.method}: Rs. ${p.total.toFixed(2)} (${p.percentage.toFixed(1)}%)`).join('\n')}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pinklet-report-${period}-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', overflowY: 'auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#090909' }}>Reports</h1>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'rgba(9,9,9,0.45)' }}>
            Business analytics and performance
          </p>
        </div>
        <button
          onClick={handleExport}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(238,45,124,0.25)', backgroundColor: 'white', color: '#EE2D7C', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
        >
          📥 Export Report
        </button>
      </div>

      {/* Period selector */}
      <div style={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid rgba(9,9,9,0.06)', padding: '14px 16px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', backgroundColor: 'rgba(9,9,9,0.04)', borderRadius: '10px', padding: '3px' }}>
          {(['today', 'week', 'month', 'year', 'custom'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '6px 14px', borderRadius: '8px', border: 'none',
                backgroundColor: period === p ? 'white' : 'transparent',
                color: period === p ? '#EE2D7C' : 'rgba(9,9,9,0.50)',
                fontSize: '13px', fontWeight: period === p ? 600 : 500,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                boxShadow: period === p ? '0 1px 4px rgba(9,9,9,0.10)' : 'none',
                textTransform: 'capitalize', transition: 'all 0.15s',
              }}
            >
              {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : p === 'year' ? 'This Year' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ height: '36px', padding: '0 10px', borderRadius: '8px', border: '1px solid rgba(238,45,124,0.15)', fontSize: '13px', color: '#090909', fontFamily: 'Inter, sans-serif', outline: 'none' }}
            />
            <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.40)' }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ height: '36px', padding: '0 10px', borderRadius: '8px', border: '1px solid rgba(238,45,124,0.15)', fontSize: '13px', color: '#090909', fontFamily: 'Inter, sans-serif', outline: 'none' }}
            />
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'Revenue', value: `Rs. ${(summary?.revenue || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`, color: '#EE2D7C', icon: '💰', bg: 'rgba(238,45,124,0.06)' },
          { label: 'Profit', value: `Rs. ${(summary?.profit || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`, color: '#22c55e', icon: '📈', bg: 'rgba(34,197,94,0.06)' },
          { label: 'Total Bills', value: String(summary?.bills || 0), color: '#3B3B98', icon: '🧾', bg: 'rgba(59,59,152,0.06)' },
          { label: 'Items Sold', value: String(summary?.itemsSold || 0), color: '#f59e0b', icon: '📦', bg: 'rgba(245,158,11,0.06)' },
        ].map((card) => (
          <div key={card.label} style={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid rgba(9,9,9,0.06)', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{card.icon}</div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Extra metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <MetricCard label="Avg Bill Value" value={`Rs. ${(summary?.avgBillValue || 0).toFixed(2)}`} />
        <MetricCard label="Profit Margin" value={`${(summary?.profitMargin || 0).toFixed(1)}%`} color={summary?.profitMargin > 20 ? '#22c55e' : '#f59e0b'} />
        <MetricCard label="Total Discount Given" value={`Rs. ${(summary?.discount || 0).toFixed(2)}`} color="#ef4444" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '16px' }}>

        {/* Sales chart */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid rgba(9,9,9,0.06)', padding: '20px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '14px', fontWeight: 700, color: '#090909' }}>📊 Revenue & Profit Chart</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '180px' }}>
            {chartData.map((d: any, i: number) => {
              const revenueHeight = (d.revenue / maxRevenue) * 160
              const profitHeight = d.revenue > 0 ? (d.profit / maxRevenue) * 160 : 0
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '100%', position: 'relative' }}>
                    {d.revenue > 0 && (
                      <span style={{ fontSize: '8px', color: 'rgba(9,9,9,0.35)', display: 'block', textAlign: 'center', marginBottom: '2px' }}>
                        {d.revenue >= 1000 ? `${(d.revenue / 1000).toFixed(0)}k` : d.revenue.toFixed(0)}
                      </span>
                    )}
                    <div style={{ width: '100%', height: `${Math.max(revenueHeight, 3)}px`, backgroundColor: d.revenue > 0 ? '#EE2D7C' : 'rgba(9,9,9,0.06)', borderRadius: '4px 4px 0 0', position: 'relative', cursor: 'pointer' }}
                      title={`Revenue: Rs. ${d.revenue.toFixed(0)}\nProfit: Rs. ${d.profit.toFixed(0)}\nBills: ${d.bills}`}
                    >
                      {profitHeight > 0 && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${Math.min(profitHeight, revenueHeight)}px`, backgroundColor: 'rgba(34,197,94,0.45)', borderRadius: '4px 4px 0 0' }} />
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: '8px', color: 'rgba(9,9,9,0.35)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', width: '100%' }}>
                    {d.date}
                  </span>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
            <LegendDot color="#EE2D7C" label="Revenue" />
            <LegendDot color="rgba(34,197,94,0.60)" label="Profit" />
          </div>
        </div>

        {/* Payment breakdown */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid rgba(9,9,9,0.06)', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: '#090909' }}>💳 Payment Methods</h3>
          {paymentData.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'rgba(9,9,9,0.35)', textAlign: 'center', padding: '20px 0' }}>No data</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {paymentData.map((p: any, i: number) => (
                <div key={p.method}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#090909', textTransform: 'capitalize' }}>
                      {p.method === 'cash' ? '💵 Cash' : p.method === 'card' ? '💳 Card' : '🔄 Other'}
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: COLORS[i] }}>
                        Rs. {p.total.toLocaleString('en-LK', { minimumFractionDigits: 0 })}
                      </span>
                      <span style={{ fontSize: '11px', color: 'rgba(9,9,9,0.40)', marginLeft: '6px' }}>
                        {p.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'rgba(9,9,9,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p.percentage}%`, backgroundColor: COLORS[i], borderRadius: '99px', transition: 'width 0.5s' }} />
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'rgba(9,9,9,0.40)' }}>{p.count} bills</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top items + Category breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Top items */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid rgba(9,9,9,0.06)', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: '#090909' }}>🏆 Top Selling Items</h3>
          {topItems.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'rgba(9,9,9,0.35)', textAlign: 'center', padding: '20px 0' }}>No sales data</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topItems.map((item: any, index: number) => (
                <div key={item.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                    <span style={{ width: '20px', fontSize: '12px', fontWeight: 800, color: index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'rgba(9,9,9,0.30)', textAlign: 'center', flexShrink: 0 }}>
                      {index + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#090909', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                      <p style={{ margin: '1px 0 0', fontSize: '10px', color: 'rgba(9,9,9,0.40)' }}>{item.category || 'No category'}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#090909' }}>{item.quantity} sold</p>
                      <p style={{ margin: '1px 0 0', fontSize: '10px', color: '#22c55e', fontWeight: 500 }}>+Rs. {item.profit.toFixed(0)}</p>
                    </div>
                  </div>
                  <div style={{ height: '5px', backgroundColor: 'rgba(9,9,9,0.05)', borderRadius: '99px', overflow: 'hidden', marginLeft: '30px' }}>
                    <div style={{ height: '100%', width: `${(item.quantity / maxItemQty) * 100}%`, backgroundColor: '#EE2D7C', borderRadius: '99px', opacity: 0.7 + (index === 0 ? 0.3 : 0) }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid rgba(9,9,9,0.06)', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: '#090909' }}>📂 Revenue by Category</h3>
          {categoryData.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'rgba(9,9,9,0.35)', textAlign: 'center', padding: '20px 0' }}>No data</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categoryData.map((cat: any, i: number) => (
                <div key={cat.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#090909' }}>{cat.name}</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: COLORS[i % COLORS.length] }}>
                        Rs. {cat.revenue.toLocaleString('en-LK', { minimumFractionDigits: 0 })}
                      </span>
                      <span style={{ fontSize: '11px', color: 'rgba(9,9,9,0.40)', marginLeft: '6px' }}>
                        {cat.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'rgba(9,9,9,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${cat.percentage}%`, backgroundColor: COLORS[i % COLORS.length], borderRadius: '99px', transition: 'width 0.5s' }} />
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '10px', color: 'rgba(9,9,9,0.40)' }}>{cat.quantity} items sold</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cashier performance */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid rgba(9,9,9,0.06)', padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: '#090909' }}>👤 Cashier Performance</h3>

        {cashierPerf.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'rgba(9,9,9,0.35)', textAlign: 'center', padding: '20px 0' }}>No data for this period</p>
        ) : (
          <>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '10px 14px', backgroundColor: 'rgba(238,45,124,0.04)', borderRadius: '10px', marginBottom: '8px' }}>
              {['Cashier', 'Bills', 'Revenue', 'Profit', 'Items Sold'].map((col) => (
                <span key={col} style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(9,9,9,0.40)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{col}</span>
              ))}
            </div>

            {cashierPerf.map((cashier: any, index: number) => (
              <div key={cashier.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 14px', borderBottom: index === cashierPerf.length - 1 ? 'none' : '1px solid rgba(9,9,9,0.04)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(238,45,124,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#EE2D7C', flexShrink: 0 }}>
                    {cashier.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#090909' }}>{cashier.name}</p>
                    <p style={{ margin: '1px 0 0', fontSize: '11px', color: 'rgba(9,9,9,0.40)', textTransform: 'capitalize' }}>{cashier.role}</p>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#3B3B98' }}>{cashier.bills}</p>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#EE2D7C' }}>Rs. {cashier.revenue.toLocaleString('en-LK', { minimumFractionDigits: 0 })}</p>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#22c55e' }}>Rs. {cashier.profit.toLocaleString('en-LK', { minimumFractionDigits: 0 })}</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#090909' }}>{cashier.itemsSold}</p>
              </div>
            ))}
          </>
        )}
      </div>

    </div>
  )
}

// ── Small components ──────────────────────────────────────
function MetricCard({ label, value, color = '#090909' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid rgba(9,9,9,0.06)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '13px', color: 'rgba(9,9,9,0.55)' }}>{label}</span>
      <span style={{ fontSize: '15px', fontWeight: 800, color }}>{value}</span>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: color }} />
      <span style={{ fontSize: '11px', color: 'rgba(9,9,9,0.50)' }}>{label}</span>
    </div>
  )
}

// function useState<T>(initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
//   return require('react').useState(initial)
// }