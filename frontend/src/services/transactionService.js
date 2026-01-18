import api from './api';

const transactionService = {
  getTransactions: async (walletId) => {
    const response = await api.get('/transactions/', {
      params: { wallet_id: walletId },
    });
    return response.data;
  },

  getTransaction: async (id) => {
    const response = await api.get(`/transactions/${id}/`);
    return response.data;
  },

  createTransaction: async (transactionData) => {
    const response = await api.post('/transactions/', transactionData);
    return response.data;
  },

  updateTransaction: async (id, transactionData) => {
    const response = await api.put(`/transactions/${id}/`, transactionData);
    return response.data;
  },

  deleteTransaction: async (id) => {
    await api.delete(`/transactions/${id}/`);
  },

  getReportSummary: async (walletId, month, year) => {
    const response = await api.get('/reports/summary/', {
      params: { wallet_id: walletId, month, year },
    });
    return response.data;
  },
};

export default transactionService;
