import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'
import { authService } from '@/services/auth.service'
import { useEffect } from 'react'

type Step = 'details' | 'otp' | 'password' | 'done'

export default function CreateOwner() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [step, setStep] = useState<Step>('details')
  const [form, setForm] = useState({
    shopName: '',
    ownerName: '',
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [localOtp, setLocalOtp] = useState('')

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  useEffect(() => {
    type SetupStatus = { setupComplete?: boolean; ownerExists?: boolean }
    let mounted = true
    authService
      .getSetupStatus()
      .then((status) => {
        const s = status as SetupStatus
        const exists = s.setupComplete ?? s.ownerExists
        if (mounted && exists) navigate('/auth', { replace: true })
      })
      .catch(() => { })
    return () => {
      mounted = false
    }
  }, [navigate])

  const startResendCooldown = () => {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendOTP = async () => {
    setError('')
    if (!form.shopName.trim()) return setError('Enter your shop name')
    if (!form.ownerName.trim()) return setError('Enter your name')
    if (!form.email.trim()) return setError('Enter your email address')
    if (!/\S+@\S+\.\S+/.test(form.email)) return setError('Enter a valid email address')

    try {
      setLoading(true)
      const response = await api.post('/auth/setup/send-otp', {
        email: form.email.trim(),
        shopName: form.shopName.trim(),
      })
      const otp = response.data?.data?.otp
      if (otp) setLocalOtp(otp)
      setStep('otp')
      startResendCooldown()
    } catch (err: unknown) {
      type ErrWithResponse = { response?: { data?: { error?: { message?: string; code?: string } } } }
      const e = err as ErrWithResponse
      if (e?.response?.data?.error?.code === 'OWNER_EXISTS') {
        window.location.replace('/auth')
        return
      }
      setError(e?.response?.data?.error?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return
    setError('')
    try {
      setResending(true)
      const response = await api.post('/auth/setup/send-otp', {
        email: form.email.trim(),
        shopName: form.shopName.trim(),
      })
      const otp = response.data?.data?.otp
      if (otp) setLocalOtp(otp)
      startResendCooldown()
    } catch (err: unknown) {
      type ErrWithResponse = { response?: { data?: { error?: { message?: string } } } }
      const e = err as ErrWithResponse
      setError(e?.response?.data?.error?.message || 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  const handleVerifyOTP = async () => {
    setError('')
    if (!form.otp.trim() || form.otp.length !== 6) return setError('Enter the 6-digit OTP')
    try {
      setLoading(true)
      await api.post('/auth/setup/verify-otp', {
        email: form.email.trim(),
        otp: form.otp.trim(),
      })
      setStep('password')
    } catch (err: unknown) {
      type ErrWithResponse = { response?: { data?: { error?: { message?: string } } } }
      const e = err as ErrWithResponse
      setError(e?.response?.data?.error?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    setError('')
    if (!form.password) return setError('Enter a password')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match')

    try {
      setLoading(true)
      const res = await api.post('/auth/setup/complete', {
        email: form.email.trim(),
        name: form.ownerName.trim(),
        shopName: form.shopName.trim(),
        password: form.password,
      })
      const { token, user } = res.data.data
      setAuth(token, user)
      // Navigate directly to main app — skip /auth entirely
      window.location.replace('/')
    } catch (err: unknown) {
      type ErrWithResponse = { response?: { data?: { error?: { message?: string; code?: string } } } }
      const e = err as ErrWithResponse
      if (e?.response?.data?.error?.code === 'OWNER_EXISTS') {
        window.location.replace('/')
        return
      }
      setError(e?.response?.data?.error?.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '52px', padding: '0 18px',
    borderRadius: '14px', border: '1.5px solid rgba(238,45,124,0.20)',
    backgroundColor: 'rgba(238,45,124,0.03)',
    fontSize: '15px', color: '#090909',
    fontFamily: 'Inter, sans-serif', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  }

  const steps = [
    { key: 'details', label: 'Info', icon: '🏪' },
    { key: 'otp', label: 'Verify', icon: '📧' },
    { key: 'password', label: 'Password', icon: '🔒' },
  ]

  const stepIndex = steps.findIndex((s) => s.key === step)

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#FFF0F5',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', padding: '20px',
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '24px',
        padding: '40px', width: '100%', maxWidth: '440px',
        boxShadow: '0 8px 40px rgba(238,45,124,0.12)',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '20px', backgroundColor: '#EE2D7C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '28px', boxShadow: '0 4px 20px rgba(238,45,124,0.35)' }}>
            🎀
          </div>
          <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 800, color: '#090909' }}>Pinklet POS</h1>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(9,9,9,0.45)' }}>
            {step === 'details' && 'Set up your shop account'}
            {step === 'otp' && 'Verify your email'}
            {step === 'password' && 'Secure your account'}
            {step === 'done' && 'Welcome aboard!'}
          </p>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', alignItems: 'center' }}>
          {steps.map((s, i) => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: i < steps.length - 1 ? 1 : 'unset' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                backgroundColor: i <= stepIndex ? '#EE2D7C' : 'rgba(238,45,124,0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: i <= stepIndex ? '14px' : '12px',
                border: i === stepIndex ? '2px solid #EE2D7C' : 'none',
                transition: 'all 0.3s',
              }}>
                {i < stepIndex ? '✓' : s.icon}
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: '2px', borderRadius: '99px', backgroundColor: i < stepIndex ? '#EE2D7C' : 'rgba(238,45,124,0.15)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 — Shop details */}
        {step === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Shop Name
              </p>
              <input
                type="text"
                value={form.shopName}
                onChange={(e) => set('shopName', e.target.value)}
                placeholder="e.g. Pinklet Bakery"
                autoFocus
                style={inputStyle}
              />
            </div>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your Name (Owner)
              </p>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => set('ownerName', e.target.value)}
                placeholder="e.g. Ravindu Dilshan"
                style={inputStyle}
              />
            </div>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email Address
              </p>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                placeholder="owner@gmail.com"
                style={inputStyle}
              />
              <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'rgba(9,9,9,0.40)' }}>
                We'll send a verification code to this email
              </p>
            </div>
          </div>
        )}

        {/* Step 2 — OTP verification */}
        {step === 'otp' && (
          <div>
            {localOtp && (
              <div style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '14px', padding: '14px 16px', marginBottom: '16px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#166534', fontWeight: 600 }}>Email delivery is unavailable here.</p>
                <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#166534' }}>Use this OTP: <strong>{localOtp}</strong></p>
              </div>
            )}
            <div style={{ backgroundColor: 'rgba(238,45,124,0.05)', border: '1px solid rgba(238,45,124,0.15)', borderRadius: '14px', padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>📧</span>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 600, color: '#090909' }}>Check your email</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(9,9,9,0.50)' }}>
                  OTP sent to <strong>{form.email}</strong>
                </p>
              </div>
            </div>

            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Enter OTP
            </p>
            <input
              type="text"
              value={form.otp}
              onChange={(e) => set('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
              placeholder="000000"
              maxLength={6}
              autoFocus
              style={{
                ...inputStyle,
                textAlign: 'center',
                fontSize: '32px',
                fontWeight: 800,
                letterSpacing: '14px',
                color: '#EE2D7C',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
              <button
                onClick={() => { setStep('details'); setForm((f) => ({ ...f, otp: '' })) }}
                style={{ background: 'none', border: 'none', color: 'rgba(9,9,9,0.45)', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              >
                ← Change email
              </button>
              <button
                onClick={handleResendOTP}
                disabled={resendCooldown > 0 || resending}
                style={{
                  background: 'none', border: 'none',
                  color: resendCooldown > 0 ? 'rgba(9,9,9,0.35)' : '#EE2D7C',
                  fontSize: '12px', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif', fontWeight: 500,
                }}
              >
                {resending ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Password */}
        {step === 'password' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ backgroundColor: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.20)', borderRadius: '12px', padding: '12px 16px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#15803d', fontWeight: 500 }}>
                ✓ Email verified — {form.email}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Password
              </p>
              <input
                type="password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="Min 6 characters"
                autoFocus
                style={inputStyle}
              />
            </div>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Confirm Password
              </p>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => set('confirmPassword', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleComplete()}
                placeholder="Repeat password"
                style={inputStyle}
              />
            </div>

            {/* Password strength */}
            {form.password.length > 0 && (
              <div>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ flex: 1, height: '4px', borderRadius: '99px', backgroundColor: form.password.length >= i * 3 ? i <= 2 ? '#f59e0b' : '#22c55e' : 'rgba(9,9,9,0.08)' }} />
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: form.password.length >= 8 ? '#22c55e' : form.password.length >= 6 ? '#f59e0b' : '#ef4444' }}>
                  {form.password.length < 6 ? 'Too short' : form.password.length < 8 ? 'Fair' : form.password.length < 12 ? 'Good' : 'Strong'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '13px', padding: '10px 14px', borderRadius: '10px', marginTop: '16px' }}>
            {error}
          </div>
        )}

        {/* Action button */}
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={
              step === 'details' ? handleSendOTP :
                step === 'otp' ? handleVerifyOTP :
                  handleComplete
            }
            disabled={loading}
            style={{
              width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
              backgroundColor: loading ? 'rgba(238,45,124,0.40)' : '#EE2D7C',
              color: 'white', fontSize: '15px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(238,45,124,0.35)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Please wait...' :
              step === 'details' ? 'Send Verification Code →' :
                step === 'otp' ? 'Verify & Continue →' :
                  'Create Account & Start →'}
          </button>
        </div>
      </div>
    </div>
  )
}