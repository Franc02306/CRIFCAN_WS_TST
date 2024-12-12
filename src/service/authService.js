// src/services/authService.js
import data from '@/data/searchData'
import API from './axios.config'

export const login = data => {
  return API.post('/api/v1/login/', data,);
};

export const resetToken = token => {
  return API.post('/api/models/api/token/refresh/', token,);
};
