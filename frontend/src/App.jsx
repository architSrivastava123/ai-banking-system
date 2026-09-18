import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardOverview from './components/DashboardOverview';
import AiAssistant from './components/AiAssistant';
import SpendingAnalytics from './components/SpendingAnalytics';
import TransactionsList from './components/TransactionsList';
import TransferModal from './components/TransferModal';
import AuthModal from './components/AuthModal';

export default function App() {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Fetch account and transaction data
  const loadBankingData = async () => {
    try {
      // 1. Fetch user account
      const accRes = await fetch('/api/account/get-account', { credentials: 'include' });
      if (accRes.ok) {
        const accData = await accRes.json();
        const userAcc = accData.accounts;
        if (userAcc) {
          // 2. Fetch live balance
          const balRes = await fetch(`/api/account/get-account-balance/${userAcc._id}`, { credentials: 'include' });
          const balData = await balRes.json();
          setAccount({ ...userAcc, balance: balData.balance || 0 });
        }
      }

      // 3. Fetch spending summary from AI layer
      const sumRes = await fetch('/api/ai/spending-summary', { credentials: 'include' });
      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData.summary || null);
      }

      // 4. Fetch AI insights
      const insRes = await fetch('/api/ai/insights', { credentials: 'include' });
      if (insRes.ok) {
        const insData = await insRes.json();
        setInsights(insData);
      }

      // 5. Fetch recent transactions
      // Note: Node.js gateway internal route provides transactions; let's fetch via AI chat or internal
      const chatProbe = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: 'Show my recent transactions' })
      });
      if (chatProbe.ok) {
        const chatData = await chatProbe.json();
        if (chatData.tool_result?.transactions) {
          setTransactions(chatData.tool_result.transactions);
        }
      }
    } catch (err) {
      console.warn('Error loading banking data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadBankingData();
    }
  }, [user]);

  const handleCreateAccount = async () => {
    setIsCreatingAccount(true);
    try {
      const res = await fetch('/api/account/create-account', {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        await loadBankingData();
      }
    } catch (err) {
      console.error('Error creating account:', err);
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleSendMessage = async (message) => {
    setIsProcessingAi(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'AI service error');
      }
      // If balance or transactions were queried, refresh local states
      if (data.intent === 'banking_tool') {
        loadBankingData();
      }
      return data;
    } finally {
      setIsProcessingAi(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      setUser(null);
      setAccount(null);
      setTransactions([]);
      setSummary(null);
      setInsights(null);
    }
  };

  if (!user) {
    return <AuthModal onAuthSuccess={(authenticatedUser) => setUser(authenticatedUser)} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenTransfer={() => setIsTransferOpen(true)}
      />

      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <DashboardOverview
              account={account}
              summary={summary}
              onCreateAccount={handleCreateAccount}
              isCreatingAccount={isCreatingAccount}
            />
            <TransactionsList
              transactions={transactions}
              onRefresh={loadBankingData}
            />
          </div>
        )}

        {activeTab === 'assistant' && (
          <AiAssistant
            onSendMessage={handleSendMessage}
            isProcessing={isProcessingAi}
          />
        )}

        {activeTab === 'analytics' && (
          <SpendingAnalytics
            summary={summary}
            insights={insights}
            anomalies={insights?.anomalies || []}
          />
        )}
      </main>

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        currentAccount={account}
        onTransferSuccess={loadBankingData}
      />
    </div>
  );
}
