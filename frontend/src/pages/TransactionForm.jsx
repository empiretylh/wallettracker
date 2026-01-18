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
  const isEditing = !!transactionId;

  useEffect(() => {
    if (isEditing) {
      fetchTransaction();
    }
  }, [transactionId]);

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

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Food, Salary, Entertainment"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              required
            />
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
