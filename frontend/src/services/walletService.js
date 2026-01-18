import api from './api';

const walletService = {
  getWallets: async () => {
    const response = await api.get('/wallets/');
    return response.data;
  },

  getWallet: async (id) => {
    const response = await api.get(`/wallets/${id}/`);
    return response.data;
  },

  createWallet: async (walletData) => {
    const response = await api.post('/wallets/', walletData);
    return response.data;
  },

  updateWallet: async (id, walletData) => {
    const response = await api.put(`/wallets/${id}/`, walletData);
    return response.data;
  },

  deleteWallet: async (id) => {
    await api.delete(`/wallets/${id}/`);
  },

  inviteUser: async (walletId, userId, role) => {
    const response = await api.post(`/wallets/${walletId}/invite/`, {
      user_id: userId,
      role,
    });
    return response.data;
  },
};

export default walletService;
