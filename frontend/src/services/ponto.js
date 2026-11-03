import api from './api';

export async function marcarPonto(tipo) {
  const response = await api.post('/ponto/marcar', { tipo });
  return response.data;
}

export async function pontoHoje() {
  const response = await api.get('/ponto/hoje');
  return response.data;
}

export async function historicoPonto({ dataInicio, dataFim, usuarioId } = {}) {
  const path = usuarioId
    ? `/usuarios/${usuarioId}/ponto/historico`
    : '/ponto/historico';
  const response = await api.get(path, { params: { dataInicio, dataFim } });
  return response.data;
}

export async function resumoHoras({ dataInicio, dataFim, usuarioId } = {}) {
  const path = usuarioId
    ? `/usuarios/${usuarioId}/ponto/resumo-horas`
    : '/ponto/resumo-horas';
  const response = await api.get(path, { params: { dataInicio, dataFim } });
  return response.data;
}
