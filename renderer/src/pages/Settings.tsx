import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsService } from '@/services/settings.service'
import { useAuthStore } from '@/stores/authStore'

type Tab = 'general' | 'cashiers' | 'discounts' | 'billing'

export default function Settings() {
  const user = useAuthStore((s) => s.user)
  const isOwner = user?.role === 'owner'
  const [activeTab, setActiveTab] = useState<Tab>('general')

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'general', label: 'General', icon: '🏪' },
    { key: 'cashiers', label: 'Cashier Accounts', icon: '👤' },
    { key: 'discounts', label: 'Discount Presets', icon: '🏷' },
    { key: 'billing', label: 'Billing', icon: '🧾' },
  ]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#090909' }}>Settings</h1>
        <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'rgba(9,9,9,0.45)' }}>
          Manage your shop configuration
        </p>
      </div>

      <div style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar tabs */}
        <div style={{ width: '200px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '11px 14px', borderRadius: '12px', border: 'none',
                backgroundColor: activeTab === tab.key ? 'rgba(238,45,124,0.10)' : 'transparent',
                color: activeTab === tab.key ? '#EE2D7C' : 'rgba(9,9,9,0.60)',
                fontSize: '13px', fontWeight: activeTab === tab.key ? 600 : 500,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                textAlign: 'left', width: '100%',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '16px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'general' && <GeneralSettings isOwner={isOwner} />}
          {activeTab === 'cashiers' && <CashierSettings isOwner={isOwner} />}
          {activeTab === 'discounts' && <DiscountSettings isOwner={isOwner} />}
          {activeTab === 'billing' && <BillingSettings isOwner={isOwner} />}
        </div>
      </div>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────
function Section({ title, description, children }: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid rgba(9,9,9,0.06)', padding: '24px', marginBottom: '16px' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#090909' }}>{title}</h2>
      {description && <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(9,9,9,0.45)' }}>{description}</p>}
      {!description && <div style={{ marginBottom: '16px' }} />}
      {children}
    </div>
  )
}

// ── Input helpers ─────────────────────────────────────────
const fieldStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px',
}
const labelStyle: React.CSSProperties = {
  fontSize: '12px', fontWeight: 600, color: 'rgba(9,9,9,0.50)',
}
const inputStyle: React.CSSProperties = {
  height: '44px', padding: '0 14px', borderRadius: '10px',
  border: '1px solid rgba(238,45,124,0.18)',
  backgroundColor: 'rgba(238,45,124,0.03)',
  fontSize: '14px', color: '#090909', fontFamily: 'Inter, sans-serif',
  outline: 'none', width: '100%', boxSizing: 'border-box',
}

