import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import transactionService from '../services/transactionService';
import { formatMMK } from '../utils/currency';

const Reports = () => {
  const { id: walletId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await transactionService.getReportSummary(
        walletId,
        filters.month,
        filters.year
      );
      setReport(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch report');
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="reports-container">
      <header className="page-header">
        <button onClick={() => navigate(`/wallets/${walletId}`)} className="btn-back">
          ← Back
        </button>
        <h1>Financial Reports</h1>
      </header>

      <div className="reports-filters">
        <div className="form-group">
          <label htmlFor="month">Month</label>
          <select
            id="month"
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {new Date(2000, month - 1).toLocaleString('default', {
                  month: 'long',
                })}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="year">Year</label>
          <select
            id="year"
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(
              (year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : report ? (
        <div className="reports-content">
          <div className="summary-cards">
            <div className="summary-card income">
              <h3>Total Income</h3>
              <p className="amount">{formatMMK(report.totals.income)}</p>
            </div>
            <div className="summary-card expense">
              <h3>Total Expense</h3>
              <p className="amount">{formatMMK(report.totals.expense)}</p>
            </div>
            <div className="summary-card balance">
              <h3>Net Balance</h3>
              <p className="amount">{formatMMK(report.totals.balance)}</p>
            </div>
          </div>

          <div className="category-breakdown">
            <h2>Breakdown by Category</h2>
            {report.by_category.length === 0 ? (
              <p>No transactions in this period.</p>
            ) : (
              <div className="category-list">
                {report.by_category.map((item, index) => (
                  <div key={index} className="category-item">
                    <div className="category-info">
                      <h4>{item.category}</h4>
                      <span className={`category-type ${item.type.toLowerCase()}`}>
                        {item.type}
                      </span>
                    </div>
                    <div className="category-stats">
                      <span className="category-amount">
                        {formatMMK(item.total)}
                      </span>
                      <span className="category-count">
                        {item.count} transaction{item.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Reports;
