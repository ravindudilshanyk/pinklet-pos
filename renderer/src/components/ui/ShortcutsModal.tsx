interface Props {
    onClose: () => void
}

interface ShortcutGroup {
    title: string
    icon: string
    shortcuts: { key: string; description: string }[]
}

const SHORTCUTS: ShortcutGroup[] = [
    {
        title: 'Make Bill',
        icon: '🧾',
        shortcuts: [
            { key: 'F1', description: 'Focus item search' },
            { key: 'F4', description: 'Hold current bill' },
            { key: 'F12', description: 'Proceed to payment' },
            { key: 'Esc', description: 'Close popup / modal' },
        ],
    },
    {
        title: 'Barcode Scanner',
        icon: '📷',
        shortcuts: [
            { key: 'Scan', description: 'Auto-adds item to bill' },
            { key: 'Enter', description: 'Confirms scanned barcode' },
        ],
    },
    {
        title: 'Navigation',
        icon: '🧭',
        shortcuts: [
            { key: 'Alt + 1', description: 'Go to Overview' },
            { key: 'Alt + 2', description: 'Go to Make Bill' },
            { key: 'Alt + 3', description: 'Go to Pre-Orders' },
            { key: 'Alt + 4', description: 'Go to Items' },
            { key: 'Alt + 5', description: 'Go to Sales History' },
            { key: 'Alt + 6', description: 'Go to Customers' },
        ],
    }, 
    {
        title: 'General',
        icon: '⌨',
        shortcuts: [
            { key: '?', description: 'Show this shortcuts guide' },
            { key: 'Ctrl + P', description: 'Print last receipt' },
        ],
    },
]

export default function ShortcutsModal({ onClose }: Props) {
    return (
        <div style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(9,9,9,0.50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 500, fontFamily: 'Inter, sans-serif', padding: '20px',
        }}>
            <div style={{
                backgroundColor: 'white', borderRadius: '20px',
                width: '100%', maxWidth: '580px', maxHeight: '85vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 8px 40px rgba(9,9,9,0.20)', overflow: 'hidden',
            }}>

                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(9,9,9,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexShrink: 0,
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#090909' }}>
                            ⌨ Keyboard Shortcuts
                        </h3>
                        <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'rgba(9,9,9,0.45)' }}>
                            Press <kbd style={kbdStyle}>?</kbd> anytime to show this guide
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(9,9,9,0.06)', color: 'rgba(9,9,9,0.50)', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >×</button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {SHORTCUTS.map((group) => (
                            <div
                                key={group.title}
                                style={{
                                    backgroundColor: 'rgba(238,45,124,0.03)',
                                    border: '1px solid rgba(238,45,124,0.10)',
                                    borderRadius: '14px', padding: '16px',
                                }}
                            >
                                <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#090909' }}>
                                    {group.icon} {group.title}
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {group.shortcuts.map((s) => (
                                        <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                            <span style={{ fontSize: '12px', color: 'rgba(9,9,9,0.55)' }}>{s.description}</span>
                                            <kbd style={kbdStyle}>{s.key}</kbd>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Barcode tips */}
                    <div style={{ marginTop: '16px', backgroundColor: 'rgba(59,59,152,0.05)', border: '1px solid rgba(59,59,152,0.15)', borderRadius: '12px', padding: '14px 16px' }}>
                        <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#3B3B98' }}>📷 Barcode Scanner Tips</p>
                        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(9,9,9,0.55)', lineHeight: 1.6 }}>
                            Connect a USB barcode scanner and scan any item to automatically add it to the bill.
                            Make sure the item has a barcode set in the Items management page.
                            The scanner works from any screen — no need to click anything first.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(9,9,9,0.06)', flexShrink: 0 }}>
                    <button
                        onClick={onClose}
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#EE2D7C', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    )
}

const kbdStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 7px',
    borderRadius: '5px',
    border: '1px solid rgba(9,9,9,0.20)',
    backgroundColor: 'rgba(9,9,9,0.06)',
    fontSize: '11px',
    fontFamily: 'monospace',
    fontWeight: 600,
    color: '#090909',
    whiteSpace: 'nowrap',
    flexShrink: 0,
}