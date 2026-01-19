import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import walletService from '../services/walletService';

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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Wallet Tracker</h1>
        <button onClick={handleLogout} className="btn-secondary">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-title-row">
          <h2>My Wallets</h2>
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
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newWallet.is_shared}
                    onChange={(e) =>
                      setNewWallet({ ...newWallet, is_shared: e.target.checked })
                    }
                  />
                  Shared Wallet
                </label>
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
              >
                <h3>{wallet.name}</h3>
                <p className="wallet-type">
                  {wallet.is_shared ? 'Shared' : 'Personal'}
                </p>
                <p className="wallet-balance">
                  Balance: ${Number(wallet.balance).toFixed(2)}
                </p>
                <p className="wallet-owner">Owner: {wallet.owner.username}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
