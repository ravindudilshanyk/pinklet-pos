export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            height: '200px', gap: '14px',
            fontFamily: 'Inter, sans-serif',
        }}>
            <div style={{
                width: '36px', height: '36px',
                borderRadius: '50%',
                border: '3px solid rgba(238,45,124,0.15)',
                borderTop: '3px solid #EE2D7C',
                animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(9,9,9,0.45)' }}>{message}</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}