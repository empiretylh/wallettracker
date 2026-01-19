import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import transactionService from '../services/transactionService';

const TransactionForm = () => {
  const { id: walletId, transactionId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    wallet: walletId,
    type: 'EXPENSE',
    category: '',
    amount: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [amountSuggestions, setAmountSuggestions] = useState([]);
  const [newAmountSuggestion, setNewAmountSuggestion] = useState('');
  const [showAddAmountModal, setShowAddAmountModal] = useState(false);
  const isEditing = !!transactionId;

  useEffect(() => {
    if (isEditing) {
      fetchTransaction();
    }
  }, [transactionId]);

  useEffect(() => {
    const KEY = 'tx_category_suggestions';
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) {
        setSuggestions(JSON.parse(stored));
      } else {
        const defaults = ['လစာ', 'မုန့်ဖိုး', 'အသုံးစရိတ်'];
        setSuggestions(defaults);
        localStorage.setItem(KEY, JSON.stringify(defaults));
      }
    } catch (e) {
      setSuggestions(['လစာ', 'မုန့်ဖိုး', 'အသုံးစရိတ်']);
    }
  }, []);

  useEffect(() => {
    const KEY = 'tx_amount_suggestions';
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) {
        setAmountSuggestions(JSON.parse(stored));
      } else {
        const defaults = ['1000', '20000', '5000'];
        setAmountSuggestions(defaults);
        localStorage.setItem(KEY, JSON.stringify(defaults));
      }
    } catch (e) {
      setAmountSuggestions(['1000', '20000', '5000']);
    }
  }, []);

  const fetchTransaction = async () => {
    try {
      const data = await transactionService.getTransaction(transactionId);
      setFormData({
        wallet: walletId,
        type: data.type,
        category: data.category,
        amount: data.amount,
        note: data.note,
        date: data.date,
      });
    } catch (err) {
      setError('Failed to fetch transaction');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditing) {
        await transactionService.updateTransaction(transactionId, formData);
      } else {
        await transactionService.createTransaction(formData);
      }
      navigate(`/wallets/${walletId}`);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData) {
        const errorMessages = Object.entries(errorData)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        setError(errorMessages);
      } else {
        setError('Failed to save transaction');
      }
      setLoading(false);
    }
  };

  const SUGGESTIONS_KEY = 'tx_category_suggestions';

  const AMOUNT_SUGGESTIONS_KEY = 'tx_amount_suggestions';

  const handleSuggestionClick = (value) => {
    const appended = formData.category ? `${formData.category} ${value}` : value;
    setFormData({ ...formData, category: appended });
  };

  const handleAddSuggestion = () => {
    const val = newSuggestion.trim();
    if (!val) return;
    if (suggestions.includes(val)) {
      setNewSuggestion('');
      return;
    }
    const next = [...suggestions, val];
    setSuggestions(next);
    try {
      localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(next));
    } catch (e) {}
    setNewSuggestion('');
  };

  const handleAmountSuggestionClick = (value) => {
    setFormData({ ...formData, amount: value });
  };

  const handleAddAmountSuggestion = () => {
    const val = String(newAmountSuggestion).trim();
    if (!val) return;
    if (amountSuggestions.includes(val)) {
      setNewAmountSuggestion('');
      return;
    }
    const next = [...amountSuggestions, val];
    setAmountSuggestions(next);
    try {
      localStorage.setItem(AMOUNT_SUGGESTIONS_KEY, JSON.stringify(next));
    } catch (e) {}
    setNewAmountSuggestion('');
  };

  return (
    <div className="transaction-form-container">
      <header className="page-header">
        <button onClick={() => navigate(`/wallets/${walletId}`)} className="btn-back">
          ← Back
        </button>
        <h1>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</h1>
      </header>

      <div className="form-wrapper">
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <label htmlFor="category" style={{ minWidth: 110, marginTop: 6 }}>Category *</label>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Food, Salary, Entertainment"
                required
                style={{ width: '100%', marginBottom: 8 }}
              />

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {suggestions.map((s, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className="suggestion-button"
                    onClick={() => handleSuggestionClick(s)}
                    style={{ padding: '6px 10px', borderRadius: 6 }}
                  >
                    {s}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="btn-secondary"
                  style={{ marginLeft: 6 }}
                >
                  Add
                </button>
              </div>

              {showAddModal && (
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
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowAddModal(false);
                  }}
                >
                  <div
                    className="modal"
                    role="dialog"
                    aria-modal="true"
                    style={{ background: '#fff', padding: 20, borderRadius: 8, width: 320 }}
                  >
                    <h3 style={{ marginTop: 0 }}>Add Quick Category</h3>
                    <input
                      type="text"
                      autoFocus
                      value={newSuggestion}
                      onChange={(e) => setNewSuggestion(e.target.value)}
                      placeholder="e.g., Coffee"
                      style={{ width: '100%', padding: '8px', marginBottom: 12 }}
                    />
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddModal(false);
                          setNewSuggestion('');
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleAddSuggestion();
                          setShowAddModal(false);
                        }}
                        className="btn-primary"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <label htmlFor="amount" style={{ minWidth: 110, marginTop: 6 }}>Amount *</label>
            <div style={{ flex: 1 }}>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                required
                style={{ width: '100%', marginBottom: 8 }}
              />

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {amountSuggestions.map((s, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className="suggestion-button"
                    onClick={() => handleAmountSuggestionClick(s)}
                    style={{ padding: '6px 10px', borderRadius: 6 }}
                  >
                    {s}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setShowAddAmountModal(true)}
                  className="btn-secondary"
                  style={{ marginLeft: 6 }}
                >
                  Add
                </button>
              </div>

              {showAddAmountModal && (
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
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowAddAmountModal(false);
                  }}
                >
                  <div
                    className="modal"
                    role="dialog"
                    aria-modal="true"
                    style={{ background: '#fff', padding: 20, borderRadius: 8, width: 320 }}
                  >
                    <h3 style={{ marginTop: 0 }}>Add Quick Amount</h3>
                    <input
                      type="number"
                      autoFocus
                      value={newAmountSuggestion}
                      onChange={(e) => setNewAmountSuggestion(e.target.value)}
                      placeholder="e.g., 1000"
                      style={{ width: '100%', padding: '8px', marginBottom: 12 }}
                    />
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddAmountModal(false);
                          setNewAmountSuggestion('');
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleAddAmountSuggestion();
                          setShowAddAmountModal(false);
                        }}
                        className="btn-primary"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="note">Note</label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows="4"
              placeholder="Optional description..."
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/wallets/${walletId}`)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
