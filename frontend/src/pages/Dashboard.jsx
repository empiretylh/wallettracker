import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import walletService from '../services/walletService';
import { formatMMK } from '../utils/currency';

const Dashboard = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWallet, setNewWallet] = useState({
    name: '',
    is_shared: false,
  });
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const data = await walletService.getWallets();
      setWallets(data.results || data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch wallets');
      setLoading(false);
    }
  };

  const handleCreateWallet = async (e) => {
    e.preventDefault();
    try {
      await walletService.createWallet(newWallet);
      setNewWallet({ name: '', is_shared: false });
      setShowCreateForm(false);
      fetchWallets();
    } catch (err) {
      setError('Failed to create wallet');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openDeleteModal = (e, wallet) => {
    e.stopPropagation();
    setWalletToDelete(wallet);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!walletToDelete) return;
    try {
      await walletService.deleteWallet(walletToDelete.id);
      setShowDeleteModal(false);
      setWalletToDelete(null);
      fetchWallets();
    } catch (err) {
      setError('Failed to delete wallet');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
      <div className="dashboard-container">
        <header className="dashboard-header">
        <h1>💖 Wallet Tracker 💖</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/profile')} className="btn-secondary">
            👤 Profile
          </button>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-title-row">
          <h2>✨ My Wallets ✨</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary"
          >
            {showCreateForm ? 'Cancel' : 'Create Wallet'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {showCreateForm && (
          <div className="create-wallet-form">
            <h3>Create New Wallet</h3>
            <form onSubmit={handleCreateWallet}>
              <div className="form-group">
                <label htmlFor="name">Wallet Name</label>
                <input
                  type="text"
                  id="name"
                  value={newWallet.name}
                  onChange={(e) =>
                    setNewWallet({ ...newWallet, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group inline">
                <input
                  id="is_shared"
                  type="checkbox"
                  checked={newWallet.is_shared}
                  onChange={(e) =>
                    setNewWallet({ ...newWallet, is_shared: e.target.checked })
                  }
                />
                <label htmlFor="is_shared">Shared Wallet</label>
              </div>
              <button type="submit" className="btn-primary">
                Create
              </button>
            </form>
          </div>
        )}

        <div className="wallet-list">
          {wallets.length === 0 ? (
            <p>No wallets yet. Create your first wallet!</p>
          ) : (
            wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="wallet-card"
                onClick={() => navigate(`/wallets/${wallet.id}`)}
                style={{ position: 'relative' }}
              >
                <button
                  type="button"
                  onClick={(e) => openDeleteModal(e, wallet)}
                  className="btn-danger"
                  style={{ position: 'absolute', right: 12, top: 12, padding: '6px 8px', fontSize: 12 }}
                >
                  Delete
                </button>
                <h3>{wallet.name}</h3>
                <p className="wallet-type">
                  {wallet.is_shared ? 'Shared' : 'Personal'}
                </p>
                <p className="wallet-balance">
                  Balance: {formatMMK(wallet.balance)}
                </p>
                <p className="wallet-owner">Owner: {wallet.owner.username}</p>
              </div>
            ))
          )}
        </div>
      </div>
      </div>

      {showDeleteModal && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            style={{ background: '#fff', padding: 20, borderRadius: 8, width: 360 }}
          >
            <h3 style={{ marginTop: 0 }}>Delete Wallet</h3>
            <p>
              Are you sure you want to delete <strong>{walletToDelete?.name}</strong>? This
              action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setWalletToDelete(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="button" onClick={confirmDelete} className="btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
