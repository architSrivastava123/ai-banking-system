import React from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ShieldCheck, Copy, Check, PlusCircle } from 'lucide-react';

export default function DashboardOverview({ account, summary, onCreateAccount, isCreatingAccount }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (account?._id) {
      navigator.clipboard.writeText(account._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const balance = account?.balance ?? 0;
  const income = summary?.income ?? 0;
  const expenses = summary?.expenses ?? 0;
  const savings = summary?.savings ?? 0;
  const savingsRate = summary?.savings_rate_pct ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Welcome / Account Info Bar */}
      <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="font-display" style={{ fontSize: '22px', fontWeight: 700 }}>
              Smart Ledger Account
            </h2>
            <span className="badge-active">
              <ShieldCheck size={12} /> {account?.status || 'ACTIVE'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Account ID:</span>
            <code style={{ fontSize: '12px', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 8px', borderRadius: '6px', color: 'var(--cyan-400)' }}>
              {account?._id || 'No account created yet'}
            </code>
            {account?._id && (
              <button
                onClick={handleCopy}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="Copy Account ID"
              >
                {copied ? <Check size={14} color="var(--emerald-400)" /> : <Copy size={14} />}
              </button>
            )}
          </div>
        </div>

        {!account?._id && (
          <button onClick={onCreateAccount} disabled={isCreatingAccount} className="btn-primary">
            <PlusCircle size={16} /> {isCreatingAccount ? 'Creating...' : 'Open Bank Account'}
          </button>
        )}
      </div>

      {/* Metrics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {/* Balance Card */}
        <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '90px', height: '90px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Verified Balance
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={18} color="var(--emerald-400)" />
            </div>
          </div>
          <div className="font-display" style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--emerald-400)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>● Dynamic double-entry ledger</span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Monthly Inflow
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="var(--cyan-400)" />
            </div>
          </div>
          <div className="font-display" style={{ fontSize: '30px', fontWeight: 800, color: 'var(--cyan-400)', letterSpacing: '-0.5px' }}>
            ₹{income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Credits & deposits received
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Monthly Outflow
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={18} color="var(--rose-500)" />
            </div>
          </div>
          <div className="font-display" style={{ fontSize: '30px', fontWeight: 800, color: 'var(--rose-500)', letterSpacing: '-0.5px' }}>
            ₹{expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Debits & transfer transactions
          </div>
        </div>

        {/* Net Savings */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Net Savings
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PiggyBank size={18} color="var(--violet-400)" />
            </div>
          </div>
          <div className="font-display" style={{ fontSize: '30px', fontWeight: 800, color: 'var(--violet-400)', letterSpacing: '-0.5px' }}>
            ₹{savings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--violet-400)', marginTop: '8px' }}>
            {savingsRate}% overall savings rate
          </div>
        </div>
      </div>
    </div>
  );
}
