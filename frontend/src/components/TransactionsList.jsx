import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function TransactionsList({ transactions, onRefresh }) {
  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 700 }}>
            Recent Activity & Ledger History
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Verified double-entry transactions</p>
        </div>
        <button onClick={onRefresh} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
          Refresh
        </button>
      </div>

      {(!transactions || transactions.length === 0) ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
          No transactions found for this account. Send a transfer to see activity!
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px' }}>Type</th>
                <th style={{ padding: '12px 14px' }}>Amount</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px' }}>Account Involved</th>
                <th style={{ padding: '12px 14px' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const isCredit = tx.type === 'CREDIT';
                const formattedDate = tx.date ? new Date(tx.date).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Recently';

                return (
                  <tr
                    key={tx.id || tx._id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Type Indicator */}
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: isCredit ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {isCredit ? (
                            <ArrowDownLeft size={16} color="var(--emerald-400)" />
                          ) : (
                            <ArrowUpRight size={16} color="var(--rose-500)" />
                          )}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>
                          {tx.type || 'TRANSFER'}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td style={{ padding: '14px', fontSize: '14px', fontWeight: 700, color: isCredit ? 'var(--emerald-400)' : 'var(--rose-500)' }}>
                      {isCredit ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px' }}>
                      <span className={tx.status === 'COMPLETED' ? 'badge-active' : 'badge-warning'}>
                        {tx.status}
                      </span>
                    </td>

                    {/* Involved Account */}
                    <td style={{ padding: '14px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <code style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                        {isCredit ? `From: ${tx.fromAccount?.slice(-8) || 'System'}` : `To: ${tx.toAccount?.slice(-8)}`}
                      </code>
                    </td>

                    {/* Date */}
                    <td style={{ padding: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {formattedDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
