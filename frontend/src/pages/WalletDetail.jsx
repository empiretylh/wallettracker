import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import walletService from '../services/walletService';
import transactionService from '../services/transactionService';

const WalletDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWalletAndTransactions();
  }, [id]);

  const fetchWalletAndTransactions = async () => {
    try {
      const [walletData, transactionsData] = await Promise.all([
        walletService.getWallet(id),
        transactionService.getTransactions(id),
      ]);
      setWallet(walletData);
      setTransactions(transactionsData.results || transactionsData);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch wallet details');
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionService.deleteTransaction(transactionId);
        fetchWalletAndTransactions();
      } catch (err) {
        setError('Failed to delete transaction');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!wallet) return <div className="error-message">Wallet not found</div>;

  return (
    <div className="wallet-detail-container">
      <header className="page-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Back
        </button>
        <h1>{wallet.name}</h1>
        <button
          onClick={() => navigate(`/wallets/${id}/transaction/new`)}
          className="btn-primary"
        >
          Add Transaction
        </button>
      </header>

      <div className="wallet-info">
        <div className="info-card">
          <h3>Balance</h3>
          <p className="balance-amount">${Number(wallet.balance).toFixed(2)}</p>
        </div>
        <div className="info-card">
          <h3>Type</h3>
          <p>{wallet.is_shared ? 'Shared' : 'Personal'}</p>
        </div>
        <div className="info-card">
          <h3>Members</h3>
          <p>{wallet.members?.length || 0}</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="transactions-section">
        <div className="section-header">
          <h2>Transactions</h2>
          <button
            onClick={() => navigate(`/wallets/${id}/reports`)}
            className="btn-secondary"
          >
            View Reports
          </button>
        </div>

        {transactions.length === 0 ? (
          <p>No transactions yet. Add your first transaction!</p>
        ) : (
          <div className="transaction-list">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-info">
                  <h4>{transaction.category}</h4>
                  <p className="transaction-note">{transaction.note}</p>
                  <p className="transaction-date">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                  <p className="transaction-creator">
                    By: {transaction.created_by.username}
                  </p>
                </div>
                <div className="transaction-actions">
                  <span
                    className={`transaction-amount ${
                      transaction.type === 'INCOME' ? 'income' : 'expense'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}$
                    {Number(transaction.amount).toFixed(2)}
                  </span>
                  <button
                    onClick={() =>
                      navigate(`/wallets/${id}/transaction/${transaction.id}`)
                    }
                    className="btn-small"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="btn-small btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletDetail;
