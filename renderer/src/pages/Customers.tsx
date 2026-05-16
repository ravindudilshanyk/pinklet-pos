import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { customersService } from '@/services/customers.service'
import CustomerFormModal from '@/components/customers/CustomerFormModal'
import CustomerProfileModal from '@/components/customers/CustomerProfileModal'

export default function Customers() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<any>(null)
  const [viewingCustomer, setViewingCustomer] = useState<any>(null)

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: customersService.getAll,
  })

  const filtered = customers.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['customers'] })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer? This cannot be undone.')) return
    await customersService.delete(id)
    refresh()
  }

  const handleWhatsApp = (customer: any) => {
    const number = customer.whatsappNumber || customer.phone
    if (!number) return alert('No WhatsApp number available')
    window.open(`https://wa.me/${number}`, '_blank')
  }

  // Stats
  const totalCustomers = customers.length
  const totalPoints = customers.reduce((sum: number, c: any) => sum + c.points, 0)
  const totalSpent = customers.reduce((sum: number, c: any) => sum + (c.totalSpent || 0), 0)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#090909' }}>Customers</h1>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'rgba(9,9,9,0.45)' }}>
            {totalCustomers} registered customers
          </p>
        </div>
        <button
          onClick={() => { setEditingCustomer(null); setShowForm(true) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '12px', border: 'none',
            backgroundColor: '#EE2D7C', color: 'white',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Customer
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid rgba(9,9,9,0.06)', padding: '16px' }}>
          <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.40)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>👥 Total Customers</p>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#EE2D7C' }}>{totalCustomers}</p>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid rgba(9,9,9,0.06)', padding: '16px' }}>
          <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.40)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>💎 Total Loyalty Coins</p>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#3B3B98' }}>{totalPoints.toLocaleString()}</p>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid rgba(9,9,9,0.06)', padding: '16px' }}>
          <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.40)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>💰 Total Revenue</p>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#22c55e' }}>Rs. {totalSpent.toLocaleString('en-LK', { minimumFractionDigits: 0 })}</p>
        </div>
      </div>

      {/* Search + table */}
      <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '14px', border: '1px solid rgba(9,9,9,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Search bar */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(9,9,9,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(238,45,124,0.04)', border: '1px solid rgba(238,45,124,0.15)', borderRadius: '10px', padding: '0 14px', height: '38px', flex: 1, maxWidth: '340px' }}>
            <svg width="14" height="14" fill="none" stroke="rgba(9,9,9,0.35)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone or email..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', color: '#090909', fontFamily: 'Inter, sans-serif', backgroundColor: 'transparent' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(9,9,9,0.35)', fontSize: '16px', lineHeight: 1 }}>×</button>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(9,9,9,0.40)' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 0.8fr 1fr 1fr 100px', padding: '10px 20px', backgroundColor: 'rgba(238,45,124,0.03)', borderBottom: '1px solid rgba(9,9,9,0.06)' }}>
          {['Customer', 'Phone', 'Email', 'Coins', 'Total Spent', 'Last Visit', 'Actions'].map((col) => (
            <span key={col} style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(9,9,9,0.40)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{col}</span>
          ))}
        </div>

        {/* Rows */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(9,9,9,0.35)' }}>Loading customers...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(9,9,9,0.35)' }}>
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ margin: '0 auto 12px', display: 'block' }}>
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 500 }}>No customers found</p>
              <button onClick={() => setShowForm(true)} style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', backgroundColor: '#EE2D7C', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                + Add First Customer
              </button>
            </div>
          ) : (
            filtered.map((customer: any, index: number) => (
              <CustomerRow
                key={customer.id}
                customer={customer}
                isLast={index === filtered.length - 1}
                onView={() => setViewingCustomer(customer)}
                onEdit={() => { setEditingCustomer(customer); setShowForm(true) }}
                onDelete={() => handleDelete(customer.id)}
                onWhatsApp={() => handleWhatsApp(customer)}
              />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <CustomerFormModal
          customer={editingCustomer}
          onClose={() => { setShowForm(false); setEditingCustomer(null) }}
          onSaved={refresh}
        />
      )}
      {viewingCustomer && (
        <CustomerProfileModal
          customerId={viewingCustomer.id}
          onClose={() => setViewingCustomer(null)}
          onEdit={() => { setEditingCustomer(viewingCustomer); setShowForm(true); setViewingCustomer(null) }}
        />
      )}
    </div>
  )
}

// ── Customer Row ──────────────────────────────────────────
function CustomerRow({ customer, isLast, onView, onEdit, onDelete, onWhatsApp }: {
  customer: any
  isLast: boolean
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  onWhatsApp: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const lastVisit = customer.bills?.[0]?.createdAt

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1.2fr 1.2fr 0.8fr 1fr 1fr 100px',
        padding: '13px 20px',
        borderBottom: isLast ? 'none' : '1px solid rgba(9,9,9,0.04)',
        backgroundColor: hovered ? 'rgba(238,45,124,0.02)' : 'transparent',
        transition: 'background-color 0.15s',
        alignItems: 'center',
        cursor: 'pointer',
      }}
      onClick={onView}
    >
      {/* Name + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(238,45,124,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#EE2D7C', flexShrink: 0 }}>
          {customer.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#090909' }}>{customer.name}</p>
          <p style={{ margin: '1px 0 0', fontSize: '11px', color: 'rgba(9,9,9,0.40)' }}>
            {customer._count?.bills || 0} purchase{customer._count?.bills !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Phone */}
      <p style={{ margin: 0, fontSize: '13px', color: 'rgba(9,9,9,0.65)' }}>{customer.phone || '—'}</p>

      {/* Email */}
      <p style={{ margin: 0, fontSize: '12px', color: 'rgba(9,9,9,0.50)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customer.email || '—'}</p>

      {/* Loyalty coins */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontSize: '14px' }}>💎</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#3B3B98' }}>{customer.points}</span>
      </div>

      {/* Total spent */}
      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#22c55e' }}>
        Rs. {(customer.totalSpent || 0).toLocaleString('en-LK', { minimumFractionDigits: 0 })}
      </p>

      {/* Last visit */}
      <p style={{ margin: 0, fontSize: '12px', color: 'rgba(9,9,9,0.50)' }}>
        {lastVisit
          ? new Date(lastVisit).toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' })
          : '—'}
      </p>

      {/* Actions */}
      <div
        style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* WhatsApp */}
        <button
          onClick={onWhatsApp}
          title="WhatsApp"
          style={{ width: '28px', height: '28px', borderRadius: '7px', border: 'none', backgroundColor: 'rgba(37,211,102,0.12)', color: '#25D366', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}
        >
          💬
        </button>

        {/* Edit */}
        <button
          onClick={onEdit}
          title="Edit"
          style={{ width: '28px', height: '28px', borderRadius: '7px', border: 'none', backgroundColor: 'rgba(238,45,124,0.08)', color: '#EE2D7C', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          title="Delete"
          style={{ width: '28px', height: '28px', borderRadius: '7px', border: 'none', backgroundColor: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// function useState<T>(initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
//   return require('react').useState(initial)
// }