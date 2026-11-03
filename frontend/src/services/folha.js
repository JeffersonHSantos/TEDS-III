import api from './api';

export async function preCalculoFolha(usuarioId, { dataInicio, dataFim }) {
  const response = await api.get(`/usuarios/${usuarioId}/folha/pre-calculo`, {
    params: { dataInicio, dataFim },
  });
  return response.data;
}

export async function gerarFolha(usuarioId, { periodoInicio, periodoFim }) {
  const response = await api.post(`/usuarios/${usuarioId}/folha/gerar`, {
    periodoInicio,
    periodoFim,
  });
  return response.data;
}

export async function listarFolhas(usuarioId) {
  const response = await api.get(`/usuarios/${usuarioId}/folhas`);
  return response.data;
}

export async function detalheFolha(usuarioId, folhaId) {
  const response = await api.get(`/usuarios/${usuarioId}/folhas/${folhaId}`);
  return response.data;
}

export async function consultarDsr(usuarioId, { dataInicio, dataFim }) {
  const response = await api.get(`/usuarios/${usuarioId}/dsr`, {
    params: { dataInicio, dataFim },
  });
  return response.data;
}
