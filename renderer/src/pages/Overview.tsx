import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { overviewService } from '@/services/overview.service'
import { useNavigate } from 'react-router-dom'

export default function Overview() {
  const navigate = useNavigate()
  const [chartDays, setChartDays] = useState(7)

  const { data: overview, isLoading } = useQuery({
    queryKey: ['overview'],
    queryFn: overviewService.getOverview,
    refetchInterval: 30000,
  })

  const { data: chartData = [] } = useQuery({
    queryKey: ['sales-chart', chartDays],
    queryFn: () => overviewService.getSalesChart(chartDays),
  })

  const { data: topItems = [] } = useQuery({
    queryKey: ['top-items'],
    queryFn: () => overviewService.getTopItems(5),
  })

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(9,9,9,0.35)', fontFamily: 'Inter, sans-serif' }}>
        Loading dashboard...
      </div>
    )
  }

  const today = overview?.today
  const allTime = overview?.allTime
  const recentBills = overview?.recentBills || []
  const lowStockItems = overview?.lowStockItems || []

  const maxRevenue = Math.max(...chartData.map((d: any) => d.revenue), 1)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', overflowY: 'auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#090909' }}>Overview</h1>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'rgba(9,9,9,0.45)' }}>
            {new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => navigate('/bill')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: 'none', backgroundColor: '#EE2D7C', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
        >
          🧾 New Bill
        </button>
      </div>

      {/* Today summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <SummaryCard
          label="Today's Revenue"
          value={`Rs. ${(today?.revenue || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`}
          sub={`All time: Rs. ${(allTime?.revenue || 0).toLocaleString('en-LK', { minimumFractionDigits: 0 })}`}
          icon="💰"
          color="#EE2D7C"
          bg="rgba(238,45,124,0.06)"
        />
        <SummaryCard
          label="Today's Profit"
          value={`Rs. ${(today?.profit || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`}
          sub={`All time: Rs. ${(allTime?.profit || 0).toLocaleString('en-LK', { minimumFractionDigits: 0 })}`}
          icon="📈"
          color="#22c55e"
          bg="rgba(34,197,94,0.06)"
        />
        <SummaryCard
          label="Today's Bills"
          value={String(today?.bills || 0)}
          sub={`All time: ${allTime?.bills || 0} bills`}
          icon="🧾"
          color="#3B3B98"
          bg="rgba(59,59,152,0.06)"
        />
        <SummaryCard
          label="Items Sold Today"
          value={String(today?.itemsSold || 0)}
          sub={`Discount given: Rs. ${(today?.discount || 0).toFixed(2)}`}
          icon="📦"
          color="#f59e0b"
          bg="rgba(245,158,11,0.06)"
        />
      </div>

      {/* Chart + Top Items row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px' }}>

        {/* Sales chart */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid rgba(9,9,9,0.06)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#090909' }}>Sales Overview</h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setChartDays(d)}
                  style={{
                    padding: '4px 10px', borderRadius: '8px', border: 'none',
                    backgroundColor: chartDays === d ? '#EE2D7C' : 'rgba(9,9,9,0.06)',
                    color: chartDays === d ? 'white' : 'rgba(9,9,9,0.50)',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '160px' }}>
            {chartData.map((d: any, i: number) => {
              const height = maxRevenue > 0 ? (d.revenue / maxRevenue) * 140 : 4
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {d.revenue > 0 && (
                      <span style={{ fontSize: '9px', color: 'rgba(9,9,9,0.40)', marginBottom: '2px', whiteSpace: 'nowrap' }}>
                        {d.revenue >= 1000 ? `${(d.revenue / 1000).toFixed(1)}k` : d.revenue.toFixed(0)}
                      </span>
                    )}
                    <div
                      style={{
                        width: '100%',
                        height: `${Math.max(height, 4)}px`,
                        backgroundColor: d.revenue > 0 ? '#EE2D7C' : 'rgba(9,9,9,0.06)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.3s',
                        position: 'relative',
                        cursor: 'pointer',
                      }}
                      title={`Revenue: Rs. ${d.revenue.toFixed(2)}\nProfit: Rs. ${d.profit.toFixed(2)}\nBills: ${d.bills}`}
                    >
                      {d.profit > 0 && (
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: `${Math.max((d.profit / maxRevenue) * 140, 2)}px`,
                          backgroundColor: 'rgba(34,197,94,0.40)',
                          borderRadius: '6px 6px 0 0',
                        }} />
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: '9px', color: 'rgba(9,9,9,0.40)', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {d.date}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#EE2D7C' }} />
              <span style={{ fontSize: '11px', color: 'rgba(9,9,9,0.50)' }}>Revenue</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: 'rgba(34,197,94,0.40)' }} />
              <span style={{ fontSize: '11px', color: 'rgba(9,9,9,0.50)' }}>Profit</span>
            </div>
          </div>
        </div>

        {/* Top selling items */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid rgba(9,9,9,0.06)', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: '#090909' }}>🏆 Top Selling Items</h3>
          {topItems.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'rgba(9,9,9,0.35)', textAlign: 'center', padding: '20px 0' }}>No sales data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topItems.map((item: any, index: number) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: index === 0 ? '#f59e0b' : index === 1 ? 'rgba(9,9,9,0.12)' : 'rgba(9,9,9,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: index === 0 ? '#92400e' : 'rgba(9,9,9,0.50)', flexShrink: 0 }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#090909', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <p style={{ margin: '1px 0 0', fontSize: '11px', color: 'rgba(9,9,9,0.40)' }}>
                      {item.quantity} sold · Rs. {item.revenue.toFixed(0)}
                    </p>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#22c55e', flexShrink: 0 }}>
                    +Rs. {item.profit.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent sales + Low stock row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px' }}>

        {/* Recent sales */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid rgba(9,9,9,0.06)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#090909' }}>🧾 Recent Sales</h3>
            <button
              onClick={() => navigate('/sales')}
              style={{ fontSize: '12px', color: '#EE2D7C', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              View all →
            </button>
          </div>
          {recentBills.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'rgba(9,9,9,0.35)', textAlign: 'center', padding: '20px 0' }}>No sales yet today</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentBills.map((bill: any) => (
                <div key={bill.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'rgba(9,9,9,0.02)', borderRadius: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#EE2D7C' }}>{bill.billNumber}</span>
                      <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '99px', backgroundColor: bill.paymentMethod === 'cash' ? 'rgba(34,197,94,0.12)' : 'rgba(59,59,152,0.10)', color: bill.paymentMethod === 'cash' ? '#16a34a' : '#3B3B98', fontWeight: 600 }}>
                        {bill.paymentMethod}
                      </span>
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(9,9,9,0.45)' }}>
                      {bill.customer?.name || 'Walk-in'} · {bill.cashier?.name} · {new Date(bill.createdAt).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#090909' }}>
                    Rs. {bill.total.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Quick stats */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid rgba(9,9,9,0.06)', padding: '20px' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: '#090909' }}>Quick Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <StatRow icon="👥" label="Total Customers" value={String(overview?.customers?.total || 0)} />
              <StatRow icon="💎" label="Loyalty Coins Active" value={String(overview?.customers?.totalCoins || 0)} />
              <StatRow icon="💰" label="Payment - Cash" value={`Rs. ${(today?.paymentBreakdown?.cash || 0).toFixed(0)}`} />
              <StatRow icon="💳" label="Payment - Card" value={`Rs. ${(today?.paymentBreakdown?.card || 0).toFixed(0)}`} />
            </div>
          </div>

          {/* Low stock alert */}
          {lowStockItems.length > 0 && (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.25)', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#090909' }}>⚠ Low Stock Alert</h3>
                <button
                  onClick={() => navigate('/items')}
                  style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  Manage →
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lowStockItems.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: 'rgba(245,158,11,0.06)', borderRadius: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#090909', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                      {item.supplier && (
                        <p style={{ margin: '1px 0 0', fontSize: '10px', color: 'rgba(9,9,9,0.40)' }}>🏭 {item.supplier.name} {item.supplier.phone ? `· ${item.supplier.phone}` : ''}</p>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: item.stock === 0 ? '#ef4444' : '#f59e0b', marginLeft: '8px', flexShrink: 0 }}>
                      {item.stock} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Components ────────────────────────────────────────────
function SummaryCard({ label, value, sub, icon, color, bg }: {
  label: string; value: string; sub: string
  icon: string; color: string; bg: string
}) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid rgba(9,9,9,0.06)', padding: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
          {icon}
        </div>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <p style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 800, color }}>{value}</p>
      <p style={{ margin: 0, fontSize: '11px', color: 'rgba(9,9,9,0.40)' }}>{sub}</p>
    </div>
  )
}

function StatRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px' }}>{icon}</span>
        <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.55)' }}>{label}</span>
      </div>
      <span style={{ fontSize: '13px', fontWeight: 700, color: '#090909' }}>{value}</span>
    </div>
  )
}