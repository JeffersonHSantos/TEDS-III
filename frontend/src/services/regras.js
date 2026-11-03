import api from './api';

export async function listarRegras(params) {
  const response = await api.get('/regras-financeiras', { params });
  return response.data;
}

export async function criarRegra(data) {
  const response = await api.post('/regras-financeiras', data);
  return response.data;
}

export async function atualizarRegra(id, data) {
  const response = await api.patch(`/regras-financeiras/${id}`, data);
  return response.data;
}

export async function removerRegra(id) {
  const response = await api.delete(`/regras-financeiras/${id}`);
  return response.data;
}
