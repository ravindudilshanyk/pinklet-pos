import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'

type Step = 'email' | 'otp' | 'reset' | 'done'

export default function ForgotPassword() {
    const navigate = useNavigate()
    const [step, setStep] = useState<Step>('email')
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [resetToken, setResetToken] = useState('')
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
        boxSizing: 'border-box', transition: 'border-color 0.2s',
    }

    const handleSendOTP = async () => {
        setError('')
        if (!email.trim()) return setError('Enter your email address')
        try {
            setLoading(true)
            await authService.sendForgotPasswordOTP(email.trim())
            setStep('otp')
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to send OTP')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOTP = async () => {
        setError('')
        if (!otp.trim()) return setError('Enter the OTP from your email')
        try {
            setLoading(true)
            const result = await authService.verifyForgotPasswordOTP(email, otp)
            setResetToken(result.data.resetToken)
            setStep('reset')
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Invalid OTP')
        } finally {
            setLoading(false)
        }
    }

    const handleReset = async () => {
        setError('')
        if (!newPassword) return setError('Enter a new password')
        if (newPassword !== confirmPassword) return setError('Passwords do not match')
        if (newPassword.length < 6) return setError('Password must be at least 6 characters')
        try {
            setLoading(true)
            await authService.resetPassword(email, resetToken, newPassword)
            setStep('done')
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    const stepConfig = {
        email: { title: 'Forgot Password', subtitle: 'Enter your email to receive an OTP', icon: '📧' },
        otp: { title: 'Check Your Email', subtitle: `OTP sent to ${email}`, icon: '🔑' },
        reset: { title: 'Set New Password', subtitle: 'Choose a strong password', icon: '🔒' },
        done: { title: 'Password Reset!', subtitle: 'You can now login with your new password', icon: '✅' },
    }

    const cfg = stepConfig[step]

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

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#EE2D7C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '24px' }}>
                        {cfg.icon}
                    </div>
                    <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 800, color: '#090909' }}>{cfg.title}</h2>
                    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(9,9,9,0.50)' }}>{cfg.subtitle}</p>
                </div>

                {/* Step indicators */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
                    {(['email', 'otp', 'reset', 'done'] as Step[]).map((s, i) => (
                        <div key={s} style={{ flex: 1, height: '4px', borderRadius: '99px', backgroundColor: ['email', 'otp', 'reset', 'done'].indexOf(step) >= i ? '#EE2D7C' : 'rgba(238,45,124,0.15)' }} />
                    ))}
                </div>

                {/* Step content */}
                {step === 'email' && (
                    <div>
                        <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</p>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                            placeholder="owner@email.com"
                            autoFocus
                            style={inputStyle}
                        />
                    </div>
                )}

                {step === 'otp' && (
                    <div>
                        <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>6-Digit OTP</p>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
                            placeholder="000000"
                            maxLength={6}
                            autoFocus
                            style={{ ...inputStyle, textAlign: 'center', fontSize: '28px', fontWeight: 700, letterSpacing: '10px' }}
                        />
                        <button
                            onClick={() => { setStep('email'); setOtp('') }}
                            style={{ marginTop: '10px', background: 'none', border: 'none', color: '#EE2D7C', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                        >
                            ← Use different email
                        </button>
                    </div>
                )}

                {step === 'reset' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Password</p>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min 6 characters"
                                autoFocus
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'rgba(9,9,9,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirm Password</p>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                                placeholder="Repeat password"
                                style={inputStyle}
                            />
                        </div>
                    </div>
                )}

                {step === 'done' && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px' }}>
                            ✅
                        </div>
                        <p style={{ fontSize: '14px', color: 'rgba(9,9,9,0.55)', lineHeight: 1.6 }}>
                            Your password has been reset successfully. You can now log in with your new password.
                        </p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '13px', padding: '10px 14px', borderRadius: '10px', marginTop: '14px' }}>
                        {error}
                    </div>
                )}

                {/* Action button */}
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {step !== 'done' && (
                        <button
                            onClick={step === 'email' ? handleSendOTP : step === 'otp' ? handleVerifyOTP : handleReset}
                            disabled={loading}
                            style={{
                                width: '100%', padding: '15px', borderRadius: '14px', border: 'none',
                                backgroundColor: loading ? 'rgba(238,45,124,0.40)' : '#EE2D7C',
                                color: 'white', fontSize: '15px', fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontFamily: 'Inter, sans-serif',
                            }}
                        >
                            {loading ? 'Please wait...'
                                : step === 'email' ? 'Send OTP →'
                                    : step === 'otp' ? 'Verify OTP →'
                                        : 'Reset Password →'}
                        </button>
                    )}

                    <button
                        onClick={() => navigate('/')}
                        style={{ width: '100%', padding: '13px', borderRadius: '14px', border: '1px solid rgba(9,9,9,0.12)', backgroundColor: 'transparent', color: 'rgba(9,9,9,0.55)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                    >
                        {step === 'done' ? '→ Go to Login' : '← Back to Login'}
                    </button>
                </div>
            </div>
        </div>
    )
}