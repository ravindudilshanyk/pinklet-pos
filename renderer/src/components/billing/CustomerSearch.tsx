import { useEffect, useState } from 'react'
import { useBillingStore } from '@/stores/billingStore'
import { billService } from '@/services/billing.service'
import { customersService } from '@/services/customers.service'

interface Props {
  onClose: () => void
}

type CustomerSearchResult = {
  id: string
  name: string
  phone?: string | null
  whatsappNumber?: string | null
  points: number
  totalSpent?: number
  lastVisit?: string | Date | null
  relevanceScore?: number
  activePreOrderCount?: number
  dueSoonPreOrderCount?: number
  _count?: {
    bills?: number
  }
}

export default function CustomerSearch({ onClose }: Props) {
  const setCustomer = useBillingStore((s) => s.setCustomer)
  const currentCustomer = useBillingStore((s) => s.customer)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CustomerSearchResult[]>([])
  const [recommendedCustomers, setRecommendedCustomers] = useState<CustomerSearchResult[]>([])
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingRecommended, setLoadingRecommended] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', phone: '', whatsappNumber: '' })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [sameAsPhone, setSameAsPhone] = useState(false)

  useEffect(() => {
    let isActive = true

    const getTimeValue = (value?: string | Date | null) => {
      if (!value) return 0
      const parsed = new Date(value).getTime()
      return Number.isNaN(parsed) ? 0 : parsed
    }

    const loadRelevantCustomers = async () => {
      setLoadingRecommended(true)
      try {
        const customers = await customersService.getAll()
        if (!isActive) return

        const ranked = [...(customers as CustomerSearchResult[])]
          .sort((a, b) => {
            const scoreDiff = Number(b.relevanceScore || 0) - Number(a.relevanceScore || 0)
            if (scoreDiff !== 0) return scoreDiff

            const dueSoonDiff = Number(b.dueSoonPreOrderCount || 0) - Number(a.dueSoonPreOrderCount || 0)
            if (dueSoonDiff !== 0) return dueSoonDiff

            const activePreOrderDiff = Number(b.activePreOrderCount || 0) - Number(a.activePreOrderCount || 0)
            if (activePreOrderDiff !== 0) return activePreOrderDiff

            const lastVisitDiff = getTimeValue(b.lastVisit) - getTimeValue(a.lastVisit)
            if (lastVisitDiff !== 0) return lastVisitDiff

            const spentDiff = Number(b.totalSpent || 0) - Number(a.totalSpent || 0)
            if (spentDiff !== 0) return spentDiff

            const billsDiff = Number(b._count?.bills || 0) - Number(a._count?.bills || 0)
            if (billsDiff !== 0) return billsDiff

            return Number(b.points || 0) - Number(a.points || 0)
          })
          .slice(0, 8)

        setRecommendedCustomers(ranked)
      } catch {
        if (isActive) setRecommendedCustomers([])
      } finally {
        if (isActive) setLoadingRecommended(false)
      }
    }

    loadRelevantCustomers()

    return () => {
      isActive = false
    }
  }, [])

  const handleSearch = async (q: string) => {
    setQuery(q)
    setSelectedCustomerIndex(0)
    if (q.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const data = await billService.searchCustomers(q)
      setResults(data)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (customer: CustomerSearchResult) => {
    setCustomer({
      id: customer.id,
      name: customer.name,
      phone: customer.phone || undefined,
      whatsappNumber: customer.whatsappNumber || undefined,
      points: customer.points,
    })
    onClose()
  }

  const handleRemove = () => {
    setCustomer(null)
    onClose()
  }

  const handlePhoneChange = (value: string) => {
    setAddForm((f) => ({ ...f, phone: value, whatsappNumber: sameAsPhone ? value : f.whatsappNumber }))
  }

  const handleSameAsPhone = (checked: boolean) => {
    setSameAsPhone(checked)
    if (checked) setAddForm((f) => ({ ...f, whatsappNumber: f.phone }))
  }

  const handleAddCustomer = async () => {
    setAddError('')
    if (!addForm.name.trim()) return setAddError('Name is required')
    try {
      setAddLoading(true)
      const customer = await customersService.create(addForm)
      setCustomer({
        id: customer.id,
        name: customer.name,
        phone: customer.phone || undefined,
        whatsappNumber: customer.whatsappNumber || undefined,
        points: customer.points || 0,
      })
      onClose()
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message || 'Failed to add customer'
      setAddError(errorMessage)
    } finally {
      setAddLoading(false)
    }
  }

  const inputRow: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '10px',
    backgroundColor: 'rgba(238,45,124,0.04)',
    border: '1px solid rgba(238,45,124,0.18)',
    borderRadius: '12px', height: '46px', padding: '0 14px',
    marginBottom: '10px',
  }

  const inputStyle: React.CSSProperties = {
    flex: 1, border: 'none', outline: 'none',
    fontSize: '14px', color: '#090909',
    fontFamily: 'Inter, sans-serif', backgroundColor: 'transparent',
  }

  const showingSearchResults = query.length >= 2
  const visibleCustomers = showingSearchResults ? results : recommendedCustomers
  const safeSelectedCustomerIndex = visibleCustomers.length === 0
    ? -1
    : Math.min(selectedCustomerIndex, visibleCustomers.length - 1)

  const selectVisibleCustomer = (index: number) => {
    const customer = visibleCustomers[index]
    if (!customer) return
    handleSelect(customer)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(9,9,9,0.40)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '20px', padding: '24px',
        width: '100%', maxWidth: '460px',
        boxShadow: '0 8px 32px rgba(9,9,9,0.15)',
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#090909' }}>
            {showAddForm ? '+ Add New Customer' : 'Link Customer'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'rgba(9,9,9,0.40)' }}>×</button>
        </div>

        {/* Tab toggle */}
        {!showAddForm && (
          <div style={{ display: 'flex', backgroundColor: 'rgba(9,9,9,0.04)', borderRadius: '10px', padding: '3px', marginBottom: '14px', flexShrink: 0 }}>
            <button
              style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', backgroundColor: 'white', color: '#EE2D7C', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 1px 4px rgba(9,9,9,0.10)' }}
            >
              Search
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: 'rgba(9,9,9,0.50)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              + New Customer
            </button>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto' }}>

          {/* Search mode */}
          {!showAddForm && (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                backgroundColor: 'rgba(238,45,124,0.04)',
                border: '1px solid rgba(238,45,124,0.18)',
                borderRadius: '12px', height: '46px', padding: '0 14px', marginBottom: '12px',
              }}>
                <svg width="16" height="16" fill="none" stroke="rgba(9,9,9,0.35)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (showAddForm) return
                    if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      if (visibleCustomers.length > 0) {
                        setSelectedCustomerIndex((current) => Math.min(current + 1, visibleCustomers.length - 1))
                      }
                      return
                    }
                    if (e.key === 'ArrowUp') {
                      e.preventDefault()
                      if (visibleCustomers.length > 0) {
                        setSelectedCustomerIndex((current) => Math.max(current - 1, 0))
                      }
                      return
                    }
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (visibleCustomers.length > 0) {
                        selectVisibleCustomer(safeSelectedCustomerIndex)
                      }
                    }
                  }}
                  placeholder="Search by name or phone..."
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#090909', fontFamily: 'Inter, sans-serif', backgroundColor: 'transparent' }}
                />
              </div>

              {loading && <p style={{ textAlign: 'center', color: 'rgba(9,9,9,0.40)', fontSize: '13px' }}>Searching...</p>}
              {!showingSearchResults && loadingRecommended && (
                <p style={{ textAlign: 'center', color: 'rgba(9,9,9,0.40)', fontSize: '13px' }}>
                  Loading relevant customers...
                </p>
              )}

              {!showingSearchResults && visibleCustomers.length > 0 && !loadingRecommended && (
                <p style={{ margin: '0 0 8px 2px', fontSize: '11px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Relevant Customers (Top Picks)
                </p>
              )}

              {visibleCustomers.map((c) => (
                <button
                  key={c.id}
                  onMouseEnter={() => setSelectedCustomerIndex(visibleCustomers.findIndex((candidate) => candidate.id === c.id))}
                  onClick={() => handleSelect(c)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '12px', border: currentCustomer?.id === c.id ? '2px solid #EE2D7C' : safeSelectedCustomerIndex === visibleCustomers.findIndex((candidate) => candidate.id === c.id) ? '2px solid #EE2D7C' : '1px solid rgba(238,45,124,0.12)', backgroundColor: currentCustomer?.id === c.id ? 'rgba(238,45,124,0.04)' : safeSelectedCustomerIndex === visibleCustomers.findIndex((candidate) => candidate.id === c.id) ? 'rgba(238,45,124,0.06)' : 'transparent', cursor: 'pointer', marginBottom: '8px', fontFamily: 'Inter, sans-serif', textAlign: 'left' }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(238,45,124,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#EE2D7C', flexShrink: 0 }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#090909' }}>{c.name}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: 'rgba(9,9,9,0.45)' }}>
                      {c.phone || 'No phone'} · 💎 {c.points} coins
                      {c.whatsappNumber && ' · 💬 WhatsApp'}
                    </p>
                  </div>
                </button>
              ))}

              {query.length >= 2 && results.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <p style={{ fontSize: '13px', color: 'rgba(9,9,9,0.40)', marginBottom: '10px' }}>No customers found</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#EE2D7C', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    + Add "{query}" as new customer
                  </button>
                </div>
              )}

              {currentCustomer && (
                <button
                  onClick={handleRemove}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.25)', backgroundColor: 'transparent', color: '#ef4444', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginTop: '8px' }}
                >
                  Remove linked customer
                </button>
              )}
            </>
          )}

          {/* Add new customer form */}
          {showAddForm && (
            <div>
              <div style={inputRow}>
                <svg width="16" height="16" fill="none" stroke="rgba(9,9,9,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Full name *"
                  style={inputStyle}
                  autoFocus
                />
              </div>

              <div style={inputRow}>
                <svg width="16" height="16" fill="none" stroke="rgba(9,9,9,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path d="M2.25 6.338c0-1.301 1.182-2.25 2.25-2.25H7.5c.414 0 .75.336.75.75v4.5a.75.75 0 01-.75.75H6a.75.75 0 00-.75.75v1.5a.75.75 0 00.75.75h1.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75H4.5c-1.068 0-2.25-.949-2.25-2.25V6.338z" />
                </svg>
                <input
                  type="text"
                  value={addForm.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="Phone number"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.50)', fontWeight: 500 }}>WhatsApp Number</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'rgba(9,9,9,0.55)' }}>
                  <input type="checkbox" checked={sameAsPhone} onChange={(e) => handleSameAsPhone(e.target.checked)} style={{ accentColor: '#EE2D7C' }} />
                  Same as phone
                </label>
              </div>
              <div style={inputRow}>
                <span style={{ fontSize: '16px' }}>💬</span>
                <input
                  type="text"
                  value={addForm.whatsappNumber}
                  onChange={(e) => setAddForm((f) => ({ ...f, whatsappNumber: e.target.value }))}
                  placeholder="94771234567 (with country code)"
                  style={inputStyle}
                  disabled={sameAsPhone}
                />
              </div>

              {addError && (
                <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '13px', padding: '8px 12px', borderRadius: '10px', marginBottom: '12px' }}>
                  {addError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowAddForm(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(9,9,9,0.12)', backgroundColor: 'transparent', color: 'rgba(9,9,9,0.55)', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  Back
                </button>
                <button
                  onClick={handleAddCustomer}
                  disabled={addLoading}
                  style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: addLoading ? 'rgba(238,45,124,0.40)' : '#EE2D7C', color: 'white', fontSize: '13px', fontWeight: 600, cursor: addLoading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  {addLoading ? 'Adding...' : 'Add & Link Customer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}