import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/authStore'

type Step = 'send' | 'verify' | 'done'

export default function ChangePassword() {
    const navigate = useNavigate()
    const user = useAuthStore((s) => s.user)
    const [step, setStep] = useState<Step>('send')
    const [emailShown, setEmailShown] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const inputStyle: React.CSSProperties = {
        width: '100%', height: '52px', padding: '0 18px',
        borderRadius: '14px', border: '1.5px solid rgba(238,45,124,0.20)',
        backgroundColor: 'rgba(238,45,124,0.03)',
        fontSize: '15px', color: '#090909',
        fontFamily: 'Inter, sans-serif', outline: 'none',
        boxSizing: 'border-box',
    }

    const handleSendOTP = async () => {
        setError('')
        try {
            setLoading(true)
            const result = await authService.sendChangePasswordOTP()
            setEmailShown(result.data.email)
            setStep('verify')
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to send OTP. Make sure your email is set in your account.')
        } finally {
            setLoading(false)
        }
    }

    const handleChangePassword = async () => {
        setError('')
        if (!otp.trim()) return setError('Enter the OTP from your email')
        if (!newPassword) return setError('Enter a new password')
        if (newPassword !== confirmPassword) return setError('Passwords do not match')
        if (newPassword.length < 6) return setError('Password must be at least 6 characters')

        try {
            setLoading(true)
            await authService.changePasswordWithOTP(otp, newPassword, confirmPassword)
            setStep('done')
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to change password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh', backgroundColor: '#FFF0F5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Inter, sans-serif', padding: '20px',
        }}>
            <div style={{
                backgroundColor: 'white', borderRadius: '24px', padding: '40px',
                width: '100%', maxWidth: '420px',
                boxShadow: '0 8px 40px rgba(238,45,124,0.12)',
            }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#EE2D7C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '24px' }}>
                        {step === 'done' ? '✅' : '🔒'}
                    </div>
                    <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 800, color: '#090909' }}>
                        {step === 'done' ? 'Password Changed!' : 'Change Password'}
                    </h2>
                    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(9,9,9,0.50)' }}>
                        {step === 'send' && `Logged in as ${user?.name}`}
                        {step === 'verify' && `OTP sent to ${emailShown}`}
                        {step === 'done' && 'Your password has been updated'}
                    </p>
                </div>

                {/* Step indicators */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
                    {(['send', 'verify', 'done'] as Step[]).map((s, i) => (
                        <div key={s} style={{ flex: 1, height: '4px', borderRadius: '99px', backgroundColor: ['send', 'verify', 'done'].indexOf(step) >= i ? '#EE2D7C' : 'rgba(238,45,124,0.15)' }} />
                    ))}
                </div>

                {step === 'send' && (
                    <div style={{ backgroundColor: 'rgba(238,45,124,0.04)', borderRadius: '14px', padding: '18px', marginBottom: '8px' }}>
                        <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600, color: '#090909' }}>How it works</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {['We send a 6-digit OTP to your linked email', 'Enter the OTP to verify your identity', 'Set your new password securely'].map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#EE2D7C', color: 'white', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {i + 1}
                                    </div>
                                    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(9,9,9,0.60)', lineHeight: 1.4 }}>{s}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === 'verify' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OTP Code</p>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                maxLength={6}
                                autoFocus
                                style={{ ...inputStyle, textAlign: 'center', fontSize: '28px', fontWeight: 700, letterSpacing: '10px' }}
                            />
                        </div>
                        <div>
                            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Password</p>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" style={inputStyle} />
                        </div>
                        <div>
                            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirm Password</p>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()} placeholder="Repeat password" style={inputStyle} />
                        </div>
                    </div>
                )}

                {step === 'done' && (
                    <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
                        <p style={{ fontSize: '14px', color: 'rgba(9,9,9,0.55)', lineHeight: 1.6 }}>
                            Your password has been changed. Please use your new password next time you log in.
                        </p>
                    </div>
                )}

                {error && (
                    <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '13px', padding: '10px 14px', borderRadius: '10px', marginTop: '14px' }}>
                        {error}
                    </div>
                )}

                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {step !== 'done' && (
                        <button
                            onClick={step === 'send' ? handleSendOTP : handleChangePassword}
                            disabled={loading}
                            style={{
                                width: '100%', padding: '15px', borderRadius: '14px', border: 'none',
                                backgroundColor: loading ? 'rgba(238,45,124,0.40)' : '#EE2D7C',
                                color: 'white', fontSize: '15px', fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif',
                            }}
                        >
                            {loading ? 'Please wait...' : step === 'send' ? 'Send OTP to Email →' : 'Change Password →'}
                        </button>
                    )}
                    <button
                        onClick={() => navigate(-1)}
                        style={{ width: '100%', padding: '13px', borderRadius: '14px', border: '1px solid rgba(9,9,9,0.12)', backgroundColor: 'transparent', color: 'rgba(9,9,9,0.55)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                    >
                        {step === 'done' ? '← Back to App' : '← Cancel'}
                    </button>
                </div>
            </div>
        </div>
    )
}