import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import walletService from '../services/walletService';
import transactionService from '../services/transactionService';
import authService from '../services/authService';
import { formatMMK } from '../utils/currency';

const WalletDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showShareInfo, setShowShareInfo] = useState(false);
  const [inviteData, setInviteData] = useState({ user_id: '', role: 'VIEWER' });
  const [successMessage, setSuccessMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  const MESSAGE_TIMEOUT = 3000;

  useEffect(() => {
    fetchWalletAndTransactions();
  }, [id]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        // ignore
      }
    };
    fetchUser();
  }, []);
  const handleConvertToShared = async () => {
    if (!wallet) return;
    setError('');
    try {
      await walletService.updateWallet(wallet.id, {
        name: wallet.name,
        is_shared: true,
      });
      setSuccessMessage('Wallet converted to a shared wallet');
      fetchWalletAndTransactions();
      setTimeout(() => setSuccessMessage(''), MESSAGE_TIMEOUT);
    } catch (err) {
      setError('Failed to update wallet type');
    }
  };

  const isOwner = currentUser && wallet && wallet.owner.id === currentUser.id;

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

  const handleInviteUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      await walletService.inviteUser(id, inviteData.user_id, inviteData.role);
      setSuccessMessage('User invited successfully!');
      setInviteData({ user_id: '', role: 'VIEWER' });
      setShowInviteForm(false);
      fetchWalletAndTransactions(); // Refresh to show new member
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to invite user');
    }
  };

  const handleCopyShareInfo = () => {
    const shareText = `Wallet ID: ${wallet.id}\nWallet Name: ${wallet.name}\nOwner: ${wallet.owner.username}`;
    navigator.clipboard.writeText(shareText);
    setSuccessMessage('Wallet info copied to clipboard!');
    setTimeout(() => setSuccessMessage(''), MESSAGE_TIMEOUT);
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
        <div className="header-actions">
          {!wallet.is_shared && isOwner && (
            <button onClick={handleConvertToShared} className="btn-secondary">
              Make Shared
            </button>
          )}
          <button
            onClick={() => navigate(`/wallets/${id}/transaction/new`)}
            className="btn-primary"
          >
            Add Transaction
          </button>
        </div>
      </header>

      <div className="wallet-info">
        <div className="info-card">
          <h3>Balance</h3>
          <p className="balance-amount">{formatMMK(wallet.balance)}</p>
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

      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Shared Wallet Actions */}
      {wallet.is_shared && (
        <div className="shared-wallet-actions">
          <button
            onClick={() => {
              setShowShareInfo(!showShareInfo);
              setShowInviteForm(false);
            }}
            className="btn-secondary"
          >
            📤 Share Wallet Info
          </button>
          <button
            onClick={() => {
              setShowInviteForm(!showInviteForm);
              setShowShareInfo(false);
            }}
            className="btn-primary"
          >
            ➕ Invite User
          </button>
        </div>
      )}

      {/* Share Info Section */}
      {showShareInfo && (
        <div className="share-info-card">
          <h3>Share Wallet Information</h3>
          <p>Share this information with others so they can request to join:</p>
          <div className="share-details">
            <p><strong>Wallet ID:</strong> {wallet.id}</p>
            <p><strong>Wallet Name:</strong> {wallet.name}</p>
            <p><strong>Owner:</strong> {wallet.owner.username}</p>
          </div>
          <button onClick={handleCopyShareInfo} className="btn-primary">
            📋 Copy to Clipboard
          </button>
        </div>
      )}

      {/* Invite Form */}
      {showInviteForm && (
        <div className="invite-form-card">
          <h3>Invite User to Wallet</h3>
          <form onSubmit={handleInviteUser}>
            <div className="form-group">
              <label htmlFor="user_id">User ID</label>
              <input
                type="text"
                id="user_id"
                value={inviteData.user_id}
                onChange={(e) =>
                  setInviteData({ ...inviteData, user_id: e.target.value })
                }
                placeholder="Enter user ID"
                required
              />
              <small>Contact the user to get their User ID</small>
            </div>
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={inviteData.role}
                onChange={(e) =>
                  setInviteData({ ...inviteData, role: e.target.value })
                }
              >
                <option value="VIEWER">Viewer (Read-only)</option>
                <option value="CONTRIBUTOR">Contributor (Can add transactions)</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Send Invite
              </button>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members Section */}
      {wallet.is_shared && wallet.members && wallet.members.length > 0 && (
        <div className="members-section">
          <h2>Wallet Members</h2>
          <div className="members-list">
            {wallet.members.map((member) => (
              <div key={member.id} className="member-item">
                <div className="member-info">
                  <strong>{member.user.username}</strong>
                  <span className="member-email">{member.user.email}</span>
                </div>
                <span className={`member-role role-${member.role.toLowerCase()}`}>
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
                    {transaction.type === 'INCOME' ? '+' : '-'} {formatMMK(transaction.amount)}
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
