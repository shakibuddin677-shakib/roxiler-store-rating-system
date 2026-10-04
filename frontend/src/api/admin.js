import client from './client';

export const getDashboard = () => client.get('/admin/dashboard').then((r) => r.data);

export const listUsers = (params) => client.get('/admin/users', { params }).then((r) => r.data);

export const listStores = (params) => client.get('/admin/stores', { params }).then((r) => r.data);

export const getUser = (id) => client.get(`/admin/users/${id}`).then((r) => r.data);

export const createUser = (payload) => client.post('/admin/users', payload).then((r) => r.data);

export const createStore = (payload) => client.post('/admin/stores', payload).then((r) => r.data);

export const updateUser = (id, payload) => client.put(`/admin/users/${id}`, payload).then((r) => r.data);

export const deleteUser = (id) => client.delete(`/admin/users/${id}`).then((r) => r.data);

export const updateStore = (id, payload) => client.put(`/admin/stores/${id}`, payload).then((r) => r.data);

export const deleteStore = (id) => client.delete(`/admin/stores/${id}`).then((r) => r.data);
