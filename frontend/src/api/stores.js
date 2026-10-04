import client from './client';

export const listStores = (params) => client.get('/stores', { params }).then((r) => r.data);

export const rateStore = (storeId, rating) =>
  client.post(`/stores/${storeId}/rating`, { rating }).then((r) => r.data);
