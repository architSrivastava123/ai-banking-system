import React from 'react';
import { PieChart, AlertTriangle, ShieldAlert, Sparkles, CheckCircle2, ArrowUpRight } from 'lucide-react';

export default function SpendingAnalytics({ summary, insights, anomalies, onCategorizeTest }) {
  const categorySpending = summary?.category_spending || {};
  const totalExpenses = summary?.expenses || 1; // avoid divide by zero

  const colors = [
    '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* AI Advisory Coach Banner */}
      {insights?.explanation && (
        <div className="glass-card" style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.08))',
          borderColor: 'rgba(139, 92, 246, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Sparkles size={18} color="#c084fc" />
            <h3 className="font-display" style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0' }}>
              AI Financial Coaching & Analysis
            </h3>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {insights.explanation}
          </p>
        </div>
      )}

      {/* Grid: Category Breakdown + Anomaly Detection */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Spending by Category */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 700 }}>
              Spending by Category
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Total: ₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {Object.keys(categorySpending).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
              No categorized expenses recorded yet. Make a transfer to see spending analytics.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(categorySpending).map(([category, amount], idx) => {
                const pct = Math.round((amount / totalExpenses) * 100);
                const color = colors[idx % colors.length];
                return (
                  <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                        {category}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({pct}%)
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: '4px', background: color, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Transaction Anomaly Detection */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 700 }}>
                Transaction Anomaly Detection
              </h3>
            </div>
            <span className={anomalies && anomalies.length > 0 ? "badge-warning" : "badge-active"}>
              {anomalies && anomalies.length > 0 ? `${anomalies.length} Flagged` : 'Normal'}
            </span>
          </div>

          {(!anomalies || anomalies.length === 0) ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              textAlign: 'center',
              gap: '12px'
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={24} color="var(--emerald-400)" />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--emerald-400)' }}>
                No Transaction Anomalies Detected
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '300px' }}>
                All recent transactions conform to your expected spending volume and normal frequency patterns.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {anomalies.map((anom, i) => (
                <div
                  key={i}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={15} /> {anom.risk_level.toUpperCase()} RISK ALERT
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                      ₹{anom.amount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <ul style={{ paddingLeft: '20px', fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                    {anom.reasons?.map((r, rIdx) => (
                      <li key={rIdx}>{r}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
