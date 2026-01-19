import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch user profile');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-container">
      <header className="page-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Back
        </button>
        <h1>Profile</h1>
        <button onClick={handleLogout} className="btn-secondary">
          Logout
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      {user && (
        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="profile-info-section">
              <h2>Account Information</h2>
              
              <div className="profile-field">
                <label>Username</label>
                <div className="field-value">{user.username}</div>
              </div>

              <div className="profile-field">
                <label>Email</label>
                <div className="field-value">{user.email}</div>
              </div>

              <div className="profile-field">
                <label>User ID</label>
                <div className="field-value">{user.id}</div>
                <small className="field-hint">Share this ID with wallet owners to receive invitations</small>
              </div>

              {user.first_name && (
                <div className="profile-field">
                  <label>First Name</label>
                  <div className="field-value">{user.first_name}</div>
                </div>
              )}

              {user.last_name && (
                <div className="profile-field">
                  <label>Last Name</label>
                  <div className="field-value">{user.last_name}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
