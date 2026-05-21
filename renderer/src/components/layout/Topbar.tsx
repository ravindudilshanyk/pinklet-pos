import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { salesService } from '@/services/sales.service'
import { itemsService } from '@/services/items.service'
import { useNavigate } from 'react-router-dom'

export default function Topbar() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [time, setTime] = useState(new Date())
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [online, setOnline] = useState<boolean>(true)

  const seenNotificationsKey = 'pinklet-seen-notifications'

  const getSeenNotifications = () => {
    try {
      const raw = window.localStorage.getItem(seenNotificationsKey)
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const saveSeenNotifications = (seenIds: string[]) => {
    try {
      window.localStorage.setItem(seenNotificationsKey, JSON.stringify(seenIds))
    } catch {
      // ignore storage issues
    }
  }

  const markAllNotificationsSeen = (currentNotifications: any[] = notifications) => {
    const seenIds = new Set<string>(getSeenNotifications())
    currentNotifications.forEach((notif) => seenIds.add(String(notif.id)))
    saveSeenNotifications(Array.from(seenIds))
    setUnreadCount(0)
  }

  const markNotificationSeen = (notificationId: string) => {
    const seenIds = new Set<string>(getSeenNotifications())
    seenIds.add(notificationId)
    saveSeenNotifications(Array.from(seenIds))
    const remainingUnread = notifications.filter((notif) => !seenIds.has(String(notif.id))).length
    setUnreadCount(remainingUnread)
  }

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Online indicator: navigator + server health ping
  useEffect(() => {
    let mounted = true

    const updateOnline = async () => {
      const nav = navigator.onLine
      if (!nav) {
        if (mounted) setOnline(false)
        return
      }

      try {
        const controller = new AbortController()
        const id = setTimeout(() => controller.abort(), 2500)
        const resp = await fetch('http://localhost:3001/api/v1/health', { signal: controller.signal })
        clearTimeout(id)
        if (mounted) setOnline(resp.ok)
      } catch (e) {
        if (mounted) setOnline(false)
      }
    }

    const onlineHandler = () => updateOnline()
    const offlineHandler = () => setOnline(false)

    window.addEventListener('online', onlineHandler)
    window.addEventListener('offline', offlineHandler)

    updateOnline()
    const interval = setInterval(updateOnline, 30000)

    return () => {
      mounted = false
      window.removeEventListener('online', onlineHandler)
      window.removeEventListener('offline', offlineHandler)
      clearInterval(interval)
    }
  }, [])

  // Load notifications
  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      const [lowStock, upcoming] = await Promise.all([
        itemsService.getLowStock(),
        salesService.getUpcomingPreOrders(),
      ])

      const notifs: any[] = []

      // Low stock alerts
      lowStock.forEach((item: any) => {
        notifs.push({
          id: `low-${item.id}`,
          type: 'low_stock',
          title: item.stock === 0 ? 'Out of Stock' : 'Low Stock',
          message: `${item.name} — ${item.stock} remaining`,
          color: item.stock === 0 ? '#ef4444' : '#f59e0b',
          bg: item.stock === 0 ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
          icon: item.stock === 0 ? '🔴' : '⚠',
          action: () => navigate('/items'),
          time: 'Stock alert',
        })
      })

      // Upcoming pre-orders
      upcoming.forEach((order: any) => {
        const deliveryDate = new Date(order.deliveryDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const isToday = deliveryDate.toDateString() === today.toDateString()
        const isTomorrow = deliveryDate.toDateString() === tomorrow.toDateString()

        notifs.push({
          id: `order-${order.id}`,
          type: 'pre_order',
          title: isToday ? '🚨 Due Today!' : isTomorrow ? '📅 Due Tomorrow' : '📋 Upcoming Order',
          message: `${order.customer?.name || 'Walk-in'} — ${order.note || 'Pre-order'} — Rs. ${order.total?.toFixed(2)}`,
          color: isToday ? '#ef4444' : '#3B3B98',
          bg: isToday ? 'rgba(239,68,68,0.08)' : 'rgba(59,59,152,0.08)',
          icon: isToday ? '🚨' : '📅',
          action: () => navigate('/pre-orders'),
          time: isToday ? 'Today!' : isTomorrow ? 'Tomorrow' : deliveryDate.toLocaleDateString('en-LK', { month: 'short', day: 'numeric' }),
        })
      })

      const seenIds = new Set<string>(getSeenNotifications())
      setNotifications(notifs)
      setUnreadCount(notifs.filter((notif) => !seenIds.has(String(notif.id))).length)
    } catch {
      // Silent fail
    }
  }

  const greeting = () => {
    const h = time.getHours()
    if (h < 12) return 'Good Morning'
    if (h < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const dateStr = time.toLocaleDateString('en-LK', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })
  const timeStr = time.toLocaleTimeString('en-LK', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })


  const handleRefresh = async () => {
    setNotifications([])
    setUnreadCount(0)
    await loadNotifications()
  }

  return (
    <div style={{
      height: '56px',
      backgroundColor: 'white',
      borderBottom: '1px solid rgba(9,9,9,0.06)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: '16px',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      zIndex: 50,
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#EE2D7C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '14px' }}>🎀</span>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#EE2D7C', lineHeight: 1 }}>Pinklet</p>
          <p style={{ margin: 0, fontSize: '9px', color: 'rgba(9,9,9,0.40)', fontWeight: 500, letterSpacing: '0.05em' }}>POS SYSTEM</p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(9,9,9,0.08)', flexShrink: 0 }} />

      {/* Greeting */}
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(9,9,9,0.55)' }}>
          {greeting()},{' '}
          <span style={{ fontWeight: 700, color: '#EE2D7C' }}>{user?.name || 'Shop...'}</span>
          <span style={{ marginLeft: '6px', fontSize: '11px', padding: '2px 8px', borderRadius: '99px', backgroundColor: user?.role === 'owner' ? 'rgba(238,45,124,0.10)' : 'rgba(59,59,152,0.10)', color: user?.role === 'owner' ? '#EE2D7C' : '#3B3B98', fontWeight: 600, textTransform: 'capitalize' }}>
            {user?.role}
          </span>
        </p>
      </div>

      {/* Quick stats row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <QuickBtn label="New Bill" icon="🧾" onClick={() => navigate('/bill')} color="#EE2D7C" />
          <QuickBtn label="Add Item" icon="📦" onClick={() => navigate('/items')} color="#3B3B98" />
          <QuickBtn label="Pre-Orders" icon="📋" onClick={() => navigate('/pre-orders')} color="#f59e0b" />
        </div>

        {/* Notification count badges */}
        {notifications.filter(n => n.type === 'low_stock').length > 0 && (
          <div
            onClick={() => { setShowNotifications(true); markAllNotificationsSeen(); navigate('/items') }}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '99px', backgroundColor: 'rgba(245,158,11,0.10)', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '12px' }}>⚠</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309' }}>
              {notifications.filter(n => n.type === 'low_stock').length} low stock
            </span>
          </div>
        )}

        {notifications.filter(n => n.type === 'pre_order').length > 0 && (
          <div
            onClick={() => { markAllNotificationsSeen(); navigate('/pre-orders') }}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '99px', backgroundColor: 'rgba(59,59,152,0.08)', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '12px' }}>📅</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#3B3B98' }}>
              {notifications.filter(n => n.type === 'pre_order').length} due soon
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(9,9,9,0.08)', flexShrink: 0 }} />

      {/* Date/Time */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#090909' }}>{dateStr}</p>
        <p style={{ margin: 0, fontSize: '11px', color: 'rgba(9,9,9,0.45)', fontFamily: 'monospace' }}>{timeStr}</p>
      </div>

      {/* Online indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: online ? '#22c55e' : '#ef4444', boxShadow: online ? '0 0 0 2px rgba(34,197,94,0.18)' : '0 0 0 2px rgba(239,68,68,0.12)' }} />
          <span style={{ fontSize: '11px', color: online ? '#16a34a' : '#ef4444', fontWeight: 700 }}>{online ? 'Online' : 'Offline'}</span>
        </div>

      </div>

      {/* Notification bell */}
      <button
        onClick={() => {
          const nextOpen = !showNotifications
          setShowNotifications(nextOpen)
          if (nextOpen) {
            markAllNotificationsSeen()
          }
        }}
        style={{
          width: '36px', height: '36px', borderRadius: '10px',
          border: '1px solid rgba(9,9,9,0.08)',
          backgroundColor: showNotifications ? 'rgba(238,45,124,0.08)' : 'white',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', flexShrink: 0,
        }}
      >
        <svg width="16" height="16" fill="none" stroke={showNotifications ? '#EE2D7C' : 'rgba(9,9,9,0.50)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute', top: '-4px', right: '-4px',
            width: '17px', height: '17px', borderRadius: '50%',
            backgroundColor: '#EE2D7C', color: 'white',
            fontSize: '9px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid white',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Notification dropdown */}
      {showNotifications && (
        <>
          <div
            onClick={() => setShowNotifications(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 98 }}
          />
          <div style={{
            position: 'absolute', top: '52px', right: '12px',
            width: '360px', maxHeight: '480px',
            backgroundColor: 'white', borderRadius: '16px',
            border: '1px solid rgba(9,9,9,0.08)',
            boxShadow: '0 8px 32px rgba(9,9,9,0.15)',
            zIndex: 99, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}>

            {/* Notif header */}
            <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(9,9,9,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#090909' }}>Notifications</p>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(9,9,9,0.45)' }}>
                  {unreadCount > 0 ? `${unreadCount} alerts` : 'All clear'}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid rgba(9,9,9,0.08)', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Refresh"
              >
                <svg width="14" height="14" fill="none" stroke="rgba(9,9,9,0.50)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Notif list */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(9,9,9,0.35)' }}>
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ margin: '0 auto 10px', display: 'block' }}>
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p style={{ fontSize: '13px', fontWeight: 500, margin: '0 0 4px' }}>All clear!</p>
                  <p style={{ fontSize: '12px', margin: 0 }}>No alerts right now</p>
                </div>
              ) : (
                <>
                  {/* Group: Pre-orders */}
                  {notifications.filter(n => n.type === 'pre_order').length > 0 && (
                    <div>
                      <p style={{ margin: 0, padding: '10px 18px 6px', fontSize: '10px', fontWeight: 700, color: 'rgba(9,9,9,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Upcoming Pre-Orders
                      </p>
                      {notifications.filter(n => n.type === 'pre_order').map((notif) => (
                        <NotifItem key={notif.id} notif={notif} onClose={() => setShowNotifications(false)} onSeen={() => markNotificationSeen(String(notif.id))} />
                      ))}
                    </div>
                  )}

                  {/* Group: Low stock */}
                  {notifications.filter(n => n.type === 'low_stock').length > 0 && (
                    <div>
                      <p style={{ margin: 0, padding: '10px 18px 6px', fontSize: '10px', fontWeight: 700, color: 'rgba(9,9,9,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Stock Alerts
                      </p>
                      {notifications.filter(n => n.type === 'low_stock').map((notif) => (
                        <NotifItem key={notif.id} notif={notif} onClose={() => setShowNotifications(false)} onSeen={() => markNotificationSeen(String(notif.id))} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(9,9,9,0.06)', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => { navigate('/items'); setShowNotifications(false) }}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.25)', backgroundColor: 'rgba(245,158,11,0.06)', color: '#b45309', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  📦 Manage Stock
                </button>
                <button
                  onClick={() => { navigate('/pre-orders'); setShowNotifications(false) }}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(59,59,152,0.20)', backgroundColor: 'rgba(59,59,152,0.06)', color: '#3B3B98', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  📋 Pre-Orders
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function NotifItem({ notif, onClose, onSeen }: { notif: any; onClose: () => void; onSeen: () => void }) {
  return (
    <div
      onClick={() => {
        onSeen()
        notif.action?.()
        onClose()
      }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        padding: '12px 18px', cursor: 'pointer',
        borderBottom: '1px solid rgba(9,9,9,0.04)',
        transition: 'background-color 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(238,45,124,0.03)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: notif.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
        {notif.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: 700, color: notif.color }}>{notif.title}</p>
        <p style={{ margin: 0, fontSize: '11px', color: 'rgba(9,9,9,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {notif.message}
        </p>
      </div>
      <span style={{ fontSize: '10px', color: 'rgba(9,9,9,0.35)', flexShrink: 0, marginTop: '2px' }}>{notif.time}</span>
    </div>
  )
}

function QuickBtn({ label, icon, onClick, color }: { label: string; icon: string; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '5px 10px', borderRadius: '8px',
        border: `1px solid ${color}22`,
        backgroundColor: `${color}0D`,
        color, fontSize: '11px', fontWeight: 600,
        cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        whiteSpace: 'nowrap',
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}