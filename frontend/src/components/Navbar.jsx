import React from 'react';
import { Landmark, Sparkles, User, LogOut, ShieldCheck, ArrowRightLeft } from 'lucide-react';

export default function Navbar({ user, onLogout, onOpenTransfer, activeTab, setActiveTab }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(7, 9, 14, 0.85)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '14px 28px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
          }}>
            <Landmark size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="font-display" style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                AURA
              </span>
              <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-400)', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                AI LEDGER
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Smart Financial Intelligence</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.03)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'dashboard' ? 'rgba(255, 255, 255, 0.09)' : 'transparent',
              color: activeTab === 'dashboard' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'assistant' ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(6, 182, 212, 0.25))' : 'transparent',
              color: activeTab === 'assistant' ? '#c084fc' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Sparkles size={14} /> AI Assistant
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'analytics' ? 'rgba(255, 255, 255, 0.09)' : 'transparent',
              color: activeTab === 'analytics' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Analytics & Anomalies
          </button>
        </nav>

        {/* Action Controls & User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={onOpenTransfer} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            <ArrowRightLeft size={15} /> Transfer Money
          </button>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px', borderLeft: '1px solid var(--border-color)' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 700
              }}>
                {user.username ? user.username[0].toUpperCase() : 'U'}
              </div>
              <div style={{ display: 'none', mdDisplay: 'block' }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{user.username}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.email}</div>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
