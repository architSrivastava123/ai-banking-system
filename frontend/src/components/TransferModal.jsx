import React, { useState } from 'react';
import { X, ArrowRightLeft, ShieldCheck, AlertCircle } from 'lucide-react';

export default function TransferModal({ isOpen, onClose, currentAccount, onTransferSuccess }) {
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!toAccount.trim()) {
      setError('Recipient Account ID is required.');
      return;
    }

    const transferAmount = parseFloat(amount);
    if (!transferAmount || transferAmount <= 0) {
      setError('Please enter a valid amount greater than ₹0.');
      return;
    }

    if (currentAccount && currentAccount._id === toAccount.trim()) {
      setError('Sender and Recipient accounts cannot be identical.');
      return;
    }

    if (currentAccount && currentAccount.balance < transferAmount) {
      setError(`Insufficient balance. Current balance is ₹${currentAccount.balance?.toLocaleString('en-IN')}.`);
      return;
    }

    setIsLoading(true);

    try {
      // Generate client-side idempotencyKey for double-charge prevention
      const idempotencyKey = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const res = await fetch('/api/transaction/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fromAccount: currentAccount._id,
          toAccount: toAccount.trim(),
          amount: transferAmount,
          idempotencyKey
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Transfer failed.');
      }

      onTransferSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Error communicating with banking server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '28px', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowRightLeft size={20} color="var(--emerald-400)" />
          </div>
          <div>
            <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 700 }}>Initiate Money Transfer</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Secure ACID ledger transaction</p>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '10px',
            padding: '12px',
            color: 'var(--rose-500)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              From Account (Verified Balance: ₹{currentAccount?.balance?.toLocaleString('en-IN')})
            </label>
            <input
              type="text"
              className="input-field"
              value={currentAccount?._id || ''}
              disabled
              style={{ opacity: 0.7 }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Recipient Account ID
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. 660f... (MongoDB ObjectId)"
              value={toAccount}
              onChange={e => setToAccount(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Amount (INR)
            </label>
            <input
              type="number"
              className="input-field"
              placeholder="Min ₹1.00"
              min="1"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Description / Merchant Note (Optional)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Swiggy, Uber, Rent, Shopping"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
          >
            {isLoading ? 'Processing Transfer...' : 'Confirm & Transfer'}
          </button>
        </form>
      </div>
    </div>
  );
}
