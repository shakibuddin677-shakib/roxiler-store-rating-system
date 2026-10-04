import client from './client';

export const signup = (payload) => client.post('/auth/signup', payload).then((r) => r.data);

export const login = (payload) => client.post('/auth/login', payload).then((r) => r.data);

export const changePassword = (payload) =>
  client.put('/auth/password', payload).then((r) => r.data);

export const logout = () => client.post('/auth/logout').then((r) => r.data);
