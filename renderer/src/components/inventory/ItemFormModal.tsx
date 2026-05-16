import { useState, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { itemsService } from '@/services/items.service'

interface Props {
  item?: any
  onClose: () => void
  onSaved: () => void
}

const inputRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'stretch',
  backgroundColor: 'rgba(238,45,124,0.04)',
  border: '1px solid rgba(238,45,124,0.18)',
  borderRadius: '12px',
  height: '50px',
  marginBottom: '12px',
  overflow: 'hidden',
}

const inputInner: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flex: 1,
  padding: '0 16px',
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  border: 'none',
  outline: 'none',
  fontSize: '14px',
  color: '#090909',
  fontFamily: 'Inter, sans-serif',
  backgroundColor: 'transparent',
}

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: 'rgba(9,9,9,0.45)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '6px',
  display: 'block',
}

// ── Quick Add Supplier Popup ──────────────────────────────
function QuickAddSupplier({
  onClose,
  onAdded,
}: {
  onClose: () => void
  onAdded: (supplier: any) => void
}) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async () => {
    if (!form.name.trim()) return setError('Supplier name is required')
    try {
      setLoading(true)
      const supplier = await itemsService.createSupplier(form)
      onAdded(supplier)
      onClose()
    } catch {
      setError('Failed to add supplier')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(9,9,9,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 400, fontFamily: 'Inter, sans-serif', padding: '16px',
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '20px', width: '100%',
        maxWidth: '420px', boxShadow: '0 8px 40px rgba(9,9,9,0.25)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(9,9,9,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#090909' }}>Add New Supplier</h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>Quick add a supplier</p>
          </div>
          <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(9,9,9,0.06)', color: 'rgba(9,9,9,0.50)', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <label style={labelStyle}>Supplier Name *</label>
          <div style={inputRow}>
            <div style={inputInner}>
              <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Fresh Bake Supplies" style={inputStyle} autoFocus />
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Phone</label>
            <div style={inputRow}>
              <div style={inputInner}>
                <input type="text" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="077 123 4567" style={inputStyle} />
              </div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Email</label>
            <div style={inputRow}>
              <div style={inputInner}>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="supplier@email.com" style={inputStyle} />
              </div>
            </div>
          </div>

          <label style={labelStyle}>Address</label>
          <div style={inputRow}>
            <div style={inputInner}>
              <input type="text" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Street, City" style={inputStyle} />
            </div>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '13px', padding: '8px 14px', borderRadius: '10px', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(9,9,9,0.12)', backgroundColor: 'transparent', color: 'rgba(9,9,9,0.55)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading} style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: loading ? 'rgba(238,45,124,0.40)' : '#EE2D7C', color: 'white', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}>
              {loading ? 'Saving...' : 'Add Supplier'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Item Form Modal ──────────────────────────────────
export default function ItemFormModal({ item, onClose, onSaved }: Props) {
  const queryClient = useQueryClient()
  const isEdit = !!item
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '',
    barcode: '',
    categoryId: '',
    newCategory: '',
    supplierId: '',
    buyingPrice: '',
    sellingPrice: '',
    stock: '',
    lowStockAlert: '10',
    imagePreview: '' as string,
    imageBase64: '' as string,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [showQuickSupplier, setShowQuickSupplier] = useState(false)
  const [adjustStock, setAdjustStock] = useState('')
  const [adjustNote, setAdjustNote] = useState('')

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: itemsService.getCategories,
  })

  const { data: suppliers = [], refetch: refetchSuppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: itemsService.getSuppliers,
  })

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        barcode: item.barcode || '',
        categoryId: item.categoryId || '',
        newCategory: '',
        supplierId: item.supplierId || '',
        buyingPrice: String(item.buyingPrice || ''),
        sellingPrice: String(item.sellingPrice || ''),
        stock: String(item.stock || ''),
        lowStockAlert: String(item.lowStockAlert || '10'),
        imagePreview: item.imageUrl || '',
        imageBase64: '',
      })
    }
  }, [item])

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string
      setForm((f) => ({ ...f, imagePreview: base64, imageBase64: base64 }))
    }
    reader.readAsDataURL(file)
  }

  const handleSupplierAdded = (supplier: any) => {
    queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    refetchSuppliers()
    setForm((f) => ({ ...f, supplierId: supplier.id }))
  }

  const sellingPrice = parseFloat(form.sellingPrice || '0')
  const buyingPrice = parseFloat(form.buyingPrice || '0')
  const profit = sellingPrice - buyingPrice
  const margin = sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(1) : '0'

  const handleSave = async () => {
    setError('')
    if (!form.name.trim()) return setError('Item name is required')
    if (!form.sellingPrice) return setError('Selling price is required')
    if (!form.buyingPrice) return setError('Cost price is required')
    if (!isEdit && !form.stock) return setError('Stock quantity is required')

    try {
      setLoading(true)

      let categoryId = form.categoryId
      if (showNewCategory && form.newCategory.trim()) {
        const newCat = await itemsService.createCategory(form.newCategory.trim())
        categoryId = newCat.id
        queryClient.invalidateQueries({ queryKey: ['categories'] })
      }

      const data = {
        name: form.name.trim(),
        barcode: form.barcode.trim() || undefined,
        categoryId: categoryId || undefined,
        supplierId: form.supplierId || undefined,
        buyingPrice: parseFloat(form.buyingPrice),
        sellingPrice: parseFloat(form.sellingPrice),
        stock: isEdit ? undefined : parseInt(form.stock),
        lowStockAlert: parseInt(form.lowStockAlert),
        imageUrl: form.imageBase64 || form.imagePreview || undefined,
      }

      if (isEdit) {
        await itemsService.updateItem(item.id, data)
        if (adjustStock && parseInt(adjustStock) !== 0) {
          await itemsService.adjustStock(item.id, parseInt(adjustStock), adjustNote || 'Manual adjustment')
        }
      } else {
        await itemsService.createItem(data)
      }

      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(9,9,9,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, fontFamily: 'Inter, sans-serif', padding: '16px',
      }}>
        <div style={{
          backgroundColor: 'white', borderRadius: '20px', width: '100%',
          maxWidth: '560px', maxHeight: '90vh', display: 'flex',
          flexDirection: 'column', boxShadow: '0 8px 40px rgba(9,9,9,0.20)',
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(9,9,9,0.06)', flexShrink: 0 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#090909' }}>
                {isEdit ? 'Edit Item' : 'Add New Item'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>
                {isEdit ? `Editing: ${item.name}` : 'Fill in the item details'}
              </p>
            </div>
            <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(9,9,9,0.06)', color: 'rgba(9,9,9,0.50)', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

            {/* Image upload */}
            <label style={labelStyle}>Item Image</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                height: '120px',
                borderRadius: '14px',
                border: '2px dashed rgba(238,45,124,0.25)',
                backgroundColor: 'rgba(238,45,124,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginBottom: '12px',
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.15s',
              }}
            >
              {form.imagePreview ? (
                <>
                  <img src={form.imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', inset: 0, backgroundColor: 'rgba(9,9,9,0.40)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.15s',
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                  >
                    <p style={{ color: 'white', fontSize: '13px', fontWeight: 600, margin: 0 }}>Click to change</p>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <svg width="28" height="28" fill="none" stroke="rgba(238,45,124,0.40)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ margin: '0 auto 8px', display: 'block' }}>
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p style={{ margin: 0, fontSize: '13px', color: 'rgba(9,9,9,0.40)', fontWeight: 500 }}>Click to upload image</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(9,9,9,0.30)' }}>PNG, JPG up to 2MB</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />

            {form.imagePreview && (
              <button
                onClick={() => setForm((f) => ({ ...f, imagePreview: '', imageBase64: '' }))}
                style={{ fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '12px', padding: 0, fontFamily: 'Inter, sans-serif' }}
              >
                × Remove image
              </button>
            )}

            {/* Name */}
            <label style={labelStyle}>Item Name *</label>
            <div style={inputRow}>
              <div style={inputInner}>
                <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Chocolate Brownie Pot" style={inputStyle} autoFocus />
              </div>
            </div>

            {/* Barcode */}
            <label style={labelStyle}>Barcode</label>
            <div style={inputRow}>
              <div style={inputInner}>
                <svg width="16" height="16" fill="none" stroke="rgba(9,9,9,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path d="M3 9V5a2 2 0 012-2h2M3 15v4a2 2 0 002 2h2m10-18h2a2 2 0 012 2v4m0 6v4a2 2 0 01-2 2h-2M9 5h6M9 19h6" />
                </svg>
                <input type="text" value={form.barcode} onChange={(e) => set('barcode', e.target.value)} placeholder="Scan or type barcode" style={inputStyle} />
              </div>
            </div>

            {/* Category */}
            <label style={labelStyle}>Category</label>
            {!showNewCategory ? (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <div style={{ ...inputRow, flex: 1, marginBottom: 0 }}>
                  <div style={inputInner}>
                    <select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="">Select category</option>
                      {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewCategory(true)}
                  style={{ padding: '0 16px', borderRadius: '12px', border: '1px solid rgba(238,45,124,0.25)', backgroundColor: 'transparent', color: '#EE2D7C', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}
                >
                  + New
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <div style={{ ...inputRow, flex: 1, marginBottom: 0 }}>
                  <div style={inputInner}>
                    <input type="text" value={form.newCategory} onChange={(e) => set('newCategory', e.target.value)} placeholder="New category name" style={inputStyle} autoFocus />
                  </div>
                </div>
                <button onClick={() => setShowNewCategory(false)} style={{ padding: '0 14px', borderRadius: '12px', border: '1px solid rgba(9,9,9,0.12)', backgroundColor: 'transparent', color: 'rgba(9,9,9,0.55)', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Cancel
                </button>
              </div>
            )}

            {/* Supplier — dropdown + quick add button */}
            <label style={labelStyle}>Supplier</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div style={{ ...inputRow, flex: 1, marginBottom: 0 }}>
                <div style={inputInner}>
                  <svg width="16" height="16" fill="none" stroke="rgba(9,9,9,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <select
                    value={form.supplierId}
                    onChange={(e) => set('supplierId', e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={() => setShowQuickSupplier(true)}
                style={{
                  padding: '0 16px', borderRadius: '12px',
                  border: '1px solid rgba(238,45,124,0.25)',
                  backgroundColor: 'transparent', color: '#EE2D7C',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif',
                }}
              >
                + New
              </button>
            </div>

            {/* Show selected supplier info */}
            {form.supplierId && (
              () => {
                const sup = suppliers.find((s: any) => s.id === form.supplierId)
                return sup ? (
                  <div style={{ backgroundColor: 'rgba(238,45,124,0.04)', borderRadius: '10px', padding: '8px 14px', marginBottom: '12px', marginTop: '-8px', display: 'flex', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#EE2D7C', fontWeight: 600 }}>🏭 {sup.name}</span>
                    {sup.phone && <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>{sup.phone}</span>}
                    {sup.email && <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>{sup.email}</span>}
                  </div>
                ) : null
              }
            )()}

            {/* Prices */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Cost Price (Rs.) *</label>
                <div style={inputRow}>
                  <div style={inputInner}>
                    <span style={{ fontSize: '13px', color: 'rgba(9,9,9,0.35)', fontWeight: 600 }}>Rs.</span>
                    <input type="number" value={form.buyingPrice} onChange={(e) => set('buyingPrice', e.target.value)} placeholder="0.00" style={inputStyle} />
                  </div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Selling Price (Rs.) *</label>
                <div style={inputRow}>
                  <div style={inputInner}>
                    <span style={{ fontSize: '13px', color: 'rgba(9,9,9,0.35)', fontWeight: 600 }}>Rs.</span>
                    <input type="number" value={form.sellingPrice} onChange={(e) => set('sellingPrice', e.target.value)} placeholder="0.00" style={inputStyle} />
                  </div>
                </div>
              </div>
            </div>

            {/* Profit preview */}
            {sellingPrice > 0 && buyingPrice > 0 && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', marginTop: '-4px' }}>
                <div style={{ flex: 1, backgroundColor: 'rgba(34,197,94,0.08)', borderRadius: '10px', padding: '8px 14px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.50)' }}>Profit per item</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: profit >= 0 ? '#15803d' : '#dc2626' }}>Rs. {profit.toFixed(2)}</span>
                </div>
                <div style={{ flex: 1, backgroundColor: 'rgba(34,197,94,0.08)', borderRadius: '10px', padding: '8px 14px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.50)' }}>Margin</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803d' }}>{margin}%</span>
                </div>
              </div>
            )}

            {/* Stock */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {!isEdit && (
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Initial Stock *</label>
                  <div style={inputRow}>
                    <div style={inputInner}>
                      <input type="number" value={form.stock} onChange={(e) => set('stock', e.target.value)} placeholder="0" style={inputStyle} />
                    </div>
                  </div>
                </div>
              )}
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Low Stock Alert</label>
                <div style={inputRow}>
                  <div style={inputInner}>
                    <input type="number" value={form.lowStockAlert} onChange={(e) => set('lowStockAlert', e.target.value)} placeholder="10" style={inputStyle} />
                  </div>
                </div>
              </div>
            </div>

            {/* Stock adjustment (edit mode) */}
            {isEdit && (
              <div>
                <label style={labelStyle}>Adjust Stock (Current: {item.stock})</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ ...inputRow, flex: 1, marginBottom: 0 }}>
                    <div style={inputInner}>
                      <input type="number" value={adjustStock} onChange={(e) => setAdjustStock(e.target.value)} placeholder="+10 to add, -5 to remove" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ ...inputRow, flex: 2, marginBottom: 0 }}>
                    <div style={inputInner}>
                      <input type="text" value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)} placeholder="Reason (optional)" style={inputStyle} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '13px', padding: '8px 14px', borderRadius: '10px', marginTop: '4px' }}>
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(9,9,9,0.06)', display: 'flex', gap: '10px', flexShrink: 0 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1px solid rgba(9,9,9,0.12)', backgroundColor: 'transparent', color: 'rgba(9,9,9,0.55)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading} style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', backgroundColor: loading ? 'rgba(238,45,124,0.40)' : '#EE2D7C', color: 'white', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick add supplier popup */}
      {showQuickSupplier && (
        <QuickAddSupplier
          onClose={() => setShowQuickSupplier(false)}
          onAdded={handleSupplierAdded}
        />
      )}
    </>
  )
}