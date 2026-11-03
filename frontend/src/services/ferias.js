import api from './api';

export async function calcularFerias(usuarioId, diasFerias) {
  const response = await api.post(`/usuarios/${usuarioId}/ferias/calcular`, { diasFerias });
  return response.data;
}