// ── General Settings ──────────────────────────────────────
function GeneralSettings({ isOwner }: { isOwner: boolean }) {
  const { data: settings } = useQuery({
    queryKey: ['shop-settings'],
    queryFn: settingsService.getShopSettings,
  })
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    shopName: settings?.shopName || 'Pinklet POS',
    shopAddress: settings?.shopAddress || '',
    shopPhone: settings?.shopPhone || '',
    shopEmail: settings?.shopEmail || '',
    currency: settings?.currency || 'LKR',
    currencySymbol: settings?.currencySymbol || 'Rs.',
    taxRate: String(settings?.taxRate || 0),
    taxName: settings?.taxName || 'Tax',
    loyaltyCoinsPerAmount: String(settings?.loyaltyCoinsPerAmount || 1000),
    coinValue: String(settings?.coinValue || 1),
    minBillForRedemption: String(settings?.minBillForRedemption || 200),
  })

  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async () => {
    try {
      setLoading(true)
      await settingsService.updateShopSettings({
        ...form,
        taxRate: parseFloat(form.taxRate),
        loyaltyCoinsPerAmount: parseInt(form.loyaltyCoinsPerAmount),
        coinValue: parseFloat(form.coinValue),
        minBillForRedemption: parseFloat(form.minBillForRedemption),
      })
      queryClient.invalidateQueries({ queryKey: ['shop-settings'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Section title="Shop Information" description="Basic details about your shop">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Shop Name</label>
            <input value={form.shopName} onChange={(e) => set('shopName', e.target.value)} style={inputStyle} disabled={!isOwner} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Phone</label>
            <input value={form.shopPhone} onChange={(e) => set('shopPhone', e.target.value)} style={inputStyle} disabled={!isOwner} placeholder="077 123 4567" />
          </div>
          <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Address</label>
            <input value={form.shopAddress} onChange={(e) => set('shopAddress', e.target.value)} style={inputStyle} disabled={!isOwner} placeholder="Street, City" />
          </div>
          <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Email</label>
            <input value={form.shopEmail} onChange={(e) => set('shopEmail', e.target.value)} style={inputStyle} disabled={!isOwner} placeholder="shop@email.com" />
          </div>
        </div>
      </Section>

      <Section title="Currency & Tax" description="Configure currency and tax settings">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Currency Code</label>
            <input value={form.currency} onChange={(e) => set('currency', e.target.value)} style={inputStyle} disabled={!isOwner} placeholder="LKR" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Currency Symbol</label>
            <input value={form.currencySymbol} onChange={(e) => set('currencySymbol', e.target.value)} style={inputStyle} disabled={!isOwner} placeholder="Rs." />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Tax Name</label>
            <input value={form.taxName} onChange={(e) => set('taxName', e.target.value)} style={inputStyle} disabled={!isOwner} placeholder="VAT" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Tax Rate (%)</label>
            <input type="number" value={form.taxRate} onChange={(e) => set('taxRate', e.target.value)} style={inputStyle} disabled={!isOwner} placeholder="0" />
          </div>
        </div>
      </Section>

      <Section title="Loyalty Coins" description="Configure how customers earn and redeem coins">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Earn 1 coin per (Rs.)</label>
            <input type="number" value={form.loyaltyCoinsPerAmount} onChange={(e) => set('loyaltyCoinsPerAmount', e.target.value)} style={inputStyle} disabled={!isOwner} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>1 Coin = (Rs.)</label>
            <input type="number" value={form.coinValue} onChange={(e) => set('coinValue', e.target.value)} style={inputStyle} disabled={!isOwner} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Min bill to redeem (Rs.)</label>
            <input type="number" value={form.minBillForRedemption} onChange={(e) => set('minBillForRedemption', e.target.value)} style={inputStyle} disabled={!isOwner} />
          </div>
        </div>
      </Section>

      {isOwner && (
        <button
          onClick={handleSave}
          disabled={loading}
          style={{ padding: '12px 28px', borderRadius: '12px', border: 'none', backgroundColor: saved ? '#22c55e' : '#EE2D7C', color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background-color 0.3s' }}
        >
          {saved ? '✓ Saved!' : loading ? 'Saving...' : 'Save Settings'}
        </button>
      )}
    </>
  )
}

// ── Cashier Settings ──────────────────────────────────────
function CashierSettings({ isOwner }: { isOwner: boolean }) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingCashier, setEditingCashier] = useState<any>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { data: cashiers = [] } = useQuery({
    queryKey: ['cashiers'],
    queryFn: settingsService.getCashiers,
  })

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['cashiers'] })

  const openAdd = () => {
    setEditingCashier(null)
    setForm({ name: '', email: '', password: '', confirmPassword: '' })
    setError('')
    setShowForm(true)
  }

  const openEdit = (cashier: any) => {
    setEditingCashier(cashier)
    setForm({ name: cashier.name, email: cashier.email || '', password: '', confirmPassword: '' })
    setError('')
    setShowForm(true)
  }

  const handleSave = async () => {
    setError('')
    if (!form.name.trim()) return setError('Name is required')
    if (!editingCashier && !form.password) return setError('Password is required')
    if (form.password && form.password !== form.confirmPassword) return setError('Passwords do not match')
    if (form.password && form.password.length < 6) return setError('Password must be at least 6 characters')

    try {
      setLoading(true)
      const data: any = { name: form.name, email: form.email || undefined }
      if (form.password) data.password = form.password

      if (editingCashier) {
        await settingsService.updateCashier(editingCashier.id, data)
      } else {
        await settingsService.createCashier(data)
      }
      refresh()
      setShowForm(false)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (id: string) => {
    await settingsService.toggleCashier(id)
    refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cashier account?')) return
    await settingsService.deleteCashier(id)
    refresh()
  }

  return (
    <Section title="Cashier Accounts" description="Manage cashier accounts for your shop">

      {!isOwner && (
        <div style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#92400e' }}>⚠ Only the owner can manage cashier accounts.</p>
        </div>
      )}

      {isOwner && !showForm && (
        <button
          onClick={openAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#EE2D7C', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}
        >
          + Add Cashier
        </button>
      )}

      {/* Add/Edit form */}
      {showForm && (
        <div style={{ backgroundColor: 'rgba(238,45,124,0.03)', border: '1px solid rgba(238,45,124,0.12)', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: '#090909' }}>
            {editingCashier ? 'Edit Cashier' : 'New Cashier Account'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Full Name *</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} style={inputStyle} placeholder="Cashier name" autoFocus />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Email (optional)</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} style={inputStyle} placeholder="cashier@shop.com" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>{editingCashier ? 'New Password (leave blank to keep)' : 'Password *'}</label>
              <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} style={inputStyle} placeholder="Min 6 characters" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} style={inputStyle} placeholder="Repeat password" />
            </div>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '13px', padding: '8px 14px', borderRadius: '10px', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid rgba(9,9,9,0.12)', backgroundColor: 'transparent', color: 'rgba(9,9,9,0.55)', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: '#EE2D7C', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              {loading ? 'Saving...' : editingCashier ? 'Save Changes' : 'Create Cashier'}
            </button>
          </div>
        </div>
      )}

      {/* Cashiers list */}
      {cashiers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(9,9,9,0.35)' }}>
          <p style={{ fontSize: '14px' }}>No cashiers yet</p>
          <p style={{ fontSize: '12px', marginTop: '4px' }}>Add your first cashier account above</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {cashiers.map((cashier: any) => (
            <div key={cashier.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '12px', border: `1px solid ${cashier.isActive ? 'rgba(9,9,9,0.07)' : 'rgba(239,68,68,0.20)'}`, backgroundColor: cashier.isActive ? 'white' : 'rgba(239,68,68,0.03)' }}>
              {/* Avatar */}
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: cashier.isActive ? 'rgba(238,45,124,0.10)' : 'rgba(239,68,68,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: cashier.isActive ? '#EE2D7C' : '#ef4444', flexShrink: 0 }}>
                {cashier.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#090909' }}>{cashier.name}</p>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '99px', backgroundColor: cashier.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: cashier.isActive ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                    {cashier.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>
                  {cashier.email || 'No email'} · {cashier._count?.bills || 0} bills processed
                </p>
              </div>

              {/* Actions */}
              {isOwner && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleToggle(cashier.id)}
                    style={{ padding: '7px 14px', borderRadius: '8px', border: `1px solid ${cashier.isActive ? 'rgba(245,158,11,0.25)' : 'rgba(34,197,94,0.25)'}`, backgroundColor: cashier.isActive ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.08)', color: cashier.isActive ? '#b45309' : '#16a34a', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    {cashier.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => openEdit(cashier)}
                    style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid rgba(238,45,124,0.20)', backgroundColor: 'rgba(238,45,124,0.06)', color: '#EE2D7C', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cashier.id)}
                    style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.20)', backgroundColor: 'rgba(239,68,68,0.06)', color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

// ── Discount Settings ─────────────────────────────────────
function DiscountSettings({ isOwner }: { isOwner: boolean }) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingPreset, setEditingPreset] = useState<any>(null)
  const [form, setForm] = useState({ label: '', type: 'percentage', value: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { data: presets = [] } = useQuery({
    queryKey: ['discount-presets-settings'],
    queryFn: settingsService.getDiscountPresets,
  })

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['discount-presets-settings'] })

  const openAdd = () => {
    setEditingPreset(null)
    setForm({ label: '', type: 'percentage', value: '' })
    setError('')
    setShowForm(true)
  }

  const openEdit = (preset: any) => {
    setEditingPreset(preset)
    setForm({ label: preset.label, type: preset.type, value: String(preset.value) })
    setError('')
    setShowForm(true)
  }

  const handleSave = async () => {
    setError('')
    if (!form.label.trim()) return setError('Label is required')
    if (!form.value) return setError('Value is required')

    try {
      setLoading(true)
      const data = { label: form.label, type: form.type, value: parseFloat(form.value) }
      if (editingPreset) {
        await settingsService.updateDiscountPreset(editingPreset.id, data)
      } else {
        await settingsService.createDiscountPreset(data)
      }
      refresh()
      setShowForm(false)
    } catch {
      setError('Failed to save preset')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this discount preset?')) return
    await settingsService.deleteDiscountPreset(id)
    refresh()
  }

  const handleToggle = async (preset: any) => {
    await settingsService.updateDiscountPreset(preset.id, { isActive: !preset.isActive })
    refresh()
  }

  return (
    <Section title="Discount Presets" description="Manage predefined discounts available in billing">

      {isOwner && !showForm && (
        <button
          onClick={openAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#EE2D7C', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}
        >
          + Add Preset
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div style={{ backgroundColor: 'rgba(238,45,124,0.03)', border: '1px solid rgba(238,45,124,0.12)', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: '#090909' }}>
            {editingPreset ? 'Edit Preset' : 'New Discount Preset'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Label *</label>
              <input value={form.label} onChange={(e) => set('label', e.target.value)} style={inputStyle} placeholder="e.g. 10% Off" autoFocus />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Type</label>
              <select value={form.type} onChange={(e) => set('type', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="percentage">Percentage (%)</option>
                <option value="amount">Amount (Rs.)</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Value *</label>
              <input type="number" value={form.value} onChange={(e) => set('value', e.target.value)} style={inputStyle} placeholder={form.type === 'percentage' ? '10' : '100'} />
            </div>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '13px', padding: '8px 14px', borderRadius: '10px', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid rgba(9,9,9,0.12)', backgroundColor: 'transparent', color: 'rgba(9,9,9,0.55)', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: '#EE2D7C', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              {loading ? 'Saving...' : editingPreset ? 'Save Changes' : 'Add Preset'}
            </button>
          </div>
        </div>
      )}

      {/* Presets list */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {presets.map((preset: any) => (
          <div key={preset.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', border: `1px solid ${preset.isActive ? 'rgba(238,45,124,0.20)' : 'rgba(9,9,9,0.10)'}`, backgroundColor: preset.isActive ? 'rgba(238,45,124,0.05)' : 'rgba(9,9,9,0.03)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: preset.isActive ? '#EE2D7C' : 'rgba(9,9,9,0.35)' }}>
              {preset.label}
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(9,9,9,0.40)' }}>
              {preset.type === 'percentage' ? `${preset.value}%` : `Rs. ${preset.value}`}
            </span>
            {isOwner && (
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => handleToggle(preset)} style={{ width: '22px', height: '22px', borderRadius: '6px', border: 'none', backgroundColor: preset.isActive ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)', color: preset.isActive ? '#b45309' : '#16a34a', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {preset.isActive ? '⏸' : '▶'}
                </button>
                <button onClick={() => openEdit(preset)} style={{ width: '22px', height: '22px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(238,45,124,0.10)', color: '#EE2D7C', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✎</button>
                <button onClick={() => handleDelete(preset.id)} style={{ width: '22px', height: '22px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(239,68,68,0.10)', color: '#ef4444', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            )}
          </div>
        ))}
        {presets.length === 0 && (
          <p style={{ fontSize: '13px', color: 'rgba(9,9,9,0.35)' }}>No discount presets yet</p>
        )}
      </div>
    </Section>
  )
}

// ── Billing Settings ──────────────────────────────────────
function BillingSettings({ isOwner }: { isOwner: boolean }) {
  const { data: settings } = useQuery({
    queryKey: ['shop-settings'],
    queryFn: settingsService.getShopSettings,
  })
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    receiptFooter: settings?.receiptFooter || 'Thank you for shopping with us! 🎀',
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    try {
      setLoading(true)
      await settingsService.updateShopSettings(form)
      queryClient.invalidateQueries({ queryKey: ['shop-settings'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Section title="Billing & Receipt" description="Configure receipt and billing options">
      <div style={fieldStyle}>
        <label style={labelStyle}>Receipt Footer Message</label>
        <textarea
          value={form.receiptFooter}
          onChange={(e) => setForm((f) => ({ ...f, receiptFooter: e.target.value }))}
          disabled={!isOwner}
          rows={3}
          style={{ ...inputStyle, height: 'auto', padding: '12px 14px', resize: 'none', lineHeight: 1.5 }}
          placeholder="Thank you message shown at bottom of receipt"
        />
      </div>

      <div style={{ backgroundColor: 'rgba(238,45,124,0.04)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
        <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: 'rgba(9,9,9,0.50)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Receipt Preview</p>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', fontSize: '12px', color: '#090909', lineHeight: 1.8, fontFamily: 'monospace' }}>
          <p style={{ margin: 0, fontWeight: 700, textAlign: 'center' }}>🎀 {settings?.shopName || 'Pinklet POS'}</p>
          <p style={{ margin: 0, textAlign: 'center', color: 'rgba(9,9,9,0.50)' }}>{settings?.shopPhone || ''}</p>
          <p style={{ margin: '8px 0', borderTop: '1px dashed rgba(9,9,9,0.15)', borderBottom: '1px dashed rgba(9,9,9,0.15)', padding: '6px 0', textAlign: 'center', color: 'rgba(9,9,9,0.50)' }}>RECEIPT</p>
          <p style={{ margin: 0 }}>Item 1 × 2 .............. Rs. 600</p>
          <p style={{ margin: 0 }}>Item 2 × 1 .............. Rs. 350</p>
          <p style={{ margin: '6px 0 0', borderTop: '1px solid rgba(9,9,9,0.10)', paddingTop: '6px', fontWeight: 700 }}>Total .................. Rs. 950</p>
          <p style={{ margin: '8px 0 0', textAlign: 'center', color: 'rgba(9,9,9,0.50)', fontStyle: 'italic' }}>{form.receiptFooter}</p>
        </div>
      </div>

      {isOwner && (
        <button
          onClick={handleSave}
          disabled={loading}
          style={{ padding: '12px 28px', borderRadius: '12px', border: 'none', backgroundColor: saved ? '#22c55e' : '#EE2D7C', color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background-color 0.3s' }}
        >
          {saved ? '✓ Saved!' : loading ? 'Saving...' : 'Save Settings'}
        </button>
      )}
    </Section>
  )
}

// function useState<T>(initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
//   return require('react').useState(initial)
// }