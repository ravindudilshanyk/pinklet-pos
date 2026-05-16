import { useState, useEffect } from 'react'
import { customersService } from '@/services/customers.service'

interface Props {
    customer?: any
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

export default function CustomerFormModal({ customer, onClose, onSaved }: Props) {
    const isEdit = !!customer
    const [form, setForm] = useState({
        name: '',
        phone: '',
        whatsappNumber: '',
        email: '',
        birthday: '',
        notes: '',
    })
    const [sameAsPhone, setSameAsPhone] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (customer) {
            setForm({
                name: customer.name || '',
                phone: customer.phone || '',
                whatsappNumber: customer.whatsappNumber || '',
                email: customer.email || '',
                birthday: customer.birthday
                    ? new Date(customer.birthday).toISOString().split('T')[0]
                    : '',
                notes: customer.notes || '',
            })
        }
    }, [customer])

    const set = (key: keyof typeof form, value: string) =>
        setForm((f) => ({ ...f, [key]: value }))

    const handlePhoneChange = (value: string) => {
        set('phone', value)
        if (sameAsPhone) set('whatsappNumber', value)
    }

    const handleSameAsPhone = (checked: boolean) => {
        setSameAsPhone(checked)
        if (checked) set('whatsappNumber', form.phone)
    }

    const handleSave = async () => {
        setError('')
        if (!form.name.trim()) return setError('Customer name is required')
        try {
            setLoading(true)
            if (isEdit) {
                await customersService.update(customer.id, form)
            } else {
                await customersService.create(form)
            }
            onSaved()
            onClose()
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to save customer')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(9,9,9,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: 'Inter, sans-serif', padding: '16px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '480px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 40px rgba(9,9,9,0.20)', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(9,9,9,0.06)', flexShrink: 0 }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#090909' }}>
                            {isEdit ? 'Edit Customer' : 'Add Customer'}
                        </h3>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>
                            {isEdit ? `Editing: ${customer.name}` : 'Fill in customer details'}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(9,9,9,0.06)', color: 'rgba(9,9,9,0.50)', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

                    {/* Name */}
                    <label style={labelStyle}>Full Name *</label>
                    <div style={inputRow}>
                        <div style={inputInner}>
                            <svg width="16" height="16" fill="none" stroke="rgba(9,9,9,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                                <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Customer full name" style={inputStyle} autoFocus />
                        </div>
                    </div>

                    {/* Phone */}
                    <label style={labelStyle}>Phone Number</label>
                    <div style={inputRow}>
                        <div style={inputInner}>
                            <svg width="16" height="16" fill="none" stroke="rgba(9,9,9,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                                <path d="M2.25 6.338c0-1.301 1.182-2.25 2.25-2.25H7.5c.414 0 .75.336.75.75v4.5a.75.75 0 01-.75.75H6a.75.75 0 00-.75.75v1.5a.75.75 0 00.75.75h1.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75H4.5c-1.068 0-2.25-.949-2.25-2.25V6.338z" />
                            </svg>
                            <input type="text" value={form.phone} onChange={(e) => handlePhoneChange(e.target.value)} placeholder="077 123 4567" style={inputStyle} />
                        </div>
                    </div>

                    {/* WhatsApp */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>WhatsApp Number</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'rgba(9,9,9,0.55)' }}>
                            <input
                                type="checkbox"
                                checked={sameAsPhone}
                                onChange={(e) => handleSameAsPhone(e.target.checked)}
                                style={{ accentColor: '#EE2D7C' }}
                            />
                            Same as phone
                        </label>
                    </div>
                    <div style={inputRow}>
                        <div style={inputInner}>
                            <span style={{ fontSize: '16px', flexShrink: 0 }}>💬</span>
                            <input
                                type="text"
                                value={form.whatsappNumber}
                                onChange={(e) => set('whatsappNumber', e.target.value)}
                                placeholder="94771234567 (with country code)"
                                style={inputStyle}
                                disabled={sameAsPhone}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <label style={labelStyle}>Email Address</label>
                    <div style={inputRow}>
                        <div style={inputInner}>
                            <svg width="16" height="16" fill="none" stroke="rgba(9,9,9,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                                <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="customer@email.com" style={inputStyle} />
                        </div>
                    </div>

                    {/* Birthday */}
                    <label style={labelStyle}>Birthday</label>
                    <div style={inputRow}>
                        <div style={inputInner}>
                            <span style={{ fontSize: '16px', flexShrink: 0 }}>🎂</span>
                            <input type="date" value={form.birthday} onChange={(e) => set('birthday', e.target.value)} style={inputStyle} />
                        </div>
                    </div>

                    {/* Notes */}
                    <label style={labelStyle}>Notes</label>
                    <div style={{ ...inputRow, height: 'auto', minHeight: '80px' }}>
                        <div style={{ ...inputInner, alignItems: 'flex-start', padding: '12px 16px' }}>
                            <textarea
                                value={form.notes}
                                onChange={(e) => set('notes', e.target.value)}
                                placeholder="Any notes about this customer..."
                                rows={3}
                                style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '13px', padding: '8px 14px', borderRadius: '10px' }}>
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
                        {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Customer'}
                    </button>
                </div>
            </div>
        </div>
    )
}