import client from './client';

export const getOwnerDashboard = (params) =>
  client.get('/owner/dashboard', { params }).then((r) => r.data);
