import api from './api';

export async function listarBonus(usuarioId) {
  const response = await api.get(`/usuarios/${usuarioId}/bonus`);
  return response.data;
}

export async function criarBonus(usuarioId, data) {
  const response = await api.post(`/usuarios/${usuarioId}/bonus`, data);
  return response.data;
}
